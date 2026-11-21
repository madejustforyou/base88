-- Base88 business drafts: apply in the Supabase project before enabling save UI.
-- This migration creates no payment accounts, communication channels, or external actions.
create table if not exists public.base88_business_drafts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name varchar(120) not null,
  category varchar(64) not null,
  brief jsonb not null check (jsonb_typeof(brief) = 'object'),
  status varchar(20) not null default 'draft' check (status = 'draft'),
  created_at timestamptz not null default now()
);

create index if not exists base88_business_drafts_owner_recent_idx
  on public.base88_business_drafts(owner_id, created_at desc, id desc);

alter table public.base88_business_drafts enable row level security;
alter table public.base88_business_drafts force row level security;
revoke all on public.base88_business_drafts from public, anon;
grant select, insert, update, delete on public.base88_business_drafts to authenticated;

drop policy if exists base88_drafts_select_own on public.base88_business_drafts;
create policy base88_drafts_select_own on public.base88_business_drafts for select
  to authenticated using ((select auth.uid()) = owner_id);

drop policy if exists base88_drafts_insert_own on public.base88_business_drafts;
create policy base88_drafts_insert_own on public.base88_business_drafts for insert
  to authenticated with check ((select auth.uid()) = owner_id and status = 'draft');

drop policy if exists base88_drafts_update_own on public.base88_business_drafts;
create policy base88_drafts_update_own on public.base88_business_drafts for update
  to authenticated using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id and status = 'draft');

drop policy if exists base88_drafts_delete_own on public.base88_business_drafts;
create policy base88_drafts_delete_own on public.base88_business_drafts for delete
  to authenticated using ((select auth.uid()) = owner_id);
