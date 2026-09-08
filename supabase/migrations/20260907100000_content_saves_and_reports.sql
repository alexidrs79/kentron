alter table public.event_saves
  add column content_type text not null default 'event'
    check (content_type in ('event', 'live')),
  add column expires_at timestamptz,
  add constraint event_saves_expiry_matches_type check (
    (content_type = 'event' and expires_at is null)
    or
    (content_type = 'live' and expires_at is not null)
  );

alter table public.event_saves
  drop constraint event_saves_user_id_event_id_key;

alter table public.event_saves
  add constraint event_saves_user_content_key
  unique (user_id, content_type, event_id);

drop policy if exists "event_saves_select_own" on public.event_saves;
drop policy if exists "event_saves_insert_own" on public.event_saves;

create policy "event_saves_select_active_own"
on public.event_saves for select to authenticated
using (
  (select auth.uid()) = user_id
  and (expires_at is null or expires_at > now())
);

create policy "event_saves_insert_active_own"
on public.event_saves for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and (
    (content_type = 'event' and expires_at is null)
    or
    (content_type = 'live' and expires_at > now())
  )
);

create table public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  content_type text not null check (content_type in ('event', 'live')),
  content_id text not null,
  reason text not null check (
    reason in ('spam', 'misleading', 'unsafe', 'inappropriate', 'other')
  ),
  details text check (details is null or char_length(details) <= 500),
  status text not null default 'pending'
    check (status in ('pending', 'reviewed', 'actioned', 'dismissed')),
  created_at timestamptz not null default now(),
  unique (reporter_id, content_type, content_id)
);

create index content_reports_review_idx
  on public.content_reports (status, created_at);

alter table public.content_reports enable row level security;

create policy "content_reports_select_own"
on public.content_reports for select to authenticated
using ((select auth.uid()) = reporter_id);

create policy "content_reports_insert_own"
on public.content_reports for insert to authenticated
with check (
  (select auth.uid()) = reporter_id
  and status = 'pending'
);

drop trigger if exists on_planned_event_deleted on public.planned_events;
drop function if exists public.clean_deleted_event_saves();

create or replace function public.clean_deleted_content_saves()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.event_saves
  where event_id = old.id::text
    and content_type = case
      when tg_table_name = 'live_posts' then 'live'
      else 'event'
    end;
  return old;
end;
$$;

revoke execute on function public.clean_deleted_content_saves()
  from public, anon, authenticated;

create trigger on_planned_event_deleted
after delete on public.planned_events
for each row execute procedure public.clean_deleted_content_saves();

create trigger on_live_post_deleted
after delete on public.live_posts
for each row execute procedure public.clean_deleted_content_saves();
