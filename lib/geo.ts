import type { DistanceUnit } from "@/components/preferences";

const EARTH_RADIUS_M = 6_371_000;

/** Straight-line metres between two [lng, lat] pairs. */
export function distanceMeters(
  from: readonly [number, number],
  to: readonly [number, number],
) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const [lng1, lat1] = from;
  const [lng2, lat2] = to;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

export function formatDistance(meters: number, unit: DistanceUnit) {
  if (unit === "mi") {
    const miles = meters / 1609.34;
    if (miles < 0.1) return `${Math.round(meters * 3.28084)} ft`;
    return `${miles.toFixed(miles < 10 ? 1 : 0)} mi`;
  }
  if (meters < 950) return `${Math.round(meters / 10) * 10} m`;
  const km = meters / 1000;
  return `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

/** Rough walking time at 80 m/min, floored at one minute. */
export function walkMinutes(meters: number) {
  return Math.max(1, Math.round(meters / 80));
}

/** Open the place in Google Maps. */
export function mapsPlaceUrl(coordinates: readonly [number, number]) {
  return `https://www.google.com/maps/search/?api=1&query=${coordinates[1]},${coordinates[0]}`;
}

/** Walking/driving directions to the place. */
export function mapsDirectionsUrl(coordinates: readonly [number, number]) {
  return `https://www.google.com/maps/dir/?api=1&destination=${coordinates[1]},${coordinates[0]}`;
}
