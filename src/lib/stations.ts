import type { Coordinates, DataMode, FuelType, NearbyStation, Station } from '../types/station.ts';
import { priceStatus } from './prices.ts';

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
  radiusKm = SEARCH_RADIUS_KM, limit = MAX_STATIONS, now = Date.now(),
): NearbyStation[] {
  if (!validCoordinates(origin) || !Number.isFinite(radiusKm) || radiusKm < 0
    || !Number.isInteger(limit) || limit < 0) throw new RangeError('Invalid search parameters');
  const byDistance = (a: NearbyStation, b: NearbyStation) =>
    a.distanceKm - b.distanceKm || a.station.id.localeCompare(b.station.id);
  return stations
    .filter((station) => validCoordinates(station.coordinates))
    .map((station) => ({ station, distanceKm: distanceKm(origin, station.coordinates) }))
    .filter((station) => station.distanceKm <= radiusKm)
    .sort(byDistance)
    .slice(0, limit) // Select nearest before ranking the selection by price.
    .sort((a, b) => {
      const ap = a.station.prices[fuel];
      const bp = b.station.prices[fuel];
      const ac = priceStatus(ap, now) === 'current';
      const bc = priceStatus(bp, now) === 'current';
      if (ac !== bc) return ac ? -1 : 1;
      return ac && bc && ap && bp ? ap.amountOrePerLiter - bp.amountOrePerLiter || byDistance(a, b) : byDistance(a, b);
    });
}

/** One selection for both map and list; the mode gate also prevents accidental source mixing. */
export function stationSelection(mode: DataMode, live: readonly Station[], demo: readonly Station[],
  origin: Coordinates, fuel: FuelType, now: number) {
  const source = mode === 'live' ? 'drivstoffpriser' : 'demo';
  const stations = (mode === 'live' ? live : demo).filter((station) => station.sourceId === source);
  const items = rankNearbyStations(stations, origin, fuel, SEARCH_RADIUS_KM, MAX_STATIONS, now);
  return { items, currentCount: items.filter(({ station }) => priceStatus(station.prices[fuel], now) === 'current').length };
}
