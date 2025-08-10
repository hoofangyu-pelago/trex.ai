import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'tamagui';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background.val }]}>
      <Text style={[styles.title, { color: theme.textPrimary.val }]}>Workout Detail</Text>
      <Text style={[styles.text, { color: theme.textSecondary.val }]}>ID: {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  text: {},
});

