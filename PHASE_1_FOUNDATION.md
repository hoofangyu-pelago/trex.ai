# Phase 1: Foundation & Core Infrastructure
**Duration**: Days 1-4  
**Goal**: Establish the basic platform with authentication, database, and Strava integration  
**Deliverable**: Users can sign in, connect Strava, and see basic workout data

## Success Criteria
- [ ] Authentication working with Google SSO
- [ ] Strava OAuth connection functional  
- [ ] Basic workout data flowing from Strava
- [ ] Monochrome UI implemented and responsive
- [ ] Mobile and web apps building successfully

## Features Included

### 5.1 Authentication & Accounts
- Google SSO via Supabase Auth
- Role assignment system (Master/Coach/Athlete)
- First user auto-assigned as Master
- JWT claims include role and team_id

**Implementation Details**:
- Single `teams` row created on first run
- Master can assign roles via basic Admin UI
- Athletes invited by email or seeded by Master
- Role changes logged to `audit_log`

### 5.2 Strava Integration (Core)
- OAuth connect/disconnect per athlete
- Token storage and auto-refresh
- Historical backfill (last 12 months, resumable)
- Webhook receiver for real-time activity updates
- Basic activity ingestion and storage

**Implementation Details**:
- OAuth scopes: `read`, `activity:read_all`
- Backfill with resumable cursor, rate-limit aware
- Webhook verification with environment tokens
- Idempotency via `strava_activity_id` upserts
- Deep linking for mobile OAuth flow

### 5.4 Workout Ingestion & Storage (Basic)
- Store activities with summary metrics
- Discipline mapping (run, ride, swim, strength, mobility, unknown)
- De-duplication by `strava_activity_id`
- Basic polyline and device field storage

### Database Schema & Infrastructure
**Core Tables**:
- `users` (id, auth_id, role, team_id, timezone, created_at)
- `teams` (id, name, created_at)
- `athlete_profile` (user_id, team_id, strava_connected, strava_athlete_id)
- `workouts_actual` (id, team_id, athlete_id, strava_activity_id, date, discipline, summary_json, source)
- `audit_log` (id, team_id, entity, entity_id, action, actor_id, before_json, after_json, created_at)
- `jobs_dlq` (id, team_id, type, payload_json, error, attempts, created_at)

**Row Level Security**:
- All tables scoped by team_id
- Athletes: read/write own rows only
- Coach: access assigned athletes (placeholder for Phase 3)
- Master: bypass all policies

### Technical Architecture Setup
- Next.js 14 App Router project structure
- Capacitor mobile wrapper configured
- Turborepo monorepo layout:
  - `apps/web` — Next.js web app  
  - `apps/mobile` — Capacitor mobile wrapper
  - `packages/ui` — shared shadcn/ui components
  - `packages/database` — Supabase schema and types
  - `packages/shared` — shared utilities and types

### UI/UX Foundation
**Design System Implementation**:
- Monochrome color palette (black/white/gray only)
- Core design tokens defined
- shadcn/ui components configured
- Responsive layouts for web and mobile
- Basic navigation structure

**Design Tokens**:
```
Colors:
- background: #0A0A0A
- panel: #111111 
- surface: #161616
- border: #262626
- textPrimary: #FAFAFA
- textSecondary: #D4D4D4
- muted: #A3A3A3
```

### Basic UI Components
- Authentication flow (sign in/out)
- Strava connection interface
- Basic workout list view
- Simple navigation (web and mobile)
- Loading states and error handling

## APIs Implemented
- `POST /auth/ssologin` (Supabase hosted)
- `GET/POST /api/strava/connect` (OAuth flow)
- `POST /api/strava/webhook` (activity updates)
- `GET /api/workouts` (basic list)

## Data Flow
1. User signs in with Google → Supabase Auth
2. User connects Strava → OAuth flow → token storage
3. Historical backfill starts → activities stored in `workouts_actual`
4. Webhooks receive new activities → real-time updates
5. Basic workout list shows recent activities

## Testing & Validation
- [ ] Google SSO flow works on web and mobile
- [ ] Strava OAuth completes and stores tokens
- [ ] Historical backfill processes activities
- [ ] Webhooks receive and process new activities  
- [ ] UI renders consistently across devices
- [ ] Rate limiting and error handling functional

## Technical Debt & Future Considerations
- Metrics computation deferred to Phase 2
- Planning features deferred to Phase 3
- AI features deferred to Phase 4
- Admin UI minimal (expanded in Phase 4)

## Environment Setup Requirements
- Supabase project configured
- Strava app registered with OAuth URLs
- Vercel deployment configured  
- Mobile build tools setup (Xcode/Android Studio)
- Environment variables configured

## Acceptance Criteria
1. New user can sign in with Google and see empty dashboard
2. User can connect Strava and see historical backfill progress
3. New Strava workout appears in app within 5 minutes
4. Mobile app builds and deploys successfully
5. Basic error handling works (network failures, auth errors)
6. UI follows monochrome design consistently

## Phase 1 Complete When:
- Authentication flow is bulletproof
- Strava data is flowing reliably 
- Basic UI is responsive and accessible
- Foundation is ready for metrics engine (Phase 2)