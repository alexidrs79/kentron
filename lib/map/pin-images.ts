import type { Map } from "maplibre-gl";
import { categoryOptions } from "./categories";
import type { EventCategory } from "./fixtures";

/**
 * One compact pin family for every category, drawn as SVG and handed to
 * MapLibre as a sprite. The single-piece locator silhouette uses the same
 * circle-to-point proportions as the Kentron logo, while the pictograms use
 * the same Lucide geometry as the rest of the interface. Live and planned
 * share the artwork; only live gets the animated ground glow.
 */
const PIN_WIDTH = 32;
const PIN_HEIGHT = 40;
const RENDER_SCALE = 2;

/**
 * Reduced Lucide paths that remain legible inside a 32px map pin. Keeping
 * their 24×24 geometry makes the map feel related to Kentron's controls
 * instead of carrying a second icon dialect.
 */
function glyph(category: EventCategory) {
  if (category === "tech") {
    return `<path d="m18 16 4-4-4-4M6 8l-4 4 4 4m8.5-12-5 16"/>`;
  }

  if (category === "creative") {
    return `<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8Z"/><circle cx="8.5" cy="7.5" r="1" fill="${INK}" stroke="none"/><circle cx="16.8" cy="9.8" r="1" fill="${INK}" stroke="none"/><circle cx="6.5" cy="13" r="1" fill="${INK}" stroke="none"/>`;
  }

  if (category === "music") {
    return `<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>`;
  }

  if (category === "food") {
    return `<path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7M2.1 21.8l6.4-6.3M19 5l-7 7"/>`;
  }

  if (category === "outdoors") {
    return `<path d="m8 3 4 8 5-5 5 15H2L8 3Z"/>`;
  }

  return `<path d="M16 10a4 4 0 0 1-8 0M3.1 6h17.8M3.4 5.5A2 2 0 0 0 3 6.7V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.7a2 2 0 0 0-.4-1.2l-2-2.7A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8Z"/>`;
}

/** One dark ink for every pictogram, so the family reads as one set. */
const INK = "#2A2014";

function pinSvg(color: string, ring: string, category: EventCategory) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${PIN_WIDTH}" height="${PIN_HEIGHT}" viewBox="0 0 ${PIN_WIDTH} ${PIN_HEIGHT}">
    <path d="M2 15.5a14 14 0 0 1 28 0C30 20 20.8 37.7 16 37.7S2 20 2 15.5Z" fill="${color}" stroke="${ring}" stroke-width="2.2" stroke-linejoin="round"/>
    <g transform="translate(8.35 7.45) scale(.6375)" fill="none" stroke="${INK}" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round">
      ${glyph(category)}
    </g>
  </svg>`;
}

export function pinDataUrl(
  category: EventCategory,
  theme: "dark" | "light" = "dark",
) {
  const option = categoryOptions.find((item) => item.id === category);
  const color = option?.color ?? "#F5A65B";
  const ring = theme === "light" ? "#FBF7F0" : "#15130F";
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    pinSvg(color, ring, category),
  )}`;
}

async function rasterize(svg: string) {
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await image.decode();

  const width = PIN_WIDTH * RENDER_SCALE;
  const height = PIN_HEIGHT * RENDER_SCALE;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is unavailable");
  context.drawImage(image, 0, 0, width, height);
  return context.getImageData(0, 0, width, height);
}

export function pinImageId(category: EventCategory) {
  return `kentron-pin-${category}`;
}

/**
 * Registers the sprites before the marker layers are added. The outline flips
 * with the appearance so a pin keeps its silhouette on either basemap.
 */
export async function registerPinImages(
  map: Map,
  theme: "dark" | "light" = "dark",
) {
  const ring = theme === "light" ? "#FBF7F0" : "#15130F";

  await Promise.all(
    categoryOptions.map(async (category) => {
      const data = await rasterize(pinSvg(category.color, ring, category.id));
      const id = pinImageId(category.id);
      if (map.hasImage(id)) map.removeImage(id);
      map.addImage(id, data, { pixelRatio: RENDER_SCALE });
    }),
  );
}
