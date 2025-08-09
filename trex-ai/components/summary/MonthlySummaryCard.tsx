import { Card } from '@/components/ui/Card';
import { H2, Text } from '@/components/ui/Typography';
import type { MockWorkout } from '@/data/mockWorkouts';

type Props = {
  monthKey: string; // YYYY-MM
  workouts: MockWorkout[];
};

function summarize(workouts: MockWorkout[]) {
  const activities = workouts.length;
  const hours = workouts.reduce((sum, w) => sum + w.duration, 0) / 60;
  const km = workouts
    .filter((w) => w.discipline === 'run' || w.discipline === 'bike')
    .reduce((sum, w) => sum + (w.distance || 0), 0);
  return { activities, hours: Number(hours.toFixed(1)), km: Number(km.toFixed(2)) };
}

export function MonthlySummaryCard({ monthKey, workouts }: Props) {
  const { activities, hours, km } = summarize(workouts);
  const monthDate = new Date(`${monthKey}-01`);
  const monthLabel = monthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <Card>
      <H2>{monthLabel}</H2>
      <Text color="$textSecondary">
        {km} km • {activities} activities • {hours} hours
      </Text>
    </Card>
  );
}

