# Phase 3: Coach Tools & Interactions

**Duration**: Days 9-12  
**Focus**: Planning, comments, notifications, coach workflows  
**Backend**: Local storage simulation with TanStack Query

## Objectives

- ✅ Coach multi-athlete dashboard
- ✅ Workout planning and scheduling tools
- ✅ Comments and chat functionality
- ✅ Notification system (mock)
- ✅ Coach-athlete communication workflows
- ✅ Offline-capable interactions with optimistic updates

## Day 9: Coach Dashboard & Multi-Athlete Views

### Morning: Coach Navigation & Overview
```typescript
// app/(app)/coach/dashboard.tsx
export default function CoachDashboard() {
  const { user } = useAuth()
  const athletes = useCoachAthletes(user.id)
  const weeklyOverview = useWeeklyOverview(athletes.map(a => a.id))
  
  return (
    <ScrollView>
      <YStack space="$4" padding="$4">
        {/* Week Summary */}
        <Card padding="$4">
          <XStack justifyContent="space-between" alignItems="center">
            <H2>Week of {formatWeekStart(new Date())}</H2>
            <Button onPress={openWeeklyDigest} variant="outline">
              View Weekly Digest
            </Button>
          </XStack>
          
          <XStack space="$4" marginTop="$4">
            <MetricCard
              title="Athletes"
              value={athletes.length.toString()}
              subtitle="Active this week"
            />
            <MetricCard
              title="Compliance"
              value={`${weeklyOverview.avgCompliance}%`}
              subtitle="Avg completion"
            />
            <MetricCard
              title="Workouts"
              value={weeklyOverview.totalWorkouts.toString()}
              subtitle="Planned this week"
            />
          </XStack>
        </Card>
        
        {/* Athlete List */}
        <Card padding="$4">
          <H3>Athletes</H3>
          <YStack space="$3" marginTop="$3">
            {athletes.map(athlete => (
              <AthleteCard
                key={athlete.id}
                athlete={athlete}
                weekMetrics={weeklyOverview.byAthlete[athlete.id]}
                onPress={() => router.push(`/coach/athlete/${athlete.id}`)}
              />
            ))}
          </YStack>
        </Card>
        
        {/* Recent Activity */}
        <Card padding="$4">
          <H3>Recent Activity</H3>
          <RecentActivityFeed athleteIds={athletes.map(a => a.id)} />
        </Card>
      </YStack>
    </ScrollView>
  )
}

// components/coach/AthleteCard.tsx
export const AthleteCard = ({ athlete, weekMetrics, onPress }: Props) => {
  return (
    <Card 
      padding="$3" 
      backgroundColor="$surface"
      pressStyle={{ backgroundColor: '$panel' }}
      onPress={onPress}
    >
      <XStack space="$3" alignItems="center">
        {/* Avatar */}
        <Circle size={48} backgroundColor="$border">
          <Text color="$textPrimary" fontSize="$5" fontWeight="bold">
            {athlete.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </Circle>
        
        {/* Info */}
        <YStack flex={1} space="$1">
          <Text color="$textPrimary" fontSize="$4" fontWeight="600">
            {athlete.name}
          </Text>
          <Text color="$textSecondary" fontSize="$3">
            {athlete.sport} • {weekMetrics.completedWorkouts}/{weekMetrics.plannedWorkouts} workouts
          </Text>
        </YStack>
        
        {/* Status */}
        <YStack alignItems="flex-end" space="$1">
          <ComplianceRing 
            percentage={weekMetrics.compliance} 
            size={32}
          />
          <Text color="$muted" fontSize="$2">
            {weekMetrics.compliance}%
          </Text>
        </YStack>
      </XStack>
    </Card>
  )
}
```

### Afternoon: Individual Athlete View
```typescript
// app/(app)/coach/athlete/[id].tsx
export default function AthleteDetailScreen() {
  const { id } = useLocalSearchParams()
  const athlete = useAthlete(id)
  const metrics = useAthleteMetrics(id)
  const [selectedWeek, setSelectedWeek] = useState(startOfWeek(new Date()))
  
  return (
    <ScrollView>
      <YStack space="$4" padding="$4">
        {/* Athlete Header */}
        <AthleteHeader athlete={athlete} metrics={metrics.current} />
        
        {/* Quick Actions */}
        <XStack space="$3">
          <Button flex={1} onPress={openPlanningModal}>
            Plan Workout
          </Button>
          <Button flex={1} variant="outline" onPress={openChatModal}>
            Message
          </Button>
          <Button variant="outline" onPress={cloneLastWeek}>
            Clone Week
          </Button>
        </XStack>
        
        {/* Training Calendar */}
        <Card padding="$4">
          <H3>Training Plan</H3>
          <TrainingCalendar
            athleteId={id}
            weekStart={selectedWeek}
            onWeekChange={setSelectedWeek}
            editable={true}
            onPlanWorkout={openPlanningModal}
          />
        </Card>
        
        {/* Recent Performance */}
        <Card padding="$4">
          <H3>Recent Performance</H3>
          <MiniPerformanceChart data={metrics.daily.slice(-14)} />
        </Card>
        
        {/* Communication */}
        <Card padding="$4">
          <H3>Communication</H3>
          <RecentComments athleteId={id} limit={3} />
          <Button 
            marginTop="$3" 
            variant="outline"
            onPress={() => router.push(`/chat/${id}`)}
          >
            View All Messages
          </Button>
        </Card>
      </YStack>
    </ScrollView>
  )
}
```

**Deliverables:**
- [ ] Coach dashboard with multi-athlete overview
- [ ] Individual athlete detail screens
- [ ] Athlete performance summaries
- [ ] Navigation between coach views

## Day 10: Workout Planning & Scheduling

### Morning: Advanced Planning Interface
```typescript
// components/planning/WorkoutPlanningSheet.tsx
export const WorkoutPlanningSheet = ({ 
  athleteId, 
  date, 
  isOpen, 
  onClose,
  existingWorkout 
}: Props) => {
  const [workout, setWorkout] = useState<PlannedWorkout>(
    existingWorkout || createEmptyWorkout(date)
  )
  const athlete = useAthlete(athleteId)
  const planWorkout = usePlanWorkout()
  
  return (
    <Sheet modal open={isOpen} onOpenChange={onClose}>
      <Sheet.Frame padding="$4">
        <ScrollView>
          <YStack space="$4">
            <XStack justifyContent="space-between" alignItems="center">
              <H3>Plan Workout</H3>
              <Text color="$textSecondary">
                {athlete.name} • {formatDate(date)}
              </Text>
            </XStack>
            
            {/* Quick Templates */}
            <YStack space="$2">
              <Text color="$textSecondary" fontSize="$3">Quick Templates</Text>
              <XStack space="$2" flexWrap="wrap">
                {WORKOUT_TEMPLATES.map(template => (
                  <Button
                    key={template.id}
                    size="$3"
                    variant="outline"
                    onPress={() => applyTemplate(template)}
                  >
                    {template.name}
                  </Button>
                ))}
              </XStack>
            </YStack>
            
            {/* Discipline & Basic Info */}
            <XStack space="$3">
              <YStack flex={1}>
                <Label>Discipline</Label>
                <Select value={workout.discipline} onValueChange={setDiscipline}>
                  <Select.Trigger>
                    <Select.Value placeholder="Select..." />
                  </Select.Trigger>
                  <Select.Content>
                    {DISCIPLINES.map(d => (
                      <Select.Item key={d.value} value={d.value}>
                        <Select.ItemText>{d.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </YStack>
              
              <YStack flex={1}>
                <Label>Duration</Label>
                <Input
                  value={workout.duration?.toString()}
                  onChangeText={setDuration}
                  placeholder="60"
                  keyboardType="numeric"
                />
              </YStack>
            </XStack>
            
            {/* Intensity Zone */}
            <YStack space="$2">
              <Label>Target Intensity</Label>
              <XStack space="$2">
                {INTENSITY_ZONES.map(zone => (
                  <Button
                    key={zone.value}
                    size="$3"
                    variant={workout.intensity === zone.value ? 'solid' : 'outline'}
                    onPress={() => setIntensity(zone.value)}
                  >
                    {zone.label}
                  </Button>
                ))}
              </XStack>
            </YStack>
            
            {/* Structure Builder */}
            <WorkoutStructureBuilder
              discipline={workout.discipline}
              structure={workout.structure}
              onStructureChange={setStructure}
            />
            
            {/* Notes */}
            <YStack space="$2">
              <Label>Notes & Instructions</Label>
              <TextArea
                value={workout.notes}
                onChangeText={setNotes}
                placeholder="Focus areas, specific instructions..."
                minHeight={80}
              />
            </YStack>
            
            {/* Actions */}
            <XStack space="$3" justifyContent="flex-end">
              <Button variant="outline" onPress={onClose}>
                Cancel
              </Button>
              {existingWorkout && (
                <Button 
                  variant="outline" 
                  theme="red"
                  onPress={handleDelete}
                >
                  Delete
                </Button>
              )}
              <Button onPress={handleSave}>
                {existingWorkout ? 'Update' : 'Plan'} Workout
              </Button>
            </XStack>
          </YStack>
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  )
}
```

### Afternoon: Workout Templates & Structure Builder
```typescript
// components/planning/WorkoutStructureBuilder.tsx
export const WorkoutStructureBuilder = ({ 
  discipline, 
  structure, 
  onStructureChange 
}: Props) => {
  const [intervals, setIntervals] = useState<Interval[]>(structure?.intervals || [])
  
  return (
    <YStack space="$3">
      <XStack justifyContent="space-between" alignItems="center">
        <Label>Workout Structure</Label>
        <Button size="$3" onPress={addInterval}>
          Add Interval
        </Button>
      </XStack>
      
      {intervals.length === 0 ? (
        <Card padding="$3" backgroundColor="$surface">
          <Text color="$textSecondary" textAlign="center">
            Add intervals to create a structured workout
          </Text>
        </Card>
      ) : (
        <YStack space="$2">
          {intervals.map((interval, index) => (
            <IntervalCard
              key={index}
              interval={interval}
              discipline={discipline}
              onUpdate={(updated) => updateInterval(index, updated)}
              onDelete={() => deleteInterval(index)}
            />
          ))}
        </YStack>
      )}
      
      {intervals.length > 0 && (
        <Card padding="$3" backgroundColor="$panel">
          <Text color="$textSecondary" fontSize="$3">
            Total Duration: {calculateTotalDuration(intervals)} min
          </Text>
        </Card>
      )}
    </YStack>
  )
}

// data/workoutTemplates.ts
export const WORKOUT_TEMPLATES = [
  {
    id: 'easy-run',
    name: 'Easy Run',
    discipline: 'run',
    duration: 45,
    intensity: 'easy',
    structure: null,
    notes: 'Aerobic base building. Conversational pace.'
  },
  {
    id: 'tempo-run',
    name: 'Tempo Run',
    discipline: 'run',
    duration: 60,
    intensity: 'moderate',
    structure: {
      intervals: [
        { type: 'warmup', duration: 15, intensity: 'easy' },
        { type: 'main', duration: 20, intensity: 'threshold' },
        { type: 'cooldown', duration: 10, intensity: 'easy' }
      ]
    }
  },
  {
    id: 'bike-intervals',
    name: '4x8min @FTP',
    discipline: 'bike',
    duration: 90,
    intensity: 'hard',
    structure: {
      intervals: [
        { type: 'warmup', duration: 20, intensity: 'easy' },
        { type: 'interval', duration: 8, intensity: 'threshold', repeats: 4, rest: 3 },
        { type: 'cooldown', duration: 15, intensity: 'easy' }
      ]
    }
  }
  // ... more templates
]
```

**Deliverables:**
- [ ] Advanced workout planning interface
- [ ] Workout templates and quick creation
- [ ] Structured workout builder
- [ ] Week cloning functionality

## Day 11: Communication Features

### Morning: Comments System
```typescript
// components/comments/CommentsSection.tsx
export const CommentsSection = ({ 
  workoutId, 
  entityType = 'workout' 
}: Props) => {
  const comments = useComments(entityType, workoutId)
  const addComment = useAddComment()
  const [newComment, setNewComment] = useState('')
  
  return (
    <Card padding="$4">
      <H4>Comments</H4>
      
      {/* Comment List */}
      <YStack space="$3" marginTop="$3">
        {comments.map(comment => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
      </YStack>
      
      {/* Add Comment */}
      <YStack space="$2" marginTop="$4">
        <TextArea
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Add a comment..."
          minHeight={60}
        />
        <XStack justifyContent="flex-end">
          <Button 
            disabled={!newComment.trim()}
            onPress={handleAddComment}
          >
            Comment
          </Button>
        </XStack>
      </YStack>
    </Card>
  )
}

// components/comments/CommentCard.tsx
export const CommentCard = ({ comment }: { comment: Comment }) => {
  const { user } = useAuth()
  const isOwn = comment.authorId === user.id
  
  return (
    <XStack space="$3" alignItems="flex-start">
      {/* Avatar */}
      <Circle size={32} backgroundColor="$border">
        <Text color="$textPrimary" fontSize="$3" fontWeight="bold">
          {comment.author.name[0]}
        </Text>
      </Circle>
      
      {/* Comment Content */}
      <YStack flex={1} space="$1">
        <XStack space="$2" alignItems="center">
          <Text color="$textPrimary" fontSize="$3" fontWeight="600">
            {comment.author.name}
          </Text>
          <Text color="$muted" fontSize="$2">
            {formatRelativeTime(comment.createdAt)}
          </Text>
        </XStack>
        
        <Text color="$textSecondary" fontSize="$3">
          {comment.text}
        </Text>
        
        {/* Reactions */}
        <XStack space="$2" marginTop="$1">
          <Button size="$2" variant="ghost" onPress={toggleLike}>
            👍 {comment.likes || 0}
          </Button>
          <Button size="$2" variant="ghost" onPress={reply}>
            Reply
          </Button>
        </XStack>
      </YStack>
    </XStack>
  )
}
```

### Afternoon: Chat System
```typescript
// app/(app)/chat/[athleteId].tsx
export default function ChatScreen() {
  const { athleteId } = useLocalSearchParams()
  const { user } = useAuth()
  const athlete = useAthlete(athleteId)
  const messages = useChatMessages(user.id, athleteId)
  const sendMessage = useSendMessage()
  const [messageText, setMessageText] = useState('')
  
  return (
    <YStack flex={1}>
      {/* Header */}
      <XStack 
        padding="$4" 
        backgroundColor="$surface"
        borderBottomWidth={1}
        borderBottomColor="$border"
        alignItems="center"
        space="$3"
      >
        <Button variant="ghost" onPress={() => router.back()}>
          <ChevronLeft />
        </Button>
        <Circle size={36} backgroundColor="$border">
          <Text color="$textPrimary" fontWeight="bold">
            {athlete.name[0]}
          </Text>
        </Circle>
        <YStack>
          <Text color="$textPrimary" fontWeight="600">
            {athlete.name}
          </Text>
          <Text color="$muted" fontSize="$2">
            Online now
          </Text>
        </YStack>
      </XStack>
      
      {/* Messages */}
      <ScrollView 
        flex={1} 
        padding="$4"
        ref={scrollViewRef}
        onContentSizeChange={scrollToBottom}
      >
        <YStack space="$3">
          {messages.map(message => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.fromUserId === user.id}
            />
          ))}
        </YStack>
      </ScrollView>
      
      {/* Input */}
      <XStack 
        padding="$4"
        backgroundColor="$surface"
        borderTopWidth={1}
        borderTopColor="$border"
        space="$2"
        alignItems="flex-end"
      >
        <TextArea
          flex={1}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          maxHeight={100}
        />
        <Button 
          disabled={!messageText.trim()}
          onPress={handleSendMessage}
        >
          Send
        </Button>
      </XStack>
    </YStack>
  )
}

// components/chat/MessageBubble.tsx
export const MessageBubble = ({ 
  message, 
  isOwn 
}: { 
  message: Message
  isOwn: boolean 
}) => {
  return (
    <XStack 
      justifyContent={isOwn ? 'flex-end' : 'flex-start'}
      maxWidth="80%"
      alignSelf={isOwn ? 'flex-end' : 'flex-start'}
    >
      <YStack
        backgroundColor={isOwn ? '$textPrimary' : '$surface'}
        padding="$3"
        borderRadius="$4"
        maxWidth="100%"
      >
        <Text 
          color={isOwn ? '$background' : '$textPrimary'}
          fontSize="$3"
        >
          {message.text}
        </Text>
        <Text 
          color={isOwn ? '$disabled' : '$muted'}
          fontSize="$1"
          marginTop="$1"
          alignSelf="flex-end"
        >
          {formatTime(message.createdAt)}
        </Text>
      </YStack>
    </XStack>
  )
}
```

**Deliverables:**
- [ ] Comments on workouts with reactions
- [ ] Real-time chat between coach and athlete
- [ ] Message threading and history
- [ ] Read receipts and typing indicators (simulated)

## Day 12: Notifications & State Management

### Morning: Notification System
```typescript
// providers/NotificationProvider.tsx
export const NotificationProvider = ({ children }: Props) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { user } = useAuth()
  
  // Simulate notification generation
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 30s
        const notification = generateMockNotification(user.id)
        setNotifications(prev => [notification, ...prev].slice(0, 50))
        
        // Show toast
        showToast(notification)
      }
    }, 30000)
    
    return () => clearInterval(interval)
  }, [user.id])
  
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId 
          ? { ...n, readAt: new Date().toISOString() }
          : n
      )
    )
  }, [])
  
  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount: notifications.filter(n => !n.readAt).length,
      markAsRead,
      markAllAsRead: () => setNotifications(prev => 
        prev.map(n => ({ ...n, readAt: new Date().toISOString() }))
      )
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

// components/notifications/NotificationCenter.tsx
export const NotificationCenter = ({ isOpen, onClose }: Props) => {
  const { notifications, markAsRead } = useNotifications()
  
  return (
    <Sheet modal open={isOpen} onOpenChange={onClose}>
      <Sheet.Frame>
        <YStack padding="$4" space="$3">
          <XStack justifyContent="space-between" alignItems="center">
            <H3>Notifications</H3>
            <Button variant="ghost" onPress={onClose}>
              ✕
            </Button>
          </XStack>
          
          <ScrollView maxHeight={400}>
            <YStack space="$2">
              {notifications.map(notification => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onPress={() => {
                    markAsRead(notification.id)
                    handleNotificationPress(notification)
                  }}
                />
              ))}
            </YStack>
          </ScrollView>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
```

### Afternoon: TanStack Query Integration
```typescript
// services/trainingService.ts
export class TrainingService {
  // Simulate API calls with local storage
  private storage = new Map<string, any>()
  
  async getAthleteMetrics(athleteId: string): Promise<DailyMetrics[]> {
    await this.delay(200) // Simulate network delay
    const key = `metrics_${athleteId}`
    return this.storage.get(key) || MOCK_METRICS.filter(m => m.athleteId === athleteId)
  }
  
  async planWorkout(workout: PlannedWorkout): Promise<PlannedWorkout> {
    await this.delay(300)
    const key = `planned_workouts_${workout.athleteId}`
    const existing = this.storage.get(key) || []
    const updated = [...existing, { ...workout, id: generateId() }]
    this.storage.set(key, updated)
    return workout
  }
  
  async addComment(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
    await this.delay(150)
    const newComment = {
      ...comment,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    
    const key = `comments_${comment.entityType}_${comment.entityId}`
    const existing = this.storage.get(key) || []
    this.storage.set(key, [...existing, newComment])
    
    return newComment
  }
  
  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// hooks/queries.ts
const trainingService = new TrainingService()

export const useAthleteMetrics = (athleteId: string) => {
  return useQuery({
    queryKey: ['athlete-metrics', athleteId],
    queryFn: () => trainingService.getAthleteMetrics(athleteId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const usePlanWorkout = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: trainingService.planWorkout,
    onSuccess: (workout) => {
      // Optimistic update
      queryClient.invalidateQueries({
        queryKey: ['planned-workouts', workout.athleteId]
      })
      
      // Show success toast
      showToast({
        type: 'success',
        title: 'Workout Planned',
        message: `${workout.discipline} workout scheduled for ${formatDate(workout.date)}`
      })
    }
  })
}

export const useAddComment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: trainingService.addComment,
    onMutate: async (newComment) => {
      // Optimistic update
      const queryKey = ['comments', newComment.entityType, newComment.entityId]
      await queryClient.cancelQueries({ queryKey })
      
      const previousComments = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, (old: Comment[]) => [
        ...old,
        {
          ...newComment,
          id: 'temp-' + Date.now(),
          createdAt: new Date().toISOString()
        }
      ])
      
      return { previousComments }
    },
    onError: (err, newComment, context) => {
      // Rollback on error
      queryClient.setQueryData(
        ['comments', newComment.entityType, newComment.entityId],
        context?.previousComments
      )
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', variables.entityType, variables.entityId]
      })
    }
  })
}
```

**Deliverables:**
- [ ] Mock notification system with realistic triggers
- [ ] TanStack Query for state management
- [ ] Optimistic updates for planning and comments
- [ ] Local storage simulation of backend

## Success Criteria

### ✅ Phase 3 Complete When:
1. **Coach Workflow Complete**
   - Multi-athlete dashboard functional
   - Individual athlete management working
   - Workout planning tools operational

2. **Communication Features**
   - Comments system with reactions
   - Real-time chat simulation
   - Notification center working

3. **State Management**
   - TanStack Query handling all data
   - Optimistic updates for mutations
   - Local storage persistence working

4. **User Experience**
   - Smooth interactions with loading states
   - Error handling and retry logic
   - Offline-capable basic functions

## Phase 4 Preparation

### Backend Integration Readiness
- Service layer abstracts storage implementation
- Query keys structured for easy invalidation
- Error boundaries handle network failures
- Migration path from local storage to Supabase

### Production Features
- Push notification infrastructure
- Real-time updates via Supabase Realtime
- Strava API integration points identified
- Authentication flow ready for Supabase Auth

---

**Estimated Effort**: 32 hours (4 days × 8 hours)  
**Risk Level**: Medium (state management complexity, offline sync)  
**Dependencies**: Phase 2 completed

*After Phase 3, you'll have a fully functional training platform with coach tools that works entirely offline, ready for backend integration.*