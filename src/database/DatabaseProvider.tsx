import React from 'react';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import {
  DB_SCHEMA,
  SEED_EXERCISES,
  SEED_PROGRAMS,
  SEED_531_TEMPLATES,
  SEED_SMOLOV_JR_TEMPLATES,
  SEED_TEXAS_TEMPLATES,
} from './schema';

export async function initDb(db: SQLiteDatabase): Promise<void> {
  // Disable FK checks during init to avoid failures on orphaned data
  await db.execAsync('PRAGMA foreign_keys = OFF;');

  // Run DDL (creates tables + indexes, sets WAL mode)
  await db.execAsync(DB_SCHEMA);

  // Always run exercises seed (INSERT OR IGNORE is safe for new additions)
  await db.execAsync(SEED_EXERCISES);

  // Check if already seeded for programs/templates
  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM user_settings WHERE key = 'db_seeded'"
  );
  if (row?.value !== '1') {
    // Seed reference data
    await db.execAsync(SEED_PROGRAMS);
    await db.execAsync(SEED_531_TEMPLATES);
    await db.execAsync(SEED_SMOLOV_JR_TEMPLATES);
    await db.execAsync(SEED_TEXAS_TEMPLATES);

    // Mark seeded
    await db.runAsync(
      "INSERT OR REPLACE INTO user_settings (key, value) VALUES ('db_seeded', '1')"
    );
  }

  // Clean up orphaned FK references
  await db.execAsync(`
    UPDATE personal_records SET workout_set_id = NULL
    WHERE workout_set_id IS NOT NULL
      AND workout_set_id NOT IN (SELECT id FROM workout_sets);

    DELETE FROM personal_records
    WHERE exercise_id NOT IN (SELECT id FROM exercises);

    DELETE FROM workout_sets
    WHERE exercise_id NOT IN (SELECT id FROM exercises);

    DELETE FROM workout_sets
    WHERE workout_id NOT IN (SELECT id FROM workouts);
  `);

  // Re-enable FK checks
  await db.execAsync('PRAGMA foreign_keys = ON;');
}

interface Props {
  children: React.ReactNode;
}

export function DatabaseProvider({ children }: Props) {
  return (
    <SQLiteProvider databaseName="barscribe.db" onInit={initDb}>
      {children}
    </SQLiteProvider>
  );
}
