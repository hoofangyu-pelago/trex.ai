export const MOCK_USERS = [
  {
    id: '1',
    email: 'athlete@example.com',
    name: 'Sarah Johnson',
    role: 'athlete',
    sport: 'triathlon',
    timezone: 'America/New_York',
  },
  {
    id: '2',
    email: 'coach@example.com',
    name: 'Mike Torres',
    role: 'coach',
    athletes: ['1', '3', '4'],
  },
];

export type MockUser = (typeof MOCK_USERS)[number];

