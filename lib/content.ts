import type {
  EventCategory,
  LivePulse,
  PlannedEvent,
} from "@/lib/map/fixtures";
import { t, type Locale } from "@/lib/i18n";

export const WEEKDAYS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

const WEEKDAY_NAMES: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

export const categoryLabel: Record<EventCategory, string> = {
  tech: "Technology & learning",
  creative: "Arts & culture",
  music: "Music & nightlife",
  food: "Food & drink",
  market: "Markets & community",
  outdoors: "Outdoors & movement",
};

export function categoryName(category: EventCategory, locale: Locale) {
  return t(locale, category);
}

/** "Thu 19:00" and "Thu 19:00 · weekly" both parse. */
export function parseWhen(when: string) {
  const [day = "", time = ""] = when.split(" ");
  return {
    day: WEEKDAYS.includes(day as (typeof WEEKDAYS)[number]) ? day : "",
    time,
    weekly: when.includes("weekly"),
  };
}

export function weekdayName(day: string) {
  return WEEKDAY_NAMES[day] ?? day;
}

/** Today in Yerevan, as a short weekday. Client-only to avoid hydration drift. */
export function yerevanWeekday(now = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Yerevan",
    weekday: "short",
  }).format(now);
}

/**
 * Groups planned events into day sections that start from today and wrap
 * around the week, so "this week" always reads forward from now.
 */
export function groupByDay(events: PlannedEvent[], today: string) {
  const startIndex = Math.max(
    0,
    WEEKDAYS.indexOf(today as (typeof WEEKDAYS)[number]),
  );
  const order = [
    ...WEEKDAYS.slice(startIndex),
    ...WEEKDAYS.slice(0, startIndex),
  ];

  return order
    .map((day, index) => ({
      day,
      label:
        index === 0 ? "Today" : index === 1 ? "Tomorrow" : weekdayName(day),
      items: events
        .filter((event) =>
          event.startsAt
            ? yerevanDateKey(event.startsAt) ===
              yerevanDateKey(addDays(new Date(), index))
            : parseWhen(event.when).day === day,
        )
        .sort((a, b) =>
          (a.startsAt ?? parseWhen(a.when).time).localeCompare(
            b.startsAt ?? parseWhen(b.when).time,
          ),
        ),
    }))
    .filter((group) => group.items.length > 0);
}

export function isInYerevanWeek(startsAt?: string, now = new Date()) {
  if (!startsAt) return true;
  const start = yerevanDateKey(now);
  const end = yerevanDateKey(addDays(now, 7));
  const event = yerevanDateKey(startsAt);
  return event >= start && event < end;
}

function addDays(value: Date, days: number) {
  const next = new Date(value);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function yerevanDateKey(value: Date | string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Yerevan",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

/** Live posts read best newest-first with a short age band. */
export function sortByAge(pulses: LivePulse[]) {
  return [...pulses].sort((a, b) => a.ageMinutes - b.ageMinutes);
}

/** Short enough for the lead column of a row: "8m", "1h", "3h". */
export function compactAge(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h`;
}

// One deliberately consistent 4:3 editorial illustration family. Uploaded
// community photos still take precedence.
const IMAGES = [
  "/illustrations/event-tech-workshop.jpg",
  "/illustrations/event-gallery-night.jpg",
  "/illustrations/event-music-night.jpg",
  "/illustrations/event-food-wine.jpg",
  "/illustrations/event-market-morning.jpg",
  "/illustrations/event-outdoor-run.jpg",
  "/illustrations/event-live-street-music.jpg",
  "/illustrations/event-community-chess.jpg",
];

const IMAGE_BY_ID: Record<string, string> = {
  "cascade-duduk": "/illustrations/event-live-street-music.jpg",
  "cascade-dance": "/illustrations/event-live-street-music.jpg",
  "opera-chess": "/illustrations/event-community-chess.jpg",
  "republic-brass": "/illustrations/event-live-street-music.jpg",
  "tumo-ai-lab": "/illustrations/event-tech-workshop.jpg",
  "startup-office-hours": "/illustrations/event-tech-workshop.jpg",
  "armenia-engineering-week": "/illustrations/event-tech-workshop.jpg",
  "mirzoyan-photo-night": "/illustrations/event-gallery-night.jpg",
  "cafesjian-sculpture-tour": "/illustrations/event-gallery-night.jpg",
  "saryan-wine-tasting": "/illustrations/event-food-wine.jpg",
  "saryan-pop-up": "/illustrations/event-food-wine.jpg",
  "tonelab-listening-session": "/illustrations/event-music-night.jpg",
  "opera-chamber-night": "/illustrations/event-music-night.jpg",
  "vernissage-makers": "/illustrations/event-market-morning.jpg",
  "vernissage-print-table": "/illustrations/event-market-morning.jpg",
  "english-park-run": "/illustrations/event-outdoor-run.jpg",
};

/** Deterministic Kentron illustration for records without an uploaded image. */
export function imageFor(id: string, uploadedUrl?: string) {
  if (uploadedUrl) return uploadedUrl;
  if (IMAGE_BY_ID[id]) return IMAGE_BY_ID[id];
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) % 997;
  }
  return IMAGES[hash % IMAGES.length];
}

/**
 * The house filter belongs to the fallback illustration family only. Uploaded
 * community photography is left untouched, per DESIGN.md.
 */
export function imageTreatment(src: string) {
  return src.startsWith("/illustrations/") ? "saturate-[.82]" : "";
}

export function initialOf(value: string) {
  return value.trim().slice(0, 1).toUpperCase() || "•";
}
