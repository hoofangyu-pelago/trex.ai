# Phase 1 TODO (Foundation & UI System)

This checklist reflects current status in `trex-ai/` based on `PHASE_1_FOUNDATION.md`.

## Overall Objectives
- [x] Expo app running on web (dev server builds; type-checks pass)
- [ ] Expo app running on mobile (iOS/Android) — not verified yet
- [x] Tamagui design system configured with monochrome theme (`tamagui.config.ts`)
- [x] Expo Router navigation structure (auth + app tabs + detail routes)
- [ ] Authentication flow UI (signup + validation) — login present, onboarding placeholder
- [x] Basic screen layouts for main sections (tabs + placeholders)
- [x] TypeScript strict mode enabled and clean build

### Newly Implemented Features
- Training Calendar screen with month/week (web) and day (mobile) views, navigation controls, and mock data integration (`components/calendar/*`, `data/mockCalendar.ts`)
- Activities tab with monthly summaries and workout list using mock data (`components/summary/MonthlySummaryCard.tsx`, `components/workouts/WorkoutListItem.tsx`, `data/mockWorkouts.ts`)
- Profile tab shows current user info and supports sign out (`app/(app)/(tabs)/profile.tsx`)
- Protected routes and redirects powered by mock auth context (`providers/AuthProvider.tsx`, `hooks/useAuth.ts`, `app/(app)/_layout.tsx`)
- Base UI system using Tamagui: `Button`, `Card`, `Typography`, `Layout`, `LoadingSpinner`
- Project config updates: strict TypeScript with path alias `@/*`, Expo Router typed routes enabled, Babel plugin configured for SDK 53+ (only `react-native-reanimated/plugin`)

## Day 1: Project Setup & Design System
- [x] Expo app with Tamagui provider (`app/_layout.tsx`)
- [x] Monochrome theme tokens defined (`tamagui.config.ts`)
- [x] Basic component library started (`components/ui`: Button, Card, Typography, Layout, Spinner)
- [x] TypeScript strict mode enabled (`tsconfig.json`)

## Day 2: Navigation & Screen Structure
- [x] Complete screen structure with Expo Router
  - `app/(auth)/login.tsx`, `app/(auth)/onboarding.tsx`
  - `app/(app)/(tabs)/{index,calendar,workouts,profile}.tsx`
  - `app/(app)/workout/[id].tsx`, `app/(app)/coach/{dashboard,athlete/[id]}.tsx`
- [x] Tab navigation between main sections (Home, Calendar, Workouts, Profile)
- [x] Basic screen layouts with placeholder content
- [x] Core UI components with Tamagui styling (tabs using Tamagui primitives)

## Day 3: Authentication Flow & State Management
- [x] Mock authentication provider (`providers/AuthProvider.tsx`, `hooks/useAuth.ts`)
- [ ] Login/signup screens with form validation (login has no validation; signup is placeholder)
- [ ] Role-based navigation (athlete vs coach views) — not conditionally switching layouts yet
- [x] Protected routes and redirects (`app/(app)/_layout.tsx`)

## Day 4: Core Screen Layouts & Polish
- [ ] Complete dashboard layouts for athlete and coach (currently placeholders)
- [ ] Responsive design on mobile & web (no Tamagui responsive props in use yet)
- [ ] Consistent spacing and typography (not yet applied across all screens)
- [x] Mock data displays correctly (Calendar + Activities wired to mock data)

## Mock Data & Utilities
- [x] `data/mockUsers.ts` (athlete & coach)
- [x] `data/mockWorkouts.ts` (basic example)
- [ ] Additional mock data for richer Phase 2 prep (3+ months, variety, metrics)
  - Note: partial coverage implemented — generated ~2–3 months with duration/distance/load

---

## Actionable TODOs
- [x] Create `components/ui/` with Tamagui-based components:
  - [x] `Button.tsx` (primary/secondary/ghost)
  - [x] `Card.tsx` (surface + border + padding)
  - [x] `Typography.tsx` (H1–H6, Text variants bound to tokens)
  - [x] `Layout.tsx` (screen containers with safe areas)
  - [x] `LoadingSpinner.tsx`
- [ ] Replace remaining `StyleSheet` usage with Tamagui primitives (`Stack`, `YStack`, `XStack`, `Text`, `Card`)
- [ ] Login form validation (email format, disabled state, error display)
- [ ] Implement signup/onboarding form UI
- [ ] Role-based navigation:
  - [ ] If `role === 'coach'` show coach dashboard route as default
  - [ ] Hide coach-only screens for athletes
- [ ] Wire mock data:
  - [ ] Dashboard shows “Today’s Training” + recent workouts from `MOCK_WORKOUTS`
  - [x] Workouts tab lists recent workouts with simple cards
- [ ] Responsiveness & polish:
  - [ ] Use Tamagui `size`, `space`, and responsive props for mobile/web
  - [ ] Apply consistent spacing/typography tokens across screens
- [ ] Mobile verification:
  - [ ] iOS Simulator launch and sanity test
  - [ ] Android Emulator launch and sanity test

## Verification Notes
- TypeScript: `npx tsc --noEmit` — clean
- Lint: `npm run lint` — clean
- Dev server: `npm run web` — builds without runtime errors after token fixes
 - Router: typed routes enabled in `app.json`
 - Babel: only `react-native-reanimated/plugin` configured (no `expo-router/babel` in SDK 50+)

## References
- Theme & tokens: `tamagui.config.ts`
- Providers: `providers/AuthProvider.tsx`
- Routing: `app/_layout.tsx`, `app/(app)/_layout.tsx`, tabs in `app/(app)/(tabs)/`
- Mock data: `data/mockUsers.ts`, `data/mockWorkouts.ts`
 - Calendar: `components/calendar/` and `data/mockCalendar.ts`
 - Activities: `components/summary/MonthlySummaryCard.tsx`, `components/workouts/WorkoutListItem.tsx`