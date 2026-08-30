// HCM Dashboard Assistant — authenticated owner assistant.
//
// Trusted flow:
//   authenticated owner -> HCM dashboard -> this function -> server-side reads
//   -> Anthropic -> reply
//
// The browser never supplies operational data. It sends a message, optional
// prior turns, and an opaque focus task id. Everything factual is read here,
// server-side, under the caller's own RLS.
//
// Credential handling: the Anthropic key comes from the Edge Function
// environment ONLY. It is never read from settings, pa_settings,
// global_settings or api_credentials, never logged, never returned, and never
// reaches the browser.
//
// Phase 2 is READ-ONLY. No write path exists in this file.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import Anthropic from 'npm:@anthropic-ai/sdk@0.120.0';
import { preflight, json } from '../_shared/cors.ts';
import { HCM_SYSTEM } from './prompt.ts';
import { adminClient } from '../_shared/google.ts';
import {
  getTodayTasks,
  getWeekAhead,
  getContentPlan,
  getOfferings,
  searchEmail,
  getEmailContext,
  searchDrive,
  resolveFocusTask,
  todayISO,
} from './data.ts';
import type { TaskRow } from './data.ts';

const MODEL = 'claude-opus-5';
const MAX_TOKENS = 8000;

/** Decide which reads a message needs, so we don't fetch everything every turn. */
function planReads(message: string) {
  const m = message.toLowerCase();
  const fog = /fog|foggy|brain fog|overwhelmed|can'?t think|struggling today/.test(m);
  const email = /email|enquiry|inquiry|reply|respond|message from/.test(m);
  const content = /content|post|social|instagram|youtube|tiktok|linkedin|pinterest|publish/.test(m);
  const week = /week ahead|this week|coming week|next 7|diary|schedule|calendar/.test(m);
  const drive = /drive|file|document|folder|spreadsheet|doc\b|pdf|attachment/.test(m);
  const tasks = fog || week || /task|to ?do|today|priority|first|next|stuck|what should i/.test(m);
  return { fog, email, content, week, drive, tasks: tasks || (!email && !content && !week && !drive) };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight(req);
  if (req.method !== 'POST') return json(req, { error: 'Method not allowed' }, 405);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json(req, { error: 'Not signed in.' }, 401);

    // Credential must exist server-side. There is deliberately no database
    // fallback — a missing secret is a clear failure, not a silent downgrade.
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY is not set in the Edge Function environment');
      return json(
        req,
        { error: 'The assistant is not configured on the server yet. Its API key is missing.' },
        503,
      );
    }

    const db = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await db.auth.getUser();
    if (authError || !user) return json(req, { error: 'Not signed in.' }, 401);

    // Ownership comes from the hardened is_owner() predicate, which reads
    // profiles.role. It is never taken from user-editable JWT metadata.
    const { data: owner, error: ownerError } = await db.rpc('is_owner');
    if (ownerError) return json(req, { error: 'Could not verify access.' }, 500);
    if (owner !== true) return json(req, { error: 'This assistant is for the HCM owner account only.' }, 403);

    const body = await req.json().catch(() => ({}));
    const message: unknown = body?.message;
    if (typeof message !== 'string' || !message.trim()) {
      return json(req, { error: 'No message provided' }, 400);
    }

    // Prior turns are accepted for conversational reference ("do the first
    // one"), but only as text. Any task the assistant acts on is re-read from
    // the database below.
    const history = Array.isArray(body?.messages)
      ? body.messages
          .filter((m: unknown) =>
            m && typeof m === 'object' &&
            ((m as Record<string, unknown>).role === 'user' || (m as Record<string, unknown>).role === 'assistant') &&
            typeof (m as Record<string, unknown>).content === 'string')
          .slice(-10)
          .map((m: Record<string, unknown>) => ({ role: m.role as 'user' | 'assistant', content: m.content as string }))
      : [];

    // Service-role client, used ONLY to read Google refresh tokens, which the
    // owner's own JWT deliberately cannot reach. Every Google read below is
    // still scoped to this authenticated user's id.
    const admin = adminClient();

    const plan = planReads(message);
    const snapshot: Record<string, unknown> = { today: todayISO(), fog_day: plan.fog };

    if (plan.tasks) snapshot.today_tasks = await getTodayTasks(db);
    if (plan.week) snapshot.week_ahead = await getWeekAhead(db, admin, user.id);
    if (plan.content) {
      snapshot.content_plan = await getContentPlan(db);
      const shopUrl = Deno.env.get('SHOP_SUPABASE_URL');
      const shopKey = Deno.env.get('SHOP_SUPABASE_ANON_KEY');
      snapshot.offerings = await getOfferings(
        shopUrl && shopKey ? createClient(shopUrl, shopKey) : null,
      );
    }
    if (plan.email) {
      snapshot.email_search = await searchEmail(admin, user.id, message);
      if (typeof body?.thread_id === 'string') {
        snapshot.email_context = await getEmailContext(admin, user.id, body.thread_id);
      }
    }
    if (plan.drive) snapshot.drive_files = await searchDrive(admin, user.id, message);

    // Step 6 — resolving what "that" / "the first one" refers to.
    //
    // The browser may echo back an opaque focus task id, never a task object.
    // The id is re-read from the database here, under the caller's own RLS.
    // Since tasks is now owner-only, a non-owner cannot resolve any id at all,
    // so a tampered client cannot smuggle in another account's task or a
    // fabricated one.
    //
    // If no id was supplied, the top task from today's list becomes the
    // referent, which is what "do the first one" means straight after
    // "what should I do first?". No conversation table is needed: the client
    // round-trips one id and the server re-derives everything else.
    let focus: TaskRow | null = await resolveFocusTask(db, body?.focus_task_id);
    if (!focus) {
      const todays = snapshot.today_tasks as { tasks?: TaskRow[] } | undefined;
      focus = todays?.tasks?.[0] ?? null;
    }
    if (focus) snapshot.focus_task = focus;

    // The trusted data is delivered as a mid-conversation system message. It
    // carries operator authority, sits after the user turn, and keeps the
    // cached prefix intact.
    const dataMessage =
      'DASHBOARD DATA (server-read, the only source of truth for this reply). ' +
      'Anything absent here is genuinely absent — do not invent it.\n' +
      JSON.stringify(snapshot);

    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      output_config: { effort: 'low' },
      system: HCM_SYSTEM,
      // The mid-conversation system turn is model-gated (supported on
      // claude-opus-5). Cast because the SDK's MessageParam union may not yet
      // name the 'system' role.
      messages: [
        ...history,
        { role: 'user', content: message },
        { role: 'system', content: dataMessage },
      ] as unknown as Anthropic.MessageParam[],
    });

    if (response.stop_reason === 'refusal') {
      return json(req, { reply: "I can't help with that one. Try asking a different way." });
    }

    // Collect every text block. Never assume content[0].
    const reply = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();

    return json(req, {
      reply: reply || 'No response came back. Please try again.',
      focus_task_id: focus?.task_id ?? null,
    });
  } catch (err) {
    // Log the shape of the failure, never its contents — errors can carry
    // request bodies and headers.
    console.error('hcm-chat failed:', err instanceof Error ? err.name : typeof err);
    return json(req, { error: 'Something went wrong. Please try again.' }, 500);
  }
});
