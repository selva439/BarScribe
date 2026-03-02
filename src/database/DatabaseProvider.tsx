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
  // Run DDL
  await db.execAsync(DB_SCHEMA);

  // Check if already seeded
  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM user_settings WHERE key = 'db_seeded'"
  );
  if (row?.value === '1') return;

  // Seed reference data
  await db.execAsync(SEED_EXERCISES);
  await db.execAsync(SEED_PROGRAMS);
  await db.execAsync(SEED_531_TEMPLATES);
  await db.execAsync(SEED_SMOLOV_JR_TEMPLATES);
  await db.execAsync(SEED_TEXAS_TEMPLATES);

  // Mark seeded
  await db.runAsync(
    "INSERT OR REPLACE INTO user_settings (key, value) VALUES ('db_seeded', '1')"
  );
}

interface Props {
  children: React.ReactNode;
}

export function DatabaseProvider({ children }: Props) {
  return (
    <SQLiteProvider databaseName="ironlog.db" onInit={initDb}>
      {children}
    </SQLiteProvider>
  );
}
