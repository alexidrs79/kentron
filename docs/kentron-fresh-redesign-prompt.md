# Kentron — complete UI/UX replacement prompt

You are implementing a **full visual-world replacement** for Kentron, not a polish pass on the current dusk dashboard. Product truth stays. The current look is **anti-reference**.

Load and follow these project skills, in this order, and ignore the rest of the installed skill pack:

1. **impeccable** — Operate mode. Replacement world via `reference/new-work.md`. Run `node .cursor/skills/impeccable/scripts/context.mjs --target app/page.tsx` once. Load `reference/craft-floor.md` immediately before editing UI. Write `DESIGN.md` at the end of the build, not before.
2. **redesign-skill** — Scan/diagnose/fix sequence. Kill generic AI fingerprints. Keep the existing Next.js + Tailwind v4 stack; do not introduce a new CSS framework or a component library.
3. **emil-design-eng** — Unseen details, press states, springs, interruption, reduced motion. Motion must survive that skill’s review table.
4. **animate** — Build only the motions that pass the frequency gate. Pair with **review-animations** after implementation. Use **find-animation-opportunities** only as a checklist, not as a license to animate everything.
5. **taste-skill** — Anti-slop rules only on non-map surfaces (auth, create branch, empty states, 404). Do **not** treat the home map as a landing page.

Do **not** load: `write-swift`, `apple-design`, `animate-expo`, `prototype`, `pick-ui-library`, `imagegen-frontend-mobile`, `brutalist-skill` / `minimalist-skill` / `soft-skill` as whole-app skins, `stitch-skill`, `gpt-tasteskill`, `taste-skill-v1`.

If Mobbin MCP is available, search real map+list, event discovery, and save/profile flows (Airbnb, Citymapper, Resident Advisor, Partiful, Apple Maps) and steal **interaction structure**, not their branding.

---

## Product truth (do not change)

Kentron is a map-first guide to what is happening **in Kentron, Yerevan**.

Two time modes, never merged:

- **Right now** — anonymous live posts. Ephemeral. Fade with age. No RSVP, no save.
- **This week** — planned events from organizers. Open, save, revisit.

Primary nav, in this order, with Create emphasized:

1. Map  2. Search  3. Create  4. Saved  5. Profile

Keep:

- The Armenian wordmark `Կենտրոն`
- Noto Sans Armenian for Armenian text
- Existing local illustrations (Cascade, Vernissage, Republic Square empty). Do not regenerate or replace image files. Layout/CSS only.
- MapLibre dusk basemap and Carto/OpenFreeMap wiring
- Two timelines, fixture data, local-storage saved events, client-side create
- Collapsible left rail and collapsible results panel (desktop), three-state mobile sheet + Show map / Show list
- Pin click → preview popup + list highlight/scroll
- Unified **circular** map markers: apricot live (pulse + age fade) vs still paper planned. No category geometry on the map.
- No IBM Plex Mono. No Tech/Creative/Market chips in list rows.
- Location chip **top-right** of the map column, against the list.
- Auth illustration full-bleed with a dusk fade at the form seam.

Copy may be tightened. Do not invent capabilities, social proof, or backend features.

---

## Why the current UI must be replaced

The incumbent is a competent dark SaaS shell: navy canvas (`#23283B`), terracotta accent, Inter body, Bricolage Grotesque display, hairline borders, 2xl cards, Lucide outlines. That is the default “AI product UI” cluster. A redesign that keeps dusk + tuff + Inter + Bricolage and only restyles padding has failed.

Treat the current screenshots as evidence of **tasks and density**, not of color, type, radius, or chrome.

---

## Visual world (locked for this prompt)

**Scene:** someone standing on a Yerevan sidewalk at blue hour, phone in one hand, deciding whether to walk ten minutes. The interface is a city tool, not a fintech dashboard and not a tourism brochure.

**Color strategy:** Restrained. Neutrals plus **one** accent. Dark because the usage scene is night and the map is the light source.

Derive the palette from materials, not from the old tokens:

| Role | Material | Notes |
|---|---|---|
| Ground | Basalt / tuff ash | Cool, slightly dusty, not navy-purple `#23283B` |
| Raised chrome | Paper kiosk / painted metal | A step lighter than ground; no glassmorphism |
| Ink | Warm off-white | Readable on the map overlays |
| Mute | Dust | Secondary meta only |
| Accent | One stone-warm (apricot or oxidized copper — pick **one**, not both) | Live state, Create, primary buttons only |
| Map live | Same accent | Pulsing dot |
| Map planned | Ink/paper disc | Still, no pulse |

Ban: purple-blue AI gradients, neon on black, second accent, category-colored pins, Inter as display, IBM Plex / Space Grotesk / Outfit / Plus Jakarta as the “character” face.

**Type:** One display face with a point of view that is **not** Bricolage Grotesque, Inter, Syne, or Space Grotesk. Pair with a workhorse UI sans that is **not** Inter (Geist, Source Sans, or a similar quiet face is allowed for UI). Keep Noto Sans Armenian. Tabular numerals on clocks, coordinates, and counts. Display tracking tight; labels sentence-case, never mono all-caps.

**Chrome:** Less card, more overlay. Map is the page. UI sits on it like enamel on stone: few radii, shared 1px hairlines tinted with the ground, shadows hue-matched to the ground (never black). Vary radius: tighter on controls, softer only on the mobile sheet.

**Signature interaction:** Opening a pin feels like a paper slip lifting off the map (origin at the marker, `transform` + `opacity`, ease-out, ~180–220ms). Collapsing a rail is spatial (the map grows). List row hover is near-imperceptible. Do not animate mode toggle, nav clicks, or locate.

---

## Operate rules (impeccable + Emil)

Home is **Operate**. Scanability, native map affordances, and the real usage scene outrank expression. Brand lives in precise details: type, one accent, marker language, the wordmark.

Motion frequency gate:

| Thing | Decision |
|---|---|
| Nav, mode toggle, locate, collapse click | Instant or ≤80ms opacity. No enter/exit choreography |
| List hover / selected row | Near-imperceptible background/border |
| Mobile sheet snap, desktop rail width, pin popup | Standard spatial animation |
| Live marker pulse | Keep; it indicates state. Honor `prefers-reduced-motion` (static ring) |
| First-run empty “be the first” | Allowed a small amount of delight |

Always: `transform`/`opacity` only; named curves; `:active` press (`scale(0.97)`); visible `:focus-visible`; reduced-motion cut.

---

## Layout system

### Desktop

Keep the shell: collapsible left rail | main.

**Home** remains CSS grid siblings, not overlays:

`[minmax(0,1fr)_results]`

Results: ~360–400px expanded, ~56px collapsed strip with vertical count + expand. Camera padding must match the visible results width. Zoom, legend, and attribution stay inside the **map column**.

Map chrome:

- Top-left: Right now / This week
- Top-right: Kentron, Yerevan (+ coords on wide)
- Bottom-left: legend
- Bottom-right: zoom
- All offset for the mobile sheet via `--kentron-sheet`

**Non-map pages** must stop looking like a postcard in a void. Use a real reading column (max ~720–880px) **or** a defined split (form | sticky map preview on create). No giant display titles with 40vh of empty dusk around them.

### Mobile

Bottom tab bar stays. Map is full-bleed under a bottom sheet (`collapsed` / `half` / `full`). Handle + **Show map / Show list**. Safe-area padding. Do not stack the desktop rail.

---

## Route-by-route intent

### `/` Home

Map is the product. List is a quiet index: avatar/initial, title (2-line clamp), one meta line (place · time). Selected row: hairline accent bar, not a loud filled card. Popup: image, title, place, one meta line, one action. Live vs planned distinguished by marker + eyebrow color only.

### `/search`

Tool, not marketing. Sticky search, mode filter, neighborhood chips, results using the same row language as home. Empty and no-match states with one action.

### `/create`

Branch screen: two honest choices (live vs planned), not a feature grid. Forms: progressive sections, sticky submit, desktop sticky map pin preview. Live form stays short (caption, photo, pin).

### `/event/[id]` and `/post/[id]`

Editorial but operational: title, when/where, save (events only), directions, related nearby. Live posts: anonymous, age, still-here — no save.

### `/saved` and `/profile`

Use the width. Shortlist + empty state that is not a full-page illustration dump. Profile: logged-out vs logged-in, upcoming/past, stats as secondary.

### `/login` `/signup`

Keep full-bleed left illustration, `object-cover`, `object-position: 70% center`, dusk fade into the form. Restyle the form to the new type/palette. Mobile: cropped illustration header, then form.

### `not-found` / `error`

Same system. One illustration max, one primary action, one secondary.

---

## Implementation constraints

- Next.js 15 App Router, Tailwind v4 `@theme`, Lucide, MapLibre. No new UI kit.
- Replace tokens in `app/globals.css` and font loading in `app/layout.tsx`. Update every `font-display` / color class that encodes the old world.
- Reuse `PlaceRow`, `PageHeader`, `AppShell`, `ViewportPanel`, `MapControls`, `MapLegend`, `AuthPage`. Restyle them; do not fork parallel components.
- Do not revert unified circular markers or category chips in rows.
- Do not add IBM Plex Mono back.
- Typecheck + lint. Verify in the browser: desktop (rail expanded/collapsed, list expanded/collapsed, both modes, pin popup) and mobile (sheet states, auth, create, search). One batched inspect pass, one fix batch, one confirm pass. Stop.

---

## Success

Someone who knows Yerevan should feel the city, not a dashboard template. Someone who has never seen the old Kentron should not be able to reconstruct dusk + terracotta + Bricolage from the new screens. Every route shares one chrome, one type pair, one accent, and one marker language. The map remains the brightest surface on screen.
