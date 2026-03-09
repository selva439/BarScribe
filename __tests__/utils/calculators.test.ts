import {
  epley1RM,
  generate1RMTable,
  wilksScore,
  dotsScore,
  wilksClassification,
  dotsClassification,
  lbsToKg,
  kgToLbs,
  convertWeight,
  roundToNearest,
  floorToNearest,
  trainingMaxFrom1RM,
} from '../../src/utils/calculators';

// ─── Epley 1RM ──────────────────────────────────────────────────────────────

describe('epley1RM', () => {
  it('returns weight directly for 1 rep', () => {
    expect(epley1RM(100, 1)).toBe(100);
  });

  it('returns weight directly for 0 reps', () => {
    expect(epley1RM(100, 0)).toBe(100);
  });

  it('calculates correctly for 5 reps', () => {
    // 100 * (1 + 5/30) = 100 * 1.1667 = 116.67
    expect(epley1RM(100, 5)).toBeCloseTo(116.67, 1);
  });

  it('calculates correctly for 10 reps', () => {
    // 80 * (1 + 10/30) = 80 * 1.333 = 106.67
    expect(epley1RM(80, 10)).toBeCloseTo(106.67, 1);
  });

  it('handles heavy singles at bodyweight range', () => {
    expect(epley1RM(200, 1)).toBe(200);
  });

  it('handles 3 reps (typical powerlifting set)', () => {
    // 140 * (1 + 3/30) = 140 * 1.1 = 154
    expect(epley1RM(140, 3)).toBeCloseTo(154, 0);
  });
});

// ─── 1RM Table ──────────────────────────────────────────────────────────────

describe('generate1RMTable', () => {
  it('returns 10 entries', () => {
    const table = generate1RMTable(100, 5);
    expect(table).toHaveLength(10);
  });

  it('first entry (1 rep) matches the estimated 1RM', () => {
    const table = generate1RMTable(100, 5);
    const e1rm = epley1RM(100, 5);
    expect(table[0].reps).toBe(1);
    expect(table[0].estimated1RM).toBeCloseTo(e1rm, 0);
  });

  it('rep counts go 1 through 10', () => {
    const table = generate1RMTable(100, 5);
    for (let i = 0; i < 10; i++) {
      expect(table[i].reps).toBe(i + 1);
    }
  });

  it('weights decrease as reps increase', () => {
    const table = generate1RMTable(100, 5);
    for (let i = 1; i < 10; i++) {
      expect(table[i].estimated1RM).toBeLessThan(table[i - 1].estimated1RM);
    }
  });
});

// ─── Wilks Score ────────────────────────────────────────────────────────────

describe('wilksScore', () => {
  it('returns a positive number for valid inputs', () => {
    const score = wilksScore(500, 83, 'M');
    expect(score).toBeGreaterThan(0);
  });

  it('male score is in expected range for intermediate lifter', () => {
    // 500kg total at 83kg bodyweight — should be ~310-340 wilks
    const score = wilksScore(500, 83, 'M');
    expect(score).toBeGreaterThan(280);
    expect(score).toBeLessThan(400);
  });

  it('female score differs from male score', () => {
    const male = wilksScore(300, 63, 'M');
    const female = wilksScore(300, 63, 'F');
    expect(male).not.toBeCloseTo(female, 0);
  });

  it('higher total gives higher score at same bodyweight', () => {
    const lower = wilksScore(400, 83, 'M');
    const higher = wilksScore(500, 83, 'M');
    expect(higher).toBeGreaterThan(lower);
  });
});

// ─── DOTS Score ─────────────────────────────────────────────────────────────

describe('dotsScore', () => {
  it('returns a positive number', () => {
    expect(dotsScore(500, 83, 'M')).toBeGreaterThan(0);
  });

  it('higher total yields higher score', () => {
    expect(dotsScore(600, 83, 'M')).toBeGreaterThan(dotsScore(500, 83, 'M'));
  });
});

// ─── Classifications ────────────────────────────────────────────────────────

describe('wilksClassification', () => {
  it('classifies beginner', () => expect(wilksClassification(150)).toBe('Beginner'));
  it('classifies intermediate', () => expect(wilksClassification(250)).toBe('Intermediate'));
  it('classifies advanced', () => expect(wilksClassification(350)).toBe('Advanced'));
  it('classifies master', () => expect(wilksClassification(450)).toBe('Master'));
  it('classifies elite', () => expect(wilksClassification(550)).toBe('Elite'));
});

describe('dotsClassification', () => {
  it('classifies beginner', () => expect(dotsClassification(150)).toBe('Beginner'));
  it('classifies intermediate', () => expect(dotsClassification(250)).toBe('Intermediate'));
  it('classifies advanced', () => expect(dotsClassification(300)).toBe('Advanced'));
  it('classifies master', () => expect(dotsClassification(400)).toBe('Master'));
  it('classifies elite', () => expect(dotsClassification(500)).toBe('Elite'));
});

// ─── Unit Conversion ────────────────────────────────────────────────────────

describe('lbsToKg', () => {
  it('converts 225 lbs correctly', () => {
    expect(lbsToKg(225)).toBeCloseTo(102.1, 0);
  });

  it('converts 0', () => {
    expect(lbsToKg(0)).toBe(0);
  });
});

describe('kgToLbs', () => {
  it('converts 100 kg correctly', () => {
    expect(kgToLbs(100)).toBeCloseTo(220.5, 0);
  });
});

describe('convertWeight', () => {
  it('returns same value for same units', () => {
    expect(convertWeight(100, 'kg', 'kg')).toBe(100);
  });

  it('converts kg to lbs', () => {
    expect(convertWeight(100, 'kg', 'lbs')).toBeCloseTo(220.5, 0);
  });

  it('converts lbs to kg', () => {
    expect(convertWeight(220, 'lbs', 'kg')).toBeCloseTo(99.8, 0);
  });
});

// ─── Weight Rounding ────────────────────────────────────────────────────────

describe('roundToNearest', () => {
  it('rounds to nearest 2.5 by default', () => {
    expect(roundToNearest(101)).toBe(100);
    expect(roundToNearest(101.5)).toBe(102.5);
  });

  it('rounds to nearest 5', () => {
    expect(roundToNearest(103, 5)).toBe(105);
  });
});

describe('floorToNearest', () => {
  it('floors to nearest 2.5', () => {
    expect(floorToNearest(104)).toBe(102.5);
  });

  it('floors to nearest 5', () => {
    expect(floorToNearest(107, 5)).toBe(105);
  });

  it('does not change exact multiples', () => {
    expect(floorToNearest(100, 2.5)).toBe(100);
  });
});

// ─── Training Max ───────────────────────────────────────────────────────────

describe('trainingMaxFrom1RM', () => {
  it('calculates 90% of 1RM floored to 2.5 kg', () => {
    // 200 * 0.9 = 180 → floored to 2.5 = 180
    expect(trainingMaxFrom1RM(200, 'kg')).toBe(180);
  });

  it('floors to 5 lbs for imperial', () => {
    // 300 * 0.9 = 270 → floored to 5 = 270
    expect(trainingMaxFrom1RM(300, 'lbs')).toBe(270);
  });

  it('handles non-round 1RM values', () => {
    // 143 * 0.9 = 128.7 → floored to 2.5 = 127.5
    expect(trainingMaxFrom1RM(143, 'kg')).toBe(127.5);
  });
});
