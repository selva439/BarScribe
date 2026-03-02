import { type WarmupSet } from '../types';
import { roundToNearest, floorToNearest } from './calculators';
import { daysUntil } from './dateHelpers';

/** Generate warmup ladder from opener weight (kg) */
export function getMeetWarmups(opener: number, increment: number = 2.5): WarmupSet[] {
  return [
    { pct: 40, weight: floorToNearest(opener * 0.40, increment), reps: 5 },
    { pct: 50, weight: floorToNearest(opener * 0.50, increment), reps: 3 },
    { pct: 60, weight: floorToNearest(opener * 0.60, increment), reps: 2 },
    { pct: 70, weight: floorToNearest(opener * 0.70, increment), reps: 1 },
    { pct: 80, weight: floorToNearest(opener * 0.80, increment), reps: 1 },
    { pct: 90, weight: floorToNearest(opener * 0.90, increment), reps: 1 },
    { pct: 95, weight: floorToNearest(opener * 0.95, increment), reps: 1 },
  ];
}

/** Countdown in days from today to meet date */
export function getCountdownDays(meetDateISO: string): number {
  return daysUntil(meetDateISO);
}

/** Suggest second attempt from opener (+5%) */
export function suggestSecondAttempt(opener: number, increment: number = 2.5): number {
  return roundToNearest(opener * 1.05, increment);
}

/** Suggest third attempt from second attempt (+3% good lift, +1% missed) */
export function suggestThirdAttempt(
  second: number,
  isGoodLift: boolean = true,
  increment: number = 2.5
): number {
  const pct = isGoodLift ? 1.03 : 1.01;
  return roundToNearest(second * pct, increment);
}

/** Project a total from planned attempts (best of each lift) */
export function projectTotal(
  squatOpener: number,
  benchOpener: number,
  deadliftOpener: number
): number {
  // Conservative estimate: assume 3rd attempt (~110% of opener)
  return (
    roundToNearest(squatOpener * 1.1, 2.5) +
    roundToNearest(benchOpener * 1.1, 2.5) +
    roundToNearest(deadliftOpener * 1.1, 2.5)
  );
}

/** Format countdown for display */
export function formatCountdown(days: number): string {
  if (days < 0) return 'Meet has passed';
  if (days === 0) return 'Meet day!';
  if (days === 1) return '1 day to go';
  if (days < 7) return `${days} days to go`;
  const weeks = Math.floor(days / 7);
  const remaining = days % 7;
  if (remaining === 0) return `${weeks} week${weeks === 1 ? '' : 's'} to go`;
  return `${weeks}w ${remaining}d to go`;
}
