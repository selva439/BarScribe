import { type SQLiteDatabase } from 'expo-sqlite';
import { type UserSettings, type Units, type Sex } from '../../types';

export async function getSetting(
  db: SQLiteDatabase,
  key: string,
  defaultValue: string
): Promise<string> {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM user_settings WHERE key = ?',
    key
  );
  return row?.value ?? defaultValue;
}

export async function setSetting(
  db: SQLiteDatabase,
  key: string,
  value: string
): Promise<void> {
  await db.runAsync(
    'INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)',
    key,
    value
  );
}

export async function getUserSettings(db: SQLiteDatabase): Promise<UserSettings> {
  const rows = await db.getAllAsync<{ key: string; value: string }>(
    'SELECT key, value FROM user_settings'
  );
  const map = Object.fromEntries(rows.map(r => [r.key, r.value]));

  return {
    units: (map['units'] as Units) ?? 'kg',
    bodyweight: parseFloat(map['bodyweight'] ?? '80'),
    sex: (map['sex'] as Sex) ?? 'M',
    restTimerDuration: parseInt(map['rest_timer_duration'] ?? '180', 10),
    isInitialized: map['is_initialized'] === '1',
  };
}

export async function setUserSettings(
  db: SQLiteDatabase,
  settings: Partial<UserSettings>
): Promise<void> {
  const pairs: [string, string][] = [];
  if (settings.units != null) pairs.push(['units', settings.units]);
  if (settings.bodyweight != null) pairs.push(['bodyweight', String(settings.bodyweight)]);
  if (settings.sex != null) pairs.push(['sex', settings.sex]);
  if (settings.restTimerDuration != null)
    pairs.push(['rest_timer_duration', String(settings.restTimerDuration)]);
  if (settings.isInitialized != null)
    pairs.push(['is_initialized', settings.isInitialized ? '1' : '0']);

  for (const [key, value] of pairs) {
    await db.runAsync(
      'INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)',
      key,
      value
    );
  }
}
