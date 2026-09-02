# Kentron design system

## Product

Kentron is a map-first guide to what is happening in Yerevan. It has two distinct time states presented through one segmented control: “Right now” for ephemeral live posts and “This week” for planned events. The interface must feel geographic and local, not like a social feed or generic event SaaS.

Phase 4 is the create flow only: one branching question, a short live-post form, a fuller planned-event form, and map-pin placement. State stays fake and local. Do not add illustrations, database, auth, or later-phase features.

## Visual direction

Use restrained cinematic depth: a full-bleed dark map, crisp high-contrast type, hairline borders, and minimally translucent floating controls. Adapt only these depth principles from the cinematic style reference. Do not use its black background, neon gradients, huge uppercase typography, glass-heavy cards, or decorative 3D effects.

The map is the visual field. UI chrome should feel deliberately placed over it rather than boxed into a dashboard. Keep the composition editorial and compact, with breathing room and clear map visibility.

## Color

- Dusk `#23283B`: base background and map atmosphere; never use flat black.
- Surface `#2C3247`: panels and floating controls.
- Paper `#F4EFE9`: primary text.
- Paper 2 `#9A9AAE`: metadata and secondary text.
- Line `#3A3F56`: hairlines and quiet borders.
- Tuff `#D46A5C`: primary action and active state.
- Apricot `#E8A23D`: live signal and saved state; use sparingly.
- Ararat `#EDEFF2`: snow-cap highlight, map outlines, and loading only.
- Pin tech `#6E8FBF`, pin creative `#B87FA8`, pin market `#7FA87A`: reserved for later planned-event markers.

No gradients. Shadows should be broad and low-opacity, used only to separate floating controls from the map.

## Typography

- Display and Latin-script headings: Bricolage Grotesque, weights 600–700.
- UI and body: Inter.
- Time, distance, counts, coordinates, and compact status labels: IBM Plex Mono with tabular figures.
- Armenian-script text uses Noto Sans Armenian because neither Bricolage Grotesque nor Inter includes Armenian glyphs.
- Sentence case everywhere. Never use all-caps labels.

Phase 1 should visibly demonstrate all three families in purposeful content.

## Shell and navigation

Desktop uses a narrow left rail with brand at the top, the five primary destinations in the middle, and a quiet Armenia-time readout near the bottom. Navigation order: Map, Search, Create, Saved, Profile. Create is emphasized with a filled tuff button, but remains part of the same rail.

Mobile uses a fixed bottom navigation with the same order. Create is centered and raised slightly above the bar. Maintain a comfortable safe-area inset.

The home route is a full viewport map. A compact top overlay includes the “Right now / This week” segmented control and a location label reading “Kentron, Yerevan.” It should not imply that the modes are merged.

Other Phase 1 routes may render restrained shell placeholders that confirm routing and typography only. Do not scaffold route-specific features.

## Components

- Floating controls: surface color at high opacity, 1px line border, 16–18px radius.
- Segmented control: dusk track; active segment uses paper background with dusk text. Do not use a gradient.
- Icons: simple outlined Lucide icons with a consistent 1.75px stroke.
- Brand treatment: the Armenian word “Կենտրոն” with a small tuff location-center symbol; no invented logo illustration.
- Focus rings: 2px tuff with an offset against dusk.

## Map

The base map is a real interactive MapLibre map with a vector style recolored to the dusk palette. It uses CARTO Dark Matter when a local key exists and OpenFreeMap as the keyless fallback. Attribution remains visible but subdued and accessible.

Phase 2 marker rules:

- Live pulses are always apricot, never category-colored. They use a circular center with a clearly visible pulse ring and fade modestly with age.
- Planned events use exactly three category colors: tech blue, creative violet, and market green.
- Category markers must differ by shape as well as color: rounded square for tech, diamond for creative, and circle for market.
- Clusters use compact dusk circles with paper counts and a quiet ararat outline. Do not mix live and planned records in one active source.
- The legend is a compact floating button by default and expands into four keys: live pulse plus the three planned categories.
- Markers and legend must remain readable without introducing cards, labels, or a feed in this phase.

Phase 3 list rules:

- Mobile: a bottom sheet over the map, synced to the current viewport. Desktop: a matching side panel on the right.
- The list shows only items currently inside the map bounds for the active toggle. Panning updates the list.
- Live rows: initial-circle, caption, place, age in Plex Mono. Planned rows: initial-circle, title, venue, category chip in sentence case.
- Empty live: “Quiet right now near you. Be the first to post.” with a tuff Create action. Empty week: “Nothing planned yet near you. Be the first to post.” Same action. Invitation, not apology. No emoji, no illustrations yet.
- The event/pulse row is one shared component, reused later on Saved.

Phase 4 create rules:

- One Create destination. First screen asks only “Happening now, or planned for later?” as two large, clearly different tappable cards, not a dropdown or tabs-as-the-first-choice.
- Happening now stays short: required photo, short character-limited caption, category, drag-to-place pin, post. Completable in under a minute. No extra fields.
- Planned for later: title, category, date/time in Armenia time, venue with pin placement plus optional address suggestions, description, optional photo, optional weekly-meetup flag that saves a reusable draft rather than an automated series.
- Live pins on the picker are apricot. Planned pins follow the three category shapes/colors. No illustrations on the branch screen yet.

## Motion and accessibility

- Use 160–220ms transitions for navigation and segmented control state.
- Respect `prefers-reduced-motion`.
- Maintain visible keyboard focus and at least 44px mobile tap targets.
- Never depend on color alone for selected navigation: combine color with shape, fill, or label treatment.
- Ensure primary text reaches accessible contrast against dusk and surface.

## Copy

Direct, local, and restrained. No emoji, exclamation-heavy language, or filler. Use real Yerevan place names. Seed copy must sound local, never “Event Title Here.”
