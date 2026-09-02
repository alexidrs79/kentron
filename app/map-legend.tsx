"use client";

import { Layers3, X } from "lucide-react";
import { useState } from "react";

const categories = [
  { label: "Tech", color: "bg-pin-tech", shape: "rounded-[3px]" },
  { label: "Creative", color: "bg-pin-creative", shape: "rotate-45" },
  { label: "Market / outdoor", color: "bg-pin-market", shape: "rounded-full" },
];

export function MapLegend() {
  const [open, setOpen] = useState(false);

  return (
    <div className="pointer-events-auto absolute bottom-4 left-3 z-[500] flex flex-col items-start gap-2 sm:left-6 md:bottom-6">
      {open && (
        <div className="min-w-48 rounded-2xl border border-line bg-surface/95 p-4 shadow-[0_16px_45px_rgb(9_12_24/0.3)] backdrop-blur-md">
          <p className="mb-3 font-display text-sm font-semibold">Map key</p>
          <div className="flex items-center gap-3 border-b border-line pb-3">
            <span className="relative grid size-4 place-items-center">
              <span className="absolute size-4 rounded-full border border-apricot/55" />
              <span className="size-2 rounded-full bg-apricot" />
            </span>
            <span className="text-sm text-paper">Live now</span>
          </div>
          <div className="mt-3 space-y-3">
            {categories.map((category) => (
              <div key={category.label} className="flex items-center gap-3">
                <span
                  className={`ml-0.5 size-3 ${category.color} ${category.shape} border border-ararat/45`}
                />
                <span className="text-sm text-paper-2">{category.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close map legend" : "Open map legend"}
        onClick={() => setOpen((current) => !current)}
        className="grid size-12 place-items-center rounded-2xl border border-line bg-surface/95 text-paper shadow-[0_16px_45px_rgb(9_12_24/0.28)] backdrop-blur-md transition-colors hover:bg-line"
      >
        {open ? (
          <X size={19} strokeWidth={1.75} aria-hidden />
        ) : (
          <Layers3 size={19} strokeWidth={1.75} aria-hidden />
        )}
      </button>
    </div>
  );
}
