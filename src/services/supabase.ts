import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { type SQLiteDatabase } from 'expo-sqlite';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export function isSupabaseConfigured(): boolean {
  return (
    supabaseUrl.length > 0 &&
    !supabaseUrl.includes('your-project') &&
    supabaseAnonKey.length > 0 &&
    !supabaseAnonKey.includes('your-anon')
  );
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// ─── Sync ─────────────────────────────────────────────────────────────────────

export async function syncToCloud(db: SQLiteDatabase): Promise<{ synced: number; errors: number }> {
  if (!isSupabaseConfigured()) return { synced: 0, errors: 0 };

  const user = await getCurrentUser();
  if (!user) return { synced: 0, errors: 0 };

  let synced = 0;
  let errors = 0;

  try {
    // Sync workouts
    const workouts = await db.getAllAsync<Record<string, unknown>>(
      'SELECT * FROM workouts'
    );
    if (workouts.length > 0) {
      const { error } = await supabase.from('workouts').upsert(
        workouts.map(w => ({ ...w, user_id: user.id })),
        { onConflict: 'id' }
      );
      if (error) errors++;
      else synced += workouts.length;
    }

    // Sync workout_sets
    const sets = await db.getAllAsync<Record<string, unknown>>(
      'SELECT * FROM workout_sets'
    );
    if (sets.length > 0) {
      const { error } = await supabase.from('workout_sets').upsert(
        sets.map(s => ({ ...s, user_id: user.id })),
        { onConflict: 'id' }
      );
      if (error) errors++;
      else synced += sets.length;
    }

    // Sync personal records
    const prs = await db.getAllAsync<Record<string, unknown>>(
      'SELECT * FROM personal_records'
    );
    if (prs.length > 0) {
      const { error } = await supabase.from('personal_records').upsert(
        prs.map(p => ({ ...p, user_id: user.id })),
        { onConflict: 'id' }
      );
      if (error) errors++;
      else synced += prs.length;
    }
  } catch (e) {
    console.warn('[Supabase] syncToCloud error:', e);
    errors++;
  }

  return { synced, errors };
}
