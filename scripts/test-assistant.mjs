#!/usr/bin/env node
/**
 * Integration test for the Ask Claude assistant.
 *
 *   node scripts/test-assistant.mjs
 *
 * Stages:
 *   1. Data layer  — runs the real tool executors against the real Supabase
 *                    project and reports what comes back.
 *   2. Tool loop   — drives the real assistant loop (real tools, real data)
 *                    against a scripted Anthropic endpoint, proving that a
 *                    tool_use is executed and its result is fed back.
 *   3. Live Claude — only runs when ANTHROPIC_API_KEY is set. Asks the real
 *                    model "What are my tasks today?" and asserts the answer
 *                    is grounded in the returned data rather than a
 *                    "I don't have access" brush-off.
 *
 * Env:
 *   SUPABASE_URL / VITE_SUPABASE_URL            (required)
 *   SUPABASE_ANON_KEY / VITE_SUPABASE_ANON_KEY  (required)
 *   HCM_TEST_EMAIL / HCM_TEST_PASSWORD          (optional — sign in as a real
 *                                                user so RLS is exercised as
 *                                                that user rather than anon)
 *   ANTHROPIC_API_KEY                           (optional — enables stage 3)
 */

import { createClient } from '@supabase/supabase-js';
import { executeTool, TOOL_DEFINITIONS } from '../api/_lib/tools.js';
import { runAssistant } from '../api/_lib/assistant.js';
import { ukToday, ukWeekRange } from '../api/_lib/ukDate.js';

const URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!URL || !KEY) {
  console.error('FAIL: set SUPABASE_URL and SUPABASE_ANON_KEY (or the VITE_ equivalents).');
  process.exit(1);
}

let failures = 0;
let blocked = 0;

// Some sandboxes block outbound HTTPS to Supabase. That is an environment
// limitation, not a defect in the assistant, so report it separately.
const isEgressBlocked = err =>
  typeof err === 'string' &&
  /not in allowlist|ENOTFOUND|ECONNREFUSED|fetch failed|EAI_AGAIN|network egress/i.test(err);

const check = (name, pass, detail = '') => {
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!pass) failures++;
};

const checkData = (name, result, detail = '') => {
  if (result.ok === false && isEgressBlocked(result.error)) {
    console.log(`  BLOCKED  ${name} — network egress to Supabase is blocked here`);
    blocked++;
    return;
  }
  check(name, result.ok !== false, result.error || detail);
};

const supabase = createClient(URL, KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Sign in as the real user when credentials are supplied, so the queries run
// under that user's RLS context instead of anon.
let identity = 'anon (no HCM_TEST_EMAIL set)';
if (process.env.HCM_TEST_EMAIL && process.env.HCM_TEST_PASSWORD) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: process.env.HCM_TEST_EMAIL,
    password: process.env.HCM_TEST_PASSWORD,
  });
  if (error) {
    console.error(`FAIL: could not sign in as ${process.env.HCM_TEST_EMAIL}: ${error.message}`);
    process.exit(1);
  }
  identity = `${data.user.email} (${data.user.id})`;
}

const today = ukToday();
const week = ukWeekRange(today);

console.log('\n=== HCM assistant integration test ===');
console.log(`Supabase : ${URL}`);
console.log(`Identity : ${identity}`);
console.log(`UK today : ${today}  (week ${week.start} -> ${week.end})\n`);

// ── Stage 1: data layer ──────────────────────────────────────────────────────
console.log('Stage 1 — data layer (real Supabase)');
if (identity.startsWith('anon')) {
  console.log(
    '  NOTE: running anonymously. daily_tasks, approvals and learning_log are\n' +
    '        restricted to authenticated users, so zero rows here is CORRECT.\n' +
    '        Set HCM_TEST_EMAIL / HCM_TEST_PASSWORD to see the real counts.'
  );
}

const todayTasks = await executeTool(supabase, 'get_tasks', { start_date: today });
checkData('get_tasks(today) executes without error', todayTasks, `${todayTasks.count} task(s)`);

const outstanding = await executeTool(supabase, 'get_outstanding_tasks', {});
checkData('get_outstanding_tasks executes without error', outstanding, `${outstanding.count} outstanding`);
check('outstanding tasks are real rows with text', (outstanding.tasks || []).every(t => typeof t.task === 'string' && t.task.length > 0), 'every row has a task description');

const backlog = await executeTool(supabase, 'get_project_backlog', {});
checkData('get_project_backlog executes without error', backlog, `${backlog.count} project(s)`);

const approvals = await executeTool(supabase, 'get_approvals', { status: 'pending' });
checkData('get_approvals(pending) executes without error', approvals, `${approvals.count} pending`);

const learning = await executeTool(supabase, 'get_learning_log', {});
checkData('get_learning_log executes without error', learning, `${learning.count} entr(ies)`);

console.log('\n  Live data the assistant can currently see:');
console.log(`    tasks due today (${today}) : ${todayTasks.count ?? 0}`);
console.log(`    outstanding tasks          : ${outstanding.count ?? 0}`);
for (const t of (outstanding.tasks || []).slice(0, 8)) {
  console.log(`      - ${t.task}  [${t.priority ?? 'none'}${t.overdue ? ', overdue' : ''}${t.date ? ', ' + t.date : ''}]`);
}
console.log(`    project backlog            : ${backlog.count ?? 0}`);
console.log(`    pending approvals          : ${approvals.count ?? 0}`);

// ── Stage 2: tool loop with a scripted model ─────────────────────────────────
const liveDbReachable = !(outstanding.ok === false && isEgressBlocked(outstanding.error));

console.log('\nStage 2 — tool loop (real tools + real data, scripted model)');
if (!liveDbReachable) {
  console.log('  (Supabase unreachable from here — loop mechanics still verified below.)');
}

let sawTools = false;
let toolResultSeen = null;
let round = 0;

const scriptedFetch = async (_url, init) => {
  const body = JSON.parse(init.body);
  round++;
  if (round === 1) {
    sawTools = Array.isArray(body.tools) && body.tools.length === TOOL_DEFINITIONS.length;
    return {
      ok: true,
      json: async () => ({
        content: [
          { type: 'text', text: 'Let me check.' },
          { type: 'tool_use', id: 'tu_1', name: 'get_outstanding_tasks', input: {} },
        ],
      }),
    };
  }
  // Second call: the tool_result must be present in the conversation.
  const last = body.messages[body.messages.length - 1];
  toolResultSeen = last.content.find(b => b.type === 'tool_result');
  const parsed = JSON.parse(toolResultSeen.content);
  const names = (parsed.tasks || []).map(t => t.task);
  return {
    ok: true,
    json: async () => ({
      content: [{ type: 'text', text: names.length ? `You have: ${names.join('; ')}` : 'Nothing outstanding.' }],
    }),
  };
};

const looped = await runAssistant({
  supabase,
  displayName: 'Scott',
  messages: [{ role: 'user', content: 'What are my tasks today?' }],
  apiKey: 'test-key',
  fetchImpl: scriptedFetch,
});

check('tools are supplied to the model', sawTools, `${TOOL_DEFINITIONS.length} tool definitions sent`);
check('tool_use request is executed', looped.toolCalls.length === 1 && looped.toolCalls[0].name === 'get_outstanding_tasks');
checkData('tool executed successfully against Supabase', looped.toolCalls[0]?.ok === true ? { ok: true } : { ok: false, error: liveDbReachable ? 'tool reported failure' : 'not in allowlist' });
check('tool_result is fed back to the model', Boolean(toolResultSeen), toolResultSeen ? 'tool_result block present' : 'missing');
check('final answer is built from the returned data', looped.text.length > 0 && !/don't have access|do not have access/i.test(looped.text));
checkData('dataError flag is false on a healthy run', looped.dataError === false ? { ok: true } : { ok: false, error: liveDbReachable ? 'dataError was set' : 'not in allowlist' });
console.log(`    model answer: ${looped.text.slice(0, 160)}`);

// Failure path: a broken client must surface as dataError, not "no access".
const brokenClient = createClient(URL, 'invalid-key-for-failure-test', {
  auth: { persistSession: false, autoRefreshToken: false },
});
const brokenRound = { n: 0 };
const brokenFetch = async (_u, init) => {
  brokenRound.n++;
  if (brokenRound.n === 1) {
    return { ok: true, json: async () => ({ content: [{ type: 'tool_use', id: 't', name: 'get_outstanding_tasks', input: {} }] }) };
  }
  const last = JSON.parse(init.body).messages.slice(-1)[0];
  const tr = last.content.find(b => b.type === 'tool_result');
  return { ok: true, json: async () => ({ content: [{ type: 'text', text: `is_error=${tr.is_error}` }] }) };
};
const brokenRun = await runAssistant({
  supabase: brokenClient,
  displayName: 'Scott',
  messages: [{ role: 'user', content: 'What are my tasks today?' }],
  apiKey: 'test-key',
  fetchImpl: brokenFetch,
});
check('a data outage sets dataError (not reported as "no access")', brokenRun.dataError === true, brokenRun.text.slice(0, 60));

// ── Stage 2b: full loop over the real row shapes ─────────────────────────────
// Proves the whole question -> tool -> answer path independently of network
// reachability, using the exact row shapes that live in Supabase today.
console.log('\nStage 2b — full loop over real row shapes (offline fixture)');

const FIXTURE = {
  daily_tasks: [
    { id: '0ba75ab6', title: null, text: 'Check emails and respond', priority: 'high', done: false, task_date: '2026-03-20', due_date: null, note: null },
    { id: '5456d9ed', title: null, text: 'Review dashboard approvals', priority: 'high', done: false, task_date: '2026-03-20', due_date: null, note: null },
    { id: 'a321ce0b', title: null, text: 'Exercise — 20 min walk', priority: 'medium', done: false, task_date: '2026-03-20', due_date: null, note: null },
  ],
  tasks: [],
  pa_tasks: [{ id: '57d04e2e', project_name: 'CraftVideo AI', task_description: 'Fix the webhook, then full pipeline test', priority: 1, status: 'not_started', energy_required: 'high' }],
  approvals: [{ id: 'c3e3baad', type: 'email', title: 'Draft Email — Workshop Enquiry Reply', summary: 'Ready to send.', status: 'pending', created_at: '2026-03-20T01:55:33Z' }],
  learning_log: [],
};

// Minimal PostgREST-shaped stub: every filter narrows an in-memory array.
function stubClient(fixture) {
  const build = table => {
    let rows = [...(fixture[table] || [])];
    const api = {
      select() { return api; },
      eq(col, val) { rows = rows.filter(r => r[col] === val); return api; },
      is(col, val) { rows = rows.filter(r => r[col] === val); return api; },
      gte(col, val) { rows = rows.filter(r => r[col] != null && r[col] >= val); return api; },
      lte(col, val) { rows = rows.filter(r => r[col] != null && r[col] <= val); return api; },
      order() { return api; },
      limit(n) { rows = rows.slice(0, n); return api; },
      then(resolve) { return Promise.resolve({ data: rows, error: null }).then(resolve); },
    };
    return api;
  };
  return { from: build };
}

const stub = stubClient(FIXTURE);

const stubToday = await executeTool(stub, 'get_tasks', { start_date: today });
check('fixture: today has no dated tasks (matches live data)', stubToday.ok && stubToday.count === 0, `${stubToday.count} for ${today}`);

const stubMarch = await executeTool(stub, 'get_tasks', { start_date: '2026-03-20' });
check('fixture: the March day returns its 3 tasks', stubMarch.ok && stubMarch.count === 3, `${stubMarch.count} on 2026-03-20`);

const stubOut = await executeTool(stub, 'get_outstanding_tasks', {});
check('fixture: outstanding tasks are flagged overdue', stubOut.ok && stubOut.tasks.every(t => t.overdue === true), `${stubOut.count} outstanding, all overdue`);
check('fixture: daily_tasks.text is surfaced as the task wording', stubOut.tasks[0]?.task === 'Check emails and respond', stubOut.tasks[0]?.task);

let finalPrompt = null;
const fixtureFetch = async (_u, init) => {
  const body = JSON.parse(init.body);
  const n = body.messages.filter(m => m.role === 'assistant').length;
  if (n === 0) {
    return { ok: true, json: async () => ({ content: [{ type: 'tool_use', id: 'a', name: 'get_tasks', input: { start_date: today } }] }) };
  }
  if (n === 1) {
    return { ok: true, json: async () => ({ content: [{ type: 'tool_use', id: 'b', name: 'get_outstanding_tasks', input: {} }] }) };
  }
  finalPrompt = body;
  const tr = body.messages.slice(-1)[0].content.find(x => x.type === 'tool_result');
  const parsed = JSON.parse(tr.content);
  return { ok: true, json: async () => ({ content: [{ type: 'text', text: `Nothing is dated today. Still outstanding: ${parsed.tasks.map(t => t.task).join('; ')}.` }] }) };
};

const fixtureRun = await runAssistant({
  supabase: stub,
  displayName: 'Scott',
  messages: [{ role: 'user', content: 'What are my tasks today?' }],
  apiKey: 'test-key',
  fetchImpl: fixtureFetch,
});

check('multi-round tool use works (today -> outstanding)', fixtureRun.toolCalls.length === 2, fixtureRun.toolCalls.map(t => t.name).join(' -> '));
check('system prompt carries the correct UK date', finalPrompt?.system.includes(`Today is ${today}`));
check('system prompt forbids the "no access" answer', /NEVER say you lack access/.test(finalPrompt?.system || ''));
check('answer names the real outstanding tasks', /Check emails and respond/.test(fixtureRun.text));
check('answer states empty-for-today without claiming no access', /Nothing is dated today/.test(fixtureRun.text) && !/don'?t have access/i.test(fixtureRun.text));
console.log(`    answer: ${fixtureRun.text}`);

// ── Stage 3: live Claude ─────────────────────────────────────────────────────
if (process.env.ANTHROPIC_API_KEY) {
  console.log('\nStage 3 — live Claude ("What are my tasks today?")');
  const live = await runAssistant({
    supabase,
    displayName: 'Scott',
    messages: [{ role: 'user', content: 'What are my tasks today?' }],
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  console.log(`\n--- answer ---\n${live.text}\n--------------`);
  console.log(`    tools called: ${live.toolCalls.map(t => t.name).join(', ') || 'none'}`);
  check('Claude called at least one data tool', live.toolCalls.length > 0);
  check('Claude did not claim it lacks access', !/don'?t have access|do not have access|paste your task list|connect me to your tools/i.test(live.text));
} else {
  console.log('\nStage 3 — SKIPPED (ANTHROPIC_API_KEY not set in this environment)');
}

const summary = failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`;
console.log(`\n${summary}${blocked ? ` (${blocked} blocked by network egress policy)` : ''}\n`);
process.exit(failures === 0 ? 0 : 1);
