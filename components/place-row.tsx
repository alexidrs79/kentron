import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { imageTreatment } from "@/lib/content";
import { categoryColor } from "@/lib/map/categories";
import type { EventCategory } from "@/lib/map/fixtures";

/**
 * One row language for the whole product. The lead column carries the time
 * (planned) or the age (live), so either timeline scans down a single edge.
 * A thumbnail is optional: lists that are about places show one, dense
 * utility lists do not.
 */
export function PlaceRow({
  href,
  lead,
  title,
  meta,
  image,
  trailing,
  live = false,
  selected = false,
  opacity,
  rowId,
  category,
}: {
  href: string;
  lead: string;
  title: string;
  meta: string;
  image?: string;
  trailing?: ReactNode;
  live?: boolean;
  selected?: boolean;
  /** Age fade for live posts, mirroring the marker fade. */
  opacity?: number;
  rowId?: string;
  category?: EventCategory;
}) {
  return (
    <div
      id={rowId}
      className={`flex items-stretch gap-3 ${
        selected ? "bg-raised" : "hover:bg-raised/60"
      }`}
    >
      <Link
        href={href}
        aria-current={selected ? "true" : undefined}
        className={`flex min-w-0 flex-1 gap-3 py-3 pl-4 pr-2 ${
          image ? "items-center md:gap-3.5" : "items-baseline md:gap-4"
        }`}
        style={opacity ? { opacity } : undefined}
      >
        {image ? (
          <Image
            src={image}
            alt=""
            width={160}
            height={120}
            className={`aspect-[4/3] w-14 shrink-0 rounded-thumb object-cover shadow-thumb ${imageTreatment(image)}`}
          />
        ) : null}
        <span className="min-w-0 flex-1">
          <span
            className={`type-meta flex items-center gap-1.5 ${
              live ? "text-apricot" : "text-dim"
            }`}
          >
            {category ? (
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: categoryColor(category) }}
              />
            ) : null}
            {lead}
          </span>
          <span className="mt-[3px] line-clamp-2 block text-[15px] font-medium leading-[1.32] tracking-[-0.01em]">
            {title}
          </span>
          <span className="type-meta mt-1 block truncate text-dim">
            {meta}
          </span>
        </span>
      </Link>
      {trailing ? (
        <div className="flex shrink-0 items-center pr-2.5">{trailing}</div>
      ) : null}
    </div>
  );
}

/** The hairline stack rows sit in, so a list reads as one column. */
export function RowStack({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-line/70">{children}</div>;
}
