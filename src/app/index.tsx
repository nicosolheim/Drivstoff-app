import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brand}>DRIVSTOFF</Text>
        <Text accessibilityRole="header" style={styles.title}>
          Et smartere sted å fylle.
        </Text>
        <Text style={styles.intro}>
          Vi bygger en enkel oversikt over drivstoffpriser i nærheten av deg.
        </Text>
        <View style={styles.card}>
          <Text style={styles.label}>FØRSTE MILEPÆL</Text>
          <Text accessibilityRole="header" style={styles.cardTitle}>
            Grunnappen er på plass
          </Text>
          <Text style={styles.body}>
            Neste steg er eksempelstasjoner, valg mellom bensin og diesel og en
            liste som viser pris, avstand og når prisen sist ble oppdatert.
          </Text>
          <View style={styles.divider} />
          <Text style={styles.note}>
            Dette er en tidlig utviklingsversjon. Kart og lokasjon er ikke aktivert
            ennå, og appen viser foreløpig ingen drivstoffpriser.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F6F2' },
  content: { flexGrow: 1, padding: 24, paddingTop: 40, gap: 20, maxWidth: 640, width: '100%', alignSelf: 'center' },
  brand: { fontSize: 14, fontWeight: '700', letterSpacing: 3, color: '#245D45' },
  title: { fontSize: 38, fontWeight: '700', lineHeight: 44, color: '#183B2C' },
  intro: { fontSize: 18, lineHeight: 27, color: '#48594E' },
  card: { marginTop: 16, padding: 24, borderRadius: 20, backgroundColor: '#FFFFFF', gap: 16 },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5, color: '#245D45' },
  cardTitle: { fontSize: 23, fontWeight: '600', color: '#183B2C' },
  body: { fontSize: 16, lineHeight: 25, color: '#48594E' },
  divider: { height: 1, backgroundColor: '#E1E8E2' },
  note: { fontSize: 14, lineHeight: 22, color: '#48594E' },
});
