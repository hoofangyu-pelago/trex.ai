import { XStack, YStack, View, useTheme } from 'tamagui';
import { H3, Text } from '@/components/ui/Typography';

export type WorkoutCardProps = {
  title: string;
  discipline: string;
  durationMin: number;
  distanceKm?: number;
  bpmAvg?: number;
  load?: number;
};

export function WorkoutCard({ title, discipline, durationMin, distanceKm, bpmAvg, load }: WorkoutCardProps) {
  const theme = useTheme();
  return (
    <YStack
      backgroundColor="$surface"
      borderColor="$border"
      borderWidth={1}
      borderRadius={12}
      padding="$3"
      gap="$2"
    >
      <XStack alignItems="center" justifyContent="space-between">
        <Text>{discipline.toUpperCase()}</Text>
        {!!load && <Text>Load {load}</Text>}
      </XStack>
      <H3>{title}</H3>
      <Text>
        {durationMin} min{distanceKm ? ` • ${distanceKm} km` : ''}
        {bpmAvg ? ` • ${bpmAvg} bpm` : ''}
      </Text>
      <View height={6} borderRadius={6} overflow="hidden" backgroundColor="$panel" borderColor="$border" borderWidth={1}>
        <View height={4} margin={1} borderRadius={4} width="60%" backgroundColor={theme.chart1?.val ?? '#22c55e'} />
      </View>
    </YStack>
  );
}

