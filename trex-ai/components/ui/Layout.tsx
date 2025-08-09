import React from 'react';
import { YStack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenProps = React.ComponentProps<typeof YStack> & {
  disableSafeTopPadding?: boolean;
};

export function Screen({ disableSafeTopPadding, ...props }: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      padding="$4"
      gap="$4"
      paddingTop={disableSafeTopPadding ? undefined : insets.top}
      {...props}
    />
  );
}

