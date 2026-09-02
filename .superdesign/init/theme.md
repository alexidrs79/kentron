# Theme

## Token summary

### Colors

- dusk `#23283B`
- surface `#2C3247`
- paper `#F4EFE9`
- paper-2 `#9A9AAE`
- line `#3A3F56`
- tuff `#D46A5C`
- apricot `#E8A23D`
- ararat `#EDEFF2`
- pin-tech `#6E8FBF`
- pin-creative `#B87FA8`
- pin-market `#7FA87A`

### Typography

- Display: Bricolage Grotesque 600–700
- UI/body: Inter
- Time and numeric metadata: IBM Plex Mono 400–500
- Armenian script: Noto Sans Armenian 400, 600, 700

### Shape and layout

- Floating controls use 16px radii, 1px `line` borders, and broad low-opacity shadows.
- Navigation changes at `768px`: desktop left rail, mobile bottom bar.
- Focus rings are 2px `tuff` with a 3px offset.

## Raw `app/globals.css`

```css
@import "tailwindcss";
@import "maplibre-gl/dist/maplibre-gl.css";

@theme {
  --color-dusk: #23283b;
  --color-surface: #2c3247;
  --color-paper: #f4efe9;
  --color-paper-2: #9a9aae;
  --color-line: #3a3f56;
  --color-tuff: #d46a5c;
  --color-apricot: #e8a23d;
  --color-ararat: #edeff2;
  --color-pin-tech: #6e8fbf;
  --color-pin-creative: #b87fa8;
  --color-pin-market: #7fa87a;
  --font-display: var(--font-bricolage);
  --font-sans: var(--font-inter);
  --font-mono: var(--font-ibm-plex-mono);
  --font-armenian: var(--font-noto-armenian);
}

:root {
  color-scheme: dark;
  background: var(--color-dusk);
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  min-height: 100%;
  background: var(--color-dusk);
}

body {
  color: var(--color-paper);
  font-family: var(--font-inter), sans-serif;
}

button,
a {
  -webkit-tap-highlight-color: transparent;
}

:focus-visible {
  outline: 2px solid var(--color-tuff);
  outline-offset: 3px;
}

.armenian {
  font-family: var(--font-noto-armenian), var(--font-inter), sans-serif;
}

.kentron-map {
  height: 100%;
  width: 100%;
  background: var(--color-dusk);
}

.kentron-map .maplibregl-ctrl-group {
  margin: 0 18px 84px 0;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--color-line) 86%, transparent);
  border-radius: 14px;
  background: color-mix(in srgb, var(--color-surface) 94%, transparent);
  box-shadow: 0 16px 40px rgb(9 12 24 / 22%);
}

.kentron-map .maplibregl-ctrl-group button {
  width: 38px;
  height: 38px;
  background: transparent;
}

.kentron-map .maplibregl-ctrl-group button + button {
  border-top: 1px solid var(--color-line);
}

.kentron-map .maplibregl-ctrl-group button:hover {
  background: var(--color-line);
}

.kentron-map .maplibregl-ctrl-group .maplibregl-ctrl-icon {
  filter: invert(1) brightness(1.4);
}

.kentron-map .maplibregl-ctrl-attrib {
  background: rgb(35 40 59 / 76%);
  color: var(--color-paper-2);
  font: 400 9px/1.4 var(--font-ibm-plex-mono), monospace;
}

.kentron-map .maplibregl-ctrl-attrib a {
  color: var(--color-ararat);
}

.kentron-map .maplibregl-ctrl-attrib-button {
  filter: invert(1) brightness(1.4);
}

@media (min-width: 768px) {
  .kentron-map .maplibregl-ctrl-group {
    margin-bottom: 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```
