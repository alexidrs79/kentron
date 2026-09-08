-- Live posts are publicly anonymous. Two holes made that untrue:
--   1. The public SELECT policy was row-level only, so anybody holding the
--      publishable key could read live_posts.owner_id and name every author.
--   2. Uploaded live media sat under `<auth.uid()>/live/...` in a public
--      bucket, so the image URL alone identified the author.
-- This migration closes both and stops the 4-hour window being forged.

-- 1. Public reads go through a view that cannot expose the author.
-- Deliberately NOT security_invoker: the view runs as its owner so it can
-- serve anonymous readers while the base table stays owner-only below.
create or replace view public.live_posts_public as
select
  id,
  caption,
  place_name,
  category,
  image_path,
  lat,
  lng,
  posted_at,
  expires_at
from public.live_posts
where expires_at > now();

revoke all on public.live_posts_public from public;
grant select on public.live_posts_public to anon, authenticated;

-- 2. The table itself is now readable only by the author, who still needs
-- their own expired rows for the organiser desk and data export.
drop policy if exists "live_posts_public_read" on public.live_posts;
drop policy if exists "live_posts_public_or_owner_read" on public.live_posts;

create policy "live_posts_owner_read" on public.live_posts
  for select to authenticated
  using ((select auth.uid()) = owner_id);

-- The view above runs as its owner. Stating this explicitly means the public
-- feed does not depend on that role happening to hold BYPASSRLS.
drop policy if exists "live_posts_view_owner_read" on public.live_posts;
create policy "live_posts_view_owner_read" on public.live_posts
  for select to postgres
  using (true);

-- 3. Live media moves to an opaque per-object path so the public URL carries
-- no account identifier. Events and avatars stay under the owner folder:
-- those are attributed on purpose.
drop policy if exists "event_media_insert_anonymous_live" on storage.objects;
create policy "event_media_insert_anonymous_live" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'event-media'
    and (storage.foldername(name))[1] = 'live'
  );

-- 4. Posting time and lifetime are server facts, not client input. Without
-- this a crafted insert could backdate posted_at past the rate window or set
-- expires_at years out, keeping an "ephemeral" post public forever.
create or replace function public.stamp_live_post_window()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.posted_at := now();
  new.expires_at := now() + interval '4 hours';
  return new;
end;
$$;

revoke execute on function public.stamp_live_post_window() from public, anon, authenticated;

drop trigger if exists stamp_live_post_window on public.live_posts;
create trigger stamp_live_post_window
before insert on public.live_posts
for each row execute procedure public.stamp_live_post_window();

create or replace function public.stamp_event_created_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.created_at := now();
  return new;
end;
$$;

revoke execute on function public.stamp_event_created_at() from public, anon, authenticated;

drop trigger if exists stamp_event_created_at on public.planned_events;
create trigger stamp_event_created_at
before insert on public.planned_events
for each row execute procedure public.stamp_event_created_at();

-- 5. Rate limits counted live rows, so deleting content reset the window.
-- An append-only log makes the limit mean what it says.
create table if not exists public.content_creation_log (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('live', 'event')),
  created_at timestamptz not null default now()
);

create index if not exists content_creation_log_owner_idx
  on public.content_creation_log (owner_id, kind, created_at desc);

-- No policies: only the security-definer trigger functions below touch this.
alter table public.content_creation_log enable row level security;

create or replace function public.enforce_live_post_rate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(*)
    from public.content_creation_log
    where owner_id = new.owner_id
      and kind = 'live'
      and created_at > now() - interval '4 hours'
  ) >= 8 then
    raise exception 'Live post limit reached';
  end if;

  insert into public.content_creation_log (owner_id, kind)
  values (new.owner_id, 'live');
  return new;
end;
$$;

create or replace function public.enforce_event_rate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(*)
    from public.content_creation_log
    where owner_id = new.owner_id
      and kind = 'event'
      and created_at > now() - interval '24 hours'
  ) >= 12 then
    raise exception 'Event publish limit reached';
  end if;

  insert into public.content_creation_log (owner_id, kind)
  values (new.owner_id, 'event');
  return new;
end;
$$;

-- Seed the log from existing rows so current holdings still count.
insert into public.content_creation_log (owner_id, kind, created_at)
select owner_id, 'live', posted_at from public.live_posts
union all
select owner_id, 'event', created_at from public.planned_events
on conflict do nothing;
