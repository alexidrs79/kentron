# Kentron

[![CI](https://github.com/alexidrs79/kentron/actions/workflows/ci.yml/badge.svg)](https://github.com/alexidrs79/kentron/actions/workflows/ci.yml)

**Live:** [https://kentron-yerevan.vercel.app](https://kentron-yerevan.vercel.app)

A map-first public guide to what is happening in Yerevan. Two timelines stay
separate: anonymous live posts that fade after four hours, and organiser
events planned for this week.

Stack: Next.js 15, React 19, Tailwind 4, MapLibre, Supabase Auth/Postgres/Storage.

## Local

```bash
cp .env.example .env.local
# fill the Supabase values
npm install
npm run dev
```

Requires Node 22.

## Deploy (Vercel)

Framework **Next.js**. Root **.**. Build **`next build`**. Node **22**.

1. Import this GitHub repo in Vercel. Leave the defaults; do not set a custom
   server or static export.
2. Paste these environment variables into **Production** and **Preview**:

   - `NEXT_PUBLIC_SITE_URL` — production https origin, no trailing slash
     (currently `https://kentron-yerevan.vercel.app`)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     from the Vercel Supabase integration — the app accepts either)
   - `SUPABASE_SERVICE_ROLE_KEY` — server-only
   - `NEXT_PUBLIC_CARTO_API_KEY` — if the map still uses CARTO tiles
   - `NEXT_PUBLIC_USE_FIXTURES=false`

3. Deploy. Keep `NEXT_PUBLIC_SITE_URL` in sync with the public origin.
4. In **Supabase → Authentication → URL configuration**:
   - Site URL = the same origin as `NEXT_PUBLIC_SITE_URL`
   - Redirect URLs include `{SITE_URL}/auth/callback` and
     `{SITE_URL}/reset-password`

Do not commit `.env.local` or the service role key.
