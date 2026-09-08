"use client";

import Link from "next/link";
import { ArrowUpRight, Map } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import {
  ContentDetail,
  type RelatedContent,
} from "@/components/content-detail";
import { useLocalRecords } from "@/components/local-records";
import { useLocale } from "@/components/locale-provider";
import { usePreferences } from "@/components/preferences";
import { ReportContentButton } from "@/components/report-content-button";
import { SaveContentButton } from "@/components/save-event-button";
import { buttonClass } from "@/components/ui/button";
import { EmptyNote, Page } from "@/components/ui/page";
import { DetailSkeleton } from "@/components/ui/skeleton";
import { useUserLocation } from "@/components/user-location";
import { categoryName, imageFor, parseWhen, weekdayName } from "@/lib/content";
import {
  distanceMeters,
  formatDistance,
  mapsDirectionsUrl,
  walkMinutes,
} from "@/lib/geo";

export function EventDetail() {
  const params = useParams<{ id: string }>();
  const { events, mine, ready } = useLocalRecords();
  const { preferences } = usePreferences();
  const { origin } = useUserLocation();
  const { locale, t } = useLocale();

  const event =
    events.find((item) => item.id === params.id) ??
    mine.events.find((item) => item.id === params.id);

  const nearby = useMemo(() => {
    if (!event) return [];
    return events
      .filter((item) => item.id !== event.id)
      .map((item) => ({
        item,
        meters: distanceMeters(event.coordinates, item.coordinates),
      }))
      .sort((a, b) => a.meters - b.meters)
      .slice(0, 3);
  }, [event, events]);

  if (!ready) return <DetailSkeleton />;

  if (!event) {
    return (
      <Page width="read">
        <EmptyNote
          title={
            locale === "hy"
              ? "Այս միջոցառումն այստեղ չէ։"
              : "This event is not here."
          }
          body={
            locale === "hy"
              ? "Հնարավոր է՝ այն հանվել է քարտեզից, կամ հղումը սխալ է։"
              : "It may have been unpublished, or the link is wrong."
          }
          action={
            <Link
              href="/?mode=week"
              className={buttonClass({ tone: "primary", size: "sm" })}
            >
              {locale === "hy" ? "Դիտել այս շաբաթը" : "See this week"}
            </Link>
          }
        />
      </Page>
    );
  }

  const { day, time, weekly } = parseWhen(event.when);
  const related: RelatedContent[] = nearby.map(({ item, meters }) => ({
    href: `/event/${item.id}`,
    image: imageFor(item.id, item.imageUrl),
    title: item.title,
    place: item.venue,
    meta:
      locale === "hy"
        ? `${parseWhen(item.when).time} · ${walkMinutes(meters)} ր քայլ`
        : `${parseWhen(item.when).time} · ${walkMinutes(meters)} min walk`,
  }));

  return (
    <ContentDetail
      backHref="/?mode=week"
      backLabel={t("backToMap")}
      image={imageFor(event.id, event.imageUrl)}
      imageAlt={event.title}
      eyebrow={
        <>
          {weekdayName(day)} {time}
          {weekly ? " · weekly" : ""}
        </>
      }
      title={event.title}
      summary={event.summary}
      publisher={
        <span className="flex items-center gap-2.5">
          {event.organizerAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.organizerAvatarUrl}
              alt=""
              className="size-8 rounded-full object-cover"
            />
          ) : (
            <span className="grid size-8 place-items-center rounded-full bg-apricot-wash text-[12px] font-semibold text-apricot">
              {event.organizer.trim().slice(0, 1).toUpperCase()}
            </span>
          )}
          <span>
            {locale === "hy" ? "Հրապարակել է՝ " : "Published by "}
            <span className="font-semibold text-fg">{event.organizer}</span>
          </span>
        </span>
      }
      place={event.venue}
      distance={
        origin
          ? formatDistance(
              distanceMeters(origin, event.coordinates),
              preferences.units,
            )
          : undefined
      }
      placeNote={
        locale === "hy"
          ? `${categoryName(event.category, locale)}՝ Երևանում։ Բացեք ուղղությունը՝ վայրի ճշգրիտ նշիչը տեսնելու համար։`
          : `${categoryName(event.category, locale)} in Yerevan. Open directions for the exact venue pin.`
      }
      actions={
        <>
          <SaveContentButton
            contentId={event.id}
            contentType="event"
            title={event.title}
          />
          <a
            href={mapsDirectionsUrl(event.coordinates)}
            target="_blank"
            rel="noreferrer"
            className={buttonClass({ tone: "secondary", size: "sm" })}
          >
            {t("directions")}
            <span className="sr-only">
              {locale === "hy"
                ? " (բացվում է նոր ներդիրում)"
                : " (opens in a new tab)"}
            </span>
            <ArrowUpRight size={15} strokeWidth={2.2} aria-hidden />
          </a>
          <Link
            href={`/?mode=week&pin=${event.id}`}
            className={buttonClass({ tone: "quiet", size: "sm" })}
          >
            <Map size={15} strokeWidth={1.9} aria-hidden />
            {t("openOnMap")}
          </Link>
        </>
      }
      report={
        <ReportContentButton
          contentId={event.id}
          contentType="event"
          title={event.title}
        />
      }
      relatedTitle={
        locale === "hy" ? "Այս շաբաթ՝ մոտակայքում" : "Nearby this week"
      }
      relatedMeta={
        nearby.length
          ? `${locale === "hy" ? "Մինչև" : "Within"} ${formatDistance(
              nearby[nearby.length - 1].meters,
              preferences.units,
            )}`
          : undefined
      }
      related={related}
    />
  );
}
