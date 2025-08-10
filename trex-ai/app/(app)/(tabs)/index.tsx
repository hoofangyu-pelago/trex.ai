import { ScrollView } from 'react-native';
import { useTheme } from 'tamagui';
import { Screen } from '@/components/ui/Layout';
import { Card } from '@/components/ui/Card';
import { H2, Text } from '@/components/ui/Typography';

export default function DashboardScreen() {
  const theme = useTheme();
  return (
    <ScrollView style={{ backgroundColor: theme.background.val }} contentContainerStyle={{ padding: 16 }}>
      <Screen padding={0} gap="$3">
        <H2>Dashboard</H2>
        <Card>
          <Text>This Week</Text>
          <H2>8.5h</H2>
          <Text>Training Time</Text>
        </Card>
        <Card>
          <Text>TSB</Text>
          <H2>-12</H2>
          <Text>Freshness</Text>
        </Card>
      </Screen>
    </ScrollView>
  );
}

