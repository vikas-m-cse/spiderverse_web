-- ACE CLUB leaderboard schema. Run in Supabase SQL Editor as project owner.
create extension if not exists pgcrypto;

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  team_name text not null,
  captain_id uuid not null references auth.users(id) on delete restrict,
  round1_score integer not null default 0 check (round1_score between 0 and 100000),
  round2_score integer not null default 0 check (round2_score between 0 and 100000),
  created_at timestamptz not null default now(),
  constraint teams_team_name_ci_unique unique (team_name),
  constraint team_name_trimmed_length check (char_length(trim(team_name)) between 2 and 48)
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null check (role in ('admin','judge')),
  created_at timestamptz not null default now()
);

create index if not exists teams_captain_id_idx on public.teams(captain_id);

create or replace view public.leaderboard with (security_invoker = true) as
select id, team_name, round1_score, round2_score,
       (round1_score + round2_score)::integer as final_points, created_at
from public.teams
order by (round1_score + round2_score) desc, team_name asc;

alter table public.teams enable row level security;
alter table public.admins enable row level security;

drop policy if exists "Anyone can read teams" on public.teams;
create policy "Anyone can read teams" on public.teams for select to anon, authenticated using (true);
drop policy if exists "Captains can register teams" on public.teams;
create policy "Captains can register teams" on public.teams for insert to authenticated with check (auth.uid() = captain_id);
drop policy if exists "Admins and judges update scores" on public.teams;
create policy "Admins and judges update scores" on public.teams for update to authenticated
using (exists (select 1 from public.admins a where a.user_id=(select auth.uid()) and a.role in ('admin','judge')))
with check (exists (select 1 from public.admins a where a.user_id=(select auth.uid()) and a.role in ('admin','judge')));
drop policy if exists "Users can read own admin role" on public.admins;
create policy "Users can read own admin role" on public.admins for select to authenticated using (user_id=(select auth.uid()));

-- Do not allow captains or ordinary authenticated users to modify metadata columns.
-- Table grants allow score-column updates only; RLS still requires staff membership.
revoke update on public.teams from anon, authenticated;
grant update (round1_score, round2_score) on public.teams to authenticated;

revoke insert, update, delete on public.admins from anon, authenticated;
grant select on public.admins to authenticated;
grant select on public.teams to anon, authenticated;
grant insert on public.teams to authenticated;
grant update (round1_score, round2_score) on public.teams to authenticated;
grant select on public.leaderboard to anon, authenticated;

-- Bootstrap the initial admin after creating that account in Supabase Authentication:
-- insert into public.admins(user_id, display_name, role)
-- values ('AUTH-USER-UUID-HERE', 'ACE Club Admin', 'admin');
