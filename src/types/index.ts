// ─── Core Domain Types ────────────────────────────────────────────────────────

export type Units = 'kg' | 'lbs';
export type Sex = 'M' | 'F';
export type ExerciseCategory = 'competition' | 'accessory';

export interface Exercise {
  id: number;
  name: string;
  category: ExerciseCategory;
  is_competition_lift: 0 | 1;
}

// ─── Program Types ────────────────────────────────────────────────────────────

export interface Program {
  id: number;
  name: string;
  description: string;
  total_weeks: number;
  days_per_week: number;
}

export interface ProgramTemplate {
  id: number;
  program_id: number;
  week: number;
  day: number;
  exercise_id: number;
  set_number: number;
  planned_reps: number;
  percentage: number; // 0.0–1.0
  is_amrap: 0 | 1;
}

export interface UserProgram {
  id: number;
  program_id: number;
  start_date: string;
  current_week: number;
  current_day: number;
  tm_squat: number | null;
  tm_bench: number | null;
  tm_deadlift: number | null;
  tm_ohp: number | null;
  is_active: 0 | 1;
}

// ─── Workout Types ────────────────────────────────────────────────────────────

export interface Workout {
  id: number;
  date: string;
  user_program_id: number | null;
  program_week: number | null;
  program_day: number | null;
  notes: string | null;
  completed: 0 | 1;
}

export interface WorkoutSet {
  id: number;
  workout_id: number;
  exercise_id: number;
  set_number: number;
  planned_weight: number | null;
  planned_reps: number | null;
  actual_weight: number | null;
  actual_reps: number | null;
  rpe: number | null;
  is_warmup: 0 | 1;
  completed_at: string | null;
  // Joined fields
  exercise_name?: string;
}

export interface PlannedSet {
  exercise_id: number;
  exercise_name: string;
  set_number: number;
  planned_weight: number;
  planned_reps: number;
  is_amrap: boolean;
  is_warmup: boolean;
}

// ─── PR Types ────────────────────────────────────────────────────────────────

export interface PersonalRecord {
  id: number;
  exercise_id: number;
  weight: number;
  reps: number;
  estimated_1rm: number;
  date: string;
  workout_set_id: number | null;
  // Joined
  exercise_name?: string;
}

// ─── Meet Types ───────────────────────────────────────────────────────────────

export interface Meet {
  id: number;
  name: string;
  date: string;
  bodyweight: number | null;
  weight_class: string | null;
  notes: string | null;
}

export interface MeetAttempt {
  id: number;
  meet_id: number;
  exercise_id: number;
  attempt_number: 1 | 2 | 3;
  planned_weight: number;
  actual_weight: number | null;
  is_good_lift: 0 | 1 | null;
  // Joined
  exercise_name?: string;
}

export interface WarmupSet {
  pct: number;
  weight: number;
  reps: number;
}

// ─── Settings Types ───────────────────────────────────────────────────────────

export interface UserSettings {
  units: Units;
  bodyweight: number;
  sex: Sex;
  restTimerDuration: number; // seconds
  isInitialized: boolean;
}

// ─── Subscription Types ───────────────────────────────────────────────────────

export interface SubscriptionState {
  isPro: boolean;
  isLoading: boolean;
  purchase: () => Promise<boolean>;
  restore: () => Promise<boolean>;
}

// ─── Training Max / PR Helpers ────────────────────────────────────────────────

export interface TrainingMaxes {
  squat: number;
  bench: number;
  deadlift: number;
  ohp: number;
}

// Keyed by exercise name
export type AllPRs = Record<string, PersonalRecord>;

// ─── Muscle & Scoring Types ─────────────────────────────────────────────────

export type MuscleId =
  | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'hip_flexors'
  | 'chest'
  | 'front_delts' | 'side_delts' | 'rear_delts'
  | 'lats' | 'upper_back' | 'traps' | 'lower_back'
  | 'triceps' | 'biceps' | 'forearms'
  | 'core';

export interface WorkoutScore {
  volumeLoad: number;           // Σ(weight × reps)
  inol: number;                 // session total INOL
  muscleGroupVolume: Partial<Record<MuscleId, number>>;
  overallScore: number;         // 0–100
  classification: string;       // 'Light Recovery' | 'Moderate' | 'Hard' | 'Maximum Effort'
  setsCompleted: number;
  exerciseCount: number;
  prsHit: number;
}
