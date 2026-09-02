"use client";

import { useState } from "react";
import type { TimeMode } from "@/lib/map/fixtures";
import type { MapBounds } from "@/lib/map/viewport";
import { MapCanvas } from "./map-canvas";
import { MapControls } from "./map-controls";
import { MapLegend } from "./map-legend";
import { ViewportPanel } from "./viewport-panel";

export default function HomePage() {
  const [mode, setMode] = useState<TimeMode>("now");
  const [bounds, setBounds] = useState<MapBounds | null>(null);

  return (
    <section className="relative h-[calc(100dvh-72px)] overflow-hidden bg-dusk md:h-dvh">
      <MapCanvas mode={mode} onBoundsChange={setBounds} />
      <MapControls mode={mode} onModeChange={setMode} />
      <MapLegend />
      <ViewportPanel mode={mode} bounds={bounds} />
    </section>
  );
}
