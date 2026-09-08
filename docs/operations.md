# Kentron operations

Contact: hello@kentron.am

## Reports

Pending reports live in `public.content_reports`.

```sql
select id, content_type, content_id, reason, details, created_at
from public.content_reports
where status = 'pending'
order by created_at;
```

Staff accounts have `app_metadata.role = 'staff'` and can use `/admin/reports`.

To take a live post down:

```sql
delete from public.live_posts where id = '<id>';
update public.content_reports
set status = 'actioned'
where content_type = 'live' and content_id = '<id>';
```

To unpublish an event:

```sql
update public.planned_events
set is_published = false, updated_at = now()
where id = '<id>';
update public.content_reports
set status = 'actioned'
where content_type = 'event' and content_id = '<id>';
```

## Auth URLs

Production Site URL must match `NEXT_PUBLIC_SITE_URL`.

Redirect URLs:

- `{SITE_URL}/auth/callback`
- `{SITE_URL}/reset-password`

Enable leaked password protection and email confirmation before public launch.

## Vercel

Create the project from this repo. Set:

- `NEXT_PUBLIC_SITE_URL` — the public origin, no trailing slash
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, never `NEXT_PUBLIC_`
- `NEXT_PUBLIC_CARTO_API_KEY` if using CARTO tiles
- `NEXT_PUBLIC_USE_FIXTURES=false`

After the first deploy, copy the production origin into Supabase Auth Site URL and Redirect URLs.

Staff users need `app_metadata.role = "staff"` in Auth.

## Fixtures

Keep `NEXT_PUBLIC_USE_FIXTURES=false` in production.

## Backups

Use Supabase point-in-time recovery on the paid plan. Document restore steps before deleting user data in bulk.
