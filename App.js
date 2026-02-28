import { FitnessContext } from './Context';
import StackNavigator from './StackNavigator';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <FitnessContext>
        <StatusBar style="light" backgroundColor='#000' />
        <StackNavigator />
      </FitnessContext>
    </SafeAreaProvider>
  );
}
