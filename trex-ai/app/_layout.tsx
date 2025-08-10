import { Stack } from 'expo-router';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '@/tamagui.config';
import { AuthProvider } from '@/providers/AuthProvider';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useFonts } from 'expo-font';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Geist_400_Regular: require('geist/dist/fonts/geist-sans/Geist-Regular.ttf'),
    Geist_500_Medium: require('geist/dist/fonts/geist-sans/Geist-Medium.ttf'),
    Geist_700_Bold: require('geist/dist/fonts/geist-sans/Geist-Bold.ttf'),
    // Optional mono:
    // GeistMono_400_Regular: require('geist/dist/fonts/geist-mono/GeistMono-Regular.ttf'),
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
