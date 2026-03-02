import { type SQLiteDatabase } from 'expo-sqlite';
import { type Program, type ProgramTemplate, type UserProgram } from '../../types';

export async function getPrograms(db: SQLiteDatabase): Promise<Program[]> {
  return db.getAllAsync<Program>('SELECT * FROM programs ORDER BY id');
}

export async function getProgramTemplate(
  db: SQLiteDatabase,
  programId: number,
  week: number,
  day: number
): Promise<ProgramTemplate[]> {
  return db.getAllAsync<ProgramTemplate>(
    `SELECT * FROM program_templates
     WHERE program_id = ? AND week = ? AND day = ?
     ORDER BY exercise_id, set_number`,
    programId,
    week,
    day
  );
}

export async function createUserProgram(
  db: SQLiteDatabase,
  data: {
    program_id: number;
    start_date: string;
    tm_squat?: number;
    tm_bench?: number;
    tm_deadlift?: number;
    tm_ohp?: number;
  }
): Promise<number> {
  // Deactivate any existing active programs
  await db.runAsync('UPDATE user_programs SET is_active = 0');

  const result = await db.runAsync(
    `INSERT INTO user_programs
       (program_id, start_date, current_week, current_day, tm_squat, tm_bench, tm_deadlift, tm_ohp, is_active)
     VALUES (?, ?, 1, 1, ?, ?, ?, ?, 1)`,
    data.program_id,
    data.start_date,
    data.tm_squat ?? null,
    data.tm_bench ?? null,
    data.tm_deadlift ?? null,
    data.tm_ohp ?? null
  );
  return result.lastInsertRowId;
}

export async function getActiveUserProgram(
  db: SQLiteDatabase
): Promise<UserProgram | null> {
  return db.getFirstAsync<UserProgram>(
    'SELECT * FROM user_programs WHERE is_active = 1 ORDER BY id DESC LIMIT 1'
  );
}

export async function updateUserProgramTMs(
  db: SQLiteDatabase,
  id: number,
  tms: { squat?: number; bench?: number; deadlift?: number; ohp?: number }
): Promise<void> {
  await db.runAsync(
    `UPDATE user_programs
     SET tm_squat = COALESCE(?, tm_squat),
         tm_bench = COALESCE(?, tm_bench),
         tm_deadlift = COALESCE(?, tm_deadlift),
         tm_ohp = COALESCE(?, tm_ohp)
     WHERE id = ?`,
    tms.squat ?? null,
    tms.bench ?? null,
    tms.deadlift ?? null,
    tms.ohp ?? null,
    id
  );
}

export async function advanceDay(
  db: SQLiteDatabase,
  userProgramId: number
): Promise<{ week: number; day: number }> {
  const prog = await db.getFirstAsync<UserProgram & { total_weeks: number; days_per_week: number }>(
    `SELECT up.*, p.total_weeks, p.days_per_week
     FROM user_programs up
     JOIN programs p ON p.id = up.program_id
     WHERE up.id = ?`,
    userProgramId
  );
  if (!prog) throw new Error(`UserProgram ${userProgramId} not found`);

  let { current_week, current_day } = prog;
  const { total_weeks, days_per_week } = prog;

  current_day += 1;
  if (current_day > days_per_week) {
    current_day = 1;
    current_week += 1;
    if (current_week > total_weeks) {
      current_week = 1; // Cycle back
    }
  }

  await db.runAsync(
    'UPDATE user_programs SET current_week = ?, current_day = ? WHERE id = ?',
    current_week,
    current_day,
    userProgramId
  );

  return { week: current_week, day: current_day };
}

export async function deactivateProgram(
  db: SQLiteDatabase,
  userProgramId: number
): Promise<void> {
  await db.runAsync(
    'UPDATE user_programs SET is_active = 0 WHERE id = ?',
    userProgramId
  );
}
