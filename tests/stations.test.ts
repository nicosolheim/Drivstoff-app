import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DEMO_POSITION, STATIONS } from '../src/data/stations.ts';
import { distanceKm, rankNearbyStations } from '../src/lib/stations.ts';
import type { Station } from '../src/types/station.ts';

const origin = { latitude: 0, longitude: 0 };
function station(id: string, latitude: number, petrol = 20, diesel = 19): Station {
  return { id, name: id, coordinates: { latitude, longitude: 0 }, prices: { petrol, diesel }, updatedAt: '2026-09-18T10:00:00Z' };
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
  assert.deepEqual(ids(rankNearbyStations(items, origin, 'petrol', radius)), ['center', 'edge']);
  assert.deepEqual(ids(rankNearbyStations(items, origin, 'petrol', 0)), ['center']);
});
test('fuel choice changes price ranking; distance resolves equal prices', () => {
  const items = [station('far', 0.03, 19, 22), station('near', 0.01, 19, 21), station('middle', 0.02, 20, 18)];
  assert.deepEqual(ids(rankNearbyStations(items, origin, 'petrol')), ['near', 'far', 'middle']);
  assert.deepEqual(ids(rankNearbyStations(items, origin, 'diesel')), ['middle', 'near', 'far']);
  assert.deepEqual(items.map((item) => item.id), ['far', 'near', 'middle']);
});
test('nearest selection happens before price ranking, with default limit ten', () => {
  const items = Array.from({ length: 11 }, (_, i) => station(String(i), i / 100, 30 - i));
  const result = ids(rankNearbyStations(items, origin, 'petrol'));
  assert.equal(result.length, 10);
  assert.equal(result[0], '9');
  assert.ok(!result.includes('10'));
});
test('ID makes tied price and distance deterministic', () => {
  assert.deepEqual(ids(rankNearbyStations([station('b', 0), station('a', 0)], origin, 'diesel')), ['a', 'b']);
});
test('empty results, invalid prices and coordinates, invalid search options', () => {
  assert.deepEqual(rankNearbyStations([], origin, 'petrol'), []);
  assert.deepEqual(rankNearbyStations([station('far', 2)], origin, 'petrol'), []);
  assert.deepEqual(rankNearbyStations([station('a', 0)], origin, 'petrol', 25, 0), []);
  assert.deepEqual(rankNearbyStations([station('nan', NaN), station('free', 0, 0), station('bad', 0, Infinity)], origin, 'petrol'), []);
  assert.throws(() => rankNearbyStations([], origin, 'petrol', -1), RangeError);
  assert.throws(() => rankNearbyStations([], origin, 'petrol', 25, 1.5), RangeError);
});
test('demo data has unique IDs and six stations within radius, with different cheapest fuels', () => {
  assert.equal(new Set(STATIONS.map((item) => item.id)).size, STATIONS.length);
  for (const item of STATIONS) {
    assert.ok(Number.isFinite(Date.parse(item.updatedAt)));
    assert.ok(item.prices.petrol > 0 && item.prices.diesel > 0);
  }
  const petrol = rankNearbyStations(STATIONS, DEMO_POSITION, 'petrol');
  const diesel = rankNearbyStations(STATIONS, DEMO_POSITION, 'diesel');
  assert.equal(petrol.length, 6);
  assert.equal(petrol[0]?.station.id, 'demo-05');
  assert.equal(diesel[0]?.station.id, 'demo-04');
  assert.ok(!ids(petrol).includes('demo-07'));
});
