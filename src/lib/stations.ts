import type { Coordinates, FuelType, NearbyStation, Station } from '../types/station';

export const SEARCH_RADIUS_KM = 25;
export const MAX_STATIONS = 10;

function validCoordinates(point: Coordinates): boolean {
  return Number.isFinite(point.latitude) && Math.abs(point.latitude) <= 90
    && Number.isFinite(point.longitude) && Math.abs(point.longitude) <= 180;
}

/** Haversine distance on a spherical Earth, not road distance. */
export function distanceKm(from: Coordinates, to: Coordinates): number {
  if (!validCoordinates(from) || !validCoordinates(to)) throw new RangeError('Invalid coordinates');
  const radians = Math.PI / 180;
  const a = Math.sin((to.latitude - from.latitude) * radians / 2) ** 2
    + Math.cos(from.latitude * radians) * Math.cos(to.latitude * radians)
    * Math.sin((to.longitude - from.longitude) * radians / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, a))));
}

export function rankNearbyStations(
  stations: readonly Station[], origin: Coordinates, fuel: FuelType,
  radiusKm = SEARCH_RADIUS_KM, limit = MAX_STATIONS,
): NearbyStation[] {
  if (!validCoordinates(origin) || !Number.isFinite(radiusKm) || radiusKm < 0
    || !Number.isInteger(limit) || limit < 0) throw new RangeError('Invalid search parameters');
  const byDistance = (a: NearbyStation, b: NearbyStation) =>
    a.distanceKm - b.distanceKm || a.station.id.localeCompare(b.station.id);
  return stations
    .filter((station) => validCoordinates(station.coordinates)
      && Number.isFinite(station.prices[fuel]) && station.prices[fuel] > 0)
    .map((station) => ({ station, distanceKm: distanceKm(origin, station.coordinates) }))
    .filter((station) => station.distanceKm <= radiusKm)
    .sort(byDistance)
    .slice(0, limit) // Select nearest before ranking the selection by price.
    .sort((a, b) => a.station.prices[fuel] - b.station.prices[fuel] || byDistance(a, b));
}
