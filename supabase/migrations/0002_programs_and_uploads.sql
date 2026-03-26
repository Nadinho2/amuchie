-- =========================
-- Empowerment Programs + Impact Uploads
-- =========================

-- Custom types
do $$
begin
  if not exists (select 1 from pg_type where typname = 'program_type') then
    create type public.program_type as enum (
      'youth_leadership',
      'rice_food_distributions',
      'agricultural_skills',
      'philanthropy_empowerment',
      'other'
    );
  end if;
end $$;

-- Main program table
create table if not exists public.empowerment_programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  program_type public.program_type not null,
  date timestamptz not null,
  location text not null,
  lga text,
  beneficiary_count integer not null default 0 check (beneficiary_count >= 0),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Uploaded media for programs (images/videos)
create table if not exists public.program_uploads (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.empowerment_programs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text,
  video_url text,
  caption text,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  constraint program_uploads_media_check check (
    (image_url is not null) or (video_url is not null)
  )
);

-- Indexes
create index if not exists idx_empowerment_programs_date on public.empowerment_programs(date desc);
create index if not exists idx_empowerment_programs_lga on public.empowerment_programs(lga);
create index if not exists idx_program_uploads_program_id on public.program_uploads(program_id);
create index if not exists idx_program_uploads_user_id on public.program_uploads(user_id);
create index if not exists idx_program_uploads_approved on public.program_uploads(approved);
create index if not exists idx_program_uploads_created_at on public.program_uploads(created_at desc);

-- =========================
-- Row Level Security
-- =========================

alter table public.empowerment_programs enable row level security;
alter table public.program_uploads enable row level security;

-- empowerment_programs policies:
-- - public can read programs
-- - authenticated users can create/update/delete their own programs

drop policy if exists "empowerment_programs_select_public" on public.empowerment_programs;
create policy "empowerment_programs_select_public"
on public.empowerment_programs
for select
to public
using (true);

drop policy if exists "empowerment_programs_insert_own" on public.empowerment_programs;
create policy "empowerment_programs_insert_own"
on public.empowerment_programs
for insert
to authenticated
with check (created_by = auth.uid());

drop policy if exists "empowerment_programs_update_own" on public.empowerment_programs;
create policy "empowerment_programs_update_own"
on public.empowerment_programs
for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

drop policy if exists "empowerment_programs_delete_own" on public.empowerment_programs;
create policy "empowerment_programs_delete_own"
on public.empowerment_programs
for delete
to authenticated
using (created_by = auth.uid());

-- program_uploads policies:
-- - public can read only approved uploads
-- - authenticated upload starts as pending (approved=false)
-- - uploader can edit pending uploads (caption) while approved=false
-- - program creator can approve uploads for their program (simple creator-based approval for now)

drop policy if exists "program_uploads_select_public_approved" on public.program_uploads;
create policy "program_uploads_select_public_approved"
on public.program_uploads
for select
to public
using (approved = true);

drop policy if exists "program_uploads_select_user_or_approved" on public.program_uploads;
create policy "program_uploads_select_user_or_approved"
on public.program_uploads
for select
to authenticated
using (approved = true or user_id = auth.uid());

drop policy if exists "program_uploads_insert_pending" on public.program_uploads;
create policy "program_uploads_insert_pending"
on public.program_uploads
for insert
to authenticated
with check (
  user_id = auth.uid()
  and approved = false
);

drop policy if exists "program_uploads_update_own_pending" on public.program_uploads;
create policy "program_uploads_update_own_pending"
on public.program_uploads
for update
to authenticated
using (user_id = auth.uid() and approved = false)
with check (user_id = auth.uid() and approved = false);

drop policy if exists "program_uploads_creator_can_approve" on public.program_uploads;
create policy "program_uploads_creator_can_approve"
on public.program_uploads
for update
to authenticated
using (
  approved = false
  and exists (
    select 1
    from public.empowerment_programs ep
    where ep.id = program_uploads.program_id
      and ep.created_by = auth.uid()
  )
)
with check (
  approved = true
  and exists (
    select 1
    from public.empowerment_programs ep
    where ep.id = program_uploads.program_id
      and ep.created_by = auth.uid()
  )
);

-- =========================
-- Storage note (optional but recommended):
-- You'll need a storage bucket named `program-uploads`.
-- This migration only enforces table RLS; storage bucket policies
-- should be configured in the Supabase dashboard later.
-- =========================

