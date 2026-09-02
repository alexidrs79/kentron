import type { StyleSpecification } from "maplibre-gl";

const DARK_MATTER =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const colorSwap: Record<string, string> = {
  "#0e0e0e": "#23283b",
  "#0b0b0b": "#1a1f31",
  "#111": "#1a1f31",
  "#111111": "#1a1f31",
  "#151515": "#23283b",
  "#161616": "#23283b",
  "#181818": "#23283b",
  "#1a1a1a": "#28313c",
  "#1c1c1c": "#2a3048",
  "#222": "#373c53",
  "#222222": "#373c53",
  "#232323": "#373c53",
  "#262626": "#3a3f56",
  "#2c353c": "#2a3048",
  "#383838": "#454b63",
  "#3c3c3c": "#454b63",
  "#444": "#565e7a",
  "#444444": "#565e7a",
  "#515151": "#9a9aae",
  "#666": "#9a9aae",
  "#666666": "#9a9aae",
};

function tintValue(value: unknown): unknown {
  if (typeof value === "string") {
    const swapped = colorSwap[value.toLowerCase()];
    return swapped ?? value;
  }
  if (Array.isArray(value)) return value.map(tintValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        key,
        tintValue(nested),
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

export function cartoStyleUrl(key: string) {
  return withKey(DARK_MATTER, key);
}

export async function loadCartoDuskStyle(key: string): Promise<StyleSpecification> {
  const response = await fetch(cartoStyleUrl(key));
  if (!response.ok) {
    throw new Error(`CARTO style failed (${response.status})`);
  }

  const style = (await response.json()) as StyleSpecification;
  const tinted = tintValue(style) as StyleSpecification;

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
