import { createTamagui, createFont, createTokens } from 'tamagui';

const bodyFont = createFont({
  family: 'Inter_400Regular',
  face: {
    400: { normal: 'Inter_400Regular' },
    500: { normal: 'Inter_500Medium' },
    700: { normal: 'Inter_700Bold' },
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
    background: '#0A0A0A',
    panel: '#111111',
    surface: '#161616',
    border: '#262626',
    textPrimary: '#FAFAFA',
    textSecondary: '#D4D4D4',
    muted: '#A3A3A3',
    disabled: '#737373',
    divider: '#2E2E2E',
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
    dark: {
      background: tokens.color.background,
      panel: tokens.color.panel,
      surface: tokens.color.surface,
      border: tokens.color.border,
      textPrimary: tokens.color.textPrimary,
      textSecondary: tokens.color.textSecondary,
      muted: tokens.color.muted,
      disabled: tokens.color.disabled,
      divider: tokens.color.divider,
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

