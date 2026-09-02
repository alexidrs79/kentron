import type { Map } from "maplibre-gl";
import {
  eventCollection,
  livePulses,
  plannedEvents,
  pulseCollection,
  type EventCategory,
  type LivePulse,
  type PlannedEvent,
} from "./fixtures";
import { bindClusterZoom } from "./marker-interactions";

const PULSE_SOURCE = "kentron-pulses";
const EVENT_SOURCE = "kentron-events";

const categoryColors: Record<EventCategory, string> = {
  tech: "#6E8FBF",
  creative: "#B87FA8",
  market: "#7FA87A",
};

function markerImage(category: EventCategory) {
  const size = 48;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas rendering is unavailable");

  context.fillStyle = categoryColors[category];
  context.strokeStyle = "#EDEFF2";
  context.lineWidth = 3;

  if (category === "tech") {
    context.beginPath();
    context.roundRect(7, 7, 34, 34, 8);
  } else if (category === "creative") {
    context.beginPath();
    context.moveTo(24, 4);
    context.lineTo(44, 24);
    context.lineTo(24, 44);
    context.lineTo(4, 24);
    context.closePath();
  } else {
    context.beginPath();
    context.arc(24, 24, 18, 0, Math.PI * 2);
  }

  context.fill();
  context.stroke();
  return context.getImageData(0, 0, size, size);
}

function addMarkerImages(map: Map) {
  (["tech", "creative", "market"] as EventCategory[]).forEach((category) => {
    const name = `event-${category}-marker`;
    if (!map.hasImage(name)) {
      map.addImage(name, markerImage(category), { pixelRatio: 2 });
    }
  });
}

export function addMarkerLayers(
  map: Map,
  pulses: LivePulse[] = livePulses,
  events: PlannedEvent[] = plannedEvents,
) {
  addMarkerImages(map);

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
      "circle-color": "#23283B",
      "circle-radius": ["step", ["get", "point_count"], 16, 5, 19],
      "circle-stroke-color": "#E8A23D",
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
    paint: { "text-color": "#F4EFE9" },
  });
  map.addLayer({
    id: "pulse-ring",
    type: "circle",
    source: PULSE_SOURCE,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#E8A23D",
      "circle-radius": 16,
      "circle-opacity": 0.18,
    },
  });
  map.addLayer({
    id: "pulse-point",
    type: "circle",
    source: PULSE_SOURCE,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#E8A23D",
      "circle-radius": 6,
      "circle-opacity": ["get", "opacity"],
      "circle-stroke-color": "#23283B",
      "circle-stroke-width": 2,
    },
  });

  map.addLayer({
    id: "event-clusters",
    type: "circle",
    source: EVENT_SOURCE,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": "#23283B",
      "circle-radius": ["step", ["get", "point_count"], 16, 5, 19],
      "circle-stroke-color": "#EDEFF2",
      "circle-stroke-width": 1.5,
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
    paint: { "text-color": "#F4EFE9" },
  });

  (["tech", "creative", "market"] as EventCategory[]).forEach((category) => {
    map.addLayer({
      id: `event-${category}`,
      type: "symbol",
      source: EVENT_SOURCE,
      filter: [
        "all",
        ["!", ["has", "point_count"]],
        ["==", ["get", "category"], category],
      ],
      layout: {
        "icon-image": `event-${category}-marker`,
        "icon-size": 1,
        "icon-allow-overlap": true,
      },
    });
  });

  bindClusterZoom(map, "pulse-clusters", PULSE_SOURCE);
  bindClusterZoom(map, "event-clusters", EVENT_SOURCE);
}
