# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People in Yerevan who are deciding what to do nearby now or later this week. Organizers are a secondary audience who publish planned events and manage saved places.

## Product Purpose

Kentron is a map-first guide to nearby activity. It helps someone standing in the city decide whether a live moment is worth walking to now, or find and save a planned event for later in the week.

## Positioning

Kentron separates two timelines that other local guides often blend: anonymous ephemeral live posts that fade after a few hours, and organizer-published planned events. Both can be saved while they remain relevant.

## Operating Context

The primary scene is mobile use on a Yerevan sidewalk, often at blue hour or night. Desktop supports broader map exploration, event creation, and account management. Map and list are coordinated views of the same local activity.

## Capabilities and Constraints

- “Right now” contains publicly anonymous live posts with a photo, caption, category, location, and age. Creating one requires an account so its owner can manage it, but no profile is exposed on the post. Live posts can be saved only for their remaining live window and leave Saved at expiry. Age is the live signal; detail pages offer Directions and Open on map instead of a “still here” confirmation.
- “This week” contains planned organizer events with time, venue, details, and save behavior.
- Primary navigation is Map, Search, Create, Saved, Profile; Create is emphasized. Activity and About are reachable from Profile; Settings sits at the bottom of the desktop rail.
- The home map has collapsible desktop navigation and results panels plus a three-state mobile sheet. Results follow the visible map area. Category filtering lives in the bottom-left map key.
- Planned event lists group by day. Live posts stay in a single age-sorted list. Distances appear only after location is granted, measured from the device, never from the map centre.
- Pin selection opens a preview and synchronizes with the matching list row.
- Settings cover appearance (System / Dark / Light), the opening timeline, distance units, a reduced-motion override, and activity sources.
- Activity is derived from account-owned saved events and fresh public live posts across Yerevan. Read state syncs to the account. There are no push notifications and no email.
- Browsing is public. Creating planned events, posting live, saving, and reporting require a signed-in account.
- Saves, reports, created content, preferences, and activity read state are account-owned Supabase rows protected by row-level security and available across devices. Images live in the owner’s Supabase Storage folder.
- The application uses Next.js 15 App Router, Tailwind CSS v4, MapLibre, Supabase Auth/Postgres/Storage, and Lucide.

## Brand Commitments

- Product name and Armenian wordmark: `Կենտրոն`.
- The product must feel local to Yerevan rather than like a generic travel guide or dashboard.
- Fallback event art uses one warm painterly Yerevan illustration family; community uploads remain untouched. The map uses a dusk basemap in dark mode and a warm day basemap in light mode.
- Preserve one coherent locator-pin language: a single-piece category-colored silhouette carrying the same Lucide pictogram geometry as the interface. Live adds a soft ground glow; planned stays still.
- Do not use IBM Plex Mono or category chips in map result rows.

## Evidence on Hand

- Local fixture content in `lib/map/fixtures.ts`.
- Existing local illustrations under `public/illustrations/`.
- Existing implemented routes and interactions are the source of truth for current functionality.
- No testimonials, customers, benchmarks, pricing, or commercial claims are available; do not fabricate them.

## Product Principles

1. Time is the primary organizing concept; never merge live and planned activity into one feed.
2. The map is the product’s brightest and most important surface.
3. Local context must be legible within seconds while someone is moving through the city.
4. Creation reveals only the fields relevant to the chosen timeline.
5. Expression may never obscure state, location, or familiar map affordances.
