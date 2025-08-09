import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Layout';
import { H2, Text } from '@/components/ui/Typography';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  return (
    <Screen>
      <H2>Profile</H2>
      <Text>Name: {user?.name}</Text>
      <Text>Email: {user?.email}</Text>
      <Text>Role: {user?.role}</Text>
      <Button onPress={signOut} appearance="secondary" width="100%" height={48}>
        Sign out
      </Button>
    </Screen>
  );
}


