import { createTamagui, createFont, createTokens } from 'tamagui';
// Using Expo-loaded font family names declared in app/_layout.tsx


const bodyFont = createFont({
  family: 'Geist_400_Regular',
  face: {
    400: { normal: 'Geist_400_Regular' },
    500: { normal: 'Geist_500_Medium' },
    700: { normal: 'Geist_700_Bold' },
  },
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    5: 22,
    6: 26,
    7: 32,
    8: 40,
  },
  lineHeight: {
    1: 16,
    2: 18,
    3: 22,
    4: 24,
    5: 28,
    6: 32,
    7: 38,
    8: 48,
  },
  weight: {
    1: '300',
    2: '400',
    3: '500',
    4: '600',
    5: '700',
  },
  letterSpacing: {
    1: 0,
    2: 0,
    3: 0,
    4: 0.2,
    5: 0.3,
    6: 0.4,
    7: 0.5,
    8: 0.6,
  },
});

const tokens = createTokens({
  color: {
    // Base palette tokens (not theme-specific). Theme objects below provide final values.
    // Kept for potential usage in non-themed places.
    background: '#0A0A0A',
    panel: '#111111',
    surface: '#161616',
    border: '#262626',
    textPrimary: '#FAFAFA',
    textSecondary: '#D4D4D4',
    muted: '#A3A3A3',
    disabled: '#737373',
    divider: '#2E2E2E',
    primary: '#FFFFFF',
    primaryForeground: '#000000',
    secondary: '#232323',
    secondaryForeground: '#FFFFFF',
    accent: '#2A2A2A',
    accentForeground: '#FFFFFF',
    destructive: '#F87171',
    destructiveForeground: '#000000',
    input: '#1F1F1F',
    ring: '#BFBFBF',
  },
  size: {
    0: 0,
    1: 2,
    2: 4,
    3: 8,
    4: 12,
    5: 16,
    6: 20,
    7: 24,
    8: 32,
    9: 40,
    10: 48,
    11: 56,
    12: 64,
    true: 16,
  },
  space: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 32,
    8: 40,
    true: 16,
  },
  radius: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
  },
  zIndex: {
    0: 0,
    1: 1,
    2: 2,
    3: 5,
    4: 10,
    5: 20,
  },
});

const config = createTamagui({
  themes: {
    // Light theme based on design.md
    light: {
      background: '#FCFCFC', // oklch(0.99 0 0)
      panel: '#FFFFFF', // card
      surface: '#F9F9F9', // popover
      border: '#ECECEC', // oklch(0.92 0 0)
      textPrimary: '#000000', // foreground
      textSecondary: '#525252', // muted-foreground approx
      muted: '#F7F7F7',
      disabled: '#9CA3AF',
      divider: '#E5E5E5',
      primary: '#000000',
      primaryForeground: '#FFFFFF',
      secondary: '#F0F0F0',
      secondaryForeground: '#000000',
      accent: '#F0F0F0',
      accentForeground: '#000000',
      destructive: '#EF4444',
      destructiveForeground: '#FFFFFF',
      input: '#F0F0F0',
      ring: '#000000',
      chart1: '#22c55e',
      chart2: '#6366f1',
      chart3: '#bfbfbf',
      chart4: '#e5e5e5',
      chart5: '#8f8f8f',
    },
    // Dark theme based on deisgn.json
    dark: {
      background: '#000000',
      panel: '#111111',
      surface: '#1a1a1a',
      border: '#333333',
      textPrimary: '#ffffff',
      textSecondary: '#a1a1a1',
      muted: '#a1a1a1',
      disabled: '#737373',
      divider: '#2a2a2a',
      primary: '#ffffff',
      primaryForeground: '#000000',
      secondary: 'transparent',
      secondaryForeground: '#ffffff',
      accent: '#ffffff',
      accentForeground: '#000000',
      destructive: '#F87171',
      destructiveForeground: '#000000',
      input: '#1a1a1a',
      ring: '#333333',
      chart1: '#ffffff',
      chart2: '#888888',
      chart3: '#ffb74d',
      chart4: '#1976d2',
      chart5: '#a1a1a1',
    },
  },
  tokens,
  fonts: {
    body: bodyFont,
  },
  defaultFont: 'body',
});

export type AppConfig = typeof config;
declare module 'tamagui' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;

