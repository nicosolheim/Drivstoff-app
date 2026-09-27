import type { SourceSnapshot } from '../src/lib/import-stations.ts';
export const NOW = Date.parse('2026-09-19T12:00:00Z');
export const EXPORTED = '2026-09-19T06:00:00+00:00';
export function fixture(stationChanges: Record<string, unknown> = {}, priceChanges: Record<string, unknown> = {}): SourceSnapshot {
  return { schemaVersion: 1, fetchedAt: new Date(NOW).toISOString(),
    stationsFile: { exportedAt: EXPORTED, count: 2, stations: [
      { id: 'test-1', name: 'Teststasjon', latitude: 59.9, longitude: 10.7, brand: 'Testkjede', address: 'Testveien 1', city: 'Oslo', ...stationChanges },
      { id: 'test-2', name: '', latitude: 60, longitude: 11 },
    ] },
    pricesFile: { exportedAt: EXPORTED, count: 3, prices: [
      { stationId: 'test-1', fuelType: 'petrol95', price: 20.99, updatedAt: '2026-09-19T10:00:00+02:00', reportCount: 4, ...priceChanges },
      { stationId: 'test-1', fuelType: 'petrol98', price: 22.5, updatedAt: '2026-05-15T10:00:00.123456', reportCount: 1 },
      { stationId: 'test-1', fuelType: 'diesel', price: 19.99, updatedAt: '2026-05-15T10:00:00Z' },
    ] },
  };
}
