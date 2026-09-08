"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocalRecords } from "@/components/local-records";
import { usePreferences } from "@/components/preferences";
import { useUserLocation } from "@/components/user-location";
import { MapShellSkeleton } from "@/components/ui/skeleton";
import { allCategories } from "@/lib/map/categories";
import type { EventCategory, TimeMode } from "@/lib/map/fixtures";
import type { MapBounds } from "@/lib/map/viewport";
import { MapCanvas } from "./map-canvas";
import { MapActions, MapControls } from "./map-controls";
import { MapFilter } from "./map-filter";
import { ViewportPanel, type SheetState } from "./viewport-panel";

const sheetHeights: Record<SheetState, string> = {
  collapsed: "72px",
  half: "50%",
  full: "86%",
};

const sheetShifts: Record<SheetState, string> = {
  collapsed: "calc(100% - 72px)",
  half: "41.86%",
  full: "0%",
};

export default function HomePage() {
  return (
    <Suspense fallback={<MapShellSkeleton />}>
      <HomeMap />
    </Suspense>
  );
}

function HomeMap() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { preferences, ready, resolvedTheme } = usePreferences();
  const { origin, setOrigin } = useUserLocation();
  const paramMode = params.get("mode");
  const pin = params.get("pin");
  const [mode, setMode] = useState<TimeMode>(
    paramMode === "week" ? "week" : "now",
  );
  const [modeTouched, setModeTouched] = useState(Boolean(paramMode));
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(pin);
  const [locateRequest, setLocateRequest] = useState(0);
  const [zoomRequest, setZoomRequest] = useState(0);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [listCollapsed, setListCollapsed] = useState(false);
  const [sheetState, setSheetState] = useState<SheetState>("collapsed");
  const [categories, setCategories] = useState<EventCategory[]>(allCategories);
  const { pulses, events } = useLocalRecords();

  const filteredPulses = useMemo(
    () => pulses.filter((pulse) => categories.includes(pulse.category)),
    [categories, pulses],
  );
  const filteredEvents = useMemo(
    () => events.filter((event) => categories.includes(event.category)),
    [categories, events],
  );

  // Settings choose the opening timeline; an explicit ?mode or tap wins.
  useEffect(() => {
    if (ready && !modeTouched) setMode(preferences.defaultMode);
  }, [ready, modeTouched, preferences.defaultMode]);

  function changeListCollapsed(next: boolean) {
    setListCollapsed(next);
  }

  return (
    <main
      style={
        {
          "--kentron-sheet": sheetHeights[sheetState],
          "--kentron-sheet-shift": sheetShifts[sheetState],
          // Map padding, so a selected pin never lands under the panel.
          "--kentron-map-right": listCollapsed ? "0px" : "424px",
          // Right edge for floating chrome: 12px clear of the panel when it
          // is open, otherwise the same 20px inset the panel itself uses.
          "--kentron-gutter": listCollapsed ? "20px" : "428px",
          // The same 408px as a transform, so the bottom-right stack can
          // slide with the panel instead of jumping when its edge moves.
          "--kentron-actions-shift": listCollapsed ? "0px" : "-408px",
        } as CSSProperties
      }
      // `clip`, not `hidden`: the panel and its tab park outside this box
      // while they travel, and a scroll container would let focus or a
      // scroll-into-view drag the whole map chrome sideways to reach them.
      className="relative h-[calc(100dvh-76px)] min-h-0 overflow-clip bg-canvas md:h-dvh"
    >
      {/* The map is the canvas; everything else floats over it. */}
      <div className="absolute inset-0">
        <MapCanvas
          key={resolvedTheme}
          mode={mode}
          mapTheme={resolvedTheme}
          pulses={filteredPulses}
          events={filteredEvents}
          selectedId={selectedId}
          rightPadding={listCollapsed ? 0 : 436}
          sheetState={sheetState}
          locateRequest={locateRequest}
          zoomRequest={zoomRequest}
          onLocationResult={setLocationMessage}
          onUserPosition={setOrigin}
          onSelect={setSelectedId}
          onBoundsChange={setBounds}
        />
      </div>
      <MapControls
        mode={mode}
        onModeChange={(nextMode) => {
          setMode(nextMode);
          setModeTouched(true);
          setSelectedId(null);
          const nextParams = new URLSearchParams(params.toString());
          nextParams.set("mode", nextMode);
          router.replace(`${pathname}?${nextParams.toString()}`, {
            scroll: false,
          });
        }}
      />
      <MapFilter
        mode={mode}
        activeCategories={categories}
        onCategoriesChange={(nextCategories) => {
          setCategories(nextCategories);
          setSelectedId(null);
        }}
        hiddenOnMobile={sheetState === "full"}
      />
      <MapActions
        locationMessage={locationMessage}
        onLocate={() => setLocateRequest((request) => request + 1)}
        onZoomIn={() => setZoomRequest((request) => request + 1)}
        onZoomOut={() => setZoomRequest((request) => request - 1)}
        hiddenOnMobile={sheetState === "full"}
      />
      <ViewportPanel
        mode={mode}
        bounds={bounds}
        origin={origin}
        pulses={filteredPulses}
        events={filteredEvents}
        selectedId={selectedId}
        collapsed={listCollapsed}
        onCollapsedChange={changeListCollapsed}
        sheetState={sheetState}
        onSheetStateChange={setSheetState}
      />
    </main>
  );
}
