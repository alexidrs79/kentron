# Kentron design system

## Product

Kentron is a map-first guide to what is happening in Yerevan. It has two distinct time states presented through one segmented control: “Right now” for ephemeral live posts and “This week” for planned events. The interface must feel geographic and local, not like a social feed or generic event SaaS.

Phase 1 covers only the responsive application shell, navigation, typography, color tokens, and a working custom dusk map. Do not add event cards, markers, creation forms, database UI, or later-phase features.

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
- Armenian-script text must explicitly fall back to Inter because Bricolage Grotesque does not provide dependable Armenian coverage.
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

The base map must be a real interactive MapLibre map using an open raster source, with CSS-level dusk treatment and a dusk background visible while tiles load. Prefer a desaturated, low-contrast result that leaves room for future markers. Attribution remains visible but subdued and accessible.

No pins, clusters, legend, sheets, or data overlays in Phase 1.

## Motion and accessibility

- Use 160–220ms transitions for navigation and segmented control state.
- Respect `prefers-reduced-motion`.
- Maintain visible keyboard focus and at least 44px mobile tap targets.
- Never depend on color alone for selected navigation: combine color with shape, fill, or label treatment.
- Ensure primary text reaches accessible contrast against dusk and surface.

## Copy

Direct, local, and restrained. No emoji, exclamation-heavy language, or filler. Use real Yerevan place language where a label is needed. Avoid fake event content in Phase 1.
