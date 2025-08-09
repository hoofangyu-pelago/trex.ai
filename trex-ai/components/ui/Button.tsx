import { Button as TButton, styled } from 'tamagui';

export const Button = styled(TButton, {
  name: 'Button',
  borderRadius: 12,
  borderWidth: 1,
  pressStyle: { opacity: 0.9, scale: 0.98 },
  variants: {
    appearance: {
      primary: {
        backgroundColor: '$surface',
        borderColor: '$border',
        color: '$textPrimary',
      },
      secondary: {
        backgroundColor: 'transparent',
        borderColor: '$border',
        color: '$textPrimary',
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        color: '$textPrimary',
      },
    },
  },
  defaultVariants: {
    appearance: 'primary',
  },
});

