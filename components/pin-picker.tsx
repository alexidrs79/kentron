"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { usePreferences } from "@/components/preferences";
import {
  attachCartoKey,
  loadCartoDayStyle,
  loadCartoDuskStyle,
} from "@/lib/map/carto-dusk";
import { dayStyle, duskStyle } from "@/lib/map/dusk-style";
import type { EventCategory } from "@/lib/map/fixtures";
import { pinDataUrl } from "@/lib/map/pin-images";

const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY;

export function PinPicker({
  value,
  onChange,
  category,
  label,
  hint,
}: {
  value: readonly [number, number];
  onChange: (coordinates: readonly [number, number]) => void;
  category: EventCategory;
  label: string;
  hint?: string;
}) {
  const { locale } = useLocale();
  const [loaded, setLoaded] = useState(false);
  const mapElement = useRef<HTMLDivElement>(null);
  const markerRef = useRef<import("maplibre-gl").Marker | null>(null);
  const markerImageRef = useRef<HTMLImageElement | null>(null);
  const { resolvedTheme } = usePreferences();
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  const categoryRef = useRef(category);
  onChangeRef.current = onChange;
  valueRef.current = value;
  categoryRef.current = category;

  useEffect(() => {
    if (!mapElement.current) return;
    setLoaded(false);

    let disposed = false;
    let map: import("maplibre-gl").Map | undefined;

    void import("maplibre-gl").then(async ({ Map, Marker, setWorkerUrl }) => {
      if (disposed || !mapElement.current) return;
      setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
      const style =
        resolvedTheme === "light"
          ? CARTO_KEY
            ? await loadCartoDayStyle(CARTO_KEY).catch(() => dayStyle)
            : dayStyle
          : CARTO_KEY
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
      map.once("load", () => {
        if (!disposed) setLoaded(true);
      });

      const canvas = map.getCanvas();
      canvas.tabIndex = 0;
      canvas.setAttribute(
        "aria-keyshortcuts",
        "ArrowLeft ArrowRight ArrowUp ArrowDown",
      );
      canvas.addEventListener("keydown", (event) => {
        const step = event.shiftKey ? 0.001 : 0.0002;
        const [lng, lat] = valueRef.current;
        let next: [number, number] | null = null;
        if (event.key === "ArrowLeft") next = [lng - step, lat];
        if (event.key === "ArrowRight") next = [lng + step, lat];
        if (event.key === "ArrowUp") next = [lng, lat + step];
        if (event.key === "ArrowDown") next = [lng, lat - step];
        if (!next) return;
        event.preventDefault();
        markerRef.current?.setLngLat(next);
        onChangeRef.current(next);
      });

      const markerImage = document.createElement("img");
      markerImage.src = pinDataUrl(categoryRef.current, resolvedTheme);
      markerImage.alt = "";
      markerImage.draggable = false;
      markerImage.style.width = "32px";
      markerImage.style.height = "40px";
      markerImageRef.current = markerImage;

      const marker = new Marker({
        element: markerImage,
        anchor: "bottom",
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
      markerImageRef.current = null;
      map?.remove();
    };
  }, [resolvedTheme]);

  useEffect(() => {
    markerRef.current?.setLngLat([...value]);
  }, [value]);

  useEffect(() => {
    if (markerImageRef.current) {
      markerImageRef.current.src = pinDataUrl(category, resolvedTheme);
    }
  }, [category, resolvedTheme]);

  return (
    <div>
      <p className="mb-1.5 text-[13px] font-semibold text-fg">{label}</p>
      {/* .kentron-map fills its parent, so the height lives on the frame. */}
      <div
        className="relative h-56 overflow-hidden rounded-panel border border-line md:h-64"
        aria-busy={!loaded}
      >
        <div ref={mapElement} className="kentron-map" aria-label={label} />
        {!loaded ? (
          <div className="map-veil pointer-events-none absolute inset-0 bg-raised">
            <span className="sr-only">
              {locale === "hy" ? "Քարտեզը բեռնվում է…" : "Loading map…"}
            </span>
          </div>
        ) : null}
      </div>
      <p className="mt-1.5 text-[12px] tabular-nums text-dim">
        {hint
          ? `${hint} · `
          : locale === "hy"
            ? "Քաշեք նշիչը, սեղմեք քարտեզին կամ օգտագործեք սլաքները · "
            : "Drag the pin, tap the map, or use arrow keys · "}
        {value[1].toFixed(4)}° N, {value[0].toFixed(4)}° E
      </p>
    </div>
  );
}
