// Scott's approval queue: list what the assistant wants to do, approve it, or
// turn it down.
//
// This is the ONLY place a gated write is ever executed. The assistant cannot
// reach it — it can only insert a pending row. Execution needs Scott's
// authenticated approval arriving here.
//
// The payload executed is the one frozen at proposal time and read back from
// the database. The browser sends nothing but an action id and a decision, so
// a tampered client cannot alter what a change does between the moment Scott
// reads the card and the moment it runs.
//
// verify_jwt = true.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { preflight, json } from '../_shared/cors.ts';
import { adminClient } from '../_shared/google.ts';
import { executeAction } from '../_shared/google-writes.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight(req);
  if (req.method !== 'POST') return json(req, { error: 'Method not allowed' }, 405);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json(req, { error: 'Not signed in.' }, 401);

    const db = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await db.auth.getUser();
    if (authError || !user) return json(req, { error: 'Not signed in.' }, 401);

    const { data: owner, error: ownerError } = await db.rpc('is_owner');
    if (ownerError) return json(req, { error: 'Could not verify access.' }, 500);
    if (owner !== true) {
      return json(req, { error: 'This assistant is for the HCM owner account only.' }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const action = body?.action;
    const admin = adminClient();

    // ── list ────────────────────────────────────────────────────────────────
    if (action === 'list') {
      const { data, error } = await admin
        .from('assistant_actions')
        .select('id, kind, summary, status, result, created_at, decided_at, executed_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) return json(req, { error: 'Could not load your approvals.' }, 500);
      return json(req, { actions: data ?? [] });
    }

    // ── decide ──────────────────────────────────────────────────────────────
    if (action === 'approve' || action === 'reject') {
      const id = body?.id;
      if (typeof id !== 'string') return json(req, { error: 'Which one?' }, 400);

      // Read the frozen row. Scoped to this user, and only while still pending,
      // so an approval cannot be replayed to run the same change twice.
      const { data: row, error: readError } = await admin
        .from('assistant_actions')
        .select('id, kind, payload, summary, status')
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (readError || !row) {
        return json(req, { error: 'That item is no longer waiting for a decision.' }, 404);
      }

      if (action === 'reject') {
        await admin
          .from('assistant_actions')
          .update({ status: 'rejected', decided_at: new Date().toISOString() })
          .eq('id', id);
        return json(req, { ok: true, status: 'rejected', detail: 'Turned down. Nothing changed.' });
      }

      // Approved — run it now, with the payload as proposed.
      const result = await executeAction(
        admin,
        user.id,
        row.kind as string,
        (row.payload ?? {}) as Record<string, unknown>,
      );

      const now = new Date().toISOString();
      await admin
        .from('assistant_actions')
        .update({
          status: result.ok ? 'executed' : 'failed',
          result: { detail: result.detail, data: result.data ?? null },
          decided_at: now,
          executed_at: now,
        })
        .eq('id', id);

      return json(req, {
        ok: result.ok,
        status: result.ok ? 'executed' : 'failed',
        detail: result.detail,
      });
    }

    return json(req, { error: 'Unknown request.' }, 400);
  } catch (err) {
    console.error('assistant-actions failed:', err instanceof Error ? err.name : typeof err);
    return json(req, { error: 'Something went wrong. Please try again.' }, 500);
  }
});
