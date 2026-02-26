import { useNavigation } from '@react-navigation/native';
import {
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { images } from '../constants';

const { width, height } = Dimensions.get('window');

// Floating stat pill component
const StatPill = ({ icon, value, label, delay, accentColor }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(16)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.spring(translateY, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
            ]),
        ]).start();
    }, []);

    return (
        <Animated.View style={[styles.statPill, { opacity, transform: [{ translateY }] }]}>
            <View style={[styles.statIconBg, { backgroundColor: accentColor + '22' }]}>
                <MaterialCommunityIcons name={icon} size={14} color={accentColor} />
            </View>
            <View>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
            </View>
        </Animated.View>
    );
};

export default function Welcome() {
    const navigation = useNavigation();

    // Animation refs
    const bgScale = useRef(new Animated.Value(1.12)).current;
    const bgOpacity = useRef(new Animated.Value(0)).current;
    const logoY = useRef(new Animated.Value(-30)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const headlineY = useRef(new Animated.Value(40)).current;
    const headlineOpacity = useRef(new Animated.Value(0)).current;
    const subY = useRef(new Animated.Value(30)).current;
    const subOpacity = useRef(new Animated.Value(0)).current;
    const btnScale = useRef(new Animated.Value(0.88)).current;
    const btnOpacity = useRef(new Animated.Value(0)).current;
    const ctaBtnScale = useRef(new Animated.Value(1)).current;
    const glowPulse = useRef(new Animated.Value(0.85)).current;

    useEffect(() => {
        // Orchestrated cinematic entrance
        Animated.sequence([
            // 1. Background fades and zooms in
            Animated.parallel([
                Animated.timing(bgOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(bgScale, { toValue: 1, duration: 1200, useNativeDriver: true }),
            ]),
            // 2. Logo drops in
            Animated.parallel([
                Animated.spring(logoY, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
                Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
            ]),
            // 3. Headline rises
            Animated.parallel([
                Animated.spring(headlineY, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
                Animated.timing(headlineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
            ]),
            // 4. Subtext
            Animated.parallel([
                Animated.spring(subY, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
                Animated.timing(subOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]),
            // 5. Button bounces in
            Animated.parallel([
                Animated.spring(btnScale, { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }),
                Animated.timing(btnOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]),
        ]).start();

        // Continuous glow pulse
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowPulse, { toValue: 1.15, duration: 2000, useNativeDriver: true }),
                Animated.timing(glowPulse, { toValue: 0.85, duration: 2000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const handlePressIn = () =>
        Animated.spring(ctaBtnScale, { toValue: 0.96, useNativeDriver: true, tension: 300 }).start();
    const handlePressOut = () =>
        Animated.spring(ctaBtnScale, { toValue: 1, useNativeDriver: true, tension: 300 }).start();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Background hero image */}
            <Animated.View style={[styles.bgWrapper, { opacity: bgOpacity, transform: [{ scale: bgScale }] }]}>
                <Image
                    source={images.welkom}
                    style={styles.bgImage}
                    resizeMode="cover"
                />
            </Animated.View>

            {/* Dark gradient overlays */}
            <LinearGradient
                colors={['rgba(13,13,15,0.5)', 'transparent', 'rgba(13,13,15,0.3)']}
                style={StyleSheet.absoluteFillObject}
            />
            <LinearGradient
                colors={['transparent', 'rgba(13,13,15,0.85)', '#0D0D0F']}
                style={styles.bottomFade}
            />

            {/* Red glow orb */}
            <Animated.View style={[styles.glowOrb, { transform: [{ scale: glowPulse }] }]} />

            <SafeAreaView style={styles.safeArea}>
                {/* Top logo / brand */}
                <Animated.View
                    style={[
                        styles.topBrand,
                        { opacity: logoOpacity, transform: [{ translateY: logoY }] },
                    ]}
                >
                    <View style={styles.brandBadge}>
                        <MaterialCommunityIcons name="lightning-bolt" size={14} color="#FF4D2E" />
                        <Text style={styles.brandText}>FITNESS PARTNER</Text>
                    </View>
                </Animated.View>

                {/* Spacer */}
                <View style={{ flex: 1 }} />

                {/* Bottom content */}
                <View style={styles.bottomContent}>
                    {/* Floating stats */}
                    <View style={styles.statsRow}>
                        <StatPill
                            icon="fire"
                            value="500+"
                            label="Exercises"
                            delay={900}
                            accentColor="#FF4D2E"
                        />
                        <StatPill
                            icon="dumbbell"
                            value="20+"
                            label="Programs"
                            delay={1050}
                            accentColor="#00E5BE"
                        />
                        <StatPill
                            icon="timer-outline"
                            value="Daily"
                            label="Tracking"
                            delay={1200}
                            accentColor="#6C63FF"
                        />
                    </View>

                    {/* Headline */}
                    <Animated.View
                        style={{ opacity: headlineOpacity, transform: [{ translateY: headlineY }] }}
                    >
                        <Text style={styles.headline}>
                            TRAIN{'\n'}
                            <Text style={styles.headlineAccent}>HARDER.</Text>
                            {'\n'}LIVE BETTER.
                        </Text>
                    </Animated.View>

                    {/* Subtext */}
                    <Animated.Text
                        style={[styles.subtext, { opacity: subOpacity, transform: [{ translateY: subY }] }]}
                    >
                        Personalized workouts, real-time tracking,{'\n'}
                        and the motivation to keep going.
                    </Animated.Text>

                    {/* CTA Button */}
                    <Animated.View
                        style={[
                            styles.ctaWrapper,
                            { opacity: btnOpacity, transform: [{ scale: btnScale }] },
                        ]}
                    >
                        <TouchableOpacity
                            onPress={() => navigation.navigate('App')}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            activeOpacity={1}
                        >
                            <Animated.View style={{ transform: [{ scale: ctaBtnScale }] }}>
                                <LinearGradient
                                    colors={['#FF4D2E', '#FF2800']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.ctaBtn}
                                >
                                    <Text style={styles.ctaBtnText}>GET STARTED</Text>
                                    <View style={styles.ctaArrow}>
                                        <Feather name="arrow-right" size={18} color="#FF4D2E" />
                                    </View>
                                </LinearGradient>
                            </Animated.View>
                        </TouchableOpacity>

                        {/* Secondary action */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('App')}
                            style={styles.secondaryBtn}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.secondaryBtnText}>
                                Already have an account?{' '}
                                <Text style={{ color: '#FF4D2E', fontWeight: '700' }}>Sign in</Text>
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0F',
    },

    // Background
    bgWrapper: {
        ...StyleSheet.absoluteFillObject,
    },
    bgImage: {
        width: '100%',
        height: '100%',
    },
    bottomFade: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.65,
    },

    // Glow
    glowOrb: {
        position: 'absolute',
        top: height * 0.28,
        alignSelf: 'center',
        width: 340,
        height: 340,
        borderRadius: 170,
        backgroundColor: '#FF4D2E',
        opacity: 0.09,
    },

    safeArea: {
        flex: 1,
        paddingHorizontal: 24,
    },

    // Top brand
    topBrand: {
        paddingTop: 16,
        alignItems: 'flex-start',
    },
    brandBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,77,46,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255,77,46,0.3)',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
    },
    brandText: {
        color: '#FF4D2E',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
    },

    // Bottom content
    bottomContent: {
        paddingBottom: 12,
        gap: 20,
    },

    // Stats row
    statsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    statPill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(22,22,26,0.85)',
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
    },
    statIconBg: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    statValue: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    statLabel: {
        color: '#555',
        fontSize: 9,
        fontWeight: '600',
        letterSpacing: 0.5,
    },

    // Headline
    headline: {
        color: '#fff',
        fontSize: 52,
        fontWeight: '900',
        letterSpacing: -2,
        lineHeight: 54,
    },
    headlineAccent: {
        color: '#FF4D2E',
    },

    // Subtext
    subtext: {
        color: '#666',
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 22,
    },

    // CTA
    ctaWrapper: {
        gap: 14,
        paddingBottom: 8,
    },
    ctaBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 32,
        gap: 14,
    },
    ctaBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 2,
    },
    ctaArrow: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryBtn: {
        alignItems: 'center',
        paddingVertical: 6,
    },
    secondaryBtnText: {
        color: '#555',
        fontSize: 13,
        fontWeight: '500',
    },
});