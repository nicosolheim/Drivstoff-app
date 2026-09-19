const priceFormatter = new Intl.NumberFormat('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const distanceFormatter = new Intl.NumberFormat('nb-NO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const DAY_MS = 24 * 60 * 60 * 1000;

export function formatPrice(price: number): string {
  return Number.isFinite(price) && price > 0 ? `${priceFormatter.format(price)} kr/l` : 'Pris ukjent';
}

export function formatDistance(km: number): string {
  if (!Number.isFinite(km) || km < 0) return 'Avstand ukjent';
  if (km === 0) return '0 m';
  if (km < 0.01) return 'Under 10 m';
  const meters = Math.round(km * 1000);
  return meters < 1000 ? `${meters} m` : `${distanceFormatter.format(km)} km`;
}

function priceAgeMs(updatedAt: string, now: number): number | null {
  // Explicit timezone prevents device-dependent interpretation.
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(updatedAt)) return null;
  const timestamp = Date.parse(updatedAt);
  if (!Number.isFinite(timestamp) || !Number.isFinite(now) || timestamp > now) return null;
  const datePart = updatedAt.slice(0, 10);
  // Date.parse otherwise silently normalizes dates such as February 30.
  const calendarDate = new Date(`${datePart}T00:00:00Z`);
  if (!Number.isFinite(calendarDate.getTime()) || calendarDate.toISOString().slice(0, 10) !== datePart
    || Number(updatedAt.slice(11, 13)) > 23) return null;
  return now - timestamp;
}

export function isPriceOld(updatedAt: string, now: number): boolean {
  const age = priceAgeMs(updatedAt, now);
  return age !== null && age > DAY_MS;
}

export function formatPriceAge(updatedAt: string, now: number): string {
  const age = priceAgeMs(updatedAt, now);
  if (age === null) return 'Prisens alder er ukjent';
  const minutes = Math.floor(age / 60_000);
  if (minutes < 1) return 'Oppdatert for under ett minutt siden';
  if (minutes < 60) return `Oppdatert for ${minutes} ${minutes === 1 ? 'minutt' : 'minutter'} siden`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Oppdatert for ${hours} ${hours === 1 ? 'time' : 'timer'} siden`;
  return `Oppdatert for ${Math.floor(hours / 24)} døgn siden`;
}
