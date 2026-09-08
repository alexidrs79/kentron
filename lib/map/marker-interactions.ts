import type { GeoJSONSource, Map } from "maplibre-gl";
import type { TimeMode } from "./fixtures";

const pulseLayers = [
  "pulse-clusters",
  "pulse-cluster-count",
  "pulse-ring",
  "pulse-point",
];
const eventLayers = ["event-clusters", "event-cluster-count", "event-point"];

export function bindClusterZoom(map: Map, layerId: string, sourceId: string) {
  map.on("click", layerId, async (event) => {
    const feature = event.features?.[0];
    const clusterId = feature?.properties?.cluster_id as number | undefined;
    if (clusterId === undefined || feature?.geometry.type !== "Point") return;

    const source = map.getSource(sourceId) as GeoJSONSource;
    const zoom = await source.getClusterExpansionZoom(clusterId);
    const options = {
      center: feature.geometry.coordinates as [number, number],
      zoom,
    };
    if (motionIsReduced()) {
      map.jumpTo(options);
    } else {
      map.easeTo(options);
    }
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
    map.setLayoutProperty(
      id,
      "visibility",
      mode === "now" ? "visible" : "none",
    ),
  );
  eventLayers.forEach((id) =>
    map.setLayoutProperty(
      id,
      "visibility",
      mode === "week" ? "visible" : "none",
    ),
  );
}

export function motionIsReduced() {
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.dataset.reduceMotion === "true"
  );
}

export function animatePulseRing(map: Map) {
  let frame = 0;
  const started = performance.now();
  const tick = (now: number) => {
    if (!map.getLayer("pulse-ring")) return;
    if (motionIsReduced()) {
      map.setPaintProperty("pulse-ring", "circle-radius", 17);
      map.setPaintProperty("pulse-ring", "circle-opacity", 0.2);
      frame = 0;
      return;
    }
    const progress = ((now - started) % 1800) / 1800;
    map.setPaintProperty("pulse-ring", "circle-radius", 13 + progress * 16);
    map.setPaintProperty("pulse-ring", "circle-opacity", 0.34 * (1 - progress));
    frame = requestAnimationFrame(tick);
  };
  const restart = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(tick);
  };
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const observer = new MutationObserver(restart);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-reduce-motion"],
  });
  media.addEventListener("change", restart);
  restart();

  return () => {
    if (frame) cancelAnimationFrame(frame);
    observer.disconnect();
    media.removeEventListener("change", restart);
  };
}
