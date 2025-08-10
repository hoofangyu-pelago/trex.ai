import { Button as TButton, styled } from 'tamagui';

export const Button = styled(TButton, {
  name: 'Button',
  borderRadius: 12,
  borderWidth: 1,
  pressStyle: { opacity: 0.9, scale: 0.98 },
  variants: {
    appearance: {
      primary: {
        backgroundColor: '$accent',
        borderColor: '$accent',
        color: '$primaryForeground',
      },
      secondary: {
        backgroundColor: 'transparent',
        borderColor: '$accent',
        color: '$accent',
      },
      destructive: {
        backgroundColor: '$destructive',
        borderColor: '$destructive',
        color: '$destructiveForeground',
        hoverStyle: {
          opacity: 0.95,
        },
        pressStyle: {
          opacity: 0.9,
          scale: 0.98,
        },
      },
      neutral: {
        backgroundColor: '$panel',
        borderColor: '$border',
        color: '$textPrimary',
        hoverStyle: {
          opacity: 0.98,
        },
        pressStyle: {
          opacity: 0.96,
          scale: 0.98,
        },
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

