import { ActivityIndicator } from 'react-native';
import { View, useTheme } from 'tamagui';

export function LoadingSpinner() {
  const theme = useTheme();
  return (
    <View alignItems="center" justifyContent="center" padding="$4">
      <ActivityIndicator color={theme.textPrimary.val} />
    </View>
  );
}

