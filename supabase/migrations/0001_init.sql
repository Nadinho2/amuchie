-- =========================
-- Extensions
-- =========================
create extension if not exists pgcrypto;

-- =========================
-- Custom types
-- =========================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'ambassador_level') then
    create type public.ambassador_level as enum ('bronze', 'silver', 'gold');
  end if;
end $$;

-- =========================
-- Sequences
-- =========================
create sequence if not exists public.ambassador_number_seq start 1;

-- =========================
-- Tables
-- =========================
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  photo_url text,
  ambassador_number text not null unique,
  points integer not null default 0 check (points >= 0),
  level public.ambassador_level not null default 'bronze',
  lga text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.points_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  points integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date timestamptz not null,
  location text not null,
  qr_code_data text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.event_attendance (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id) on delete cascade,
  referred_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint referrals_no_self_referral check (referrer_id <> referred_id),
  constraint referrals_unique_pair unique (referrer_id, referred_id)
);

create table if not exists public.impact_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text not null,
  caption text,
  created_at timestamptz not null default now()
);

-- =========================
-- Indexes
-- =========================
create index if not exists idx_profiles_points on public.profiles(points desc);
create index if not exists idx_profiles_lga on public.profiles(lga);
create index if not exists idx_points_transactions_user_id on public.points_transactions(user_id);
create index if not exists idx_events_date on public.events(date);
create index if not exists idx_event_attendance_user_id on public.event_attendance(user_id);
create index if not exists idx_referrals_referrer_id on public.referrals(referrer_id);
create index if not exists idx_impact_posts_user_id on public.impact_posts(user_id);
create index if not exists idx_impact_posts_created_at on public.impact_posts(created_at desc);

-- =========================
-- Utility functions
-- =========================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.assign_ambassador_number()
returns trigger
language plpgsql
as $$
declare
  next_num bigint;
begin
  if new.ambassador_number is null or new.ambassador_number = '' then
    next_num := nextval('public.ambassador_number_seq');
    new.ambassador_number := 'AA-2027-' || lpad(next_num::text, 5, '0');
  end if;
  return new;
end;
$$;

create or replace function public.apply_points_transaction()
returns trigger
language plpgsql
as $$
begin
  update public.profiles
  set
    points = greatest(points + new.points, 0),
    level = case
      when greatest(points + new.points, 0) >= 1500 then 'gold'::public.ambassador_level
      when greatest(points + new.points, 0) >= 500 then 'silver'::public.ambassador_level
      else 'bronze'::public.ambassador_level
    end,
    updated_at = now()
  where user_id = new.user_id;

  return new;
end;
$$;

-- =========================
-- Triggers
-- =========================
drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_profiles_assign_ambassador_number on public.profiles;
create trigger trg_profiles_assign_ambassador_number
before insert on public.profiles
for each row execute function public.assign_ambassador_number();

drop trigger if exists trg_points_apply on public.points_transactions;
create trigger trg_points_apply
after insert on public.points_transactions
for each row execute function public.apply_points_transaction();

-- =========================
-- Row Level Security
-- =========================
alter table public.profiles enable row level security;
alter table public.points_transactions enable row level security;
alter table public.events enable row level security;
alter table public.event_attendance enable row level security;
alter table public.referrals enable row level security;
alter table public.impact_posts enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "points_select_own" on public.points_transactions;
create policy "points_select_own"
on public.points_transactions
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "events_select_authenticated" on public.events;
create policy "events_select_authenticated"
on public.events
for select
to authenticated
using (true);

drop policy if exists "attendance_select_own" on public.event_attendance;
create policy "attendance_select_own"
on public.event_attendance
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "attendance_insert_own" on public.event_attendance;
create policy "attendance_insert_own"
on public.event_attendance
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "referrals_select_involved" on public.referrals;
create policy "referrals_select_involved"
on public.referrals
for select
to authenticated
using (referrer_id = auth.uid() or referred_id = auth.uid());

drop policy if exists "referrals_insert_self_as_referrer" on public.referrals;
create policy "referrals_insert_self_as_referrer"
on public.referrals
for insert
to authenticated
with check (referrer_id = auth.uid());

drop policy if exists "impact_select_authenticated" on public.impact_posts;
create policy "impact_select_authenticated"
on public.impact_posts
for select
to authenticated
using (true);

drop policy if exists "impact_insert_own" on public.impact_posts;
create policy "impact_insert_own"
on public.impact_posts
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "impact_update_own" on public.impact_posts;
create policy "impact_update_own"
on public.impact_posts
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "impact_delete_own" on public.impact_posts;
create policy "impact_delete_own"
on public.impact_posts
for delete
to authenticated
using (user_id = auth.uid());
