import type { StyleSpecification } from "maplibre-gl";

const DARK_MATTER =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const POSITRON =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

/*
  CARTO's dark basemap is a cool blue-grey. Dropped straight into Kentron it
  fights the warm near-black canvas and the apricot markers, so every colour in
  the style is remapped onto one neutral-warm ramp by luminance. A whisper of
  the original colour is mixed back so water and parkland still separate.
*/
const RAMP_LOW = [14, 14, 13] as const;
const RAMP_HIGH = [247, 243, 236] as const;
const ORIGINAL_MIX = 0.08;

type Rgba = { r: number; g: number; b: number; a: number };

function clamp255(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function parseColor(value: string): Rgba | null {
  const input = value.trim().toLowerCase();

  const hex = /^#([0-9a-f]{3,8})$/.exec(input);
  if (hex) {
    const digits = hex[1];
    const expand = (part: string) => parseInt(part.repeat(2), 16);
    if (digits.length === 3 || digits.length === 4) {
      return {
        r: expand(digits[0]),
        g: expand(digits[1]),
        b: expand(digits[2]),
        a: digits.length === 4 ? expand(digits[3]) / 255 : 1,
      };
    }
    if (digits.length === 6 || digits.length === 8) {
      const pair = (index: number) =>
        parseInt(digits.slice(index, index + 2), 16);
      return {
        r: pair(0),
        g: pair(2),
        b: pair(4),
        a: digits.length === 8 ? pair(6) / 255 : 1,
      };
    }
    return null;
  }

  const rgb = /^rgba?\(([^)]+)\)$/.exec(input);
  if (rgb) {
    const parts = rgb[1]
      .split(/[,/\s]+/)
      .filter(Boolean)
      .map(Number);
    if (parts.length < 3 || parts.some(Number.isNaN)) return null;
    return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
  }

  const hsl = /^hsla?\(([^)]+)\)$/.exec(input);
  if (hsl) {
    const parts = hsl[1]
      .split(/[,/\s]+/)
      .filter(Boolean)
      .map((part) => Number(part.replace("%", "").replace("deg", "")));
    if (parts.length < 3 || parts.some(Number.isNaN)) return null;
    const [h, s, l] = [parts[0] / 360, parts[1] / 100, parts[2] / 100];
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const channel = (t: number) => {
      let shifted = t;
      if (shifted < 0) shifted += 1;
      if (shifted > 1) shifted -= 1;
      if (shifted < 1 / 6) return p + (q - p) * 6 * shifted;
      if (shifted < 1 / 2) return q;
      if (shifted < 2 / 3) return p + (q - p) * (2 / 3 - shifted) * 6;
      return p;
    };
    return {
      r: channel(h + 1 / 3) * 255,
      g: channel(h) * 255,
      b: channel(h - 1 / 3) * 255,
      a: parts[3] ?? 1,
    };
  }

  return null;
}

function warmify(value: string) {
  const color = parseColor(value);
  if (!color) return value;

  const luminance =
    (0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b) / 255;
  const ramped = [0, 1, 2].map((index) => {
    const low = RAMP_LOW[index];
    const high = RAMP_HIGH[index];
    return low + (high - low) * Math.pow(luminance, 0.95);
  });

  const channels = ramped.map((channel, index) => {
    const original = [color.r, color.g, color.b][index];
    return clamp255(channel * (1 - ORIGINAL_MIX) + original * ORIGINAL_MIX);
  });

  return color.a >= 1
    ? `rgb(${channels[0]}, ${channels[1]}, ${channels[2]})`
    : `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${color.a})`;
}

function tintValue(
  value: unknown,
  mapColor: (value: string) => string = warmify,
): unknown {
  if (typeof value === "string") return mapColor(value);
  if (Array.isArray(value)) {
    return value.map((nested) => tintValue(nested, mapColor));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        key,
        tintValue(nested, mapColor),
      ]),
    );
  }
  return value;
}

function withKey(url: string, key: string) {
  if (url.includes("{")) {
    const joiner = url.includes("?") ? "&" : "?";
    return `${url}${joiner}key=${encodeURIComponent(key)}`;
  }

  const parsed = new URL(url);
  parsed.searchParams.set("key", key);
  return parsed.toString();
}

export async function loadCartoDuskStyle(
  key: string,
): Promise<StyleSpecification> {
  return loadCartoStyle(DARK_MATTER, key, warmify);
}

export async function loadCartoDayStyle(
  key: string,
): Promise<StyleSpecification> {
  const style = await loadCartoStyle(POSITRON, key, (color) => color);

  // Positron's labels are deliberately pale. Give streets and places one
  // readable ink, then let large city names recede at street zoom so pins
  // and clusters keep the ground.
  for (const layer of style.layers) {
    if (layer.type !== "symbol" || !layer.layout?.["text-field"]) continue;
    const city =
      layer.id.includes("city") ||
      layer.id.includes("place-city") ||
      layer.id.includes("locality");
    const place = layer.id.includes("place");
    layer.layout = {
      ...layer.layout,
      "text-optional": true,
      "text-padding": city ? 12 : 4,
      ...(city
        ? {
            "text-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              8,
              13,
              12,
              15,
              14,
              12,
              15.5,
              0,
            ],
          }
        : {}),
    };
    layer.paint = {
      ...layer.paint,
      "text-color": city ? "#2A241C" : place ? "#3F3830" : "#4F463E",
      "text-opacity": 1,
      "text-halo-color": "rgba(251, 247, 240, 0.98)",
      "text-halo-width": city ? 2 : 1.4,
      "text-halo-blur": 0.1,
    };
  }

  return style;
}

async function loadCartoStyle(
  styleUrl: string,
  key: string,
  mapColor: (value: string) => string,
) {
  const response = await fetch(withKey(styleUrl, key));
  if (!response.ok) {
    throw new Error(`CARTO style failed (${response.status})`);
  }

  const style = (await response.json()) as StyleSpecification;
  // Only paint/layout colours are remapped; URLs are restored below.
  const tinted = tintValue(style, mapColor) as StyleSpecification;

  tinted.sources = style.sources;
  tinted.glyphs = style.glyphs;
  tinted.sprite = style.sprite;

  if (tinted.sources) {
    for (const source of Object.values(tinted.sources)) {
      if ("url" in source && typeof source.url === "string") {
        source.url = withKey(source.url, key);
      }
      if ("tiles" in source && Array.isArray(source.tiles)) {
        source.tiles = source.tiles.map((tile) => withKey(tile, key));
      }
    }
  }

  if (typeof tinted.glyphs === "string") {
    tinted.glyphs = withKey(tinted.glyphs, key);
  }

  if (typeof tinted.sprite === "string") {
    tinted.sprite = withKey(tinted.sprite, key);
  }

  return tinted;
}

export function attachCartoKey(
  url: string,
  key: string,
): { url: string } | undefined {
  if (!url.includes("cartocdn.com")) return undefined;
  return { url: withKey(url, key) };
}
