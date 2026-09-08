import type { EventCategory } from "./fixtures";

export const categoryOptions: {
  id: EventCategory;
  label: string;
  shortLabel: string;
  color: string;
}[] = [
  {
    id: "tech",
    label: "Technology & learning",
    shortLabel: "Tech",
    color: "#6689D8",
  },
  {
    id: "creative",
    label: "Arts & culture",
    shortLabel: "Arts",
    color: "#C4304B",
  },
  {
    id: "music",
    label: "Music & nightlife",
    shortLabel: "Music",
    color: "#8B6FC6",
  },
  {
    id: "food",
    label: "Food & drink",
    shortLabel: "Food",
    color: "#4C9272",
  },
  {
    id: "market",
    label: "Markets & community",
    shortLabel: "Community",
    color: "#E6A454",
  },
  {
    id: "outdoors",
    label: "Outdoors & movement",
    shortLabel: "Outdoors",
    color: "#468998",
  },
];

export const allCategories = categoryOptions.map((category) => category.id);

export function categoryColor(category: EventCategory) {
  return (
    categoryOptions.find((option) => option.id === category)?.color ?? "#F7F3EC"
  );
}
