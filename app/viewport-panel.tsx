import Link from "next/link";
import { PlaceRow } from "@/components/place-row";
import {
  livePulses,
  plannedEvents,
  type TimeMode,
} from "@/lib/map/fixtures";
import { formatAge, isInBounds, type MapBounds } from "@/lib/map/viewport";

const categoryLabel = {
  tech: "Tech",
  creative: "Creative",
  market: "Market",
} as const;

export function ViewportPanel({
  mode,
  bounds,
}: {
  mode: TimeMode;
  bounds: MapBounds | null;
}) {
  const pulses = bounds
    ? livePulses.filter((item) => isInBounds(item.coordinates, bounds))
    : livePulses;
  const events = bounds
    ? plannedEvents.filter((item) => isInBounds(item.coordinates, bounds))
    : plannedEvents;

  const empty = mode === "now" ? pulses.length === 0 : events.length === 0;

  return (
    <aside className="pointer-events-auto absolute inset-x-0 bottom-0 z-[400] flex max-h-[42%] flex-col rounded-t-3xl border-t border-line bg-surface/96 shadow-[0_-18px_40px_rgb(9_12_24/0.28)] backdrop-blur-md md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-80 md:rounded-none md:border-l md:border-t-0 md:shadow-[-18px_0_40px_rgb(9_12_24/0.18)]">
      <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-line md:hidden" />
      <div className="px-5 pb-2 pt-3">
        <h2 className="font-display text-base font-semibold">
          {mode === "now" ? "Live now near you" : "This week near you"}
        </h2>
        <p className="mt-1 font-mono text-[11px] text-paper-2">
          {empty
            ? "Nothing in this view"
            : mode === "now"
              ? `${pulses.length} live`
              : `${events.length} planned`}
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        {empty ? (
          <EmptyState mode={mode} />
        ) : mode === "now" ? (
          pulses.map((pulse) => (
            <PlaceRow
              key={pulse.id}
              href={`/post/${pulse.id}`}
              initial={pulse.place.slice(0, 1)}
              accent="live"
              title={pulse.caption}
              meta={`${pulse.place} · ${formatAge(pulse.ageMinutes)}`}
            />
          ))
        ) : (
          events.map((event) => (
            <PlaceRow
              key={event.id}
              href={`/event/${event.id}`}
              initial={event.venue.slice(0, 1)}
              accent={event.category}
              title={event.title}
              meta={`${event.venue} · ${event.when}`}
              chip={categoryLabel[event.category]}
            />
          ))
        )}
      </div>
    </aside>
  );
}

function EmptyState({ mode }: { mode: TimeMode }) {
  return (
    <div className="px-1 py-6">
      <p className="max-w-xs text-sm leading-6 text-paper-2">
        {mode === "now"
          ? "Quiet right now near you. Be the first to post."
          : "Nothing planned yet near you. Be the first to post."}
      </p>
      <Link
        href="/create"
        className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-tuff px-4 text-sm font-medium text-dusk transition-colors hover:bg-[#df7668]"
      >
        Create
      </Link>
    </div>
  );
}
