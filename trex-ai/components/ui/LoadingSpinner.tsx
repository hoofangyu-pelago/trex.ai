import { ActivityIndicator } from 'react-native';
import { View } from 'tamagui';

export function LoadingSpinner() {
  return (
    <View alignItems="center" justifyContent="center" padding="$4">
      <ActivityIndicator color="#FAFAFA" />
    </View>
  );
}

