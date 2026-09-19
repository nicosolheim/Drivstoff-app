import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ title: 'Drivstoff', headerStyle: { backgroundColor: '#F3F6F2' }, headerTintColor: '#183B2C', headerShadowVisible: false }} />
    </>
  );
}
