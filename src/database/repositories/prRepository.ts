import { type SQLiteDatabase } from 'expo-sqlite';
import { type PersonalRecord, type AllPRs } from '../../types';
import { epley1RM } from '../../utils/calculators';

export async function checkAndUpdatePR(
  db: SQLiteDatabase,
  exerciseId: number,
  weight: number,
  reps: number,
  date: string,
  workoutSetId: number
): Promise<boolean> {
  const estimated1RM = epley1RM(weight, reps);

  // Find existing best estimated 1RM for this exercise
  const existing = await db.getFirstAsync<{ estimated_1rm: number }>(
    'SELECT MAX(estimated_1rm) as estimated_1rm FROM personal_records WHERE exercise_id = ?',
    exerciseId
  );

  if (existing?.estimated_1rm != null && estimated1RM <= existing.estimated_1rm) {
    return false;
  }

  // New PR!
  await db.runAsync(
    `INSERT INTO personal_records
       (exercise_id, weight, reps, estimated_1rm, date, workout_set_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    exerciseId,
    weight,
    reps,
    estimated1RM,
    date,
    workoutSetId
  );
  return true;
}

export async function getPRsForExercise(
  db: SQLiteDatabase,
  exerciseId: number
): Promise<PersonalRecord[]> {
  return db.getAllAsync<PersonalRecord>(
    `SELECT pr.*, e.name as exercise_name
     FROM personal_records pr
     JOIN exercises e ON e.id = pr.exercise_id
     WHERE pr.exercise_id = ?
     ORDER BY pr.estimated_1rm DESC`,
    exerciseId
  );
}

export async function getAllPRs(db: SQLiteDatabase): Promise<AllPRs> {
  const rows = await db.getAllAsync<PersonalRecord & { exercise_name: string }>(
    `SELECT pr.*, e.name as exercise_name
     FROM personal_records pr
     JOIN exercises e ON e.id = pr.exercise_id
     WHERE pr.estimated_1rm = (
       SELECT MAX(pr2.estimated_1rm)
       FROM personal_records pr2
       WHERE pr2.exercise_id = pr.exercise_id
     )`
  );

  const result: AllPRs = {};
  for (const row of rows) {
    result[row.exercise_name] = row;
  }
  return result;
}

export async function getPRHistory(
  db: SQLiteDatabase,
  exerciseId: number,
  limit: number = 50
): Promise<PersonalRecord[]> {
  return db.getAllAsync<PersonalRecord>(
    `SELECT * FROM personal_records
     WHERE exercise_id = ?
     ORDER BY date ASC
     LIMIT ?`,
    exerciseId,
    limit
  );
}

export async function getBestPRForExercise(
  db: SQLiteDatabase,
  exerciseId: number
): Promise<PersonalRecord | null> {
  return db.getFirstAsync<PersonalRecord>(
    `SELECT pr.*, e.name as exercise_name
     FROM personal_records pr
     JOIN exercises e ON e.id = pr.exercise_id
     WHERE pr.exercise_id = ?
     ORDER BY pr.estimated_1rm DESC
     LIMIT 1`,
    exerciseId
  );
}
