/** Format a Date object to YYYY-MM-DD ISO string (local time, not UTC) */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse YYYY-MM-DD string to a local Date object */
export function fromISODate(str: string): Date {
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Format as "Mon, Mar 2" */
export function formatDisplayDate(str: string): string {
  const date = fromISODate(str);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** Format as "March 2026" */
export function formatMonthYear(str: string): string {
  const date = fromISODate(str);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/** Days between two ISO date strings */
export function daysBetween(startISO: string, endISO: string): number {
  const start = fromISODate(startISO);
  const end = fromISODate(endISO);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

/** Days remaining from today until a target ISO date */
export function daysUntil(targetISO: string): number {
  const today = toISODate(new Date());
  return daysBetween(today, targetISO);
}

/** Format seconds as "2:30" */
export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Format a full ISO timestamp as "3:45 PM" */
export function formatTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** Get Monday of the week containing the given date */
export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

/** Get the next Monday from a given date (or the same day if already Monday) */
export function nextMonday(from: Date = new Date()): Date {
  const d = new Date(from);
  const dayOfWeek = d.getDay();
  if (dayOfWeek === 1) return d; // Already Monday
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  d.setDate(d.getDate() + daysUntilMonday);
  return d;
}
