# Ask Claude — how it works

The founder dashboard's assistant reads Scott's real data. This is the chain,
end to end, and what each piece needs to keep working.

## The chain

```
FounderDashboard (Ask Claude)
  └─ callClaude()                       sends the Supabase access token
      └─ POST /api/assistant
          ├─ api/_lib/auth.js           verifies the JWT, checks profiles.role
          ├─ api/_lib/assistant.js      system prompt + Anthropic tool loop
          ├─ api/_lib/tools.js          5 read tools -> Supabase
          └─ api/_lib/ukDate.js         Europe/London dates
```

The Supabase client is built with the **caller's own JWT**, so Row Level
Security decides what the tools can read. There is no service-role key in this
path, and there must never be one.

## Tools

| Tool | Reads | Answers |
|---|---|---|
| `get_tasks` | `daily_tasks`, `tasks` | "what's on today", "this week" |
| `get_outstanding_tasks` | `daily_tasks`, `tasks` | "outstanding", "overdue" |
| `get_project_backlog` | `pa_tasks` | "what should I prioritise", fog days (low energy) |
| `get_approvals` | `approvals` | "what needs my attention" |
| `get_learning_log` | `learning_log` | how Scott works |

Tasks are read from **both** `daily_tasks` and `tasks`. `daily_tasks` holds the
older rows and keeps its wording in a `text` column; `tasks` uses `title`. Both
are normalised into one shape so the assistant sees a single list.

## Empty vs broken

This distinction is the whole point of the rebuild:

- A tool returning **zero rows** means the list is genuinely empty. The
  assistant says so and offers what else it has.
- A tool returning **`{ ok: false }`** is a system failure. The assistant says
  something went wrong retrieving that data, and the response carries
  `dataError: true`.

The assistant must never report a failure — or an empty list — as "I don't have
access to your tasks". That phrasing was the original bug: the endpoint sent
Claude no tools and no identity, so it truthfully had no access.

## Not connected

There is **no email, calendar, or Notion integration**. Questions about the
inbox or calendar get a plain "that isn't connected yet". Do not wire the
`events` table in as a calendar — it is leftover multi-tenant data (464 of its
488 rows have no date) and is not Scott's diary.

## Environment variables

Vite inlines `VITE_*` into the browser bundle. Serverless functions do **not**
see those, so the server needs its own copies:

| Variable | Where | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | build | public |
| `VITE_SUPABASE_ANON_KEY` | build | public; RLS is the protection |
| `ANTHROPIC_API_KEY` | server | secret |
| `SUPABASE_URL` | server | same value as the VITE one |
| `SUPABASE_ANON_KEY` | server | anon key, **not** service-role |

Set these per environment in Vercel (Preview *and* Production).

## Testing

```bash
npm run test:assistant
```

Set `HCM_TEST_EMAIL` / `HCM_TEST_PASSWORD` to run the queries as a real signed-in
owner — the task tables are restricted to authenticated users, so an anonymous
run correctly returns nothing. Set `ANTHROPIC_API_KEY` to also make a live call
and assert the answer is grounded in real data.
