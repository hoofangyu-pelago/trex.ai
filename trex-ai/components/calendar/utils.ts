export type CalendarView = 'month' | 'week' | 'day';

export function toDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d);
}

export function startOfDay(d: Date): Date {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

// Monday as start of week
export function startOfWeek(d: Date): Date {
  const dt = startOfDay(d);
  const day = dt.getDay(); // 0 Sun, 1 Mon, ...
  const diff = (day === 0 ? -6 : 1 - day); // move back to Monday
  const res = new Date(dt);
  res.setDate(dt.getDate() + diff);
  return startOfDay(res);
}

export function addDays(d: Date, days: number): Date {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + days);
  return dt;
}

export function addWeeks(d: Date, weeks: number): Date {
  return addDays(d, weeks * 7);
}

export function startOfMonth(d: Date): Date {
  return startOfDay(new Date(d.getFullYear(), d.getMonth(), 1));
}

export function addMonths(d: Date, months: number): Date {
  const dt = new Date(d);
  dt.setMonth(dt.getMonth() + months);
  return dt;
}

export function getMonthMatrix(d: Date): Date[][] {
  const first = startOfMonth(d);
  // grid starts on Monday of the week containing the 1st
  const gridStart = startOfWeek(first);
  const weeks: Date[][] = [];
  let cursor = gridStart;
  for (let w = 0; w < 6; w++) {
    const row: Date[] = [];
    for (let i = 0; i < 7; i++) {
      row.push(cursor);
      cursor = addDays(cursor, 1);
    }
    weeks.push(row);
  }
  return weeks;
}

export function formatMonthYear(d: Date): string {
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function formatRangeWeek(d: Date): string {
  const start = startOfWeek(d);
  const end = addDays(start, 6);
  const s = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const e = end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  return `${s} – ${e}`;
}

export function formatDay(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

