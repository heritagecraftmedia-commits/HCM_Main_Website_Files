// HCM Dashboard Assistant — Phase 2 server-side READ layer.
//
// Every function here is read-only. No writes exist in this phase.
//
// Trust model: these run inside the Edge Function against a Supabase client
// built from the caller's own JWT, so RLS applies to every query. The browser
// never supplies task or approval data — the server fetches it. Client input is
// limited to the message text and an opaque focus task id, which is always
// re-resolved from the database before use.
//
// Canonical tables (settled during the Phase 1 audit):
//   tasks         — the ONLY task table this assistant reads.
//   content_posts — the ONLY content table this assistant reads.
// Deliberately NOT read here:
//   daily_tasks — non-canonical. Holds seven March 2026 seed rows and is not
//                 to be migrated, displayed, or used as a fallback.
//   pa_tasks    — HCM internal dev tracking. Out of scope entirely.

import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import { getConnection, googleFetch } from '../_shared/google.ts';

const PRIORITY_RANK: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export interface TaskRow {
  task_id: string;
  title: string;
  priority: string | null;
  project: string | null;
  due_date: string | null;
  status: string;
}

/** Local (Europe/London) calendar date as YYYY-MM-DD. */
export function todayISO(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Monday of the week containing `iso`. */
function mondayOf(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return addDays(iso, -((d.getUTCDay() + 6) % 7));
}

const TASK_COLUMNS = 'id, title, priority, project, due_date, status';

function toTask(r: Record<string, unknown>): TaskRow {
  return {
    task_id: r.id as string,
    title: r.title as string,
    priority: (r.priority as string) ?? null,
    project: (r.project as string) ?? null,
    due_date: (r.due_date as string) ?? null,
    status: r.status as string,
  };
}

/** urgent -> high -> medium -> low, then soonest due date, then title. */
function byPriority(a: TaskRow, b: TaskRow): number {
  const pa = PRIORITY_RANK[a.priority ?? 'medium'] ?? 2;
  const pb = PRIORITY_RANK[b.priority ?? 'medium'] ?? 2;
  if (pa !== pb) return pa - pb;
  if (a.due_date !== b.due_date) {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date < b.due_date ? -1 : 1;
  }
  return (a.title ?? '').localeCompare(b.title ?? '');
}

/**
 * Tasks due today, plus undated tasks that are still outstanding.
 * Completed tasks are excluded in both cases.
 * Sorted urgent -> high -> medium -> low, then soonest due date, then title.
 *
 * status is the canonical state, so the exclusion filters on status rather
 * than the legacy `done` boolean.
 */
export async function getTodayTasks(db: SupabaseClient) {
  const today = todayISO();
  const { data, error } = await db
    .from('tasks')
    .select(TASK_COLUMNS)
    .neq('status', 'done')
    .or(`due_date.eq.${today},due_date.is.null`);

  if (error) return { available: false as const, reason: error.message, tasks: [] as TaskRow[] };
  const tasks = (data ?? []).map(toTask).sort(byPriority);
  return { available: true as const, today, tasks };
}

/**
 * The next seven days: HCM tasks, plus Google Calendar events when genuine
 * read access exists. Calendar is reported unavailable rather than invented.
 */
export async function getWeekAhead(db: SupabaseClient, admin: SupabaseClient, userId: string) {
  const from = todayISO();
  const to = addDays(from, 6);
  const { data, error } = await db
    .from('tasks')
    .select(TASK_COLUMNS)
    .gte('due_date', from)
    .lte('due_date', to);

  const tasks = error ? [] : (data ?? []).map(toTask).sort(byPriority);

  const calendar = await getCalendar(admin, userId, from, to);
  return {
    range: { from, to },
    tasks_available: !error,
    tasks_error: error?.message ?? null,
    tasks,
    calendar_available: calendar.available,
    calendar,
  };
}

/** Content scheduled in the current Mon–Sun week. */
export async function getContentPlan(db: SupabaseClient) {
  const from = mondayOf(todayISO());
  const to = addDays(from, 6);
  const { data, error } = await db
    .from('content_posts')
    .select('id, title, body, platform, status, scheduled_for')
    .gte('scheduled_for', `${from}T00:00:00Z`)
    .lte('scheduled_for', `${to}T23:59:59Z`)
    .order('scheduled_for', { ascending: true });

  if (error) return { available: false as const, reason: error.message, week: { from, to }, posts: [] };

  const posts = (data ?? []).map((r) => ({
    content_id: r.id as string,
    title: (r.title as string) ?? null,
    platform: (r.platform as string) ?? null,
    scheduled_for: (r.scheduled_for as string) ?? null,
    // content_posts has no `purpose` column. Reported as null rather than
    // inferred from another field, so the assistant cannot present a guess
    // as a recorded purpose.
    purpose: null,
    status: (r.status as string) ?? null,
  }));

  return { available: true as const, week: { from, to }, posts };
}

/**
 * HCM merchandise catalogue, read from the SEPARATE shop Supabase project.
 *
 * Read-only, catalogue only: products and collections. Orders, customers,
 * payments, fulfilment, discounts and reviews are never read and never
 * returned. Nothing in this build writes to the shop database.
 */
export async function getOfferings(shop: SupabaseClient | null) {
  if (!shop) {
    return {
      available: false as const,
      reason: 'The shop catalogue connection is not configured for this assistant.',
      collections: [],
      products: [],
    };
  }

  const [collectionsRes, productsRes] = await Promise.all([
    shop.from('collections').select('id, slug, name, description').order('sort_order', { ascending: true }),
    shop
      .from('products')
      .select('id, slug, name, description, collection_id, status, retail_price_minor, currency, featured, published')
      .order('name', { ascending: true }),
  ]);

  const err = collectionsRes.error ?? productsRes.error;
  if (err) {
    return { available: false as const, reason: err.message, collections: [], products: [] };
  }

  return {
    available: true as const,
    collections: collectionsRes.data ?? [],
    products: (productsRes.data ?? []).map((p) => ({
      name: p.name,
      slug: p.slug,
      description: p.description,
      collection_id: p.collection_id,
      status: p.status,
      published: p.published,
      featured: p.featured,
      price: p.retail_price_minor == null ? null : (p.retail_price_minor as number) / 100,
      currency: p.currency,
    })),
  };
}

// ── Google integrations ──────────────────────────────────────────────────────
//
// These now read Scott's real Google account, using the refresh token stored by
// the OAuth callback. Each one degrades to a clean "not connected" object when
// no connection exists — the assistant is never allowed to invent an email, an
// event or a file to fill a gap.
//
// Everything reaches Google through googleFetch(), which structurally refuses
// to call any Gmail send endpoint. Drafting is permitted; delivery is not.

const NOT_CONNECTED = (service: string) =>
  `${service} is not connected to this assistant yet. Connect it from the dashboard.`;

/** Decode Gmail's base64url payloads. */
function decodeBody(data: string): string {
  try {
    const b64 = data.replaceAll('-', '+').replaceAll('_', '/');
    return new TextDecoder().decode(
      Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)),
    );
  } catch {
    return '';
  }
}

function header(headers: Array<{ name: string; value: string }> | undefined, name: string): string | null {
  return headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? null;
}

/** Walk a Gmail MIME tree for the best plain-text representation. */
function extractText(part: Record<string, unknown> | undefined): string {
  if (!part) return '';
  const mime = part.mimeType as string | undefined;
  const body = part.body as { data?: string } | undefined;
  if (mime === 'text/plain' && body?.data) return decodeBody(body.data);
  const parts = part.parts as Array<Record<string, unknown>> | undefined;
  if (parts) {
    for (const p of parts) {
      const found = extractText(p);
      if (found) return found;
    }
  }
  if (body?.data) return decodeBody(body.data);
  return '';
}

/**
 * Search Scott's mail. Read-only.
 *
 * Returns light metadata only — sender, subject, date, snippet. Full bodies are
 * fetched deliberately via getEmailContext() for one thread, so a broad search
 * never dumps the mailbox into the model's context.
 */
export async function searchEmail(admin: SupabaseClient, userId: string, query: string) {
  const conn = await getConnection(admin, userId, 'gmail');
  if (!conn) {
    return { available: false as const, reason: NOT_CONNECTED('Gmail'), threads: [] as unknown[] };
  }

  try {
    const listRes = await googleFetch(
      conn.accessToken,
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=${encodeURIComponent(query)}`,
    );
    if (!listRes.ok) {
      return { available: false as const, reason: 'Gmail could not be reached.', threads: [] };
    }

    const list = await listRes.json();
    const ids: Array<{ id: string; threadId: string }> = list.messages ?? [];

    const threads = await Promise.all(
      ids.slice(0, 10).map(async (m) => {
        const r = await googleFetch(
          conn.accessToken,
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}` +
            '?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date',
        );
        if (!r.ok) return null;
        const msg = await r.json();
        const hs = msg.payload?.headers;
        return {
          thread_id: msg.threadId,
          message_id: msg.id,
          from: header(hs, 'From'),
          subject: header(hs, 'Subject'),
          date: header(hs, 'Date'),
          snippet: msg.snippet ?? null,
          unread: (msg.labelIds ?? []).includes('UNREAD'),
        };
      }),
    );

    return {
      available: true as const,
      account: conn.googleEmail,
      query,
      threads: threads.filter(Boolean),
    };
  } catch {
    return { available: false as const, reason: 'Gmail could not be reached.', threads: [] };
  }
}

/** Full text of one thread, for drafting a reply against what was actually said. */
export async function getEmailContext(admin: SupabaseClient, userId: string, threadId: string) {
  const conn = await getConnection(admin, userId, 'gmail');
  if (!conn) {
    return { available: false as const, reason: NOT_CONNECTED('Gmail'), thread: null };
  }

  try {
    const res = await googleFetch(
      conn.accessToken,
      `https://gmail.googleapis.com/gmail/v1/users/me/threads/${encodeURIComponent(threadId)}?format=full`,
    );
    if (!res.ok) {
      return { available: false as const, reason: 'That conversation could not be read.', thread: null };
    }

    const data = await res.json();
    const messages = (data.messages ?? []).map((m: Record<string, unknown>) => {
      const payload = m.payload as Record<string, unknown> | undefined;
      const hs = payload?.headers as Array<{ name: string; value: string }> | undefined;
      return {
        message_id: m.id,
        from: header(hs, 'From'),
        to: header(hs, 'To'),
        subject: header(hs, 'Subject'),
        date: header(hs, 'Date'),
        // Trimmed: enough to reply to, not the entire quoted history.
        body: extractText(payload).slice(0, 4000),
      };
    });

    return { available: true as const, thread: { thread_id: data.id, messages } };
  } catch {
    return { available: false as const, reason: 'That conversation could not be read.', thread: null };
  }
}

/** The next seven days from Google Calendar. */
async function getCalendar(admin: SupabaseClient, userId: string, from: string, to: string) {
  const conn = await getConnection(admin, userId, 'calendar');
  if (!conn) {
    return { available: false as const, reason: NOT_CONNECTED('Google Calendar'), events: [] as unknown[] };
  }

  try {
    const params = new URLSearchParams({
      timeMin: `${from}T00:00:00Z`,
      timeMax: `${to}T23:59:59Z`,
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '50',
    });
    const res = await googleFetch(
      conn.accessToken,
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    );
    if (!res.ok) {
      return { available: false as const, reason: 'The calendar could not be reached.', events: [] };
    }

    const data = await res.json();
    const events = (data.items ?? []).map((e: Record<string, unknown>) => {
      const start = e.start as { dateTime?: string; date?: string } | undefined;
      const end = e.end as { dateTime?: string; date?: string } | undefined;
      return {
        event_id: e.id,
        title: e.summary ?? '(no title)',
        start: start?.dateTime ?? start?.date ?? null,
        end: end?.dateTime ?? end?.date ?? null,
        all_day: Boolean(start?.date && !start?.dateTime),
        location: e.location ?? null,
        status: e.status ?? null,
      };
    });

    return { available: true as const, account: conn.googleEmail, events };
  } catch {
    return { available: false as const, reason: 'The calendar could not be reached.', events: [] };
  }
}

/**
 * Search Drive, including shared drives.
 *
 * Read-only here by construction — this build has no Drive write path at all.
 * Scott's rule is that any Drive write needs his approval, so writes wait until
 * the approval gate exists rather than shipping ungated.
 */
export async function searchDrive(admin: SupabaseClient, userId: string, query: string) {
  const conn = await getConnection(admin, userId, 'drive');
  if (!conn) {
    return { available: false as const, reason: NOT_CONNECTED('Google Drive'), files: [] as unknown[] };
  }

  try {
    // Escape single quotes: they terminate the Drive query string literal.
    const safe = query.replaceAll("'", "\\'");
    const params = new URLSearchParams({
      q: `name contains '${safe}' and trashed = false`,
      fields: 'files(id,name,mimeType,modifiedTime,webViewLink,driveId)',
      pageSize: '15',
      // Shared drives, not just My Drive.
      includeItemsFromAllDrives: 'true',
      supportsAllDrives: 'true',
      corpora: 'allDrives',
    });
    const res = await googleFetch(
      conn.accessToken,
      `https://www.googleapis.com/drive/v3/files?${params}`,
    );
    if (!res.ok) {
      return { available: false as const, reason: 'Drive could not be reached.', files: [] };
    }

    const data = await res.json();
    const files = (data.files ?? []).map((f: Record<string, unknown>) => ({
      file_id: f.id,
      name: f.name,
      type: f.mimeType,
      modified: f.modifiedTime,
      link: f.webViewLink,
    }));

    return { available: true as const, account: conn.googleEmail, query, files };
  } catch {
    return { available: false as const, reason: 'Drive could not be reached.', files: [] };
  }
}

/**
 * Re-resolve a task the conversation is referring to.
 *
 * The browser may pass back an opaque focus task id, never a task object. The
 * id is always looked up here so the assistant works from database truth and a
 * tampered client cannot fabricate a task.
 */
export async function resolveFocusTask(db: SupabaseClient, taskId: unknown): Promise<TaskRow | null> {
  if (typeof taskId !== 'string' || !/^[0-9a-f-]{36}$/i.test(taskId)) return null;
  const { data, error } = await db.from('tasks').select(TASK_COLUMNS).eq('id', taskId).maybeSingle();
  if (error || !data) return null;
  return toTask(data);
}

// ── Task state semantics (Step 3) ────────────────────────────────────────────
//
// `status` is the canonical task state. The legacy `done` boolean stays in the
// table and must be kept in step with it, because the existing dashboard UI
// still reads and writes `done`.
//
//   status === 'done'  ->  done = true
//   status !== 'done'  ->  done = false
//
// There is deliberately no database trigger for this: the synchronisation
// lives here, in the application write layer, as agreed.
//
// NO WRITE FUNCTION EXISTS YET — writes are Phase 5. This helper defines the
// invariant now so that every future write can spread it into a single update
// and the two columns cannot drift apart.

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';

export const TASK_STATUSES: readonly TaskStatus[] = ['todo', 'in_progress', 'done', 'blocked'];

export function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === 'string' && (TASK_STATUSES as readonly string[]).includes(value);
}

/**
 * The complete set of columns a task-state write must set, so `status` and
 * `done` can never disagree.
 *
 * Completing a task sets completed_at; reopening or rescheduling clears it.
 */
export function taskStateFields(status: TaskStatus, now = new Date()) {
  const finished = status === 'done';
  return {
    status,
    done: finished,
    completed_at: finished ? now.toISOString() : null,
    updated_at: now.toISOString(),
  };
}
