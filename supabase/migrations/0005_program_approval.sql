-- =========================
-- Program approval workflow
-- =========================

alter table public.empowerment_programs
  add column if not exists approved boolean not null default false,
  add column if not exists rejected boolean not null default false,
  add column if not exists moderated_by uuid references auth.users(id) on delete set null,
  add column if not exists moderated_at timestamptz;

create index if not exists idx_empowerment_programs_approved
  on public.empowerment_programs(approved);
create index if not exists idx_empowerment_programs_rejected
  on public.empowerment_programs(rejected);

-- Public should only see approved programs
drop policy if exists "empowerment_programs_select_public" on public.empowerment_programs;
create policy "empowerment_programs_select_public"
on public.empowerment_programs
for select
to public
using (approved = true);

-- Authenticated users can see approved + their own + admin visibility
drop policy if exists "empowerment_programs_select_authenticated" on public.empowerment_programs;
create policy "empowerment_programs_select_authenticated"
on public.empowerment_programs
for select
to authenticated
using (
  approved = true
  or created_by = auth.uid()
  or public.is_admin(auth.uid())
);

-- Creators can only edit while pending and cannot self-approve
drop policy if exists "empowerment_programs_update_own" on public.empowerment_programs;
create policy "empowerment_programs_update_own"
on public.empowerment_programs
for update
to authenticated
using (
  created_by = auth.uid()
  and approved = false
  and rejected = false
  and moderated_by is null
  and moderated_at is null
)
with check (
  created_by = auth.uid()
  and approved = false
  and rejected = false
  and moderated_by is null
  and moderated_at is null
);

-- Admin approves pending programs
drop policy if exists "empowerment_programs_admin_can_approve" on public.empowerment_programs;
create policy "empowerment_programs_admin_can_approve"
on public.empowerment_programs
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

-- Admin rejects pending programs
drop policy if exists "empowerment_programs_admin_can_reject" on public.empowerment_programs;
create policy "empowerment_programs_admin_can_reject"
on public.empowerment_programs
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

