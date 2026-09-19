import { Pressable, Text } from 'react-native';
import { formatDistance, formatPrice, formatPriceAge, isPriceOld } from '../lib/format';
import type { FuelType, NearbyStation } from '../types/station';

export function StationCard({ item, fuel, now, demo, selected, onSelect }: {
  item: NearbyStation; fuel: FuelType; now: number; demo: boolean; selected: boolean; onSelect: () => void;
}) {
  const { station, distanceKm } = item;
  return (
    <Pressable onPress={onSelect} accessibilityRole="button" accessibilityState={{ selected }}
      accessibilityLabel={`${station.name}, ${formatPrice(station.prices[fuel])}, ${formatDistance(distanceKm)}, ${formatPriceAge(station.updatedAt, now)}${isPriceOld(station.updatedAt, now) ? ', gammel pris' : ''}`}
      accessibilityHint="Velger stasjonen i kartet og listen"
      style={({ pressed }) => ({ backgroundColor: selected ? '#FFF3F3' : '#FFFFFF', padding: 16, borderRadius: 16,
        borderWidth: 2, borderColor: selected ? '#BC263D' : 'transparent', gap: 6, opacity: pressed ? 0.8 : 1 })}>
      {selected && <Text style={{ color: '#9A2034', fontWeight: '700' }}>Valgt stasjon</Text>}
      <Text selectable accessibilityRole="header" style={{ fontSize: 20, fontWeight: '600', color: '#183B2C' }}>{station.name}</Text>
      <Text selectable style={{ fontSize: 29, fontWeight: '700', fontVariant: ['tabular-nums'], color: '#183B2C' }}>{formatPrice(station.prices[fuel])}</Text>
      <Text selectable style={{ fontSize: 15, color: '#48594E' }}>{formatDistance(distanceKm)} luftlinje fra {demo ? 'Oslo S (demo)' : 'din hentede posisjon'}</Text>
      <Text selectable style={{ fontSize: 14, lineHeight: 21, color: '#48594E' }}>{formatPriceAge(station.updatedAt, now)}</Text>
      {isPriceOld(station.updatedAt, now) && (
        <Text selectable style={{ fontSize: 14, fontWeight: '600', color: '#79430A', backgroundColor: '#FFF1D6', padding: 10, borderRadius: 8 }}>
          Gammel pris · eldre enn 24 timer
        </Text>
      )}
    </Pressable>
  );
}
