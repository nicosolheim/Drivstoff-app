import assert from 'node:assert/strict';
import { test } from 'node:test';
import { importSnapshot } from '../src/lib/import-stations.ts';
import { priceStatus } from '../src/lib/prices.ts';
import { exportDatabase } from '../src/lib/data-license.ts';
import { fixture, NOW } from './data-fixtures.ts';

test('imports namespaced source IDs, metadata, coordinates and joins all three fuel types', () => {
  const data = importSnapshot(fixture(), NOW);
  const station = data.stations[0]!;
  assert.equal(station.id, 'drivstoffpriser:test-1');
  assert.equal(station.sourceStationId, 'test-1');
  assert.equal(station.brand, 'Testkjede');
  assert.equal(station.address, 'Testveien 1');
  assert.equal(station.city, 'Oslo');
  assert.deepEqual(station.coordinates, { latitude: 59.9, longitude: 10.7 });
  assert.equal(station.prices.petrol95?.amountOrePerLiter, 2099);
  assert.equal(station.prices.petrol98?.amountOrePerLiter, 2250);
  assert.equal(station.prices.diesel?.amountOrePerLiter, 1999);
  assert.equal(station.prices.petrol95?.sourceId, 'drivstoffpriser');
  assert.equal(station.prices.petrol95?.reportCount, 4);
  assert.equal(station.prices.petrol95?.reportedAt, '2026-09-19T08:00:00.000Z');
  assert.equal(station.prices.petrol95?.observedAt, null);
  assert.deepEqual(data.stations[1]?.prices, {});
  assert.equal(data.stations[1]?.name, 'Ukjent stasjonsnavn');
  assert.equal(data.stations[1]?.address, null);
});
test('fetch/export time cannot make old or ambiguous prices current; raw timestamps preserved', () => {
  const snapshot = fixture();
  const station = importSnapshot(snapshot, NOW).stations[0]!;
  assert.equal(priceStatus(station.prices.petrol95, NOW), 'current');
  assert.equal(priceStatus(station.prices.petrol98, NOW), 'uncertain');
  assert.equal(station.prices.petrol98?.sourceUpdatedAtRaw, '2026-05-15T10:00:00.123456');
  assert.equal(station.prices.petrol98?.reportedAt, null);
  assert.equal(priceStatus(station.prices.diesel, NOW), 'historical');
  const later = NOW + 10 * 86_400_000;
  const reloaded = importSnapshot({ ...snapshot, fetchedAt: new Date(later).toISOString() }, later);
  assert.equal(priceStatus(reloaded.stations[0]?.prices.petrol95, later), 'historical');
  for (const updatedAt of [undefined, null, '', 'broken', '2026-02-30T10:00:00Z', '2027-01-01T00:00:00Z']) {
    const quote = importSnapshot(fixture({}, { updatedAt }), NOW).stations[0]?.prices.petrol95;
    assert.equal(quote?.reportedAt, null);
    assert.equal(priceStatus(quote, NOW), 'uncertain');
  }
});
test('null prices stay missing and unsupported future fuel types are ignored', () => {
  assert.equal(importSnapshot(fixture({}, { price: null }), NOW).stations[0]?.prices.petrol95, undefined);
  assert.equal(importSnapshot(fixture({}, { fuelType: 'hydrogen' }), NOW).stations[0]?.prices.petrol95, undefined);
});
test('rejects invalid coordinates, identifiers, amounts, report counts, orphans and incomplete envelopes', () => {
  for (const latitude of [91, NaN, Infinity, '59', null]) assert.throws(() => importSnapshot(fixture({ latitude }), NOW));
  for (const longitude of [181, NaN, '10']) assert.throws(() => importSnapshot(fixture({ longitude }), NOW));
  for (const id of ['', 'test-2', null, 42]) assert.throws(() => importSnapshot(fixture({ id }), NOW));
  for (const price of [0, -1, NaN, Infinity, '20', 1000]) assert.throws(() => importSnapshot(fixture({}, { price }), NOW));
  for (const reportCount of [-1, 0.5, '3']) assert.throws(() => importSnapshot(fixture({}, { reportCount }), NOW));
  assert.throws(() => importSnapshot(fixture({}, { stationId: 'absent' }), NOW));
  assert.throws(() => importSnapshot(fixture({}, { fuelType: 'diesel' }), NOW));
  const snapshot = fixture();
  for (const pricesFile of [null, {}, { exportedAt: '2026-09-18T00:00:00Z', count: 0, prices: [] },
    { exportedAt: '2026-09-19T06:00:00+00:00', count: 1, prices: [] }]) {
    assert.throws(() => importSnapshot({ ...snapshot, pricesFile }, NOW));
  }
  assert.throws(() => importSnapshot({ ...snapshot, schemaVersion: 2 }, NOW));
});
test('ODbL export includes full database, original sources and attribution without user position', () => {
  const snapshot = fixture();
  const data = importSnapshot(snapshot, NOW);
  const exported = JSON.parse(exportDatabase({ snapshot, data }));
  assert.equal(exported.database.stations.length, 2);
  assert.deepEqual(exported.originalExport, snapshot);
  assert.match(exported.license.attribution, /OpenStreetMap/);
  assert.match(exported.license.url, /odbl/);
  assert.equal(exported.database.userPosition, undefined);
});
