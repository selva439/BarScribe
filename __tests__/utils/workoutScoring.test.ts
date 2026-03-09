import {
  calculateVolumeLoad,
  calculateExerciseINOL,
  calculateMuscleVolume,
  scoreWorkout,
} from '../../src/utils/workoutScoring';
import { type WorkoutSet } from '../../src/types';

// Helper to create a mock WorkoutSet
function makeSet(overrides: Partial<WorkoutSet> = {}): WorkoutSet {
  return {
    id: 1,
    workout_id: 1,
    exercise_id: 1,
    set_number: 1,
    planned_weight: null,
    planned_reps: null,
    actual_weight: 100,
    actual_reps: 5,
    rpe: null,
    is_warmup: 0,
    completed_at: null,
    ...overrides,
  };
}

// ─── Volume Load ────────────────────────────────────────────────────────────

describe('calculateVolumeLoad', () => {
  it('sums weight × reps for working sets', () => {
    const sets = [
      makeSet({ actual_weight: 100, actual_reps: 5 }),
      makeSet({ actual_weight: 100, actual_reps: 5 }),
      makeSet({ actual_weight: 100, actual_reps: 5 }),
    ];
    expect(calculateVolumeLoad(sets)).toBe(1500);
  });

  it('excludes warmup sets', () => {
    const sets = [
      makeSet({ actual_weight: 60, actual_reps: 5, is_warmup: 1 }),
      makeSet({ actual_weight: 100, actual_reps: 5, is_warmup: 0 }),
    ];
    expect(calculateVolumeLoad(sets)).toBe(500);
  });

  it('excludes sets with null weight or reps', () => {
    const sets = [
      makeSet({ actual_weight: null, actual_reps: 5 }),
      makeSet({ actual_weight: 100, actual_reps: null }),
      makeSet({ actual_weight: 100, actual_reps: 5 }),
    ];
    expect(calculateVolumeLoad(sets)).toBe(500);
  });

  it('returns 0 for empty array', () => {
    expect(calculateVolumeLoad([])).toBe(0);
  });
});

// ─── INOL ───────────────────────────────────────────────────────────────────

describe('calculateExerciseINOL', () => {
  it('returns 0 for zero 1RM', () => {
    expect(calculateExerciseINOL([makeSet()], 0)).toBe(0);
  });

  it('calculates correctly at 80% intensity', () => {
    // 5 reps at 80kg with 100kg 1RM → intensity = 80%
    // INOL = 5 / (100 - 80) = 5/20 = 0.25
    const sets = [makeSet({ actual_weight: 80, actual_reps: 5 })];
    expect(calculateExerciseINOL(sets, 100)).toBeCloseTo(0.25, 2);
  });

  it('sums across multiple sets', () => {
    const sets = [
      makeSet({ actual_weight: 80, actual_reps: 5 }),
      makeSet({ actual_weight: 80, actual_reps: 5 }),
      makeSet({ actual_weight: 80, actual_reps: 5 }),
    ];
    // 3 × 0.25 = 0.75
    expect(calculateExerciseINOL(sets, 100)).toBeCloseTo(0.75, 2);
  });

  it('caps at very high intensity (>=100%)', () => {
    const sets = [makeSet({ actual_weight: 105, actual_reps: 1 })];
    const inol = calculateExerciseINOL(sets, 100);
    expect(inol).toBeCloseTo(0.1, 2); // capped: reps * 0.1
  });

  it('excludes warmup sets', () => {
    const sets = [
      makeSet({ actual_weight: 60, actual_reps: 5, is_warmup: 1 }),
      makeSet({ actual_weight: 80, actual_reps: 5, is_warmup: 0 }),
    ];
    expect(calculateExerciseINOL(sets, 100)).toBeCloseTo(0.25, 2);
  });
});

// ─── Muscle Volume ──────────────────────────────────────────────────────────

describe('calculateMuscleVolume', () => {
  it('counts primary muscles at 1.0 per set', () => {
    // Exercise 1 = Squat, primary: quads, glutes
    const sets = [
      makeSet({ exercise_id: 1 }),
      makeSet({ exercise_id: 1 }),
      makeSet({ exercise_id: 1 }),
    ];
    const volume = calculateMuscleVolume(sets);
    expect(volume.quads).toBe(3);
    expect(volume.glutes).toBe(3);
  });

  it('counts secondary muscles at 0.5 per set', () => {
    // Exercise 1 = Squat, secondary: hamstrings, core, lower_back
    const sets = [makeSet({ exercise_id: 1 }), makeSet({ exercise_id: 1 })];
    const volume = calculateMuscleVolume(sets);
    expect(volume.hamstrings).toBe(1); // 2 × 0.5
    expect(volume.core).toBe(1);
  });

  it('combines volume from multiple exercises', () => {
    const sets = [
      makeSet({ exercise_id: 1 }), // Squat: quads primary
      makeSet({ exercise_id: 9 }), // Front Squat: quads primary
    ];
    const volume = calculateMuscleVolume(sets);
    expect(volume.quads).toBe(2);
  });

  it('excludes warmup sets', () => {
    const sets = [
      makeSet({ exercise_id: 1, is_warmup: 1 }),
      makeSet({ exercise_id: 1, is_warmup: 0 }),
    ];
    const volume = calculateMuscleVolume(sets);
    expect(volume.quads).toBe(1);
  });

  it('returns empty object for no sets', () => {
    expect(calculateMuscleVolume([])).toEqual({});
  });
});

// ─── Score Workout ──────────────────────────────────────────────────────────

describe('scoreWorkout', () => {
  const typicalSets = [
    makeSet({ exercise_id: 1, actual_weight: 100, actual_reps: 5, set_number: 1 }),
    makeSet({ exercise_id: 1, actual_weight: 100, actual_reps: 5, set_number: 2 }),
    makeSet({ exercise_id: 1, actual_weight: 100, actual_reps: 5, set_number: 3 }),
    makeSet({ exercise_id: 2, actual_weight: 80, actual_reps: 5, set_number: 1 }),
    makeSet({ exercise_id: 2, actual_weight: 80, actual_reps: 5, set_number: 2 }),
    makeSet({ exercise_id: 2, actual_weight: 80, actual_reps: 5, set_number: 3 }),
  ];

  it('returns a score between 0 and 100', () => {
    const result = scoreWorkout(typicalSets, {});
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
  });

  it('calculates volume load', () => {
    const result = scoreWorkout(typicalSets, {});
    // (100*5*3) + (80*5*3) = 1500 + 1200 = 2700
    expect(result.volumeLoad).toBe(2700);
  });

  it('counts sets completed (excluding warmups)', () => {
    const result = scoreWorkout(typicalSets, {});
    expect(result.setsCompleted).toBe(6);
  });

  it('counts distinct exercises', () => {
    const result = scoreWorkout(typicalSets, {});
    expect(result.exerciseCount).toBe(2);
  });

  it('classifies score correctly', () => {
    const result = scoreWorkout(typicalSets, {}, 2700, 0);
    expect(['Light Recovery', 'Moderate', 'Hard', 'Maximum Effort']).toContain(result.classification);
  });

  it('PR count affects score', () => {
    const noPR = scoreWorkout(typicalSets, {}, 2700, 0);
    const withPR = scoreWorkout(typicalSets, {}, 2700, 3);
    expect(withPR.overallScore).toBeGreaterThanOrEqual(noPR.overallScore);
  });

  it('records prsHit in result', () => {
    const result = scoreWorkout(typicalSets, {}, 0, 2);
    expect(result.prsHit).toBe(2);
  });

  it('handles empty sets', () => {
    const result = scoreWorkout([], {});
    expect(result.overallScore).toBe(0);
    expect(result.volumeLoad).toBe(0);
    expect(result.setsCompleted).toBe(0);
  });

  it('higher volume relative to average gives higher score', () => {
    const lowAvg = scoreWorkout(typicalSets, {}, 5000, 0); // below average
    const highAvg = scoreWorkout(typicalSets, {}, 1000, 0); // above average
    expect(highAvg.overallScore).toBeGreaterThan(lowAvg.overallScore);
  });
});
