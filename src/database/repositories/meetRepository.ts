import { type SQLiteDatabase } from 'expo-sqlite';
import { type Meet, type MeetAttempt } from '../../types';

export async function createMeet(
  db: SQLiteDatabase,
  data: {
    name: string;
    date: string;
    bodyweight?: number | null;
    weight_class?: string | null;
    notes?: string | null;
  }
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO meets (name, date, bodyweight, weight_class, notes)
     VALUES (?, ?, ?, ?, ?)`,
    data.name,
    data.date,
    data.bodyweight ?? null,
    data.weight_class ?? null,
    data.notes ?? null
  );
  return result.lastInsertRowId;
}

export async function getMeets(db: SQLiteDatabase): Promise<Meet[]> {
  return db.getAllAsync<Meet>('SELECT * FROM meets ORDER BY date DESC');
}

export async function getMeetById(
  db: SQLiteDatabase,
  id: number
): Promise<Meet | null> {
  return db.getFirstAsync<Meet>('SELECT * FROM meets WHERE id = ?', id);
}

export async function getMeetWithAttempts(
  db: SQLiteDatabase,
  meetId: number
): Promise<{ meet: Meet; attempts: MeetAttempt[] }> {
  const meet = await db.getFirstAsync<Meet>(
    'SELECT * FROM meets WHERE id = ?',
    meetId
  );
  if (!meet) throw new Error(`Meet ${meetId} not found`);

  const attempts = await db.getAllAsync<MeetAttempt>(
    `SELECT ma.*, e.name as exercise_name
     FROM meet_attempts ma
     JOIN exercises e ON e.id = ma.exercise_id
     WHERE ma.meet_id = ?
     ORDER BY ma.exercise_id, ma.attempt_number`,
    meetId
  );

  return { meet, attempts };
}

export async function saveMeetAttempts(
  db: SQLiteDatabase,
  meetId: number,
  attempts: Omit<MeetAttempt, 'id'>[]
): Promise<void> {
  // Delete existing and re-insert
  await db.runAsync('DELETE FROM meet_attempts WHERE meet_id = ?', meetId);

  for (const attempt of attempts) {
    await db.runAsync(
      `INSERT INTO meet_attempts
         (meet_id, exercise_id, attempt_number, planned_weight, actual_weight, is_good_lift)
       VALUES (?, ?, ?, ?, ?, ?)`,
      meetId,
      attempt.exercise_id,
      attempt.attempt_number,
      attempt.planned_weight,
      attempt.actual_weight ?? null,
      attempt.is_good_lift ?? null
    );
  }
}

export async function updateMeet(
  db: SQLiteDatabase,
  id: number,
  data: Partial<Omit<Meet, 'id'>>
): Promise<void> {
  const fields = [];
  const values: (string | number | null)[] = [];

  if (data.name != null) { fields.push('name = ?'); values.push(data.name); }
  if (data.date != null) { fields.push('date = ?'); values.push(data.date); }
  if (data.bodyweight != null) { fields.push('bodyweight = ?'); values.push(data.bodyweight); }
  if (data.weight_class != null) { fields.push('weight_class = ?'); values.push(data.weight_class); }
  if (data.notes != null) { fields.push('notes = ?'); values.push(data.notes); }

  if (fields.length === 0) return;
  values.push(id);

  await db.runAsync(
    `UPDATE meets SET ${fields.join(', ')} WHERE id = ?`,
    ...values
  );
}

export async function deleteMeet(
  db: SQLiteDatabase,
  id: number
): Promise<void> {
  await db.runAsync('DELETE FROM meet_attempts WHERE meet_id = ?', id);
  await db.runAsync('DELETE FROM meets WHERE id = ?', id);
}
