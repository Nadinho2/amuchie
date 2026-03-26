-- =========================
-- Admin moderation for program uploads
-- =========================

-- Roles table (minimal RBAC)
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

-- Authenticated users can read their own role row
drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own"
on public.user_roles
for select
to authenticated
using (user_id = auth.uid());

-- Helper function for RLS/policies
create or replace function public.is_admin(u uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = u and ur.role = 'admin'
  );
$$;

-- Add moderation columns
alter table public.program_uploads
  add column if not exists rejected boolean not null default false,
  add column if not exists moderated_by uuid references auth.users(id) on delete set null,
  add column if not exists moderated_at timestamptz;

-- Indexes
create index if not exists idx_program_uploads_rejected on public.program_uploads(rejected);
create index if not exists idx_program_uploads_moderated_at on public.program_uploads(moderated_at desc);

-- =========================
-- Update RLS policies
-- =========================

-- 1) Authenticated select: allow uploader, approved, and admins (so admins can moderate pending)
drop policy if exists "program_uploads_select_user_or_approved" on public.program_uploads;
create policy "program_uploads_select_user_or_approved"
on public.program_uploads
for select
to authenticated
using (
  approved = true
  or rejected = true
  or user_id = auth.uid()
  or public.is_admin(auth.uid())
);

-- 2) Uploader updates only pending (approved=false, rejected=false)
drop policy if exists "program_uploads_update_own_pending" on public.program_uploads;
create policy "program_uploads_update_own_pending"
on public.program_uploads
for update
to authenticated
using (
  user_id = auth.uid()
  and approved = false
  and rejected = false
  and moderated_by is null
  and moderated_at is null
)
with check (
  user_id = auth.uid()
  and approved = false
  and rejected = false
  and moderated_by is null
  and moderated_at is null
);

-- 3) Creator approvals are disabled; approvals are admin-only.
drop policy if exists "program_uploads_creator_can_approve" on public.program_uploads;

-- 4) Admin approves any pending upload
drop policy if exists "program_uploads_admin_can_approve" on public.program_uploads;
create policy "program_uploads_admin_can_approve"
on public.program_uploads
for update
to authenticated
using (
  approved = false
  and rejected = false
  and public.is_admin(auth.uid())
)
with check (
  approved = true
  and rejected = false
  and public.is_admin(auth.uid())
);

-- 5) Admin rejects any pending upload
drop policy if exists "program_uploads_admin_can_reject" on public.program_uploads;
create policy "program_uploads_admin_can_reject"
on public.program_uploads
for update
to authenticated
using (
  approved = false
  and rejected = false
  and public.is_admin(auth.uid())
)
with check (
  approved = false
  and rejected = true
  and public.is_admin(auth.uid())
);

-- 6) Pending inserts: keep approved=false and rejected=false for safety
drop policy if exists "program_uploads_insert_pending" on public.program_uploads;
create policy "program_uploads_insert_pending"
on public.program_uploads
for insert
to authenticated
with check (
  user_id = auth.uid()
  and approved = false
  and rejected = false
);

