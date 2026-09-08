alter table public.profiles
  add column if not exists activity_read_ids text[] not null default '{}';
