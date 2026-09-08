# Kentron design system

Kentron is map-first. Dark is the native world: the map is the canvas and
everything else floats over it on the same warm near-black scale. Light is a
lock in Settings for daytime, using a warm paper canvas and a matching day
basemap — never a second product language.

## Palette

One surface scale, warm near-black through to raised panels:

- Canvas `#121110` — app background and the map itself
- Panel `#1F1D1A` — floating panels, sheets, cards, the dock
- Raised `#2A2623` — hover, selected rows, form fields
- Line `#3A352F` — hairlines and borders
- Foreground `#F7F3EC` — primary text
- Dim `#A69E93` — meta text
- Faint `#6B635A` — placeholders and counts

Armenian apricot is the only accent:

- Apricot `#F5A65B` — live activity, Create, focus rings, primary buttons
- Apricot soft `#FFC188` — hover on apricot
- On apricot `#17150F` — text and icons sitting on apricot

Apricot remains the only interface accent. The map has one restrained semantic
exception so categories can be scanned spatially:

- Technology & learning `#6689D8` — Armenian-lapis blue
- Arts & culture `#C4304B` — pomegranate red
- Music & nightlife `#8B6FC6` — muted violet
- Food & drink `#4C9272` — garden green
- Markets & community `#E6A454` — golden apricot
- Outdoors & movement `#468998` — blue-green

These colors appear only in pins, marker glows, and tiny list keys. Never tint a
panel, button, heading, or category background with them. Live markers glow.
Planned markers stay still. Count clusters carry the apricot ring in either
appearance.

The category filter is one button in the bottom-left, marked with the layers
icon; it opens a short list of categories to show or hide. Timeline is the only
top control. Locate sits in the bottom-right map gutter, above the zoom controls
and beside the results panel. The phone sheet handle is the list header and does
not repeat the timeline name. The app opens on the map.

Appearance follows the machine by default (System), with Dark and Light locks in
Settings. Light mode uses a warm paper canvas and a matching day basemap.

## The mark

`KentronMark` in `components/logo.tsx` is Ararat's two peaks inside a map pin,
drawn as vector so it survives a 24px dock slot. It ships in two tones and the
choice is not cosmetic:

- `apricot` (default) is an apricot pin with the peaks cut out dark. Use it
  everywhere inside the app. A dark-bodied pin on a dark panel loses its
  silhouette below roughly 40px and collapses into an orange smudge.
- `night` is the original artwork, a dark pin carrying apricot peaks, plus its
  ground shadow and the small apricot locator dot. It only holds up large and on
  its own tile, so it is reserved for `app/apple-icon.png`, the Open Graph card,
  and `public/illustrations/kentron-icon.png`.

The tab favicon is `app/icon.svg`, the apricot tone on transparency, so it reads
on both light and dark browser chrome.

## The map

The basemap is remapped onto the same warm ramp by luminance in
`lib/map/carto-dusk.ts`. CARTO's stock dark style is cool blue-grey, which fights
the warm canvas and makes apricot look muddy, so every color in the style is
converted rather than colour-matched by hand. A whisper of the original colour is
mixed back so water and parkland still separate.

Markers are one shape: a compact, single-piece locator pin in the category
color. Each carries a reduced Lucide pictogram: code, palette, music, utensils,
shopping bag, or mountain, drawn in one dark ink `#2A2014` on every category so
the six read as a single set. Reusing Kentron's interface icon geometry keeps
the map from introducing a second visual dialect. The sprites are drawn in
`lib/map/pin-images.ts`; their outline flips with the appearance so the
silhouette survives either basemap.

Live and planned pins are identical artwork; only live pins sit on a soft
animated glow, so "live" is read as light on the ground rather than as a
different marker. Clusters keep the apricot ring in both appearances: night fill
with an apricot count in dark, paper fill with an ink count in light.

The bottom-left filter drives markers and the results panel together. Distances
are from the granted device location, never from the map centre.

## Type

Archivo is the single family, weights 400–700. Noto Sans Armenian carries
Armenian text and the `Կենտրոն` wordmark.

Roles, not one-off pixel sizes. Use the CSS classes in `app/globals.css`:

- Display `2.25 / 2.75rem` 600 `-0.035em` — detail, create, about, legal
- Title `1.5 / 1.75rem` 600 `-0.03em` — page and panel titles
- Lede `1.125rem` 500 — empty states, place names, secondary headings
- Body `0.9375rem` 400, 1.55, max 65ch — descriptions
- UI `0.8125rem` 600 — buttons, tabs, sheet, controls
- Meta `0.75rem` 500 tabular — age, time, distance
- Data `0.6875rem` 500 tabular — counts

Numerals for times, ages, distances, and coordinates are tabular. Avoid
uppercase eyebrows, serif display faces, and more than one type voice.

## Layout

**Nothing touches a screen edge.** Floating things carry a real border, radius,
and offset shadow (`--shadow-float`); that depth is what makes the app read as
composed rather than assembled.

- Desktop navigation is a 56px dock floating at `left-4`, vertically centred,
  holding the wordmark, five destinations, and Settings. Create is an apricot
  circle. It is not a docked rail and does not have a light background.
- Home is a full-bleed map with a 396px results panel floating inset 20px from
  the right, top, and bottom. The map camera is padded left and right so pins
  never sit under the dock or the panel.
- Phone navigation is a five-item tab bar. The results list is a three-state
  bottom sheet, and map chrome floats above it.
- Content routes sit on the same canvas, offset `88px` to clear the dock, through
  the shared `Page` shell. Spatial pages use `1220px`. Linear pages use `68ch`.
  Saved, Organizer, Settings, and Profile share one `Desk` panel.
- Auth is full-bleed with no navigation at all.

## Interior compositions

Interior pages share tokens and navigation, not a universal page template. Each
route gets a composition that expresses its actual job:

- Search is a city aperture: one large search instrument, a featured result,
  and a day ledger.
- Create is a contribution desk: one media field beside two stacked decisions.
- Saved opens with active live saves, then places planned saves into the week.
  Live saves leave automatically when their four-hour window closes.
- Planned-event and live-post detail share one city-ticket composition and the
  same action order: Save, Directions, Open on map, Report. Their status copy
  differs; their interaction model does not.
- Settings is a control room, Activity is a signal log, Profile is an organiser
  passport, and Organizer is one quiet publishing list rather than a dashboard.
- About is a field note with two titled timelines, no section numbers.

Do not bring back `PageHead + SectionHead + divider rows` as the default
composition. It remains suitable only for truly linear forms and system states.
The exact visual prompts for these routes live in `PAGE_DESIGN_PROMPTS.md`.

## Event imagery

Fallback event art is one 4:3 painterly editorial family: natural simplified
figures, restrained ink outlines, Yerevan tuff architecture, warm apricot light,
deep indigo shadows, muted pomegranate details, and subtle paper grain. It never
contains words, logos, or fake event branding. Uploaded community photography
is left untouched and always takes precedence over fallback art.

## Components

- Controls: 12px radius, 44px target, floating chrome gets `shadow-float`.
- Rows: optional thumbnail, then a small category dot beside age or time,
  title, and one meta line. Selected rows get a raised background only.
- Phone pin preview is a compact slip (title, place, one action). The 4:3
  image stays on desktop popups and on the detail ticket.
- Planned lists group by day; live lists are one age-sorted list that fades.
- Popup: image, apricot "Live now" or dim "This week", title, meta, one action.
- Buttons: apricot fill for primary, bordered panel for secondary, text for
  tertiary.
- The one framed container is `Panel`: bordered, `bg-panel`, `shadow-float`.

## Restraint rules

- No unthemed white surfaces. In either appearance, separate content by moving
  one step on that appearance’s surface scale rather than introducing a foreign
  card color.
- No neighborhood preference or filter layer; the product covers Yerevan.
- No eyebrow above every heading, and no badge counts in navigation.
- No repeated explanatory copy once the control is clear.
- Keep motion purposeful: route entry bridges navigation, popovers grow from
  their trigger, sheets preserve spatial continuity, controls acknowledge a
  press, and live markers breathe. Skeletons use one quiet opacity rhythm.
- Honour reduced motion and keep visible keyboard focus.
