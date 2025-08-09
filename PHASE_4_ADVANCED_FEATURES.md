# Phase 4: Backend Integration & Production

**Duration**: Days 13-14  
**Focus**: Supabase integration, Strava API, real data flow, production deployment  
**Backend**: Full implementation with live data

## Objectives

- ✅ Supabase database and authentication integration
- ✅ Strava API connection and webhook processing
- ✅ Real-time data synchronization
- ✅ Production deployment (web + mobile)
- ✅ Performance optimization and monitoring
- ✅ All MVP acceptance criteria met

## Day 13: Backend Integration & Data Migration

### Morning: Supabase Setup & Schema Migration
```sql
-- supabase/migrations/001_initial_schema.sql
-- Users and authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('athlete', 'coach', 'master')),
  team_id UUID NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams (single team for MVP)
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Athlete profiles
CREATE TABLE athlete_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id),
  sport TEXT NOT NULL,
  ftp INTEGER,
  lthr INTEGER,
  threshold_pace INTEGER,
  strava_connected BOOLEAN DEFAULT FALSE,
  strava_athlete_id BIGINT,
  strava_access_token TEXT,
  strava_refresh_token TEXT,
  strava_token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Planned workouts
CREATE TABLE workouts_planned (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id),
  athlete_id UUID NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  discipline TEXT NOT NULL,
  title TEXT,
  duration INTEGER, -- minutes
  distance DECIMAL,
  intensity TEXT,
  structure JSONB,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Actual workouts (from Strava)
CREATE TABLE workouts_actual (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id),
  athlete_id UUID NOT NULL REFERENCES users(id),
  strava_activity_id BIGINT UNIQUE,
  date DATE NOT NULL,
  discipline TEXT NOT NULL,
  title TEXT NOT NULL,
  duration INTEGER NOT NULL, -- seconds
  distance DECIMAL,
  summary_metrics JSONB NOT NULL,
  detailed_data JSONB,
  polyline TEXT,
  source TEXT DEFAULT 'strava' CHECK (source IN ('strava', 'manual', 'reconciliation')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts_planned ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts_actual ENABLE ROW LEVEL SECURITY;
```

### Service Layer Refactoring
```typescript
// services/supabaseService.ts
export class SupabaseService implements TrainingServiceInterface {
  constructor(private supabase: SupabaseClient) {}
  
  async getAthleteMetrics(athleteId: string): Promise<DailyMetrics[]> {
    const { data, error } = await this.supabase
      .from('metrics_daily')
      .select('*')
      .eq('athlete_id', athleteId)
      .order('date', { ascending: true })
      
    if (error) throw error
    return data
  }
  
  async planWorkout(workout: PlannedWorkout): Promise<PlannedWorkout> {
    const { data, error } = await this.supabase
      .from('workouts_planned')
      .insert([{
        team_id: workout.teamId,
        athlete_id: workout.athleteId,
        date: workout.date,
        discipline: workout.discipline,
        title: workout.title,
        duration: workout.duration,
        distance: workout.distance,
        intensity: workout.intensity,
        structure: workout.structure,
        notes: workout.notes,
        created_by: workout.createdBy
      }])
      .select()
      .single()
      
    if (error) throw error
    return this.mapPlannedWorkout(data)
  }
  
  async syncStravaActivity(activityId: string): Promise<void> {
    // Call our API route to fetch and process Strava activity
    const response = await fetch(`/api/strava/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activityId })
    })
    
    if (!response.ok) {
      throw new Error('Failed to sync Strava activity')
    }
  }
}

// providers/ServiceProvider.tsx
export const ServiceProvider = ({ children }: Props) => {
  const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const service = useMemo(() => 
    new SupabaseService(supabase), 
    [supabase]
  )
  
  return (
    <ServiceContext.Provider value={service}>
      {children}
    </ServiceContext.Provider>
  )
}
```

### Data Migration Tools
```typescript
// scripts/migrateToSupabase.ts
export const migrateMockDataToSupabase = async () => {
  const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
  )
  
  // Create default team
  const { data: team } = await supabase
    .from('teams')
    .insert([{ name: 'Default Team' }])
    .select()
    .single()
    
  // Migrate users
  for (const mockUser of MOCK_USERS) {
    const { data: user } = await supabase
      .from('users')
      .insert([{
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        team_id: team.id,
        timezone: mockUser.timezone
      }])
      .select()
      .single()
      
    // Create athlete profile if needed
    if (mockUser.role === 'athlete') {
      await supabase
        .from('athlete_profiles')
        .insert([{
          user_id: user.id,
          team_id: team.id,
          sport: mockUser.sport,
          ftp: mockUser.ftp,
          lthr: mockUser.lthr
        }])
    }
  }
  
  // Migrate planned workouts
  for (const mockWorkout of MOCK_PLANNED_WORKOUTS) {
    await supabase
      .from('workouts_planned')
      .insert([{
        team_id: team.id,
        athlete_id: mockWorkout.athleteId,
        date: mockWorkout.date,
        discipline: mockWorkout.discipline,
        title: mockWorkout.title,
        duration: mockWorkout.duration,
        notes: mockWorkout.notes,
        created_by: mockWorkout.createdBy
      }])
  }
  
  console.log('Migration completed successfully')
}
```

**Deliverables:**
- [ ] Complete Supabase schema with RLS policies
- [ ] Service layer switched to real database
- [ ] Mock data migration scripts
- [ ] Authentication integration with Supabase Auth

### Afternoon: Strava API Integration

```typescript
// app/(api)/strava/connect+api.ts
export async function POST(request: Request) {
  const { code, state } = await request.json()
  
  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code'
      })
    })
    
    const tokens = await tokenResponse.json()
    
    // Store tokens in Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    await supabase
      .from('athlete_profiles')
      .update({
        strava_connected: true,
        strava_athlete_id: tokens.athlete.id,
        strava_access_token: tokens.access_token,
        strava_refresh_token: tokens.refresh_token,
        strava_token_expires_at: new Date(tokens.expires_at * 1000).toISOString()
      })
      .eq('user_id', state) // state contains user ID
      
    // Start historical backfill
    await fetch('/api/strava/backfill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state })
    })
    
    return Response.json({ success: true })
  } catch (error) {
    console.error('Strava connection error:', error)
    return Response.json({ error: 'Connection failed' }, { status: 500 })
  }
}

// app/(api)/strava/webhook+api.ts
export async function POST(request: Request) {
  const { object_type, aspect_type, object_id, owner_id } = await request.json()
  
  if (object_type !== 'activity') {
    return Response.json({ success: true }) // Ignore non-activity events
  }
  
  try {
    // Find athlete by Strava ID
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { data: profile } = await supabase
      .from('athlete_profiles')
      .select('*')
      .eq('strava_athlete_id', owner_id)
      .single()
      
    if (!profile) {
      return Response.json({ error: 'Athlete not found' }, { status: 404 })
    }
    
    if (aspect_type === 'create' || aspect_type === 'update') {
      // Fetch activity details and process
      await processStravaActivity(object_id, profile)
    } else if (aspect_type === 'delete') {
      // Remove activity from database
      await supabase
        .from('workouts_actual')
        .delete()
        .eq('strava_activity_id', object_id)
    }
    
    return Response.json({ success: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return Response.json({ error: 'Processing failed' }, { status: 500 })
  }
}

// utils/stravaProcessor.ts
export const processStravaActivity = async (
  activityId: string, 
  profile: AthleteProfile
) => {
  // Fetch activity details from Strava
  const activity = await fetchStravaActivity(activityId, profile.strava_access_token)
  
  // Calculate metrics
  const metrics = calculateWorkoutMetrics(activity)
  
  // Store in database
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  await supabase
    .from('workouts_actual')
    .upsert([{
      strava_activity_id: activity.id,
      team_id: profile.team_id,
      athlete_id: profile.user_id,
      date: activity.start_date_local.split('T')[0],
      discipline: mapStravaSport(activity.sport_type),
      title: activity.name,
      duration: activity.elapsed_time,
      distance: activity.distance,
      summary_metrics: metrics,
      detailed_data: activity.has_streams ? await fetchActivityStreams(activityId) : null,
      polyline: activity.map?.polyline
    }])
    
  // Update daily metrics
  await updateDailyMetrics(profile.user_id, activity.start_date_local.split('T')[0])
  
  // Check for personal bests
  await checkPersonalBests(profile.user_id, activity)
  
  // Generate AI summary
  await generateWorkoutSummary(activityId)
}
```

**Deliverables:**
- [ ] Strava OAuth connection flow
- [ ] Webhook receiver for real-time activity sync
- [ ] Activity processing and metrics calculation
- [ ] Historical backfill implementation

## Day 14: Production Deployment & Optimization

### Morning: Performance Optimization

```typescript
// Performance optimizations
// hooks/optimizedQueries.ts
export const useOptimizedAthleteMetrics = (athleteId: string) => {
  return useQuery({
    queryKey: ['athlete-metrics', athleteId],
    queryFn: async () => {
      const metrics = await trainingService.getAthleteMetrics(athleteId)
      return {
        daily: metrics,
        weekly: groupByWeek(metrics),
        current: getCurrentMetrics(metrics)
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 3
  })
}

// Real-time subscriptions
export const useRealtimeWorkouts = (athleteId: string) => {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const supabase = createClient()
    
    const subscription = supabase
      .channel(`workouts:${athleteId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workouts_actual',
          filter: `athlete_id=eq.${athleteId}`
        },
        (payload) => {
          queryClient.invalidateQueries(['workouts', athleteId])
          
          if (payload.eventType === 'INSERT') {
            showToast({
              type: 'success',
              title: 'New Workout Synced',
              message: 'Activity imported from Strava'
            })
          }
        }
      )
      .subscribe()
      
    return () => {
      supabase.removeChannel(subscription)
    }
  }, [athleteId, queryClient])
}

// Image optimization for charts
export const ChartImage = ({ data, type }: Props) => {
  const [imageUri, setImageUri] = useState<string>()
  
  useEffect(() => {
    const generateChart = async () => {
      const chart = createChart(data, type)
      const uri = await chart.toBase64Image()
      setImageUri(uri)
    }
    
    generateChart()
  }, [data, type])
  
  if (!imageUri) return <Skeleton height={200} />
  
  return <Image source={{ uri: imageUri }} style={{ height: 200 }} />
}
```

### Production Build Configuration

```typescript
// app.config.ts
export default {
  expo: {
    name: "TrexAI",
    slug: "trex-ai",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#0A0A0A"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.company.trexai"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#0A0A0A"
      },
      package: "com.company.trexai"
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro"
    },
    plugins: [
      "expo-router",
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#FAFAFA"
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "your-project-id"
      }
    }
  }
}

// eas.json
{
  "cli": {
    "version": ">= 7.8.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "production-url",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "production-key"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Monitoring & Analytics

```typescript
// services/analytics.ts
import * as Sentry from '@sentry/react-native'
import { Analytics } from '@vercel/analytics/react'

export const initializeMonitoring = () => {
  // Error tracking
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    environment: __DEV__ ? 'development' : 'production',
    tracesSampleRate: 0.1
  })
  
  // Performance monitoring
  if (!__DEV__) {
    Sentry.addGlobalEventProcessor((event) => {
      if (event.type === 'transaction') {
        // Filter out noisy transactions
        if (event.transaction?.includes('Navigation')) {
          return null
        }
      }
      return event
    })
  }
}

// Track key events
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  if (__DEV__) {
    console.log('📊 Analytics:', event, properties)
    return
  }
  
  // PostHog tracking
  posthog.capture(event, properties)
}

// Key events to track
export const AnalyticsEvents = {
  WORKOUT_PLANNED: 'workout_planned',
  STRAVA_CONNECTED: 'strava_connected',
  COMMENT_ADDED: 'comment_added',
  CHART_VIEWED: 'chart_viewed',
  PERSONAL_BEST: 'personal_best_achieved'
}
```

### Afternoon: Final Testing & Deployment

```bash
# Build and deployment scripts
# scripts/deploy.sh
#!/bin/bash

echo "🚀 Starting deployment process..."

# Run tests
echo "Running tests..."
npm run test

# Type check
echo "Type checking..."
npm run type-check

# Build web
echo "Building web app..."
npx expo export --platform web

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel deploy --prod

# Build mobile apps
echo "Building mobile apps..."
eas build --platform all --non-interactive

echo "✅ Deployment complete!"
```

**Testing Checklist:**
```typescript
// E2E test scenarios
describe('Production Acceptance Tests', () => {
  test('Complete user flow', async () => {
    // 1. Login with Google
    await loginWithGoogle()
    
    // 2. Connect Strava
    await connectStrava()
    
    // 3. View synced workouts
    await waitForWorkoutsToSync()
    expect(screen.getByText('Recent Workouts')).toBeVisible()
    
    // 4. Plan a workout
    await planWorkout({
      discipline: 'run',
      duration: 60,
      notes: 'Easy aerobic run'
    })
    
    // 5. Add comment
    await addComment('Great session today!')
    
    // 6. View metrics
    await navigateToMetrics()
    expect(screen.getByText('CTL')).toBeVisible()
  })
  
  test('Coach workflow', async () => {
    await loginAsCoach()
    await viewAthleteProgress()
    await createWeeklyPlan()
    await sendMessageToAthlete()
  })
  
  test('Offline functionality', async () => {
    await goOffline()
    await viewCachedWorkouts()
    await planWorkoutOffline()
    await goOnline()
    await waitForSync()
  })
})
```

**Performance Validation:**
- [ ] Page load times < 2.5s on 3G
- [ ] Chart rendering < 500ms
- [ ] Strava sync < 3 minutes end-to-end
- [ ] Bundle size < 10MB for mobile

**Production Deployment:**
```bash
# Web deployment
npm run build:web
vercel deploy --prod

# Mobile builds
eas build --platform ios --profile production
eas build --platform android --profile production

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

**Deliverables:**
- [ ] Production-ready web app deployed
- [ ] Mobile apps built and submitted
- [ ] Monitoring and analytics configured
- [ ] Performance optimized and validated

## Success Criteria

### ✅ Phase 4 Complete When:
1. **MVP Acceptance Criteria Met**
   - All athletes can sign in, connect Strava, view plans
   - Strava workouts sync within 3 minutes P95
   - Coach can plan, comment, receive weekly digest
   - AI summaries generated automatically
   - Push notifications working on mobile

2. **Production Quality**
   - Error rates < 1%
   - Performance targets met
   - Security audit passed
   - Monitoring dashboards operational

3. **Deployment Successful**
   - Web app live and accessible
   - Mobile apps approved and published
   - Backend scaling handles initial load
   - Documentation complete

## Final MVP Validation

### Core User Journeys
```typescript
// Athlete journey
1. Sign up with Google ✅
2. Connect Strava account ✅  
3. View synced training history ✅
4. See weekly plan from coach ✅
5. Receive workout reminders ✅
6. View performance trends ✅
7. Comment on workouts ✅
8. Chat with coach ✅

// Coach journey  
1. Sign up and get assigned role ✅
2. View athlete dashboard ✅
3. Plan weekly workouts ✅
4. Monitor athlete compliance ✅
5. Review completed workouts ✅
6. Add feedback and comments ✅
7. Receive weekly digest ✅
8. Clone training plans ✅
```

### Technical Validation
- [ ] Database migrations successful
- [ ] RLS policies protecting data correctly
- [ ] Strava webhooks receiving events
- [ ] AI summaries generating within 20s
- [ ] Real-time updates working via Supabase
- [ ] Push notifications delivering
- [ ] Charts rendering on all screen sizes
- [ ] Offline mode functional
- [ ] Export/backup working

---

**Estimated Effort**: 16 hours (2 days × 8 hours)  
**Risk Level**: High (external integrations, production deployment)  
**Dependencies**: Phases 1-3 completed, accounts configured

*After Phase 4, you'll have a production-ready TrainingPeaks-style platform with real Strava integration, serving athletes and coaches with a beautiful, functional training management system.*