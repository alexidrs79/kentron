"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookmarkX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocalRecords } from "@/components/local-records";
import { useLocale } from "@/components/locale-provider";
import { usePreferences } from "@/components/preferences";
import { useUserLocation } from "@/components/user-location";
import { buttonClass } from "@/components/ui/button";
import { Desk, DeskHead, Page } from "@/components/ui/page";
import {
  compactAge,
  groupByDay,
  imageFor,
  imageTreatment,
  parseWhen,
  yerevanWeekday,
} from "@/lib/content";
import { distanceMeters, formatDistance } from "@/lib/geo";
import { useSavedEvents } from "@/lib/saved-events";

export default function SavedPage() {
  const { events, pulses } = useLocalRecords();
  const { items, ready, remove } = useSavedEvents();
  const { origin } = useUserLocation();
  const { preferences } = usePreferences();
  const { locale, t } = useLocale();
  const [today, setToday] = useState("");

  useEffect(() => setToday(yerevanWeekday()), []);

  const saved = useMemo(
    () =>
      events.filter((event) =>
        items?.some((item) => item.type === "event" && item.id === event.id),
      ),
    [events, items],
  );
  const savedLive = useMemo(
    () =>
      pulses.filter((pulse) =>
        items?.some((item) => item.type === "live" && item.id === pulse.id),
      ),
    [items, pulses],
  );
  const week = useMemo(() => groupByDay(saved, today), [saved, today]);
  const savedIds = useMemo(
    () => new Set(saved.map((event) => event.id)),
    [saved],
  );

  return (
    <Page>
      <Desk>
        <DeskHead
          title={t("saved")}
          meta={
            !ready
              ? t("readingSaved")
              : locale === "hy"
                ? `${savedLive.length} ուղիղ հիմա · ${saved.length} նախատեսված`
                : `${savedLive.length} live now · ${saved.length} planned`
          }
          action={
            <Link
              href="/"
              className="inline-flex min-h-10 items-center gap-2 type-ui text-apricot hover:text-apricot-soft"
            >
              {t("browseMap")}
              <ArrowRight size={15} strokeWidth={2} aria-hidden />
            </Link>
          }
        />

          {ready ? (
            <div>
              {savedLive.length ? (
                <section className="border-b border-line">
                  <div className="flex items-baseline justify-between border-b border-line px-5 py-3.5 md:px-8">
                    <h2 className="type-ui text-apricot">
                      {t("liveNow")}
                    </h2>
                    <p className="type-data text-dim">
                      {locale === "hy"
                        ? "Հեռացվում է պահվածներից, երբ ուղիղ գրառման ժամկետն ավարտվում է"
                        : "Leaves Saved when the live post expires"}
                    </p>
                  </div>
                  <div className="divide-y divide-line">
                    {savedLive.map((pulse) => (
                      <SavedLiveRow
                        key={pulse.id}
                        pulse={pulse}
                        away={
                          origin
                            ? formatDistance(
                                distanceMeters(origin, pulse.coordinates),
                                preferences.units,
                              )
                            : null
                        }
                        onRemove={() => remove("live", pulse.id)}
                      />
                    ))}
                  </div>
                </section>
              ) : null}
              {week.length === 0 && savedLive.length === 0 ? (
                <EmptySaved className="px-5 py-9 md:px-8" />
              ) : null}
              {week.map((group, index) => {
                const items = group.items.filter((event) =>
                  savedIds.has(event.id),
                );
                return (
                  <section
                    key={group.day}
                    className="grid grid-cols-[64px_minmax(0,1fr)] border-b border-line last:border-b-0 md:grid-cols-[112px_minmax(0,1fr)]"
                  >
                    <div
                      className={`border-r border-line px-3 py-5 md:px-6 md:py-7 ${
                        index === 0 ? "text-apricot" : "text-dim"
                      }`}
                    >
                      <p className="type-ui leading-tight">
                        {group.label}
                      </p>
                      <p className="type-data mt-2">
                        {group.day}
                      </p>
                    </div>
                    <div className="divide-y divide-line">
                      {items.map((event) => (
                        <AgendaRow
                          key={event.id}
                          event={event}
                          away={
                            origin
                              ? formatDistance(
                                  distanceMeters(origin, event.coordinates),
                                  preferences.units,
                                )
                              : null
                          }
                          onRemove={() => remove("event", event.id)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <div
              className="skeleton h-[420px]"
              aria-busy="true"
              aria-label={
                locale === "hy"
                  ? "Պահվածները բեռնվում են"
                  : "Loading saved items"
              }
            />
          )}
      </Desk>
    </Page>
  );
}

function EmptySaved({ className = "" }: { className?: string }) {
  const { locale, t } = useLocale();
  return (
    <div className={className}>
      <p className="type-lede">{t("nothingSaved")}</p>
      <p className="type-body mt-1 text-dim">
        {locale === "hy"
          ? "Պահեք ուղիղ գրառում կամ նախատեսված միջոցառում, և այն կհայտնվի այստեղ։"
          : "Save a live post or planned event from the map and it will appear here."}
      </p>
      <Link
        href="/"
        className={`${buttonClass({ tone: "primary", size: "sm" })} mt-4`}
      >
        {t("openMap")}
      </Link>
    </div>
  );
}

function SavedLiveRow({
  pulse,
  away,
  onRemove,
}: {
  pulse: {
    id: string;
    caption: string;
    place: string;
    ageMinutes: number;
    imageUrl?: string;
  };
  away: string | null;
  onRemove: () => void;
}) {
  const { locale, t } = useLocale();
  return (
    <div className="group flex min-h-[126px] items-center gap-4 px-4 py-4 hover:bg-raised/45 md:gap-6 md:px-7">
      <Link
        href={`/post/${pulse.id}`}
        className="flex min-w-0 flex-1 items-center gap-4 md:gap-6"
      >
        <Image
          src={imageFor(pulse.id, pulse.imageUrl)}
          alt=""
          width={180}
          height={135}
          className={`aspect-[4/3] w-[84px] shrink-0 rounded-thumb object-cover shadow-thumb md:w-[116px] ${imageTreatment(
            imageFor(pulse.id, pulse.imageUrl),
          )}`}
        />
        <span className="w-[54px] shrink-0 text-[14px] tabular-nums text-apricot md:w-[68px] md:text-[16px]">
          {compactAge(pulse.ageMinutes)} {locale === "hy" ? "առաջ" : "ago"}
        </span>
        <span className="min-w-0">
          <span className="line-clamp-2 block text-[15px] leading-snug font-medium md:text-[18px]">
            {pulse.caption}
          </span>
          <span className="mt-1 block truncate text-[12px] text-dim md:text-[13px]">
            {pulse.place}
            {away ? ` · ${away} ${locale === "hy" ? "հեռու" : "away"}` : ""}
          </span>
        </span>
      </Link>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${t("removeFromSaved")}: ${pulse.caption}`}
        className="grid size-11 shrink-0 place-items-center rounded-ctl text-dim hover:bg-canvas hover:text-apricot"
      >
        <BookmarkX size={18} strokeWidth={1.8} aria-hidden />
      </button>
    </div>
  );
}

function AgendaRow({
  event,
  away,
  onRemove,
}: {
  event: {
    id: string;
    title: string;
    venue: string;
    organizer: string;
    when: string;
    imageUrl?: string;
  };
  away: string | null;
  onRemove: () => void;
}) {
  const { locale, t } = useLocale();
  return (
    <div className="group flex min-h-[126px] items-center gap-4 px-4 py-4 hover:bg-raised/45 md:gap-6 md:px-7">
      <Link
        href={`/event/${event.id}`}
        className="flex min-w-0 flex-1 items-center gap-4 md:gap-6"
      >
        <Image
          src={imageFor(event.id, event.imageUrl)}
          alt=""
          width={180}
          height={135}
          className={`aspect-[4/3] w-[84px] shrink-0 rounded-thumb object-cover shadow-thumb md:w-[116px] ${imageTreatment(
            imageFor(event.id, event.imageUrl),
          )}`}
        />
        <span className="w-[54px] shrink-0 text-[17px] tabular-nums text-fg md:w-[68px] md:text-[22px]">
          {parseWhen(event.when).time}
        </span>
        <span className="min-w-0">
          <span className="line-clamp-2 block text-[15px] font-medium leading-snug md:text-[18px]">
            {event.title}
          </span>
          <span className="mt-1 block truncate text-[12px] text-dim md:text-[13px]">
            {event.venue}
            {away ? ` · ${away} ${locale === "hy" ? "հեռու" : "away"}` : ""}
            {event.organizer === event.venue ? "" : ` · ${event.organizer}`}
          </span>
        </span>
      </Link>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${t("removeFromSaved")}: ${event.title}`}
        className="grid size-11 shrink-0 place-items-center rounded-ctl text-dim hover:bg-canvas hover:text-apricot"
      >
        <BookmarkX size={18} strokeWidth={1.8} />
      </button>
    </div>
  );
}
