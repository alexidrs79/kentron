"use client";

import { useEffect, useRef } from "react";
import { attachCartoKey, loadCartoDuskStyle } from "@/lib/map/carto-dusk";
import { duskStyle } from "@/lib/map/dusk-style";
import type { EventCategory } from "@/lib/map/fixtures";

const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY;

const pinColor: Record<EventCategory | "live", string> = {
  live: "#E8A23D",
  tech: "#6E8FBF",
  creative: "#B87FA8",
  market: "#7FA87A",
};

export function PinPicker({
  value,
  onChange,
  accent,
  label,
}: {
  value: readonly [number, number];
  onChange: (coordinates: readonly [number, number]) => void;
  accent: EventCategory | "live";
  label: string;
}) {
  const mapElement = useRef<HTMLDivElement>(null);
  const markerRef = useRef<import("maplibre-gl").Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  onChangeRef.current = onChange;
  valueRef.current = value;

  useEffect(() => {
    if (!mapElement.current) return;

    let disposed = false;
    let map: import("maplibre-gl").Map | undefined;

    void import("maplibre-gl").then(async ({ Map, Marker, setWorkerUrl }) => {
      if (disposed || !mapElement.current) return;
      setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
      const style = CARTO_KEY
        ? await loadCartoDuskStyle(CARTO_KEY).catch(() => duskStyle)
        : duskStyle;
      if (disposed || !mapElement.current) return;

      map = new Map({
        container: mapElement.current,
        style,
        center: [...valueRef.current],
        zoom: 14.2,
        attributionControl: false,
        transformRequest: (url) =>
          CARTO_KEY ? attachCartoKey(url, CARTO_KEY) : undefined,
      });

      const marker = new Marker({
        color: pinColor[accent],
        draggable: true,
      })
        .setLngLat([...valueRef.current])
        .addTo(map);
      markerRef.current = marker;

      marker.on("dragend", () => {
        const next = marker.getLngLat();
        onChangeRef.current([next.lng, next.lat]);
      });
      map.on("click", ({ lngLat }) => {
        marker.setLngLat(lngLat);
        onChangeRef.current([lngLat.lng, lngLat.lat]);
      });
    });

    return () => {
      disposed = true;
      markerRef.current?.remove();
      markerRef.current = null;
      map?.remove();
    };
  }, [accent]);

  useEffect(() => {
    markerRef.current?.setLngLat([...value]);
  }, [value]);

  return (
    <div>
      <p className="mb-2 text-sm text-paper">{label}</p>
      <div
        ref={mapElement}
        className="kentron-map h-56 overflow-hidden rounded-2xl border border-line"
        aria-label={label}
      />
      <p className="mt-2 font-mono text-[11px] text-paper-2">
        Drag the pin, or tap the map. {value[1].toFixed(4)}° N,{" "}
        {value[0].toFixed(4)}° E
      </p>
    </div>
  );
}
