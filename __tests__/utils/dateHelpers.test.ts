import {
  toISODate,
  fromISODate,
  formatDisplayDate,
  formatMonthYear,
  daysBetween,
  formatTimer,
  getMondayOfWeek,
  nextMonday,
} from '../../src/utils/dateHelpers';

// ─── toISODate ──────────────────────────────────────────────────────────────

describe('toISODate', () => {
  it('formats date as YYYY-MM-DD', () => {
    const date = new Date(2026, 2, 9); // March 9, 2026
    expect(toISODate(date)).toBe('2026-03-09');
  });

  it('pads single-digit month and day', () => {
    const date = new Date(2026, 0, 5); // Jan 5
    expect(toISODate(date)).toBe('2026-01-05');
  });

  it('handles December 31', () => {
    const date = new Date(2025, 11, 31);
    expect(toISODate(date)).toBe('2025-12-31');
  });
});

// ─── fromISODate ────────────────────────────────────────────────────────────

describe('fromISODate', () => {
  it('parses YYYY-MM-DD to local date', () => {
    const date = fromISODate('2026-03-09');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(2); // 0-indexed
    expect(date.getDate()).toBe(9);
  });

  it('roundtrips with toISODate', () => {
    const original = '2026-06-15';
    expect(toISODate(fromISODate(original))).toBe(original);
  });
});

// ─── formatDisplayDate ──────────────────────────────────────────────────────

describe('formatDisplayDate', () => {
  it('formats as short weekday, month, day', () => {
    const result = formatDisplayDate('2026-03-09');
    // Should contain "Mon" and "Mar" and "9"
    expect(result).toMatch(/Mon/);
    expect(result).toMatch(/Mar/);
    expect(result).toMatch(/9/);
  });
});

// ─── formatMonthYear ────────────────────────────────────────────────────────

describe('formatMonthYear', () => {
  it('formats as "Month Year"', () => {
    const result = formatMonthYear('2026-03-09');
    expect(result).toContain('March');
    expect(result).toContain('2026');
  });
});

// ─── daysBetween ────────────────────────────────────────────────────────────

describe('daysBetween', () => {
  it('returns 0 for same day', () => {
    expect(daysBetween('2026-03-09', '2026-03-09')).toBe(0);
  });

  it('returns positive for future date', () => {
    expect(daysBetween('2026-03-01', '2026-03-10')).toBe(9);
  });

  it('returns negative for past date', () => {
    expect(daysBetween('2026-03-10', '2026-03-01')).toBe(-9);
  });

  it('handles month boundaries', () => {
    expect(daysBetween('2026-01-30', '2026-02-01')).toBe(2);
  });
});

// ─── formatTimer ────────────────────────────────────────────────────────────

describe('formatTimer', () => {
  it('formats 0 seconds', () => {
    expect(formatTimer(0)).toBe('0:00');
  });

  it('formats 90 seconds', () => {
    expect(formatTimer(90)).toBe('1:30');
  });

  it('formats 150 seconds', () => {
    expect(formatTimer(150)).toBe('2:30');
  });

  it('pads single-digit seconds', () => {
    expect(formatTimer(65)).toBe('1:05');
  });

  it('formats 5 minutes', () => {
    expect(formatTimer(300)).toBe('5:00');
  });
});

// ─── getMondayOfWeek ────────────────────────────────────────────────────────

describe('getMondayOfWeek', () => {
  it('returns Monday for a Monday input', () => {
    const monday = new Date(2026, 2, 9); // Monday March 9, 2026
    const result = getMondayOfWeek(monday);
    expect(result.getDay()).toBe(1);
    expect(result.getDate()).toBe(9);
  });

  it('returns previous Monday for a Wednesday', () => {
    const wed = new Date(2026, 2, 11); // Wednesday March 11
    const result = getMondayOfWeek(wed);
    expect(result.getDay()).toBe(1);
    expect(result.getDate()).toBe(9);
  });

  it('returns previous Monday for a Sunday', () => {
    const sun = new Date(2026, 2, 15); // Sunday March 15
    const result = getMondayOfWeek(sun);
    expect(result.getDay()).toBe(1);
    expect(result.getDate()).toBe(9);
  });
});

// ─── nextMonday ─────────────────────────────────────────────────────────────

describe('nextMonday', () => {
  it('returns same day if already Monday', () => {
    const monday = new Date(2026, 2, 9);
    const result = nextMonday(monday);
    expect(result.getDay()).toBe(1);
    expect(result.getDate()).toBe(9);
  });

  it('returns next Monday from a Tuesday', () => {
    const tue = new Date(2026, 2, 10);
    const result = nextMonday(tue);
    expect(result.getDay()).toBe(1);
    expect(result.getDate()).toBe(16);
  });

  it('returns next day from a Sunday', () => {
    const sun = new Date(2026, 2, 15);
    const result = nextMonday(sun);
    expect(result.getDay()).toBe(1);
    expect(result.getDate()).toBe(16);
  });
});
