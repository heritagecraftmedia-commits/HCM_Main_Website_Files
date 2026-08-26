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
 * Sorted urgent -> high -> medium -> low.
 */
export async function getTodayTasks(db: SupabaseClient) {
  const today = todayISO();
  const { data, error } = await db
    .from('tasks')
    .select(TASK_COLUMNS)
    .or(`due_date.eq.${today},and(due_date.is.null,status.neq.done)`);

  if (error) return { available: false as const, reason: error.message, tasks: [] as TaskRow[] };
  const tasks = (data ?? []).map(toTask).sort(byPriority);
  return { available: true as const, today, tasks };
}

/**
 * The next seven days: HCM tasks, plus Google Calendar events when genuine
 * read access exists. Calendar is reported unavailable rather than invented.
 */
export async function getWeekAhead(db: SupabaseClient) {
  const from = todayISO();
  const to = addDays(from, 6);
  const { data, error } = await db
    .from('tasks')
    .select(TASK_COLUMNS)
    .gte('due_date', from)
    .lte('due_date', to);

  const tasks = error ? [] : (data ?? []).map(toTask).sort(byPriority);

  return {
    range: { from, to },
    tasks_available: !error,
    tasks_error: error?.message ?? null,
    tasks,
    calendar: getCalendar(),
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
// The Phase 1B audit found NO server-side Google credential anywhere in the HCM
// project: no OAuth/token table for the owner, and api_credentials holds only
// bunny / hubspot / mailchimp / make / notion / stripe rows, all with empty
// key and secret. The Gmail and Calendar connections referenced in planning are
// Claude-side MCP connectors, which an Edge Function cannot use.
//
// These therefore report unavailable. They must not be made to look connected.

const GOOGLE_UNAVAILABLE =
  'Google account access is not connected to this assistant on the server yet.';

function getCalendar() {
  return {
    available: false as const,
    reason: "Google Calendar isn't currently connected for this assistant.",
    events: [] as unknown[],
  };
}

export function searchEmail(_query: string) {
  return { available: false as const, reason: GOOGLE_UNAVAILABLE, threads: [] as unknown[] };
}

export function getEmailContext(_threadId: string) {
  return { available: false as const, reason: GOOGLE_UNAVAILABLE, thread: null };
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
