"use client";

import { LocateFixed, Minus, Plus } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { Segmented } from "@/components/ui/segmented";
import type { TimeMode } from "@/lib/map/fixtures";

export function MapControls({
  mode,
  onModeChange,
}: {
  mode: TimeMode;
  onModeChange: (mode: TimeMode) => void;
}) {
  const { t } = useLocale();
  return (
    <div className="pointer-events-none absolute inset-x-3 top-3 z-[500] md:left-[88px] md:right-[var(--kentron-gutter,20px)] md:top-5">
      <div className="pointer-events-auto w-fit max-w-full">
        <Segmented
          label={t("timelineLabel")}
          value={mode}
          onChange={onModeChange}
          options={[
            { value: "now", label: t("timelineNow") },
            { value: "week", label: t("timelineWeek") },
          ]}
        />
      </div>
    </div>
  );
}

/**
 * Locate and zoom share one column in the bottom-right map gutter, so the
 * stack keeps its shape whatever the button size is. It sits on the same
 * baseline as the filter button and the results panel; on a phone it rides
 * above the sheet. The stack is anchored to the map edge and slid inwards by
 * `--kentron-actions-shift`, so it travels with the panel instead of teleporting
 * the width of it.
 */
export function MapActions({
  locationMessage,
  onLocate,
  onZoomIn,
  onZoomOut,
  hiddenOnMobile,
}: {
  locationMessage: string | null;
  onLocate: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  hiddenOnMobile?: boolean;
}) {
  const { t } = useLocale();
  return (
    <>
      <div
        className={`map-actions pointer-events-none absolute bottom-[calc(var(--kentron-sheet,52%)+14px)] right-3 z-[450] flex flex-col items-end gap-2 md:bottom-5 md:right-5 ${
          hiddenOnMobile ? "hidden md:flex" : ""
        }`}
      >
        {locationMessage ? (
          <div className="pointer-events-auto max-w-[240px] rounded-ctl border border-line bg-panel px-3 py-2 text-right type-meta text-dim shadow-float">
            <p>{locationMessage}</p>
            {/try again|կրկին/i.test(locationMessage) ? (
              <button
                type="button"
                onClick={onLocate}
                className="mt-1 font-semibold text-apricot hover:text-apricot-soft"
              >
                {t("tryAgain")}
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="pointer-events-auto overflow-hidden rounded-ctl border border-line bg-panel shadow-float">
          <MapActionButton label={t("locate")} onClick={onLocate}>
            <LocateFixed size={17} strokeWidth={1.9} aria-hidden />
          </MapActionButton>
          <span aria-hidden className="hidden h-px bg-line md:block" />
          <span className="hidden md:contents">
            <MapActionButton label={t("zoomIn")} onClick={onZoomIn}>
              <Plus size={17} strokeWidth={2} aria-hidden />
            </MapActionButton>
            <span aria-hidden className="block h-px bg-line" />
            <MapActionButton label={t("zoomOut")} onClick={onZoomOut}>
              <Minus size={17} strokeWidth={2} aria-hidden />
            </MapActionButton>
          </span>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {locationMessage}
      </p>
    </>
  );
}

function MapActionButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      // Joined into one bordered stack, so the press reads as a fill rather
      // than a scale — shrinking would peel each button off its own frame.
      className="grid size-11 place-items-center text-dim [--press-scale:1] hover:bg-raised hover:text-fg active:bg-line"
    >
      {children}
    </button>
  );
}
