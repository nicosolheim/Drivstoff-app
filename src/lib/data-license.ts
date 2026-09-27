import type { CachedData } from './station-cache.ts';
import { SOURCE_URLS } from './import-stations.ts';

export const DATA_LICENSE = 'https://opendatacommons.org/licenses/odbl/1-0/';
export function exportDatabase(cached: CachedData): string {
  return JSON.stringify({
    license: { name: 'Open Database License (ODbL) 1.0', url: DATA_LICENSE,
      attribution: 'Drivstoffpriser Norge; © OpenStreetMap contributors',
      sources: SOURCE_URLS, osmCopyright: 'https://www.openstreetmap.org/copyright',
      changes: 'Kildeprefiks på ID, priser i øre/l, separate drivstoffpriser, normalisert tid kun med eksplisitt tidssone. Ingen posisjon fra brukeren. Manglende navn får visningsetikett. Hele importerte databasen er inkludert, ikke bare kartutvalget.' },
    database: cached.data, originalExport: cached.snapshot,
  }, null, 2);
}
