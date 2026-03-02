import { type PlannedSet, type TrainingMaxes, type Units } from '../types';
import { EXERCISE_IDS, SMOLOV_JR_INCREMENTS, FIVE_THREE_ONE_WEEKS } from '../constants/programs';
import { roundToNearest, floorToNearest } from './calculators';

function round(weight: number, units: Units): number {
  const increment = units === 'kg' ? 2.5 : 5;
  return floorToNearest(weight, increment);
}

// ─── Warmup Sets ──────────────────────────────────────────────────────────────

/** Generate warmup sets before a main working set */
export function getWarmupSets(
  workingWeight: number,
  exerciseId: number,
  units: Units
): PlannedSet[] {
  const warmupPcts = [0.4, 0.5, 0.6];
  const warmupReps = [5, 3, 2];

  return warmupPcts.map((pct, i) => ({
    exercise_id: exerciseId,
    exercise_name: '', // filled by caller
    set_number: i + 1,
    planned_weight: round(workingWeight * pct, units),
    planned_reps: warmupReps[i],
    is_amrap: false,
    is_warmup: true,
  }));
}

// ─── 5/3/1 Generator ─────────────────────────────────────────────────────────

const EXERCISE_ID_FOR_DAY: Record<number, number> = {
  1: EXERCISE_IDS.SQUAT,
  2: EXERCISE_IDS.BENCH,
  3: EXERCISE_IDS.DEADLIFT,
  4: EXERCISE_IDS.OHP,
};

const EXERCISE_NAME_FOR_DAY: Record<number, string> = {
  1: 'Squat',
  2: 'Bench Press',
  3: 'Deadlift',
  4: 'Overhead Press',
};

function getTMForExercise(tms: TrainingMaxes, exerciseId: number): number {
  switch (exerciseId) {
    case EXERCISE_IDS.SQUAT: return tms.squat;
    case EXERCISE_IDS.BENCH: return tms.bench;
    case EXERCISE_IDS.DEADLIFT: return tms.deadlift;
    case EXERCISE_IDS.OHP: return tms.ohp;
    default: return tms.squat;
  }
}

export function generate531Workout(
  tms: TrainingMaxes,
  week: number,
  day: number,
  units: Units
): PlannedSet[] {
  const weekData = FIVE_THREE_ONE_WEEKS.find(w => w.week === week);
  if (!weekData) throw new Error(`Invalid 5/3/1 week: ${week}`);

  const exerciseId = EXERCISE_ID_FOR_DAY[day];
  const exerciseName = EXERCISE_NAME_FOR_DAY[day];
  const tm = getTMForExercise(tms, exerciseId);

  if (!tm) throw new Error(`No training max for day ${day}`);

  const topSetWeight = round(tm * weekData.sets[weekData.sets.length - 1].pct, units);
  const warmups = getWarmupSets(topSetWeight, exerciseId, units).map(s => ({
    ...s,
    exercise_name: exerciseName,
  }));

  const mainSets: PlannedSet[] = weekData.sets.map((setDef, i) => ({
    exercise_id: exerciseId,
    exercise_name: exerciseName,
    set_number: i + 1,
    planned_weight: round(tm * setDef.pct, units),
    planned_reps: setDef.reps,
    is_amrap: setDef.isAmrap ?? false,
    is_warmup: false,
  }));

  return [...warmups, ...mainSets];
}

// ─── Smolov Jr Generator ──────────────────────────────────────────────────────

const SMOLOV_JR_TEMPLATE = [
  { day: 1, sets: 6, reps: 6, pct: 0.70 },
  { day: 2, sets: 7, reps: 5, pct: 0.75 },
  { day: 3, sets: 8, reps: 4, pct: 0.80 },
  { day: 4, sets: 10, reps: 3, pct: 0.85 },
];

export function generateSmolovJrWorkout(
  baseWeight: number, // the weight used for week 1 percentages
  exerciseId: number,
  exerciseName: string,
  week: number,
  day: number,
  units: Units
): PlannedSet[] {
  const dayTemplate = SMOLOV_JR_TEMPLATE.find(d => d.day === day);
  if (!dayTemplate) throw new Error(`Invalid Smolov Jr day: ${day}`);

  const increment = units === 'kg' ? SMOLOV_JR_INCREMENTS[week - 1] : SMOLOV_JR_INCREMENTS[week - 1] * 2.20462;
  const adjustedBase = baseWeight + increment;
  const workingWeight = round(adjustedBase * dayTemplate.pct, units);

  const warmups = getWarmupSets(workingWeight, exerciseId, units).map(s => ({
    ...s,
    exercise_name: exerciseName,
  }));

  const mainSets: PlannedSet[] = Array.from({ length: dayTemplate.sets }, (_, i) => ({
    exercise_id: exerciseId,
    exercise_name: exerciseName,
    set_number: i + 1,
    planned_weight: workingWeight,
    planned_reps: dayTemplate.reps,
    is_amrap: false,
    is_warmup: false,
  }));

  return [...warmups, ...mainSets];
}

// ─── Texas Method Generator ───────────────────────────────────────────────────

export function generateTexasMethodWorkout(
  fiveRM: number, // approximate 5RM for main lift
  day: number, // 1=Volume, 2=Recovery, 3=Intensity
  units: Units
): PlannedSet[] {
  const sets: PlannedSet[] = [];

  if (day === 1) {
    // Volume Day: 5×5 @ 90% of 5RM — Squat + Bench
    const volumePct = 0.9;
    const squatWeight = round(fiveRM * volumePct, units);
    const warmups = getWarmupSets(squatWeight, EXERCISE_IDS.SQUAT, units).map(s => ({
      ...s,
      exercise_name: 'Squat',
    }));
    sets.push(...warmups);
    for (let i = 1; i <= 5; i++) {
      sets.push({
        exercise_id: EXERCISE_IDS.SQUAT,
        exercise_name: 'Squat',
        set_number: i,
        planned_weight: squatWeight,
        planned_reps: 5,
        is_amrap: false,
        is_warmup: false,
      });
    }
  } else if (day === 2) {
    // Recovery Day: 2×5 @ 80% — light squat + OHP
    const squatWeight = round(fiveRM * 0.8, units);
    for (let i = 1; i <= 2; i++) {
      sets.push({
        exercise_id: EXERCISE_IDS.SQUAT,
        exercise_name: 'Squat',
        set_number: i,
        planned_weight: squatWeight,
        planned_reps: 5,
        is_amrap: false,
        is_warmup: false,
      });
    }
  } else if (day === 3) {
    // Intensity Day: 1×5+ (PR attempt)
    const warmups = getWarmupSets(fiveRM, EXERCISE_IDS.SQUAT, units).map(s => ({
      ...s,
      exercise_name: 'Squat',
    }));
    sets.push(...warmups);
    sets.push({
      exercise_id: EXERCISE_IDS.SQUAT,
      exercise_name: 'Squat',
      set_number: 1,
      planned_weight: round(fiveRM * 1.025, units), // Attempt ~2.5% PR
      planned_reps: 5,
      is_amrap: true,
      is_warmup: false,
    });
  }

  return sets;
}
