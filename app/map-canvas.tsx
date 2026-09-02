"use client";

import { useEffect, useRef } from "react";
import { duskStyle } from "@/lib/map/dusk-style";

const YEREVAN_CENTER: [number, number] = [44.5136, 40.1811];

export function MapCanvas() {
  const mapElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapElement.current) return;

    let disposed = false;
    let map: import("maplibre-gl").Map | undefined;

    void import("maplibre-gl").then(
      ({ Map, NavigationControl, setWorkerUrl }) => {
        if (disposed || !mapElement.current) return;

        setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

        map = new Map({
          container: mapElement.current,
          style: duskStyle,
          center: YEREVAN_CENTER,
          zoom: 13.4,
          attributionControl: {
            compact: true,
            customAttribution:
              '<a href="https://openfreemap.org" target="_blank" rel="noreferrer">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
          },
        });

        map.on("error", ({ error }) => {
          console.error("[kentron:map]", error?.message ?? error);
        });

        map.addControl(
          new NavigationControl({ showCompass: false }),
          "bottom-right",
        );

        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            ({ coords }) =>
              map?.easeTo({ center: [coords.longitude, coords.latitude] }),
            () => undefined,
            { enableHighAccuracy: false, timeout: 5_000, maximumAge: 300_000 },
          );
        }
      },
    );

    return () => {
      disposed = true;
      map?.remove();
    };
  }, []);

  return (
    <div
      ref={mapElement}
      className="kentron-map"
      aria-label="Interactive map centered on Kentron, Yerevan"
    />
  );
}
