import { importSnapshot, SOURCE_URLS } from './import-stations.ts';
import type { CachedData } from './station-cache.ts';

export type FetchData = (url: string, init: { signal: AbortSignal }) => Promise<{
  ok: boolean; status: number; headers: { get(name: string): string | null }; text(): Promise<string>;
}>;
const MAX_FILE_BYTES = 10_000_000;
export async function downloadStations(fetchData: FetchData, now: () => number = Date.now,
  signal?: AbortSignal, timeoutMs = 20_000): Promise<CachedData> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) controller.abort();
  const timeout = setTimeout(abort, timeoutMs);
  async function read(url: string): Promise<unknown> {
    const response = await fetchData(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Nedlasting feilet (${response.status})`);
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) throw new Error('Datakilden returnerte ikke JSON');
    const size = Number(response.headers.get('content-length'));
    if (size > MAX_FILE_BYTES) throw new Error('Datafilen er for stor');
    const text = await response.text();
    if (text.length > MAX_FILE_BYTES) throw new Error('Datafilen er for stor');
    return JSON.parse(text) as unknown;
  }
  try {
    const [stationsFile, pricesFile] = await Promise.all([read(SOURCE_URLS.stations), read(SOURCE_URLS.prices)]);
    if (controller.signal.aborted) throw new Error('Nedlasting avbrutt');
    const fetched = now();
    const snapshot = { schemaVersion: 1 as const, fetchedAt: new Date(fetched).toISOString(), stationsFile, pricesFile };
    return { snapshot, data: importSnapshot(snapshot, fetched) };
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
    controller.abort();
  }
}
