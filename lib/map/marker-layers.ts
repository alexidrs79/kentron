import type { ExpressionSpecification, Map } from "maplibre-gl";
import {
  eventCollection,
  livePulses,
  plannedEvents,
  pulseCollection,
  type LivePulse,
  type PlannedEvent,
} from "./fixtures";
import { categoryOptions } from "./categories";
import { bindClusterZoom } from "./marker-interactions";
import { pinImageId } from "./pin-images";

const PULSE_SOURCE = "kentron-pulses";
const EVENT_SOURCE = "kentron-events";

const NIGHT = "#15130F";
const APRICOT = "#F5A65B";
const PAPER = "#FBF7F0";
const INK = "#1A1714";
const categoryPairs = categoryOptions.flatMap(({ id, color }) => [id, color]);
const CATEGORY_COLOR = [
  "match",
  ["get", "category"],
  ...categoryPairs,
  "#F7F3EC",
] as unknown as ExpressionSpecification;

/** Live and planned pins share one sprite set, keyed by category. */
const PIN_IMAGE = [
  "match",
  ["get", "category"],
  ...categoryOptions.flatMap(({ id }) => [id, pinImageId(id)]),
  pinImageId("market"),
] as unknown as ExpressionSpecification;

/** Clusters carry the apricot accent on both basemaps, never black-on-white. */
function clusterPaint(theme: "dark" | "light") {
  return theme === "light"
    ? { fill: PAPER, stroke: "#DE8C33", text: INK }
    : { fill: NIGHT, stroke: APRICOT, text: APRICOT };
}

export function addMarkerLayers(
  map: Map,
  pulses: LivePulse[] = livePulses,
  events: PlannedEvent[] = plannedEvents,
  theme: "dark" | "light" = "dark",
) {
  const cluster = clusterPaint(theme);

  map.addSource(PULSE_SOURCE, {
    type: "geojson",
    data: pulseCollection(pulses),
    cluster: true,
    clusterMaxZoom: 15,
    clusterRadius: 56,
  });
  map.addSource(EVENT_SOURCE, {
    type: "geojson",
    data: eventCollection(events),
    cluster: true,
    clusterMaxZoom: 15,
    clusterRadius: 54,
  });

  map.addLayer({
    id: "pulse-clusters",
    type: "circle",
    source: PULSE_SOURCE,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": cluster.fill,
      "circle-radius": ["step", ["get", "point_count"], 16, 5, 19],
      "circle-stroke-color": cluster.stroke,
      "circle-stroke-width": 2,
    },
  });
  map.addLayer({
    id: "pulse-cluster-count",
    type: "symbol",
    source: PULSE_SOURCE,
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-font": ["Noto Sans Bold"],
      "text-size": 12,
    },
    paint: { "text-color": cluster.text },
  });
  // The glow sits at the tip of the pin, so live activity reads as light on
  // the ground rather than a second marker.
  map.addLayer({
    id: "pulse-ring",
    type: "circle",
    source: PULSE_SOURCE,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": CATEGORY_COLOR,
      "circle-radius": 15,
      "circle-opacity": 0.24,
      // Without blur the halo reads as a flat disc rather than light.
      "circle-blur": 0.7,
    },
  });
  map.addLayer({
    id: "pulse-point",
    type: "symbol",
    source: PULSE_SOURCE,
    filter: ["!", ["has", "point_count"]],
    layout: {
      "icon-image": PIN_IMAGE,
      "icon-anchor": "bottom",
      "icon-size": 1,
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
    },
  });

  map.addLayer({
    id: "event-clusters",
    type: "circle",
    source: EVENT_SOURCE,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": cluster.fill,
      "circle-radius": ["step", ["get", "point_count"], 16, 5, 19],
      "circle-stroke-color": cluster.stroke,
      "circle-stroke-width": 2,
    },
  });
  map.addLayer({
    id: "event-cluster-count",
    type: "symbol",
    source: EVENT_SOURCE,
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-font": ["Noto Sans Bold"],
      "text-size": 12,
    },
    paint: { "text-color": cluster.text },
  });
  map.addLayer({
    id: "event-point",
    type: "symbol",
    source: EVENT_SOURCE,
    filter: ["!", ["has", "point_count"]],
    layout: {
      "icon-image": PIN_IMAGE,
      "icon-anchor": "bottom",
      "icon-size": 1,
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
    },
  });

  bindClusterZoom(map, "pulse-clusters", PULSE_SOURCE);
  bindClusterZoom(map, "event-clusters", EVENT_SOURCE);
}
