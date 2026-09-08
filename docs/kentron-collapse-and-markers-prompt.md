# Kentron — collapse chrome, quieter list, unified map pins

You are a senior product designer and frontend design engineer working in the Kentron Next.js app. This is a focused follow-up to the existing redesign, not a new product. Audit the current home map, implement the changes below, and verify at desktop and mobile.

Do not invent extra features. Keep dusk palette, Armenian wordmark, Lucide outlines, MapLibre map, pin-click preview popup, and the Right now / This week split.

## What is wrong today

1. The left app rail (`AppShell`, ~208px) and the right results panel (`ViewportPanel`, ~380px) are always fully open on desktop. There is no bottom collapse control like a normal map or IDE sidebar. The list’s header chevron does not shrink the column. On mobile, the sheet handle cycles height but does not feel like a real collapse/expand control, and the left rail is replaced by a bottom nav with no related “give me more map” gesture besides the sheet.

2. Planned-event rows show Tech / Creative / Market chips: pill + tiny square/diamond/circle. They look like generated dashboard tags. They steal attention from title, venue, and time.

3. Map markers do not belong to one family.
   - Live: apricot circle + looping pulse ring.
   - Planned: large canvas symbols — rounded square, diamond, circle — with a heavy ararat outline. They read as clip-art, not map dots.
   Modes never mix on the map, so the two languages do not need to be this different. Unify the pin system. Kill the geometric planned icons.

4. The “Kentron, Yerevan” location chip sits under the time toggle on the top-left of the map. Move it to the top-right of the map column, flush against the results panel edge, so it reads as a place label next to the list, not a second header under the toggle.

5. IBM Plex Mono is used for metadata, eyebrows, coords, counts, ages, and the Yerevan clock. It looks technical and off-brand next to Inter and Bricolage Grotesque. Stop using it in the product UI.

## Desktop: collapsible rails

Treat left nav and right list as a pair of docked sidebars with a **bottom edge control**.

### Left app rail

- Expanded: keep ~208–224px. Brand, labeled nav, Create emphasis, Yerevan clock.
- Collapsed: ~64–72px icon rail. Wordmark hides; pin mark remains. Nav is icon-only with `aria-label` / tooltip. Create stays a filled tuff square. Clock can hide or become a compact time-only readout.
- Put a full-width control at the **bottom of the rail**, above the clock or replacing the clock row when collapsed: chevron / panel-left icon, 44px min target, label “Collapse menu” / “Expand menu”.
- Animate width 180–220ms ease-out. Respect `prefers-reduced-motion`.
- Persist in `localStorage` (`kentron-nav-collapsed`).
- Main content and the map must grow into the freed space. Use CSS grid on the shell (`64px | 1fr` vs `208px | 1fr`), not an overlay.

### Right results panel (home only)

- Expanded: 360–400px sibling column, current header + rows.
- Collapsed: a slim ~48–56px strip on the right edge of the home grid, still in the layout (not an overlay over the map). Show a vertical label or count (“9 events” / “7 live”) and the expand control. Do not keep truncated rows.
- Put the collapse control at the **bottom of the panel**, matching the left rail: “Collapse list” / “Expand list”.
- Remove the current header “toggle full results” button. Collapse is the only chrome change.
- Persist in `localStorage` (`kentron-list-collapsed`).
- When the list collapses, increase map camera right-padding to the slim strip width, not the old 380px. Keep zoom, legend, and popup inside the visible map.
- Pin popup still works when the list is collapsed. Opening a pin may expand the list, or keep it collapsed and only show the popup — pick one and use it consistently. Prefer: keep list collapsed; popup is enough. Expand is explicit.

Keyboard: both controls are focusable. `aria-expanded` required.

## Mobile

Do not fake desktop icon rails.

- Keep the bottom nav. Do not add a second left drawer unless it is a single “more map” pattern.
- Results sheet stays a bottom sheet with **three explicit snaps**: collapsed (handle + title + count only, map-first), half (a few rows), expanded (list-first).
- Replace the tiny unlabeled handle-only cycle with:
  - the existing drag handle, **and**
  - a bottom-of-sheet text/icon button: “Show map” when expanded/half, “Show list” when collapsed.
- Collapsed sheet height must leave the map, time toggle, locate, and Kentron chip fully usable.
- Map padding bottom tracks sheet height.
- Left nav does not collapse on mobile; the bottom nav is the compact form.

## Location chip

- Move “Kentron, Yerevan” (+ coords or locate status) to **top-right of the map column**.
- Sit 12–16px from the map’s right edge, which is the left edge of the results panel (or the collapsed strip).
- Vertically align with the time toggle row on the top-left.
- Locate stays a compact button: either beside the time toggle (current) **or** as an icon on the Kentron chip. Do not duplicate locate.
- Never overlap the panel header. When the list is collapsed, the chip stays in the map, just left of the slim strip.

## List rows: no category chips

- Delete the Tech / Creative / Market pill from `PlaceRow` in the home list (and search/saved/profile if they copy the same chip).
- Row content: identity mark, two-line title, one meta line (`venue · time` or `place · age`).
- Category can appear in the pin popup and on the detail page, as plain sentence-case text in the meta row — not a colored SaaS badge.
- Do not encode category with a decorative mini-shape next to the title.
- Keep selected state structural (rail / background), not a chip.

## Unified map markers

Design **one pin family**. Live and planned are the same object with one behavioral difference.

### Shared form

- Small circular dot, ~10–12px core, 2px dusk stroke, slight lift shadow.
- Clusters stay dusk discs with a paper count. Same cluster language in both modes.
- Hover/selected: slightly larger core or a quiet static halo. No bounce.

### Live (`Right now`)

- Core: apricot.
- Optional pulse ring, 1800ms, low opacity, only if `prefers-reduced-motion` is false.
- Opacity may still fade with age.

### Planned (`This week`)

- **Same circle**, not squares or diamonds. Remove `markerImage()` category symbols entirely.
- Core: paper or a single muted pin color (one color for all planned events is acceptable; if category color is kept, it is a fill on the **same circle**, never a different geometry).
- No pulse. Stillness is how scheduled reads as planned.
- Selected: same halo language as live.

### What not to do

- Do not keep diamond / rounded-square markers.
- Do not use pins that look like Google Maps teardrops if they fight the dusk UI — a dot is enough.
- Do not put category shapes on the map. Category is secondary copy, not a marker type.
- Do not show live and planned pins at once.

Update the map legend to match: Live now = pulsing apricot dot; This week = static dot. Drop the three geometric keys, or replace them with one “Planned event” key.

## Type: drop IBM Plex Mono

Plex Mono was specified for “time, distance, counts, coordinates.” That choice is rejected. It makes labels feel like a terminal or a fintech dashboard.

- Remove `font-mono` / `--font-ibm-plex-mono` from all product copy: list meta, panel eyebrows, counts, location coords, clock, form hints, page eyebrows, popup meta, auth/profile/saved/search/create, 404.
- Use Inter (`font-sans`) for that copy. Keep size and color hierarchy (11–12px, `paper-2`) so it still reads as secondary, not as code.
- Keep Bricolage Grotesque for titles only.
- Keep Noto Sans Armenian for Armenian script.
- Do not replace Plex with another monospace (JetBrains, Space Mono, etc.).
- MapLibre attribution may stay a system/sans small caption; do not restyle it in Plex.
- You may unload the IBM Plex Mono font from `app/layout.tsx` if nothing else needs it.
- `tabular-nums` on Inter is fine for the clock and counts if alignment matters.

## Accessibility

- Collapse buttons: 44px, visible focus, `aria-expanded`, `aria-controls`.
- Collapsed nav: every destination still reachable by name.
- Category is not required on the map because modes are exclusive; if category color remains on planned dots, do not rely on color alone in the list — the title and venue carry the row.
- Reduced motion: no width bounce, no pulse, instant sidebar snap allowed.

## Files likely to change

- `components/app-shell.tsx` — collapsible left rail
- `app/page.tsx` — home grid tracks list collapsed width
- `app/viewport-panel.tsx` — bottom collapse, mobile Show map / Show list
- `app/map-controls.tsx` — relocate Kentron chip
- `app/map-canvas.tsx` — camera padding for collapsed list
- `app/map-legend.tsx` — unified key
- `lib/map/marker-layers.ts` — circular planned dots; delete canvas shapes
- `components/place-row.tsx` — remove chips
- `app/globals.css` — sidebar width transition, zoom/legend offsets for collapsed list; popup/meta fonts
- `app/layout.tsx` — drop unused Plex Mono font if safe
- Any `font-mono` usage in `app/` and `components/`

## Verify

1. Desktop 1440 and 1920: collapse left, collapse right, both, expand both. Map fills the gap. Zoom and legend never sit under a panel.
2. Reload: collapse preferences persist.
3. Click a planned pin: circular marker, popup, no diamond/square.
4. Toggle to Right now: apricot dots with pulse; same size family.
5. List rows: no Tech/Creative/Market pills.
6. Kentron, Yerevan sits top-right against the list.
7. Mobile 390: Show map / Show list; collapsed sheet; bottom nav unchanged.
8. Keyboard through collapse controls; Escape still closes the pin popup.
9. No IBM Plex Mono on screen: list meta, clock, coords, eyebrows, and popup all use Inter.

## Out of scope

- Wiring map data to the database (Phase 7).
- Restyling Search, Create, Profile, Auth beyond shared row chips if they reuse `PlaceRow`, except replacing `font-mono` with Inter wherever it appears.
- New color palette or a new third typeface. Inter + Bricolage + Noto Armenian only.
