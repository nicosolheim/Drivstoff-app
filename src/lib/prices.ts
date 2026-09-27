import type { PriceQuote } from '../types/station.ts';
import { formatPrice, formatPriceAge, priceAgeMs } from './format.ts';

export type PriceStatus = 'current' | 'historical' | 'uncertain' | 'missing';
export function priceStatus(quote: PriceQuote | undefined, now: number): PriceStatus {
  if (!quote || !Number.isSafeInteger(quote.amountOrePerLiter) || quote.amountOrePerLiter <= 0) return 'missing';
  const time = quote.observedAt ?? quote.reportedAt;
  const age = time === null ? null : priceAgeMs(time, now);
  if (age === null) return 'uncertain';
  return age > 86_400_000 ? 'historical' : 'current';
}

// Shared by cards and marker callouts so old prices cannot look current on the map.
export function pricePresentation(quote: PriceQuote | undefined, now: number) {
  const status = priceStatus(quote, now);
  const value = status === 'missing' || !quote ? 'Pris ikke tilgjengelig' : formatPrice(quote.amountOrePerLiter / 100);
  const label = { current: 'Registrert siste 24 timer', historical: 'Historisk pris · eldre enn 24 timer',
    uncertain: 'Ubekreftet pris · ikke aktuell', missing: 'Ingen registrert pris' }[status];
  const time = quote?.observedAt ?? quote?.reportedAt;
  const age = time ? formatPriceAge(time, now).replace('Oppdatert', quote?.observedAt ? 'Observert' : 'Registrert')
    : quote?.sourceUpdatedAtRaw && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(quote.sourceUpdatedAtRaw)
      ? `Kilden oppgir ${quote.sourceUpdatedAtRaw.slice(0, 16).replace('T', ' kl. ')}. Tidspunktet er ikke bekreftet; prisalder er ukjent.`
      : 'Prisens alder er ukjent';
  return { status, value, label, age };
}
