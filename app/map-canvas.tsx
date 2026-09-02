"use client";

import { useEffect, useRef } from "react";
import { attachCartoKey, loadCartoDuskStyle } from "@/lib/map/carto-dusk";
import { duskStyle } from "@/lib/map/dusk-style";
import type { TimeMode, LivePulse, PlannedEvent } from "@/lib/map/fixtures";
import {
  eventCollection,
  pulseCollection,
} from "@/lib/map/fixtures";
import { addMarkerLayers } from "@/lib/map/marker-layers";
import {
  animatePulseRing,
  setMarkerMode,
} from "@/lib/map/marker-interactions";
import type { MapBounds } from "@/lib/map/viewport";

const YEREVAN_CENTER: [number, number] = [44.5136, 40.1811];
const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY;

export function MapCanvas({
  mode,
  pulses,
  events,
  onBoundsChange,
}: {
  mode: TimeMode;
  pulses: LivePulse[];
  events: PlannedEvent[];
  onBoundsChange: (bounds: MapBounds) => void;
}) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("maplibre-gl").Map>(null);
  const modeRef = useRef(mode);
  const onBoundsChangeRef = useRef(onBoundsChange);
  const pulsesRef = useRef(pulses);
  const eventsRef = useRef(events);
  modeRef.current = mode;
  onBoundsChangeRef.current = onBoundsChange;
  pulsesRef.current = pulses;
  eventsRef.current = events;

  useEffect(() => {
    if (!mapElement.current) return;

    let disposed = false;
    let map: import("maplibre-gl").Map | undefined;

    void import("maplibre-gl").then(
      async ({ Map, NavigationControl, setWorkerUrl }) => {
        if (disposed || !mapElement.current) return;

        setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
        const style = CARTO_KEY
          ? await loadCartoDuskStyle(CARTO_KEY).catch(() => duskStyle)
          : duskStyle;
        if (disposed || !mapElement.current) return;

        map = new Map({
          container: mapElement.current,
          style,
          center: YEREVAN_CENTER,
          zoom: 13.4,
          transformRequest: (url) =>
            CARTO_KEY ? attachCartoKey(url, CARTO_KEY) : undefined,
          attributionControl: {
            compact: true,
            customAttribution: CARTO_KEY
              ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              : '<a href="https://openfreemap.org">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          },
        });
        mapRef.current = map;

        map.on("error", ({ error }) => {
          console.error("[kentron:map]", error?.message ?? error);
        });
        const publishBounds = () => {
          const box = map?.getBounds();
          if (!box) return;
          onBoundsChangeRef.current({
            west: box.getWest(),
            south: box.getSouth(),
            east: box.getEast(),
            north: box.getNorth(),
          });
        };

        map.on("load", () => {
          if (!map) return;
          addMarkerLayers(map, pulsesRef.current, eventsRef.current);
          setMarkerMode(map, modeRef.current);
          stopPulse = animatePulseRing(map);
          publishBounds();
        });
        map.on("moveend", publishBounds);
        map.on("zoomend", publishBounds);
        map.addControl(
          new NavigationControl({ showCompass: false }),
          "bottom-right",
        );

        navigator.geolocation?.getCurrentPosition(
          ({ coords }) =>
            map?.easeTo({ center: [coords.longitude, coords.latitude] }),
          () => undefined,
          { timeout: 5_000, maximumAge: 300_000 },
        );
      },
    );

    let stopPulse: () => void = () => {};

    return () => {
      disposed = true;
      stopPulse();
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (map?.getLayer("pulse-point")) setMarkerMode(map, mode);
  }, [mode]);

  useEffect(() => {
    const map = mapRef.current;
    const pulseSource = map?.getSource("kentron-pulses") as
      | { setData: (data: ReturnType<typeof pulseCollection>) => void }
      | undefined;
    const eventSource = map?.getSource("kentron-events") as
      | { setData: (data: ReturnType<typeof eventCollection>) => void }
      | undefined;
    pulseSource?.setData(pulseCollection(pulses));
    eventSource?.setData(eventCollection(events));
  }, [pulses, events]);

  return (
    <div
      ref={mapElement}
      className="kentron-map"
      aria-label="Interactive map centered on Kentron, Yerevan"
    />
  );
}
