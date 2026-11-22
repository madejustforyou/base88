-- Base88 authenticated beta chat budget.
-- APPLY via reviewed Supabase migration only after inspecting current public.agents schema.
-- No provider call is enabled by SQL alone: BASE88_AI_CHAT_ENABLED defaults off.
--
-- Never accept arbitrary agent IDs, client-supplied prompts/roles or mutable
-- client entitlement metadata as payment or credit authorization.

create table if not exists public.base88_agent_chat_reservations (
  owner_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null,
  agent_id uuid not null,
  created_at timestamptz not null default pg_catalog.now(),
  primary key (owner_id, request_id)
);

create index if not exists base88_agent_chat_by_day
  on public.base88_agent_chat_reservations (created_at, owner_id);

alter table public.base88_agent_chat_reservations enable row level security;
revoke all on public.base88_agent_chat_reservations from anon, authenticated;
grant select on public.base88_agent_chat_reservations to authenticated;

drop policy if exists base88_chat_receipt_owner_read on public.base88_agent_chat_reservations;
create policy base88_chat_receipt_owner_read
  on public.base88_agent_chat_reservations
  for select to authenticated using ((select auth.uid()) = owner_id);

-- A single PostgreSQL advisory transaction lock serializes ALL beta requests,
-- so the per-account AND global ceilings are exact under concurrent calls.
-- Scale with a dedicated metered credit ledger before public volume.
create or replace function public.base88_reserve_agent_chat(
  p_agent_id uuid,
  p_request_id uuid
) returns boolean
language plpgsql
security definer
set search_path = ''
as $body$
declare
  customer uuid := auth.uid();
  start_day timestamptz := pg_catalog.date_trunc('day', pg_catalog.now());
  start_month timestamptz := pg_catalog.date_trunc('month', pg_catalog.now());
begin
  if customer is null or p_agent_id is null or p_request_id is null then
    return false;
  end if;

  -- Never trust a caller-provided user_id. Only the owner of an active
  -- Supabase agent can reserve a provider request.
  if not exists(
    select 1 from public.agents a
    where a.id::text = p_agent_id::text
      and a.user_id = customer
      and a.status = 'active'
  ) then
    return false;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(88288, 1);
  if exists(
    select 1 from public.base88_agent_chat_reservations r
    where r.owner_id = customer and r.request_id = p_request_id
  ) then
    return false;
  end if;

  if (select pg_catalog.count(*) from public.base88_agent_chat_reservations r
      where r.owner_id = customer and r.created_at >= start_day) >= 5 then
    return false;
  end if;
  if (select pg_catalog.count(*) from public.base88_agent_chat_reservations r
      where r.owner_id = customer and r.created_at >= start_month) >= 60 then
    return false;
  end if;
  if (select pg_catalog.count(*) from public.base88_agent_chat_reservations r
      where r.created_at >= start_day) >= 200 then
    return false;
  end if;

  insert into public.base88_agent_chat_reservations (
    owner_id, request_id, agent_id
  ) values (customer, p_request_id, p_agent_id);
  return true;
end;
$body$;

revoke all on function public.base88_reserve_agent_chat(uuid, uuid) from public, anon;
grant execute on function public.base88_reserve_agent_chat(uuid, uuid) to authenticated;

comment on function public.base88_reserve_agent_chat(uuid, uuid) is
  'Owner-only authenticated, idempotent, daily/monthly/global beta provider reservations. A reservation is not a successful provider result or a prepaid credit debit.';
