import { ScrollView, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { Screen } from '@/components/ui/Layout';
import { Card } from '@/components/ui/Card';
import { H2, Text } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { XStack, YStack, View } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { DayColumn } from '@/components/calendar/DayColumn';
import {
  CalendarView,
  addDays,
  addWeeks,
  addMonths,
  startOfWeek,
  getMonthMatrix,
  formatDay,
  formatRangeWeek,
  formatMonthYear,
  isSameDay,
} from '@/components/calendar/utils';
import { getMockMonthData, getMockMonthWorkouts } from '@/data/mockCalendar';

export default function CalendarScreen() {
  const isWeb = Platform.OS === 'web';
  const defaultView: CalendarView = isWeb ? 'week' : 'day';
  const [view, setView] = useState<CalendarView>(defaultView);
  const [anchor, setAnchor] = useState<Date>(new Date());

  useEffect(() => {
    const allowed: CalendarView[] = isWeb ? ['month', 'week'] : ['day'];
    if (!allowed.includes(view)) {
      setView(defaultView);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWeb]);

  const goPrev = () => setAnchor((d) => (view === 'day' ? addDays(d, -1) : view === 'week' ? addWeeks(d, -1) : addMonths(d, -1)));
  const goNext = () => setAnchor((d) => (view === 'day' ? addDays(d, 1) : view === 'week' ? addWeeks(d, 1) : addMonths(d, 1)));

  const header = view === 'day' ? formatDay(anchor) : view === 'week' ? formatRangeWeek(anchor) : formatMonthYear(anchor);
  const iconBtnProps = isWeb
    ? { width: 48, height: 48, paddingVertical: 10 as const, paddingHorizontal: 10 as const }
    : { minWidth: 48, minHeight: 48, paddingVertical: 10 as const, paddingHorizontal: 10 as const };

  return (
    <ScrollView style={{ backgroundColor: '#0A0A0A' }} contentContainerStyle={{ padding: 16 }}>
      <Screen padding={0} gap="$3" minHeight="100vh">
        <H2>Training Calendar</H2>
        <XStack gap="$2" alignItems="center" justifyContent="space-between">
          <XStack gap="$2">
            {isWeb ? (
              <>
                <Button appearance="secondary" onPress={() => setView('month')} width={80} height={44}>Month</Button>
                <Button appearance="secondary" onPress={() => setView('week')} width={80} height={44}>Week</Button>
              </>
            ) : (
              <Text color="$textSecondary">Day</Text>
            )}
          </XStack>
          <XStack gap="$2">
            <Button appearance="secondary" onPress={goPrev} accessibilityLabel="Previous" {...iconBtnProps}>
              <Ionicons name="chevron-back" size={22} color="#D4D4D4" />
            </Button>
            <Button appearance="secondary" onPress={() => setAnchor(new Date())} accessibilityLabel="Today" {...iconBtnProps}>
              <Ionicons name="calendar-outline" size={22} color="#D4D4D4" />
            </Button>
            <Button appearance="secondary" onPress={goNext} accessibilityLabel="Next" {...iconBtnProps}>
              <Ionicons name="chevron-forward" size={22} color="#D4D4D4" />
            </Button>
          </XStack>
        </XStack>

        <Card>
          <Text color="white">{header}</Text>
          {isWeb && view === 'month' && (
            <YStack gap="$2" marginTop="$3" width="100%">
              <XStack justifyContent="space-between" marginBottom="$2" paddingHorizontal={4}>
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
                  <Text key={d} color="$textSecondary">{d}</Text>
                ))}
              </XStack>
              {getMonthMatrix(anchor).map((week, w) => (
                <XStack key={w} gap="$2" width="100%">
                  {week.map((day, i) => {
                    const today = isSameDay(day, new Date());
                    const currentMonth = day.getMonth() === anchor.getMonth();
                    const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                    const mock = getMockMonthData(anchor)[iso];
                    const workouts = getMockMonthWorkouts(anchor)[iso] ?? [];
                    return (
                      <View
                        key={i}
                        flex={1}
                        height={96}
                        width="14%"
                        backgroundColor={today ? '$surface' : '$panel'}
                        borderColor={today ? '$textPrimary' : '$border'}
                        borderWidth={1}
                        borderRadius={10}
                        padding={6}
                        opacity={currentMonth ? 1 : 0.4}
                      >
                        <XStack alignItems="center" justifyContent="space-between">
                          <Text color={today ? '$textPrimary' : '$textSecondary'}>
                            {day.getDate()}
                          </Text>
                          {(mock?.count || workouts.length) ? (
                            <View alignItems="center" justifyContent="center" paddingHorizontal={6} paddingVertical={2} borderRadius={999} backgroundColor="$panel" borderColor="$border" borderWidth={1}>
                              <Text color="$textSecondary">{workouts.length || mock.count}</Text>
                            </View>
                          ) : null}
                        </XStack>
                        <YStack gap={2} marginTop={4}>
                          {workouts.slice(0, 2).map((w) => (
                            <Text key={w.id} color="$textSecondary" fontSize="$2">
                              {w.title} • {w.durationMin}m
                            </Text>
                          ))}
                          {workouts.length > 2 ? (
                            <Text color="$muted" fontSize="$2">+{workouts.length - 2} more</Text>
                          ) : null}
                        </YStack>
                      </View>
                    );
                  })}
                </XStack>
              ))}
            </YStack>
          )}
          {isWeb && view === 'week' && (
            <XStack gap="$3" marginTop="$3">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => (
                <DayColumn
                  fontColor="white"
                  key={d}
                  dayLabel={d}
                  dateLabel={`${startOfWeek(anchor).getDate() + i}`}
                  workouts={i % 2 === 0 ? [
                    { title: 'Aerobic Run', discipline: 'run', durationMin: 54, distanceKm: 11, bpmAvg: 152, load: 74 },
                    ...(i === 2 ? [{ title: 'Intervals', discipline: 'run', durationMin: 30, distanceKm: 5, bpmAvg: 160, load: 40 }] : []),
                  ] : [
                    { title: 'Rest', discipline: 'rest', durationMin: 0 },
                  ]}
                  dateBadgeSize={40}
                  isToday={isSameDay(new Date(startOfWeek(anchor).getFullYear(), startOfWeek(anchor).getMonth(), startOfWeek(anchor).getDate() + i), new Date())}
                />
              ))}
            </XStack>
          )}
          {!isWeb && view === 'day' && (
            <YStack gap="$3" marginTop="$3">
              <DayColumn
                fontColor="white"
                isToday={isSameDay(anchor, new Date())}
                dateBadgeSize={40}
                dayLabel={anchor.toLocaleDateString(undefined, { weekday: 'short' })}
                dateLabel={`${anchor.getDate()}`}
                workouts={[
                  { title: 'Aerobic Run', discipline: 'run', durationMin: 54, distanceKm: 11, bpmAvg: 152, load: 74 },
                  { title: 'Intervals', discipline: 'run', durationMin: 30, distanceKm: 5, bpmAvg: 160, load: 40 },
                ]}
              />
            </YStack>
          )}
        </Card>
      </Screen>
    </ScrollView>
  );
}

