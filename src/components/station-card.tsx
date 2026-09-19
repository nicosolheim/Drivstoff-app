import { Text, View } from 'react-native';
import { formatDistance, formatPrice, formatPriceAge, isPriceOld } from '../lib/format';
import type { FuelType, NearbyStation } from '../types/station';

export function StationCard({ item, fuel, now }: { item: NearbyStation; fuel: FuelType; now: number }) {
  const { station, distanceKm } = item;
  return (
    <View style={{ backgroundColor: '#FFFFFF', padding: 20, borderRadius: 20, borderCurve: 'continuous', gap: 10 }}>
      <Text selectable accessibilityRole="header" style={{ fontSize: 20, fontWeight: '600', color: '#183B2C' }}>{station.name}</Text>
      <Text selectable style={{ fontSize: 29, fontWeight: '700', fontVariant: ['tabular-nums'], color: '#183B2C' }}>{formatPrice(station.prices[fuel])}</Text>
      <Text selectable style={{ fontSize: 15, color: '#48594E' }}>{formatDistance(distanceKm)} luftlinje fra Oslo S</Text>
      <Text selectable style={{ fontSize: 14, lineHeight: 21, color: '#48594E' }}>{formatPriceAge(station.updatedAt, now)}</Text>
      {isPriceOld(station.updatedAt, now) && (
        <Text selectable style={{ fontSize: 14, fontWeight: '600', color: '#79430A', backgroundColor: '#FFF1D6', padding: 10, borderRadius: 8 }}>
          Gammel pris · eldre enn 24 timer
        </Text>
      )}
    </View>
  );
}
