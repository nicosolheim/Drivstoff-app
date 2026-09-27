import { File, Paths } from 'expo-file-system';
import { createStationCache } from '../lib/station-cache';

export const stationCache = createStationCache({
  async read(key) {
    const file = new File(Paths.document, key);
    return file.exists ? file.text() : null;
  },
  async write(key, text) {
    const file = new File(Paths.document, key);
    file.write(text);
  },
});
