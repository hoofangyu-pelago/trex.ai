import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'tamagui';

export default function OnboardingScreen() {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background.val }]}>
      <Text style={[styles.title, { color: theme.textPrimary.val }]}>Onboarding</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary.val }]}>Coming soon…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { marginTop: 8 },
});

