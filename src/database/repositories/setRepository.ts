import { type SQLiteDatabase } from 'expo-sqlite';
import { type WorkoutSet } from '../../types';
import { epley1RM } from '../../utils/calculators';
import { checkAndUpdatePR } from './prRepository';
import { toISODate } from '../../utils/dateHelpers';

export async function createSet(
  db: SQLiteDatabase,
  data: {
    workout_id: number;
    exercise_id: number;
    set_number: number;
    planned_weight?: number | null;
    planned_reps?: number | null;
    is_warmup?: boolean;
  }
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO workout_sets
       (workout_id, exercise_id, set_number, planned_weight, planned_reps, is_warmup)
     VALUES (?, ?, ?, ?, ?, ?)`,
    data.workout_id,
    data.exercise_id,
    data.set_number,
    data.planned_weight ?? null,
    data.planned_reps ?? null,
    data.is_warmup ? 1 : 0
  );
  return result.lastInsertRowId;
}

export async function logSet(
  db: SQLiteDatabase,
  setId: number,
  actualWeight: number,
  actualReps: number,
  rpe: number | null
): Promise<{ isNewPR: boolean }> {
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE workout_sets
     SET actual_weight = ?, actual_reps = ?, rpe = ?, completed_at = ?
     WHERE id = ?`,
    actualWeight,
    actualReps,
    rpe ?? null,
    now,
    setId
  );

  // Look up exercise_id for PR check
  const row = await db.getFirstAsync<{ exercise_id: number; is_warmup: number }>(
    'SELECT exercise_id, is_warmup FROM workout_sets WHERE id = ?',
    setId
  );
  if (!row || row.is_warmup === 1) return { isNewPR: false };

  const estimated1RM = epley1RM(actualWeight, actualReps);
  const isNewPR = await checkAndUpdatePR(
    db,
    row.exercise_id,
    actualWeight,
    actualReps,
    toISODate(new Date()),
    setId
  );

  return { isNewPR };
}

export async function getSetsForWorkout(
  db: SQLiteDatabase,
  workoutId: number
): Promise<WorkoutSet[]> {
  return db.getAllAsync<WorkoutSet>(
    `SELECT ws.*, e.name as exercise_name
     FROM workout_sets ws
     JOIN exercises e ON e.id = ws.exercise_id
     WHERE ws.workout_id = ?
     ORDER BY ws.exercise_id, ws.set_number`,
    workoutId
  );
}

export async function getLastPerformance(
  db: SQLiteDatabase,
  exerciseId: number,
  limit: number = 3
): Promise<WorkoutSet[]> {
  return db.getAllAsync<WorkoutSet>(
    `SELECT ws.*
     FROM workout_sets ws
     WHERE ws.exercise_id = ?
       AND ws.actual_weight IS NOT NULL
       AND ws.is_warmup = 0
     ORDER BY ws.completed_at DESC
     LIMIT ?`,
    exerciseId,
    limit
  );
}

export async function deleteSetsForExercise(
  db: SQLiteDatabase,
  workoutId: number,
  exerciseId: number
): Promise<void> {
  // Clear any PR references to these sets first (FK constraint)
  await db.runAsync(
    `UPDATE personal_records SET workout_set_id = NULL
     WHERE workout_set_id IN (
       SELECT id FROM workout_sets WHERE workout_id = ? AND exercise_id = ?
     )`,
    workoutId,
    exerciseId
  );
  await db.runAsync(
    'DELETE FROM workout_sets WHERE workout_id = ? AND exercise_id = ?',
    workoutId,
    exerciseId
  );
}

export async function getSetById(
  db: SQLiteDatabase,
  id: number
): Promise<WorkoutSet | null> {
  return db.getFirstAsync<WorkoutSet>(
    'SELECT * FROM workout_sets WHERE id = ?',
    id
  );
}
