import { type Sex, type Units } from '../types';

// ─── 1RM Formulas ─────────────────────────────────────────────────────────────

/** Epley formula: W × (1 + R/30). Returns W if reps == 1 */
export function epley1RM(weight: number, reps: number): number {
  if (reps <= 1) return weight;
  return weight * (1 + reps / 30);
}

/** Generate estimated 1RM table for reps 1–10 from a single performance */
export function generate1RMTable(
  weight: number,
  reps: number
): { reps: number; estimated1RM: number }[] {
  const base1RM = epley1RM(weight, reps);
  const table = [];
  for (let r = 1; r <= 10; r++) {
    // Back-calculate weight from base 1RM
    const w = r === 1 ? base1RM : base1RM / (1 + r / 30);
    table.push({ reps: r, estimated1RM: Math.round(w * 10) / 10 });
  }
  return table;
}

// ─── Wilks Score ──────────────────────────────────────────────────────────────

const WILKS_MALE = [-216.0475144, 16.2606339, -0.002388645, -0.00113732, 7.01863e-6, -1.291e-8];
const WILKS_FEMALE = [594.31747775582, -27.23842536447, 0.82112226871, -0.00930733913, 4.731582e-5, -9.054e-8];

function wilksCoefficient(bodyweight: number, coeff: number[]): number {
  const [a, b, c, d, e, f] = coeff;
  const bw = bodyweight;
  const denom = a + b * bw + c * bw ** 2 + d * bw ** 3 + e * bw ** 4 + f * bw ** 5;
  return 500 / denom;
}

export function wilksScore(total: number, bodyweight: number, sex: Sex): number {
  const coeff = sex === 'M' ? WILKS_MALE : WILKS_FEMALE;
  return Math.round(total * wilksCoefficient(bodyweight, coeff) * 100) / 100;
}

// ─── DOTS Score ───────────────────────────────────────────────────────────────

const DOTS_MALE = [-307.75076, 24.0900756, -0.1918759221, 0.0007391293, -0.000001093];
const DOTS_FEMALE = [-57.96288, 13.6175032, -0.1126655495, 0.0005158568, -0.0000010706];

function dotsCoefficient(bodyweight: number, coeff: number[]): number {
  const [a, b, c, d, e] = coeff;
  const bw = bodyweight;
  const denom = a + b * bw + c * bw ** 2 + d * bw ** 3 + e * bw ** 4;
  return 500 / denom;
}

export function dotsScore(total: number, bodyweight: number, sex: Sex): number {
  const coeff = sex === 'M' ? DOTS_MALE : DOTS_FEMALE;
  return Math.round(total * dotsCoefficient(bodyweight, coeff) * 100) / 100;
}

// ─── Score Classifications ────────────────────────────────────────────────────

export function wilksClassification(score: number): string {
  if (score >= 500) return 'Elite';
  if (score >= 400) return 'Master';
  if (score >= 300) return 'Advanced';
  if (score >= 200) return 'Intermediate';
  return 'Beginner';
}

export function dotsClassification(score: number): string {
  if (score >= 450) return 'Elite';
  if (score >= 375) return 'Master';
  if (score >= 280) return 'Advanced';
  if (score >= 200) return 'Intermediate';
  return 'Beginner';
}

// ─── Unit Conversion ──────────────────────────────────────────────────────────

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10;
}

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function convertWeight(weight: number, from: Units, to: Units): number {
  if (from === to) return weight;
  return from === 'kg' ? kgToLbs(weight) : lbsToKg(weight);
}

// ─── Weight Rounding ──────────────────────────────────────────────────────────

/** Round to nearest increment (default 2.5 kg) */
export function roundToNearest(value: number, increment: number = 2.5): number {
  return Math.round(value / increment) * increment;
}

/** Round down (never overshoot planned weight) */
export function floorToNearest(value: number, increment: number = 2.5): number {
  return Math.floor(value / increment) * increment;
}

// ─── Training Max ────────────────────────────────────────────────────────────

/** 5/3/1: Training Max = 90% of true 1RM, rounded to nearest 2.5 */
export function trainingMaxFrom1RM(oneRM: number, units: Units): number {
  const increment = units === 'kg' ? 2.5 : 5;
  return floorToNearest(oneRM * 0.9, increment);
}
