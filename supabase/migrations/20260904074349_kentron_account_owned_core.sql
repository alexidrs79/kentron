create extension if not exists pgcrypto;

create type public.event_category as enum ('tech', 'creative', 'market');
create type public.theme_preference as enum ('system', 'dark', 'light');
create type public.distance_unit as enum ('km', 'mi');
create type public.timeline_mode as enum ('now', 'week');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 80),
  avatar_url text,
  theme public.theme_preference not null default 'system',
  distance_unit public.distance_unit not null default 'km',
  default_timeline public.timeline_mode not null default 'now',
  reduce_motion boolean not null default false,
  saved_reminders boolean not null default true,
  nearby_alerts boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.planned_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  organizer_name text not null check (char_length(organizer_name) between 2 and 80),
  title text not null check (char_length(title) between 3 and 140),
  description text not null check (char_length(description) between 8 and 4000),
  category public.event_category not null,
  image_path text,
  venue_name text not null check (char_length(venue_name) between 2 and 160),
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  starts_at timestamptz not null,
  ends_at timestamptz,
  is_recurring_template boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.live_posts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  caption text not null check (char_length(caption) between 8 and 280),
  place_name text not null check (char_length(place_name) between 2 and 160),
  category public.event_category not null,
  image_path text not null,
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  posted_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '4 hours'),
  created_at timestamptz not null default now(),
  constraint live_expiry_after_post check (expires_at > posted_at)
);

create table public.event_saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);

create index planned_events_public_time_idx on public.planned_events (is_published, starts_at);
create index planned_events_owner_idx on public.planned_events (owner_id, starts_at);
create index live_posts_expiry_idx on public.live_posts (expires_at);
create index live_posts_owner_idx on public.live_posts (owner_id, posted_at desc);
create index event_saves_user_idx on public.event_saves (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.planned_events enable row level security;
alter table public.live_posts enable row level security;
alter table public.event_saves enable row level security;

create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "planned_events_public_read" on public.planned_events for select to anon, authenticated using (is_published or (select auth.uid()) = owner_id);
create policy "planned_events_insert_own" on public.planned_events for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "planned_events_update_own" on public.planned_events for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "planned_events_delete_own" on public.planned_events for delete to authenticated using ((select auth.uid()) = owner_id);
create policy "live_posts_public_read" on public.live_posts for select to anon, authenticated using (expires_at > now());
create policy "live_posts_insert_own" on public.live_posts for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "live_posts_delete_own" on public.live_posts for delete to authenticated using ((select auth.uid()) = owner_id);
create policy "event_saves_select_own" on public.event_saves for select to authenticated using ((select auth.uid()) = user_id);
create policy "event_saves_insert_own" on public.event_saves for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "event_saves_delete_own" on public.event_saves for delete to authenticated using ((select auth.uid()) = user_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('event-media', 'event-media', true, 8388608, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "event_media_public_read" on storage.objects for select to public using (bucket_id = 'event-media');
create policy "event_media_insert_own_folder" on storage.objects for insert to authenticated with check (bucket_id = 'event-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "event_media_update_own_folder" on storage.objects for update to authenticated using (bucket_id = 'event-media' and (storage.foldername(name))[1] = (select auth.uid())::text) with check (bucket_id = 'event-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "event_media_delete_own_folder" on storage.objects for delete to authenticated using (bucket_id = 'event-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
