import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ConfirmForm } from "@/components/confirm-form";
import { buttonClass } from "@/components/ui/button";
import { Desk, DeskHead, Page } from "@/components/ui/page";
import { loginHref } from "@/lib/auth/paths";
import { categoryLabel, imageFor, imageTreatment } from "@/lib/content";
import { getServerLocale } from "@/lib/i18n-server";
import { t, type Locale } from "@/lib/i18n";
import type { EventCategory } from "@/lib/map/fixtures";
import {
  deleteEvent,
  deleteLivePost,
  republishEvent,
  unpublishEvent,
} from "@/lib/organizer/actions";
import { createClient } from "@/lib/supabase/server";

function yerevanWhen(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "hy" ? "hy-AM" : "en-GB", {
    timeZone: "Asia/Yerevan",
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function compactAge(value: string, locale: Locale) {
  const minutes = Math.max(
    1,
    Math.floor((Date.now() - new Date(value).getTime()) / 60_000),
  );
  return minutes < 60
    ? locale === "hy"
      ? `${minutes} ր առաջ`
      : `${minutes}m ago`
    : locale === "hy"
      ? `${Math.floor(minutes / 60)} ժ առաջ`
      : `${Math.floor(minutes / 60)}h ago`;
}

type DeskItem = {
  id: string;
  kind: "event" | "live";
  title: string;
  place: string;
  category: EventCategory;
  imageUrl?: string;
  meta: string;
  timestamp: number;
  action: "unpublish" | "republish" | "delete-event" | "delete-live";
  published?: boolean;
  template?: boolean;
};

export default async function OrganizerPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const locale = await getServerLocale();
  const { status } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(loginHref("/organizer", "organizer"));

  const [{ data: eventRows = [] }, { data: liveRows = [] }] = await Promise.all(
    [
      supabase
        .from("planned_events")
        .select(
          "id,title,venue_name,category,image_path,starts_at,is_recurring_template,is_published",
        )
        .eq("owner_id", user.id)
        .order("starts_at", { ascending: false }),
      supabase
        .from("live_posts")
        .select(
          "id,caption,place_name,category,image_path,posted_at,expires_at",
        )
        .eq("owner_id", user.id)
        .gt("expires_at", new Date().toISOString())
        .order("posted_at", { ascending: false }),
    ],
  );

  const mediaUrl = (path: string | null) =>
    path
      ? supabase.storage.from("event-media").getPublicUrl(path).data.publicUrl
      : undefined;

  const planned: DeskItem[] = (eventRows ?? []).map((event) => ({
    id: event.id,
    kind: "event",
    title: event.title,
    place: event.venue_name,
    category: event.category,
    imageUrl: mediaUrl(event.image_path),
    meta: `${locale === "hy" ? "Նախատեսված" : "Planned"} · ${yerevanWhen(event.starts_at, locale)}`,
    timestamp: new Date(event.starts_at).getTime(),
    action: event.is_published ? "unpublish" : "republish",
    published: event.is_published,
    template: event.is_recurring_template,
  }));
  const activeLive: DeskItem[] = (liveRows ?? []).map((post) => ({
    id: post.id,
    kind: "live",
    title: post.caption,
    place: post.place_name,
    category: post.category,
    imageUrl: mediaUrl(post.image_path),
    meta: `${locale === "hy" ? "Ուղիղ" : "Live"} · ${compactAge(post.posted_at, locale)}`,
    timestamp: new Date(post.posted_at).getTime(),
    action: "delete-live",
  }));

  const onMap = [
    ...planned.filter((item) => !item.template && item.published),
    ...activeLive,
  ].sort((a, b) => b.timestamp - a.timestamp);
  const unpublished = planned.filter(
    (item) => !item.template && !item.published,
  );
  const templates = planned
    .filter((item) => item.template)
    .map((item) => ({ ...item, action: "delete-event" as const }));

  return (
    <Page>
      <Desk>
        <DeskHead
          title={t(locale, "publishingDesk")}
          meta={
            locale === "hy"
              ? `${onMap.length} քարտեզին · ${unpublished.length} չհրապարակված · ${templates.length} սևագիր`
              : `${onMap.length} on the map · ${unpublished.length} unpublished · ${templates.length} drafts`
          }
          action={
            <Link
              href="/create"
              className={buttonClass({ tone: "primary", size: "sm" })}
            >
              {t(locale, "navCreate")}
            </Link>
          }
        />
          {status ? <DeskStatus status={status} locale={locale} /> : null}
          <DeskSection
            title={t(locale, "onMap")}
            empty={
              locale === "hy"
                ? "Այս հաշվից քարտեզին ոչինչ չկա։"
                : "Nothing from this account is on the map."
            }
            items={onMap}
            locale={locale}
          />
          <DeskSection
            title={t(locale, "unpublished")}
            empty={
              locale === "hy"
                ? "Չհրապարակված միջոցառումներ չկան։"
                : "No unpublished events."
            }
            items={unpublished}
            locale={locale}
            bordered
          />
          <DeskSection
            title={t(locale, "drafts")}
            empty={
              locale === "hy" ? "Շաբաթական սևագրեր չկան։" : "No weekly drafts."
            }
            items={templates}
            locale={locale}
            bordered
          />
      </Desk>
    </Page>
  );
}

function DeskStatus({ status, locale }: { status: string; locale: Locale }) {
  const message =
    status === "error"
      ? locale === "hy"
        ? "Փոփոխությունը չպահվեց։ Կրկին փորձեք։"
        : "The change could not be saved. Try again."
      : status === "published"
        ? locale === "hy"
          ? "Միջոցառումը հրապարակված է։"
          : "Event published."
        : status === "unpublished"
          ? locale === "hy"
            ? "Միջոցառումը հանված է քարտեզից։"
            : "Event removed from the map."
          : locale === "hy"
            ? "Նյութը ջնջված է։"
            : "Item deleted.";
  return (
    <p
      role={status === "error" ? "alert" : "status"}
      className="type-ui border-b border-line bg-raised px-5 py-3 text-apricot md:px-8"
    >
      {message}
    </p>
  );
}

function DeskSection({
  title,
  empty,
  items,
  locale,
  bordered = false,
}: {
  title: string;
  empty: string;
  items: DeskItem[];
  locale: Locale;
  bordered?: boolean;
}) {
  return (
    <section className={bordered ? "border-t border-line" : ""}>
      <div className="flex items-baseline justify-between gap-3 px-5 pt-5 pb-3 md:px-7">
        <h2 className="type-ui text-dim">{title}</h2>
        <span className="type-meta text-faint">
          {items.length}
        </span>
      </div>
      {items.length ? (
        <div className="divide-y divide-line">
          {items.map((item) => (
            <DeskRow
              key={`${item.kind}-${item.id}`}
              item={item}
              locale={locale}
            />
          ))}
        </div>
      ) : (
        <div className="px-5 pb-7 md:px-7">
          <p className="type-body text-dim">{empty}</p>
          <Link
            href="/create?kind=event"
            className={`${buttonClass({ tone: "secondary", size: "sm" })} mt-4`}
          >
            {locale === "hy" ? "Ստեղծել միջոցառում" : "Create event"}
          </Link>
        </div>
      )}
    </section>
  );
}

function DeskRow({ item, locale }: { item: DeskItem; locale: Locale }) {
  const isLive = item.kind === "live";
  const action =
    item.action === "delete-live"
      ? deleteLivePost
      : item.action === "delete-event"
        ? deleteEvent
        : item.action === "republish"
          ? republishEvent
          : unpublishEvent;
  const label =
    item.action === "delete-live" || item.action === "delete-event"
      ? t(locale, "delete")
      : item.action === "republish"
        ? t(locale, "publish")
        : t(locale, "unpublish");
  const message =
    locale === "hy"
      ? `${label} «${item.title}»։ Համոզվա՞ծ եք։`
      : item.action === "delete-live" || item.action === "delete-event"
        ? `Delete “${item.title}”? This cannot be undone.`
        : `${label} “${item.title}” ${item.action === "unpublish" ? "from" : "to"} the map?`;

  return (
    <div className="flex min-h-[126px] items-center gap-4 px-4 py-4 hover:bg-raised/45 md:gap-6 md:px-7">
      <Link href={`/${isLive ? "post" : "event"}/${item.id}`}>
        <Image
          src={imageFor(item.id, item.imageUrl)}
          alt=""
          width={176}
          height={132}
          className={`aspect-[4/3] w-[82px] rounded-thumb object-cover shadow-thumb md:w-[108px] ${imageTreatment(
            imageFor(item.id, item.imageUrl),
          )}`}
        />
      </Link>
      <div className="min-w-0 flex-1">
        <p
          className={`type-data ${
            isLive ? "text-apricot" : "text-dim"
          }`}
        >
          {item.meta} ·{" "}
          {locale === "hy"
            ? t(locale, item.category)
            : categoryLabel[item.category]}
        </p>
        <Link
          href={`/${isLive ? "post" : "event"}/${item.id}`}
          className="mt-1 line-clamp-2 block text-[15px] leading-snug font-medium hover:text-apricot"
        >
          {item.title}
        </Link>
        <p className="type-meta mt-1 truncate text-dim">{item.place}</p>
      </div>
      <div className="flex shrink-0 flex-col items-stretch gap-1">
        {isLive ? null : (
          <Link
            href={`/organizer/event/${item.id}`}
            className={buttonClass({ tone: "secondary", size: "sm" })}
          >
            {t(locale, "edit")}
          </Link>
        )}
        <ConfirmForm action={action} message={message}>
          <input
            type="hidden"
            name={isLive ? "postId" : "eventId"}
            value={item.id}
          />
          <button
            type="submit"
            className={buttonClass({ tone: "quiet", size: "sm" })}
          >
            {label}
          </button>
        </ConfirmForm>
      </div>
    </div>
  );
}
