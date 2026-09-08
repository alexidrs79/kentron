create or replace function public.organizer_public(ids uuid[])
returns table (id uuid, display_name text, avatar_url text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.display_name, p.avatar_url
  from public.profiles p
  where p.id = any (ids)
    and exists (
      select 1
      from public.planned_events e
      where e.owner_id = p.id
        and e.is_published
    );
$$;

revoke all on function public.organizer_public(uuid[]) from public;
grant execute on function public.organizer_public(uuid[]) to anon, authenticated;

create or replace function public.is_staff()
returns boolean
language sql
stable
as $$
  select coalesce(
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'staff',
    false
  );
$$;

drop policy if exists "content_reports_staff_select" on public.content_reports;
drop policy if exists "content_reports_staff_update" on public.content_reports;

create policy "content_reports_staff_select"
on public.content_reports for select to authenticated
using (public.is_staff());

create policy "content_reports_staff_update"
on public.content_reports for update to authenticated
using (public.is_staff())
with check (public.is_staff());

create or replace function public.enforce_live_post_rate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(*)
    from public.live_posts
    where owner_id = new.owner_id
      and posted_at > now() - interval '4 hours'
  ) >= 8 then
    raise exception 'Live post limit reached';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_live_post_rate on public.live_posts;
create trigger enforce_live_post_rate
before insert on public.live_posts
for each row execute procedure public.enforce_live_post_rate();

create or replace function public.enforce_event_rate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(*)
    from public.planned_events
    where owner_id = new.owner_id
      and created_at > now() - interval '24 hours'
  ) >= 12 then
    raise exception 'Event publish limit reached';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_event_rate on public.planned_events;
create trigger enforce_event_rate
before insert on public.planned_events
for each row execute procedure public.enforce_event_rate();
