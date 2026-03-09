import {
  getMeetWarmups,
  suggestSecondAttempt,
  suggestThirdAttempt,
  projectTotal,
  formatCountdown,
} from '../../src/utils/meetCalc';

// ─── Meet Warmups ───────────────────────────────────────────────────────────

describe('getMeetWarmups', () => {
  it('returns 7 warmup sets', () => {
    const warmups = getMeetWarmups(200);
    expect(warmups).toHaveLength(7);
  });

  it('starts at 40% and ends at 95%', () => {
    const warmups = getMeetWarmups(200);
    expect(warmups[0].pct).toBe(40);
    expect(warmups[6].pct).toBe(95);
  });

  it('all weights are floor-rounded to 2.5kg', () => {
    const warmups = getMeetWarmups(200);
    for (const w of warmups) {
      expect(w.weight % 2.5).toBe(0);
    }
  });

  it('weights increase monotonically', () => {
    const warmups = getMeetWarmups(200);
    for (let i = 1; i < warmups.length; i++) {
      expect(warmups[i].weight).toBeGreaterThanOrEqual(warmups[i - 1].weight);
    }
  });

  it('first set has 5 reps, last set has 1 rep', () => {
    const warmups = getMeetWarmups(200);
    expect(warmups[0].reps).toBe(5);
    expect(warmups[6].reps).toBe(1);
  });

  it('calculates correct weights for 200kg opener', () => {
    const warmups = getMeetWarmups(200);
    expect(warmups[0].weight).toBe(80);  // 40% of 200 = 80
    expect(warmups[1].weight).toBe(100); // 50% of 200 = 100
    expect(warmups[5].weight).toBe(180); // 90% of 200 = 180
  });
});

// ─── Attempt Suggestions ────────────────────────────────────────────────────

describe('suggestSecondAttempt', () => {
  it('suggests ~5% increase from opener', () => {
    const second = suggestSecondAttempt(200);
    // 200 * 1.05 = 210, rounded to 2.5 = 210
    expect(second).toBe(210);
  });

  it('rounds to nearest increment', () => {
    const second = suggestSecondAttempt(183);
    // 183 * 1.05 = 192.15, round to 2.5 = 192.5
    expect(second % 2.5).toBe(0);
  });
});

describe('suggestThirdAttempt', () => {
  it('suggests ~3% increase on good lift', () => {
    const third = suggestThirdAttempt(210, true);
    // 210 * 1.03 = 216.3, round to 2.5 = 217.5
    expect(third).toBe(217.5);
  });

  it('suggests ~1% increase on missed lift', () => {
    const third = suggestThirdAttempt(210, false);
    // 210 * 1.01 = 212.1, round to 2.5 = 212.5
    expect(third).toBe(212.5);
  });
});

// ─── Project Total ──────────────────────────────────────────────────────────

describe('projectTotal', () => {
  it('returns sum of ~110% of each opener', () => {
    const total = projectTotal(200, 130, 250);
    // 220 + 142.5 + 275 = 637.5
    expect(total).toBeGreaterThan(600);
    expect(total).toBeLessThan(700);
  });

  it('returns value rounded to 2.5kg increments', () => {
    const total = projectTotal(200, 130, 250);
    expect(total % 2.5).toBe(0);
  });
});

// ─── Format Countdown ───────────────────────────────────────────────────────

describe('formatCountdown', () => {
  it('shows "Meet day!" for 0 days', () => {
    expect(formatCountdown(0)).toBe('Meet day!');
  });

  it('shows "1 day to go" for 1 day', () => {
    expect(formatCountdown(1)).toBe('1 day to go');
  });

  it('shows days for less than a week', () => {
    expect(formatCountdown(5)).toBe('5 days to go');
  });

  it('shows weeks for exact weeks', () => {
    expect(formatCountdown(14)).toBe('2 weeks to go');
  });

  it('shows weeks and days for mixed', () => {
    expect(formatCountdown(10)).toBe('1w 3d to go');
  });

  it('shows "Meet has passed" for negative days', () => {
    expect(formatCountdown(-3)).toBe('Meet has passed');
  });

  it('singular week', () => {
    expect(formatCountdown(7)).toBe('1 week to go');
  });
});
