# Automation Hook — Supabase Logging

**Status:** NOT CONNECTED — placeholder only

---

## What This Will Do

When active, every entry currently written to `actions-log.md` will also be inserted as a row in a Supabase table. This gives you a queryable, persistent log that survives file resets and can be read by dashboards or Make.com.

## Trigger Point

After each task completes, a script here will:
1. Read the latest log entry from `actions-log.md`
2. Parse it into structured fields
3. Insert a row into the Supabase `task_log` table

## Supabase Table Structure (Proposed)

```sql
create table task_log (
  id           uuid default gen_random_uuid() primary key,
  logged_at    timestamptz default now(),
  task_id      text,
  phase        text,
  action       text,
  status       text,
  triggered_by text default 'aider'
);
```

## What Needs to Happen First

- [ ] Supabase project confirmed (existing project or new?)
- [ ] `task_log` table created using the SQL above
- [ ] Supabase URL and anon key added as environment variables
- [ ] Small logging script written (Node.js or bash + curl)

## Config Placeholder

```json
{
  "enabled": false,
  "trigger": "task_complete",
  "supabase_url": "",
  "supabase_key": "",
  "table": "task_log"
}
```

## Notes

- Supabase keys must NEVER be committed to the repo
- Use `SUPABASE_URL` and `SUPABASE_ANON_KEY` environment variables
- The Supabase MCP server is already connected to this workspace — activation is straightforward
