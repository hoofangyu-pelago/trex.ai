import { Stack } from 'expo-router';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '@/tamagui.config';
import { AuthProvider } from '@/providers/AuthProvider';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        const el = document.documentElement as HTMLElement;
        el.style.setProperty('-webkit-font-smoothing', 'antialiased');
        el.style.setProperty('text-rendering', 'optimizeLegibility');
      } catch {}
    }
  }, []);

  if (!fontsLoaded) return null;

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <AuthProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </TamaguiProvider>
  );
}
