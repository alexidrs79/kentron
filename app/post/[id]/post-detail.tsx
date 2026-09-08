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
import { categoryName, compactAge, imageFor } from "@/lib/content";
import {
  distanceMeters,
  formatDistance,
  mapsPlaceUrl,
  walkMinutes,
} from "@/lib/geo";
import { formatAge } from "@/lib/map/viewport";

/** How long this post has left, in the plain voice used elsewhere. */
function timeLeft(expiresAt: string) {
  const minutes = Math.round(
    (new Date(expiresAt).getTime() - Date.now()) / 60_000,
  );
  if (minutes <= 1) return "in a minute or so";
  if (minutes < 60) return `in about ${minutes} minutes`;
  const hours = Math.round(minutes / 60);
  return hours === 1 ? "in about an hour" : `in about ${hours} hours`;
}

export function PostDetail() {
  const params = useParams<{ id: string }>();
  const { pulses, ready } = useLocalRecords();
  const { preferences } = usePreferences();
  const { origin } = useUserLocation();
  const { locale, t } = useLocale();

  const pulse = pulses.find((item) => item.id === params.id);
  const nearby = useMemo(() => {
    if (!pulse) return [];
    return pulses
      .filter((item) => item.id !== pulse.id)
      .map((item) => ({
        item,
        meters: distanceMeters(pulse.coordinates, item.coordinates),
      }))
      .sort((a, b) => a.meters - b.meters)
      .slice(0, 3);
  }, [pulse, pulses]);

  if (!ready) return <DetailSkeleton />;

  if (!pulse) {
    return (
      <Page width="read">
        <EmptyNote
          title={
            locale === "hy"
              ? "Այս ուղիղ գրառումն այլևս չկա։"
              : "This live post is gone."
          }
          body={
            locale === "hy"
              ? "Ուղիղ գրառումները պահպանվում են չորս ժամ և չեն արխիվացվում։"
              : "Live posts last for four hours and are not archived."
          }
          action={
            <Link
              href="/?mode=now"
              className={buttonClass({ tone: "primary", size: "sm" })}
            >
              {locale === "hy"
                ? "Դիտել՝ ինչ է կատարվում հիմա"
                : "See what is live now"}
            </Link>
          }
        />
      </Page>
    );
  }

  const expiresAt =
    pulse.expiresAt ??
    new Date(
      Date.now() + Math.max(1, 240 - pulse.ageMinutes) * 60_000,
    ).toISOString();
  const related: RelatedContent[] = nearby.map(({ item, meters }) => ({
    href: `/post/${item.id}`,
    image: imageFor(item.id, item.imageUrl),
    title: item.caption,
    place: item.place,
    meta:
      locale === "hy"
        ? `${compactAge(item.ageMinutes)} առաջ · ${walkMinutes(meters)} ր քայլ`
        : `${compactAge(item.ageMinutes)} ago · ${walkMinutes(meters)} min walk`,
  }));

  return (
    <ContentDetail
      backHref="/?mode=now"
      backLabel={t("backToMap")}
      image={imageFor(pulse.id, pulse.imageUrl)}
      imageAlt={pulse.caption}
      eyebrow={
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-1.5 rounded-full bg-apricot" />
          {locale === "hy" ? "Ուղիղ" : "Live"} · {formatAge(pulse.ageMinutes)}
        </span>
      }
      title={pulse.caption}
      summary={
        locale === "hy"
          ? "Այս գրառմանը անուն կցված չէ։ Այն չորս ժամ անց հեռանում է քարտեզից, և Կենտրոնը դրա արխիվը չի պահում։"
          : `No name is attached to this post. It leaves the map ${timeLeft(
              expiresAt,
            )} and Kentron keeps no archive of it.`
      }
      place={pulse.place}
      distance={
        origin
          ? formatDistance(
              distanceMeters(origin, pulse.coordinates),
              preferences.units,
            )
          : undefined
      }
      placeNote={
        locale === "hy"
          ? `${categoryName(pulse.category, locale)}՝ Երևանում։ Հանրային նշիչը կլորացված է մոտ 100 մետրանոց ցանցով և ցույց է տալիս վայրը, ոչ թե ճշգրիտ հասցեն։`
          : `${categoryName(pulse.category, locale)} in Yerevan. The public pin is rounded to roughly a 100 m grid, so it marks the place rather than an exact address.`
      }
      actions={
        <>
          <SaveContentButton
            contentId={pulse.id}
            contentType="live"
            expiresAt={expiresAt}
            title={pulse.caption}
          />
          <a
            href={mapsPlaceUrl(pulse.coordinates)}
            target="_blank"
            rel="noreferrer"
            className={buttonClass({ tone: "secondary", size: "sm" })}
          >
            {t("showInMaps")}
            <span className="sr-only">
              {locale === "hy"
                ? " (բացվում է նոր ներդիրում)"
                : " (opens in a new tab)"}
            </span>
            <ArrowUpRight size={15} strokeWidth={2.2} aria-hidden />
          </a>
          <Link
            href={`/?mode=now&pin=${pulse.id}`}
            className={buttonClass({ tone: "quiet", size: "sm" })}
          >
            <Map size={15} strokeWidth={1.9} aria-hidden />
            {t("openOnMap")}
          </Link>
        </>
      }
      report={
        <ReportContentButton
          contentId={pulse.id}
          contentType="live"
          title={pulse.caption}
        />
      }
      relatedTitle={
        locale === "hy" ? "Մոտակայքում նույնպես ուղիղ" : "Also live nearby"
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
