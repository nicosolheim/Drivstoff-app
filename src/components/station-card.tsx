import { Pressable, Text } from 'react-native';
import { formatDistance } from '../lib/format';
import { pricePresentation } from '../lib/prices';
import type { FuelType, NearbyStation } from '../types/station';

export function StationCard({ item, fuel, now, originLabel, selected, onSelect }: {
  item: NearbyStation; fuel: FuelType; now: number; originLabel: string; selected: boolean; onSelect: () => void;
}) {
  const { station, distanceKm } = item;
  const price = pricePresentation(station.prices[fuel], now);
  return (
    <Pressable onPress={onSelect} accessibilityRole="button" accessibilityState={{ selected }}
      accessibilityLabel={`${station.name}, ${price.value}, ${price.label}, ${formatDistance(distanceKm)}, ${price.age}`}
      accessibilityHint="Velger stasjonen i kartet og listen"
      style={({ pressed }) => ({ backgroundColor: selected ? '#FFF3F3' : '#FFFFFF', padding: 16, borderRadius: 16,
        borderWidth: 2, borderColor: selected ? '#BC263D' : 'transparent', gap: 6, opacity: pressed ? 0.8 : 1 })}>
      {selected && <Text style={{ color: '#9A2034', fontWeight: '700' }}>Valgt stasjon</Text>}
      <Text selectable accessibilityRole="header" style={{ fontSize: 20, fontWeight: '600', color: '#183B2C' }}>{station.name}</Text>
      {(station.address || station.city) && <Text style={{ color: '#48594E' }}>{[station.address, station.city].filter(Boolean).join(', ')}</Text>}
      <Text selectable style={{ fontSize: 14, fontWeight: '600', color: price.status === 'current' ? '#245D45' : '#79430A' }}>{price.label}</Text>
      <Text selectable style={{ fontSize: price.status === 'current' ? 29 : 22, fontWeight: '700', fontVariant: ['tabular-nums'], color: '#183B2C' }}>{price.value}</Text>
      <Text selectable style={{ fontSize: 15, color: '#48594E' }}>{formatDistance(distanceKm)} luftlinje fra {originLabel}</Text>
      {price.status !== 'missing' && <Text selectable style={{ fontSize: 14, lineHeight: 21, color: '#48594E' }}>{price.age}</Text>}
      <Text style={{ fontSize: 12, color: '#48594E' }}>{station.sourceId === 'demo' ? 'Fiktive testdata' : 'Kilde: Drivstoffpriser Norge'}</Text>
    </Pressable>
  );
}
