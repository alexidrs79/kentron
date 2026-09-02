import type { GeoJSONSource, Map } from "maplibre-gl";
import type { TimeMode } from "./fixtures";

const pulseLayers = [
  "pulse-clusters",
  "pulse-cluster-count",
  "pulse-ring",
  "pulse-point",
];
const eventLayers = [
  "event-clusters",
  "event-cluster-count",
  "event-tech",
  "event-creative",
  "event-market",
];

export function bindClusterZoom(
  map: Map,
  layerId: string,
  sourceId: string,
) {
  map.on("click", layerId, async (event) => {
    const feature = event.features?.[0];
    const clusterId = feature?.properties?.cluster_id as number | undefined;
    if (clusterId === undefined || feature?.geometry.type !== "Point") return;

    const source = map.getSource(sourceId) as GeoJSONSource;
    const zoom = await source.getClusterExpansionZoom(clusterId);
    map.easeTo({
      center: feature.geometry.coordinates as [number, number],
      zoom,
    });
  });
  map.on("mouseenter", layerId, () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", layerId, () => {
    map.getCanvas().style.cursor = "";
  });
}

export function setMarkerMode(map: Map, mode: TimeMode) {
  pulseLayers.forEach((id) =>
    map.setLayoutProperty(id, "visibility", mode === "now" ? "visible" : "none"),
  );
  eventLayers.forEach((id) =>
    map.setLayoutProperty(id, "visibility", mode === "week" ? "visible" : "none"),
  );
}

export function animatePulseRing(map: Map) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }

  let frame = 0;
  const started = performance.now();
  const tick = (now: number) => {
    if (!map.getLayer("pulse-ring")) return;
    const progress = ((now - started) % 1800) / 1800;
    map.setPaintProperty("pulse-ring", "circle-radius", 12 + progress * 14);
    map.setPaintProperty(
      "pulse-ring",
      "circle-opacity",
      0.32 * (1 - progress),
    );
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}
