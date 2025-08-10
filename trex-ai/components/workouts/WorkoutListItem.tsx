import { XStack, YStack, View, useTheme } from 'tamagui';
import { Card } from '@/components/ui/Card';
import { H2, Text } from '@/components/ui/Typography';
import type { MockWorkout } from '@/data/mockWorkouts';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  workout: MockWorkout;
};

function formatDistance(w: MockWorkout) {
  if (w.discipline === 'swim' && typeof w.distance === 'number') {
    return `${Math.round(w.distance * 1000)} m`;
  }
  if (typeof w.distance === 'number') {
    return `${w.distance} km`;
  }
  return '';
}

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function iconFor(discipline: MockWorkout['discipline'], color: string) {
  switch (discipline) {
    case 'run':
      return <Ionicons name="walk-outline" size={20} color={color} />;
    case 'bike':
      return <Ionicons name="bicycle-outline" size={20} color={color} />;
    case 'swim':
      return <Ionicons name="water-outline" size={20} color={color} />;
    case 'strength':
      return <Ionicons name="barbell-outline" size={20} color={color} />;
    default:
      return null;
  }
}

export function WorkoutListItem({ workout }: Props) {
  const theme = useTheme();
  const primary = formatDistance(workout) || workout.title;
  return (
    <Card>
      <XStack gap={12} alignItems="center">
        <View width={64} height={64} borderRadius={8} backgroundColor="$panel" borderColor="$border" borderWidth={1} />
        <YStack flex={1} gap={2}>
          <H2>{primary}</H2>
          <Text color="$textSecondary">{formatDuration(workout.duration)}{workout.discipline !== 'strength' && workout.distance ? '' : ''}</Text>
          <Text>{workout.title}</Text>
        </YStack>
        <View>{iconFor(workout.discipline, theme.textSecondary.val)}</View>
      </XStack>
    </Card>
  );
}

