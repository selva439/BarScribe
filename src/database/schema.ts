// ─── SQLite Schema — All CREATE TABLE + INDEX statements ─────────────────────

export const DB_SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  is_competition_lift INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS programs (
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  total_weeks INTEGER NOT NULL,
  days_per_week INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS program_templates (
  id INTEGER PRIMARY KEY NOT NULL,
  program_id INTEGER NOT NULL,
  week INTEGER NOT NULL,
  day INTEGER NOT NULL,
  exercise_id INTEGER NOT NULL,
  set_number INTEGER NOT NULL,
  planned_reps INTEGER NOT NULL,
  percentage REAL NOT NULL,
  is_amrap INTEGER DEFAULT 0,
  FOREIGN KEY (program_id) REFERENCES programs(id),
  FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

CREATE TABLE IF NOT EXISTS user_programs (
  id INTEGER PRIMARY KEY NOT NULL,
  program_id INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  current_week INTEGER DEFAULT 1,
  current_day INTEGER DEFAULT 1,
  tm_squat REAL,
  tm_bench REAL,
  tm_deadlift REAL,
  tm_ohp REAL,
  is_active INTEGER DEFAULT 1,
  FOREIGN KEY (program_id) REFERENCES programs(id)
);

CREATE TABLE IF NOT EXISTS workouts (
  id INTEGER PRIMARY KEY NOT NULL,
  date TEXT NOT NULL,
  user_program_id INTEGER,
  program_week INTEGER,
  program_day INTEGER,
  notes TEXT,
  completed INTEGER DEFAULT 0,
  FOREIGN KEY (user_program_id) REFERENCES user_programs(id)
);

CREATE TABLE IF NOT EXISTS workout_sets (
  id INTEGER PRIMARY KEY NOT NULL,
  workout_id INTEGER NOT NULL,
  exercise_id INTEGER NOT NULL,
  set_number INTEGER NOT NULL,
  planned_weight REAL,
  planned_reps INTEGER,
  actual_weight REAL,
  actual_reps INTEGER,
  rpe REAL,
  is_warmup INTEGER DEFAULT 0,
  completed_at TEXT,
  FOREIGN KEY (workout_id) REFERENCES workouts(id),
  FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

CREATE TABLE IF NOT EXISTS personal_records (
  id INTEGER PRIMARY KEY NOT NULL,
  exercise_id INTEGER NOT NULL,
  weight REAL NOT NULL,
  reps INTEGER NOT NULL,
  estimated_1rm REAL NOT NULL,
  date TEXT NOT NULL,
  workout_set_id INTEGER,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id),
  FOREIGN KEY (workout_set_id) REFERENCES workout_sets(id)
);

CREATE TABLE IF NOT EXISTS meets (
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  bodyweight REAL,
  weight_class TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS meet_attempts (
  id INTEGER PRIMARY KEY NOT NULL,
  meet_id INTEGER NOT NULL,
  exercise_id INTEGER NOT NULL,
  attempt_number INTEGER NOT NULL,
  planned_weight REAL NOT NULL,
  actual_weight REAL,
  is_good_lift INTEGER,
  FOREIGN KEY (meet_id) REFERENCES meets(id),
  FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

CREATE TABLE IF NOT EXISTS user_settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
CREATE INDEX IF NOT EXISTS idx_workout_sets_workout ON workout_sets(workout_id);
CREATE INDEX IF NOT EXISTS idx_prs_exercise ON personal_records(exercise_id);
CREATE INDEX IF NOT EXISTS idx_prs_date ON personal_records(date);
CREATE INDEX IF NOT EXISTS idx_templates_program ON program_templates(program_id, week, day);
`;

// ─── Seed Data ────────────────────────────────────────────────────────────────

export const SEED_EXERCISES = `
INSERT OR IGNORE INTO exercises (id, name, category, is_competition_lift) VALUES
  (1, 'Squat', 'competition', 1),
  (2, 'Bench Press', 'competition', 1),
  (3, 'Deadlift', 'competition', 1),
  (4, 'Overhead Press', 'accessory', 0),
  (5, 'Barbell Row', 'accessory', 0),
  (6, 'Close Grip Bench', 'accessory', 0),
  (7, 'Good Morning', 'accessory', 0),
  (8, 'Romanian Deadlift', 'accessory', 0),
  (9, 'Front Squat', 'accessory', 0),
  (10, 'Incline Bench', 'accessory', 0);
`;

export const SEED_PROGRAMS = `
INSERT OR IGNORE INTO programs (id, name, description, total_weeks, days_per_week) VALUES
  (1, '5/3/1', 'Jim Wendler 4-week wave loading program', 4, 4),
  (2, 'Smolov Jr', '3-week high frequency peaking block', 3, 4),
  (3, 'Texas Method', 'Glenn Pendlay Volume/Recovery/Intensity 3-day program', 12, 3);
`;

// 5/3/1 template — 4 weeks × 4 days, 3 main sets per day
// Day1=Squat, Day2=Bench, Day3=Deadlift, Day4=OHP
// exercise_id per day: 1=Squat, 2=Bench, 3=Deadlift, 4=OHP
export const SEED_531_TEMPLATES = `
INSERT OR IGNORE INTO program_templates
  (id, program_id, week, day, exercise_id, set_number, planned_reps, percentage, is_amrap)
VALUES
  -- Week 1: 5x65%, 5x75%, 5+x85%
  (1,  1, 1, 1, 1, 1, 5, 0.65, 0), (2,  1, 1, 1, 1, 2, 5, 0.75, 0), (3,  1, 1, 1, 1, 3, 5, 0.85, 1),
  (4,  1, 1, 2, 2, 1, 5, 0.65, 0), (5,  1, 1, 2, 2, 2, 5, 0.75, 0), (6,  1, 1, 2, 2, 3, 5, 0.85, 1),
  (7,  1, 1, 3, 3, 1, 5, 0.65, 0), (8,  1, 1, 3, 3, 2, 5, 0.75, 0), (9,  1, 1, 3, 3, 3, 5, 0.85, 1),
  (10, 1, 1, 4, 4, 1, 5, 0.65, 0), (11, 1, 1, 4, 4, 2, 5, 0.75, 0), (12, 1, 1, 4, 4, 3, 5, 0.85, 1),
  -- Week 2: 3x70%, 3x80%, 3+x90%
  (13, 1, 2, 1, 1, 1, 3, 0.70, 0), (14, 1, 2, 1, 1, 2, 3, 0.80, 0), (15, 1, 2, 1, 1, 3, 3, 0.90, 1),
  (16, 1, 2, 2, 2, 1, 3, 0.70, 0), (17, 1, 2, 2, 2, 2, 3, 0.80, 0), (18, 1, 2, 2, 2, 3, 3, 0.90, 1),
  (19, 1, 2, 3, 3, 1, 3, 0.70, 0), (20, 1, 2, 3, 3, 2, 3, 0.80, 0), (21, 1, 2, 3, 3, 3, 3, 0.90, 1),
  (22, 1, 2, 4, 4, 1, 3, 0.70, 0), (23, 1, 2, 4, 4, 2, 3, 0.80, 0), (24, 1, 2, 4, 4, 3, 3, 0.90, 1),
  -- Week 3: 5x75%, 3x85%, 1+x95%
  (25, 1, 3, 1, 1, 1, 5, 0.75, 0), (26, 1, 3, 1, 1, 2, 3, 0.85, 0), (27, 1, 3, 1, 1, 3, 1, 0.95, 1),
  (28, 1, 3, 2, 2, 1, 5, 0.75, 0), (29, 1, 3, 2, 2, 2, 3, 0.85, 0), (30, 1, 3, 2, 2, 3, 1, 0.95, 1),
  (31, 1, 3, 3, 3, 1, 5, 0.75, 0), (32, 1, 3, 3, 3, 2, 3, 0.85, 0), (33, 1, 3, 3, 3, 3, 1, 0.95, 1),
  (34, 1, 3, 4, 4, 1, 5, 0.75, 0), (35, 1, 3, 4, 4, 2, 3, 0.85, 0), (36, 1, 3, 4, 4, 3, 1, 0.95, 1),
  -- Week 4 Deload: 5x40%, 5x50%, 5x60%
  (37, 1, 4, 1, 1, 1, 5, 0.40, 0), (38, 1, 4, 1, 1, 2, 5, 0.50, 0), (39, 1, 4, 1, 1, 3, 5, 0.60, 0),
  (40, 1, 4, 2, 2, 1, 5, 0.40, 0), (41, 1, 4, 2, 2, 2, 5, 0.50, 0), (42, 1, 4, 2, 2, 3, 5, 0.60, 0),
  (43, 1, 4, 3, 3, 1, 5, 0.40, 0), (44, 1, 4, 3, 3, 2, 5, 0.50, 0), (45, 1, 4, 3, 3, 3, 5, 0.60, 0),
  (46, 1, 4, 4, 4, 1, 5, 0.40, 0), (47, 1, 4, 4, 4, 2, 5, 0.50, 0), (48, 1, 4, 4, 4, 3, 5, 0.60, 0);
`;

// Smolov Jr template — 3 weeks × 4 days (exercise_id will be set at runtime based on user selection)
// We use exercise_id=1 (Squat) as placeholder; generator overrides at runtime
export const SEED_SMOLOV_JR_TEMPLATES = `
INSERT OR IGNORE INTO program_templates
  (id, program_id, week, day, exercise_id, set_number, planned_reps, percentage, is_amrap)
VALUES
  -- Week 1
  (101, 2, 1, 1, 1, 1, 6, 0.70, 0), (102, 2, 1, 1, 1, 2, 6, 0.70, 0), (103, 2, 1, 1, 1, 3, 6, 0.70, 0),
  (104, 2, 1, 1, 1, 4, 6, 0.70, 0), (105, 2, 1, 1, 1, 5, 6, 0.70, 0), (106, 2, 1, 1, 1, 6, 6, 0.70, 0),
  (107, 2, 1, 2, 1, 1, 5, 0.75, 0), (108, 2, 1, 2, 1, 2, 5, 0.75, 0), (109, 2, 1, 2, 1, 3, 5, 0.75, 0),
  (110, 2, 1, 2, 1, 4, 5, 0.75, 0), (111, 2, 1, 2, 1, 5, 5, 0.75, 0), (112, 2, 1, 2, 1, 6, 5, 0.75, 0),
  (113, 2, 1, 2, 1, 7, 5, 0.75, 0),
  (114, 2, 1, 3, 1, 1, 4, 0.80, 0), (115, 2, 1, 3, 1, 2, 4, 0.80, 0), (116, 2, 1, 3, 1, 3, 4, 0.80, 0),
  (117, 2, 1, 3, 1, 4, 4, 0.80, 0), (118, 2, 1, 3, 1, 5, 4, 0.80, 0), (119, 2, 1, 3, 1, 6, 4, 0.80, 0),
  (120, 2, 1, 3, 1, 7, 4, 0.80, 0), (121, 2, 1, 3, 1, 8, 4, 0.80, 0),
  (122, 2, 1, 4, 1, 1, 3, 0.85, 0), (123, 2, 1, 4, 1, 2, 3, 0.85, 0), (124, 2, 1, 4, 1, 3, 3, 0.85, 0),
  (125, 2, 1, 4, 1, 4, 3, 0.85, 0), (126, 2, 1, 4, 1, 5, 3, 0.85, 0), (127, 2, 1, 4, 1, 6, 3, 0.85, 0),
  (128, 2, 1, 4, 1, 7, 3, 0.85, 0), (129, 2, 1, 4, 1, 8, 3, 0.85, 0), (130, 2, 1, 4, 1, 9, 3, 0.85, 0),
  (131, 2, 1, 4, 1, 10, 3, 0.85, 0);
`;

// Texas Method — 3 days per week. Uses tm_squat as 5RM approximation.
export const SEED_TEXAS_TEMPLATES = `
INSERT OR IGNORE INTO program_templates
  (id, program_id, week, day, exercise_id, set_number, planned_reps, percentage, is_amrap)
VALUES
  -- Day 1: Volume (5x5 @ 90% of 5RM) — uses squat
  (201, 3, 1, 1, 1, 1, 5, 0.90, 0), (202, 3, 1, 1, 1, 2, 5, 0.90, 0), (203, 3, 1, 1, 1, 3, 5, 0.90, 0),
  (204, 3, 1, 1, 1, 4, 5, 0.90, 0), (205, 3, 1, 1, 1, 5, 5, 0.90, 0),
  -- Day 1: Bench press (5x5 @ 90%)
  (206, 3, 1, 1, 2, 1, 5, 0.90, 0), (207, 3, 1, 1, 2, 2, 5, 0.90, 0), (208, 3, 1, 1, 2, 3, 5, 0.90, 0),
  (209, 3, 1, 1, 2, 4, 5, 0.90, 0), (210, 3, 1, 1, 2, 5, 5, 0.90, 0),
  -- Day 2: Recovery — Squat (2x5 @ 80%)
  (211, 3, 1, 2, 1, 1, 5, 0.80, 0), (212, 3, 1, 2, 1, 2, 5, 0.80, 0),
  -- Day 2: Recovery — OHP (3x5 @ 90%)
  (213, 3, 1, 2, 4, 1, 5, 0.90, 0), (214, 3, 1, 2, 4, 2, 5, 0.90, 0), (215, 3, 1, 2, 4, 3, 5, 0.90, 0),
  -- Day 3: Intensity — Squat (1x5 @ 100%, attempt new PR)
  (216, 3, 1, 3, 1, 1, 5, 1.00, 1),
  -- Day 3: Intensity — Bench (1x5 @ 100%)
  (217, 3, 1, 3, 2, 1, 5, 1.00, 1),
  -- Day 3: Deadlift (1x5 @ 100%)
  (218, 3, 1, 3, 3, 1, 5, 1.00, 1);
`;
