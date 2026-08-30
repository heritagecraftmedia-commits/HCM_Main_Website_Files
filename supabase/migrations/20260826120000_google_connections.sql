-- Google account connections for the HCM Dashboard Assistant.
--
-- SECURITY MODEL — read this before changing anything here.
--
-- These tables hold live Google OAuth refresh tokens. A refresh token is a
-- long-lived key to Scott's mailbox, Drive and calendar, so it must never be
-- reachable from a browser, not even by the owner's own session.
--
-- Both tables therefore have RLS ENABLED and DELIBERATELY NO POLICIES. Under
-- PostgREST that means anon and authenticated get zero rows and zero writes —
-- the tables are invisible to the client. Only the service role, used inside
-- the OAuth Edge Functions, bypasses RLS and can touch them.
--
-- Do NOT add a "users can see their own tokens" policy. The owner does not
-- need to read the token; the owner needs to know a connection EXISTS, which
-- google_connection_status() below exposes without ever returning a secret.

create table if not exists public.google_connections (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  service       text not null check (service in ('gmail', 'drive', 'calendar')),

  -- Credentials. Never selected by any client-facing code path.
  refresh_token text not null,
  access_token  text,
  expires_at    timestamptz,

  -- What Google actually granted. Recorded from the token response rather than
  -- from what we asked for, so the dashboard reports reality, not intent.
  scopes        text[] not null default '{}',
  google_email  text,

  connected_at  timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- One connection per service per user. Reconnecting updates in place.
  unique (user_id, service)
);

alter table public.google_connections enable row level security;
-- No policies. Intentional. See the note above.

-- One-time CSRF nonces for the OAuth round trip.
--
-- The callback is hit by Google, not by the browser, so it arrives with no JWT
-- and cannot use auth.getUser(). The state row is what proves which HCM user
-- started the flow. It is single-use: the callback deletes it on redemption.
create table if not exists public.google_oauth_state (
  state       text primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  service     text not null check (service in ('gmail', 'drive', 'calendar')),
  redirect_to text,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '10 minutes'
);

alter table public.google_oauth_state enable row level security;
-- No policies. Intentional.

create index if not exists google_oauth_state_expires_idx
  on public.google_oauth_state (expires_at);

-- Connection status for the dashboard.
--
-- SECURITY DEFINER so it can read a table the caller cannot. It returns only
-- non-secret metadata — never refresh_token, access_token or expires_at.
-- Scoped to the calling user AND gated on is_owner(), so a non-owner learns
-- nothing at all.
create or replace function public.google_connection_status()
returns table (
  service      text,
  connected    boolean,
  google_email text,
  scopes       text[],
  connected_at timestamptz
)
language sql
security definer
set search_path = public, pg_temp
as $$
  select
    c.service,
    true as connected,
    c.google_email,
    c.scopes,
    c.connected_at
  from public.google_connections c
  where c.user_id = auth.uid()
    and public.is_owner()
$$;

revoke all on function public.google_connection_status() from public, anon;
grant execute on function public.google_connection_status() to authenticated;

-- Disconnecting is the one write the owner performs directly. It only ever
-- deletes the caller's own row, and only for the owner account.
create or replace function public.google_disconnect(p_service text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  removed integer;
begin
  if not public.is_owner() then
    raise exception 'Not permitted';
  end if;

  if p_service not in ('gmail', 'drive', 'calendar') then
    raise exception 'Unknown service';
  end if;

  delete from public.google_connections
   where user_id = auth.uid()
     and service = p_service;

  get diagnostics removed = row_count;
  return removed > 0;
end;
$$;

revoke all on function public.google_disconnect(text) from public, anon;
grant execute on function public.google_disconnect(text) to authenticated;
