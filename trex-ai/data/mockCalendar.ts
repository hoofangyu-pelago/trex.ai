import { getMonthMatrix } from '@/components/calendar/utils';

export type MockDayInfo = {
  count: number;
  disciplines: Array<'run' | 'bike' | 'swim' | 'strength'>;
};

export type MockMonthData = Record<string, MockDayInfo>;
export type MockWorkout = {
  id: string;
  date: string; // ISO YYYY-MM-DD
  title: string;
  discipline: 'run' | 'bike' | 'swim' | 'strength';
  durationMin: number;
  distanceKm?: number;
  load?: number;
};
export type MockMonthWorkouts = Record<string, MockWorkout[]>;

function toISODate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Simple deterministic generator so UI is stable between renders
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function getMockMonthData(anchor: Date): MockMonthData {
  const grid = getMonthMatrix(anchor);
  const result: MockMonthData = {};
  const types: Array<'run' | 'bike' | 'swim' | 'strength'> = ['run', 'bike', 'swim', 'strength'];

  grid.flat().forEach((day) => {
    const seed = day.getFullYear() * 10000 + (day.getMonth() + 1) * 100 + day.getDate();
    const r = pseudoRandom(seed);
    const count = Math.floor(r * 4); // 0..3
    const disciplines = Array.from({ length: count }).map((_, i) => types[(seed + i) % types.length]);
    result[toISODate(day)] = { count, disciplines };
  });

  return result;
}

export function getMockMonthWorkouts(anchor: Date): MockMonthWorkouts {
  const grid = getMonthMatrix(anchor);
  const result: MockMonthWorkouts = {};
  const types: Array<'run' | 'bike' | 'swim' | 'strength'> = ['run', 'bike', 'swim', 'strength'];

  grid.flat().forEach((day, idx) => {
    const iso = toISODate(day);
    const seed = day.getFullYear() * 10000 + (day.getMonth() + 1) * 100 + day.getDate();
    const r = pseudoRandom(seed);
    const count = Math.floor(r * 4); // 0..3
    const workouts: MockWorkout[] = [];
    for (let i = 0; i < count; i++) {
      const dIdx = (seed + i) % types.length;
      const discipline = types[dIdx];
      const durationMin = 30 + Math.floor(pseudoRandom(seed + i * 13) * 90);
      const distanceKm = discipline === 'strength' ? undefined : Number((3 + pseudoRandom(seed + i * 17) * 20).toFixed(1));
      const load = 10 + Math.floor(pseudoRandom(seed + i * 19) * 90);
      const titleBase = discipline === 'run' ? 'Run' : discipline === 'bike' ? 'Ride' : discipline === 'swim' ? 'Swim' : 'Strength';
      workouts.push({
        id: `${iso}-${i}`,
        date: iso,
        title: `${titleBase} ${i + 1}`,
        discipline,
        durationMin,
        distanceKm,
        load,
      });
    }
    result[iso] = workouts;
  });

  return result;
}

