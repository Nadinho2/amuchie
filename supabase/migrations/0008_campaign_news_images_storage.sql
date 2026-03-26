-- =========================
-- Storage bucket for campaign news featured images
-- =========================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'campaign-news-images',
  'campaign-news-images',
  true,
  10485760, -- 10MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "campaign_news_images_insert_auth" on storage.objects;
create policy "campaign_news_images_insert_auth"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'campaign-news-images'
  and owner = auth.uid()
);

drop policy if exists "campaign_news_images_update_own" on storage.objects;
create policy "campaign_news_images_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'campaign-news-images'
  and owner = auth.uid()
)
with check (
  bucket_id = 'campaign-news-images'
  and owner = auth.uid()
);

drop policy if exists "campaign_news_images_delete_own" on storage.objects;
create policy "campaign_news_images_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'campaign-news-images'
  and owner = auth.uid()
);

drop policy if exists "campaign_news_images_public_read" on storage.objects;
create policy "campaign_news_images_public_read"
on storage.objects
for select
to public
using (bucket_id = 'campaign-news-images');

