import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { formatPrice } from '../lib/format';
import type { Coordinates, FuelType, NearbyStation } from '../types/station';

export function StationMap({ origin, demo, items, fuel, selectedId, onSelect }: {
  origin: Coordinates; demo: boolean; items: readonly NearbyStation[]; fuel: FuelType;
  selectedId: string | null; onSelect: (id: string) => void;
}) {
  const map = useRef<MapView>(null);
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 12_000);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!ready) return;
    if (items.length === 0) {
      map.current?.animateToRegion({ ...origin, latitudeDelta: 0.05, longitudeDelta: 0.05 }, 0);
    } else {
      map.current?.fitToCoordinates([origin, ...items.map((item) => item.station.coordinates)], {
        edgePadding: { top: 35, right: 35, bottom: 35, left: 35 }, animated: false,
      });
    }
  }, [origin, items, ready]);

  return (
    <View style={{ gap: 6 }}>
      <View style={{ height: 210, borderRadius: 16, overflow: 'hidden', backgroundColor: '#DCE5DC' }}>
        <MapView ref={map} style={{ flex: 1 }}
          initialRegion={{ ...origin, latitudeDelta: 0.08, longitudeDelta: 0.08 }}
          onMapReady={() => setReady(true)} onMapLoaded={() => setLoaded(true)}
          showsUserLocation={false} showsMyLocationButton={false} showsCompass={false}
          rotateEnabled={false} pitchEnabled={false} toolbarEnabled={false}>
          <Marker coordinate={origin} title={demo ? 'Oslo S – demo-posisjon' : 'Din hentede posisjon'}
            description={demo ? 'Dette er ikke telefonens posisjon' : 'Oppdater med «Oppdater posisjon»'} pinColor={demo ? '#79430A' : '#2465C7'} />
          {items.map(({ station }) => (
            <Marker key={station.id} identifier={station.id} coordinate={station.coordinates}
              title={`${selectedId === station.id ? 'Valgt: ' : ''}${station.name}`}
              description={`${formatPrice(station.prices[fuel])} · Fiktiv pris`}
              pinColor={selectedId === station.id ? '#BC263D' : '#245D45'}
              onPress={() => onSelect(station.id)} />
          ))}
        </MapView>
      </View>
      <Text style={{ fontSize: 12, color: '#48594E' }}>
        {demo ? 'Brun: Oslo-demo' : 'Blå: din hentede posisjon'} · Grønn: teststasjon · Rød: valgt
      </Text>
      {slow && !loaded && <Text style={{ fontSize: 13, color: '#79430A' }}>Kartet laster langsomt. Kontroller nettverket; stasjonslisten kan fortsatt brukes.</Text>}
    </View>
  );
}
