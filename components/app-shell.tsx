"use client";

import {
  Bookmark,
  CirclePlus,
  Map,
  Search,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const navigation = [
  { label: "Map", href: "/", icon: Map },
  { label: "Search", href: "/search", icon: Search },
  { label: "Create", href: "/create", icon: CirclePlus, emphasized: true },
  { label: "Saved", href: "/saved", icon: Bookmark },
  { label: "Profile", href: "/profile", icon: UserRound },
];

function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

function YerevanClock() {
  const [time, setTime] = useState("—:—:—");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Yerevan",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const update = () => setTime(formatter.format(new Date()));

    update();
    const interval = window.setInterval(update, 1_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="font-mono text-[11px] leading-5 text-paper-2">
      <p>Yerevan time</p>
      <time className="text-sm text-paper">{time}</time>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Kentron home">
      <Image
        src="/illustrations/kentron-pin.jpg"
        alt=""
        width={40}
        height={40}
        priority
        className="size-8 rounded-xl object-cover"
      />
      <span className="armenian text-xl font-semibold tracking-[-0.03em]">
        Կենտրոն
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-dusk text-paper md:grid md:grid-cols-[208px_1fr]">
      <aside className="relative z-[1000] hidden min-h-dvh flex-col border-r border-line bg-dusk px-5 py-6 md:flex">
        <Brand />
        <nav className="mt-12 flex flex-1 flex-col gap-1.5" aria-label="Primary">
          {navigation.map((item) => {
            const current = isCurrent(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${
                  item.emphasized
                    ? "my-2 bg-tuff text-dusk hover:bg-[#df7668]"
                    : current
                      ? "border border-line bg-surface text-paper"
                      : "border border-transparent text-paper-2 hover:bg-surface/55 hover:text-paper"
                }`}
              >
                <Icon size={19} strokeWidth={1.75} aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <YerevanClock />
      </aside>

      <main className="min-h-dvh min-w-0 pb-[72px] md:pb-0">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-[1000] grid h-[72px] grid-cols-5 border-t border-line bg-dusk/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        aria-label="Primary"
      >
        {navigation.map((item) => {
          const current = isCurrent(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={current ? "page" : undefined}
              className={`relative flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-medium ${
                item.emphasized ? "-translate-y-3" : ""
              } ${current ? "text-paper" : "text-paper-2"}`}
            >
              <span
                className={`grid size-10 place-items-center rounded-full ${
                  item.emphasized
                    ? "bg-tuff text-dusk shadow-[0_10px_28px_rgb(0_0_0/0.28)]"
                    : current
                      ? "bg-surface"
                      : ""
                }`}
              >
                <Icon size={19} strokeWidth={1.75} aria-hidden />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
