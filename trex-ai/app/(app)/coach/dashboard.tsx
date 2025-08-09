import { View, Text, StyleSheet } from 'react-native';

export default function CoachDashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coach Dashboard</Text>
      <Text style={styles.text}>Multi-athlete overview (placeholder)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#0A0A0A' },
  title: { color: '#FAFAFA', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  text: { color: '#D4D4D4' },
});

