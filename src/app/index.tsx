import { useEffect, useState } from 'react';
import { AppState, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FuelSelector, FUEL_LABELS } from '../components/fuel-selector';
import { StationCard } from '../components/station-card';
import { DEMO_POSITION, STATIONS } from '../data/stations';
import { MAX_STATIONS, rankNearbyStations, SEARCH_RADIUS_KM } from '../lib/stations';
import type { FuelType } from '../types/station';

export default function HomeScreen() {
  const [fuel, setFuel] = useState<FuelType>('petrol');
  const [now, setNow] = useState(Date.now);
  const insets = useSafeAreaInsets();
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(Date.now());
    });
    return () => { clearInterval(timer); subscription.remove(); };
  }, []);
  const stations = rankNearbyStations(STATIONS, DEMO_POSITION, fuel);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: '#F3F6F2' }}
      contentContainerStyle={{ padding: 20, paddingBottom: Math.max(24, insets.bottom), gap: 20, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
      <View style={{ gap: 8, backgroundColor: '#E4EDE4', padding: 18, borderRadius: 16 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', letterSpacing: 1, color: '#245D45' }}>OSLO-DEMO · FIKTIVE TESTDATA</Text>
        <Text selectable style={{ fontSize: 15, lineHeight: 23, color: '#183B2C' }}>
          Alle stasjoner og priser er fiktive. Avstand regnes fra Oslo S, en fast demo-posisjon. Vi bruker ikke posisjonen din.
        </Text>
      </View>
      <FuelSelector value={fuel} onChange={setFuel} />
      <View style={{ gap: 8 }}>
        <Text accessibilityRole="header" style={{ fontSize: 24, fontWeight: '700', color: '#183B2C' }}>{FUEL_LABELS[fuel]} · laveste pris først</Text>
        <Text selectable style={{ fontSize: 15, lineHeight: 23, color: '#48594E' }}>
          {stations.length} stasjoner · inntil {MAX_STATIONS} nærmeste innen {SEARCH_RADIUS_KM} km luftlinje. Ved lik pris vises nærmeste først.
        </Text>
      </View>
      {stations.length === 0 ? (
        <Text selectable style={{ fontSize: 17, color: '#48594E' }}>Ingen eksempelstasjoner innenfor radiusen.</Text>
      ) : stations.map((item) => <StationCard key={item.station.id} item={item} fuel={fuel} now={now} />)}
      <Text selectable style={{ fontSize: 14, lineHeight: 22, color: '#48594E' }}>
        Listen sammenligner literpris. Luftlinje er ikke kjøreavstand, og kostnaden ved å kjøre til stasjonen er ikke beregnet. Gamle priser kan være utdaterte.
      </Text>
    </ScrollView>
  );
}
