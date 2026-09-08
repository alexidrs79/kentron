import type { FeatureCollection, Point } from "geojson";

export type EventCategory =
  "tech" | "creative" | "music" | "food" | "market" | "outdoors";
export type TimeMode = "now" | "week";

type Coordinates = readonly [longitude: number, latitude: number];

export interface PlannedEvent {
  id: string;
  ownerId?: string;
  organizer: string;
  organizerAvatarUrl?: string;
  title: string;
  venue: string;
  category: EventCategory;
  when: string;
  /** Canonical instant for Supabase records. Fixtures retain weekday copy. */
  startsAt?: string;
  /** What actually happens, written by the organizer. */
  summary?: string;
  isWeekly?: boolean;
  isPublished?: boolean;
  imageUrl?: string;
  coordinates: Coordinates;
}

export interface LivePulse {
  id: string;
  ownerId?: string;
  caption: string;
  place: string;
  category: EventCategory;
  ageMinutes: number;
  /** Canonical expiry for Supabase records. */
  expiresAt?: string;
  imageUrl?: string;
  coordinates: Coordinates;
}

export const plannedEvents: PlannedEvent[] = [
  {
    id: "tumo-ai-lab",
    organizer: "TUMO Labs",
    title: "Open lab: small models on local hardware",
    venue: "TUMO Center for Creative Technologies",
    category: "tech",
    when: "Thu 19:00",
    summary:
      "Bring a laptop or just watch. We run small language models on the machines in the lab, compare what fits in memory, and talk through what breaks. No talk, no slides — three tables and whatever people are working on.",
    coordinates: [44.4897, 40.1945],
  },
  {
    id: "startup-office-hours",
    organizer: "Hero House",
    title: "Founder office hours",
    venue: "Hero House Yerevan",
    category: "tech",
    when: "Fri 18:30",
    summary:
      "Twenty-minute slots with people who have shipped and raised in Armenia. Come with one specific question. First come, first seated; the board on the door tracks the queue.",
    coordinates: [44.5039, 40.1886],
  },
  {
    id: "armenia-engineering-week",
    organizer: "Engineering Association",
    title: "Engineering community meetup",
    venue: "Engineering City",
    category: "tech",
    when: "Sat 11:00",
    summary:
      "A monthly gathering for hardware and software people working in and around Yerevan. Two short demos, then coffee and a long table for whoever stays.",
    coordinates: [44.4933, 40.2105],
  },
  {
    id: "mirzoyan-photo-night",
    organizer: "Mirzoyan Library",
    title: "New Armenian photography",
    venue: "Mirzoyan Library",
    category: "creative",
    when: "Thu 20:00",
    summary:
      "Prints from six photographers working in Yerevan and Gyumri this year, hung in the courtyard and the back room. The photographers are around for most of the evening.",
    coordinates: [44.5118, 40.1761],
  },
  {
    id: "opera-chamber-night",
    organizer: "Yerevan Opera",
    title: "Chamber music after work",
    venue: "Armenian National Opera",
    category: "music",
    when: "Fri 19:30",
    summary:
      "An hour of chamber repertoire in the small hall, early enough to walk somewhere afterwards. Doors at seven, no interval.",
    coordinates: [44.5152, 40.1851],
  },
  {
    id: "tonelab-listening-session",
    organizer: "ToneLab",
    title: "ToneLab listening session",
    venue: "ToneLab",
    category: "music",
    when: "Sat 21:00",
    summary:
      "One record, start to finish, on the studio system. Then the room argues about it. Bring something you want played next time.",
    coordinates: [44.5122, 40.1837],
  },
  {
    id: "cafesjian-sculpture-tour",
    organizer: "Cafesjian Center",
    title: "Sculpture garden walk",
    venue: "Cafesjian Center for the Arts",
    category: "creative",
    when: "Sun 16:00",
    summary:
      "A guided hour through the garden and the lower galleries, in Armenian and English. Meet by the Botero cat.",
    coordinates: [44.5153, 40.1916],
  },
  {
    id: "vernissage-makers",
    organizer: "Vernissage Makers",
    title: "Local makers at Vernissage",
    venue: "Vernissage Market",
    category: "market",
    when: "Sat 10:00",
    summary:
      "The maker rows open early: carpets, silver, woodwork, and a handful of people selling their first run of anything. Cash still moves faster than cards here.",
    coordinates: [44.5198, 40.1771],
  },
  {
    id: "saryan-wine-tasting",
    organizer: "Saryan Wine Days",
    title: "Saryan street wine tasting",
    venue: "Saryan Street",
    category: "food",
    when: "Fri 18:00",
    summary:
      "Six Armenian producers pour along the street, one table each. Buy a glass at the first table and carry it down the row.",
    coordinates: [44.5057, 40.1853],
  },
  {
    id: "english-park-run",
    organizer: "Yerevan Runners",
    title: "Easy five-kilometre city run",
    venue: "English Park",
    category: "outdoors",
    when: "Sun 08:00",
    summary:
      "A conversational pace loop through the park and down to Republic Square. Someone always stays at the back, so nobody runs alone.",
    coordinates: [44.5078, 40.1736],
  },
];

export const livePulses: LivePulse[] = [
  {
    id: "cascade-duduk",
    caption: "Duduk and guitar on the upper Cascade steps",
    place: "Cascade",
    category: "music",
    ageMinutes: 8,
    coordinates: [44.5151, 40.1909],
  },
  {
    id: "cascade-dance",
    caption: "A small dance circle formed by the fountains",
    place: "Cascade",
    category: "creative",
    ageMinutes: 17,
    coordinates: [44.5144, 40.1897],
  },
  {
    id: "opera-chess",
    caption: "Three chess boards out by Swan Lake",
    place: "Opera",
    category: "market",
    ageMinutes: 24,
    coordinates: [44.5136, 40.1838],
  },
  {
    id: "republic-brass",
    caption: "Brass trio playing beside the History Museum",
    place: "Republic Square",
    category: "music",
    ageMinutes: 41,
    coordinates: [44.5149, 40.1778],
  },
  {
    id: "vernissage-print-table",
    caption: "Printmakers set up one last table",
    place: "Vernissage",
    category: "market",
    ageMinutes: 63,
    coordinates: [44.5192, 40.1768],
  },
  {
    id: "saryan-pop-up",
    caption: "Natural wine bottles and records on Saryan",
    place: "Saryan Street",
    category: "food",
    ageMinutes: 86,
    coordinates: [44.5062, 40.1848],
  },
  {
    id: "kond-courtyard",
    caption: "Open courtyard screening starting now",
    place: "Kond",
    category: "creative",
    ageMinutes: 112,
    coordinates: [44.5012, 40.1814],
  },
];

interface PulseProperties {
  id: string;
  caption: string;
  place: string;
  category: EventCategory;
  ageMinutes: number;
}

interface EventProperties {
  id: string;
  title: string;
  venue: string;
  category: EventCategory;
}

export function pulseCollection(
  items: LivePulse[] = livePulses,
): FeatureCollection<Point, PulseProperties> {
  return {
    type: "FeatureCollection",
    features: items.map((pulse) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [...pulse.coordinates] },
      properties: {
        id: pulse.id,
        caption: pulse.caption,
        place: pulse.place,
        category: pulse.category,
        ageMinutes: pulse.ageMinutes,
      },
    })),
  };
}

export function eventCollection(
  items: PlannedEvent[] = plannedEvents,
): FeatureCollection<Point, EventProperties> {
  return {
    type: "FeatureCollection",
    features: items.map((event) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [...event.coordinates] },
      properties: {
        id: event.id,
        title: event.title,
        venue: event.venue,
        category: event.category,
      },
    })),
  };
}
