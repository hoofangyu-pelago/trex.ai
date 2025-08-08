# Phase 3: Coach Tools & Collaboration  
**Duration**: Days 9-11  
**Goal**: Enable coaching workflow with planning, feedback, and communication tools  
**Deliverable**: Complete coach-athlete interaction with planning, comments, and notifications

## Success Criteria
- [ ] Weekly calendar with drag-drop planning (web) and mobile CRUD
- [ ] Plan ↔ actual linking with compliance scoring
- [ ] Comments and one-to-one chat functional
- [ ] Push notifications working on mobile
- [ ] Coach can manage multiple athletes efficiently

## Features Included

### 5.3 Calendar & Planning (Complete)
**Weekly Calendar View**:
- Web: drag-and-drop workout planning
- Mobile: add/edit/delete planned workouts  
- Multi-athlete view for coaches
- Clone week functionality (per athlete and bulk)

**Planned Workout Structure**:
- Discipline, target duration/distance
- Intensity/IF targets (optional)
- Structured workout JSON (placeholder)
- Notes and coaching instructions

**Auto-Linking System**:
- Match activities to plans by date/discipline/time window
- ±12h tolerance around planned time
- Compliance scoring based on duration/distance/intensity
- Manual override capability with audit logging

**Implementation Details**:
- Calendar uses athlete's local timezone
- Drag-drop creates/updates `workouts_planned` records
- Auto-link runs on activity ingest with configurable rules
- Clone operations copy week structure across date ranges

### 5.7 Comments & Chat (Complete)
**Per-Workout Comments**:
- Threaded comments on planned and actual workouts
- @mentions for coach/athlete notifications
- Emoji reactions for quick feedback
- Real-time updates via Supabase Realtime

**One-to-One Chat**:
- Dedicated chat thread per coach-athlete pair
- Read receipts and typing indicators
- Message history and search
- File/image sharing (Phase 4 enhancement)

**Implementation Details**:
- Deterministic thread creation: one per `(team_id, coach_id, athlete_id)`
- Real-time presence via Supabase channels
- Message read status tracking per user
- Typing indicators with short TTL (ephemeral)

### 5.8 Notifications (Complete)
**Notification Types**:
- Planned workout reminder (T-12h, configurable)
- Overdue workout nudge (T+6h after planned time)
- Coach feedback on workouts (immediate)
- PB achievements (immediate, to athlete and coach)
- Weekly digest (Sunday 18:00 coach local time)

**Smart Scheduling**:
- Athlete notifications in athlete's local timezone
- Quiet hours respected (22:00-07:00 default, configurable)
- Deduplication within 12-hour windows
- DST and travel timezone handling

**Implementation Details**:
- Native push via Capacitor for mobile
- In-app toasts for web
- Retry logic: 1m → 5m → 15m (max 3 attempts)
- Failed notifications logged to `jobs_dlq`

### Enhanced Database Schema
**New Tables**:
- `workouts_planned` (id, team_id, athlete_id, date, discipline, targets_json, structure_json, notes, created_by)
- `workout_links` (team_id, planned_id, actual_id, compliance_score)
- `comments` (id, team_id, entity_type, entity_id, author_id, text, created_at)
- `threads` (id, team_id, type, coach_id, athlete_id, created_at)
- `messages` (id, team_id, thread_id, from_user_id, to_user_id, text, created_at, read_at)
- `coach_athletes` (team_id, coach_id, athlete_id, assigned_at, assigned_by)
- `notifications` (id, team_id, user_id, type, payload_json, scheduled_at, sent_at, read_at)
- `user_push_tokens` (id, user_id, token, platform, updated_at)

### Compliance Scoring System
**Scoring Formula** (0-100):
- Duration weight: 40%
- Distance weight: 30% 
- Intensity/IF weight: 30%
- Penalties for missed or significantly over/under-shot targets

**Implementation**:
```javascript
function calculateCompliance(planned, actual) {
  const durationError = Math.abs(actual.duration - planned.duration) / planned.duration;
  const distanceError = Math.abs(actual.distance - planned.distance) / planned.distance;
  const intensityError = Math.abs(actual.if - planned.if) / planned.if;
  
  // Truncate errors at 100%
  const truncatedErrors = [durationError, distanceError, intensityError].map(e => Math.min(e, 1.0));
  
  const score = Math.max(0, Math.round(100 * (1 - 0.4*truncatedErrors[0] - 0.3*truncatedErrors[1] - 0.3*truncatedErrors[2])));
  return score;
}
```

### Coach Multi-Athlete Interface
**Coach Dashboard**:
- Multi-athlete calendar view (week/month)
- Quick athlete switcher
- Bulk operations (clone week to multiple athletes)
- Team-level analytics and trends
- Notification center for athlete activity

**Workflow Optimization**:
- Recent comments feed across all athletes
- Flagged workouts needing attention
- Compliance alerts for missed/poor sessions
- Batch comment/feedback operations

### Real-Time Features
**Live Updates**:
- New workout ingestion appears immediately
- Comments/chat updates in real-time
- Typing indicators in chat
- Online/offline presence status
- Push notification badges

**Conflict Resolution**:
- Latest-wins for concurrent edits
- Audit trail for all changes
- Clock skew detection and warnings
- Optimistic UI updates with rollback

## APIs Implemented
- `GET /api/calendar?athlete_id&week` (weekly calendar data)
- `POST /api/plans` (create/update planned workouts)
- `POST /api/plans/clone` (clone week operations)
- `GET /api/workouts/:id` (workout detail with comments)
- `POST /api/comments` (create comment/reaction)
- `GET /api/chat/:thread_id` (chat messages)
- `POST /api/chat/:thread_id` (send message)
- `POST /api/notifications/schedule` (manual notification)
- `GET /api/coach/athletes` (assigned athletes)

## UI Components Added
**Weekly Calendar**:
- Drag-and-drop interface (web)
- Touch-friendly planning (mobile)
- Compliance visual indicators
- Quick workout templates

**Chat Interface**:
- Message bubbles with read receipts
- Typing indicators
- @mention autocomplete
- Emoji picker and reactions

**Coach Dashboard**:
- Multi-athlete overview
- Recent activity feed
- Quick action buttons
- Notification management

**Planning Tools**:
- Workout builder with discipline templates
- Bulk operations interface
- Clone week wizard
- Compliance reporting

## Notification Implementation
**Push Token Management**:
- Register tokens on app start
- Platform-specific handling (iOS/Android)
- Token refresh and invalidation
- Multi-device support per user

**Scheduling System**:
- Vercel Cron for weekly digests
- Daily materialization of reminders
- Timezone-aware scheduling
- Quiet hours enforcement

**Delivery Pipeline**:
```javascript
// Notification flow
1. Event triggers notification (workout due, comment added, etc.)
2. Check user preferences and quiet hours
3. Schedule delivery at appropriate time
4. Send via Capacitor push notifications
5. Track delivery status and retry failures
6. Update notification read status
```

## Testing & Validation
- [ ] Calendar drag-drop works smoothly on desktop
- [ ] Mobile planning interface is intuitive
- [ ] Auto-linking matches 95%+ of planned workouts
- [ ] Comments appear immediately for both parties
- [ ] Push notifications delivered within 30 seconds
- [ ] Coach can efficiently manage 20+ athletes
- [ ] Compliance scores correlate with coaching intuition

## Offline Support (Mobile)
**Cached Data**:
- Current week calendar and plans
- Recent workout details and comments
- Chat message history (last 50 per thread)

**Offline Composition**:
- Draft comments and messages locally
- Queue planned workout changes
- Sync on reconnect with conflict resolution
- Offline indicator in UI

## Performance Considerations
- Calendar queries optimized for date ranges
- Real-time subscriptions scoped by athlete/coach
- Comment pagination for long threads
- Push token cleanup for inactive devices
- Notification deduplication and batching

## Coach Productivity Features
**Time-Saving Tools**:
- Workout templates and favorites
- Bulk comment on multiple workouts
- Quick clone operations
- Smart notification grouping
- Keyboard shortcuts (web)

**Coaching Insights**:
- Compliance trend reporting
- Athlete engagement metrics
- Response time tracking
- Training load distribution analysis

## Acceptance Criteria
1. Coach can plan a full week for an athlete in <5 minutes
2. Plan ↔ actual linking works automatically for 95% of workouts
3. Comments/chat feel responsive and real-time
4. Push notifications arrive promptly and respect quiet hours
5. Coach dashboard provides efficient multi-athlete oversight
6. Mobile planning workflow is smooth and intuitive

## Phase 3 Complete When:
- Coach-athlete workflow is fully functional
- Planning tools are efficient and intuitive
- Communication feels real-time and engaging
- Notifications enhance rather than overwhelm
- Foundation ready for AI and admin tools (Phase 4)