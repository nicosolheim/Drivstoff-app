import { Pressable, Text, View } from 'react-native';
import type { FuelType } from '../types/station';

export const FUEL_LABELS: Record<FuelType, string> = { petrol: 'Bensin', diesel: 'Diesel' };

export function FuelSelector({ value, onChange }: { value: FuelType; onChange: (fuel: FuelType) => void }) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Velg drivstoff" style={{ flexDirection: 'row', gap: 8 }}>
      {(['petrol', 'diesel'] as const).map((fuel) => (
        <Pressable key={fuel} accessibilityRole="radio" accessibilityState={{ checked: value === fuel }}
          onPress={() => onChange(fuel)}
          style={({ pressed }) => ({ flex: 1, minHeight: 48, padding: 14, alignItems: 'center', borderRadius: 14,
            backgroundColor: value === fuel ? '#245D45' : '#FFFFFF', opacity: pressed ? 0.7 : 1 })}>
          <Text style={{ fontSize: 17, fontWeight: '600', color: value === fuel ? '#FFFFFF' : '#245D45' }}>{FUEL_LABELS[fuel]}</Text>
        </Pressable>
      ))}
    </View>
  );
}
