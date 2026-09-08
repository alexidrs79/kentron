"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { imageFor, imageTreatment } from "@/lib/content";
import {
  attachCartoKey,
  loadCartoDayStyle,
  loadCartoDuskStyle,
} from "@/lib/map/carto-dusk";
import { dayStyle, duskStyle } from "@/lib/map/dusk-style";
import type { TimeMode, LivePulse, PlannedEvent } from "@/lib/map/fixtures";
import { eventCollection, pulseCollection } from "@/lib/map/fixtures";
import { addMarkerLayers } from "@/lib/map/marker-layers";
import {
  animatePulseRing,
  motionIsReduced,
  setMarkerMode,
} from "@/lib/map/marker-interactions";
import { registerPinImages } from "@/lib/map/pin-images";
import { formatAge, type MapBounds } from "@/lib/map/viewport";
import { categoryColor } from "@/lib/map/categories";

const YEREVAN_CENTER: [number, number] = [44.5136, 40.1811];
const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY;

export function MapCanvas({
  mode,
  mapTheme = "dark",
  pulses,
  events,
  selectedId,
  rightPadding,
  sheetState,
  locateRequest,
  zoomRequest,
  onLocationResult,
  onUserPosition,
  onSelect,
  onBoundsChange,
}: {
  mode: TimeMode;
  mapTheme?: "dark" | "light";
  pulses: LivePulse[];
  events: PlannedEvent[];
  selectedId: string | null;
  rightPadding: number;
  sheetState: "collapsed" | "half" | "full";
  locateRequest: number;
  /** Signed step count: each change zooms by the difference. */
  zoomRequest: number;
  onLocationResult: (message: string | null) => void;
  onUserPosition?: (origin: readonly [number, number]) => void;
  onSelect: (id: string | null) => void;
  onBoundsChange: (bounds: MapBounds) => void;
}) {
  const { locale } = useLocale();
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [retryToken, setRetryToken] = useState(0);
  const [veilOff, setVeilOff] = useState(false);
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("maplibre-gl").Map>(null);
  const popupRef = useRef<import("maplibre-gl").Popup>(null);
  const PopupRef = useRef<typeof import("maplibre-gl").Popup | null>(null);
  const lastOpenedId = useRef<string | null>(null);
  const lastZoomRequest = useRef(zoomRequest);
  const modeRef = useRef(mode);
  const onSelectRef = useRef(onSelect);
  const onBoundsChangeRef = useRef(onBoundsChange);
  const onUserPositionRef = useRef(onUserPosition);
  const pulsesRef = useRef(pulses);
  const eventsRef = useRef(events);
  const rightPaddingRef = useRef(rightPadding);
  modeRef.current = mode;
  onSelectRef.current = onSelect;
  onBoundsChangeRef.current = onBoundsChange;
  onUserPositionRef.current = onUserPosition;
  pulsesRef.current = pulses;
  eventsRef.current = events;
  rightPaddingRef.current = rightPadding;

  // Remounted from the parent with key={mapTheme}, so this setup runs once
  // per appearance.
  useEffect(() => {
    if (!mapElement.current) return;

    let disposed = false;
    let map: import("maplibre-gl").Map | undefined;

    void import("maplibre-gl").then(
      async ({ AttributionControl, Map, Popup, setWorkerUrl }) => {
        if (disposed || !mapElement.current) return;
        PopupRef.current = Popup;
        setLoaded(false);
        setVeilOff(false);
        setLoadError("");

        setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
        const style =
          mapTheme === "light"
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
          center: YEREVAN_CENTER,
          zoom: 13.4,
          transformRequest: (url) =>
            CARTO_KEY ? attachCartoKey(url, CARTO_KEY) : undefined,
          // Added below instead, so it can live in the free bottom-left
          // corner rather than under the floating results panel.
          attributionControl: false,
        });

        map.addControl(
          new AttributionControl({
            compact: true,
            customAttribution: CARTO_KEY
              ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              : '<a href="https://openfreemap.org">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          }),
          "bottom-left",
        );
        // MapLibre renders the compact control expanded; collapse it so it
        // stays a disc in the corner until someone asks for the credits.
        mapElement.current
          ?.querySelector<HTMLDetailsElement>("details.maplibregl-ctrl-attrib")
          ?.removeAttribute("open");
        mapRef.current = map;
        map.on("error", (event) => {
          const message =
            event.error instanceof Error
              ? event.error.message
              : "The map could not be loaded.";
          setLoadError(message);
        });
        map.setPadding({
          top: 76,
          bottom: window.matchMedia("(min-width: 768px)").matches ? 0 : 72,
          left: 0,
          right: window.matchMedia("(min-width: 768px)").matches
            ? rightPaddingRef.current
            : 0,
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

        map.on("load", async () => {
          if (!map) return;
          // Pin sprites must exist before the symbol layers reference them.
          await registerPinImages(map, mapTheme);
          if (disposed || !map.getStyle()) return;
          addMarkerLayers(map, pulsesRef.current, eventsRef.current, mapTheme);
          setMarkerMode(map, modeRef.current);
          stopPulse = animatePulseRing(map);
          publishBounds();
          setLoaded(true);

          const openPreview = (
            id: string,
            coordinates: [number, number],
            itemMode: TimeMode,
          ) => {
            if (!map) return;
            const item =
              itemMode === "now"
                ? pulsesRef.current.find((pulse) => pulse.id === id)
                : eventsRef.current.find((planned) => planned.id === id);
            if (!item) return;

            popupRef.current?.remove();
            if (!window.matchMedia("(min-width: 768px)").matches) {
              const camera = {
                center: coordinates,
                offset: [0, 120] as [number, number],
              };
              if (motionIsReduced()) map.jumpTo(camera);
              else map.easeTo({ ...camera, duration: 360 });
            }
            const popup = new Popup({
              className: "kentron-preview-popup",
              anchor: "bottom",
              closeButton: true,
              closeOnClick: false,
              focusAfterOpen: true,
              maxWidth: "320px",
              offset: 18,
            })
              .setLngLat(coordinates)
              .setHTML(previewHtml(item, itemMode, locale))
              .addTo(map);

            popup.on("close", () => {
              if (popupRef.current === popup) {
                popupRef.current = null;
                onSelectRef.current(null);
              }
            });
            popupRef.current = popup;
            lastOpenedId.current = id;
            onSelectRef.current(id);
          };

          const bindPreview = (layerId: string, itemMode: TimeMode) => {
            map?.on("click", layerId, (event) => {
              const id = event.features?.[0]?.properties?.id as
                string | undefined;
              const geometry = event.features?.[0]?.geometry;
              if (!id || geometry?.type !== "Point") return;
              openPreview(
                id,
                geometry.coordinates as [number, number],
                itemMode,
              );
            });
            map?.on("mouseenter", layerId, () => {
              if (map) map.getCanvas().style.cursor = "pointer";
            });
            map?.on("mouseleave", layerId, () => {
              if (map) map.getCanvas().style.cursor = "";
            });
          };

          bindPreview("pulse-point", "now");
          bindPreview("event-point", "week");

          const canvas = map.getCanvas();
          canvas.setAttribute("aria-keyshortcuts", "Enter");
          canvas.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" || !map) return;
            const point = map.project(map.getCenter());
            const layers = [
              "pulse-point",
              "event-point",
              "pulse-clusters",
              "event-clusters",
            ].filter((layer) => map?.getLayer(layer));
            const hits = map.queryRenderedFeatures(
              [
                [point.x - 28, point.y - 28],
                [point.x + 28, point.y + 28],
              ],
              { layers },
            );
            const hit = hits[0];
            if (!hit || hit.geometry.type !== "Point") return;
            event.preventDefault();
            const layerId = hit.layer?.id;
            const coords = hit.geometry.coordinates as [number, number];
            if (layerId === "pulse-clusters" || layerId === "event-clusters") {
              const clusterId = hit.properties?.cluster_id as
                number | undefined;
              if (clusterId === undefined) return;
              const source = map.getSource(
                layerId === "pulse-clusters"
                  ? "kentron-pulses"
                  : "kentron-events",
              ) as import("maplibre-gl").GeoJSONSource;
              void source.getClusterExpansionZoom(clusterId).then((zoom) => {
                const live = mapRef.current;
                if (!live) return;
                const options = { center: coords, zoom };
                if (motionIsReduced()) live.jumpTo(options);
                else live.easeTo(options);
              });
              return;
            }
            const id = hit.properties?.id as string | undefined;
            if (!id) return;
            openPreview(id, coords, layerId === "pulse-point" ? "now" : "week");
          });
        });
        map.on("click", (event) => {
          const hits = map?.queryRenderedFeatures(event.point, {
            layers: [
              "pulse-point",
              "pulse-clusters",
              "event-point",
              "event-clusters",
            ].filter((layer) => map?.getLayer(layer)),
          });
          if (!hits?.length) popupRef.current?.remove();
        });
        map.on("moveend", publishBounds);
        map.on("zoomend", publishBounds);

        if (mapElement.current) {
          resizeObserver = new ResizeObserver(() => map?.resize());
          resizeObserver.observe(mapElement.current);
        }
      },
    );

    let stopPulse: () => void = () => {};
    let resizeObserver: ResizeObserver | undefined;

    return () => {
      disposed = true;
      stopPulse();
      resizeObserver?.disconnect();
      popupRef.current?.remove();
      map?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- remounted via key={mapTheme}
  }, [locale, retryToken]);

  useEffect(() => {
    const map = mapRef.current;
    if (map?.getLayer("pulse-point")) {
      setMarkerMode(map, mode);
      popupRef.current?.remove();
    }
  }, [mode]);

  useEffect(() => {
    if (!selectedId) popupRef.current?.remove();
  }, [selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const wide = window.matchMedia("(min-width: 768px)").matches;
    const height = mapElement.current?.clientHeight ?? window.innerHeight;
    const bottom = wide
      ? 0
      : sheetState === "collapsed"
        ? 72
        : sheetState === "half"
          ? Math.round(height * 0.5)
          : Math.round(height * 0.7);
    map.setPadding({
      // Clears the floating chrome so a selected pin is never under it.
      top: 76,
      bottom,
      // Keep pins clear of the floating dock and the floating results panel.
      left: wide ? 88 : 0,
      right: wide ? rightPadding : 0,
    });
  }, [loaded, rightPadding, sheetState]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    const previous = lastZoomRequest.current;
    lastZoomRequest.current = zoomRequest;
    const step = zoomRequest - previous;
    if (step === 0) return;
    const zoom = map.getZoom() + step;
    if (motionIsReduced()) map.jumpTo({ zoom });
    else map.easeTo({ zoom, duration: 240 });
  }, [zoomRequest, loaded]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || locateRequest === 0) return;
    if (!navigator.geolocation) {
      onLocationResult("Location is not available in this browser.");
      return;
    }
    onLocationResult("Finding your location…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const options = {
          center: [coords.longitude, coords.latitude] as [number, number],
          zoom: Math.max(map.getZoom(), 14),
        };
        if (motionIsReduced()) {
          map.jumpTo(options);
        } else {
          map.easeTo({ ...options, duration: 700 });
        }
        onLocationResult("Map centered on your location.");
        onUserPositionRef.current?.([coords.longitude, coords.latitude]);
      },
      () =>
        onLocationResult(
          "Location is blocked for this site. Allow it in the browser, then try again.",
        ),
      { timeout: 5_000, maximumAge: 300_000 },
    );
  }, [locateRequest, onLocationResult]);

  useEffect(() => {
    const map = mapRef.current;
    const Popup = PopupRef.current;
    if (!loaded || !map || !Popup) return;
    if (!selectedId) {
      lastOpenedId.current = null;
      return;
    }
    if (lastOpenedId.current === selectedId && popupRef.current) return;

    const item =
      mode === "now"
        ? pulses.find((pulse) => pulse.id === selectedId)
        : events.find((event) => event.id === selectedId);
    if (!item) return;

    const options = {
      center: [...item.coordinates] as [number, number],
      zoom: Math.max(map.getZoom(), 14.2),
      offset: (window.matchMedia("(min-width: 768px)").matches
        ? [0, 0]
        : [0, 120]) as [number, number],
    };
    if (motionIsReduced()) map.jumpTo(options);
    else map.easeTo({ ...options, duration: 700 });

    popupRef.current?.remove();
    const popup = new Popup({
      className: "kentron-preview-popup",
      anchor: "bottom",
      closeButton: true,
      closeOnClick: false,
      focusAfterOpen: true,
      maxWidth: "320px",
      offset: 18,
    })
      .setLngLat([...item.coordinates])
      .setHTML(previewHtml(item, mode, locale))
      .addTo(map);
    popup.on("close", () => {
      if (popupRef.current === popup) {
        popupRef.current = null;
        lastOpenedId.current = null;
        onSelectRef.current(null);
      }
    });
    popupRef.current = popup;
    lastOpenedId.current = selectedId;
  }, [selectedId, loaded, mode, pulses, events, locale]);

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
    <div className="relative h-full w-full">
      <div
        ref={mapElement}
        className="kentron-map"
        aria-label={
          locale === "hy"
            ? "Ինտերակտիվ քարտեզ՝ կենտրոնացած Երևանի վրա"
            : "Interactive map centered on Yerevan, Armenia"
        }
        aria-describedby="map-keyboard-hint"
      />
      <p id="map-keyboard-hint" className="sr-only">
        Use the results list to open a live post or event. When the map is
        focused, arrow keys pan it and Enter opens a marker near the centre.
      </p>
      {!loaded || !veilOff ? (
        <div
          className={`map-veil absolute inset-0 z-10 ${loaded ? "opacity-0" : "opacity-100"}`}
          aria-hidden={loaded}
          aria-busy={!loaded}
          onTransitionEnd={() => {
            if (loaded) setVeilOff(true);
          }}
        >
          {loadError ? (
            <div className="pointer-events-auto absolute left-1/2 top-1/2 max-w-md -translate-x-1/2 -translate-y-1/2 rounded-ctl border border-line bg-panel px-4 py-3 text-[13px] text-fg shadow-float">
              <p role="alert">Map unavailable: {loadError}</p>
              <button
                type="button"
                className="mt-3 font-semibold text-apricot hover:text-apricot-soft"
                onClick={() => setRetryToken((token) => token + 1)}
              >
                Try again
              </button>
            </div>
          ) : (
            <span className="sr-only">Loading map…</span>
          )}
        </div>
      ) : null}
    </div>
  );
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );
}

/** The panel that lifts off a marker. Title, place, one meta line, one action. */
function previewHtml(
  item: LivePulse | PlannedEvent,
  mode: TimeMode,
  locale: "en" | "hy",
) {
  const live = mode === "now";
  const title = live
    ? (item as LivePulse).caption
    : (item as PlannedEvent).title;
  const place = live ? (item as LivePulse).place : (item as PlannedEvent).venue;
  const meta = live
    ? formatAge((item as LivePulse).ageMinutes)
    : `${(item as PlannedEvent).when} · Yerevan time`;
  const href = live ? `/post/${item.id}` : `/event/${item.id}`;
  const image = imageFor(item.id, item.imageUrl);
  const color = categoryColor(item.category);

  return `
    <article class="kentron-slip kentron-slip--${live ? "live" : "event"}">
      <img src="${escapeHtml(image)}" alt="" width="308" height="231" class="kentron-slip__image${
        imageTreatment(image) ? " kentron-slip__image--art" : ""
      }" />
      <div class="kentron-slip__body">
        <span class="kentron-slip__eyebrow">
          <span class="kentron-slip__dot" style="background:${color}" aria-hidden="true"></span>
          ${live ? (locale === "hy" ? "Ուղիղ հիմա" : "Live now") : locale === "hy" ? "Այս շաբաթ" : "This week"}
        </span>
        <h3>${escapeHtml(title)}</h3>
        <p class="kentron-slip__meta">${escapeHtml(place)} · ${escapeHtml(meta)}</p>
        <a href="${escapeHtml(href)}">
          <span>${live ? (locale === "hy" ? "Բացել ուղիղ գրառումը" : "Open live post") : locale === "hy" ? "Բացել միջոցառումը" : "Open event"}</span>
          <span class="kentron-slip__arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M5 12h13M13 7l5 5-5 5" />
            </svg>
          </span>
        </a>
      </div>
    </article>`;
}
