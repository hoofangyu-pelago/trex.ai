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

5.2 Strava Integration
- OAuth connect/disconnect per athlete; store tokens securely; auto refresh.
- Historical backfill: fetch last 12 months on first connect (rate‑limit aware, resumable).
- Webhook receiver: subscribe to Strava events; fetch activity detail on create/update.
- Near real‑time ingest target: 1–3 minutes end‑to‑end.

5.3 Calendar & Planning
- Weekly calendar view (web: drag‑drop; mobile: add/edit basic).
- Create, edit, delete planned workouts (discipline, target duration/distance, intensity/IF target optional, notes, structure JSON placeholder).
- Clone: copy week to another week (per athlete); coach can bulk clone across athletes.
- Link planned ↔ actual automatically by date/discipline/window, with manual override.

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

5.8 Notifications
- Push: planned workout reminder (T‑12h configurable), overdue nudge (T+6h), coach feedback, PB achieved, weekly digest.
- In‑app toasts for web.

5.9 AI Summaries
- Per‑workout summary generated on ingest: highlights, compliance, suggestions.
- Weekly coach digest auto‑sent Sunday evening per athlete: load/TSB trend, PBs, anomalies, coaching notes summary.
- Token guardrails and caching; allow regeneration.

5.10 Admin & Audit
- Master dashboard: user list, connections status, webhook/event log, failed jobs, dead‑letter queue.
- Audit log: changes to workouts (planned), thresholds/zones.
- Export: JSON/CSV of workouts and metrics (per athlete / team).

5.11 Offline (Mobile)
- Read: calendar and recent details cached.
- Compose: draft comments/notes offline; sync on reconnect with conflict resolution (latest‑wins + audit).

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
- Client: Expo (React Native) + React Native Web; UI via Tamagui/NativeWind; React Query; AsyncStorage/IndexedDB for cache; Expo Notifications.
- Backend: Supabase (Postgres, Auth, Storage, Realtime, Edge Functions, Cron).
- Integrations: Strava OAuth + webhooks.
- AI: OpenAI API (per‑workout summary + weekly digest), configurable model tier.
- Hosting: EAS for mobile (TestFlight/Internal Track); web via Expo Web or Vercel.

Reliability Targets
- Latency: ingest → metrics/summary visible within 1–3 minutes.
- Availability: 99.5%.
- Backoff/retry and dead‑letter queue for webhook failures.

### 8) Data Model (high‑level)
- users (id, auth_id, role, team_id, created_at)
- athlete_profile (user_id, discipline_prefs, strava_connected, strava_athlete_id)
- thresholds_zones (id, athlete_id, discipline, method, values_json, effective_from)
- workouts_planned (id, athlete_id, date, discipline, targets_json, structure_json, notes, created_by)
- workouts_actual (id, athlete_id, strava_activity_id, date, discipline, summary_json, laps_json, polyline, source)
- workout_links (planned_id, actual_id, compliance_score)
- metrics_daily (athlete_id, date, tss, ctl, atl, tsb, duration_min, distance_km)
- pbs (id, athlete_id, discipline, metric, value, unit, date, source_id)
- comments (id, workout_id, author_id, text, created_at)
- messages (id, thread_id, from_user_id, to_user_id, text, created_at, read_at)
- audit_log (id, entity, entity_id, action, actor_id, before_json, after_json, created_at)
- notifications (id, user_id, type, payload_json, scheduled_at, sent_at, read_at)
- jobs_dlq (id, type, payload_json, error, created_at)

Row Level Security (RLS)
- All tables scoped by team_id via foreign keys; policies:
  - Athletes: read/write own rows; no cross‑athlete reads.
  - Coach: read/write rows for assigned athletes.
  - Master: bypass policies.

### 9) APIs (representative)
- POST /auth/ssologin (Supabase hosted)
- GET/POST /strava/connect (Edge Function)
- POST /strava/webhook (Edge Function)
- GET /calendar?athlete_id&week
- POST /plans (create/update planned workouts)
- GET /workouts/:id (detail with metrics, comments, AI summary)
- POST /comments
- POST /notifications/test (admin)
- POST /ai/summarize (regenerate)

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

### 11) Notifications Matrix (MVP)
- Planned reminder: T‑12h mobile push (athlete).
- Overdue workout: T+6h push (athlete).
- Coach feedback: immediate push (athlete).
- PB achieved: immediate push (athlete and coach).
- Weekly digest: Sunday 18:00 local (coach).

### 12) Analytics & Observability
- Product analytics: sign‑ins, connect Strava, plan edits, comments, notifications sent/opened, AI generations, calendar interactions.
- System metrics: webhook latency, job retries, DLQ size, Strava API quota.
- Logging: structured logs in Edge Functions; request IDs; error tracking (Sentry).

### 13) Security & Privacy
- Google SSO; no 2FA (MVP). Token storage in Supabase with least‑privileged access.
- RLS to enforce team scoping; audit log for sensitive changes.
- Export/delete on request; soft‑delete on offboarding.

### 14) Performance & Scale Assumptions
- Load: 20 athletes × up to 2 workouts/day → ~40 ingests/day; plus backfill during onboarding.
- Targets: P95 page load < 2.5s web, 60fps interactions; ingest freshness ≤ 3 minutes; AI summary ≤ 20s.

### 15) Delivery Plan (2 Weeks)
- Day 1–2: Project scaffold (Expo + web), Supabase schema/RLS, Google SSO, roles.
- Day 3–4: Strava OAuth/connect + historical backfill; webhook receiver; activity storage.
- Day 5–6: Metrics pipeline (TSS/IF; CTL/ATL/TSB), daily rollups, PB detection.
- Day 7–8: Calendar (web drag‑drop; mobile CRUD), plan↔actual linking, compliance.
- Day 9: Comments/chat (Realtime), notifications.
- Day 10: Coach board (multi‑athlete, clone week), annotations.
- Day 11: AI per‑workout summaries; weekly digest cron.
- Day 12: Admin panel + audit; exports.
- Day 13–14: Polish, QA, TestFlight + web deploy, onboarding guide.

### 16) Risks & Mitigations
- Strava rate limits/webhook gaps → caching, backoff/retry, DLQ, daily reconciliation.
- Data sparsity (no power/HR) → conservative TSS estimates; allow manual overrides.
- Expo Web limitations for heavy admin → fallback to separate Next.js app later.
- AI variability/cost → token budgets, system prompts, cache, manual regenerate.

### 17) Open Questions / Decisions
- Exact PB set per discipline — confirm defaults.
- Weekly digest time window/timezone behavior.
- Compliance weighting per discipline — confirm or allow per‑athlete tuning.
- Mobile distribution: TestFlight internal vs public test.

### 18) Acceptance Criteria (MVP)
- All athletes can sign in with Google, connect Strava, and see their weekly plan vs completed.
- New Strava workout appears in app with computed TSS/IF and updated CTL/ATL/TSB within 3 minutes P95.
- Coach can drag‑drop plan (web), clone a week, comment on workouts, and receive weekly digest.
- Per‑workout AI summary is generated automatically and visible in the workout detail.
- Notifications fire for reminders, feedback, PBs; mobile push working via Expo.
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

