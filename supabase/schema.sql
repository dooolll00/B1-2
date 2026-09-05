-- Supabase SQL Editor에서 실행하세요. 익명 로그인은 Auth 설정에서 별도 활성화합니다.
create table if not exists public.records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 80),
  content text not null check (char_length(trim(content)) between 1 and 10000),
  category text not null check (category in ('React','JavaScript','CSS','기타')),
  status text not null check (status in ('학습 중','복습 필요','학습 완료')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.records enable row level security;
grant select, insert, update, delete on public.records to authenticated;
revoke all on public.records from anon;
drop policy if exists "own records" on public.records;
create policy "own records" on public.records for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create index if not exists records_user_created_idx on public.records(user_id, created_at desc);
create or replace function public.touch_record() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists touch_record on public.records;
create trigger touch_record before update on public.records for each row execute function public.touch_record();
