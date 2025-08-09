import { YStack, Text, View } from 'tamagui';
import { WorkoutCard, WorkoutCardProps } from './WorkoutCard';

export type DayColumnProps = {
  dayLabel: string;
  dateLabel: string;
  workouts?: WorkoutCardProps[];
  fontColor?: string;
  dateBadgeSize?: number; // width/height of the date circle
  isToday?: boolean;
};

export function DayColumn({ dayLabel, dateLabel, workouts = [], fontColor, dateBadgeSize = 32, isToday = false }: DayColumnProps) {
  return (
    <YStack flex={1} gap="$3">
      <YStack alignItems="center" gap={2}>
        <Text color={fontColor}>{dayLabel}</Text>
        <View
          borderWidth={1}
          borderRadius={999}
          width={dateBadgeSize}
          height={dateBadgeSize}
          alignItems="center"
          justifyContent="center"
          backgroundColor={isToday ? '$surface' : '$panel'}
          borderColor={isToday ? '$textPrimary' : '$border'}
        >
          <Text color={isToday ? '$textPrimary' : fontColor}>{dateLabel}</Text>
        </View>
      </YStack>
      <YStack gap="$3">
        {workouts.map((w, idx) => (
          <WorkoutCard key={idx} {...w} />
        ))}
      </YStack>
    </YStack>
  );
}

