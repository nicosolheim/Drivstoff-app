import { useEffect, useMemo, useState } from 'react';
import { Alert, AppState, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FuelSelector, FUEL_LABELS } from '../components/fuel-selector';
import { StationCard } from '../components/station-card';
import { StationMap } from '../components/station-map';
import { useUserLocation } from '../hooks/use-user-location';
import { DEMO_POSITION, STATIONS } from '../data/stations';
import { MAX_STATIONS, rankNearbyStations, SEARCH_RADIUS_KM } from '../lib/stations';
import type { FuelType } from '../types/station';

export default function HomeScreen() {
  const [fuel, setFuel] = useState<FuelType>('petrol');
  const [now, setNow] = useState(Date.now);
  const insets = useSafeAreaInsets();
  const location = useUserLocation();
  const { state } = location;
  const demo = state.status !== 'ready';
  const origin = state.status === 'ready' ? state.position : DEMO_POSITION;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(Date.now());
    });
    return () => { clearInterval(timer); subscription.remove(); };
  }, []);
  const stations = useMemo(() => rankNearbyStations(STATIONS, origin, fuel), [origin, fuel]);
  const selected = stations.find((item) => item.station.id === selectedId);
  const select = (id: string) => setSelectedId(id);
  const useDemo = () => { setSelectedId(null); location.useDemo(); };
  const refresh = () => { setSelectedId(null); void location.refresh(); };
  const messages: Partial<Record<typeof state.status, string>> = {
    demo: 'Bruk posisjonen din for å finne stasjoner. Tillatelse gjelder bare mens appen brukes.',
    loading: 'Henter posisjon … Oslo-demo vises mens du venter.',
    denied: 'Lokasjon er avslått. Du kan fortsatt bruke Oslo-demoen.',
    disabled: 'Stedstjenester er slått av. Slå dem på i telefonens innstillinger, eller bruk Oslo-demo.',
    timeout: 'Det tok for lang tid å finne posisjonen. Prøv igjen, gjerne utendørs. Oslo-demo vises.',
    error: 'Kunne ikke hente en fersk posisjon. Prøv igjen eller bruk Oslo-demo.',
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: '#F3F6F2' }}
      contentContainerStyle={{ padding: 16, paddingBottom: Math.max(24, insets.bottom), gap: 12, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
      <View style={{ gap: 6, backgroundColor: '#E4EDE4', padding: 12, borderRadius: 16 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#245D45' }}>FIKTIVE STASJONER OG PRISER · TESTDATA</Text>
        <Text style={{ fontSize: 15, fontWeight: '600', color: '#183B2C' }}>
          {demo ? 'Oslo-demo · avstand fra Oslo S, ikke din posisjon' : 'Avstand fra din hentede posisjon'}
        </Text>
        {state.status !== 'ready' && <Text style={{ fontSize: 14, lineHeight: 20, color: '#48594E' }}>{messages[state.status]}</Text>}
        {state.status === 'ready' && <Text style={{ fontSize: 12, color: '#48594E' }}>
          Hentet kl. {new Date(state.timestamp).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
          {state.accuracy === null ? ' · nøyaktighet ukjent' : ` · nøyaktighet ca. ${Math.round(state.accuracy)} m`}
        </Text>}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Pressable accessibilityRole="button" disabled={state.status === 'loading'} accessibilityState={{ disabled: state.status === 'loading' }}
            onPress={refresh} style={{ padding: 12, minHeight: 44, borderRadius: 10, backgroundColor: '#245D45', opacity: state.status === 'loading' ? 0.5 : 1 }}>
            <Text style={{ color: 'white', fontWeight: '600' }}>{state.status === 'ready' ? 'Oppdater posisjon' : 'Bruk min posisjon'}</Text>
          </Pressable>
          {state.status !== 'demo' && <Pressable accessibilityRole="button" onPress={useDemo} style={{ padding: 12, minHeight: 44 }}>
            <Text style={{ color: '#245D45', fontWeight: '600' }}>Bruk Oslo-demo</Text>
          </Pressable>}
          {state.status === 'denied' && !state.canAskAgain && <Pressable accessibilityRole="button"
            onPress={() => { void Linking.openSettings().catch(() => Alert.alert('Kunne ikke åpne innstillinger', 'Åpne telefonens innstillinger og finn lokasjonstilgang for Expo Go.')); }}
            style={{ padding: 12, minHeight: 44 }}><Text style={{ color: '#245D45', fontWeight: '600' }}>Åpne innstillinger</Text></Pressable>}
        </View>
      </View>
      <StationMap origin={origin} demo={demo} items={stations} fuel={fuel} selectedId={selected?.station.id ?? null} onSelect={select} />
      {selected && <Text accessibilityLiveRegion="polite" style={{ color: '#9A2034', fontWeight: '600' }}>Valgt: {selected.station.name}</Text>}
      <FuelSelector value={fuel} onChange={setFuel} />
      <View style={{ gap: 8 }}>
        <Text accessibilityRole="header" style={{ fontSize: 19, fontWeight: '700', color: '#183B2C' }}>{FUEL_LABELS[fuel]} · laveste pris først</Text>
        <Text selectable style={{ fontSize: 15, lineHeight: 23, color: '#48594E' }}>
          {stations.length} stasjoner · maks {MAX_STATIONS} innen {SEARCH_RADIUS_KM} km luftlinje.
        </Text>
      </View>
      {stations.length === 0 ? (
        <View style={{ padding: 16, gap: 8, backgroundColor: 'white', borderRadius: 16 }}>
          <Text selectable style={{ fontSize: 17, color: '#48594E' }}>Ingen eksempelstasjoner innen {SEARCH_RADIUS_KM} km. Testdataene dekker Oslo-området.</Text>
          <Pressable accessibilityRole="button" onPress={useDemo} style={{ padding: 12, minHeight: 44 }}><Text style={{ color: '#245D45', fontWeight: '700' }}>Utforsk Oslo-demo</Text></Pressable>
        </View>
      ) : stations.map((item) => <StationCard key={item.station.id} item={item} fuel={fuel} now={now}
        demo={demo} selected={selected?.station.id === item.station.id} onSelect={() => select(item.station.id)} />)}
      <Text selectable style={{ fontSize: 14, lineHeight: 22, color: '#48594E' }}>
        Listen sammenligner literpris. Luftlinje er ikke kjøreavstand, og kostnaden ved å kjøre til stasjonen er ikke beregnet. Gamle priser kan være utdaterte.
      </Text>
    </ScrollView>
  );
}
