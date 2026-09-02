import {
  livePulses,
  plannedEvents,
  type EventCategory,
  type LivePulse,
  type PlannedEvent,
} from "@/lib/map/fixtures";

export type { EventCategory };

export const categories: { id: EventCategory; label: string }[] = [
  { id: "tech", label: "Tech" },
  { id: "creative", label: "Creative" },
  { id: "market", label: "Market" },
];

export const knownPlaces = [
  ...plannedEvents.map((item) => ({
    name: item.venue,
    coordinates: item.coordinates,
  })),
  ...livePulses.map((item) => ({
    name: item.place,
    coordinates: item.coordinates,
  })),
].filter(
  (place, index, list) =>
    list.findIndex((item) => item.name === place.name) === index,
);

export const CAPTION_LIMIT = 140;

export function slugId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}`;
}

export function formatYerevanWhen(value: string) {
  const date = new Date(`${value}:00+04:00`);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Yerevan",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(",", "");
}

export function yerevanDateTimeLocal() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Yerevan",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export type NewPulse = Omit<LivePulse, "ageMinutes"> & { ageMinutes?: number };
export type NewEvent = PlannedEvent;
