import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    StatusBar,
    Dimensions,
} from 'react-native';
import FitnessCards from '../components/FitnessCards';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useContext, useState, useRef, useEffect } from 'react';
import { FitnessItems } from '../Context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Animated stat card component
const StatCard = ({ value, label, icon, delay = 0, accentColor = '#FF4D2E' }) => {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.statCard,
                { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
            ]}
        >
            <View style={[styles.statIconBg, { backgroundColor: accentColor + '22' }]}>
                <Feather name={icon} size={14} color={accentColor} />
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </Animated.View>
    );
};

const HomeScreen = () => {
    const [isDark, setIsDark] = useState(true);
    const { calories, minutes, workout } = useContext(FitnessItems);
    const headerAnim = useRef(new Animated.Value(-20)).current;
    const headerOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(headerAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(headerOpacity, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <LinearGradient
                colors={['#0D0D0F', '#1A1A22']}
                style={styles.header}
            >
                {/* Decorative accent line */}
                <View style={styles.accentLine} />

                <Animated.View
                    style={{
                        opacity: headerOpacity,
                        transform: [{ translateY: headerAnim }],
                    }}
                >
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.greeting}>Good morning 👊</Text>
                            <Text style={styles.headerTitle}>FITNESS PARTNER</Text>
                            <Text style={styles.dateText}>{today}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => setIsDark(!isDark)}
                            style={styles.themeToggle}
                        >
                            <Ionicons
                                name={isDark ? 'sunny-outline' : 'moon-outline'}
                                size={20}
                                color={isDark ? '#FF4D2E' : '#A0A0B0'}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Stat Cards */}
                    <View style={styles.statsRow}>
                        <StatCard
                            value={calories.toFixed(0)}
                            label="KCAL"
                            icon="zap"
                            delay={100}
                            accentColor="#FF4D2E"
                        />
                        <StatCard
                            value={workout}
                            label="WORKOUTS"
                            icon="activity"
                            delay={200}
                            accentColor="#00E5BE"
                        />
                        <StatCard
                            value={minutes}
                            label="MINUTES"
                            icon="clock"
                            delay={300}
                            accentColor="#6C63FF"
                        />
                    </View>
                </Animated.View>

                {/* Weekly progress strip */}
                <View style={styles.weekStrip}>
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                        const isToday = i === new Date().getDay() - 1;
                        const isDone = i < new Date().getDay() - 1;
                        return (
                            <View key={i} style={styles.dayDot}>
                                <View
                                    style={[
                                        styles.dotCircle,
                                        isDone && styles.dotDone,
                                        isToday && styles.dotToday,
                                    ]}
                                >
                                    {isDone && (
                                        <Feather name="check" size={8} color="#fff" />
                                    )}
                                </View>
                                <Text
                                    style={[
                                        styles.dayLabel,
                                        isToday && { color: '#FF4D2E', fontWeight: '700' },
                                    ]}
                                >
                                    {day}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </LinearGradient>

            {/* Workout Categories */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.scrollBody}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>PROGRAMS</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAll}>See all</Text>
                    </TouchableOpacity>
                </View>
                <FitnessCards />
            </ScrollView>
        </View>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F7',
    },
    header: {
        paddingTop: 56,
        paddingHorizontal: 22,
        paddingBottom: 0,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        overflow: 'hidden',
    },
    accentLine: {
        position: 'absolute',
        top: 0,
        left: 40,
        right: 40,
        height: 3,
        backgroundColor: '#FF4D2E',
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 22,
    },
    greeting: {
        color: '#A0A0B0',
        fontSize: 13,
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: '900',
        letterSpacing: 3,
    },
    dateText: {
        color: '#60607A',
        fontSize: 12,
        marginTop: 4,
        letterSpacing: 0.5,
    },
    themeToggle: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.07)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    statIconBg: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    statValue: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    statLabel: {
        color: '#60607A',
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginTop: 2,
    },
    weekStrip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
        paddingVertical: 18,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.06)',
    },
    dayDot: {
        alignItems: 'center',
        gap: 5,
    },
    dotCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.07)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    dotDone: {
        backgroundColor: '#FF4D2E',
        borderColor: '#FF4D2E',
    },
    dotToday: {
        borderColor: '#FF4D2E',
        borderWidth: 2,
        backgroundColor: 'rgba(255,77,46,0.15)',
    },
    dayLabel: {
        color: '#50506A',
        fontSize: 10,
        fontWeight: '600',
    },
    scrollBody: {
        flex: 1,
        marginTop: 6,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 22,
        paddingTop: 22,
        paddingBottom: 8,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#999',
        letterSpacing: 2,
    },
    seeAll: {
        fontSize: 13,
        color: '#FF4D2E',
        fontWeight: '600',
    },
});