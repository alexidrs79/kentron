export const seedUsers = [
  {
    id: "user-ani",
    name: "Ani Petrosyan",
    email: "ani@kentron.am",
  },
  {
    id: "user-narek",
    name: "Narek Avagyan",
    email: "narek@kentron.am",
  },
  {
    id: "user-lilit",
    name: "Lilit Grigoryan",
    email: "lilit@kentron.am",
  },
  {
    id: "user-aram",
    name: "Aram Mkrtchyan",
    email: "aram@kentron.am",
  },
] as const;

export const seedPassword = "cascade-dusk";

export { seedEvents } from "./seed-events";

type Category = "tech" | "creative" | "market";

export const seedPulses: {
  id: string;
  sessionId: string;
  caption: string;
  category: Category;
  lat: number;
  lng: number;
  postedMinutesAgo: number;
}[] = [
  {
    id: "cascade-duduk",
    sessionId: "walk-cascade",
    caption: "Duduk and guitar on the upper Cascade steps",
    category: "creative",
    lat: 40.1909,
    lng: 44.5151,
    postedMinutesAgo: 8,
  },
  {
    id: "cascade-dance",
    sessionId: "walk-cascade",
    caption: "A small dance circle formed by the fountains",
    category: "creative",
    lat: 40.1897,
    lng: 44.5144,
    postedMinutesAgo: 17,
  },
  {
    id: "opera-chess",
    sessionId: "swan-lake",
    caption: "Three chess boards out by Swan Lake",
    category: "market",
    lat: 40.1838,
    lng: 44.5136,
    postedMinutesAgo: 24,
  },
  {
    id: "republic-brass",
    sessionId: "republic-walk",
    caption: "Brass trio playing beside the History Museum",
    category: "creative",
    lat: 40.1778,
    lng: 44.5149,
    postedMinutesAgo: 41,
  },
  {
    id: "vernissage-print-table",
    sessionId: "vernissage-late",
    caption: "Printmakers set up one last table",
    category: "market",
    lat: 40.1768,
    lng: 44.5192,
    postedMinutesAgo: 63,
  },
  {
    id: "saryan-pop-up",
    sessionId: "saryan-night",
    caption: "Natural wine bottles and records on Saryan",
    category: "market",
    lat: 40.1848,
    lng: 44.5062,
    postedMinutesAgo: 86,
  },
  {
    id: "kond-courtyard",
    sessionId: "kond-evening",
    caption: "Open courtyard screening starting now",
    category: "creative",
    lat: 40.1814,
    lng: 44.5012,
    postedMinutesAgo: 112,
  },
];
