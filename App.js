import { ClerkLoaded, ClerkProvider, useUser } from '@clerk/clerk-expo';
import { FitnessContext } from './Context';
import StackNavigator from './StackNavigator';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TokenCache } from './auth/auth';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

function AppShell() {
  const { user } = useUser();

  return (
    <FitnessContext clerkUserId={user?.id || null}>
      <StatusBar style="light" backgroundColor="#000" />
      <StackNavigator />
    </FitnessContext>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ClerkProvider tokenCache={TokenCache} publishableKey={publishableKey}>
        <ClerkLoaded>
          <AppShell />
        </ClerkLoaded>
      </ClerkProvider>
    </SafeAreaProvider>
  );
}
