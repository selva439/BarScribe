# IronLog — Claude Code Context

## Project Overview
React Native (Expo SDK 55) powerlifting training app. Offline-first with optional Supabase cloud backup.
RevenueCat monetization. Built for iOS and Android.

## Tech Stack
| Technology | Version | Notes |
|---|---|---|
| Expo SDK | ~55.0.4 | React 19, RN 0.79.2 |
| expo-sqlite | ~15.2.9 | New async API (SQLiteProvider + useSQLiteContext) |
| React Navigation | v6 | bottom-tabs + native-stack |
| react-native-gifted-charts | ^1.4.45 | REPLACES victory-native (Skia not React 19 compatible) |
| react-native-purchases | ^8.3.1 | RevenueCat — dev build only, not Expo Go |
| @supabase/supabase-js | ^2.49.2 | Optional cloud sync |
| react-native-calendars | ^1.1314.0 | History screen calendar |
| react-native-reanimated | ~3.17.4 | Required for gesture handler |

## Key Architecture Decisions
- **NO Redux** — SQLite is source of truth, React Context for transient state
- **4 Contexts**: SettingsContext, SubscriptionContext, ActiveWorkoutContext, DatabaseProvider
- **Repository pattern** for all DB access: `src/database/repositories/`
- **Pure functions** for all calculations: `src/utils/`
- **ProGate component** gates Pro screens — shows paywall for non-Pro users
- RevenueCat entitlement key: `'pro'`
- In `__DEV__` mode or Expo Go: RevenueCat grants Pro access automatically

## Color System (Dark + Iron Red)
```
background:      #0F0F0F
surface:         #1A1A1A
surfaceElevated: #242424
border:          #2C2C2C
accent (main):   #E8341C  ← Iron Red
text:            #F5F5F5
textSecondary:   #AAAAAA
textMuted:       #888888
success:         #22C55E
pro badge:       #F5A623
```
All colors in `src/constants/colors.ts` → `Colors` object.

## Folder Structure
```
src/
  database/
    schema.ts              # SQL CREATE TABLE + seed data strings
    DatabaseProvider.tsx   # SQLiteProvider wrapper + initDb()
    repositories/
      workoutRepository.ts
      setRepository.ts
      prRepository.ts
      programRepository.ts
      meetRepository.ts
      settingsRepository.ts
  contexts/
    SettingsContext.tsx
    SubscriptionContext.tsx
    ActiveWorkoutContext.tsx   # rest timer lives here
  navigation/
    types.ts                   # all ParamList types
    RootNavigator.tsx          # Onboarding | Tabs | LogSet modal | SessionReview modal
    TabNavigator.tsx           # 5 bottom tabs
    TodayStackNavigator.tsx
    HistoryStackNavigator.tsx
    CalculatorsTabNavigator.tsx  # material top tabs
    MeetPrepStackNavigator.tsx
    ProfileStackNavigator.tsx
  screens/
    Onboarding/OnboardingScreen.tsx
    Today/TodayTrainingScreen.tsx
    Today/ProgramSelectScreen.tsx
    Today/ProgramSetupScreen.tsx
    LogSet/LogSetScreen.tsx
    Calculators/OneRMScreen.tsx
    Calculators/WilksDotsScreen.tsx
    Profile/PRsDashboardScreen.tsx
    Profile/SettingsScreen.tsx
    MeetPrep/MeetListScreen.tsx
    MeetPrep/MeetDetailScreen.tsx
    History/HistoryScreen.tsx
    History/SessionReviewScreen.tsx
  components/
    ui/Button.tsx  Card.tsx  Badge.tsx  Input.tsx  EmptyState.tsx
    workout/WeightInput.tsx  SetRow.tsx  ExerciseCard.tsx  RestTimer.tsx  RPEPicker.tsx
    charts/PRProgressChart.tsx
    ProGate.tsx
  utils/
    calculators.ts    # epley1RM, wilksScore, dotsScore, roundToNearest
    programGenerator.ts  # generate531Workout, generateSmolovJrWorkout, generateTexasMethodWorkout
    meetCalc.ts       # getMeetWarmups, getCountdownDays, suggestSecondAttempt
    dateHelpers.ts    # toISODate, fromISODate, formatDisplayDate, formatTimer
  services/
    notifications.ts  # expo-notifications rest timer
    revenuecat.ts     # dynamic import (Expo Go safe)
    supabase.ts       # optional sync
  constants/
    colors.ts
    programs.ts       # PROGRAM_IDS, EXERCISE_IDS, 5/3/1 templates, Smolov Jr, Texas Method
  types/index.ts
```

## SQLite Schema (key tables)
- `exercises` — squat/bench/deadlift/OHP + accessories (seeded)
- `programs` — 5/3/1 (id=1), Smolov Jr (id=2), Texas Method (id=3) (seeded)
- `program_templates` — percentage-based planned sets per week/day
- `user_programs` — active program with training maxes (tm_squat, tm_bench, tm_deadlift, tm_ohp)
- `workouts` — training sessions by date
- `workout_sets` — individual set records (planned + actual)
- `personal_records` — best estimated 1RM per exercise (checked on every logSet call)
- `meets` — competition entries
- `meet_attempts` — 3 attempts per lift (planned + actual)
- `user_settings` — key/value: units, bodyweight, sex, rest_timer_duration, is_initialized

## Key Formulas
```typescript
// Epley 1RM
epley1RM(w, r) = r <= 1 ? w : w * (1 + r / 30)

// Training Max (5/3/1)
TM = floor(1RM * 0.9 / 2.5) * 2.5

// Wilks — coefficients in src/utils/calculators.ts (male/female)
// DOTS — coefficients in src/utils/calculators.ts (male/female)

// Meet warmups from opener: 40%×5, 50%×3, 60%×2, 70%×1, 80%×1, 90%×1, 95%×1
```

## Monetization
- **Free**: Today's Training, Log Set, 1RM Calculator, History, basic PRs
- **Pro ($4.99/mo, 7-day trial)**: Programs, Meet Prep, Wilks/DOTS, Progress Graphs, Cloud Sync
- `ProGate` component handles gating: `<ProGate feature="Meet Prep">...</ProGate>`
- RevenueCat configured in `src/services/revenuecat.ts` — add API keys to `.env`

## Environment Variables (.env)
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_REVENUECAT_IOS_KEY=
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=
```

## Development Commands
```bash
npm start              # Expo Go (RevenueCat/purchases won't work)
npx eas build --profile development --platform ios  # Dev build (full features)
npx eas build --profile production --platform ios   # Production build
npx eas submit --platform ios                        # App Store submission
```

## Common Gotchas
1. **react-native-purchases**: Requires dev build. In Expo Go, `checkIsProEntitlement()` returns `true` in `__DEV__`
2. **expo-sqlite**: Uses new async API (`getAllAsync`, `runAsync`, not `.transaction()`). Legacy API removed in SDK 52.
3. **react-native-gifted-charts**: Replaces victory-native due to Skia/React 19 incompatibility
4. **Reanimated**: `react-native-reanimated/plugin` must be LAST in babel.config.js plugins array
5. **ProGate overlay mode**: Always pass children: `<ProGate overlay><View /></ProGate>`

## User-Confirmed Preferences
- **Units**: Show picker on first launch (kg / lbs), saved to user_settings
- **Theme**: Dark + Iron Red (#E8341C accent)
- **Trial**: 7-day free trial configured in RevenueCat dashboard
