-- =========================
-- Campaign News & Updates
-- =========================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'campaign_news_category') then
    create type public.campaign_news_category as enum (
      'Campaign Update',
      'Empowerment Program',
      'Party News',
      'Media Mention',
      'Community'
    );
  end if;
end $$;

create table if not exists public.campaign_news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  featured_image_url text,
  category public.campaign_news_category not null default 'Campaign Update',
  program_id uuid references public.empowerment_programs(id) on delete set null,
  published_at timestamptz not null default now(),
  author text not null default 'Amuchie Ambassadors Team',
  is_published boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_campaign_news_published_at
  on public.campaign_news(published_at desc);
create index if not exists idx_campaign_news_category
  on public.campaign_news(category);
create index if not exists idx_campaign_news_is_published
  on public.campaign_news(is_published);
create index if not exists idx_campaign_news_slug
  on public.campaign_news(slug);

alter table public.campaign_news enable row level security;

-- Everyone can read published news.
drop policy if exists "campaign_news_select_published_public" on public.campaign_news;
create policy "campaign_news_select_published_public"
on public.campaign_news
for select
to public
using (is_published = true);

-- Authenticated users can create news items (including drafts).
drop policy if exists "campaign_news_insert_authenticated" on public.campaign_news;
create policy "campaign_news_insert_authenticated"
on public.campaign_news
for insert
to authenticated
with check (created_by = auth.uid());

-- Creator can edit their own unpublished item; admins can edit anything.
drop policy if exists "campaign_news_update_owner_or_admin" on public.campaign_news;
create policy "campaign_news_update_owner_or_admin"
on public.campaign_news
for update
to authenticated
using (
  (created_by = auth.uid() and is_published = false)
  or public.is_admin(auth.uid())
)
with check (
  (created_by = auth.uid() and is_published = false)
  or public.is_admin(auth.uid())
);

-- Creator can delete their own unpublished item; admins can delete anything.
drop policy if exists "campaign_news_delete_owner_or_admin" on public.campaign_news;
create policy "campaign_news_delete_owner_or_admin"
on public.campaign_news
for delete
to authenticated
using (
  (created_by = auth.uid() and is_published = false)
  or public.is_admin(auth.uid())
);

