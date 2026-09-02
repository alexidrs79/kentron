import Link from "next/link";
import { UserRound } from "lucide-react";

const accents = {
  live: "bg-apricot/15 text-apricot",
  tech: "bg-pin-tech/20 text-pin-tech",
  creative: "bg-pin-creative/20 text-pin-creative",
  market: "bg-pin-market/20 text-pin-market",
} as const;

export function PlaceRow({
  href,
  initial,
  accent,
  title,
  meta,
  chip,
  anonymous = false,
}: {
  href: string;
  initial: string;
  accent: keyof typeof accents;
  title: string;
  meta: string;
  chip?: string;
  anonymous?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-14 items-center gap-3 rounded-2xl px-1 py-2 transition-colors hover:bg-line/50"
    >
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold ${accents[accent]}`}
      >
        {anonymous ? (
          <UserRound size={17} strokeWidth={1.75} aria-label="Anonymous" />
        ) : (
          initial
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-paper">
          {title}
        </span>
        <span className="mt-0.5 block truncate font-mono text-[11px] text-paper-2">
          {meta}
        </span>
      </span>
      {chip ? (
        <span className="shrink-0 rounded-full border border-line px-2 py-1 text-[11px] text-paper-2">
          {chip}
        </span>
      ) : null}
    </Link>
  );
}
