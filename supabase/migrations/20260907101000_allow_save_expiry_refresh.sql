create policy "event_saves_update_active_own"
on public.event_saves for update to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and (
    (content_type = 'event' and expires_at is null)
    or
    (content_type = 'live' and expires_at > now())
  )
);
