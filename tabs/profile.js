import { useNavigation } from '@react-navigation/native';
import {
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    Animated,
    StatusBar,
    ScrollView,
    Alert,
    Dimensions,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth, useOAuth, useUser } from '@clerk/clerk-expo';
import { useContext, useRef, useEffect, useState } from 'react';
import { FitnessItems } from '../Context';
import axios from 'axios';
import API_BASE_URL from '../constants/api';

const { width } = Dimensions.get('window');

// ── Setting row ───────────────────────────────────────────────
const SettingRow = ({ iconName, iconLib = 'feather', label, accentColor = '#FF4D2E', onPress, isDestructive, delay = 0 }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
                Animated.timing(opacityAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
            ]),
        ]).start();
    }, []);

    const handlePressIn = () =>
        Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, tension: 300 }).start();
    const handlePressOut = () =>
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300 }).start();

    const IconComponent = iconLib === 'material' ? MaterialCommunityIcons : Feather;

    return (
        <Animated.View style={{ opacity: opacityAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                <View style={styles.settingRow}>
                    {/* Icon badge */}
                    <View style={[styles.settingIconBg, { backgroundColor: accentColor + '18' }]}>
                        <IconComponent
                            name={iconName}
                            size={16}
                            color={isDestructive ? '#FF4D2E' : accentColor}
                        />
                    </View>

                    <Text style={[styles.settingLabel, isDestructive && { color: '#FF4D2E' }]}>
                        {label}
                    </Text>

                    <Feather name="chevron-right" size={15} color="#333" />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ── Section wrapper ───────────────────────────────────────────
const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
        <Text style={styles.sectionLabel}>{title}</Text>
        <View style={styles.sectionCard}>
            {children}
        </View>
    </View>
);

// ── Google sign-in button ─────────────────────────────────────
const GoogleSignInBtn = ({ onPress, loading }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () =>
        Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, tension: 300 }).start();
    const handlePressOut = () =>
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300 }).start();

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
        >
            <Animated.View style={[styles.googleBtn, { transform: [{ scale: scaleAnim }] }]}>
                <MaterialCommunityIcons name="google" size={18} color="#fff" />
                <Text style={styles.googleBtnText}>
                    {loading ? 'Signing in...' : 'Continue with Google'}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

// ── Main screen ───────────────────────────────────────────────
export default function Profile() {
    const navigation = useNavigation();
    const { isSignedIn, signOut } = useAuth();
    const { user, isLoaded: isUserLoaded } = useUser();
    const { calories, minutes, workout } = useContext(FitnessItems);
    const [googleLoading, setGoogleLoading] = useState(false);
    const syncedUserIdsRef = useRef(new Set());

    const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

    const headerOpacity = useRef(new Animated.Value(0)).current;
    const headerY = useRef(new Animated.Value(-20)).current;
    const avatarScale = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(headerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(headerY, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
            Animated.spring(avatarScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        ]).start();
    }, []);

    const syncUserToDatabase = async (clerkUser) => {
        const clerkId = clerkUser?.id;
        if (!clerkId || syncedUserIdsRef.current.has(clerkId)) return;

        const email =
            clerkUser?.primaryEmailAddress?.emailAddress ||
            clerkUser?.emailAddresses?.[0]?.emailAddress ||
            '';

        const firstName = String(clerkUser?.firstName || '').trim();
        const lastName = String(clerkUser?.lastName || '').trim();
        const fallbackName = email ? email.split('@')[0] : 'User';
        const name = `${firstName} ${lastName}`.trim() || fallbackName;

        if (!email) return;

        try {
            await axios.post(`${API_BASE_URL}/users`, {
                name,
                email,
                clerkId,
            });
            syncedUserIdsRef.current.add(clerkId);
        } catch (error) {
            console.error('Failed to sync user to database:', error);
        }
    };

    useEffect(() => {
        if (!isUserLoaded || !isSignedIn || !user?.id) return;
        syncUserToDatabase(user);
    }, [isUserLoaded, isSignedIn, user?.id]);

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        try {
            const { createdSessionId, setActive } = await startOAuthFlow();
            if (!createdSessionId || !setActive) {
                Alert.alert('Sign in cancelled', 'Google sign in was not completed.');
                return;
            }

            await setActive({ session: createdSessionId });
            Alert.alert('Success', 'Signed in with Google!');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', error?.errors?.[0]?.longMessage || error.message);
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
        ]);
    };

    const initials = isSignedIn && user
        ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
        : '?';

    const displayName = isSignedIn && user
        ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
        : 'Guest User';

    const displayEmail = isSignedIn && user
        ? user.primaryEmailAddress?.emailAddress
        : 'Not signed in';

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {/* Header gradient */}
                <LinearGradient
                    colors={['#0D0D0F', '#131318']}
                    style={styles.headerGradient}
                >
                    <SafeAreaView edges={['top']}>
                        <Animated.View
                            style={[
                                styles.headerContent,
                                { opacity: headerOpacity, transform: [{ translateY: headerY }] },
                            ]}
                        >
                            {/* Page label */}
                            <View style={styles.pageBadge}>
                                <MaterialCommunityIcons name="lightning-bolt" size={11} color="#FF4D2E" />
                                <Text style={styles.pageBadgeText}>PROFILE</Text>
                            </View>

                            {/* Avatar + identity */}
                            <View style={styles.profileRow}>
                                <Animated.View style={[styles.avatarWrapper, { transform: [{ scale: avatarScale }] }]}>
                                    {isSignedIn && user?.imageUrl ? (
                                        <Image
                                            source={{ uri: user.imageUrl }}
                                            style={styles.avatarImage}
                                        />
                                    ) : (
                                        <LinearGradient
                                            colors={['#FF4D2E', '#FF2800']}
                                            style={styles.avatarGradient}
                                        >
                                            <Text style={styles.avatarInitials}>{initials}</Text>
                                        </LinearGradient>
                                    )}
                                    {isSignedIn && (
                                        <View style={styles.onlineDot} />
                                    )}
                                </Animated.View>

                                <View style={styles.identityInfo}>
                                    <Text style={styles.displayName}>{displayName}</Text>
                                    <Text style={styles.displayEmail}>{displayEmail}</Text>
                                    {isSignedIn && (
                                        <View style={styles.verifiedBadge}>
                                            <Feather name="check-circle" size={10} color="#00E5BE" />
                                            <Text style={styles.verifiedText}>Verified</Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Mini stat row */}
                            <View style={styles.miniStats}>
                                {[
                                    { value: workout, label: 'Workouts', color: '#FF4D2E' },
                                    { value: minutes, label: 'Minutes', color: '#00E5BE' },
                                    { value: calories.toFixed(0), label: 'Kcal', color: '#6C63FF' },
                                ].map((s, i) => (
                                    <View key={i} style={styles.miniStat}>
                                        <Text style={[styles.miniStatValue, { color: s.color }]}>{s.value}</Text>
                                        <Text style={styles.miniStatLabel}>{s.label}</Text>
                                    </View>
                                ))}
                            </View>
                        </Animated.View>
                    </SafeAreaView>
                </LinearGradient>

                {/* Sign-in prompt if not signed in */}
                {!isSignedIn && (
                    <View style={styles.signInPrompt}>
                        <View style={styles.signInIconBg}>
                            <MaterialCommunityIcons name="cloud-sync-outline" size={24} color="#FF4D2E" />
                        </View>
                        <Text style={styles.signInTitle}>Sync your progress</Text>
                        <Text style={styles.signInSubtext}>
                            Sign in to back up your workouts and access them from any device
                        </Text>
                        <GoogleSignInBtn onPress={handleGoogleSignIn} loading={googleLoading} />
                    </View>
                )}

                {/* Settings groups */}
                <View style={styles.settingsContainer}>
                    <SettingSection title="ACCOUNT">
                        <SettingRow
                            iconName="user"
                            label="My Profile"
                            accentColor="#FF9500"
                            onPress={() => navigation.navigate('userProfile')}
                            delay={100}
                        />
                        <View style={styles.rowDivider} />
                        <SettingRow
                            iconName="settings"
                            label="General Settings"
                            accentColor="#34C759"
                            delay={150}
                        />
                        <View style={styles.rowDivider} />
                        <SettingRow
                            iconName="globe"
                            label="Language"
                            accentColor="#5856D6"
                            delay={200}
                        />
                    </SettingSection>

                    <SettingSection title="APP">
                        <SettingRow
                            iconName="zap-off"
                            label="Remove Ads"
                            accentColor="#FF3B30"
                            delay={250}
                        />
                        <View style={styles.rowDivider} />
                        <SettingRow
                            iconName="star"
                            label="Rate Us"
                            accentColor="#FFB800"
                            delay={300}
                        />
                        <View style={styles.rowDivider} />
                        <SettingRow
                            iconName="message-square"
                            label="Send Feedback"
                            accentColor="#00C2FF"
                            onPress={() => navigation.navigate('feedback')}
                            delay={350}
                        />
                    </SettingSection>

                    <SettingSection title="DATA">
                        <SettingRow
                            iconName="download"
                            label="Export Data"
                            accentColor="#00E5BE"
                            delay={400}
                        />
                        <View style={styles.rowDivider} />
                        <SettingRow
                            iconName="upload-cloud"
                            label="Backup to Cloud"
                            accentColor="#6C63FF"
                            onPress={!isSignedIn ? handleGoogleSignIn : undefined}
                            delay={450}
                        />
                    </SettingSection>

                    {isSignedIn && (
                        <SettingSection title="SESSION">
                            <SettingRow
                                iconName="log-out"
                                label="Sign Out"
                                accentColor="#FF4D2E"
                                isDestructive
                                onPress={handleSignOut}
                                delay={500}
                            />
                        </SettingSection>
                    )}

                    {/* App version */}
                    <View style={styles.appVersion}>
                        <MaterialCommunityIcons name="lightning-bolt" size={12} color="#333" />
                        <Text style={styles.appVersionText}>FITNESS PARTNER · v1.0.0</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0F',
    },
    scroll: {
        paddingBottom: 100,
    },

    // Header
    headerGradient: {
        paddingHorizontal: 22,
        paddingBottom: 28,
    },
    headerContent: {
        paddingTop: 12,
    },
    pageBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 16,
    },
    pageBadgeText: {
        color: '#FF4D2E',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
    },

    // Profile row
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 22,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatarImage: {
        width: 64,
        height: 64,
        borderRadius: 20,
    },
    avatarGradient: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitials: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    onlineDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#00E5BE',
        borderWidth: 2,
        borderColor: '#0D0D0F',
    },
    identityInfo: {
        flex: 1,
        gap: 3,
    },
    displayName: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: -0.3,
    },
    displayEmail: {
        color: '#555',
        fontSize: 12,
        fontWeight: '400',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    verifiedText: {
        color: '#00E5BE',
        fontSize: 11,
        fontWeight: '700',
    },

    // Mini stats
    miniStats: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
    },
    miniStat: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 14,
        borderRightWidth: 1,
        borderRightColor: 'rgba(255,255,255,0.05)',
    },
    miniStatValue: {
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    miniStatLabel: {
        color: '#444',
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.8,
        marginTop: 2,
    },

    // Sign-in prompt
    signInPrompt: {
        margin: 20,
        backgroundColor: '#16161A',
        borderRadius: 22,
        padding: 22,
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,77,46,0.15)',
    },
    signInIconBg: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: 'rgba(255,77,46,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    signInTitle: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '800',
    },
    signInSubtext: {
        color: '#555',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 6,
    },
    googleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#1E1E26',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 20,
        width: '100%',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    googleBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },

    // Settings
    settingsContainer: {
        paddingHorizontal: 20,
        paddingTop: 8,
        gap: 6,
    },
    section: {
        gap: 6,
        marginBottom: 8,
    },
    sectionLabel: {
        color: '#333',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
        paddingLeft: 4,
        marginBottom: 2,
    },
    sectionCard: {
        backgroundColor: '#16161A',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 14,
    },
    settingIconBg: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    settingLabel: {
        flex: 1,
        color: '#EFEFEF',
        fontSize: 14,
        fontWeight: '600',
    },
    rowDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.04)',
        marginLeft: 66,
    },

    // Footer
    appVersion: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingTop: 20,
        paddingBottom: 8,
    },
    appVersionText: {
        color: '#2A2A36',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
});
