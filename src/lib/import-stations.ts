import type { FuelType, PriceQuote, Station } from '../types/station.ts';
import { priceAgeMs } from './format.ts';

export const SOURCE_URLS = {
  stations: 'https://drivstoffpriser.github.io/Drivstoffpriser-App/data/stations.json',
  prices: 'https://drivstoffpriser.github.io/Drivstoffpriser-App/data/prices.json',
} as const;
export type SourceSnapshot = Readonly<{
  schemaVersion: 1;
  fetchedAt: string;
  stationsFile: unknown;
  pricesFile: unknown;
}>;
export type LiveData = Readonly<{
  mode: 'live';
  fetchedAt: string;
  sourceExportedAt: string;
  stations: readonly Station[];
}>;

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Ugyldig dataobjekt');
  return value as Record<string, unknown>;
}
function string(value: unknown): string {
  if (typeof value !== 'string' || value.length > 1000) throw new Error('Ugyldig tekstfelt');
  return value;
}
function optionalText(value: unknown): string | null {
  return value === undefined || value === null ? null : string(value).trim() || null;
}
export function normalizedTimestamp(value: string, now: number): string | null {
  const age = priceAgeMs(value, now);
  return age === null ? null : new Date(now - age).toISOString();
}
function envelope(value: unknown, key: 'stations' | 'prices', now: number) {
  const data = object(value);
  const exportedAt = string(data.exportedAt);
  if (!normalizedTimestamp(exportedAt, now)) throw new Error('Ugyldig eksporttid');
  const rows = data[key];
  if (!Array.isArray(rows) || rows.length > 100_000 || data.count !== rows.length) throw new Error('Ufullstendig eksport');
  return { exportedAt, rows: rows as unknown[] };
}

/** Reject the entire pair on structural errors. Never silently replace a good cache with a partial import. */
export function importSnapshot(value: unknown, now: number): LiveData {
  const snapshot = object(value);
  if (snapshot.schemaVersion !== 1) throw new Error('Ukjent cacheversjon');
  const fetchedAt = string(snapshot.fetchedAt);
  if (!normalizedTimestamp(fetchedAt, now)) throw new Error('Ugyldig hentetid');
  const stationFile = envelope(snapshot.stationsFile, 'stations', now);
  const priceFile = envelope(snapshot.pricesFile, 'prices', now);
  if (stationFile.exportedAt !== priceFile.exportedAt || stationFile.rows.length === 0) throw new Error('Eksportfilene er ikke et komplett par');
  const stations = new Map<string, Station>();
  for (const raw of stationFile.rows) {
    const row = object(raw);
    const id = string(row.id);
    if (!id.trim() || stations.has(id)) throw new Error('Manglende eller duplisert stasjons-ID');
    const { latitude, longitude } = row;
    if (typeof latitude !== 'number' || typeof longitude !== 'number'
      || !Number.isFinite(latitude) || Math.abs(latitude) > 90
      || !Number.isFinite(longitude) || Math.abs(longitude) > 180) throw new Error('Ugyldige koordinater');
    stations.set(id, { id: `drivstoffpriser:${id}`, sourceId: 'drivstoffpriser', sourceStationId: id,
      name: optionalText(row.name) ?? 'Ukjent stasjonsnavn', brand: optionalText(row.brand),
      address: optionalText(row.address), city: optionalText(row.city), coordinates: { latitude, longitude }, prices: {} });
  }
  const seenPrices = new Set<string>();
  for (const raw of priceFile.rows) {
    const row = object(raw);
    const stationId = string(row.stationId);
    const station = stations.get(stationId);
    if (!station) throw new Error('Pris viser til ukjent stasjon');
    const fuel = string(row.fuelType);
    // Unknown future fuels are deliberately ignored; current supported fuels remain strict.
    if (fuel !== 'petrol95' && fuel !== 'petrol98' && fuel !== 'diesel') continue;
    const key = JSON.stringify([stationId, fuel]);
    if (seenPrices.has(key)) throw new Error('Duplisert drivstoffpris');
    seenPrices.add(key);
    if (row.price === null || row.price === undefined) continue;
    if (typeof row.price !== 'number' || !Number.isFinite(row.price) || row.price <= 0 || row.price > 100) throw new Error('Ugyldig literpris');
    const amountOrePerLiter = Math.round(row.price * 100);
    if (amountOrePerLiter === 0) throw new Error('Ugyldig avrundet pris');
    const sourceUpdatedAtRaw = optionalText(row.updatedAt);
    const count = row.reportCount;
    if (count !== undefined && count !== null && (typeof count !== 'number' || !Number.isSafeInteger(count) || count < 0)) throw new Error('Ugyldig rapportantall');
    const quote: PriceQuote = { amountOrePerLiter, sourceId: 'drivstoffpriser', sourceUpdatedAtRaw,
      reportedAt: sourceUpdatedAtRaw ? normalizedTimestamp(sourceUpdatedAtRaw, now) : null,
      observedAt: null, reportCount: typeof count === 'number' ? count : null };
    stations.set(stationId, { ...station, prices: { ...station.prices, [fuel as FuelType]: quote } });
  }
  return { mode: 'live', fetchedAt, sourceExportedAt: normalizedTimestamp(stationFile.exportedAt, now)!, stations: [...stations.values()] };
}
