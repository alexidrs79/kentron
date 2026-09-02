"use client";

import { useState } from "react";
import type { TimeMode } from "@/lib/map/fixtures";
import { MapCanvas } from "./map-canvas";
import { MapControls } from "./map-controls";
import { MapLegend } from "./map-legend";

export default function HomePage() {
  const [mode, setMode] = useState<TimeMode>("now");

  return (
    <section className="relative h-[calc(100dvh-72px)] overflow-hidden bg-dusk md:h-dvh">
      <MapCanvas mode={mode} />
      <MapControls mode={mode} onModeChange={setMode} />
      <MapLegend />
    </section>
  );
}
