import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { Desk, Page } from "@/components/ui/page";
import { signOutAction } from "@/lib/auth/actions";
import { loginHref } from "@/lib/auth/paths";
import { initialOf } from "@/lib/content";
import { getServerLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const locale = await getServerLocale();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(loginHref("/profile"));

  const { data: publishedRows } = await supabase
    .from("planned_events")
    .select("id,title")
    .eq("owner_id", user.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name,avatar_url")
    .eq("id", user.id)
    .maybeSingle();
  const published = publishedRows ?? [];
  const displayName =
    profile?.display_name ||
    (user.user_metadata.display_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Your account";
  const avatarUrl = profile?.avatar_url
    ? supabase.storage.from("event-media").getPublicUrl(profile.avatar_url).data
        .publicUrl
    : undefined;

  return (
    <ProfileFrame
      rail={
        <>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="size-14 rounded-full object-cover"
            />
          ) : (
            <span className="type-lede grid size-14 place-items-center rounded-full bg-apricot-wash font-semibold text-apricot">
              {initialOf(displayName)}
            </span>
          )}
          <p className="type-lede mt-5">{displayName}</p>
          <p className="type-meta mt-1 break-all text-dim">{user.email}</p>
          <Link
            href="/profile/edit"
            className={`${buttonClass({ tone: "secondary", size: "sm" })} mt-5`}
          >
            {t(locale, "editProfile")}
          </Link>
          <div className="mt-8 border-t border-line pt-5">
            <p className="type-title leading-none tabular-nums">
              {published.length}
            </p>
            <p className="type-data mt-1 text-dim">
              {t(locale, "publishedEvents")}
            </p>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className={`${buttonClass({
                tone: "quiet",
                size: "sm",
              })} -ml-3 mt-8`}
            >
              {t(locale, "logOut")}
            </button>
          </form>
        </>
      }
    >
      <div className="max-w-[640px]">
        <h1 className="type-title">
          {t(locale, "publishingDesk")}
        </h1>
        <p className="type-body mt-3 text-dim">
          {locale === "hy"
            ? "Նախատեսված միջոցառումներն ու ուղիղ գրառումները պատկանում են այս հաշվին և կառավարելի են ցանկացած սարքից։"
            : "Planned events and live posts belong to this account, so you can manage them from any device."}
        </p>
        <div className="mt-7">
          <div className="flex items-center justify-between gap-4 border-b border-line pb-3">
            <h2 className="type-ui">
              {t(locale, "recentlyPublished")}
            </h2>
            <Link
              href="/organizer"
              className="inline-flex min-h-10 items-center gap-2 type-ui text-apricot hover:text-apricot-soft"
            >
              {t(locale, "openDesk")}
              <ArrowRight size={15} strokeWidth={1.9} aria-hidden />
            </Link>
          </div>
          {published.length === 0 ? (
            <p className="type-body py-7 text-dim">
              {locale === "hy"
                ? "Դեռ ոչինչ հրապարակված չէ։ Երբ ծրագիր ունենաք, սկսեք կազմակերպչի սեղանից։"
                : "Nothing published yet. Start in the organiser desk when you have something planned."}
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {published.slice(0, 4).map((event) => (
                <li key={event.id} className="py-3.5">
                  <Link
                    href={`/event/${event.id}`}
                    className="text-[15px] font-medium hover:text-apricot"
                  >
                    {event.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <MoreList locale={locale} />
      </div>
    </ProfileFrame>
  );
}

function ProfileFrame({
  rail,
  children,
}: {
  rail: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Page>
      <Desk className="grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-b border-line px-6 py-7 lg:min-h-[560px] lg:border-b-0 lg:border-r lg:px-8 lg:py-9">
          {rail}
        </aside>
        <div className="px-6 py-8 md:px-10 lg:px-12">{children}</div>
      </Desk>
    </Page>
  );
}

function MoreList({ locale }: { locale: "en" | "hy" }) {
  const moreLinks = [
    {
      href: "/notifications",
      label: t(locale, "activity"),
      note:
        locale === "hy"
          ? "Պահված հիշեցումներ և ուղիղ գրառումներ"
          : "Saved reminders and live posts",
    },
    {
      href: "/settings",
      label: t(locale, "settingsTitle"),
      note:
        locale === "hy"
          ? "Քարտեզ, միավորներ, գործունեություն և շարժում"
          : "Map, units, activity, and motion",
    },
    {
      href: "/about",
      label: t(locale, "about"),
      note:
        locale === "hy"
          ? "Ժամանակացույցեր, գաղտնիություն և քարտեզի աղբյուրներ"
          : "Timelines, privacy, and map credits",
    },
    {
      href: "/privacy",
      label: t(locale, "privacy"),
      note:
        locale === "hy"
          ? "Ինչ է պահում Կենտրոնը և ինչու"
          : "What Kentron stores and why",
    },
  ];
  return (
    <nav className="mt-8 border-t border-line">
      <ul className="divide-y divide-line">
        {moreLinks.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group flex items-center gap-3.5 py-4 hover:text-apricot"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium">
                  {item.label}
                </span>
                <span className="type-meta mt-0.5 block text-dim">
                  {item.note}
                </span>
              </span>
              <ArrowRight
                size={16}
                strokeWidth={1.8}
                className="shrink-0 text-dim group-hover:text-apricot"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
