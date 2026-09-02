"use client";

import { LocateFixed } from "lucide-react";
import { useState } from "react";

type TimeMode = "now" | "week";

export function MapControls() {
  const [mode, setMode] = useState<TimeMode>("now");

  return (
    <div className="pointer-events-none absolute inset-x-3 top-3 z-[500] flex items-start justify-between gap-3 sm:inset-x-6 sm:top-6">
      <div
        className="pointer-events-auto flex rounded-2xl border border-line bg-dusk/95 p-1 shadow-[0_16px_45px_rgb(9_12_24/0.28)] backdrop-blur-md"
        role="group"
        aria-label="Choose a time view"
      >
        <button
          type="button"
          aria-pressed={mode === "now"}
          onClick={() => setMode("now")}
          className={`min-h-10 rounded-xl px-3.5 text-sm font-medium transition-colors sm:px-5 ${
            mode === "now"
              ? "bg-paper text-dusk"
              : "text-paper-2 hover:text-paper"
          }`}
        >
          Right now
        </button>
        <button
          type="button"
          aria-pressed={mode === "week"}
          onClick={() => setMode("week")}
          className={`min-h-10 rounded-xl px-3.5 text-sm font-medium transition-colors sm:px-5 ${
            mode === "week"
              ? "bg-paper text-dusk"
              : "text-paper-2 hover:text-paper"
          }`}
        >
          This week
        </button>
      </div>

      <div className="pointer-events-auto flex min-h-12 items-center gap-3 rounded-2xl border border-line bg-surface/95 px-3.5 shadow-[0_16px_45px_rgb(9_12_24/0.28)] backdrop-blur-md sm:px-4">
        <LocateFixed
          className="shrink-0 text-tuff"
          size={17}
          strokeWidth={1.75}
          aria-hidden
        />
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold sm:text-base">
            Kentron, Yerevan
          </p>
          <p className="hidden font-mono text-[10px] text-paper-2 sm:block">
            40.1811° N, 44.5136° E
          </p>
        </div>
      </div>
    </div>
  );
}
