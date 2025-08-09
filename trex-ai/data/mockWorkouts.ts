export type MockWorkout = {
  id: string;
  athleteId: string;
  date: string; // ISO
  type: 'completed' | 'planned';
  discipline: 'run' | 'bike' | 'swim' | 'strength';
  title: string;
  duration: number; // minutes
  distance?: number; // km for run/bike, m for swim if desired
  notes?: string;
};

function pad(n: number) {
  return String(n).padStart(2, '0');
}

// Generate a few months of mock data around the current date
export const MOCK_WORKOUTS: MockWorkout[] = (() => {
  const res: MockWorkout[] = [];
  const now = new Date();
  let id = 1;
  const types: Array<MockWorkout['discipline']> = ['run', 'bike', 'swim', 'strength'];
  for (let mOffset = -2; mOffset <= 0; mOffset++) {
    const d = new Date(now.getFullYear(), now.getMonth() + mOffset, 1);
    for (let day = 1; day <= 28; day++) {
      const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + day;
      const r = Math.sin(seed) * 10000 - Math.floor(Math.sin(seed) * 10000);
      const count = Math.floor(r * 3); // 0..2 workouts per day
      for (let i = 0; i < count; i++) {
        const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(day)}`;
        const discipline = types[(seed + i) % types.length];
        const duration = 30 + Math.floor(((seed + i * 13) % 90));
        const distance = discipline === 'strength' ? undefined : Number((3 + ((seed + i * 17) % 200) / 10).toFixed(1));
        res.push({
          id: String(id++),
          athleteId: '1',
          date,
          type: 'completed',
          discipline,
          title: `${discipline === 'run' ? 'Run' : discipline === 'bike' ? 'Ride' : discipline === 'swim' ? 'Swim' : 'Strength'} ${i + 1}`,
          duration,
          distance,
        });
      }
    }
  }
  return res;
})();

