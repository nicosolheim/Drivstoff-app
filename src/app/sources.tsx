import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Text } from 'react-native';
import { Stack } from 'expo-router';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useStationData } from '../hooks/use-station-data';
import { DATA_LICENSE, exportDatabase } from '../lib/data-license';
import { SOURCE_URLS } from '../lib/import-stations';

export default function SourcesScreen() {
  const { cached } = useStationData();
  const [sharing, setSharing] = useState(false);
  const open = (url: string) => { void Linking.openURL(url).catch(() => Alert.alert('Kunne ikke åpne lenken', 'Prøv igjen når du har nett.')); };
  const share = async () => {
    if (!cached || sharing) return;
    setSharing(true);
    try {
      if (!await Sharing.isAvailableAsync()) throw new Error('Fildeling er ikke tilgjengelig');
      const file = new File(Paths.cache, 'drivstoff-datagrunnlag-odbl.json');
      file.write(exportDatabase(cached));
      await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json', dialogTitle: 'Lagre datagrunnlag (ODbL)' });
    } catch { Alert.alert('Kunne ikke eksportere', 'Prøv igjen. Kontroller at telefonen har ledig lagringsplass og støtter fildeling.'); }
    finally { setSharing(false); }
  };
  return <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: '#F3F6F2' }} contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
    <Stack.Screen options={{ title: 'Datakilder og lisenser' }} />
    <Text selectable style={{ fontSize: 19, fontWeight: '700', color: '#183B2C' }}>Drivstoffpriser Norge · © OpenStreetMap-bidragsytere</Text>
    <Text selectable>Stasjoner og priser hentes fra Drivstoffpriser Norges offentlige eksport. Databasen brukes og tilbys under Open Database License (ODbL) 1.0. Kildekoden deres er ikke brukt i appen.</Text>
    <Text selectable>Prisdekningen er begrenset. Kilden inneholder gamle priser og tidsstempler uten tidssone. Slike priser deltar aldri i «Billigst nå». Rapportantall er ikke en garanti for riktig pris. Enkelte stasjonspunkter kan være bilvask eller ladesteder.</Text>
    <Text selectable>Registreringstid gjelder den enkelte pris. Eksporttid gjelder filene hos kilden. Hentetid gjelder telefonens nedlasting. Ingen av disse beviser tidspunktet prisen ble observert ved pumpen.</Text>
    {cached && <Text selectable>Sist hentet: {new Date(cached.data.fetchedAt).toLocaleString('nb-NO')}{'\n'}Kildens eksporttid: {new Date(cached.data.sourceExportedAt).toLocaleString('nb-NO')}{'\n'}{cached.data.stations.length} stasjoner i det lagrede datasettet.</Text>}
    <Text selectable>Data lagres på telefonen og oppfriskes normalt høyst hver 12. time mens appen er i bruk. Nedlasting sender ikke GPS-posisjonen til datakilden. Kartleverandøren laster kartutsnitt. Oslo-demoen inneholder bare fiktive, lokale testdata.</Text>
    {([
      ['Drivstoffpriser Norge – kildeprosjekt', 'https://github.com/Drivstoffpriser/Drivstoffpriser-App'],
      ['Databaselisens: ODbL 1.0', DATA_LICENSE],
      ['OpenStreetMap – opphavsrett og vilkår', 'https://www.openstreetmap.org/copyright'],
      ['Originalfil: stasjoner', SOURCE_URLS.stations], ['Originalfil: priser', SOURCE_URLS.prices],
    ] as const).map(([label, url]) => <Pressable key={url} accessibilityRole="link" onPress={() => open(url)} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: '#245D45', textDecorationLine: 'underline' }}>{label}</Text></Pressable>)}
    <Text selectable>Du kan hente en maskinlesbar kopi av hele det bearbeidede datagrunnlaget under ODbL, inkludert originaleksport, kildehenvisninger og beskrivelse av endringene. Din posisjon er ikke med.</Text>
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: !cached || sharing }} disabled={!cached || sharing} onPress={() => { void share(); }} style={{ padding: 14, borderRadius: 12, backgroundColor: '#245D45', opacity: !cached || sharing ? 0.5 : 1 }}><Text style={{ color: 'white' }}>{sharing ? 'Klargjør …' : 'Lagre eller del datagrunnlag (JSON)'}</Text></Pressable>
    {!cached && <Text>Hent ekte stasjonsdata først for å eksportere datagrunnlaget.</Text>}
  </ScrollView>;
}
