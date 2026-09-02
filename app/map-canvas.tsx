"use client";

import { useEffect, useRef } from "react";

const YEREVAN_CENTER: [number, number] = [40.1811, 44.5136];

export function MapCanvas() {
  const mapElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapElement.current) return;

    let disposed = false;
    let map: import("leaflet").Map | undefined;

    void import("leaflet").then((L) => {
      if (disposed || !mapElement.current) return;

      map = L.map(mapElement.current, {
        center: YEREVAN_CENTER,
        zoom: 14,
        zoomControl: false,
        attributionControl: true,
      });

      L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        },
      ).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => map?.setView([coords.latitude, coords.longitude], 14),
          () => undefined,
          { enableHighAccuracy: false, timeout: 5_000, maximumAge: 300_000 },
        );
      }
    });

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
