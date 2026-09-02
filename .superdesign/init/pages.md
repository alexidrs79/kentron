# Page dependency trees

## `/` home map

Entry: `app/page.tsx`

- `app/page.tsx`
  - `app/map-canvas.tsx`
    - `lib/map/carto-dusk.ts`
    - `lib/map/dusk-style.ts`
    - `lib/map/fixtures.ts`
    - `lib/map/marker-layers.ts`
      - `lib/map/marker-interactions.ts`
  - `app/map-controls.tsx`
  - `app/map-legend.tsx`
- `app/layout.tsx`
  - `components/app-shell.tsx`
  - `app/globals.css`

## `/search`

- `app/search/page.tsx`
  - `components/phase-placeholder.tsx`
- `app/layout.tsx`
  - `components/app-shell.tsx`
  - `app/globals.css`

## `/create`

- `app/create/page.tsx`
  - `components/phase-placeholder.tsx`
- `app/layout.tsx`
  - `components/app-shell.tsx`
  - `app/globals.css`

## `/saved`

- `app/saved/page.tsx`
  - `components/phase-placeholder.tsx`
- `app/layout.tsx`
  - `components/app-shell.tsx`
  - `app/globals.css`

## `/profile`

- `app/profile/page.tsx`
  - `components/phase-placeholder.tsx`
- `app/layout.tsx`
  - `components/app-shell.tsx`
  - `app/globals.css`
