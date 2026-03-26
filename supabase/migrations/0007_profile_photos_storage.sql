-- =========================
-- Storage bucket for ambassador profile photos
-- =========================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-photos',
  'profile-photos',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "profile_photos_insert_auth" on storage.objects;
create policy "profile_photos_insert_auth"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-photos'
  and owner = auth.uid()
);

drop policy if exists "profile_photos_update_own" on storage.objects;
create policy "profile_photos_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-photos'
  and owner = auth.uid()
)
with check (
  bucket_id = 'profile-photos'
  and owner = auth.uid()
);

drop policy if exists "profile_photos_delete_own" on storage.objects;
create policy "profile_photos_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-photos'
  and owner = auth.uid()
);

drop policy if exists "profile_photos_public_read" on storage.objects;
create policy "profile_photos_public_read"
on storage.objects
for select
to public
using (bucket_id = 'profile-photos');

