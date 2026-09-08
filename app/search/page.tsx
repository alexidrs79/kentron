"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Map, Search as SearchIcon, X } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RouteSkeleton } from "@/components/ui/skeleton";
import { useLocalRecords } from "@/components/local-records";
import { useLocale } from "@/components/locale-provider";
import { usePreferences } from "@/components/preferences";
import { useUserLocation } from "@/components/user-location";
import { buttonClass } from "@/components/ui/button";
import { Page } from "@/components/ui/page";
import { Segmented } from "@/components/ui/segmented";
import {
  compactAge,
  groupByDay,
  imageFor,
  imageTreatment,
  parseWhen,
  sortByAge,
  yerevanWeekday,
} from "@/lib/content";
import { distanceMeters, formatDistance } from "@/lib/geo";
import type { LivePulse, PlannedEvent, TimeMode } from "@/lib/map/fixtures";
import { formatAge } from "@/lib/map/viewport";

export default function SearchPage() {
  return (
    <Suspense fallback={<RouteSkeleton />}>
      <SearchBody />
    </Suspense>
  );
}

function SearchBody() {
  const {
    pulses,
    events,
    ready: recordsReady,
    failed: recordsFailed,
  } = useLocalRecords();
  const { preferences, ready } = usePreferences();
  const { locale, t } = useLocale();
  const params = useSearchParams();
  const router = useRouter();
  const paramMode = params.get("mode");
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<TimeMode>(
    paramMode === "now" ? "now" : "week",
  );
  const [modeTouched, setModeTouched] = useState(
    paramMode === "now" || paramMode === "week",
  );
  const [today, setToday] = useState("");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => setToday(yerevanWeekday()), []);
  useEffect(() => {
    if (ready && !modeTouched) setMode(preferences.defaultMode);
  }, [ready, modeTouched, preferences.defaultMode]);

  const needle = query.trim().toLowerCase();

  const eventResults = useMemo(
    () =>
      events.filter((event) => {
        const haystack =
          `${event.title} ${event.venue} ${event.organizer}`.toLowerCase();
        return haystack.includes(needle);
      }),
    [events, needle],
  );

  const pulseResults = useMemo(
    () =>
      sortByAge(
        pulses.filter((pulse) => {
          const haystack = `${pulse.caption} ${pulse.place}`.toLowerCase();
          return haystack.includes(needle);
        }),
      ),
    [pulses, needle],
  );

  const results = mode === "week" ? eventResults : pulseResults;
  const featured = results[0];
  const dayGroups = useMemo(
    () => groupByDay(eventResults.slice(1), today),
    [eventResults, today],
  );

  return (
    <Page>
      <header className="grid items-center gap-3 md:grid-cols-[minmax(280px,1fr)_auto_auto] md:gap-4">
          <label className="group relative block" htmlFor="search-yerevan">
            <h1 className="sr-only">{t("searchYerevan")}</h1>
            <SearchIcon
              aria-hidden
              size={22}
              strokeWidth={1.8}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-dim transition-colors group-focus-within:text-fg"
            />
            <input
              id="search-yerevan"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchYerevan")}
              className="type-title min-h-14 w-full rounded-ctl border border-line bg-panel pl-12 pr-12 font-medium text-fg shadow-float outline-none placeholder:text-dim focus:border-apricot md:min-h-16 md:pl-14"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={t("clearSearch")}
                className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-ctl text-dim hover:bg-raised hover:text-fg"
              >
                <X size={17} strokeWidth={2} />
              </button>
            ) : null}
          </label>
          <span aria-hidden className="hidden md:block" />
          <div className="[&>[role=group]]:w-full [&_[role=group]>button]:flex-1 md:w-[226px]">
            <Segmented
              label={
                locale === "hy"
                  ? "Որ ժամանակացույցում որոնել"
                  : "Which timeline to search"
              }
              value={mode}
              onChange={(nextMode) => {
                setMode(nextMode);
                setModeTouched(true);
                const next = new URLSearchParams(params.toString());
                next.set("mode", nextMode);
                router.replace(`/search?${next.toString()}`, { scroll: false });
              }}
              options={[
                { value: "now", label: t("rightNow") },
                { value: "week", label: t("thisWeek") },
              ]}
            />
          </div>
          <p
            aria-live="polite"
            className="type-lede hidden min-w-[92px] text-right tabular-nums text-dim md:block"
          >
            {results.length}{" "}
            {locale === "hy"
              ? "արդյունք"
              : results.length === 1
                ? "result"
                : "results"}
          </p>
        </header>

        <div className="mt-4 flex items-center justify-between md:hidden">
          <p className="type-meta text-dim">
            {results.length}{" "}
            {locale === "hy"
              ? "արդյունք"
              : results.length === 1
                ? "result"
                : "results"}
          </p>
          <MapLink mode={mode} />
        </div>

        {results.length === 0 && (!recordsReady || recordsFailed) ? (
          <SearchNotice failed={recordsFailed} />
        ) : results.length === 0 ? (
          <EmptySearch
            mode={mode}
            locale={locale}
            hasQuery={Boolean(needle)}
            onClear={() => setQuery("")}
            onSwitch={() => setMode(mode === "week" ? "now" : "week")}
          />
        ) : (
          <div className="mt-6 grid items-start gap-7 lg:mt-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:gap-10">
            <FeaturedResult item={featured} mode={mode} />

            <div className="min-w-0">
              {mode === "week" ? (
                <div className="space-y-7">
                  {dayGroups.map((group, groupIndex) => (
                    <ResultGroup
                      key={group.day}
                      label={group.label}
                      items={
                        expanded
                          ? group.items
                          : group.items.slice(0, groupIndex === 0 ? 2 : 1)
                      }
                    />
                  ))}
                  {!expanded && eventResults.length > 5 ? (
                    <button
                      type="button"
                      onClick={() => setExpanded(true)}
                      className="inline-flex min-h-10 items-center gap-2 type-ui text-apricot hover:text-apricot-soft"
                    >
                      {locale === "hy"
                        ? `Դիտել ևս ${eventResults.length - 4} միջոցառում`
                        : `See ${eventResults.length - 4} more this week`}
                      <ArrowRight size={15} strokeWidth={2} aria-hidden />
                    </button>
                  ) : null}
                </div>
              ) : (
                <ResultGroup
                  label={
                    locale === "hy" ? "Ուղիղ՝ Երևանում" : "Live in Yerevan"
                  }
                  items={pulseResults.slice(1)}
                  live
                />
              )}

              <div className="mt-5 hidden items-center justify-between border-t border-line pt-4 md:flex">
                <p className="type-meta text-dim">
                  {needle
                    ? `${t("resultsFor")} “${query.trim()}”`
                    : t("acrossYerevan")}
                </p>
                <MapLink mode={mode} />
              </div>
            </div>
          </div>
        )}
    </Page>
  );
}

function useAway() {
  const { origin } = useUserLocation();
  const { preferences } = usePreferences();
  return (coordinates: readonly [number, number]) =>
    origin
      ? formatDistance(distanceMeters(origin, coordinates), preferences.units)
      : null;
}

function FeaturedResult({
  item,
  mode,
}: {
  item: PlannedEvent | LivePulse | undefined;
  mode: TimeMode;
}) {
  const away = useAway();
  const { locale } = useLocale();
  if (!item) return null;

  const live = mode === "now";
  const event = live ? null : (item as PlannedEvent);
  const pulse = live ? (item as LivePulse) : null;
  const href = live ? `/post/${item.id}` : `/event/${item.id}`;
  const title = live ? pulse!.caption : event!.title;
  const lead = live
    ? `${compactAge(pulse!.ageMinutes)} ${locale === "hy" ? "առաջ" : "ago"}`
    : `${parseWhen(event!.when).time}`;
  const place = live ? pulse!.place : event!.venue;
  const supporting = live
    ? formatAge(pulse!.ageMinutes)
    : event!.organizer === event!.venue
      ? locale === "hy"
        ? "Այս շաբաթ նախատեսված"
        : "Planned this week"
      : event!.organizer;

  return (
    <article className="group overflow-hidden rounded-panel border border-line bg-panel shadow-float">
      <Link href={href} className="block">
        <Image
          src={imageFor(item.id, item.imageUrl)}
          alt=""
          priority
          width={1200}
          height={900}
          className={`aspect-[4/3] w-full object-cover ${imageTreatment(
            imageFor(item.id, item.imageUrl),
          )}`}
        />
        <span className="block px-5 pb-5 pt-4 md:min-h-[260px] md:px-6 md:pb-6">
          <span
            className={`type-meta block ${
              live ? "text-apricot" : "text-dim"
            }`}
          >
            {lead}
          </span>
          <span className="type-title mt-1.5 block font-medium">
            {title}
          </span>
          <span className="type-meta mt-2 block text-dim">
            {away(item.coordinates)
              ? `${place} · ${away(item.coordinates)} away`
              : place}
          </span>
          <span className="type-ui mt-4 flex items-center justify-between border-t border-line pt-4 font-medium text-dim">
            <span>{supporting}</span>
            <span className="inline-flex items-center gap-2 font-semibold text-fg transition-colors group-hover:text-apricot">
              View details
              <ArrowRight size={15} strokeWidth={2} aria-hidden />
            </span>
          </span>
        </span>
      </Link>
    </article>
  );
}

function ResultGroup({
  label,
  items,
  live = false,
}: {
  label: string;
  items: (PlannedEvent | LivePulse)[];
  live?: boolean;
}) {
  if (!items.length) return null;

  return (
    <section>
      <div className="mb-1.5 flex items-center gap-3">
        <h2 className="type-ui shrink-0 text-dim">{label}</h2>
        <span aria-hidden className="h-px flex-1 bg-line" />
      </div>
      <div className="divide-y divide-line/75">
        {items.map((item) => (
          <SearchResultRow key={item.id} item={item} live={live} />
        ))}
      </div>
    </section>
  );
}

function SearchResultRow({
  item,
  live,
}: {
  item: PlannedEvent | LivePulse;
  live: boolean;
}) {
  const away = useAway();
  const event = live ? null : (item as PlannedEvent);
  const pulse = live ? (item as LivePulse) : null;
  const href = live ? `/post/${item.id}` : `/event/${item.id}`;
  const lead = live
    ? `${compactAge(pulse!.ageMinutes)} ago`
    : parseWhen(event!.when).time;
  const title = live ? pulse!.caption : event!.title;
  const place = live ? pulse!.place : event!.venue;
  const supporting = live
    ? formatAge(pulse!.ageMinutes)
    : event!.organizer === place
      ? ""
      : event!.organizer;

  return (
    <Link
      href={href}
      className="group grid min-h-[92px] grid-cols-[68px_minmax(0,1fr)_auto] items-center gap-3 py-3 hover:text-apricot md:min-h-[120px] md:grid-cols-[132px_minmax(0,1fr)_auto] md:gap-4"
    >
      <Image
        src={imageFor(item.id, item.imageUrl)}
        alt=""
        width={264}
        height={198}
        className={`aspect-[4/3] w-full rounded-thumb object-cover shadow-thumb ${imageTreatment(
          imageFor(item.id, item.imageUrl),
        )}`}
      />
      <span className="min-w-0">
        <span
          className={`type-meta block ${
            live ? "text-apricot" : "text-dim"
          }`}
        >
          {lead}
        </span>
        <span className="type-lede mt-1 line-clamp-2 block text-fg">
          {title}
        </span>
        <span className="type-meta mt-1 block truncate text-dim">
          {place}
          {away(item.coordinates) ? ` · ${away(item.coordinates)} away` : ""}
          {supporting ? ` · ${supporting}` : ""}
        </span>
      </span>
      <ArrowRight
        size={16}
        strokeWidth={1.8}
        className="kentron-motion-nudge mr-1 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-apricot"
        aria-hidden
      />
    </Link>
  );
}

function MapLink({ mode }: { mode: TimeMode }) {
  const { locale } = useLocale();
  return (
    <Link
      href={mode === "week" ? "/?mode=week" : "/?mode=now"}
      className={buttonClass({ tone: "quiet", size: "sm" })}
    >
      <Map size={15} strokeWidth={1.9} aria-hidden />
      {locale === "hy" ? "Դիտել քարտեզին" : "View on map"}
    </Link>
  );
}

/** "No matches" is only honest once the city has been read successfully. */
function SearchNotice({ failed }: { failed: boolean }) {
  const { locale } = useLocale();
  return (
    <div
      className="mt-[12vh] max-w-[560px]"
      role={failed ? "alert" : undefined}
      aria-busy={failed ? undefined : true}
    >
      <p className="type-title">
        {failed
          ? locale === "hy"
            ? "Կենտրոնը չկարողացավ կապ հաստատել։"
            : "Kentron could not reach the city."
          : locale === "hy"
            ? "Բեռնվում է՝ ինչ է կատարվում…"
            : "Reading what is happening…"}
      </p>
      <p className="type-body mt-2 text-dim">
        {failed
          ? locale === "hy"
            ? "Սա կապի խնդիր է, ոչ թե դատարկ արդյունք։ Ստուգեք կապը և կրկին փորձեք։"
            : "This is a connection problem, not an empty result. Check your network and try again."
          : locale === "hy"
            ? "Մի պահ սպասեք, մինչ բեռնվեն շաբաթվա միջոցառումներն ու ուղիղ գրառումները։"
            : "One moment while the week and the live posts load."}
      </p>
    </div>
  );
}

function EmptySearch({
  mode,
  locale,
  hasQuery,
  onClear,
  onSwitch,
}: {
  mode: TimeMode;
  locale: "en" | "hy";
  hasQuery: boolean;
  onClear: () => void;
  onSwitch: () => void;
}) {
  return (
    <div className="mt-[12vh] max-w-[560px]">
      <p className="type-title">
        {locale === "hy"
          ? `${mode === "week" ? "Այս շաբաթ" : "Հիմա"} համընկնումներ չկան։`
          : `No matches in ${mode === "week" ? "This week" : "Right now"}.`}
      </p>
      <p className="type-body mt-2 text-dim">
        {locale === "hy"
          ? "Փորձեք մյուս ժամանակացույցը կամ ավելի քիչ բառերով որոնեք։"
          : "Try the other timeline or search with fewer words."}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSwitch}
          className={buttonClass({ tone: "primary", size: "sm" })}
        >
          {locale === "hy" ? "Դիտել՝ " : "Check "}
          {mode === "week"
            ? locale === "hy"
              ? "Հիմա"
              : "Right now"
            : locale === "hy"
              ? "Այս շաբաթ"
              : "This week"}
        </button>
        {hasQuery ? (
          <button
            type="button"
            onClick={onClear}
            className={buttonClass({ tone: "secondary", size: "sm" })}
          >
            {locale === "hy" ? "Մաքրել որոնումը" : "Clear search"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
