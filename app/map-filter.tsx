"use client";

import { Check, Layers } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { categoryName } from "@/lib/content";
import { allCategories, categoryOptions } from "@/lib/map/categories";
import type { EventCategory, TimeMode } from "@/lib/map/fixtures";

export function MapFilter({
  mode,
  activeCategories,
  onCategoriesChange,
  /** At the full sheet there is no map left to filter. */
  hiddenOnMobile,
}: {
  mode: TimeMode;
  activeCategories: EventCategory[];
  onCategoriesChange: (categories: EventCategory[]) => void;
  hiddenOnMobile?: boolean;
}) {
  const { locale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const firstOption = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const filtered = activeCategories.length !== allCategories.length;

  useEffect(() => {
    if (!open) return;
    firstOption.current?.focus();
    const returnFocus = () => {
      if (container.current?.contains(document.activeElement))
        trigger.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      // The popover stays in the DOM but goes inert, so focus has to be
      // handed back rather than left on a control nobody can reach.
      returnFocus();
    };
  }, [open]);

  function toggle(category: EventCategory) {
    const selected = activeCategories.includes(category);
    if (selected && activeCategories.length === 1) {
      setBlocked(true);
      return;
    }
    setBlocked(false);
    onCategoriesChange(
      selected
        ? activeCategories.filter((item) => item !== category)
        : [...activeCategories, category],
    );
  }

  return (
    <div
      ref={container}
      className={`pointer-events-auto absolute bottom-[calc(var(--kentron-sheet,52%)+14px)] left-3 z-[450] md:bottom-5 md:left-[88px] ${
        hiddenOnMobile ? "hidden md:block" : ""
      }`}
    >
      {/* Kept mounted so it can leave the way it arrived; `inert` takes it out
          of tab order and off the pointer while it is closed. */}
      <div
        role="group"
        aria-label={t("filterAria")}
        data-open={open}
        inert={!open}
        className="map-filter-popover absolute bottom-[calc(100%+8px)] left-0 w-[calc(100vw-24px)] max-w-[366px] overflow-hidden rounded-panel border border-line bg-panel shadow-float md:w-[252px]"
      >
        <div className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-3">
          <p className="text-[13px] font-semibold">{t("showOnMap")}</p>
          {filtered ? (
            <button
              type="button"
              onClick={() => onCategoriesChange(allCategories)}
              className="text-[12px] font-semibold text-apricot hover:text-apricot-soft"
            >
              {t("showAll")}
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-2 md:block">
          {categoryOptions.map((category, index) => {
            const active = activeCategories.includes(category.id);
            const mobileBottomBorder = index < categoryOptions.length - 2;
            const desktopBottomBorder = index < categoryOptions.length - 1;
            return (
              <button
                key={category.id}
                ref={index === 0 ? firstOption : undefined}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(category.id)}
                className={`flex w-full min-h-13 items-center gap-2.5 px-3 text-left text-[12.5px] leading-4 hover:bg-raised md:min-h-12 md:gap-3 md:px-4 md:text-[13.5px] ${
                  active ? "text-fg" : "text-faint"
                } ${index % 2 === 0 ? "border-r border-line md:border-r-0" : ""} ${
                  mobileBottomBorder ? "border-b border-line" : ""
                } ${desktopBottomBorder ? "md:border-b md:border-line" : "md:border-b-0"}`}
              >
                <span
                  aria-hidden
                  className="size-3 shrink-0 rounded-full transition-opacity duration-150"
                  style={{
                    backgroundColor: category.color,
                    opacity: active ? 1 : 0.3,
                  }}
                />
                <span className="min-w-0 flex-1 md:truncate">
                  {categoryName(category.id, locale)}
                </span>
                {/* Always present: mounting the tick on toggle shifted the
                      label it sits beside. */}
                <Check
                  size={15}
                  strokeWidth={2.4}
                  aria-hidden
                  className={`kentron-filter-check shrink-0 text-apricot transition-[opacity,transform] duration-150 [transition-timing-function:var(--ease-out-soft)] motion-reduce:transition-none ${
                    active ? "scale-100 opacity-100" : "scale-90 opacity-0"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <p
          className="border-t border-line px-4 py-3 text-[11.5px] leading-4 text-dim"
          aria-live="polite"
        >
          {blocked
            ? t("keepCategory")
            : mode === "now"
              ? t("livePins")
              : t("plannedPins")}
        </p>
      </div>

      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={t("filterAria")}
        className={`flex min-h-11 items-center gap-2 rounded-ctl border border-line bg-panel px-3 text-[13px] font-medium shadow-float [--press-scale:0.97] hover:bg-raised ${
          open ? "text-fg" : "text-dim"
        }`}
      >
        <Layers size={17} strokeWidth={1.9} aria-hidden />
        <span className="hidden sm:inline">{t("filter")}</span>
        {filtered ? (
          <span className="grid min-w-5 place-items-center rounded-full bg-apricot px-1 text-[11px] font-semibold tabular-nums text-on-apricot">
            {activeCategories.length}
          </span>
        ) : null}
      </button>
    </div>
  );
}
