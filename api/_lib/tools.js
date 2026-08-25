// Tool definitions + executors for the HCM founder assistant.
//
// Every executor runs against a Supabase client that carries the *caller's*
// JWT, so Row Level Security decides what comes back. No service-role key is
// used anywhere in this path.
//
// Executors never throw: they return { ok: true, ... } or { ok: false, error }.
// That distinction is what lets the assistant say "I couldn't reach your task
// list" instead of "I don't have access to your task list".

import { addDays, ukToday, ukWeekRange } from './ukDate.js';

const DATE_ARG = {
  type: 'string',
  description: 'Date in YYYY-MM-DD format (UK local calendar date).',
};

export const TOOL_DEFINITIONS = [
  {
    name: 'get_tasks',
    description:
      "Scott's dated to-do list. Use this for questions about what is on for " +
      'today, tomorrow, this week, or any specific date range. Returns tasks ' +
      'that carry a date. If you want undated or overdue work, use ' +
      'get_outstanding_tasks instead.',
    input_schema: {
      type: 'object',
      properties: {
        start_date: DATE_ARG,
        end_date: {
          ...DATE_ARG,
          description:
            'End of the range, inclusive. Omit to query a single day (same as start_date).',
        },
        include_done: {
          type: 'boolean',
          description: 'Include tasks already ticked off. Defaults to true.',
        },
      },
      required: ['start_date'],
    },
  },
  {
    name: 'get_outstanding_tasks',
    description:
      'Every task that is still not done, including overdue ones from previous ' +
      'days and tasks with no date set. Use this for "outstanding tasks", ' +
      '"what am I behind on", or when a day-specific query comes back empty.',
    input_schema: {
      type: 'object',
      properties: {
        limit: { type: 'integer', description: 'Max tasks to return. Default 50.' },
      },
    },
  },
  {
    name: 'get_project_backlog',
    description:
      "Scott's standing project priority list (the PA task list): project name, " +
      'what the next action is, priority order, status and how much energy it ' +
      'needs. Use this for prioritisation, "what should I work on", and for fog ' +
      'days (filter to low energy).',
    input_schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description:
            "Filter by status, e.g. 'not_started', 'in_progress', 'done'. Omit for all.",
        },
        energy_required: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description:
            'Filter by energy needed. Use "low" when Scott says he is having a fog day.',
        },
      },
    },
  },
  {
    name: 'get_approvals',
    description:
      'Items waiting on Scott to approve or reject — drafted emails, content ' +
      'posts, schedule changes. Use this for "what needs my attention" and ' +
      '"what is waiting on me".',
    input_schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: "Filter by status, e.g. 'pending'. Omit for all.",
        },
      },
    },
  },
  {
    name: 'get_learning_log',
    description:
      'Patterns the system has learned about how Scott works, and whether each ' +
      'has been approved. Useful background when advising on how to plan a day.',
    input_schema: { type: 'object', properties: {} },
  },
];

// ── normalisation ────────────────────────────────────────────────────────────
// daily_tasks stores the wording in `text` (with `title` usually null) and the
// day in `task_date` (with `due_date` as a later addition). `tasks` uses
// `title`/`due_date`. Both are surfaced in one shape so Claude sees one list.

function fromDailyTask(row) {
  return {
    id: row.id,
    task: row.title || row.text,
    priority: row.priority ?? null,
    done: row.done === true,
    date: row.task_date || row.due_date || null,
    note: row.note ?? null,
    source: 'daily_tasks',
  };
}

function fromTask(row) {
  return {
    id: row.id,
    task: row.title,
    priority: row.priority ?? null,
    done: row.done === true,
    date: row.due_date || null,
    note: row.description ?? null,
    source: 'tasks',
  };
}

function sortTasks(list) {
  const rank = { high: 0, medium: 1, low: 2 };
  return list.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if ((a.date || '') !== (b.date || '')) return (a.date || '9999').localeCompare(b.date || '9999');
    return (rank[a.priority] ?? 3) - (rank[b.priority] ?? 3);
  });
}

// ── executors ────────────────────────────────────────────────────────────────

async function getTasks(supabase, { start_date, end_date, include_done = true }) {
  const from = start_date;
  const to = end_date || start_date;

  // daily_tasks carries the day in `task_date`, with `due_date` added later and
  // used on newer rows. Two plain queries beat one clever .or() filter here:
  // easier to reason about, and each one fails loudly on its own.
  const byTaskDate = await supabase
    .from('daily_tasks')
    .select('id, title, text, priority, done, task_date, due_date, note')
    .gte('task_date', from)
    .lte('task_date', to);

  const byDueDate = await supabase
    .from('daily_tasks')
    .select('id, title, text, priority, done, task_date, due_date, note')
    .is('task_date', null)
    .gte('due_date', from)
    .lte('due_date', to);

  const daily = {
    data: [...(byTaskDate.data || []), ...(byDueDate.data || [])],
    error: byTaskDate.error || byDueDate.error,
  };

  const dated = await supabase
    .from('tasks')
    .select('id, title, description, priority, done, due_date')
    .gte('due_date', from)
    .lte('due_date', to);

  // `tasks` is RLS-restricted to authenticated users; an anon caller gets an
  // empty set rather than an error. A real failure on daily_tasks is fatal for
  // this question, so surface it.
  if (daily.error) {
    return { ok: false, error: `Could not read daily_tasks: ${daily.error.message}` };
  }

  let rows = (daily.data || []).map(fromDailyTask);
  if (!dated.error) rows = rows.concat((dated.data || []).map(fromTask));
  if (!include_done) rows = rows.filter(r => !r.done);

  return {
    ok: true,
    range: { start: from, end: to },
    count: rows.length,
    tasks: sortTasks(rows),
    partial: dated.error ? `tasks table unreadable: ${dated.error.message}` : undefined,
  };
}

async function getOutstandingTasks(supabase, { limit = 50 }) {
  const daily = await supabase
    .from('daily_tasks')
    .select('id, title, text, priority, done, task_date, due_date, note')
    .eq('done', false)
    .limit(limit);

  const dated = await supabase
    .from('tasks')
    .select('id, title, description, priority, done, due_date')
    .eq('done', false)
    .limit(limit);

  if (daily.error) {
    return { ok: false, error: `Could not read daily_tasks: ${daily.error.message}` };
  }

  let rows = (daily.data || []).map(fromDailyTask);
  if (!dated.error) rows = rows.concat((dated.data || []).map(fromTask));

  const today = ukToday();
  for (const r of rows) r.overdue = Boolean(r.date && r.date < today);

  return { ok: true, count: rows.length, today, tasks: sortTasks(rows).slice(0, limit) };
}

async function getProjectBacklog(supabase, { status, energy_required }) {
  let q = supabase
    .from('pa_tasks')
    .select('id, project_name, task_description, priority, status, energy_required')
    .order('priority', { ascending: true });
  if (status) q = q.eq('status', status);
  if (energy_required) q = q.eq('energy_required', energy_required);

  const { data, error } = await q;
  if (error) return { ok: false, error: `Could not read pa_tasks: ${error.message}` };
  return { ok: true, count: data.length, projects: data };
}

async function getApprovals(supabase, { status }) {
  let q = supabase
    .from('approvals')
    .select('id, type, title, summary, status, created_at')
    .order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);

  const { data, error } = await q;
  if (error) return { ok: false, error: `Could not read approvals: ${error.message}` };
  return { ok: true, count: data.length, approvals: data };
}

async function getLearningLog(supabase) {
  const { data, error } = await supabase
    .from('learning_log')
    .select('id, pattern, status, created_at')
    .order('created_at', { ascending: false });
  if (error) return { ok: false, error: `Could not read learning_log: ${error.message}` };
  return { ok: true, count: data.length, entries: data };
}

const EXECUTORS = {
  get_tasks: getTasks,
  get_outstanding_tasks: getOutstandingTasks,
  get_project_backlog: getProjectBacklog,
  get_approvals: getApprovals,
  get_learning_log: getLearningLog,
};

/** Run one tool call. Never throws. */
export async function executeTool(supabase, name, input = {}) {
  const fn = EXECUTORS[name];
  if (!fn) return { ok: false, error: `Unknown tool: ${name}` };
  try {
    return await fn(supabase, input || {});
  } catch (err) {
    return { ok: false, error: `Tool ${name} failed: ${err.message}` };
  }
}

export { ukToday, ukWeekRange, addDays };
