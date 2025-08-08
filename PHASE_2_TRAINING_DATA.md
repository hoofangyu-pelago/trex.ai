# Phase 2: Training Data & Analytics
**Duration**: Days 5-8  
**Goal**: Build the metrics engine and training analytics that power the platform  
**Deliverable**: Full workout analysis with TSS/IF, CTL/ATL/TSB trends, and PB tracking

## Success Criteria
- [ ] TSS/IF calculated correctly for all disciplines
- [ ] CTL/ATL/TSB trends computed and displayed
- [ ] Personal bests detected and stored
- [ ] Analytics dashboard functional with charts
- [ ] Daily metrics rollups working

## Features Included

### 5.5 Metrics & Analytics (Complete)
**Per-Workout Metrics**:
- Intensity Factor (IF) calculation by discipline
- Training Stress Score (TSS, hrTSS, rTSS, sTSS) 
- Fallback hierarchy: power → HR → pace → heuristic
- Normalized Power (cycling), Grade Adjusted Pace (running)

**Daily Rollups**:
- Total TSS, duration, distance per day
- Chronic Training Load (CTL) - 42-day EWMA
- Acute Training Load (ATL) - 7-day EWMA  
- Training Stress Balance (TSB) = CTL - ATL

**Implementation Details**:
- Power-based: IF = NP/FTP; TSS = (sec × NP × IF) / (FTP × 3600) × 100
- HR-based: hrTSS using time-in-zones with zone weights
- Pace-based: IF = threshold_pace / normalized_pace; TSS = sec × IF² / 3600 × 100
- Heuristic fallback: estimate from RPE/duration when data sparse

### 5.6 Personal Bests (PBs)
**Detection & Storage**:
- Run: 1k/5k/10k/best pace windows, longest distance
- Ride: 1/5/20/60-min best power, longest ride  
- Swim: 100/400/1500m best pace, longest distance
- Automatic detection on activity ingest
- PB notifications and badges

**Implementation Details**:
- Rolling window analysis for sustained bests
- Backfill from last 365 days on first connect
- Incremental updates on new activities
- PB table with discipline/metric/value/date tracking

### Enhanced Database Schema
**New Tables**:
- `thresholds_zones` (id, team_id, athlete_id, discipline, method, values_json, effective_from)
- `metrics_daily` (team_id, athlete_id, date, tss, ctl, atl, tsb, duration_min, distance_km)
- `pbs` (id, team_id, athlete_id, discipline, metric, value, unit, date, source_id)

**Enhanced Tables**:
- `workouts_actual` - add computed metrics fields
- `athlete_profile` - add threshold/zone preferences

### Analytics Dashboard
**Athlete Dashboard**:
- CTL/ATL/TSB trend charts (last 12 weeks)
- Weekly TSS and duration charts
- Personal bests panel with recent achievements
- Training load distribution by discipline
- Recent workout cards with metrics

**Charts Implementation**:
- Recharts for web visualization
- Monochrome chart palette with grayscale variants
- Responsive design for mobile
- Interactive tooltips and zoom

### Threshold & Zone Management
**Threshold Types**:
- Cycling: FTP (Functional Threshold Power)
- Running: Threshold pace, LTHR (Lactate Threshold Heart Rate)
- Swimming: T-pace benchmarks
- Heart rate zones (5-zone model)

**Zone Calculation**:
- Power zones based on FTP percentages
- Heart rate zones based on LTHR/HRmax
- Pace zones based on threshold pace
- Version tracking for cache invalidation

### Data Processing Pipeline
**Metrics Computation Flow**:
1. Activity ingested → extract raw data (power/HR/pace streams)
2. Compute normalized metrics (NP, normalized pace, etc.)
3. Calculate IF based on athlete thresholds  
4. Compute TSS using discipline-specific formulas
5. Update daily rollups (TSS, duration, distance)
6. Recalculate CTL/ATL/TSB for affected days
7. Check for new personal bests
8. Trigger notifications for PB achievements

**Performance Optimization**:
- Batch processing for daily rollups
- Efficient EWMA calculation (incremental updates)
- Indexed queries for trend data
- Caching of computed metrics

## APIs Implemented
- `GET /api/metrics/dashboard?athlete_id` (dashboard data)
- `GET /api/metrics/trends?athlete_id&period` (CTL/ATL/TSB trends)  
- `GET /api/pbs?athlete_id` (personal bests)
- `POST /api/thresholds` (update athlete thresholds)
- `GET /api/analytics/team` (team-level rollups)

## Computation Specifications

### TSS/IF Formulas (Build-Ready)
```javascript
// Cycling (power-based)
const NP = computeNormalizedPower(powerStream); // 30s rolling avg, 4th power
const IF = NP / athleteFTP;
const TSS = (durationSec * NP * IF) / (athleteFTP * 3600) * 100;

// Running (pace-based) 
const normalizedPace = computeNormalizedPace(paceStream); // exclude stops
const IF = thresholdPace / normalizedPace; // pace inverts
const rTSS = (durationSec * IF * IF) / 3600 * 100;

// Heart Rate (fallback)
const timeInZones = computeTimeInZones(hrStream, hrZones);
const hrTSS = timeInZones.reduce((sum, time, zone) => 
  sum + time * zoneWeights[zone], 0) / 60 * 100;
```

### CTL/ATL/TSB Calculation
```javascript
// Exponentially Weighted Moving Average
const CTL_today = CTL_yesterday + (TSS_today - CTL_yesterday) * (1 - Math.exp(-1/42));
const ATL_today = ATL_yesterday + (TSS_today - ATL_yesterday) * (1 - Math.exp(-1/7));
const TSB_today = CTL_today - ATL_today;
```

### PB Detection Algorithm
```javascript
// Rolling window analysis for sustained bests
function detectPBs(activity) {
  const windows = getTimeWindows(activity.discipline); // [1min, 5min, 20min, 60min]
  
  windows.forEach(window => {
    const bestValue = findBestInWindow(activity.data, window);
    const existingPB = getPB(athlete, discipline, window);
    
    if (!existingPB || bestValue > existingPB.value) {
      storePB(athlete, discipline, window, bestValue, activity);
      notifyPBAchievement(athlete, discipline, window, bestValue);
    }
  });
}
```

## UI Components Added
- **Metrics Dashboard**: CTL/ATL/TSB trends, weekly summary
- **PB Panel**: Recent achievements with badges
- **Threshold Settings**: FTP/pace/HR threshold management
- **Analytics Charts**: Training load visualization
- **Workout Detail**: Enhanced with computed metrics

## Testing & Validation
- [ ] TSS calculations match reference implementations
- [ ] CTL/ATL/TSB trends are mathematically correct
- [ ] PB detection works across all disciplines
- [ ] Charts render correctly on mobile and web
- [ ] Threshold updates recalculate dependent metrics
- [ ] Performance acceptable with 12 months of data

## Data Migration & Backfill
- Reprocess existing activities to compute metrics
- Backfill CTL/ATL/TSB for historical data
- Initialize athlete thresholds with sensible defaults
- Detect PBs from historical activities

## Performance Considerations
- Index on `(team_id, athlete_id, date)` for daily metrics
- Cache computed values to avoid recomputation
- Batch daily rollup calculations
- Optimize chart data queries with date ranges

## Acceptance Criteria
1. Athlete sees accurate TSS/IF for all workout types
2. CTL/ATL/TSB trends display correctly with smooth curves
3. Personal bests are detected and displayed prominently  
4. Dashboard loads in <2 seconds with 12 months of data
5. Threshold changes trigger metric recalculation
6. Mobile charts are readable and interactive

## Phase 2 Complete When:
- All metrics compute correctly across disciplines
- Analytics dashboard provides valuable insights
- PB detection motivates athletes
- Performance is acceptable for target data volume
- Foundation ready for planning tools (Phase 3)