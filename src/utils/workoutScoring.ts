import { type WorkoutSet, type MuscleId, type WorkoutScore } from '../types';
import { MUSCLE_MAP } from '../constants/muscleGroups';
import { epley1RM } from './calculators';

// ─── Volume Load ─────────────────────────────────────────────────────────────

/** Total volume load: Σ(weight × reps) for working sets only */
export function calculateVolumeLoad(sets: WorkoutSet[]): number {
  return sets
    .filter(s => s.is_warmup === 0 && s.actual_weight != null && s.actual_reps != null)
    .reduce((sum, s) => sum + s.actual_weight! * s.actual_reps!, 0);
}

// ─── INOL ────────────────────────────────────────────────────────────────────
// Hristo Hristov: INOL = reps / (100 - intensity%)
// intensity% = (weight / estimated1RM) * 100

/** INOL for a single exercise. Requires estimated 1RM for that exercise. */
export function calculateExerciseINOL(
  sets: WorkoutSet[],
  estimated1RM: number
): number {
  if (estimated1RM <= 0) return 0;
  return sets
    .filter(s => s.is_warmup === 0 && s.actual_weight != null && s.actual_reps != null)
    .reduce((sum, s) => {
      const intensity = (s.actual_weight! / estimated1RM) * 100;
      if (intensity >= 100) return sum + s.actual_reps! * 0.1; // cap at very high intensity
      return sum + s.actual_reps! / (100 - intensity);
    }, 0);
}

/** Total session INOL across all exercises. prs = exerciseId → estimated 1RM */
export function calculateSessionINOL(
  sets: WorkoutSet[],
  prs: Record<number, number>
): number {
  const byExercise = new Map<number, WorkoutSet[]>();
  for (const s of sets) {
    if (!byExercise.has(s.exercise_id)) byExercise.set(s.exercise_id, []);
    byExercise.get(s.exercise_id)!.push(s);
  }

  let total = 0;
  for (const [exerciseId, exerciseSets] of byExercise) {
    const e1rm = prs[exerciseId] ?? estimateE1RMFromSets(exerciseSets);
    total += calculateExerciseINOL(exerciseSets, e1rm);
  }
  return Math.round(total * 100) / 100;
}

/** Estimate 1RM from the best set in a group (fallback when no PR data) */
function estimateE1RMFromSets(sets: WorkoutSet[]): number {
  let best = 0;
  for (const s of sets) {
    if (s.actual_weight != null && s.actual_reps != null && s.is_warmup === 0) {
      const e = epley1RM(s.actual_weight, s.actual_reps);
      if (e > best) best = e;
    }
  }
  return best;
}

// ─── Muscle Volume ───────────────────────────────────────────────────────────

/** Count effective sets per muscle group. Primary = 1.0, secondary = 0.5 */
export function calculateMuscleVolume(
  sets: WorkoutSet[]
): Partial<Record<MuscleId, number>> {
  const volume: Partial<Record<MuscleId, number>> = {};
  const countedSets = sets.filter(
    s => s.is_warmup === 0 && s.actual_weight != null
  );

  for (const s of countedSets) {
    const mapping = MUSCLE_MAP[s.exercise_id];
    if (!mapping) continue;
    for (const m of mapping.primary) {
      volume[m] = (volume[m] ?? 0) + 1;
    }
    for (const m of mapping.secondary) {
      volume[m] = (volume[m] ?? 0) + 0.5;
    }
  }

  return volume;
}

// ─── Overall Score ───────────────────────────────────────────────────────────

function clamp(min: number, max: number, v: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Score a workout 0–100.
 * @param sets - All sets from the workout
 * @param prs - exerciseId → estimated 1RM (from personal_records table)
 * @param recentAvgVolume - Average volume load over last 30 days (0 = no history)
 * @param prCount - Number of PRs hit this session
 */
export function scoreWorkout(
  sets: WorkoutSet[],
  prs: Record<number, number>,
  recentAvgVolume: number = 0,
  prCount: number = 0
): WorkoutScore {
  const workingSets = sets.filter(s => s.is_warmup === 0 && s.actual_weight != null);
  const volumeLoad = calculateVolumeLoad(sets);
  const inol = calculateSessionINOL(sets, prs);
  const muscleGroupVolume = calculateMuscleVolume(sets);

  // Unique exercises with logged sets
  const exerciseIds = new Set(workingSets.map(s => s.exercise_id));
  const exerciseCount = exerciseIds.size;

  // Volume percentile (how does today compare to average)
  let volumeScore = 0;
  if (recentAvgVolume > 0) {
    volumeScore = clamp(0, 100, (volumeLoad / recentAvgVolume) * 50);
  } else {
    // No history — score based on absolute volume
    volumeScore = clamp(0, 100, volumeLoad / 100); // rough heuristic
  }

  // INOL normalization: ideal session is 2–4 INOL
  // 0 INOL = 0, 2 INOL = 50, 4 INOL = 100
  const inolScore = clamp(0, 100, (inol / 4) * 100);

  // Muscle coverage: how many distinct muscles hit
  const musclesHit = Object.keys(muscleGroupVolume).length;
  const coverageScore = clamp(0, 100, (musclesHit / 10) * 100); // 10+ muscles = full coverage

  // PR bonus
  const prScore = clamp(0, 100, prCount * 33); // each PR worth ~33 points

  // Weighted combination
  const overallScore = Math.round(
    volumeScore * 0.4 +
    inolScore * 0.3 +
    coverageScore * 0.2 +
    prScore * 0.1
  );

  const classification = getClassification(overallScore);

  return {
    volumeLoad: Math.round(volumeLoad),
    inol,
    muscleGroupVolume,
    overallScore: clamp(0, 100, overallScore),
    classification,
    setsCompleted: workingSets.length,
    exerciseCount,
    prsHit: prCount,
  };
}

function getClassification(score: number): string {
  if (score >= 75) return 'Maximum Effort';
  if (score >= 50) return 'Hard';
  if (score >= 25) return 'Moderate';
  return 'Light Recovery';
}
