-- Einrichtung der Datenbank für "Mein Kompass".
-- Diesen Text komplett in Supabase unter "SQL Editor" einfügen und auf "Run" klicken.

-- Eine Zeile pro Person mit dem gesamten Lernfortschritt
create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint progress_size check (pg_column_size(state) < 500000)
);

-- Jede Person darf nur ihren eigenen Fortschritt sehen und ändern
alter table public.progress enable row level security;

drop policy if exists "Eigenen Fortschritt lesen" on public.progress;
create policy "Eigenen Fortschritt lesen" on public.progress
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Eigenen Fortschritt anlegen" on public.progress;
create policy "Eigenen Fortschritt anlegen" on public.progress
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Eigenen Fortschritt ändern" on public.progress;
create policy "Eigenen Fortschritt ändern" on public.progress
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

grant select, insert, update on public.progress to authenticated;
revoke all on public.progress from anon;

-- Damit Nutzerinnen und Nutzer ihr Konto selbst löschen können
create or replace function public.delete_my_account()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
