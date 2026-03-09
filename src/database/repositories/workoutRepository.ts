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

export async function getWeeklyWorkoutCounts(
  db: SQLiteDatabase,
  weeks: number = 12
): Promise<{ week: string; count: number }[]> {
  const rows = await db.getAllAsync<{ week: string; count: number }>(
    `SELECT strftime('%Y-W%W', date) as week, COUNT(DISTINCT date) as count
     FROM workouts
     WHERE date >= date('now', '-' || ? || ' days')
     GROUP BY week
     ORDER BY week ASC`,
    weeks * 7
  );
  return rows;
}

export async function getTrainingStreak(
  db: SQLiteDatabase
): Promise<{ currentStreak: number; longestStreak: number; totalWorkouts: number; thisWeek: number }> {
  const dates = await db.getAllAsync<{ date: string }>(
    'SELECT DISTINCT date FROM workouts ORDER BY date DESC'
  );

  const totalWorkouts = dates.length;
  if (dates.length === 0) return { currentStreak: 0, longestStreak: 0, totalWorkouts: 0, thisWeek: 0 };

  // This week count (Mon-Sun)
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const mondayStr = monday.toISOString().split('T')[0];
  const thisWeek = dates.filter(d => d.date >= mondayStr).length;

  // Get Monday of each date to determine which week it belongs to
  function getWeekMonday(dateStr: string): string {
    const d = new Date(dateStr);
    const day = (d.getDay() + 6) % 7; // Mon=0
    d.setDate(d.getDate() - day);
    return d.toISOString().split('T')[0];
  }

  // Unique weeks that had workouts (as Monday dates)
  const activeWeeks = new Set<string>();
  for (const d of dates) {
    activeWeeks.add(getWeekMonday(d.date));
  }

  // Sort weeks descending
  const sortedWeeks = [...activeWeeks].sort().reverse();

  // Current streak: consecutive weeks from most recent going back
  let currentStreak = 0;
  const currentMonday = getWeekMonday(now.toISOString().split('T')[0]);
  let checkMonday = new Date(currentMonday);

  for (let i = 0; i < 52; i++) {
    const weekStr = checkMonday.toISOString().split('T')[0];
    if (activeWeeks.has(weekStr)) {
      currentStreak++;
    } else {
      break;
    }
    checkMonday.setDate(checkMonday.getDate() - 7);
  }

  // Longest streak: scan all weeks
  let longestStreak = 0;
  let streak = 0;

  // Check every week from oldest to newest
  if (sortedWeeks.length > 0) {
    const oldest = new Date(sortedWeeks[sortedWeeks.length - 1]);
    const newest = new Date(sortedWeeks[0]);
    const scanDate = new Date(oldest);

    while (scanDate <= newest) {
      const weekStr = scanDate.toISOString().split('T')[0];
      if (activeWeeks.has(weekStr)) {
        streak++;
        longestStreak = Math.max(longestStreak, streak);
      } else {
        streak = 0;
      }
      scanDate.setDate(scanDate.getDate() + 7);
    }
  }

  return { currentStreak, longestStreak, totalWorkouts, thisWeek };
}

export async function deleteWorkout(
  db: SQLiteDatabase,
  id: number
): Promise<void> {
  await db.runAsync('DELETE FROM workout_sets WHERE workout_id = ?', id);
  await db.runAsync('DELETE FROM workouts WHERE id = ?', id);
}
