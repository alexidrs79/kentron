import type { FeatureCollection, Point } from "geojson";

export type EventCategory = "tech" | "creative" | "market";
export type TimeMode = "now" | "week";

type Coordinates = readonly [longitude: number, latitude: number];

export interface PlannedEvent {
  id: string;
  title: string;
  venue: string;
  category: EventCategory;
  when: string;
  coordinates: Coordinates;
}

export interface LivePulse {
  id: string;
  caption: string;
  place: string;
  ageMinutes: number;
  coordinates: Coordinates;
}

export const plannedEvents: PlannedEvent[] = [
  {
    id: "tumo-ai-lab",
    title: "Open lab: small models on local hardware",
    venue: "TUMO Center for Creative Technologies",
    category: "tech",
    when: "Thu 19:00",
    coordinates: [44.4897, 40.1945],
  },
  {
    id: "startup-office-hours",
    title: "Founder office hours",
    venue: "Hero House Yerevan",
    category: "tech",
    when: "Fri 18:30",
    coordinates: [44.5039, 40.1886],
  },
  {
    id: "armenia-engineering-week",
    title: "Engineering community meetup",
    venue: "Engineering City",
    category: "tech",
    when: "Sat 11:00",
    coordinates: [44.4933, 40.2105],
  },
  {
    id: "mirzoyan-photo-night",
    title: "New Armenian photography",
    venue: "Mirzoyan Library",
    category: "creative",
    when: "Thu 20:00",
    coordinates: [44.5118, 40.1761],
  },
  {
    id: "opera-chamber-night",
    title: "Chamber music after work",
    venue: "Armenian National Opera",
    category: "creative",
    when: "Fri 19:30",
    coordinates: [44.5152, 40.1851],
  },
  {
    id: "tonelab-listening-session",
    title: "ToneLab listening session",
    venue: "ToneLab",
    category: "creative",
    when: "Sat 21:00",
    coordinates: [44.5122, 40.1837],
  },
  {
    id: "cafesjian-sculpture-tour",
    title: "Sculpture garden walk",
    venue: "Cafesjian Center for the Arts",
    category: "creative",
    when: "Sun 16:00",
    coordinates: [44.5153, 40.1916],
  },
  {
    id: "vernissage-makers",
    title: "Local makers at Vernissage",
    venue: "Vernissage Market",
    category: "market",
    when: "Sat 10:00",
    coordinates: [44.5198, 40.1771],
  },
  {
    id: "saryan-wine-tasting",
    title: "Saryan street wine tasting",
    venue: "Saryan Street",
    category: "market",
    when: "Fri 18:00",
    coordinates: [44.5057, 40.1853],
  },
  {
    id: "english-park-run",
    title: "Easy five-kilometre city run",
    venue: "English Park",
    category: "market",
    when: "Sun 08:00",
    coordinates: [44.5078, 40.1736],
  },
];

export const livePulses: LivePulse[] = [
  {
    id: "cascade-duduk",
    caption: "Duduk and guitar on the upper Cascade steps",
    place: "Cascade",
    ageMinutes: 8,
    coordinates: [44.5151, 40.1909],
  },
  {
    id: "cascade-dance",
    caption: "A small dance circle formed by the fountains",
    place: "Cascade",
    ageMinutes: 17,
    coordinates: [44.5144, 40.1897],
  },
  {
    id: "opera-chess",
    caption: "Three chess boards out by Swan Lake",
    place: "Swan Lake",
    ageMinutes: 24,
    coordinates: [44.5136, 40.1838],
  },
  {
    id: "republic-brass",
    caption: "Brass trio playing beside the History Museum",
    place: "Republic Square",
    ageMinutes: 41,
    coordinates: [44.5149, 40.1778],
  },
  {
    id: "vernissage-print-table",
    caption: "Printmakers set up one last table",
    place: "Vernissage",
    ageMinutes: 63,
    coordinates: [44.5192, 40.1768],
  },
  {
    id: "saryan-pop-up",
    caption: "Natural wine bottles and records on Saryan",
    place: "Saryan Street",
    ageMinutes: 86,
    coordinates: [44.5062, 40.1848],
  },
  {
    id: "kond-courtyard",
    caption: "Open courtyard screening starting now",
    place: "Kond",
    ageMinutes: 112,
    coordinates: [44.5012, 40.1814],
  },
];

interface PulseProperties {
  id: string;
  caption: string;
  place: string;
  ageMinutes: number;
  opacity: number;
}

interface EventProperties {
  id: string;
  title: string;
  venue: string;
  category: EventCategory;
}

export function pulseCollection(): FeatureCollection<Point, PulseProperties> {
  return {
    type: "FeatureCollection",
    features: livePulses.map((pulse) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [...pulse.coordinates] },
      properties: {
        id: pulse.id,
        caption: pulse.caption,
        place: pulse.place,
        ageMinutes: pulse.ageMinutes,
        opacity: Math.max(0.45, 1 - pulse.ageMinutes / 180),
      },
    })),
  };
}

export function eventCollection(): FeatureCollection<Point, EventProperties> {
  return {
    type: "FeatureCollection",
    features: plannedEvents.map((event) => ({
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
