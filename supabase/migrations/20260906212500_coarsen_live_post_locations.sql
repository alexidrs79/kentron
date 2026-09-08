create or replace function public.coarsen_live_post_coordinates()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Roughly a 100 m grid in Yerevan: useful for a public-place pin without
  -- retaining device-level coordinates when a client bypasses the UI.
  new.lat := round(new.lat::numeric, 3)::double precision;
  new.lng := round(new.lng::numeric, 3)::double precision;
  return new;
end;
$$;

revoke execute on function public.coarsen_live_post_coordinates()
  from public, anon, authenticated;

drop trigger if exists coarsen_live_post_coordinates
  on public.live_posts;

create trigger coarsen_live_post_coordinates
before insert or update of lat, lng on public.live_posts
for each row execute procedure public.coarsen_live_post_coordinates();

update public.live_posts
set lat = round(lat::numeric, 3)::double precision,
    lng = round(lng::numeric, 3)::double precision;
