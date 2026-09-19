import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createStationCache, refreshDue, REFRESH_INTERVAL_MS } from '../src/lib/station-cache.ts';
import { downloadStations } from '../src/lib/download-stations.ts';
import type { FetchData } from '../src/lib/download-stations.ts';
import { fixture, NOW } from './data-fixtures.ts';

function memoryStore() {
  const files = new Map<string, string>();
  return { files, async read(key: string) { return files.get(key) ?? null; }, async write(key: string, text: string) { files.set(key, text); } };
}
const response = (text: string, status = 200, type = 'application/json') => ({ ok: status === 200, status,
  headers: { get(name: string) { return name === 'content-type' ? type : null; } }, async text() { return text; } });
const sourceFetch: FetchData = async (url) => response(JSON.stringify(url.endsWith('/stations.json') ? fixture().stationsFile : fixture().pricesFile));

test('HTTPS pair download validates and records fetch time independently of export and price', async () => {
  const calls: string[] = [];
  const downloaded = await downloadStations(async (url, init) => { calls.push(url); return sourceFetch(url, init); }, () => NOW);
  assert.equal(calls.length, 2);
  assert.ok(calls.every((url) => url.startsWith('https://drivstoffpriser.github.io/')));
  assert.equal(downloaded.data.fetchedAt, new Date(NOW).toISOString());
  assert.equal(downloaded.data.stations[0]?.prices.petrol98?.reportedAt, null);
});
test('failed downloads, HTML, malformed JSON and partial data reject without changing offline cache', async () => {
  const cache = createStationCache(memoryStore());
  await cache.save(fixture(), NOW);
  const failures: FetchData[] = [
    async () => { throw new Error('offline'); }, async () => response('{}', 429),
    async () => response('<html>error</html>', 200, 'text/html'), async () => response('{'),
    async () => response('{}'),
    async () => ({ ...response('{}'), headers: { get: () => '10000001' } }),
  ];
  for (const fetch of failures) {
    await assert.rejects(downloadStations(fetch, () => NOW));
    assert.deepEqual((await cache.load(NOW))?.snapshot, fixture());
  }
});
test('download timeout and foreground cancellation abort requests', async () => {
  const wait: FetchData = (_url, { signal }) => new Promise((_resolve, reject) => {
    if (signal.aborted) reject(new Error('aborted'));
    signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
  });
  await assert.rejects(downloadStations(wait, () => NOW, undefined, 10));
  const controller = new AbortController();
  const result = downloadStations(wait, () => NOW, controller.signal);
  controller.abort();
  await assert.rejects(result);
});
test('empty offline cache stays empty; persisted cache is revalidated on cold start', async () => {
  const store = memoryStore();
  const cache = createStationCache(store);
  assert.equal(await cache.load(NOW), null);
  await cache.save(fixture(), NOW);
  assert.equal((await createStationCache(store).load(NOW))?.data.stations.length, 2);
  assert.equal(await createStationCache({ async read() { throw new Error('disk'); }, async write() {} }).load(NOW), null);
});
test('invalid data and interrupted writes cannot overwrite the last valid slot', async () => {
  const store = memoryStore();
  const cache = createStationCache(store);
  await cache.save(fixture(), NOW);
  const newer = { ...fixture(), fetchedAt: new Date(NOW + 1000).toISOString() };
  await assert.rejects(cache.save({ ...newer, pricesFile: {} }, NOW + 1000));
  const broken = createStationCache({ read: store.read, async write(key) { store.files.set(key, '{partial'); throw new Error('disk full'); } });
  await assert.rejects(broken.save(newer, NOW + 1000));
  assert.deepEqual((await cache.load(NOW + 1000))?.snapshot, fixture());
  await cache.save(newer, NOW + 1000);
  assert.deepEqual((await cache.load(NOW + 1000))?.snapshot, newer);
  assert.equal(store.files.size, 2);
  await cache.save({ ...newer, fetchedAt: new Date(NOW + 2000).toISOString() }, NOW + 2000);
  assert.equal(store.files.size, 2);
});
test('ordinary refresh is limited across launches to 12 hours, including failed attempts', async () => {
  const store = memoryStore();
  const cache = createStationCache(store);
  assert.equal(refreshDue(null, NOW), true);
  await cache.recordAttempt(NOW);
  const recorded = await createStationCache(store).lastAttempt();
  assert.equal(refreshDue(recorded, NOW + REFRESH_INTERVAL_MS - 1), false);
  assert.equal(refreshDue(recorded, NOW + REFRESH_INTERVAL_MS), true);
  assert.equal(refreshDue(NOW + 1000, NOW), true); // Clock moved backward.
});
