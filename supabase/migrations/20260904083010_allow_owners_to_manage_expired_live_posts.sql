drop policy if exists "live_posts_public_read" on public.live_posts;

create policy "live_posts_public_or_owner_read" on public.live_posts
  for select to anon, authenticated
  using (expires_at > now() or (select auth.uid()) = owner_id);
