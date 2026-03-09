import { MUSCLE_MAP, MUSCLE_LABELS, getMuscleCategory } from '../../src/constants/muscleGroups';

describe('MUSCLE_MAP', () => {
  it('has mappings for all 25 exercises', () => {
    for (let id = 1; id <= 25; id++) {
      expect(MUSCLE_MAP[id]).toBeDefined();
      expect(MUSCLE_MAP[id].primary.length).toBeGreaterThan(0);
    }
  });

  it('squat targets quads and glutes primarily', () => {
    expect(MUSCLE_MAP[1].primary).toContain('quads');
    expect(MUSCLE_MAP[1].primary).toContain('glutes');
  });

  it('bench targets chest and triceps primarily', () => {
    expect(MUSCLE_MAP[2].primary).toContain('chest');
    expect(MUSCLE_MAP[2].primary).toContain('triceps');
  });

  it('deadlift targets hamstrings, glutes, and lower_back primarily', () => {
    expect(MUSCLE_MAP[3].primary).toContain('hamstrings');
    expect(MUSCLE_MAP[3].primary).toContain('glutes');
    expect(MUSCLE_MAP[3].primary).toContain('lower_back');
  });

  it('OHP targets front_delts and side_delts primarily', () => {
    expect(MUSCLE_MAP[4].primary).toContain('front_delts');
    expect(MUSCLE_MAP[4].primary).toContain('side_delts');
  });

  it('all muscle IDs are valid MuscleId values', () => {
    const validMuscles = Object.keys(MUSCLE_LABELS);
    for (const [, mapping] of Object.entries(MUSCLE_MAP)) {
      for (const m of mapping.primary) {
        expect(validMuscles).toContain(m);
      }
      for (const m of mapping.secondary) {
        expect(validMuscles).toContain(m);
      }
    }
  });
});

describe('MUSCLE_LABELS', () => {
  it('has a label for every standard muscle group', () => {
    const expected = [
      'quads', 'hamstrings', 'glutes', 'chest', 'front_delts',
      'side_delts', 'rear_delts', 'lats', 'upper_back', 'traps',
      'triceps', 'biceps', 'forearms', 'core', 'calves', 'lower_back',
      'hip_flexors',
    ];
    for (const m of expected) {
      expect(MUSCLE_LABELS[m as keyof typeof MUSCLE_LABELS]).toBeDefined();
    }
  });
});

describe('getMuscleCategory', () => {
  it('categorizes squat as Legs', () => {
    expect(getMuscleCategory(1)).toBe('Legs');
  });

  it('categorizes bench as Chest', () => {
    expect(getMuscleCategory(2)).toBe('Chest');
  });

  it('categorizes deadlift as Legs (hamstrings)', () => {
    expect(getMuscleCategory(3)).toBe('Legs');
  });

  it('categorizes OHP as Shoulders', () => {
    expect(getMuscleCategory(4)).toBe('Shoulders');
  });

  it('categorizes barbell row as Back', () => {
    expect(getMuscleCategory(5)).toBe('Back');
  });

  it('categorizes bicep curl as Arms', () => {
    expect(getMuscleCategory(23)).toBe('Arms');
  });

  it('returns Other for unknown exercise ID', () => {
    expect(getMuscleCategory(999)).toBe('Other');
  });
});
