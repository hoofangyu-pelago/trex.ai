import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Layout';
import { ScrollView, Image } from 'react-native';
import { useTheme } from 'tamagui';
import { H2, Text } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { View, XStack, YStack } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const theme = useTheme();
  return (
    <ScrollView style={{ backgroundColor: theme.background.val }} contentContainerStyle={{ padding: 16 }}>
      <Screen padding={0} gap="$3" alignItems="center" justifyContent="center" minHeight="100vh">
        <Card width="100%" maxWidth={520}>
          <YStack gap="$4" alignItems="center">
            <View width={96} height={96} borderRadius={999} backgroundColor="$panel" borderColor="$border" borderWidth={1} alignItems="center" justifyContent="center" overflow="hidden">
              <Image
                source={require('@/assets/images/display.png')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </View>
            <YStack gap="$3" width="100%">
              <XStack gap={10} alignItems="center">
                <Ionicons name="person-outline" size={18} color={theme.textSecondary.val} />
                <Text color="$textPrimary" fontSize={20} fontWeight="700">{user?.name || 'Unknown User'}</Text>
              </XStack>
              <XStack gap={10} alignItems="center">
                <Ionicons name="mail-outline" size={18} color={theme.textSecondary.val} />
                <Text color="$textSecondary" fontSize={14}>{user?.email || 'no-email@example.com'}</Text>
              </XStack>
              <XStack gap={10} alignItems="center">
                <Ionicons name="briefcase-outline" size={18} color={theme.textSecondary.val} />
                <Text color="$textSecondary" fontSize={12}>{user?.role || 'member'}</Text>
              </XStack>
            </YStack>
            <Button
              onPress={signOut}
              appearance="neutral"
              width="100%"
              height={48}
            >
              Sign out
            </Button>
          </YStack>
        </Card>
      </Screen>
    </ScrollView>
  );
}
