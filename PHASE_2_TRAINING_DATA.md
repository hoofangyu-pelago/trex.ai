# Phase 2: Training Data & Visualizations

**Duration**: Days 5-8  
**Focus**: Workout displays, metrics, charts, calendar UI  
**Backend**: None (comprehensive mock data)

## Objectives

- ✅ Rich workout detail views with metrics
- ✅ Training calendar with plan vs actual
- ✅ Performance charts and trend analysis  
- ✅ Personal bests tracking
- ✅ Athlete progress dashboard
- ✅ Realistic mock data ecosystem

## Day 5: Workout Details & Metrics

### Morning: Workout Detail Screen
```typescript
// app/workout/[id].tsx
export default function WorkoutDetail() {
  const { id } = useLocalSearchParams()
  const workout = useWorkout(id)
  
  return (
    <ScrollView>
      <YStack space="$4" padding="$4">
        {/* Header */}
        <WorkoutHeader workout={workout} />
        
        {/* Key Metrics */}
        <MetricsGrid metrics={workout.metrics} />
        
        {/* Charts */}
        {workout.hasDetailData && (
          <YStack space="$3">
            <PowerChart data={workout.powerData} />
            <HeartRateChart data={workout.hrData} />
            <PaceChart data={workout.paceData} />
          </YStack>
        )}
        
        {/* Analysis */}
        <AnalysisCard
          compliance={workout.compliance}
          tss={workout.tss}
          intensity={workout.intensity}
        />
        
        {/* Comments */}
        <CommentsSection workoutId={id} />
      </YStack>
    </ScrollView>
  )
}
```

### Afternoon: Victory Charts Integration
```typescript
// components/charts/PowerChart.tsx
import { VictoryLine, VictoryChart, VictoryArea } from 'victory-native'

export const PowerChart = ({ data }: { data: PowerDataPoint[] }) => {
  const theme = useTheme()
  
  return (
    <Card padding="$4">
      <H4 color="$textPrimary">Power</H4>
      <VictoryChart
        theme={{
          axis: { style: { tickLabels: { fill: theme.textSecondary.val } } }
        }}
        height={200}
      >
        <VictoryArea
          data={data}
          x="time"
          y="watts"
          style={{
            data: { fill: theme.textPrimary.val, fillOpacity: 0.1 }
          }}
        />
        <VictoryLine
          data={data}
          x="time" 
          y="watts"
          style={{
            data: { stroke: theme.textPrimary.val, strokeWidth: 1.5 }
          }}
        />
      </VictoryChart>
    </Card>
  )
}
```

**Deliverables:**
- [ ] Workout detail screens with full metrics
- [ ] Victory charts for power, HR, pace data
- [ ] Metrics calculations (TSS, IF, NP)
- [ ] Chart theming matching monochrome design

## Day 6: Training Calendar

### Morning: Calendar Grid Component
```typescript
// components/calendar/TrainingCalendar.tsx
export const TrainingCalendar = ({ 
  weekStart, 
  plannedWorkouts, 
  actualWorkouts 
}: Props) => {
  const days = generateWeekDays(weekStart)
  
  return (
    <YStack space="$2">
      {/* Week Navigation */}
      <XStack justifyContent="space-between" alignItems="center">
        <Button onPress={goToPrevWeek} variant="ghost">
          <ChevronLeft />
        </Button>
        <H3>{formatWeekRange(weekStart)}</H3>
        <Button onPress={goToNextWeek} variant="ghost">
          <ChevronRight />
        </Button>
      </XStack>
      
      {/* Calendar Grid */}
      <YStack space="$2">
        {days.map(day => (
          <CalendarDay
            key={day.toISOString()}
            date={day}
            planned={getPlannedForDay(day, plannedWorkouts)}
            actual={getActualForDay(day, actualWorkouts)}
          />
        ))}
      </YStack>
    </YStack>
  )
}

// components/calendar/CalendarDay.tsx
export const CalendarDay = ({ date, planned, actual }: Props) => {
  return (
    <Card padding="$3" backgroundColor="$surface">
      <XStack justifyContent="space-between" alignItems="flex-start">
        {/* Date */}
        <YStack>
          <Text color="$textSecondary" fontSize="$2">
            {formatDayName(date)}
          </Text>
          <Text color="$textPrimary" fontSize="$6" fontWeight="bold">
            {date.getDate()}
          </Text>
        </YStack>
        
        {/* Workouts */}
        <XStack flex={1} space="$2" marginLeft="$3">
          {planned.map(workout => (
            <PlannedWorkoutCard key={workout.id} workout={workout} />
          ))}
          {actual.map(workout => (
            <ActualWorkoutCard key={workout.id} workout={workout} />
          ))}
        </XStack>
      </XStack>
    </Card>
  )
}
```

### Afternoon: Workout Planning Interface
```typescript
// components/planning/WorkoutPlanningModal.tsx
export const WorkoutPlanningModal = ({ 
  date, 
  isOpen, 
  onClose 
}: Props) => {
  const [workout, setWorkout] = useState<PlannedWorkout>({
    date,
    discipline: 'run',
    duration: 60,
    intensity: 'easy'
  })
  
  return (
    <Sheet modal open={isOpen} onOpenChange={onClose}>
      <Sheet.Frame padding="$4">
        <YStack space="$4">
          <H3>Plan Workout</H3>
          
          {/* Discipline Selector */}
          <SelectField
            label="Discipline"
            value={workout.discipline}
            options={DISCIPLINES}
            onValueChange={(discipline) => 
              setWorkout(prev => ({ ...prev, discipline }))
            }
          />
          
          {/* Duration */}
          <InputField
            label="Duration (minutes)"
            value={workout.duration.toString()}
            onChangeText={(text) => 
              setWorkout(prev => ({ ...prev, duration: parseInt(text) }))
            }
          />
          
          {/* Intensity */}
          <SelectField
            label="Intensity"
            value={workout.intensity}
            options={INTENSITY_ZONES}
            onValueChange={(intensity) =>
              setWorkout(prev => ({ ...prev, intensity }))
            }
          />
          
          {/* Notes */}
          <TextArea
            label="Notes"
            value={workout.notes}
            onChangeText={(notes) =>
              setWorkout(prev => ({ ...prev, notes }))
            }
          />
          
          <XStack space="$3" justifyContent="flex-end">
            <Button variant="outline" onPress={onClose}>
              Cancel
            </Button>
            <Button onPress={handleSave}>
              Save Plan
            </Button>
          </XStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
```

**Deliverables:**
- [ ] Weekly calendar view with day-by-day layout
- [ ] Planned vs actual workout visualization
- [ ] Workout planning modal/interface
- [ ] Calendar navigation (prev/next week)

## Day 7: Progress Tracking & Charts

### Morning: Performance Dashboard
```typescript
// app/(app)/(tabs)/progress.tsx
export default function ProgressScreen() {
  const { user } = useAuth()
  const metrics = useAthleteMetrics(user.id)
  const pbs = usePersonalBests(user.id)
  
  return (
    <ScrollView>
      <YStack space="$4" padding="$4">
        {/* Fitness Chart (CTL/ATL/TSB) */}
        <Card padding="$4">
          <H3>Fitness Trends</H3>
          <FitnessChart data={metrics.daily} />
        </Card>
        
        {/* Load Distribution */}
        <Card padding="$4">
          <H3>Training Load (4 weeks)</H3>
          <LoadChart data={metrics.weekly} />
        </Card>
        
        {/* Personal Bests */}
        <Card padding="$4">
          <H3>Personal Bests</H3>
          <PersonalBestsList pbs={pbs} />
        </Card>
        
        {/* Recent Activity Summary */}
        <Card padding="$4">
          <H3>Last 7 Days</H3>
          <WeeklySummary metrics={metrics.weekly[0]} />
        </Card>
      </YStack>
    </ScrollView>
  )
}
```

### Afternoon: Advanced Charts
```typescript
// components/charts/FitnessChart.tsx
export const FitnessChart = ({ data }: { data: DailyMetrics[] }) => {
  return (
    <VictoryChart height={250} padding={{ left: 50, top: 20, right: 50, bottom: 50 }}>
      {/* CTL (Chronic Training Load) */}
      <VictoryLine
        data={data}
        x="date"
        y="ctl"
        style={{
          data: { stroke: "#E5E5E5", strokeWidth: 2 }
        }}
      />
      
      {/* ATL (Acute Training Load) */}
      <VictoryLine
        data={data}
        x="date"
        y="atl"
        style={{
          data: { stroke: "#CFCFCF", strokeWidth: 2, strokeDasharray: "5,5" }
        }}
      />
      
      {/* TSB (Training Stress Balance) */}
      <VictoryArea
        data={data}
        x="date"
        y="tsb"
        style={{
          data: { 
            fill: "#9F9F9F", 
            fillOpacity: 0.3,
            stroke: "#9F9F9F",
            strokeWidth: 1
          }
        }}
      />
    </VictoryChart>
  )
}

// components/charts/LoadChart.tsx
export const LoadChart = ({ data }: { data: WeeklyMetrics[] }) => {
  return (
    <VictoryChart
      domainPadding={20}
      height={200}
    >
      <VictoryBar
        data={data}
        x="week"
        y="totalTSS"
        style={{
          data: { fill: "#6B6B6B" }
        }}
      />
    </VictoryChart>
  )
}
```

**Deliverables:**
- [ ] CTL/ATL/TSB trend charts
- [ ] Training load distribution
- [ ] Personal bests tracking
- [ ] Performance analytics dashboard

## Day 8: Mock Data Ecosystem & Polish

### Morning: Comprehensive Mock Data
```typescript
// data/mockMetrics.ts
export const generateMockMetrics = (athleteId: string): DailyMetrics[] => {
  const metrics: DailyMetrics[] = []
  const startDate = subDays(new Date(), 90) // 3 months of data
  
  let ctl = 45 // Starting fitness
  let atl = 40 // Starting fatigue
  
  for (let i = 0; i < 90; i++) {
    const date = addDays(startDate, i)
    const dayOfWeek = date.getDay()
    
    // Simulate realistic training patterns
    const tss = generateDailyTSS(dayOfWeek, i, ctl)
    
    // Update CTL/ATL with exponential weighted moving averages
    ctl = ctl + (tss - ctl) * (1 - Math.exp(-1/42)) // 42-day EWMA
    atl = atl + (tss - atl) * (1 - Math.exp(-1/7))  // 7-day EWMA
    const tsb = ctl - atl
    
    metrics.push({
      date: date.toISOString().split('T')[0],
      athleteId,
      tss,
      ctl: Math.round(ctl),
      atl: Math.round(atl),  
      tsb: Math.round(tsb),
      duration: tss > 0 ? Math.round(tss / 0.8) : 0, // Rough duration estimate
      distance: calculateDistance(tss, 'mixed')
    })
  }
  
  return metrics
}

// data/mockWorkouts.ts
export const generateMockWorkouts = (
  athleteId: string, 
  metrics: DailyMetrics[]
): Workout[] => {
  return metrics
    .filter(m => m.tss > 0)
    .map(metric => ({
      id: generateId(),
      athleteId,
      date: metric.date,
      discipline: selectDiscipline(metric.tss),
      title: generateWorkoutTitle(metric.tss, selectDiscipline(metric.tss)),
      duration: metric.duration,
      distance: metric.distance,
      tss: metric.tss,
      intensity: calculateIF(metric.tss, metric.duration),
      hasDetailData: Math.random() > 0.3, // 70% have detailed data
      powerData: generatePowerData(),
      hrData: generateHRData(),
      paceData: generatePaceData(),
      compliance: calculateCompliance(),
      notes: generateWorkoutNotes()
    }))
}

// data/mockPersonalBests.ts
export const generateMockPBs = (athleteId: string): PersonalBest[] => [
  {
    id: '1',
    athleteId,
    discipline: 'run',
    metric: '5k_time',
    value: 1275, // 21:15
    unit: 'seconds',
    date: '2024-01-10',
    workoutId: 'w1'
  },
  {
    id: '2', 
    athleteId,
    discipline: 'bike',
    metric: '20min_power',
    value: 285,
    unit: 'watts',
    date: '2024-01-05',
    workoutId: 'w2'
  }
  // ... more PBs
]
```

### Afternoon: Data Hooks & Polish
```typescript
// hooks/useTrainingData.ts
export const useAthleteMetrics = (athleteId: string) => {
  return useMemo(() => {
    const metrics = MOCK_METRICS.filter(m => m.athleteId === athleteId)
    const weekly = groupByWeek(metrics)
    const monthly = groupByMonth(metrics)
    
    return {
      daily: metrics,
      weekly,
      monthly,
      current: {
        ctl: metrics[metrics.length - 1]?.ctl || 0,
        atl: metrics[metrics.length - 1]?.atl || 0,
        tsb: metrics[metrics.length - 1]?.tsb || 0
      }
    }
  }, [athleteId])
}

export const useWorkoutHistory = (athleteId: string, limit?: number) => {
  return useMemo(() => {
    const workouts = MOCK_WORKOUTS
      .filter(w => w.athleteId === athleteId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
    return limit ? workouts.slice(0, limit) : workouts
  }, [athleteId, limit])
}

export const usePersonalBests = (athleteId: string) => {
  return useMemo(() => 
    MOCK_PERSONAL_BESTS.filter(pb => pb.athleteId === athleteId),
    [athleteId]
  )
}
```

**Deliverables:**
- [ ] Rich 3-month mock dataset per athlete
- [ ] Realistic metric progressions and seasonality
- [ ] Personal best achievements with dates
- [ ] Performance hooks for data access

## Mock Data Specifications

### **Athlete Profiles** (5-6 diverse athletes)
```typescript
const MOCK_ATHLETES = [
  {
    id: '1',
    name: 'Sarah Johnson', 
    sport: 'triathlon',
    level: 'competitive',
    ftp: 245,
    lthr: 172,
    zones: { /* power/hr zones */ }
  },
  {
    id: '2',
    name: 'Mike Chen',
    sport: 'running', 
    level: 'recreational',
    thresholdPace: 375, // 6:15/mile
    lthr: 165
  },
  // ... more athletes
]
```

### **Training Patterns**
- **Periodization**: Base → Build → Peak cycles
- **Weekly Structure**: Easy/Hard day patterns
- **Discipline Mix**: Varied by athlete specialization
- **Seasonality**: Volume/intensity changes over time

### **Edge Cases Included**
- Missing heart rate data (older workouts)
- Power meter not available (some bike rides)
- Failed workouts (cut short, intensity too low)
- Travel days (timezone changes)
- Rest weeks (reduced load)

## Success Criteria

### ✅ Phase 2 Complete When:
1. **Rich Data Visualization**
   - Workout details show comprehensive metrics
   - Charts display realistic training progressions
   - Calendar shows planned vs actual clearly

2. **Performance Analytics**
   - CTL/ATL/TSB trends visible
   - Personal bests tracked and displayed
   - Training load patterns apparent

3. **User Experience**
   - Navigation between calendar/workouts feels intuitive
   - Charts load quickly and are responsive
   - Mock data tells coherent training stories

4. **Data Quality**
   - 3+ months of realistic data per athlete
   - Metrics calculations match TrainingPeaks formulas
   - Edge cases and data gaps represented

## Next Phase Preparation

### Coach Tools Requirements
- Multi-athlete views and comparisons
- Workout planning and scheduling tools
- Communication features (comments, chat)
- Performance analysis across athletes

### State Management Evolution
- TanStack Query for caching and mutations
- Optimistic updates for planning changes
- Local storage persistence simulation

---

**Estimated Effort**: 32 hours (4 days × 8 hours)  
**Risk Level**: Medium (chart integration, data complexity)  
**Dependencies**: Phase 1 completed

*After Phase 2, you'll have a rich, data-driven training platform that showcases the full potential of the application.*