-- Base88 per-business OWNER TEST INBOX (no public submission or provider sends).
-- Requires 20261122_base88_business_drafts.sql first.
create table if not exists public.base88_business_inbox (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.base88_business_drafts(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  source varchar(16) not null default 'owner_test' check (source = 'owner_test'),
  from_name varchar(120) not null,
  from_email varchar(320) not null,
  subject varchar(180) not null,
  body text not null check (octet_length(body) <= 4096),
  status varchar(12) not null default 'unread' check (status in ('unread','resolved')),
  reply_draft text not null default '' check (octet_length(reply_draft) <= 4096),
  created_at timestamptz not null default now()
);
create index if not exists base88_business_inbox_owner_business_idx
  on public.base88_business_inbox(owner_id, business_id, created_at desc, id desc);
alter table public.base88_business_inbox enable row level security;
alter table public.base88_business_inbox force row level security;
revoke all on public.base88_business_inbox from public, anon;
grant select, insert, update, delete on public.base88_business_inbox to authenticated;

drop policy if exists base88_inbox_read_own on public.base88_business_inbox;
create policy base88_inbox_read_own on public.base88_business_inbox for select to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists base88_inbox_add_test_own on public.base88_business_inbox;
create policy base88_inbox_add_test_own on public.base88_business_inbox for insert to authenticated
  with check (
    (select auth.uid()) = owner_id and source = 'owner_test'
    and exists (select 1 from public.base88_business_drafts b
                where b.id = business_id and b.owner_id = (select auth.uid()))
  );

drop policy if exists base88_inbox_edit_own on public.base88_business_inbox;
create policy base88_inbox_edit_own on public.base88_business_inbox for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id and source = 'owner_test'
    and exists (select 1 from public.base88_business_drafts b
                where b.id = business_id and b.owner_id = (select auth.uid()))
  );

drop policy if exists base88_inbox_delete_own on public.base88_business_inbox;
create policy base88_inbox_delete_own on public.base88_business_inbox for delete to authenticated
  using ((select auth.uid()) = owner_id);
