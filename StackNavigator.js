// navigation/index.js
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import WelcomeScreen from './screens/WelcomeScreen';
import { Ionicons } from '@expo/vector-icons';
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { View } from 'react-native';

// Import your tab screens
import Main from './tabs/main';
import Exercises from './tabs/exercises';
import Profile from './tabs/profile';

// Import other screens
import WorkoutScreen from './screens/WorkoutScreen';
import FitScreen from './screens/FitScreen';
import RestScreen from './screens/RestScreen';
import Days from './screens/Days';
import UserProfile from './components/userProfile';
import ApiExercises from './components/ApiExercise';
import { TokenCache } from './auth/auth';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Main') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Exercises') {
            iconName = focused ? 'barbell' : 'barbell-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Main" component={Main} />
      <Tab.Screen name="Exercises" component={Exercises} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

export default function AppNavigation() {
  return (
    <ClerkProvider tokenCache={TokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Welcome">
            {/* Welcome Screen (shown first) */}
            <Stack.Screen
              name="Welcome"
              component={WelcomeScreen}
              options={{
                headerShown: false,
                animationTypeForReplace: 'pop'
              }}
            />

            {/* Main App with Tabs */}
            <Stack.Screen
              name="App"
              component={MainTabs}
              options={{
                headerShown: false,
                gestureEnabled: false // Prevent swipe back to welcome
              }}
            />

            {/* Other screens */}
            <Stack.Screen name="Workout" component={WorkoutScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Fit" component={FitScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Rest" component={RestScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Days" component={Days} options={{ headerShown: false }} />
            <Stack.Screen name="userProfile" component={UserProfile} options={{ headerShown: false }} />
            <Stack.Screen name="ApiList" component={ApiExercises} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </ClerkLoaded>
    </ClerkProvider>
  );
}