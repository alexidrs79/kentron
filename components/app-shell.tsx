"use client";

import {
  Bookmark,
  Map as MapIcon,
  Plus,
  Search,
  Settings,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { KentronMark } from "@/components/logo";
import { useLocale } from "@/components/locale-provider";

const primaryNav = [
  { key: "navMap", href: "/", icon: MapIcon, emphasized: false },
  { key: "navSearch", href: "/search", icon: Search, emphasized: false },
  { key: "navCreate", href: "/create", icon: Plus, emphasized: true },
  { key: "navSaved", href: "/saved", icon: Bookmark, emphasized: false },
  { key: "navProfile", href: "/profile", icon: UserRound, emphasized: false },
] as const;

function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { locale, t } = useLocale();
  const settingsCurrent = isCurrent(pathname, "/settings");

  // Auth is a full-bleed moment with no navigation to compete with it.
  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password"
  ) {
    return <div className="min-h-dvh bg-canvas text-fg">{children}</div>;
  }

  return (
    <div className="min-h-dvh bg-canvas text-fg">
      <a
        href="#kentron-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[1200] focus:rounded-ctl focus:bg-apricot focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-apricot"
      >
        {t("skip")}
      </a>
      {/* Desktop: a dock that floats over the canvas instead of a docked rail. */}
      <nav
        aria-label={locale === "hy" ? "Հիմնական" : "Primary"}
        className="fixed left-4 top-1/2 z-[1000] hidden w-[60px] -translate-y-1/2 flex-col items-center gap-1 rounded-[20px] border border-line bg-panel py-2.5 shadow-float md:flex"
      >
        <Link
          href="/"
          aria-label={locale === "hy" ? "Կենտրոնի գլխավոր էջ" : "Kentron home"}
          className="mb-1 grid size-11 place-items-center"
        >
          <KentronMark className="h-8 w-auto" />
        </Link>

        {primaryNav.map((item) => {
          const current = isCurrent(pathname, item.href);
          const Icon = item.icon;
          const label = t(item.key);

          if (item.emphasized) {
            return (
              <Link
                key={item.href}
                href={item.href}
                title={label}
                className="my-1 grid size-11 place-items-center rounded-full bg-apricot text-on-apricot hover:bg-apricot-soft"
              >
                <Icon size={20} strokeWidth={2.1} aria-hidden />
                <span className="sr-only">{label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              title={label}
              aria-current={current ? "page" : undefined}
              className={`grid size-11 place-items-center rounded-[11px] ${
                current
                  ? "bg-raised text-fg"
                  : "text-dim hover:bg-raised/70 hover:text-fg"
              }`}
            >
              <Icon size={19} strokeWidth={1.8} aria-hidden />
              <span className="sr-only">{label}</span>
            </Link>
          );
        })}

        <span aria-hidden className="my-1.5 h-px w-6 bg-line" />

        <Link
          href="/settings"
          title={t("navSettings")}
          aria-current={settingsCurrent ? "page" : undefined}
          className={`grid size-11 place-items-center rounded-[11px] ${
            settingsCurrent
              ? "bg-raised text-fg"
              : "text-dim hover:bg-raised/70 hover:text-fg"
          }`}
        >
          <Settings size={18} strokeWidth={1.8} aria-hidden />
          <span className="sr-only">{t("navSettings")}</span>
        </Link>
      </nav>

      <div id="kentron-main" className="min-h-dvh min-w-0 pb-[76px] md:pb-0">
        {children}
      </div>

      {/* Phone: a tab bar on the same dark scale. */}
      <nav
        aria-label={locale === "hy" ? "Հիմնական" : "Primary"}
        className="fixed inset-x-0 bottom-0 z-[1000] grid h-[76px] grid-cols-5 border-t border-line bg-panel px-1 pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {primaryNav.map((item) => {
          const current = isCurrent(pathname, item.href);
          const Icon = item.icon;
          const label = t(item.key);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={current ? "page" : undefined}
              className={`type-data flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 pt-1 ${
                current ? "text-fg" : "text-dim"
              }`}
            >
              <span
                className={`grid h-8 w-9 place-items-center rounded-[10px] ${
                  item.emphasized
                    ? "bg-apricot text-on-apricot"
                    : current
                      ? "bg-raised"
                      : ""
                }`}
              >
                <Icon size={18} strokeWidth={1.9} aria-hidden />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
