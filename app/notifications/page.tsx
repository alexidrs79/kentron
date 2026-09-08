"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, Circle, Settings2 } from "lucide-react";
import { usePreferences } from "@/components/preferences";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Page } from "@/components/ui/page";
import { imageFor, imageTreatment } from "@/lib/content";
import { useActivity } from "@/lib/activity";
import { useSavedEvents } from "@/lib/saved-events";

export default function NotificationsPage() {
  const { items, ready, unreadCount, isUnread, markAllRead } = useActivity();
  const { preferences } = usePreferences();
  const { authenticated } = useSavedEvents();
  const { locale, t } = useLocale();

  const reminders = items.filter((item) => item.kind === "reminder");
  const nearby = items.filter((item) => item.kind === "nearby");

  return (
    <Page>
      <div className="grid gap-8 lg:grid-cols-[.58fr_1.42fr] lg:gap-0">
        <header className="flex flex-col border-b border-line pb-7 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-12">
          <h1 className="type-title">
            {t("activity")}
          </h1>
          <p className="type-display mt-6 max-w-[14ch] font-medium">
            {ready
              ? items.length
                ? locale === "hy"
                  ? `${items.length} նոր բան կա դիտելու`
                  : `${items.length} ${
                      items.length === 1 ? "thing" : "things"
                    } worth checking`
                : locale === "hy"
                  ? "Ոչինչ ձեր ուշադրությանը չի սպասում"
                  : "Nothing needs your attention"
              : locale === "hy"
                ? "Գործունեությունը բեռնվում է"
                : "Reading your activity"}
          </p>
          <div className="type-ui mt-8 space-y-3 font-medium text-dim lg:mt-10">
            <p className="flex items-center gap-3">
              <Bookmark size={15} strokeWidth={1.7} aria-hidden />
              {locale === "hy" ? "Պահված միջոցառումներ" : "Saved events"}
            </p>
            <p className="flex items-center gap-3">
              <span aria-hidden className="size-2.5 rounded-full bg-apricot" />
              {locale === "hy" ? "Ուղիղ գրառումներ" : "Live posts"}
            </p>
            <p className="type-data pt-3 leading-5 text-faint">
              {authenticated
                ? locale === "hy"
                  ? "Համաժամեցված է ձեր հաշվի հետ։ Հրումային ծանուցումներ չկան։"
                  : "Synced with your account. No push notifications."
                : locale === "hy"
                  ? "Մուտք գործեք՝ պահված հիշեցումները տեսնելու համար։"
                  : "Log in to see saved reminders. Live posts still appear here while you browse."}
            </p>
          </div>
        </header>

        <div className="min-w-0 lg:pl-12">
          <div className="flex items-center justify-between gap-4">
            <p className="type-meta text-dim">{t("now")}</p>
            <div className="flex items-center gap-2">
              {unreadCount > 0 ? (
                <Button tone="quiet" size="sm" onClick={markAllRead}>
                  {t("markAllRead")}
                </Button>
              ) : null}
              <Link
                href="/settings"
                className="type-ui inline-flex min-h-10 items-center gap-2 text-dim hover:text-apricot"
              >
                {t("settingsTitle")}
                <Settings2 size={15} strokeWidth={1.8} aria-hidden />
              </Link>
            </div>
          </div>

          {!ready ? (
            <div className="skeleton mt-5 h-[420px] border-l border-line" />
          ) : items.length === 0 ? (
            <div className="relative mt-5 min-h-[340px] border-l border-line pl-8 pt-8">
              <Circle
                size={11}
                fill="currentColor"
                className="absolute -left-[6px] top-10 text-dim"
                aria-hidden
              />
              <p className="type-lede">{t("allCaughtUp")}</p>
              <p className="type-body mt-2 text-dim">
                {!authenticated
                  ? locale === "hy"
                    ? "Պահված միջոցառումների գործունեությունը կապված է ձեր հաշվին։ Մուտք գործեք՝ հիշեցումները սարքերի միջև պահելու համար։"
                    : "Activity for saved events lives on your account. Log in to keep reminders across devices."
                  : preferences.savedReminders || preferences.nearbyAlerts
                    ? locale === "hy"
                      ? "Պահեք միջոցառում կամ վերադարձեք, երբ Երևանում նոր բան կատարվի։"
                      : "Save an event or check back when something new is live in Yerevan."
                    : locale === "hy"
                      ? "Գործունեության երկու աղբյուրներն էլ անջատված են։ Փոխեք դրանք Կարգավորումներում։"
                      : "Both activity sources are switched off. You can change that in Settings."}
              </p>
              <Link
                href="/?mode=week"
                className="mt-5 inline-flex min-h-10 items-center font-semibold text-apricot hover:text-apricot-soft"
              >
                {locale === "hy" ? "Դիտել այս շաբաթը" : "Browse this week"}
              </Link>
            </div>
          ) : (
            <div className="mt-3 border-l border-line">
              {nearby.map((item) => (
                <SignalRow
                  key={item.id}
                  item={item}
                  unread={isUnread(item.id)}
                  live
                />
              ))}

              {reminders.length ? (
                <p className="border-t border-line px-7 pb-2 pt-6 text-[12px] font-medium text-dim">
                  {t("laterThisWeek")}
                </p>
              ) : null}
              {reminders.map((item) => (
                <SignalRow
                  key={item.id}
                  item={item}
                  unread={isUnread(item.id)}
                />
              ))}
              <p className="type-meta border-t border-line px-7 py-5 text-dim">
                {t("allCaughtUp")}
              </p>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}

function SignalRow({
  item,
  unread,
  live = false,
}: {
  item: {
    id: string;
    title: string;
    meta: string;
    href: string;
    imageUrl?: string;
  };
  unread: boolean;
  live?: boolean;
}) {
  const itemId = item.href.split("/").filter(Boolean).at(-1) ?? item.id;

  return (
    <Link
      href={item.href}
      className="group relative grid min-h-[102px] grid-cols-[minmax(0,1fr)_82px] items-center gap-5 border-b border-line px-7 py-4 hover:bg-panel"
    >
      <span
        aria-hidden
        className={`absolute -left-[5px] top-1/2 size-2.5 -translate-y-1/2 ${
          live
            ? "rounded-full bg-apricot"
            : "border border-dim bg-canvas [border-radius:2px]"
        } ${unread ? "opacity-100" : "opacity-55"}`}
      />
      <span className="min-w-0">
        <span className="line-clamp-2 block text-[15px] font-medium leading-snug group-hover:text-apricot">
          {item.title}
        </span>
        <span className="mt-1 block truncate text-[12px] tabular-nums text-dim">
          {item.meta}
        </span>
      </span>
      {live ? (
        <Image
          src={imageFor(itemId, item.imageUrl)}
          alt=""
          width={164}
          height={123}
          className={`aspect-[4/3] w-full rounded-thumb object-cover ${imageTreatment(
            imageFor(itemId, item.imageUrl),
          )}`}
        />
      ) : (
        <Bookmark
          size={17}
          strokeWidth={1.7}
          className="ml-auto text-dim"
          aria-hidden
        />
      )}
    </Link>
  );
}
