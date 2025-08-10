import { ScrollView } from 'react-native';
import { Screen } from '@/components/ui/Layout';
import { Card } from '@/components/ui/Card';
import { H2, Text } from '@/components/ui/Typography';
import { MOCK_WORKOUTS, MockWorkout } from '@/data/mockWorkouts';
import { MonthlySummaryCard } from '@/components/summary/MonthlySummaryCard';
import { WorkoutListItem } from '@/components/workouts/WorkoutListItem';
import { YStack, useTheme } from 'tamagui';

function groupByMonth(items: MockWorkout[]): Record<string, MockWorkout[]> {
  return items.reduce<Record<string, MockWorkout[]>>((acc, w) => {
    const key = w.date.slice(0, 7); // YYYY-MM
    acc[key] = acc[key] || [];
    acc[key].push(w);
    return acc;
  }, {});
}

export default function ActivitiesScreen() {
  const theme = useTheme();
  const months = groupByMonth(MOCK_WORKOUTS);
  const monthKeys = Object.keys(months).sort((a, b) => (a < b ? 1 : -1));

  return (
    <ScrollView style={{ backgroundColor: theme.background.val }} contentContainerStyle={{ padding: 16 }}>
      <Screen padding={0} gap="$3" minHeight="100vh">
        {monthKeys.map((month) => (
          <YStack key={month} gap="$3">
            <MonthlySummaryCard monthKey={month} workouts={months[month]} />
            {months[month].map((w) => (
              <WorkoutListItem key={w.id} workout={w} />
            ))}
          </YStack>
        ))}
      </Screen>
    </ScrollView>
  );
}

