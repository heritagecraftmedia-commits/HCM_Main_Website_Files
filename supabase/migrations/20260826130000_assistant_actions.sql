-- The approval gate for anything the assistant wants to change.
--
-- Scott's rule: writing to Drive needs his approval. This table is where that
-- approval actually lives, rather than being a promise in a system prompt.
--
-- HOW IT WORKS
--
-- The assistant never performs a gated write directly. It records its intent
-- here as a `pending` row describing exactly what it wants to do. Nothing
-- happens to Drive or the calendar until Scott approves that row, at which
-- point the assistant-actions Edge Function executes it server-side and writes
-- the outcome back.
--
-- Drafting an email is deliberately NOT gated here. A Gmail draft is already a
-- thing that sits and waits for Scott — the draft is its own approval step, and
-- sending is blocked outright in code, so there is nothing to approve.
--
-- SECURITY MODEL
--
-- Unlike google_connections, Scott is meant to see these — the whole point is
-- that he reads them and decides. So there IS a select policy, owner-scoped.
--
-- But there are deliberately NO insert/update/delete policies. Rows are created
-- by the assistant and transitioned by the approval function, both using the
-- service role inside Edge Functions. A tampered browser cannot mark its own
-- action approved, invent an approved action, or quietly rewrite a payload
-- between approval and execution.

create table if not exists public.assistant_actions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,

  -- What the assistant wants to do.
  kind         text not null check (kind in (
                 'drive_create_folder',
                 'drive_rename',
                 'drive_move',
                 'drive_trash',
                 'calendar_create',
                 'calendar_update',
                 'calendar_delete'
               )),

  -- Plain-English description, written for Scott, shown on the approval card.
  summary      text not null,

  -- The exact arguments the write will be executed with. Frozen at proposal
  -- time: execution reads this, never anything supplied later by the browser.
  payload      jsonb not null default '{}'::jsonb,

  status       text not null default 'pending'
                 check (status in ('pending', 'rejected', 'executed', 'failed')),

  -- Outcome once executed: the created event id, the moved file, or the error.
  result       jsonb,

  created_at   timestamptz not null default now(),
  decided_at   timestamptz,
  executed_at  timestamptz
);

create index if not exists assistant_actions_pending_idx
  on public.assistant_actions (user_id, status, created_at desc);

alter table public.assistant_actions enable row level security;

-- Scott can read his own actions. That is the only client-side capability.
-- Creating and deciding both happen server-side under the service role.
drop policy if exists "owner reads own assistant actions" on public.assistant_actions;
create policy "owner reads own assistant actions"
  on public.assistant_actions
  for select
  to authenticated
  using (user_id = auth.uid() and public.is_owner());
