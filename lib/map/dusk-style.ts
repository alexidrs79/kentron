import type {
  DataDrivenPropertyValueSpecification,
  StyleSpecification,
} from "maplibre-gl";

const VECTOR_SOURCE = "https://tiles.openfreemap.org/planet";
const GLYPHS = "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf";

type BasemapPaint = {
  name: string;
  dusk: string;
  water: string;
  park: string;
  building: string;
  roadMinor: string;
  roadMid: string;
  roadMajor: string;
  label: string;
  labelMuted: string;
  labelWater: string;
};

const nightPaint: BasemapPaint = {
  name: "Kentron night",
  dusk: "#121110",
  water: "#0E0E0D",
  park: "#1A1B17",
  building: "#201E1B",
  roadMinor: "#2C2926",
  roadMid: "#3E3A35",
  roadMajor: "#55504A",
  label: "#EFEAE1",
  labelMuted: "#8D857B",
  labelWater: "#6E6D68",
};

const dayPaint: BasemapPaint = {
  name: "Kentron day",
  dusk: "#EDE6DA",
  water: "#D7D2C8",
  park: "#D8DCC8",
  building: "#E4DCCE",
  roadMinor: "#F7F1E8",
  roadMid: "#FBF7F0",
  roadMajor: "#FFFFFF",
  label: "#2A2622",
  labelMuted: "#6B635A",
  labelWater: "#5E5A54",
};

const roadWidth = (
  base: number,
): DataDrivenPropertyValueSpecification<number> => [
  "interpolate",
  ["exponential", 1.5],
  ["zoom"],
  10,
  base * 0.4,
  14,
  base,
  18,
  base * 4,
];

function makeBasemap(paint: BasemapPaint): StyleSpecification {
  const {
    dusk,
    water,
    park,
    building,
    roadMinor,
    roadMid,
    roadMajor,
    label,
    labelMuted,
    labelWater,
  } = paint;

  return {
    version: 8,
    name: paint.name,
    glyphs: GLYPHS,
    sources: {
      openmaptiles: { type: "vector", url: VECTOR_SOURCE },
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: { "background-color": dusk },
      },
      {
        id: "park",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "park",
        paint: { "fill-color": park, "fill-opacity": 0.55 },
      },
      {
        id: "landcover",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landcover",
        filter: ["in", ["get", "class"], ["literal", ["wood", "grass"]]],
        paint: { "fill-color": park, "fill-opacity": 0.4 },
      },
      {
        id: "water",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "water",
        filter: ["!=", ["get", "brunnel"], "tunnel"],
        paint: { "fill-color": water },
      },
      {
        id: "waterway",
        type: "line",
        source: "openmaptiles",
        "source-layer": "waterway",
        paint: { "line-color": water, "line-width": roadWidth(1.6) },
      },
      {
        id: "building",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "building",
        minzoom: 13,
        paint: {
          "fill-color": building,
          "fill-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            13,
            0,
            15.5,
            0.7,
          ],
        },
      },
      {
        id: "road-minor",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        minzoom: 12,
        filter: [
          "in",
          ["get", "class"],
          ["literal", ["minor", "service", "track"]],
        ],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": roadMinor, "line-width": roadWidth(0.9) },
      },
      {
        id: "road-mid",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: [
          "in",
          ["get", "class"],
          ["literal", ["secondary", "tertiary"]],
        ],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": roadMid, "line-width": roadWidth(1.5) },
      },
      {
        id: "road-major",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: [
          "in",
          ["get", "class"],
          ["literal", ["motorway", "trunk", "primary"]],
        ],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": roadMajor, "line-width": roadWidth(2.2) },
      },
      {
        id: "rail",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        minzoom: 12,
        filter: ["==", ["get", "class"], "rail"],
        paint: {
          "line-color": roadMinor,
          "line-width": roadWidth(0.8),
          "line-dasharray": [3, 3],
        },
      },
      {
        id: "road-label",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "transportation_name",
        minzoom: 14,
        layout: {
          "symbol-placement": "line",
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Regular"],
          "text-size": 11,
          "text-letter-spacing": 0.02,
        },
        paint: {
          "text-color": labelMuted,
          "text-halo-color": dusk,
          "text-halo-width": 1.4,
        },
      },
      {
        id: "water-label",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "water_name",
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Italic"],
          "text-size": 11,
        },
        paint: {
          "text-color": labelWater,
          "text-halo-color": water,
          "text-halo-width": 1.2,
        },
      },
      {
        id: "place-label",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "place",
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Bold"],
          "text-size": [
            "match",
            ["get", "class"],
            "city",
            15,
            "town",
            13,
            "suburb",
            12,
            11,
          ],
          "text-letter-spacing": 0.04,
          "text-max-width": 8,
        },
        paint: {
          "text-color": [
            "match",
            ["get", "class"],
            "city",
            label,
            "town",
            label,
            labelMuted,
          ],
          "text-halo-color": dusk,
          "text-halo-width": 1.6,
        },
      },
    ],
  };
}

export const duskStyle = makeBasemap(nightPaint);
export const dayStyle = makeBasemap(dayPaint);
