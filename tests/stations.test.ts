import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DEMO_POSITION, STATIONS } from '../src/data/stations.ts';
import { distanceKm, rankNearbyStations as rank, stationSelection } from '../src/lib/stations.ts';
import { pricePresentation, priceStatus } from '../src/lib/prices.ts';
import type { Coordinates, FuelType, PriceQuote, Station } from '../src/types/station.ts';

const now = Date.parse('2026-09-18T18:00:00Z');
function rankNearbyStations(stations: readonly Station[], origin: Coordinates, fuel: FuelType, radius = 25, limit = 10) {
  return rank(stations, origin, fuel, radius, limit, now);
}
function quote(amount: number, stamp: string | null = '2026-09-18T10:00:00Z'): PriceQuote {
  return { amountOrePerLiter: Math.round(amount * 100), sourceId: 'drivstoffpriser', sourceUpdatedAtRaw: stamp,
    reportedAt: stamp, observedAt: null, reportCount: 1 };
}

const origin = { latitude: 0, longitude: 0 };
function station(id: string, latitude: number, petrol = 20, diesel = 19): Station {
  return { id, sourceId: 'drivstoffpriser', sourceStationId: id, name: id, brand: null, address: null, city: null,
    coordinates: { latitude, longitude: 0 }, prices: { petrol95: quote(petrol), diesel: quote(diesel) } };
}
const ids = (items: ReturnType<typeof rankNearbyStations>) => items.map((item) => item.station.id);

test('distance: same point, known equatorial degree and symmetry', () => {
  assert.equal(distanceKm(DEMO_POSITION, DEMO_POSITION), 0);
  const oneDegree = { latitude: 0, longitude: 1 };
  assert.ok(Math.abs(distanceKm(origin, oneDegree) - 111.195) < 0.001);
  assert.equal(distanceKm(origin, oneDegree), distanceKm(oneDegree, origin));
});
test('distance: antipodes and crossing the date line remain finite', () => {
  assert.ok(Math.abs(distanceKm(origin, { latitude: 0, longitude: 180 }) - 20015.087) < 0.001);
  assert.ok(distanceKm({ latitude: 0, longitude: 179.9 }, { latitude: 0, longitude: -179.9 }) < 23);
  assert.throws(() => distanceKm(origin, { latitude: NaN, longitude: 0 }), RangeError);
  assert.throws(() => distanceKm(origin, { latitude: 91, longitude: 0 }), RangeError);
});
test('radius includes boundary, excludes just outside and supports radius zero', () => {
  const edge = station('edge', 0.1);
  const radius = distanceKm(origin, edge.coordinates);
  const items = [station('outside', 0.100001), edge, station('center', 0)];
  assert.deepEqual(ids(rankNearbyStations(items, origin, 'petrol95', radius)), ['center', 'edge']);
  assert.deepEqual(ids(rankNearbyStations(items, origin, 'petrol95', 0)), ['center']);
});
test('fuel choice changes price ranking; distance resolves equal prices', () => {
  const items = [station('far', 0.03, 19, 22), station('near', 0.01, 19, 21), station('middle', 0.02, 20, 18)];
  assert.deepEqual(ids(rankNearbyStations(items, origin, 'petrol95')), ['near', 'far', 'middle']);
  assert.deepEqual(ids(rankNearbyStations(items, origin, 'diesel')), ['middle', 'near', 'far']);
  assert.deepEqual(items.map((item) => item.id), ['far', 'near', 'middle']);
});
test('nearest selection happens before price ranking, with default limit ten', () => {
  const items = Array.from({ length: 11 }, (_, i) => station(String(i), i / 100, 30 - i));
  const result = ids(rankNearbyStations(items, origin, 'petrol95'));
  assert.equal(result.length, 10);
  assert.equal(result[0], '9');
  assert.ok(!result.includes('10'));
});
test('ID makes tied price and distance deterministic', () => {
  assert.deepEqual(ids(rankNearbyStations([station('b', 0), station('a', 0)], origin, 'diesel')), ['a', 'b']);
});
test('empty results, invalid prices and coordinates, invalid search options', () => {
  assert.deepEqual(rankNearbyStations([], origin, 'petrol95'), []);
  assert.deepEqual(rankNearbyStations([station('far', 2)], origin, 'petrol95'), []);
  assert.deepEqual(rankNearbyStations([station('a', 0)], origin, 'petrol95', 25, 0), []);
  assert.deepEqual(ids(rankNearbyStations([station('nan', NaN), station('free', 0, 0), station('bad', 0, Infinity)], origin, 'petrol95')), ['bad', 'free']);
  assert.throws(() => rankNearbyStations([], origin, 'petrol95', -1), RangeError);
  assert.throws(() => rankNearbyStations([], origin, 'petrol95', 25, 1.5), RangeError);
});
test('demo data has unique IDs and six stations within radius, with different cheapest fuels', () => {
  assert.equal(new Set(STATIONS.map((item) => item.id)).size, STATIONS.length);
  for (const item of STATIONS) {
    assert.ok(Number.isFinite(Date.parse(item.prices.petrol95?.reportedAt ?? '')));
    assert.ok((item.prices.petrol95?.amountOrePerLiter ?? 0) > 0 && (item.prices.diesel?.amountOrePerLiter ?? 0) > 0);
  }
  const petrol = rankNearbyStations(STATIONS, DEMO_POSITION, 'petrol95');
  const diesel = rankNearbyStations(STATIONS, DEMO_POSITION, 'diesel');
  assert.equal(petrol.length, 6);
  assert.equal(petrol[0]?.station.id, 'demo-05');
  assert.equal(diesel[0]?.station.id, 'demo-01'); // Cheaper historical prices cannot win.
  assert.ok(!ids(petrol).includes('demo-07'));
});

test('missing, historical and ambiguous prices stay visible but cannot win current ranking', () => {
  const fresh = station('fresh', 0.04, 25);
  const old = { ...station('old', 0.02), prices: { petrol95: quote(1, '2026-01-01T00:00:00Z') } };
  const missing = { ...station('missing', 0.01), prices: {} };
  const ambiguous = { ...station('ambiguous', 0.03), prices: { petrol95: quote(2, '2026-09-18T10:00:00') } };
  assert.deepEqual(ids(rankNearbyStations([old, fresh, missing, ambiguous], origin, 'petrol95')), ['fresh', 'missing', 'old', 'ambiguous']);
  assert.deepEqual(ids(rankNearbyStations([old, missing, ambiguous], origin, 'petrol95')), ['missing', 'old', 'ambiguous']);
  assert.equal(pricePresentation(old.prices.petrol95, now).status, 'historical');
  assert.match(pricePresentation(ambiguous.prices.petrol95, now).label, /Ubekreftet/);
  assert.equal(pricePresentation(undefined, now).value, 'Pris ikke tilgjengelig');
});
test('exact 24-hour eligibility; invalid, future or timezone-free times never current', () => {
  assert.equal(priceStatus(quote(20, new Date(now - 86_400_000).toISOString()), now), 'current');
  assert.equal(priceStatus(quote(20, new Date(now - 86_400_001).toISOString()), now), 'historical');
  for (const time of [null, '', 'invalid', '2026-09-18T17:00:00', '2026-09-19T00:00:00Z']) assert.equal(priceStatus(quote(20, time), now), 'uncertain');
});
test('single map/list selection retains missing prices across all fuels and isolates live/demo', () => {
  const live = [{ ...station('real', 0), coordinates: DEMO_POSITION }];
  for (const fuel of ['petrol95', 'petrol98', 'diesel'] as const) {
    const selection = stationSelection('live', [...live, ...STATIONS], STATIONS, DEMO_POSITION, fuel, now);
    assert.deepEqual(ids(selection.items), ['real']);
    assert.equal(selection.currentCount, fuel === 'petrol98' ? 0 : 1);
    const demo = stationSelection('demo', live, [...STATIONS, ...live], DEMO_POSITION, fuel, now);
    assert.equal(demo.items.length, 6);
    assert.ok(demo.items.every(({ station }) => station.sourceId === 'demo'));
  }
  assert.deepEqual(stationSelection('live', [], STATIONS, DEMO_POSITION, 'diesel', now).items, []);
  assert.equal(stationSelection('demo', [], STATIONS, DEMO_POSITION, 'diesel', now + 7 * 86_400_000).currentCount, 0);
});

test('actual origin changes distances and yields an empty selection outside demo coverage', () => {
  const oslo = rankNearbyStations(STATIONS, DEMO_POSITION, 'petrol95');
  const moved = rankNearbyStations(STATIONS, { latitude: 59.93, longitude: 10.75 }, 'petrol95');
  assert.notEqual(oslo[0]?.distanceKm, moved[0]?.distanceKm);
  assert.deepEqual(rankNearbyStations(STATIONS, { latitude: 60.39, longitude: 5.32 }, 'petrol95'), []);
});
