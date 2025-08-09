# Phase 1: Foundation & UI System

**Duration**: Days 1-4  
**Focus**: Project scaffold, design system, core navigation, authentication UI  
**Backend**: None (mock auth states)

## Objectives

- ✅ Expo app running on web (mobile not yet verified)
- ✅ Tamagui design system configured with monochrome theme
- ✅ Expo Router navigation structure
- ✅ Authentication flow UI (mock only; onboarding placeholder)
- ✅ Basic screen layouts for all main sections
- ✅ TypeScript setup with proper types (strict mode + `@/*` alias)

## Day 1: Project Setup & Design System

### Morning: Project Scaffold
```bash
# Create Expo app with TypeScript
npx create-expo-app@latest trex-ai --template blank-typescript

# Setup pnpm workspace (if not using existing)
cd trex-ai
pnpm init
mkdir -p packages/{ui,shared,config}

# Install core dependencies
npx expo install expo-router expo-linking expo-constants expo-status-bar
pnpm add @tamagui/core @tamagui/config @tamagui/animations-react-native
pnpm add -D @tamagui/vite-plugin
```

### Afternoon: Tamagui Configuration
```typescript
// tamagui.config.ts
export const config = createTamagui({
  themes: {
    dark: {
      background: '#0A0A0A',
      panel: '#111111',
      surface: '#161616',
      border: '#262626',
      textPrimary: '#FAFAFA',
      textSecondary: '#D4D4D4',
      muted: '#A3A3A3',
      disabled: '#737373',
      divider: '#2E2E2E',
    }
  },
  tokens,
  fonts,
  // ... rest of config
})
```

**Deliverables:**
- [x] Expo app with Tamagui provider (`app/_layout.tsx`)
- [x] Monochrome theme tokens defined (`tamagui.config.ts`)
- [x] Basic component library started (`components/ui/*`)
- [x] TypeScript strict mode enabled (`tsconfig.json`)

## Day 2: Navigation & Screen Structure

### Morning: Expo Router Setup
```
app/
├── (auth)/
│   ├── login.tsx
│   └── onboarding.tsx
├── (app)/
│   ├── _layout.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx        # Dashboard/Home
│   │   ├── calendar.tsx     # Training Calendar
│   │   ├── workouts.tsx     # Workout History
│   │   └── profile.tsx      # Settings/Profile
│   ├── workout/
│   │   └── [id].tsx         # Workout Detail
│   └── coach/
│       ├── dashboard.tsx    # Coach Multi-Athlete View
│       └── athlete/
│           └── [id].tsx     # Individual Athlete View
└── _layout.tsx              # Root Layout
```

### Afternoon: Core Components
```typescript
// components/ui/
├── Button.tsx              # Primary/Secondary/Ghost variants
├── Card.tsx                # Workout cards, metric tiles
├── Typography.tsx          # Text components with theme
├── Layout.tsx              # Screen containers
├── LoadingSpinner.tsx      # Loading states
└── TabBar.tsx              # Custom tab navigation
```

**Deliverables:**
- [x] Complete screen structure with Expo Router (`app/(auth)`, `app/(app)/(tabs)`, `app/(app)/workout/[id]`, `app/(app)/coach/*`)
- [x] Tab navigation between main sections (Home, Calendar, Activities, Profile)
- [x] Basic screen layouts with placeholder content (Dashboard, Profile, Coach views)
- [x] Core UI components with Tamagui styling (Button, Card, Typography, Layout, Spinner)

## Day 3: Authentication Flow & State Management

### Morning: Mock Authentication
```typescript
// providers/AuthProvider.tsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<'athlete' | 'coach' | 'master'>('athlete')
  
  // Mock sign in/out functions
  const signIn = async (email: string) => {
    // Simulate auth flow
    const mockUser = MOCK_USERS.find(u => u.email === email)
    setUser(mockUser)
    setRole(mockUser.role)
  }
  
  return (
    <AuthContext.Provider value={{ user, role, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### Afternoon: Screen Protection & Navigation
```typescript
// hooks/useAuth.ts
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

// app/_layout.tsx - Root protection
export default function RootLayout() {
  const { user } = useAuth()
  
  if (!user) {
    return <Redirect href="/(auth)/login" />
  }
  
  return <Slot />
}
```

**Deliverables:**
- [x] Mock authentication provider (`providers/AuthProvider.tsx`) and hook (`hooks/useAuth.ts`)
- [ ] Login/signup screens with form validation (login minimal; onboarding placeholder)
- [ ] Role-based navigation (coach vs athlete) — not conditionally switching layouts yet
- [x] Protected routes and redirects (`app/(app)/_layout.tsx`)

## Day 4: Core Screen Layouts & Polish

### Morning: Dashboard Layouts
```typescript
// app/(app)/(tabs)/index.tsx - Athlete Dashboard
export default function Dashboard() {
  return (
    <ScrollView>
      <YStack space="$4" padding="$4">
        {/* Quick Stats */}
        <XStack space="$4">
          <MetricCard title="This Week" value="8.5h" subtitle="Training Time" />
          <MetricCard title="TSB" value="-12" subtitle="Freshness" />
        </XStack>
        
        {/* Upcoming Workouts */}
        <Card>
          <H3>Today's Training</H3>
          <WorkoutPreview />
        </Card>
        
        {/* Recent Activity */}
        <Card>
          <H3>Recent Workouts</H3>
          <WorkoutList limit={3} />
        </Card>
      </YStack>
    </ScrollView>
  )
}
```

### Afternoon: Component Polish & Responsiveness
```typescript
// components/MetricCard.tsx
export const MetricCard = ({ title, value, subtitle, trend }: Props) => {
  return (
    <Card 
      flex={1} 
      padding="$4"
      backgroundColor="$surface"
      borderColor="$border"
    >
      <YStack space="$2">
        <Text color="$textSecondary" fontSize="$3">{title}</Text>
        <Text color="$textPrimary" fontSize="$8" fontWeight="bold">
          {value}
        </Text>
        <Text color="$muted" fontSize="$2">{subtitle}</Text>
      </YStack>
    </Card>
  )
}
```

**Deliverables:**
- [ ] Complete dashboard layouts for athlete/coach (placeholders present)
- [ ] Responsive design working on mobile and web
- [ ] Consistent spacing and typography
- [x] Mock data displays correctly (Activities + Calendar wired to mock data)

## Mock Data Structure

```typescript
// data/mockUsers.ts
export const MOCK_USERS = [
  {
    id: '1',
    email: 'athlete@example.com',
    name: 'Sarah Johnson',
    role: 'athlete',
    sport: 'triathlon',
    timezone: 'America/New_York'
  },
  {
    id: '2', 
    email: 'coach@example.com',
    name: 'Mike Torres',
    role: 'coach',
    athletes: ['1', '3', '4']
  }
]

// data/mockWorkouts.ts (generated data)
export const MOCK_WORKOUTS: MockWorkout[] = (() => { /* generates ~2–3 months around today */ })();
```

## Success Criteria

### ✅ Phase 1 Complete When:
1. **App Functionality**
   - Expo app runs smoothly on web (mobile to be verified)
   - Navigation works between all screens
   - No TypeScript errors

2. **Design System**
   - Monochrome theme applied consistently
   - All core components styled with Tamagui
   - Responsive layouts on different screen sizes

3. **Authentication Flow**
   - Login functional (minimal), signup/onboarding pending
   - Role-based navigation (athlete vs coach)
   - Mock users can switch between roles for testing

4. **Basic Layouts**
   - Dashboard shows placeholder content
   - Tab navigation feels native
   - Screen transitions are smooth

## Next Phase Preparation

### Mock Data Requirements for Phase 2
- 3+ months of training history per athlete
- Variety of disciplines (run, bike, swim, strength)
- Realistic metric progressions (TSS, CTL/ATL/TSB)
- Performance benchmarks and personal bests

### Component Extensions Needed (Phase 2)
- Chart components for metrics visualization
- Calendar component for training planning
- Workout detail views
- Progress tracking displays

## Implementation Notes
- Router typed routes enabled in `app.json` experiments
- Babel plugins: only `react-native-reanimated/plugin` (no `expo-router/babel` in SDK 50+)
- Icons and splash configured under `assets/images/*` referenced in `app.json`

---

**Estimated Effort**: 32 hours (4 days × 8 hours)  
**Risk Level**: Low (well-established tools and patterns)  
**Dependencies**: None

*After Phase 1, you'll have a solid foundation that feels like a real app, ready for rich training data in Phase 2.*