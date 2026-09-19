import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatDistance, formatPrice, formatPriceAge, isPriceOld } from '../src/lib/format.ts';

const now = Date.parse('2026-09-18T18:00:00Z');
const ago = (ms: number) => new Date(now - ms).toISOString();

test('prices use Norwegian decimal comma, two digits and kr/l', () => {
  assert.equal(formatPrice(20), '20,00 kr/l');
  assert.equal(formatPrice(20.895), '20,90 kr/l');
  for (const price of [NaN, Infinity, -1, 0]) assert.equal(formatPrice(price), 'Pris ukjent');
});
test('distance formatting handles small distances and km rounding boundary', () => {
  for (const [km, expected] of [[0, '0 m'], [0.001, 'Under 10 m'], [0.01, '10 m'], [0.1234, '123 m'], [0.999, '999 m'], [0.9999, '1,0 km'], [1.25, '1,3 km']] as const) {
    assert.equal(formatDistance(km), expected);
  }
  for (const km of [-1, NaN, Infinity]) assert.equal(formatDistance(km), 'Avstand ukjent');
});
test('age handles minute, hour and day boundaries with correct singular/plural', () => {
  const cases = [
    [0, 'under ett minutt'], [59_999, 'under ett minutt'], [60_000, '1 minutt'],
    [120_000, '2 minutter'], [3_599_999, '59 minutter'], [3_600_000, '1 time'],
    [7_200_000, '2 timer'], [86_399_999, '23 timer'], [86_400_000, '1 døgn'],
    [172_800_000, '2 døgn'],
  ] as const;
  for (const [ms, label] of cases) assert.equal(formatPriceAge(ago(ms), now), `Oppdatert for ${label} siden`);
});
test('old means strictly more than 24 hours', () => {
  assert.equal(isPriceOld(ago(86_399_999), now), false);
  assert.equal(isPriceOld(ago(86_400_000), now), false);
  assert.equal(isPriceOld(ago(86_400_001), now), true);
});
test('invalid, missing-zone and future timestamps never masquerade as fresh data', () => {
  for (const stamp of ['', 'not-a-date', '2026-09-18T12:00:00', '2026-13-18T12:00:00Z', '2026-02-30T12:00:00Z', '2026-09-17T24:00:00Z', ago(-1)]) {
    assert.equal(formatPriceAge(stamp, now), 'Prisens alder er ukjent');
    assert.equal(isPriceOld(stamp, now), false);
  }
  assert.equal(formatPriceAge(ago(0), NaN), 'Prisens alder er ukjent');
});
test('explicit timezone offsets describe the same instant', () => {
  assert.equal(formatPriceAge('2026-09-18T19:00:00+02:00', now), 'Oppdatert for 1 time siden');
});
