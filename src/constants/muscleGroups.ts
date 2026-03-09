import { type MuscleId } from '../types';

// ─── Exercise → Muscle Mapping ───────────────────────────────────────────────
// Each exercise maps to primary muscles (full set credit) and secondary muscles (0.5 credit)

export const MUSCLE_MAP: Record<number, { primary: MuscleId[]; secondary: MuscleId[] }> = {
  // Competition lifts
  1:  { primary: ['quads', 'glutes'],       secondary: ['hamstrings', 'core', 'lower_back'] },          // Squat
  2:  { primary: ['chest', 'triceps'],      secondary: ['front_delts'] },                                // Bench Press
  3:  { primary: ['hamstrings', 'glutes', 'lower_back'], secondary: ['quads', 'lats', 'forearms', 'traps'] }, // Deadlift

  // Accessories
  4:  { primary: ['front_delts', 'side_delts'], secondary: ['triceps', 'core'] },                        // Overhead Press
  5:  { primary: ['lats', 'upper_back'],    secondary: ['biceps', 'rear_delts', 'forearms'] },           // Barbell Row
  6:  { primary: ['triceps', 'chest'],      secondary: ['front_delts'] },                                // Close Grip Bench
  7:  { primary: ['hamstrings', 'lower_back'], secondary: ['glutes', 'core'] },                          // Good Morning
  8:  { primary: ['hamstrings', 'glutes'],  secondary: ['lower_back', 'forearms'] },                     // Romanian Deadlift
  9:  { primary: ['quads', 'core'],         secondary: ['glutes', 'upper_back'] },                       // Front Squat
  10: { primary: ['chest', 'front_delts'],  secondary: ['triceps'] },                                    // Incline Bench
  11: { primary: ['quads', 'glutes'],       secondary: ['hamstrings'] },                                 // Leg Press
  12: { primary: ['chest', 'triceps'],      secondary: ['front_delts', 'core'] },                        // Dip
  13: { primary: ['lats', 'biceps'],        secondary: ['upper_back', 'forearms', 'core'] },             // Pull-Up
  14: { primary: ['lats'],                  secondary: ['biceps', 'rear_delts'] },                       // Lat Pulldown
  15: { primary: ['upper_back', 'lats'],    secondary: ['biceps', 'rear_delts'] },                       // Cable Row
  16: { primary: ['glutes'],                secondary: ['hamstrings', 'core'] },                         // Hip Thrust
  17: { primary: ['hamstrings'],            secondary: ['calves'] },                                     // Leg Curl
  18: { primary: ['quads', 'glutes'],       secondary: ['hamstrings', 'core', 'lower_back'] },           // Pause Squat
  19: { primary: ['chest', 'triceps'],      secondary: ['front_delts'] },                                // Pause Bench
  20: { primary: ['glutes', 'quads', 'lower_back'], secondary: ['hamstrings', 'forearms', 'traps'] },    // Sumo Deadlift
  21: { primary: ['quads', 'glutes'],       secondary: ['hamstrings', 'core'] },                         // Bulgarian Split Squat
  22: { primary: ['triceps'],               secondary: [] },                                             // Tricep Pushdown
  23: { primary: ['biceps'],                secondary: ['forearms'] },                                   // Bicep Curl
  24: { primary: ['rear_delts', 'upper_back'], secondary: ['traps'] },                                  // Face Pull
  25: { primary: ['side_delts'],            secondary: [] },                                             // Lateral Raise
};

// ─── Display Labels ──────────────────────────────────────────────────────────

export const MUSCLE_LABELS: Record<MuscleId, string> = {
  quads: 'Quadriceps',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  chest: 'Chest',
  front_delts: 'Front Delts',
  side_delts: 'Side Delts',
  rear_delts: 'Rear Delts',
  lats: 'Lats',
  upper_back: 'Upper Back',
  traps: 'Traps',
  triceps: 'Triceps',
  biceps: 'Biceps',
  forearms: 'Forearms',
  core: 'Core',
  calves: 'Calves',
  lower_back: 'Lower Back',
  hip_flexors: 'Hip Flexors',
};

// ─── Simple Category Mapping (for exercise picker sections) ──────────────────

export function getMuscleCategory(exerciseId: number): string {
  const mapping = MUSCLE_MAP[exerciseId];
  if (!mapping) return 'Other';
  const primary = mapping.primary[0];
  if (!primary) return 'Other';
  if (['quads', 'hamstrings', 'glutes', 'calves', 'hip_flexors'].includes(primary)) return 'Legs';
  if (['chest'].includes(primary)) return 'Chest';
  if (['lats', 'upper_back', 'lower_back'].includes(primary)) return 'Back';
  if (['front_delts', 'side_delts', 'rear_delts'].includes(primary)) return 'Shoulders';
  if (['triceps', 'biceps', 'forearms'].includes(primary)) return 'Arms';
  if (['core'].includes(primary)) return 'Core';
  return 'Other';
}
