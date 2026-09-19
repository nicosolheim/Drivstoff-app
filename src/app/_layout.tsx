import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StationDataProvider } from '../hooks/use-station-data';

export default function RootLayout() {
  return (
    <StationDataProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ title: 'Drivstoff', headerStyle: { backgroundColor: '#F3F6F2' }, headerTintColor: '#183B2C', headerShadowVisible: false }} />
    </StationDataProvider>
  );
}
