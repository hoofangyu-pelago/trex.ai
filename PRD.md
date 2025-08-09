## Internal Training Platform (TrainingPeaks‑style) — Product Requirements Document

Owner: You (Master/Admin)
Version: v1.0 (MVP)
Date: 2025‑08‑08

### 1) Overview
- Build an internal training planning and analysis platform for one coach and ~20 athletes, expandable.
- Web and mobile apps share one codebase. Focus on near real‑time ingest from Strava, weekly planning, performance analytics, and coach productivity.
- Visual direction: modern, futuristic, monochrome dark theme (black/white/gray only).

### 2) Goals and Non‑Goals
- Goals (MVP)
  - Coach can plan weeks, review device‑recorded workouts, leave feedback, and get AI summaries.
  - Athletes can view plans, connect Strava, receive notifications, and see progress (PBs, trends).
  - Near real‑time ingestion from Strava with computed metrics (TSS/IF, CTL/ATL/TSB) and compliance.
  - Simple chat/comments and weekly coach digest.
  - Admin visibility and basic audit trail.
- Non‑Goals (MVP)
  - Multi‑tenant organizations (single team only).
  - Non‑Strava device integrations (Garmin, Wahoo, etc.).
  - Advanced physio signals (HRV, sleep, readiness), BLE live recording.
  - Full WYSIWYG structured‑workout builder/export to ERG/ZWO.
  - Public sharing or external athlete onboarding flows.

### 3) Users and Roles
- Roles: Master/Admin (developer), Coach, Athlete.
- Relationships: One coach → many athletes; single team. Master can read/write all.
- Permissions (high‑level):
  - Athlete: View own data, connect Strava, comment, edit personal notes, edit thresholds/zones with coach approval.
  - Coach: View/edit plans for assigned athletes, comment, annotate, clone weeks, thresholds/zones edits.
  - Master: All permissions + admin/audit.

### 4) Success Metrics (MVP)
- Engagement (primary KPI):
  - Weekly active athletes ≥ 70%.
  - Coach weekly active days ≥ 4.
- Coach time saved: Weekly digest and per‑workout AI summaries reduce review time by ≥ 30% (qualitative initially).
- Sync reliability: ≥ 99% of Strava workouts ingested within 3 minutes; retries ensure eventual consistency within 1 hour.
- Onboarding: All current athletes onboarded within 1 month.

### 5) Scope (Functional Requirements)

5.1 Authentication & Accounts
- Google SSO via Supabase Auth.
- Role assignment at first sign‑in (Master assigns Coach/Athlete).
- Athlete connects Strava via OAuth.

Implementation details (build‑ready)
- First user to sign in on a fresh environment is auto‑assigned `Master`.
- Master assigns `Coach`/`Athlete` roles via Admin UI (see 5.10). Role changes are logged to `audit_log`.
- Athletes are invited by the Coach/Master (email link) or seeded by Master; on first sign‑in, they are bound to the pre‑created user row by email.

Seed & JWT claims (build‑ready)
- A single `teams` row is created on first run; all users belong to this default team for MVP.
- On sign‑in, JWT includes `role` and `team_id` claims; policies reference these claims directly.

5.2 Strava Integration
- OAuth connect/disconnect per athlete; store tokens securely; auto refresh.
- Historical backfill: fetch last 12 months on first connect (rate‑limit aware, resumable).
- Webhook receiver: subscribe to Strava events; fetch activity detail on create/update.
- Near real‑time ingest target: 1–3 minutes end‑to‑end.
 - OAuth scopes: `read`, `activity:read_all`.
 - OAuth redirect URL (per environment): `https://<domain>/api/strava/connect`.
 - Webhook callback URL (per environment): `https://<domain>/api/strava/webhook` with verification token.
 - Daily reconciliation job compares Strava activities to stored records to fill webhook gaps.

Implementation details (build‑ready)
- Backfill runs with a resumable cursor (last activity start_date) per athlete; persists progress; throttles to ≤80% of app quota with jitter; leaves ≥20% headroom for webhooks/UI.
- Rate‑limit handling: on HTTP 429, exponential backoff with ceiling at 15 minutes, then park job until next quota window; persist to `jobs_dlq` after 5 failed windows.
- Webhook verification: verification token stored in environment variables, rotated quarterly; challenge/response implemented per Strava docs; signature (if provided) checked in Next.js API routes.
- Idempotency & de‑duplication: upsert on `workouts_actual.strava_activity_id` (unique); webhook events use `event_id` idempotency keys to avoid double processing.
- Reconciliation job: daily scan compares Strava activity ids for the last 7 days against `workouts_actual`; fetches missing/updated; skips when `source='manual'`.

OAuth deep linking & final redirect (build‑ready)
- Web: after `strava-connect` completes, redirect to `/settings/connections` in the same session.
- Mobile: use app scheme `trexai://connections` and universal link `https://app.<domain>/connections` to return to the app.
- Configure Capacitor deep linking to support both scheme and universal links via capacitor.config.ts.

5.3 Calendar & Planning
- Weekly calendar view (web: drag‑drop; mobile: add/edit basic).
- Create, edit, delete planned workouts (discipline, target duration/distance, intensity/IF target optional, notes, structure JSON placeholder).
- Clone: copy week to another week (per athlete); coach can bulk clone across athletes.
- Link planned ↔ actual automatically by date/discipline/window, with manual override.

Auto‑link rules (MVP)
- Window: match activities to plans on the same calendar day in the athlete’s local timezone; allow ±12h tolerance around planned date for early/late starts.
- Discipline: exact match preferred; if Strava discipline maps to `unknown`, allow manual override only.
- Tie‑breakers: choose the actual with the closest start time to planned; if multiple remain, pick higher duration proximity; finally lowest `id`.
- One‑to‑many: one planned links to at most one actual; surplus actuals remain unlinked until manually linked.
- Manual override: coach/athlete can re‑link; change is logged to `audit_log`.

5.4 Workout Ingestion & Storage
- Persist activities with summary metrics, laps/intervals when available, route polyline, device fields.
- Discipline mapping: run, ride, swim, strength, mobility (other → unknown).
- De‑dupe by `strava_activity_id`.

5.5 Metrics & Analytics
- Per‑workout: compute IF, TSS, hrTSS/rTSS/sTSS where possible; fallbacks when limited fields.
- Daily rollups: total TSS, duration, distance; compute CTL (42‑day EWMA), ATL (7‑day EWMA), TSB (CTL‑ATL).
- Compliance score (0–100): compare planned vs actual (duration, distance, IF); weight by discipline.
- Dashboards: athlete trends (load, CTL/ATL/TSB), PBs, weekly overview; team‑level rollups.

5.6 Personal Bests (PBs)
- Detect and store PBs at ingest:
  - Run: 1k/5k/10k/best pace windows, longest distance.
  - Ride: 1/5/20/60‑min best power (if power available), longest ride.
  - Swim: 100/400/1500m best pace, longest distance.
- PB panel on mobile; PB badges on web.

5.7 Comments & Chat
- Per‑workout comments with mentions (coach/athlete) and emoji reactions.
- One‑to‑one chat thread per athlete with coach.
- Read receipts and typing indicator (lightweight).

Thread model (build‑ready)
- Create a deterministic one‑to‑one thread per coach–athlete pair in `threads` (see 8.1). `messages.thread_id` references this.
- Read receipts: `messages.read_at` is per‑message; sender cannot modify after write; receiver updates upon read.
 - Typing indicator/presence: Supabase Realtime presence channels per thread; ephemeral `typing` state broadcast with short TTL (no persistence).

5.8 Notifications
- Push: planned workout reminder (T‑12h configurable), overdue nudge (T+6h), coach feedback, PB achieved, weekly digest.
- In‑app toasts for web.
 - Timezone rules: athlete‑facing notifications are scheduled in the athlete’s local timezone with quiet hours respected (default 22:00–07:00 local → defer to 07:00); coach weekly digest is sent in the coach’s local timezone.

Scheduling & quiet hours (build‑ready)
- Quiet hours spanning midnight are respected: notifications scheduled between 22:00–07:00 local are deferred to 07:00 same/next day.
- Deduplication: identical notification `type+payload_hash` suppressed within a 12‑hour window per user.
- Delivery: Native push notifications via Capacitor; retries at 1m → 5m → 15m (max 3). Failures recorded in `notifications.sent_at` null with error stored in `jobs_dlq`.
- Scheduler: Vercel Cron triggers weekly digests; per‑athlete reminders/overdues are materialized daily and scheduled with per‑user local time application.
- Travel/DST: all schedules recomputed daily using the user’s current `timezone`.

5.9 AI Summaries
- Per‑workout summary generated on ingest: highlights, compliance, suggestions.
- Weekly coach digest auto‑sent Sunday evening per athlete: load/TSB trend, PBs, anomalies, coaching notes summary.
- Token guardrails and caching; allow regeneration.

Guardrails (build‑ready)
- Default models: per‑workout uses `gpt-4o-mini` class; weekly digest uses the same unless overridden by `MASTER` in Admin.
- Budgets: per‑workout max 1,200 output tokens; weekly digest max 2,000. Hard timeouts at 20s.
- Caching key: `model_version + activity_id (or week_start) + thresholds_version + prompts_version`.
- Redaction: strip emails, device ids, and raw GPS coordinates from prompts; round times/distances where not needed.
- Regenerate limits: max 5 regenerations per workout per day per user; audit every generation.

5.10 Admin & Audit
- Master dashboard: user list, connections status, webhook/event log, failed jobs, dead‑letter queue.
- Audit log: changes to workouts (planned), thresholds/zones.
- Export: JSON/CSV of workouts and metrics (per athlete / team).

DLQ & retries (build‑ready)
- Only `Master` can retry DLQ jobs from the Admin UI. Each retry increments attempt count; backoff schedule is re‑applied.
- Max attempts per job: 5. After that, mark `permanently_failed` and require manual intervention.
- Sensitive payload fields (tokens, secrets) are redacted at write; raw errors retained.

5.11 Offline (Mobile)
- Read: calendar and recent details cached.
- Compose: draft comments/notes offline; sync on reconnect with conflict resolution (latest‑wins + audit).

Conflict resolution (build‑ready)
- Latest‑wins uses server timestamps: upon sync, if remote `updated_at` > local last base, keep remote and store local as a new version in `audit_log`.
- Clock skew: clients fetch server time on session start and periodically; deltas >2 minutes trigger warning banner.
- Merge granularity: record‑level for MVP (no field‑level merges). UI shows "Edited elsewhere" on conflicts.

### 6) UX/UI Requirements
- Monochrome design only (black/white/gray). No color accents. Use shape, weight, and motion for status.
- Glassy dark surfaces, subtle depth, high contrast text. Focus rings use white glow.
- Motion: 120–180ms ease‑out micro‑interactions; spring on drag‑drop; reduced‑motion mode.
- Accessibility: AA contrast for primary text; visible focus for keyboard users; scalable typography.

Design Tokens (initial)
- Colors
  - background: #0A0A0A
  - panel: #111111 (with blur on web)
  - surface: #161616
  - border: #262626
  - textPrimary: #FAFAFA
  - textSecondary: #D4D4D4
  - muted: #A3A3A3
  - disabled: #737373
  - divider: #2E2E2E
- Chart palette (strokes): #E5E5E5, #CFCFCF, #9F9F9F, #6B6B6B with varied thickness/dash.

Signature Components
- Weekly calendar with heat‑map tint via grayscale; drag‑drop (web), long‑press plan (mobile).
- Workout card with discipline iconography (shape) and compliance ring glow in white.
- Metrics tiles with subtle animated grayscale gradients.
- Dark charts with thin neon‑white bloom on peaks (grayscale only).

### 7) Technical Architecture (MVP)
- Client: Next.js 14 (App Router) + Capacitor for mobile; shadcn/ui components; TanStack Query; localStorage/IndexedDB for cache; native push notifications; Charts via Recharts; Motion via Framer Motion.
- Backend: Supabase (Postgres, Auth, Storage, Realtime) + Next.js API routes for complex logic.
- Integrations: Strava OAuth + webhooks.
- AI: OpenAI API (per‑workout summary + weekly digest), configurable model tier.
- Hosting: Vercel for web; Capacitor builds for iOS/Android via Xcode Cloud/GitHub Actions.

Implementation choices (build‑ready)
- Router: Next.js App Router with file‑system routing and built‑in API routes.
- Web target: Static export with API routes for dynamic features; progressive enhancement.
- UI Framework: shadcn/ui with Tailwind CSS for consistent design system.
- State Management: TanStack Query for server state; Zustand for client state.
- Type Safety: TypeScript throughout; generated types from Supabase.
- Package Manager: pnpm for fast, efficient dependency management.
- Monorepo layout (Turborepo):
  - `apps/web` — Next.js web app
  - `apps/mobile` — Capacitor mobile wrapper
  - `packages/ui` — shared shadcn/ui components
  - `packages/database` — Supabase schema, migrations, types
  - `packages/shared` — shared utilities, types, API clients

Modern Stack Benefits
- Single codebase: Next.js + Capacitor allows sharing 95%+ code between web/mobile.
- Fast setup: `npx create-turbo@latest` + `npx shadcn-ui@latest init` gets you started in minutes.
- Type safety: End-to-end TypeScript with generated database types.
- Developer experience: Hot reload, fast builds, excellent debugging.
- Production ready: Vercel deployment, Capacitor app store builds, all battle-tested.

Quick Setup Guide
```bash
# 1. Initialize Turborepo
npx create-turbo@latest trex-ai

# 2. Setup Next.js web app
cd trex-ai/apps/web
npx shadcn@latest init

# 3. Setup Supabase
npx supabase init
npx supabase start

# 4. Setup mobile app
cd ../mobile
npm create @capacitor/app

# 5. Install dependencies and start dev
cd ../..
pnpm install
pnpm dev
```

Reliability Targets
- Latency: ingest → metrics/summary visible within 1–3 minutes.
- Availability: 99.5%.
- Backoff/retry and dead‑letter queue for webhook failures.

### 8) Data Model (high‑level)
- users (id, auth_id, role, team_id, timezone, created_at)
- teams (id, name, created_at)
- athlete_profile (user_id, team_id, discipline_prefs, strava_connected, strava_athlete_id)
- thresholds_zones (id, team_id, athlete_id, discipline, method, values_json, effective_from)
- workouts_planned (id, team_id, athlete_id, date, discipline, targets_json, structure_json, notes, created_by)
- workouts_actual (id, team_id, athlete_id, strava_activity_id, date, discipline, summary_json, laps_json, polyline, source)
- workout_links (team_id, planned_id, actual_id, compliance_score)
- metrics_daily (team_id, athlete_id, date, tss, ctl, atl, tsb, duration_min, distance_km)
- pbs (id, team_id, athlete_id, discipline, metric, value, unit, date, source_id)
- comments (id, team_id, entity_type, entity_id, author_id, text, created_at)
- threads (id, team_id, type, coach_id, athlete_id, created_at)
- messages (id, team_id, thread_id, from_user_id, to_user_id, text, created_at, read_at)
- coach_athletes (team_id, coach_id, athlete_id, assigned_at, assigned_by)
- audit_log (id, team_id, entity, entity_id, action, actor_id, before_json, after_json, created_at)
- notifications (id, team_id, user_id, type, payload_json, scheduled_at, sent_at, read_at)
- jobs_dlq (id, team_id, type, payload_json, error, attempts, created_at)
- user_push_tokens (id, user_id, token, platform, updated_at)

Row Level Security (RLS)
- All tables scoped by team_id via foreign keys; policies:
  - Athletes: read/write own rows; no cross‑athlete reads.
  - Coach: read/write rows for assigned athletes.
  - Master: bypass policies.

8.1 Schema details (build‑ready)
- Conventions: all domain tables include `team_id`, `created_at`, `updated_at`, `deleted_at` (nullable). `updated_at` auto‑updates on row change.
- `threads.type`: enum, MVP uses `coach_athlete`. One row per `(team_id, coach_id, athlete_id)` unique.
- `comments.entity_type`: enum `planned|actual`; `entity_id` references `workouts_planned.id` or `workouts_actual.id` accordingly.
- `workouts_actual.source`: enum `strava|manual|reconciliation`.
- `thresholds_zones.values_json`: stores method‑specific fields (e.g., FTP, LTHR, T‑pace, zone cutoffs). Maintain a monotonically increasing `thresholds_version` per athlete derived from the latest `effective_from` for cache keys.
- `audit_log`: `entity` is table name; `before_json`/`after_json` capture changed fields; `actor_id` is `users.id`.
 - `user_push_tokens.platform`: enum `ios|android|web`; tokens stored per device; latest token wins for duplicates.

8.2 Indexes & constraints
- Unique: `workouts_actual.strava_activity_id`, `threads(team_id, coach_id, athlete_id)`, `coach_athletes(team_id, coach_id, athlete_id)`.
- Foreign keys with `ON DELETE CASCADE` to parent `users`/`athlete_profile` where appropriate.
- Performance indexes:
  - `(team_id, athlete_id, date)` on `workouts_planned`, `workouts_actual`, `metrics_daily`.
  - `(team_id, date)` on `metrics_daily` for team rollups.
  - `(team_id, user_id, scheduled_at)` on `notifications`.
  - `(team_id, entity_type, entity_id, created_at)` on `comments`.
  - `(team_id, event_time)` on admin/event log tables.
 - Push tokens: unique `user_push_tokens(user_id, token)`; index on `(user_id, updated_at)`.

8.3 RLS policy examples (sketch)
- Policies reference JWT claims for `team_id` and `role` directly (no `current_setting`).
- Athletes: `team_id = (auth.jwt() ->> 'team_id')::uuid AND user_id = auth.uid()` where table has `user_id`; for athlete‑scoped tables, join via `athlete_profile.user_id`.
- Coach: allowed when `team_id = (auth.jwt() ->> 'team_id')::uuid AND athlete_id IN (SELECT athlete_id FROM coach_athletes WHERE coach_id = auth.uid())`.
- Master: bypass when `(auth.jwt() ->> 'role') = 'master'`.

### 9) APIs (representative)
- POST /auth/ssologin (Supabase hosted)
- GET/POST /api/strava/connect (Next.js API route)
- POST /api/strava/webhook (Next.js API route)
- GET /api/calendar?athlete_id&week
- POST /api/plans (create/update planned workouts)
- GET /api/workouts/:id (detail with metrics, comments, AI summary)
- POST /api/comments
- POST /api/notifications/test (admin)
- POST /api/ai/summarize (regenerate)

### 10) Computation Specs
TSS/IF
- Use discipline‑appropriate formulae:
  - Power‑based (ride): IF = NP/FTP; TSS = (sec × NP × IF) / (FTP × 3600) × 100.
  - Heart‑rate‑based (hrTSS): based on %HRR with calibration; fallback using time in zones.
  - Pace‑based (rTSS/sTSS): model IF via ratio of threshold pace vs normalized pace.
- Fallback hierarchy: power → HR → pace → heuristic from RPE/duration.

CTL/ATL/TSB
- EWMA of daily TSS: ATL τ=7, CTL τ=42; TSB = CTL − ATL. Seed with backfill or neutral start.

Compliance Score (v1)
- Weighted difference of planned vs actual across duration (40%), distance (30%), intensity/IF (30%). Map to 0–100 with penalties for missed/over‑shot.

PB Detection
- On ingest, compute rolling bests per discipline/metric windows; update `pbs` if improved.

Implementation details (build‑ready)
- NP (cycling): resample to 1s, compute 30s moving average of power, raise to 4th power, take mean, then 4th‑root. Ignore paused segments if available.
- rTSS/sTSS: normalized pace via rolling average pace excluding stops; IF = threshold_pace / normalized_pace (pace inversely scales). TSS = sec × IF² / 3600 × 100.
- hrTSS (fallback): compute time‑in‑zones using athlete’s HR zones; score = Σ(zone_minutes × zone_weight) normalized so 60 min at LT = 100. Default weights: [Z1=0.5, Z2=0.7, Z3=1.0, Z4=1.5, Z5=2.0].
- Heuristic (no power/HR/pace): estimate IF from RPE if provided; else IF from planned intensity; else clamp to 0.6. TSS from duration only: `TSS ≈ duration_hr × (IF²) × 100`.
- Day boundary: rollups use athlete local date (IANA timezone). On DST change, assign activities to local calendar day containing their start time.
- EWMA: for date d, `CTL_d = CTL_{d−1} + (TSS_d − CTL_{d−1}) × (1 − e^{−1/42})`; same for ATL with 7. Initialize at first available day with `CTL=ATL=TSS`.
- Compliance mapping: let relative errors be `edur = |act_dur − plan_dur| / plan_dur`, `edist = |act_dist − plan_dist| / plan_dist`, `eif = |act_if − plan_if| / plan_if`. Truncate each at 1.0. Score = `max(0, round(100 × (1 − 0.4×edur − 0.3×edist − 0.3×eif)))`. Missing actual → 0. Over‑achievement capped by same truncation (no >100).
- Discipline weights: for MVP, use global 40/30/30. Reserve per‑discipline overrides for later.
- PB windows:
  - Run pace: rolling best for 1k, 5k, 10k, and best sustained pace windows (1–60 min).
  - Ride power: best average power for 1/5/20/60 min; skip if no power.
  - Swim pace: best for 100/400/1500m; lap or distance‑based when available.
- Backfill PBs: recompute from last 365 days upon first connect; thereafter incremental update on ingest with windowed comparisons.

### 11) Notifications Matrix (MVP)
- Planned reminder: T‑12h mobile push (athlete).
- Overdue workout: T+6h push (athlete).
- Coach feedback: immediate push (athlete).
- PB achieved: immediate push (athlete and coach).
- Weekly digest: Sunday 18:00 local (coach). Athlete notifications respect local timezone and quiet hours (22:00–07:00 default).

### 12) Analytics & Observability
 - Product analytics: PostHog Cloud; instrument key events (sign‑ins, connect Strava, plan edits, comments, notifications sent/opened, AI generations, calendar interactions). Disable autocapture/session recording by default.
 - Error tracking: Sentry for mobile, web, and Next.js API routes; releases named `app@<semver>+<commit>`.
 - System metrics: webhook latency, job retries, DLQ size, Strava API quota.
 - Logging: structured logs in Next.js API routes with request IDs and correlation.

Reliability Mechanics
- Exponential backoff for webhook/process retries: 1m → 5m → 15m → 60m; persist failures to `jobs_dlq` with payload and error; admin UI provides manual retry.
- Daily reconciliation job to recover missed Strava activities.

### 13) Security & Privacy
- Google SSO; no 2FA (MVP). Token storage in Supabase with least‑privileged access.
- RLS to enforce team scoping; audit log for sensitive changes.
- Export/delete on request; soft‑delete on offboarding.

PII & retention (build‑ready)
- PII minimization: store only names, emails, timezone; no addresses/phone. Do not store raw GPS coordinates in analytics or AI prompts.
- Data retention: raw activity detail retained indefinitely for MVP; users can request export/delete. Soft‑delete sets `deleted_at` and hides via RLS; hard delete manual.
- Secrets handling: OAuth tokens stored in Supabase; API keys in environment variables; never logged. Admin UI redacts sensitive values.
- Analytics privacy: PostHog events exclude emails/usernames; use anonymous ids keyed to `users.id`. No autocapture/session recording.

### 14) Performance & Scale Assumptions
- Load: 20 athletes × up to 2 workouts/day → ~40 ingests/day; plus backfill during onboarding.
- Targets: P95 page load < 2.5s web, 60fps interactions; ingest freshness ≤ 3 minutes; AI summary ≤ 20s.

### 15) Delivery Plan (2 Weeks)
- Day 1–2: Project scaffold (Next.js + Capacitor + Turborepo), Supabase schema/RLS, Google SSO, roles.
- Day 3–4: Strava OAuth/connect + historical backfill; webhook receiver; activity storage.
- Day 5–6: Metrics pipeline (TSS/IF; CTL/ATL/TSB), daily rollups, PB detection.
- Day 7–8: Calendar (web drag‑drop; mobile CRUD), plan↔actual linking, compliance.
- Day 9: Comments/chat (Realtime), notifications.
- Day 10: Coach board (multi‑athlete, clone week), annotations.
- Day 11: AI per‑workout summaries; weekly digest cron.
- Day 12: Admin panel + audit; exports.
- Day 13–14: Polish, QA, app store builds + web deploy, onboarding guide.

### 16) Risks & Mitigations
- Strava rate limits/webhook gaps → caching, backoff/retry, DLQ, daily reconciliation.
- Data sparsity (no power/HR) → conservative TSS estimates; allow manual overrides.
- Complex mobile interactions → Progressive enhancement; core features work on all platforms.
- AI variability/cost → token budgets, system prompts, cache, manual regenerate.

### 17) Open Questions / Decisions
- Exact PB set per discipline — confirm defaults.
- Compliance weighting per discipline — confirm or allow per‑athlete tuning.
- RESOLVED: Weekly digest timezone — coach local at Sunday 18:00; athlete notifications in athlete local timezone with quiet hours.
- RESOLVED: Mobile distribution — App Store builds via Capacitor for iOS (Android Play Store optional later).

RESOLVED ADDITIONS (see referenced sections)
- PB set per discipline — defaults defined (see 10: Implementation details, PB windows; and 5.6).
- Compliance weighting — use global 40/30/30 for MVP; discipline overrides later (see 10: Compliance mapping).
- Role assignment flow — first user auto‑Master; Admin UI manages roles; audited (see 5.1).
- Plan↔actual auto‑linking rules — window/tie‑breakers/manual override (see 5.3).
- Strava backfill/webhooks — resumable cursor, quotas, idempotency, reconciliation (see 5.2).
- Notifications quiet hours/scheduling — dedupe, retries, DST handling (see 5.8).
- AI guardrails — models, budgets, caching key, redaction, regen limits (see 5.9).
- Offline conflicts — latest‑wins with audit; clock skew handling (see 5.11).

### 18) Acceptance Criteria (MVP)
- All athletes can sign in with Google, connect Strava, and see their weekly plan vs completed.
- New Strava workout appears in app with computed TSS/IF and updated CTL/ATL/TSB within 3 minutes P95.
- Coach can drag‑drop plan (web), clone a week, comment on workouts, and receive weekly digest.
- Per‑workout AI summary is generated automatically and visible in the workout detail.
- Notifications fire for reminders, feedback, PBs; mobile push working via Capacitor and delivered in correct local timezone respecting quiet hours.
- Monochrome UI consistently applied across web and mobile.

### 19) Appendix

19.1 TSS/IF References (summary)
- Cycling (power): NP and IF per Coggan; TSS scaled to 100 for 1 hour at FTP.
- Running (rTSS): ratio of threshold pace; use grade‑adjusted pace when available.
- Swimming (sTSS): based on T‑pace benchmarks.

19.2 Example AI Prompts (simplified)
- Per‑workout: "Summarize this workout for a coach: discipline, goals vs actuals, IF, TSS, compliance, notable events, concise feedback. Be objective and brief."
- Weekly digest: "Summarize the athlete's week: total load, CTL/ATL/TSB trend, PBs, missed sessions, anomalies, 2–3 coaching insights."

19.3 Event Flow (Strava)
- Athlete finishes workout → Strava webhook → Edge Function fetch detail → store → compute metrics → update rollups/PBs → generate AI summary → notify.

19.4 Notification Copy (grayscale UI)
- Keep concise, emoji‑light; rely on typography and layout, not color.

### 20) Environments & Credentials
- Environments: separate staging and production for Supabase, Strava apps, Sentry, PostHog, and Vercel; mobile builds via Capacitor + CI/CD.
- Secrets management: source of truth in 1Password; injected into Vercel environment variables and Supabase; local development via `.env.local` (never committed).
- Supabase: capture `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` per environment.
- Strava: `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_VERIFY_TOKEN`; scopes `read`, `activity:read_all`; redirect and webhook URLs per environment.
- OpenAI: `OPENAI_API_KEY` (model starts with cost‑efficient GPT‑4o‑mini class; upgradable).
- Sentry: `SENTRY_DSN` per app (mobile/web/api) and environment.
- Product analytics: PostHog `POSTHOG_KEY` and `POSTHOG_HOST`; events only (no autocapture).
- Push (iOS): Apple Developer Program, bundle IDs `com.company.trexai` (prod) and `com.company.trexai.staging`; APNs Auth Key (.p8), Key ID, Team ID configured in Capacitor.
- Push (Android optional): Firebase project and FCM server key; configured in Capacitor when enabling Android.
- DNS: `app.<domain>` → Vercel; APIs via Next.js API routes (no custom domain required for MVP).

Linking & OAuth
- App scheme: `trexai`.
- Universal links domain: `app.<domain>` associated with iOS; Android App Links when enabled.
- OAuth final redirect: web → `/settings/connections`; mobile → `trexai://connections` (also via `https://app.<domain>/connections`).

Web deploy
- Vercel: SPA static export; preview deployments for each PR.

CI/CD
- GitHub Actions: typecheck/lint/test on PR; build Next.js and run Supabase SQL formatting check.
- Supabase migrations: plan/apply via CI to staging on merge; manual promotion to prod.
- Mobile builds: Capacitor builds triggered on release tags.

Seeding
- On first environment bootstrap, create default `teams` row and assign first user as `Master` with that `team_id`.

Push tokens storage
- `user_push_tokens` persisted in DB; tokens rotated on reinstall; invalidation handled on push error.

Presence
- Supabase Realtime presence enabled for `threads` channels.

Repo conventions
- Turborepo monorepo as defined in 7) with pnpm workspace package manager.

