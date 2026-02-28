import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { ClerkLoaded, ClerkProvider } from '@clerk/clerk-expo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRef, useEffect, useState } from 'react';
import { BlurView } from 'expo-blur';

// Screens
import WelcomeScreen from './screens/WelcomeScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import Main from './tabs/main';
import Records from './tabs/records';
import Exercises from './tabs/exercises';
import Custom from './tabs/custom';
import Profile from './tabs/profile';
import WorkoutScreen from './screens/WorkoutScreen';
import FitScreen from './screens/FitScreen';
import RestScreen from './screens/RestScreen';
import CelebrationScreen from './screens/CelebrationScreen';
import Days from './screens/Days';
import UserProfile from './components/userProfile';
import Feedback from './components/Feedback';
import RestMiniTimer from './components/RestMiniTimer';
import { TokenCache } from './auth/auth';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

// ── Tab config ────────────────────────────────────────────────
const TABS = [
    {
        name: 'Main',
        label: 'Home',
        icon: 'home-variant',
        iconActive: 'home-variant',
        accent: '#FF4D2E',
    },
    {
        name: 'Exercises',
        label: 'Exercises',
        icon: 'dumbbell',
        iconActive: 'dumbbell',
        accent: '#00E5BE',
    },
    {
        name: 'Records',
        label: 'Records',
        icon: 'chart-line-variant',
        iconActive: 'chart-line-variant',
        accent: '#6C63FF',
    },
    {
        name: 'Custom',
        label: 'Custom',
        icon: 'playlist-plus',
        iconActive: 'playlist-plus',
        accent: '#00C2FF',
    },
    {
        name: 'Profile',
        label: 'Profile',
        icon: 'account-outline',
        iconActive: 'account',
        accent: '#FFB800',
    },
];

// ── Single tab button ─────────────────────────────────────────
const TabButton = ({ tab, isFocused, onPress, onLongPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const labelAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: isFocused ? 1.08 : 1,
                tension: 120,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
                toValue: isFocused ? 1 : 0,
                duration: 250,
                useNativeDriver: false,
            }),
            Animated.timing(labelAnim, {
                toValue: isFocused ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isFocused]);

    const handlePressIn = () =>
        Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true, tension: 300 }).start();
    const handlePressOut = () =>
        Animated.spring(scaleAnim, {
            toValue: isFocused ? 1.08 : 1,
            useNativeDriver: true,
            tension: 120,
        }).start();

    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
            style={styles.tabButton}
        >
            <Animated.View style={[styles.tabInner, { transform: [{ scale: scaleAnim }] }]}>
                {/* Active glow pill */}
                {isFocused && (
                    <Animated.View
                        style={[
                            styles.activePill,
                            {
                                backgroundColor: tab.accent + '18',
                                borderColor: tab.accent + '35',
                                opacity: glowAnim,
                            },
                        ]}
                    />
                )}

                {/* Icon */}
                <MaterialCommunityIcons
                    name={isFocused ? tab.iconActive : tab.icon}
                    size={22}
                    color={isFocused ? tab.accent : '#3A3A4A'}
                />

                {/* Label — fades in when active */}
                <Animated.Text
                    style={[
                        styles.tabLabel,
                        {
                            color: tab.accent,
                            opacity: labelAnim,
                            transform: [
                                {
                                    translateY: labelAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [4, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    {tab.label}
                </Animated.Text>

                {/* Active dot */}
                {isFocused && (
                    <View style={[styles.activeDot, { backgroundColor: tab.accent }]} />
                )}
            </Animated.View>
        </TouchableOpacity>
    );
};

// ── Custom tab bar ────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }) {
    return (
        <View style={styles.tabBarWrapper}>
            {/* Frosted glass background */}
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />

            {/* Dark overlay */}
            <View style={styles.tabBarOverlay} />

            {/* Top border line */}
            <View style={styles.tabBarBorder} />

            <View style={styles.tabBarContent}>
                {state.routes.map((route, index) => {
                    const isFocused = state.index === index;
                    const tab = TABS.find((t) => t.name === route.name) || TABS[0];

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({ type: 'tabLongPress', target: route.key });
                    };

                    return (
                        <TabButton
                            key={route.key}
                            tab={tab}
                            isFocused={isFocused}
                            onPress={onPress}
                            onLongPress={onLongPress}
                        />
                    );
                })}
            </View>
        </View>
    );
}

// ── Tab navigator ─────────────────────────────────────────────
function MainTabs() {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Main" component={Main} />
            <Tab.Screen name="Exercises" component={Exercises} />
            <Tab.Screen name="Records" component={Records} />
            <Tab.Screen name="Custom" component={Custom} />
            <Tab.Screen name="Profile" component={Profile} />
        </Tab.Navigator>
    );
}

// ── Root navigator ────────────────────────────────────────────
export default function AppNavigation() {
    const navigationRef = useNavigationContainerRef();
    const [currentRouteName, setCurrentRouteName] = useState('');

    const syncCurrentRoute = () => {
        const activeRoute = navigationRef.getCurrentRoute()?.name || '';
        setCurrentRouteName(activeRoute);
    };

    return (
        <ClerkProvider tokenCache={TokenCache} publishableKey={publishableKey}>
            <ClerkLoaded>
                <NavigationContainer
                    ref={navigationRef}
                    onReady={syncCurrentRoute}
                    onStateChange={syncCurrentRoute}
                >
                    <Stack.Navigator initialRouteName="Welcome">
                        <Stack.Screen
                            name="Welcome"
                            component={WelcomeScreen}
                            options={{ headerShown: false, animationTypeForReplace: 'pop' }}
                        />
                        <Stack.Screen
                            name="Onboarding"
                            component={OnboardingScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="App"
                            component={MainTabs}
                            options={{ headerShown: false, gestureEnabled: false }}
                        />
                        <Stack.Screen name="Workout" component={WorkoutScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Fit" component={FitScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Rest" component={RestScreen} options={{ headerShown: false }} />
                        <Stack.Screen
                            name="Celebration"
                            component={CelebrationScreen}
                            options={{ headerShown: false, gestureEnabled: false }}
                        />
                        <Stack.Screen name="Days" component={Days} options={{ headerShown: false }} />
                        <Stack.Screen name="userProfile" component={UserProfile} options={{ headerShown: false }} />
                        <Stack.Screen name="feedback" component={Feedback} options={{ headerShown: false }} />
                    </Stack.Navigator>
                    <RestMiniTimer
                        currentRouteName={currentRouteName}
                        navigationRef={navigationRef}
                    />
                </NavigationContainer>
            </ClerkLoaded>
        </ClerkProvider>
    );
}

const styles = StyleSheet.create({
    // ── Tab bar wrapper
    tabBarWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 84,
        overflow: 'hidden',
    },
    tabBarOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(1, 1, 10, 0.88)',
    },
    tabBarBorder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    tabBarContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 16,
        paddingTop: 8,
        paddingHorizontal: 8,
    },

    // ── Tab button
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabInner: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        paddingHorizontal: 14,
        paddingVertical: 6,
        position: 'relative',
        minWidth: 56,
    },
    activePill: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 14,
        borderWidth: 1,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    activeDot: {
        position: 'absolute',
        bottom: -8,
        width: 4,
        height: 4,
        borderRadius: 2,
    },
});
