export interface MapBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

export function isInBounds(
  coordinates: readonly [number, number],
  bounds: MapBounds,
) {
  const [lng, lat] = coordinates;
  return (
    lng >= bounds.west &&
    lng <= bounds.east &&
    lat >= bounds.south &&
    lat <= bounds.north
  );
}

export function formatAge(minutes: number) {
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) return `${hours}h ago`;
  return `${hours}h ${rest}m ago`;
}
