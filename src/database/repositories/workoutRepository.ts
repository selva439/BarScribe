import { type SQLiteDatabase } from 'expo-sqlite';
import { type Workout } from '../../types';
import { toISODate } from '../../utils/dateHelpers';

export async function createWorkout(
  db: SQLiteDatabase,
  data: {
    date?: string;
    user_program_id?: number | null;
    program_week?: number | null;
    program_day?: number | null;
    notes?: string | null;
  }
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO workouts (date, user_program_id, program_week, program_day, notes, completed)
     VALUES (?, ?, ?, ?, ?, 0)`,
    data.date ?? toISODate(new Date()),
    data.user_program_id ?? null,
    data.program_week ?? null,
    data.program_day ?? null,
    data.notes ?? null
  );
  return result.lastInsertRowId;
}

export async function getWorkoutById(
  db: SQLiteDatabase,
  id: number
): Promise<Workout | null> {
  return db.getFirstAsync<Workout>(
    'SELECT * FROM workouts WHERE id = ?',
    id
  );
}

export async function getTodayWorkout(
  db: SQLiteDatabase
): Promise<Workout | null> {
  const today = toISODate(new Date());
  return db.getFirstAsync<Workout>(
    'SELECT * FROM workouts WHERE date = ? ORDER BY id DESC LIMIT 1',
    today
  );
}

export async function getWorkoutsByDateRange(
  db: SQLiteDatabase,
  startDate: string,
  endDate: string
): Promise<Workout[]> {
  return db.getAllAsync<Workout>(
    'SELECT * FROM workouts WHERE date >= ? AND date <= ? ORDER BY date DESC',
    startDate,
    endDate
  );
}

export async function getAllWorkoutDates(
  db: SQLiteDatabase
): Promise<string[]> {
  const rows = await db.getAllAsync<{ date: string }>(
    'SELECT DISTINCT date FROM workouts ORDER BY date DESC'
  );
  return rows.map(r => r.date);
}

export async function completeWorkout(
  db: SQLiteDatabase,
  id: number
): Promise<void> {
  await db.runAsync(
    'UPDATE workouts SET completed = 1 WHERE id = ?',
    id
  );
}

export async function updateWorkoutNotes(
  db: SQLiteDatabase,
  id: number,
  notes: string
): Promise<void> {
  await db.runAsync('UPDATE workouts SET notes = ? WHERE id = ?', notes, id);
}

export async function deleteWorkout(
  db: SQLiteDatabase,
  id: number
): Promise<void> {
  await db.runAsync('DELETE FROM workout_sets WHERE workout_id = ?', id);
  await db.runAsync('DELETE FROM workouts WHERE id = ?', id);
}
