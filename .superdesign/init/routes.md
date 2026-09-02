# Routes

Framework: Next.js 15 App Router. Every route uses `app/layout.tsx` and `components/app-shell.tsx`.

- `/` — `app/page.tsx` — interactive dusk map, time toggle, location overlay.
- `/search` — `app/search/page.tsx` — Phase placeholder.
- `/create` — `app/create/page.tsx` — Phase placeholder.
- `/saved` — `app/saved/page.tsx` — Phase placeholder.
- `/profile` — `app/profile/page.tsx` — Phase placeholder.
- `/event/[id]` — `app/event/[id]/page.tsx` — planned-event placeholder.
- `/post/[id]` — `app/post/[id]/page.tsx` — live-post placeholder.

There is no separate router configuration; routing is filesystem-based.
