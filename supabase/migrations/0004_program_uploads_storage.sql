-- =========================
-- Storage bucket + policies for program uploads
-- =========================

-- Create bucket used by upload dialogs
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'program-uploads',
  'program-uploads',
  true,
  52428800, -- 50MB max
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
on conflict (id) do nothing;

-- Authenticated users can upload files they own
drop policy if exists "program_uploads_bucket_insert_auth" on storage.objects;
create policy "program_uploads_bucket_insert_auth"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'program-uploads'
  and owner = auth.uid()
);

-- Authenticated users can update/delete only their own files
drop policy if exists "program_uploads_bucket_update_own" on storage.objects;
create policy "program_uploads_bucket_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'program-uploads'
  and owner = auth.uid()
)
with check (
  bucket_id = 'program-uploads'
  and owner = auth.uid()
);

drop policy if exists "program_uploads_bucket_delete_own" on storage.objects;
create policy "program_uploads_bucket_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'program-uploads'
  and owner = auth.uid()
);

-- Public read from this bucket (used by program card/detail thumbnails)
drop policy if exists "program_uploads_bucket_public_read" on storage.objects;
create policy "program_uploads_bucket_public_read"
on storage.objects
for select
to public
using (bucket_id = 'program-uploads');

