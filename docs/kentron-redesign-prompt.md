# Kentron — full product UI/UX redesign prompt

You are a senior product designer and frontend design engineer. Redesign Kentron, a map-first guide to what is happening in Yerevan. Produce a coherent product system and route-by-route layouts, not isolated cosmetic patches.

Do not start implementation immediately. First audit the current rendered product at desktop and mobile widths, create high-fidelity design directions, and obtain approval. Then implement the approved direction with reusable components and verify every route in the browser.

## Product model

Kentron has two distinct time modes:

- **Right now:** anonymous, ephemeral live posts that fade and expire after a few hours. No RSVP and no save.
- **This week:** planned events from organizers. Users can open, save, and revisit them.

Never merge these into one feed. The user should only need to understand time, not the underlying data model.

Primary navigation stays:

1. Map
2. Search
3. Create
4. Saved
5. Profile

Create remains the emphasized action. Keep the Armenian wordmark `Կենտրոն`, the Yerevan-local character, and the existing dusk map treatment.

## Preserve what already works

- Keep the desktop sidebar concept and information architecture.
- Keep the full-bleed dusk MapLibre map as the home-page visual field.
- Keep the login page’s basic split-screen idea, but correct the artwork treatment and proportions.
- Keep the restrained palette, Armenian wordmark, local illustrations, outlined Lucide icons, and time toggle.
- Preserve category accessibility: tech is a rounded square, creative is a diamond, market is a circle. Do not rely on color alone.

Do not preserve the current page layouts merely because they exist. The create, saved, profile, search, event detail, post detail, error, and mobile layouts need deliberate redesign.

## Current problems to solve

1. Non-map pages look like small prototypes floating in a huge empty canvas. Typography, composition, density, and hierarchy are too weak.
2. The home event list is a narrow overlay that compresses titles and metadata. Its header collides with the “Kentron, Yerevan” location control.
3. Map controls, list panel, legend, attribution, and zoom controls do not share one collision-safe layout system.
4. Rows do not create a strong visual link between an item and its map pin. Clicking a pin currently does nothing useful; it should open a preview popup.
5. Create uses a centered column and stacked cards but does not feel like a guided, high-confidence flow.
6. Saved and Profile do not make meaningful use of desktop space.
7. Search and detail routes must become real product pages rather than placeholders.
8. The login artwork looks soft and incorrectly cropped because a 1024×558 landscape bitmap is being stretched into a tall half-screen region.
9. Mobile cannot simply stack desktop components. It needs intentional map/list, form, and navigation behavior.
10. Avoid a generic SaaS dashboard, uniform card grids, excessive glass effects, giant headings, gradients, or decorative UI with no function.

## Research-informed interaction principles

Use these principles, not the visual branding of the reference products:

- Follow the coordinated split-view pattern used by strong map products: the list and map are siblings, not overlapping layers. Hovering or focusing a row highlights its marker; selecting a marker opens an animated preview popup and scrolls the matching row into view.
- Keep map state in the URL where practical so mode, filters, and viewport context survive navigation.
- Apply map camera padding equal to visible side panels or sheets. The geographic focal point and controls must remain inside the unobscured map area.
- Use progressive disclosure for creation. Show only fields relevant to the selected content type and group complex event information into clear sections.
- Empty states should explain the state and offer one relevant action, but should not dominate the entire page.
- Show errors next to the field or action that caused them. Do not rely on generic banners.

Reference principles:

- Airbnb-style map/list synchronization and split view.
- Mapbox camera padding for visible sidebars and overlays.
- Nielsen Norman Group guidance on progressive disclosure and reducing form cognitive load.
- Eventbrite’s grouping of event basics, date/location, content, and optional settings.

## Global layout system

Design one responsive shell with explicit layout zones.

### Desktop

- Left app rail: 208–224 px.
- Main content area: fluid, with a sensible max width only on reading/form pages.
- Map home: use CSS grid inside the main area:
  - map workspace: `minmax(0, 1fr)`
  - results panel: 360–400 px
- The results panel must be a real sibling column, never an absolute overlay.
- Apply right camera padding matching the results-panel width.
- Keep all map controls inside the map column. They must never render beneath or over the results panel.
- Use 24–32 px page gutters and a consistent 8 px spacing system.

### Mobile

- Keep the bottom navigation and safe-area handling.
- Home uses a real bottom sheet with collapsed, half, and expanded states.
- The handle must actually control the sheet.
- When expanded, prioritize the list; when collapsed, prioritize the map.
- Keep map controls above the current sheet height through one shared safe-area calculation.
- Forms become one column with sticky bottom actions.

### Visual hierarchy

- Page title: 32–40 px desktop, 28–32 px mobile.
- Section title: 18–24 px.
- Body: 14–16 px with comfortable line height.
- Metadata: 11–12 px IBM Plex Mono, used sparingly.
- Do not solve hierarchy only through font size. Use alignment, spacing, weight, and grouping.
- Increase contrast between `dusk`, `surface`, and interactive states while keeping the existing palette.
- Create hover, focus, pressed, selected, disabled, loading, and error states for every interactive primitive.

## Home map redesign

### Map workspace

- Top-left, inside the map column: the `Right now / This week` segmented control.
- Location/recenter control is a compact actionable button beside or below the toggle. Do not place it in the results-panel header.
- Legend is collapsed by default and anchored independently from list content.
- Zoom and attribution remain accessible and collision-free.
- Clicking the location control recenters the map and clearly reports denied location permission.

### Results panel

- Give the panel its own header with:
  - mode-specific title
  - visible result count
  - compact “in this map area” context
  - optional collapse/full-map action
- Rows need 64–80 px of height, two-line title support, readable venue and time, and an accessible category shape/chip.
- Live rows use a neutral anonymous identity symbol and visible age.
- Planned rows use organizer initials, category, venue, and Yerevan time.
- Do not truncate every title to one line.
- Hover/focus on a row highlights and raises the matching pin.
- Clicking a pin opens the map preview popup and selects the matching row. Clicking the row or the popup’s primary action opens the full detail page.
- Selected row uses a structural state—background, outline, or leading rail—not color alone.
- Keep the location/recenter box entirely out of this panel so no overlap is possible.

### Map pin preview popup

Clicking a live pulse or planned-event pin on the map must open a compact preview popup anchored to that pin. This is a first-look card, not the full detail page.

- Animate in with a short, confident motion: 180–240 ms ease-out scale and fade from the pin. The pin itself may lift or pulse once as the popup appears. Do not use bouncy, cartoon, or looping animation.
- Respect `prefers-reduced-motion`: skip scale/translate and show a simple fade or instant appear.
- Place the popup so it never covers the clicked pin completely, never collides with the results panel, legend, zoom controls, or location toggle, and stays inside the padded map workspace. Flip or shift the anchor if it would overflow.
- Only one popup is open at a time. Clicking another pin replaces it with the same animation. Clicking empty map, Escape, or a close control dismisses it.
- Visual content, in this order:
  - a photo or illustration crop for the post/event; if none exists, use a dusk surface with the category shape and a large initial, never a broken image
  - title or live caption, two lines max
  - venue or place, plus Yerevan time (events) or age (live posts)
  - category chip with shape, not color alone
  - a single primary action: Open event or Open live post
- Planned-event popups feel static and scheduled. Live popups feel current: apricot accent, quieter type, optional age or “still happening” cue. Never mix those visual languages.
- Image treatment: 16:10 or 4:3 crop, rounded to match the product radius, no stretching. If the source is low-resolution, keep it small rather than upscaling to fill the card.
- Desktop popup is about 280–320 px wide. On mobile it can be a compact card above the bottom sheet, not a full-screen modal.
- Opening the popup must also highlight and scroll the matching list row. Closing it clears the selection.
- Keyboard: pin is focusable; Enter/Space opens the popup; Escape closes it; Tab reaches Open and Close.
- Clusters still zoom in on click. Do not attach a preview popup to a cluster until it has resolved to a single pin.

### Empty state

- The Republic Square illustration appears as a compact editorial panel, not a full-height obstruction.
- Copy remains: “Quiet right now near you. Be the first to post.”
- Provide one primary Create action and one subtle “Reset map area” action.

## Create flow redesign

### Branch screen

- Use a wide editorial composition, approximately 1100–1200 px max width.
- Integrate the split illustration as a visual anchor rather than a banner pasted above two cards.
- The two choices should read as distinct paths:
  - Happening now: apricot live signal, short duration, anonymous, under one minute.
  - Planned for later: static category marker, date and venue, organizer account.
- Each choice must state what happens next and the expected effort.

### Live form

- Keep it intentionally short: photo, caption, category, map pin.
- Desktop: form on the left, sticky map/location preview on the right.
- Mobile: one column, map picker after category, sticky Post action.
- Show caption count, image state, location confidence, and inline validation.

### Planned-event form

- Use progressive sections:
  1. Basics — title and category
  2. When and where — Yerevan date/time, venue search, map pin
  3. Details — description and optional image
  4. Repeat helper — optional reusable weekly draft
- Desktop can use a two-column arrangement with a sticky summary or map preview.
- Do not show all optional controls with equal visual weight.
- Preserve entered data when moving backward.

## Search

- Build a real search page.
- Use a strong search field at the top, then compact filters for category and time window.
- Results are list-first; map is optional and secondary.
- Provide recent searches or useful Yerevan suggestions before typing.
- Results reuse the same planned/live row components where appropriate.
- Search must never blend modes without a clear time filter.

## Event detail

- Create a complete planned-event page with:
  - restrained image or color-led hero
  - title, category shape/chip, organizer identity
  - Yerevan date/time and venue grouped near the top
  - Save action
  - description
  - compact map and Get directions action
  - related nearby planned events, if space permits
- Keep the primary information visible without scrolling on desktop.

## Live-post detail

- Make it visibly different from an event page.
- Show photo, caption, anonymous identity, age, expiry/freshness state, category, and map location.
- Provide `Still here` confirmation and Report actions with clear limits.
- Never show Save or RSVP.
- Use the apricot pulse language and an expiry explanation.

## Saved

- Empty state: use the Vernissage illustration at a controlled editorial size with concise copy and one Browse this week action.
- Populated state: group saved events by upcoming date.
- Reuse the event-row system, but allow more room than the home panel.
- Add a compact upcoming summary and clear remove-save behavior.
- Avoid centering a small card in a mostly empty viewport.

## Profile

- Use a proper organizer header with identity, account email, and restrained stats.
- Separate Upcoming and Past events with tabs or segmented navigation.
- Event rows/cards link to their detail pages and expose edit state where appropriate.
- Account controls belong in a secondary section, not beside the primary content.
- Anonymous live posts never appear here.

## Login and signup

- Preserve the split composition but redesign the image usage.
- The supplied Cascade asset is 1024×558 landscape. Never stretch it into a full-height portrait panel.
- Preferred solution: regenerate/export the same scene as a portrait or square source at a minimum of 1600×2000 for desktop retina use.
- Until a higher-resolution portrait exists:
  - render the image at or below intrinsic resolution
  - use an inset 4:3 or 16:10 image block, or a bounded `object-contain` composition
  - choose an intentional focal point that keeps the full character and Cascade visible
  - never upscale a cropped fragment to fill half the viewport
- Place the form in a calm 360–420 px column with a clear title, labels, errors, pending state, and alternate auth link.
- On mobile, retain a short, cropped illustration header rather than hiding the artwork entirely.

## Error and 404

- Keep the Kond illustration and dry local copy.
- Use a balanced two-column or compact editorial layout on desktop.
- Offer Back to map and Search; do not leave users at a dead end.

## Illustration and image quality rules

- Treat illustrations as authored editorial content, not generic card thumbnails.
- Preserve aspect ratio at every breakpoint.
- Do not upscale raster images beyond their natural dimensions.
- Use `sizes`, responsive sources, and quality-aware image optimization.
- Generate 2× exports for any full-width or full-height placement.
- Define focal points per asset rather than using the same `object-cover` behavior everywhere.
- Avoid placing text over detailed portions of an illustration.

## Components to design

Create a small coherent system:

- App rail and mobile bottom navigation
- Page header
- Segmented control
- Location/recenter button
- Map/list split shell
- Results-panel header
- Map pin preview popup (image, meta, animated enter/exit)
- Shared event row and live row
- Category marker and chip
- Empty-state composition
- Form field, textarea, image picker, date/time field
- Venue autocomplete
- Map pin picker
- Sticky action bar
- Organizer identity
- Event card/detail metadata block
- Save, confirm, report, and directions actions
- Loading skeletons and inline errors

Do not add a component library or a generic dashboard card for every section.

## Accessibility and behavior

- Minimum 44 px targets.
- Visible keyboard focus.
- Full keyboard navigation between rows and map markers.
- Do not encode category or selected state by color alone.
- Respect reduced motion.
- Maintain contrast over the actual rendered map, not only token swatches.
- Use semantic headings, labels, live regions for result counts, and descriptive image alt text.
- Test at 390×844, 768×1024, 1440×900, and 1920×1080.

## Required design deliverables

Design desktop and mobile variants for:

1. Home — Right now populated, including a live-post pin popup
2. Home — This week populated, including a planned-event pin popup
3. Home — empty live state
4. Search — initial and results
5. Create — branch
6. Create — live form
7. Create — planned form
8. Event detail
9. Live-post detail
10. Saved — empty and populated
11. Profile — signed out and signed in
12. Login and signup
13. 404/error

Also provide:

- one annotated map/list interaction diagram, including pin click → popup → list selection → detail
- one responsive layout specification
- one component inventory
- one state matrix covering default, hover, focus, selected, loading, empty, error, popup enter, popup idle, and popup exit

## Approval and implementation process

1. Audit current screenshots and rendered routes.
2. Present two genuinely different home/list layout directions.
3. Present one coherent route family based on the selected direction.
4. Stop for approval.
5. Implement route by route using shared primitives.
6. Browser-test all flows and collisions at the required breakpoints.
7. Capture one screenshot per completed route group.

Success means the product feels designed around Yerevan discovery, not like a dark starter template; the map and list operate as one coordinated workspace; clicking a pin opens a sharp, animated preview with image and details; every page uses its available space intentionally; and the supplied illustrations remain sharp, correctly cropped, and meaningful.
