"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Bookmark,
  ChevronDown,
  ChevronUp,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocalRecords } from "@/components/local-records";
import { PlaceRow, RowStack } from "@/components/place-row";
import { usePreferences } from "@/components/preferences";
import { useLocale } from "@/components/locale-provider";
import { buttonClass } from "@/components/ui/button";
import { loginHref } from "@/lib/auth/paths";
import {
  compactAge,
  groupByDay,
  imageFor,
  parseWhen,
  sortByAge,
  yerevanWeekday,
} from "@/lib/content";
import { distanceMeters, formatDistance } from "@/lib/geo";
import type { LivePulse, PlannedEvent, TimeMode } from "@/lib/map/fixtures";
import { motionIsReduced } from "@/lib/map/marker-interactions";
import { isInBounds, type MapBounds } from "@/lib/map/viewport";
import {
  type SaveableContentType,
  type SavedContent,
  useSavedEvents,
} from "@/lib/saved-events";

export type SheetState = "collapsed" | "half" | "full";

/**
 * Results float over the map rather than sitting in a column beside it: a
 * panel inset from every edge on desktop, a draggable sheet on a phone.
 */
export function ViewportPanel({
  mode,
  bounds,
  origin,
  pulses,
  events,
  selectedId,
  collapsed,
  onCollapsedChange,
  sheetState,
  onSheetStateChange,
}: {
  mode: TimeMode;
  bounds: MapBounds | null;
  origin: readonly [number, number] | null;
  pulses: LivePulse[];
  events: PlannedEvent[];
  selectedId: string | null;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  sheetState: SheetState;
  onSheetStateChange: (state: SheetState) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const { preferences } = usePreferences();
  const { t } = useLocale();
  const { authenticated, isSaved, isBusy, toggle } = useSavedEvents();
  const { ready: recordsReady, failed: recordsFailed } = useLocalRecords();
  const [today, setToday] = useState("");
  // Collapsing hides the control that was just used, so hand focus to the
  // control that replaces it rather than dropping it on the body.
  const tabButton = useRef<HTMLButtonElement>(null);
  const hideButton = useRef<HTMLButtonElement>(null);

  const toggleSaved = (content: SavedContent) => {
    if (!authenticated) {
      const returnTo = `${pathname}${search.toString() ? `?${search.toString()}` : ""}`;
      router.push(loginHref(returnTo, "save"));
      return;
    }
    void toggle(content);
  };

  useEffect(() => setToday(yerevanWeekday()), []);

  useEffect(() => {
    if (!selectedId) return;
    document.getElementById(`place-row-${selectedId}`)?.scrollIntoView({
      behavior: motionIsReduced() ? "auto" : "smooth",
      block: "nearest",
    });
  }, [selectedId, preferences.reduceMotion]);

  const inView = (coordinates: readonly [number, number]) =>
    !bounds || isInBounds(coordinates, bounds);

  const visiblePulses = useMemo(
    () => sortByAge(pulses.filter((item) => inView(item.coordinates))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pulses, bounds],
  );
  const visibleEvents = useMemo(
    () => events.filter((item) => inView(item.coordinates)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events, bounds],
  );

  const count = mode === "now" ? visiblePulses.length : visibleEvents.length;
  const dayGroups = useMemo(
    () => groupByDay(visibleEvents, today),
    [visibleEvents, today],
  );

  const away = (coordinates: readonly [number, number]) =>
    origin
      ? formatDistance(distanceMeters(origin, coordinates), preferences.units)
      : null;

  return (
    <>
      {/*
        Desktop only. Both halves of the disclosure stay mounted so the panel
        can travel out to the edge it lives against and the tab can arrive in
        its place; `inert` keeps the hidden one out of tab order and away from
        the pointer while it is still on the page.
      */}
      <div
        data-collapsed={collapsed}
        inert={!collapsed}
        className="results-tab pointer-events-none absolute right-0 top-1/2 z-[400] hidden -translate-y-1/2 md:block"
      >
        <button
          ref={tabButton}
          type="button"
          onClick={() => {
            onCollapsedChange(false);
            requestAnimationFrame(() =>
              hideButton.current?.focus({ preventScroll: true }),
            );
          }}
          aria-expanded={!collapsed}
          aria-controls="results-panel"
          className="group pointer-events-auto flex min-h-[148px] w-12 flex-col items-center justify-center gap-3 rounded-l-panel border border-r-0 border-line bg-panel py-3 type-meta font-semibold shadow-float hover:bg-raised"
        >
          <PanelRightOpen
            size={17}
            strokeWidth={1.8}
            className="text-dim group-hover:text-fg"
            aria-hidden
          />
          <span
            aria-hidden
            className={`type-data grid min-w-6 place-items-center rounded-full px-1.5 py-0.5 ${
              mode === "now"
                ? "bg-apricot text-on-apricot"
                : "bg-fg text-canvas"
            }`}
          >
            {count}
          </span>
          <span className="[writing-mode:vertical-rl]">
            {mode === "now" ? t("liveResults") : t("plannedResults")}
          </span>
        </button>
      </div>

      <aside
        id="results-panel"
        data-collapsed={collapsed}
        inert={collapsed}
        className="results-panel pointer-events-auto absolute inset-y-5 right-5 z-[400] hidden w-[396px] flex-col overflow-hidden rounded-panel border border-line bg-panel shadow-float md:flex"
      >
        <div className="flex shrink-0 items-start gap-3 border-b border-line px-5 pb-3.5 pt-4">
          <div className="min-w-0 flex-1">
            <h2 className="type-title leading-none">
              {mode === "now" ? t("rightNow") : t("thisWeek")}
            </h2>
            <p
              className="type-meta mt-1.5 text-dim"
              aria-live="polite"
            >
              {count} {mode === "now" ? t("liveInView") : t("plannedInView")} ·{" "}
              {t("yerevan")}
            </p>
          </div>
          <button
            ref={hideButton}
            type="button"
            onClick={() => {
              onCollapsedChange(true);
              // The control being focused is still mid-travel and partly
              // outside the map, so scrolling to it must be suppressed.
              requestAnimationFrame(() =>
                tabButton.current?.focus({ preventScroll: true }),
              );
            }}
            aria-expanded={!collapsed}
            aria-controls="results-panel"
            title={t("hideList")}
            className="-mr-1.5 grid size-11 shrink-0 place-items-center rounded-ctl text-dim [--press-scale:0.94] hover:bg-raised hover:text-fg"
          >
            <PanelRightClose size={17} strokeWidth={1.9} aria-hidden />
            <span className="sr-only">{t("hideList")}</span>
          </button>
        </div>

        <div className="relative min-h-0 flex-1">
          {/* Keyed on mode: the timeline swap replaces every row at once, a
              map pan does not, and only the former needs bridging. */}
          <div
            key={mode}
            className="results-swap scroll-dark h-full overflow-y-auto"
          >
            <Results
              mode={mode}
              count={count}
              visiblePulses={visiblePulses}
              dayGroups={dayGroups}
              selectedId={selectedId}
              away={away}
              isSaved={isSaved}
              isBusy={isBusy}
              toggle={toggleSaved}
              recordsReady={recordsReady}
              recordsFailed={recordsFailed}
            />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-panel to-transparent"
          />
        </div>

        {/* The list only ever holds what is in view, so offer the whole city. */}
        <Link
          href={mode === "now" ? "/search?mode=now" : "/search"}
          className="type-ui flex min-h-12 shrink-0 items-center justify-between gap-3 border-t border-line px-5 font-medium text-dim hover:bg-raised hover:text-fg"
        >
          {t("searchAllYerevan")}
          <ArrowRight size={15} strokeWidth={2} aria-hidden />
        </Link>
      </aside>

      <MobileSheet
        mode={mode}
        count={count}
        sheetState={sheetState}
        onSheetStateChange={onSheetStateChange}
      >
        <Results
          mode={mode}
          count={count}
          visiblePulses={visiblePulses}
          dayGroups={dayGroups}
          selectedId={selectedId}
          away={away}
          isSaved={isSaved}
          isBusy={isBusy}
          toggle={toggleSaved}
          recordsReady={recordsReady}
          recordsFailed={recordsFailed}
        />
      </MobileSheet>
    </>
  );
}

function MobileSheet({
  mode,
  count,
  sheetState,
  onSheetStateChange,
  children,
}: {
  mode: TimeMode;
  count: number;
  sheetState: SheetState;
  onSheetStateChange: (state: SheetState) => void;
  children: React.ReactNode;
}) {
  const { locale, t } = useLocale();
  return (
    <aside
      id="results-sheet"
      className="results-sheet pointer-events-auto absolute inset-x-0 bottom-0 z-[400] flex h-[86%] translate-y-[var(--kentron-sheet-shift)] transform-gpu flex-col overflow-hidden rounded-t-sheet border-t border-line bg-panel shadow-sheet transition-transform duration-300 [transition-timing-function:var(--ease-drawer)] md:hidden"
    >
      <button
        type="button"
        aria-expanded={sheetState !== "collapsed"}
        aria-controls="results-sheet"
        aria-label={
          locale === "hy"
            ? `Արդյունքների վահանակը ${sheetState} վիճակում է։ Փոխել բարձրությունը`
            : `Results sheet is ${sheetState}. Change its height`
        }
        onClick={() =>
          onSheetStateChange(
            sheetState === "collapsed"
              ? "half"
              : sheetState === "half"
                ? "full"
                : "collapsed",
          )
        }
        className="relative flex min-h-[72px] w-full shrink-0 items-center gap-3 border-b border-line px-4 pt-2 text-left hover:bg-raised"
      >
        <span
          aria-hidden
          className="absolute top-2 left-1/2 h-[3px] w-9 -translate-x-1/2 rounded-full bg-dim/40"
        />
        <span className="type-ui">
          {mode === "now" ? t("liveResults") : t("plannedResults")}
        </span>
        <span className="type-meta ml-auto text-dim">
          {count}
        </span>
        {sheetState === "collapsed" ? (
          <ChevronUp
            size={16}
            strokeWidth={1.9}
            className="text-dim"
            aria-hidden
          />
        ) : (
          <ChevronDown
            size={16}
            strokeWidth={1.9}
            className="text-dim"
            aria-hidden
          />
        )}
      </button>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div className="scroll-dark h-full overflow-y-auto">{children}</div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-panel to-transparent"
        />
      </div>
    </aside>
  );
}

function Results({
  mode,
  count,
  visiblePulses,
  dayGroups,
  selectedId,
  away,
  isSaved,
  isBusy,
  toggle,
  recordsReady,
  recordsFailed,
}: {
  mode: TimeMode;
  count: number;
  visiblePulses: LivePulse[];
  dayGroups: { day: string; label: string; items: PlannedEvent[] }[];
  selectedId: string | null;
  away: (coordinates: readonly [number, number]) => string | null;
  isSaved: (type: SaveableContentType, id: string) => boolean;
  isBusy: (type: SaveableContentType, id: string) => boolean;
  toggle: (content: SavedContent) => void;
  recordsReady: boolean;
  recordsFailed: boolean;
}) {
  // "Nothing here" is only true once the city has actually been read.
  if (count === 0) {
    if (recordsFailed) return <ResultsFailed />;
    if (!recordsReady) return <ResultsLoading />;
    return <EmptyState mode={mode} />;
  }

  if (mode === "now") {
    return (
      <RowStack>
        {visiblePulses.map((pulse) => {
          const saved = isSaved("live", pulse.id);
          const expiresAt =
            pulse.expiresAt ??
            new Date(
              Date.now() + Math.max(1, 240 - pulse.ageMinutes) * 60_000,
            ).toISOString();
          return (
            <PlaceRow
              key={pulse.id}
              live
              href={`/post/${pulse.id}`}
              image={imageFor(pulse.id, pulse.imageUrl)}
              lead={`${compactAge(pulse.ageMinutes)} ago`}
              category={pulse.category}
              title={pulse.caption}
              meta={
                away(pulse.coordinates)
                  ? `${pulse.place} · ${away(pulse.coordinates)} away`
                  : pulse.place
              }
              selected={selectedId === pulse.id}
              rowId={`place-row-${pulse.id}`}
              trailing={
                <SaveRowButton
                  saved={saved}
                  busy={isBusy("live", pulse.id)}
                  title={pulse.caption}
                  onClick={() =>
                    toggle({ id: pulse.id, type: "live", expiresAt })
                  }
                />
              }
            />
          );
        })}
      </RowStack>
    );
  }

  return (
    <>
      {dayGroups.map((group) => (
        <section key={group.day}>
          <GroupHeader label={group.label} count={group.items.length} />
          <RowStack>
            {group.items.map((event) => {
              const saved = isSaved("event", event.id);
              return (
                <PlaceRow
                  key={event.id}
                  href={`/event/${event.id}`}
                  image={imageFor(event.id, event.imageUrl)}
                  lead={parseWhen(event.when).time}
                  category={event.category}
                  title={event.title}
                  meta={
                    away(event.coordinates)
                      ? `${event.venue} · ${away(event.coordinates)} away`
                      : event.venue
                  }
                  selected={selectedId === event.id}
                  rowId={`place-row-${event.id}`}
                  trailing={
                    <SaveRowButton
                      saved={saved}
                      busy={isBusy("event", event.id)}
                      title={event.title}
                      onClick={() => toggle({ id: event.id, type: "event" })}
                    />
                  }
                />
              );
            })}
          </RowStack>
        </section>
      ))}
    </>
  );
}

function SaveRowButton({
  saved,
  busy = false,
  title,
  onClick,
}: {
  saved: boolean;
  busy?: boolean;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
      disabled={busy}
      onClick={onClick}
      className={`grid size-11 place-items-center rounded-ctl disabled:opacity-60 ${
        saved ? "text-apricot" : "text-dim hover:bg-raised hover:text-fg"
      }`}
    >
      <Bookmark
        size={16}
        strokeWidth={1.9}
        fill={saved ? "currentColor" : "none"}
        aria-hidden
      />
    </button>
  );
}

function GroupHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="sticky top-0 z-10 flex items-baseline justify-between gap-3 bg-panel/95 px-4 pb-2 pt-4 backdrop-blur-sm">
      <h3 className="type-meta text-dim">{label}</h3>
      <span className="type-data text-faint">{count}</span>
    </div>
  );
}

function ResultsLoading() {
  const { locale } = useLocale();
  return (
    <div className="px-5 py-8" aria-busy="true">
      <div className="skeleton h-4 w-[42%] rounded-thumb" />
      <div className="skeleton mt-3 h-4 w-[68%] rounded-thumb" />
      <span className="sr-only">
        {locale === "hy"
          ? "Բեռնվում է՝ ինչ է կատարվում Երևանում…"
          : "Reading what is happening in Yerevan…"}
      </span>
    </div>
  );
}

function ResultsFailed() {
  const { locale, t } = useLocale();
  return (
    <div className="px-5 py-8" role="alert">
      <p className="type-lede">
        {locale === "hy"
          ? "Կենտրոնը չկարողացավ կապ հաստատել։"
          : "Kentron could not reach the city."}
      </p>
      <p className="type-body mt-2 text-dim">
        {locale === "hy"
          ? "Սա կապի խնդիր է, ոչ թե դատարկ քարտեզ։ Ստուգեք կապը և կրկին փորձեք։"
          : "This is a connection problem, not an empty map. Check your network and try again."}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(new Event("kentron-records-change"))
          }
          className={buttonClass({ tone: "primary", size: "sm" })}
        >
          {t("tryAgain")}
        </button>
      </div>
    </div>
  );
}

function EmptyState({ mode }: { mode: TimeMode }) {
  const { locale } = useLocale();
  return (
    <div className="px-5 py-8">
      <p className="type-lede">
        {locale === "hy"
          ? mode === "now"
            ? "Քաղաքի այս հատվածում հիմա հանգիստ է։"
            : "Այս հատվածում ոչինչ նախատեսված չէ։"
          : mode === "now"
            ? "Quiet in this part of town."
            : "Nothing planned in this area."}
      </p>
      <p className="type-body mt-2 text-dim">
        {locale === "hy"
          ? mode === "now"
            ? "Ուղիղ գրառումները տևում են մի քանի ժամ։ Եթե այստեղ ինչ-որ բան է կատարվում, առաջինը դուք կարող եք այն տեղադրել քարտեզին։"
            : "Տեղափոխեք քարտեզը կամ հրապարակեք ձեր միջոցառումը։"
          : mode === "now"
            ? "Live posts last a few hours. If something is happening here, you can be the first to put it on the map."
            : "Move the map, or publish an event of your own."}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={mode === "now" ? "/create?kind=live" : "/create?kind=event"}
          className={buttonClass({ tone: "primary", size: "sm" })}
        >
          {locale === "hy"
            ? mode === "now"
              ? "Հրապարակել տեսածը"
              : "Հրապարակել միջոցառում"
            : mode === "now"
              ? "Post what you see"
              : "Publish an event"}
        </Link>
      </div>
    </div>
  );
}
