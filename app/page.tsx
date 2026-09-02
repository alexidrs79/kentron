"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocalRecords } from "@/components/local-records";
import type { TimeMode } from "@/lib/map/fixtures";
import type { MapBounds } from "@/lib/map/viewport";
import { MapCanvas } from "./map-canvas";
import { MapControls } from "./map-controls";
import { MapLegend } from "./map-legend";
import { ViewportPanel } from "./viewport-panel";

export default function HomePage() {
  return (
    <Suspense>
      <HomeMap />
    </Suspense>
  );
}

function HomeMap() {
  const params = useSearchParams();
  const [mode, setMode] = useState<TimeMode>(
    params.get("mode") === "week" ? "week" : "now",
  );
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const { pulses, events } = useLocalRecords();

  return (
    <section className="relative h-[calc(100dvh-72px)] overflow-hidden bg-dusk md:h-dvh">
      <MapCanvas
        mode={mode}
        pulses={pulses}
        events={events}
        onBoundsChange={setBounds}
      />
      <MapControls mode={mode} onModeChange={setMode} />
      <MapLegend />
      <ViewportPanel
        mode={mode}
        bounds={bounds}
        pulses={pulses}
        events={events}
      />
    </section>
  );
}
