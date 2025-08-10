import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useTheme } from 'tamagui';
import { Asset } from 'expo-asset';
import { SvgUri } from 'react-native-svg';
import { Link, Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const { user, signIn } = useAuth();
  const [email, setEmail] = useState('athlete@example.com');
  const theme = useTheme();

  if (user) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.val }]}>
      <View style={styles.brandRow}>
        <SvgUri uri={Asset.fromModule(require('@/assets/images/trex.svg')).uri} width={28} height={28} />
        <Text style={[styles.brand, { color: theme.textPrimary.val }]}>trex.ai</Text>
      </View>
      <Text style={[styles.title, { color: theme.textPrimary.val }]}>Sign In</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="email@example.com"
        placeholderTextColor={theme.muted.val}
        style={[
          styles.input,
          {
            backgroundColor: theme.surface.val,
            color: theme.textPrimary.val,
            borderColor: theme.border.val,
          },
        ]}
      />
      <Pressable
        style={[
          styles.button,
          { backgroundColor: theme.panel.val, borderColor: theme.border.val },
        ]}
        onPress={() => signIn(email)}
      >
        <Text style={[styles.buttonText, { color: theme.textPrimary.val }]}>Continue</Text>
      </Pressable>
      <Link href="/(auth)/onboarding" style={[styles.link, { color: theme.textSecondary.val }]}>
        Create account
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
    justifyContent: 'center',
  },
  brand: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
  },
  brandRow: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  brandIcon: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  title: { fontSize: 28, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  button: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  buttonText: { fontWeight: '600' },
  link: { textAlign: 'center', marginTop: 8 },
});

