import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Asset } from 'expo-asset';
import { SvgUri } from 'react-native-svg';
import { Link, Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const { user, signIn } = useAuth();
  const [email, setEmail] = useState('athlete@example.com');

  if (user) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <SvgUri uri={Asset.fromModule(require('@/assets/images/trex.svg')).uri} width={28} height={28} />
        <Text style={styles.brand}>trex.ai</Text>
      </View>
      <Text style={styles.title}>Sign In</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="email@example.com"
        placeholderTextColor="#999"
        style={styles.input}
      />
      <Pressable style={styles.button} onPress={() => signIn(email)}>
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
      <Link href="/(auth)/onboarding" style={styles.link}>
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
    backgroundColor: '#0A0A0A',
  },
  brand: {
    color: '#FAFAFA',
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
  title: { color: '#FAFAFA', fontSize: 28, fontWeight: '700' },
  input: {
    backgroundColor: '#161616',
    color: '#FAFAFA',
    borderColor: '#262626',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  button: {
    backgroundColor: '#111111',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#262626',
  },
  buttonText: { color: '#FAFAFA', fontWeight: '600' },
  link: { color: '#D4D4D4', textAlign: 'center', marginTop: 8 },
});

