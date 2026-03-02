// ─── Built-in Program Definitions ─────────────────────────────────────────────
// These match the database seed data. The program engine uses these IDs.

export const PROGRAM_IDS = {
  FIVE_THREE_ONE: 1,
  SMOLOV_JR: 2,
  TEXAS_METHOD: 3,
} as const;

export const EXERCISE_IDS = {
  SQUAT: 1,
  BENCH: 2,
  DEADLIFT: 3,
  OHP: 4,
  BARBELL_ROW: 5,
  CLOSE_GRIP_BENCH: 6,
  GOOD_MORNING: 7,
} as const;

// ─── 5/3/1 Program Structure ──────────────────────────────────────────────────
// Training Max = 90% of 1RM
// 4-day template: Day1=Squat, Day2=Bench, Day3=Deadlift, Day4=OHP

export interface FiveThreeOneWeek {
  week: number;
  label: string;
  sets: { reps: number; pct: number; isAmrap?: boolean }[];
}

export const FIVE_THREE_ONE_WEEKS: FiveThreeOneWeek[] = [
  {
    week: 1,
    label: 'Week 1 (5s)',
    sets: [
      { reps: 5, pct: 0.65 },
      { reps: 5, pct: 0.75 },
      { reps: 5, pct: 0.85, isAmrap: true },
    ],
  },
  {
    week: 2,
    label: 'Week 2 (3s)',
    sets: [
      { reps: 3, pct: 0.7 },
      { reps: 3, pct: 0.8 },
      { reps: 3, pct: 0.9, isAmrap: true },
    ],
  },
  {
    week: 3,
    label: 'Week 3 (5/3/1)',
    sets: [
      { reps: 5, pct: 0.75 },
      { reps: 3, pct: 0.85 },
      { reps: 1, pct: 0.95, isAmrap: true },
    ],
  },
  {
    week: 4,
    label: 'Week 4 (Deload)',
    sets: [
      { reps: 5, pct: 0.4 },
      { reps: 5, pct: 0.5 },
      { reps: 5, pct: 0.6 },
    ],
  },
];

// Day layout: [exerciseId, isMainLift]
export const FIVE_THREE_ONE_DAYS = [
  { day: 1, mainExercise: EXERCISE_IDS.SQUAT, label: 'Squat Day' },
  { day: 2, mainExercise: EXERCISE_IDS.BENCH, label: 'Bench Day' },
  { day: 3, mainExercise: EXERCISE_IDS.DEADLIFT, label: 'Deadlift Day' },
  { day: 4, mainExercise: EXERCISE_IDS.OHP, label: 'OHP Day' },
];

// TM increment per cycle
export const FIVE_THREE_ONE_TM_INCREMENT = {
  upper: 2.5, // kg per cycle (bench, OHP)
  lower: 5,   // kg per cycle (squat, deadlift)
};

// ─── Smolov Jr Structure ──────────────────────────────────────────────────────
// Single lift peak block. 3 weeks, 4 days/week.
// Week increments: +5kg week2, +10kg week3 (from week1 base)

export interface SmolovJrDay {
  day: number;
  sets: number;
  reps: number;
  pct: number;
}

export const SMOLOV_JR_WEEK: SmolovJrDay[] = [
  { day: 1, sets: 6, reps: 6, pct: 0.7 },
  { day: 2, sets: 7, reps: 5, pct: 0.75 },
  { day: 3, sets: 8, reps: 4, pct: 0.8 },
  { day: 4, sets: 10, reps: 3, pct: 0.85 },
];

export const SMOLOV_JR_INCREMENTS = [0, 5, 10]; // kg added in weeks 1, 2, 3

// ─── Texas Method Structure ───────────────────────────────────────────────────
// 3 days/week. Uses 5RM (not 1RM) as base.

export interface TexasMethodDay {
  day: number;
  label: string;
  sets: number;
  reps: number;
  pctOf5RM: number;
  isIntensity?: boolean; // Attempt new 5RM on day 3
}

export const TEXAS_METHOD_DAYS: TexasMethodDay[] = [
  { day: 1, label: 'Volume Day', sets: 5, reps: 5, pctOf5RM: 0.9 },
  { day: 2, label: 'Recovery Day', sets: 2, reps: 5, pctOf5RM: 0.8 },
  { day: 3, label: 'Intensity Day', sets: 1, reps: 5, pctOf5RM: 1.0, isIntensity: true },
];

// ─── Rest Timer Defaults (seconds) ───────────────────────────────────────────

export const REST_TIMER_DEFAULTS = {
  competition: 180, // 3 min — squat/bench/deadlift main sets
  accessory: 90,    // 1.5 min — accessory work
  warmup: 60,       // 1 min — warmup sets
} as const;

// ─── Program display metadata ─────────────────────────────────────────────────

export const PROGRAM_META = {
  [PROGRAM_IDS.FIVE_THREE_ONE]: {
    name: '5/3/1',
    subtitle: 'Jim Wendler',
    description: 'The gold standard for strength. 4-day upper/lower split with wave loading and AMRAP sets. Build strength for life.',
    duration: '4 weeks per cycle',
    difficulty: 'Intermediate',
    focus: ['Squat', 'Bench', 'Deadlift', 'OHP'],
  },
  [PROGRAM_IDS.SMOLOV_JR]: {
    name: 'Smolov Jr',
    subtitle: 'Peaking Block',
    description: 'Brutal 3-week peaking block. High frequency, high volume. Use to add 10-20kg to a single lift fast.',
    duration: '3 weeks',
    difficulty: 'Advanced',
    focus: ['Single lift peak'],
  },
  [PROGRAM_IDS.TEXAS_METHOD]: {
    name: 'Texas Method',
    subtitle: 'Glenn Pendlay',
    description: 'Volume–Recovery–Intensity 3-day weekly structure. Classic novice-to-intermediate bridge.',
    duration: 'Indefinite',
    difficulty: 'Beginner–Intermediate',
    focus: ['Squat', 'Bench', 'Deadlift'],
  },
} as const;
