import { importSnapshot } from './import-stations.ts';
import type { LiveData, SourceSnapshot } from './import-stations.ts';

export interface TextStore {
  read(key: string): Promise<string | null>;
  write(key: string, text: string): Promise<void>;
}
export type CachedData = { snapshot: SourceSnapshot; data: LiveData };
const SLOTS = ['stations-v1-a.json', 'stations-v1-b.json'] as const;
export const REFRESH_INTERVAL_MS = 12 * 60 * 60 * 1000;
export function refreshDue(lastAttempt: number | null, now: number): boolean {
  return lastAttempt === null || lastAttempt > now || now - lastAttempt >= REFRESH_INTERVAL_MS;
}
export function decodeCache(text: string, now: number): CachedData {
  const value: unknown = JSON.parse(text);
  const data = importSnapshot(value, now);
  return { snapshot: value as SourceSnapshot, data }; // importSnapshot validates all consumed fields.
}
export function createStationCache(store: TextStore) {
  async function slots(now: number) {
    return Promise.all(SLOTS.map(async (key) => {
      try {
        const text = await store.read(key);
        return { key, cached: text === null ? null : decodeCache(text, now) };
      } catch { return { key, cached: null }; }
    }));
  }
  return {
    async load(now: number): Promise<CachedData | null> {
      const values = await slots(now);
      return values.map(({ cached }) => cached).filter((value) => value !== null)
        .sort((a, b) => Date.parse(b.data.fetchedAt) - Date.parse(a.data.fetchedAt))[0] ?? null;
    },
    async save(snapshot: SourceSnapshot, now: number): Promise<void> {
      importSnapshot(snapshot, now);
      const values = await slots(now);
      // Always write the empty/older slot. An interrupted write leaves the latest good slot intact.
      values.sort((a, b) => (a.cached ? Date.parse(a.cached.data.fetchedAt) : -Infinity)
        - (b.cached ? Date.parse(b.cached.data.fetchedAt) : -Infinity));
      const key = values[0]!.key;
      const text = JSON.stringify(snapshot);
      await store.write(key, text);
      if (await store.read(key) !== text) throw new Error('Kunne ikke bekrefte lokal lagring');
    },
    async lastAttempt(): Promise<number | null> {
      try {
        const text = await store.read('stations-last-attempt.txt');
        const value = text === null ? NaN : Number(text);
        return Number.isFinite(value) && value > 0 ? value : null;
      } catch { return null; }
    },
    async recordAttempt(now: number) { await store.write('stations-last-attempt.txt', String(now)); },
  };
}
