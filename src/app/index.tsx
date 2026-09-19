import { useEffect, useMemo, useState } from 'react';
import { Alert, AppState, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { FuelSelector, FUEL_LABELS } from '../components/fuel-selector';
import { StationCard } from '../components/station-card';
import { StationMap } from '../components/station-map';
import { useUserLocation } from '../hooks/use-user-location';
import { useStationData } from '../hooks/use-station-data';
import { DEMO_POSITION, STATIONS } from '../data/stations';
import { MAX_STATIONS, stationSelection, SEARCH_RADIUS_KM } from '../lib/stations';
import type { DataMode, FuelType } from '../types/station';

export default function HomeScreen() {
  const [fuel, setFuel] = useState<FuelType>('petrol95');
  const [mode, setMode] = useState<DataMode>('live');
  const data = useStationData();
  const [now, setNow] = useState(Date.now);
  const insets = useSafeAreaInsets();
  const location = useUserLocation();
  const { state } = location;
  const demo = mode === 'demo';
  const actualPosition = !demo && state.status === 'ready';
  const origin = actualPosition ? state.position : DEMO_POSITION;
  const originLabel = actualPosition ? 'din hentede posisjon' : demo ? 'Oslo S (demo)' : 'Oslo S (fast kartutsnitt, ikke GPS)';
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(Date.now());
    });
    return () => { clearInterval(timer); subscription.remove(); };
  }, []);
  const { items: stations, currentCount } = useMemo(() => stationSelection(mode, data.cached?.data.stations ?? [], STATIONS, origin, fuel, now),
    [mode, data.cached, origin, fuel, now]);
  const selected = stations.find((item) => item.station.id === selectedId);
  const select = (id: string) => setSelectedId(id);
  const useDemo = () => { setMode('demo'); setSelectedId(null); location.useDemo(); };
  const refresh = () => { setMode('live'); setSelectedId(null); void location.refresh(); };
  const messages: Partial<Record<typeof state.status, string>> = {
    demo: 'Bruk posisjonen din for å finne stasjoner. Tillatelse gjelder bare mens appen brukes.',
    loading: 'Henter posisjon … Et fast utsnitt rundt Oslo S vises mens du venter.',
    denied: 'Lokasjon er avslått. Fast kartutsnitt rundt Oslo S vises. Du kan også velge fiktiv demo.',
    disabled: 'Stedstjenester er slått av. Slå dem på i telefonens innstillinger, eller bruk Oslo-demo.',
    timeout: 'Det tok for lang tid å finne posisjonen. Prøv igjen, gjerne utendørs. Fast utsnitt rundt Oslo S vises.',
    error: 'Kunne ikke hente en fersk posisjon. Prøv igjen eller bruk Oslo-demo.',
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: '#F3F6F2' }}
      contentContainerStyle={{ padding: 16, paddingBottom: Math.max(24, insets.bottom), gap: 12, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
      <View style={{ gap: 6, backgroundColor: '#E4EDE4', padding: 12, borderRadius: 16 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#245D45' }}>{demo ? 'OSLO-DEMO · FIKTIVE STASJONER OG PRISER' : 'EKTE STASJONSDATA · DRIVSTOFFPRISER NORGE'}</Text>
        <Text style={{ fontSize: 15, fontWeight: '600', color: '#183B2C' }}>
          Avstand fra {originLabel}
        </Text>
        {!demo && state.status !== 'ready' && <Text style={{ fontSize: 14, lineHeight: 20, color: '#48594E' }}>{messages[state.status]}</Text>}
        {actualPosition && <Text style={{ fontSize: 12, color: '#48594E' }}>
          Hentet kl. {new Date(state.timestamp).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
          {state.accuracy === null ? ' · nøyaktighet ukjent' : ` · nøyaktighet ca. ${Math.round(state.accuracy)} m`}
        </Text>}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Pressable accessibilityRole="button" disabled={state.status === 'loading'} accessibilityState={{ disabled: state.status === 'loading' }}
            onPress={refresh} style={{ padding: 12, minHeight: 44, borderRadius: 10, backgroundColor: '#245D45', opacity: state.status === 'loading' ? 0.5 : 1 }}>
            <Text style={{ color: 'white', fontWeight: '600' }}>{state.status === 'ready' ? 'Oppdater posisjon' : 'Bruk min posisjon'}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={demo ? () => { setMode('live'); setSelectedId(null); } : useDemo} style={{ padding: 12, minHeight: 44 }}>
            <Text style={{ color: '#245D45', fontWeight: '600' }}>{demo ? 'Vis ekte stasjoner' : 'Bruk fiktiv Oslo-demo'}</Text>
          </Pressable>
          {state.status === 'denied' && !state.canAskAgain && <Pressable accessibilityRole="button"
            onPress={() => { void Linking.openSettings().catch(() => Alert.alert('Kunne ikke åpne innstillinger', 'Åpne telefonens innstillinger og finn lokasjonstilgang for Expo Go.')); }}
            style={{ padding: 12, minHeight: 44 }}><Text style={{ color: '#245D45', fontWeight: '600' }}>Åpne innstillinger</Text></Pressable>}
        </View>
      </View>
      {!demo && <View style={{ gap: 4 }}>
        {data.loading && <Text accessibilityLiveRegion="polite">Henter stasjonsdata …</Text>}
        {data.cached && <Text style={{ fontSize: 12, color: '#48594E' }}>Sist hentet: {new Date(data.cached.data.fetchedAt).toLocaleString('nb-NO')}. Dette sier ikke hvor ferske prisene er.</Text>}
        {data.error && <Text accessibilityLiveRegion="polite" style={{ color: '#79430A' }}>{data.error}</Text>}
        {data.error && !data.loading && <Pressable accessibilityRole="button" onPress={data.retry} style={{ padding: 12, minHeight: 44 }}><Text style={{ color: '#245D45' }}>Prøv datainnhenting igjen</Text></Pressable>}
      </View>}
      <StationMap origin={origin} demo={demo} actualPosition={actualPosition} now={now} items={stations} fuel={fuel} selectedId={selected?.station.id ?? null} onSelect={select} />
      {!demo && <Link href="/sources" style={{ fontSize: 12, color: '#245D45', paddingVertical: 8 }}>Data: Drivstoffpriser Norge · © OpenStreetMap-bidragsytere · ODbL</Link>}
      {selected && <Text accessibilityLiveRegion="polite" style={{ color: '#9A2034', fontWeight: '600' }}>Valgt: {selected.station.name}</Text>}
      <FuelSelector value={fuel} onChange={setFuel} />
      <View style={{ gap: 8 }}>
        <Text accessibilityRole="header" style={{ fontSize: 19, fontWeight: '700', color: '#183B2C' }}>{FUEL_LABELS[fuel]} · {currentCount ? 'Billigst nå' : 'stasjoner nær deg'}</Text>
        <Text selectable style={{ fontSize: 15, lineHeight: 23, color: '#48594E' }}>
          {stations.length} stasjoner · maks {MAX_STATIONS} innen {SEARCH_RADIUS_KM} km luftlinje.
        </Text>
        <Text style={{ color: '#48594E', lineHeight: 21 }}>{currentCount
          ? `${currentCount} priser registrert siste 24 timer rangeres på literpris. Andre stasjoner følger etter nærhet. Prisene er ikke garantert ved pumpen.`
          : 'Aktuelle prisdata er ikke tilgjengelige for dette utvalget. Stasjonene vises etter avstand. Gamle og usikre priser brukes ikke til å kåre billigst nå.'}</Text>
      </View>
      {stations.length === 0 ? (
        <View style={{ padding: 16, gap: 8, backgroundColor: 'white', borderRadius: 16 }}>
          <Text selectable style={{ fontSize: 17, color: '#48594E' }}>{demo ? 'Ingen teststasjoner i utvalget.' : !data.cached ? 'Ingen ekte stasjonsdata lastet inn ennå.' : `Ingen registrerte stasjoner innen ${SEARCH_RADIUS_KM} km.`}</Text>
          <Pressable accessibilityRole="button" onPress={useDemo} style={{ padding: 12, minHeight: 44 }}><Text style={{ color: '#245D45', fontWeight: '700' }}>Utforsk Oslo-demo</Text></Pressable>
        </View>
      ) : stations.map((item) => <StationCard key={item.station.id} item={item} fuel={fuel} now={now}
        originLabel={originLabel} selected={selected?.station.id === item.station.id} onSelect={() => select(item.station.id)} />)}
      <Text selectable style={{ fontSize: 14, lineHeight: 22, color: '#48594E' }}>
        Listen sammenligner literpris. Luftlinje er ikke kjøreavstand, og kostnaden ved å kjøre til stasjonen er ikke beregnet. Gamle priser kan være utdaterte.
      </Text>
      <Link href="/sources" style={{ color: '#245D45', paddingVertical: 12 }}>Datakilder og lisenser</Link>
    </ScrollView>
  );
}
