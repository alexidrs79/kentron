create or replace function public.clean_deleted_event_saves()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  delete from public.event_saves where event_id = old.id::text;
  return old;
end;
$$;

revoke execute on function public.clean_deleted_event_saves()
  from public, anon, authenticated;

create trigger on_planned_event_deleted
after delete on public.planned_events
for each row execute procedure public.clean_deleted_event_saves();
