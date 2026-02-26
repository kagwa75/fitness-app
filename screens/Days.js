import { useNavigation, useRoute } from '@react-navigation/native';
import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    Animated,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Staggered animated row
const AnimatedRow = ({ children, delay = 0 }) => {
    const translateX = useRef(new Animated.Value(30)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.spring(translateX, {
                    toValue: 0,
                    tension: 80,
                    friction: 10,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    return (
        <Animated.View style={{ opacity, transform: [{ translateX }] }}>
            {children}
        </Animated.View>
    );
};

// Workout day card
const WorkoutDayCard = ({ workoutDay, index, exercises, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () =>
        Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, tension: 300 }).start();
    const handlePressOut = () =>
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300 }).start();

    // Map day index to accent colours
    const accents = ['#FF4D2E', '#00E5BE', '#6C63FF', '#FFB800', '#FF4D8C', '#00C2FF'];
    const accent = accents[index % accents.length];

    // Infer focus area from exercise targets
    const targets = [...new Set(exercises.slice(0, 3).map((e) => e.target).filter(Boolean))];
    const focusLabel = targets.length ? targets.join(' · ').toUpperCase() : workoutDay.focus?.toUpperCase() || 'FULL BODY';

    return (
        <AnimatedRow delay={200 + index * 90}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                <Animated.View style={[styles.dayCard, { transform: [{ scale: scaleAnim }] }]}>
                    {/* Left accent bar */}
                    <View style={[styles.dayAccentBar, { backgroundColor: accent }]} />

                    <View style={styles.dayCardContent}>
                        {/* Number badge */}
                        <View style={[styles.dayNumber, { backgroundColor: accent + '20', borderColor: accent + '40' }]}>
                            <Text style={[styles.dayNumberText, { color: accent }]}>
                                {String(index + 1).padStart(2, '0')}
                            </Text>
                        </View>

                        {/* Info */}
                        <View style={styles.dayInfo}>
                            <Text style={styles.dayName}>{workoutDay.name}</Text>
                            <Text style={styles.dayFocus}>{focusLabel}</Text>
                            <View style={styles.dayMeta}>
                                <View style={styles.metaTag}>
                                    <Feather name="list" size={10} color="#777" />
                                    <Text style={styles.metaTagText}>{exercises.length} exercises</Text>
                                </View>
                                {workoutDay.duration && (
                                    <View style={styles.metaTag}>
                                        <Feather name="clock" size={10} color="#777" />
                                        <Text style={styles.metaTagText}>{workoutDay.duration} min</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* CTA */}
                        <View style={[styles.startCTA, { backgroundColor: accent }]}>
                            <Text style={styles.startText}>GO</Text>
                            <Feather name="arrow-right" size={12} color="#fff" />
                        </View>
                    </View>

                    {/* Exercise preview thumbnails */}
                    {exercises.slice(0, 3).some((e) => e.gifUrl) && (
                        <View style={styles.thumbRow}>
                            {exercises.slice(0, 3).map((ex, i) =>
                                ex.gifUrl ? (
                                    <Image
                                        key={i}
                                        source={{ uri: ex.gifUrl }}
                                        style={[
                                            styles.exerciseThumb,
                                            { borderColor: accent + '50' },
                                        ]}
                                    />
                                ) : null
                            )}
                            {exercises.length > 3 && (
                                <View style={[styles.moreThumb, { backgroundColor: accent + '20', borderColor: accent + '40' }]}>
                                    <Text style={[styles.moreThumbText, { color: accent }]}>
                                        +{exercises.length - 3}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </Animated.View>
            </TouchableOpacity>
        </AnimatedRow>
    );
};

const Days = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [apiExercises, setApiExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { list, Days, image } = route.params;

    const heroScale = useRef(new Animated.Value(1.08)).current;
    const heroOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(heroScale, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(heroOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]).start();
    }, []);

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                setLoading(true);
                setError(null);
                const totalNeeded = Days.reduce((t, d) => t + (d.exercises?.length || 0), 0);
                const limit = Math.max(totalNeeded, 10);

                const response = await fetch(
                    `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${list.toLowerCase()}?limit=${limit}`,
                    {
                        headers: {
                            'x-rapidapi-key': '4b35b2e3camshc1fb6629a92c312p1f22b2jsnf8899d2596dd',
                            'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
                        },
                    }
                );
                if (!response.ok) throw new Error('Failed to fetch exercises');
                const data = await response.json();
                setApiExercises(data);
            } catch (err) {
                console.error('API Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchExercises();
    }, [list, Days]);

    const getExercisesForDay = (workoutDay) => {
        if (apiExercises.length === 0 || error) return workoutDay.exercises || [];
        return apiExercises.slice(0, workoutDay.exercises?.length || 0);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar barStyle="light-content" />
                <ActivityIndicator size="large" color="#FF4D2E" />
                <Text style={styles.loadingText}>Loading workouts…</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Hero Image */}
            <View style={styles.heroContainer}>
                <Animated.Image
                    source={{ uri: image }}
                    style={[styles.heroImage, { transform: [{ scale: heroScale }], opacity: heroOpacity }]}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.2)', 'transparent']}
                    style={StyleSheet.absoluteFillObject}
                />
                <LinearGradient
                    colors={['transparent', 'rgba(13,13,15,0.95)', '#0D0D0F']}
                    style={styles.heroBottomFade}
                />

                {/* Back button */}
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                >
                    <Feather name="chevron-left" size={22} color="#fff" />
                </TouchableOpacity>

                {/* Hero text */}
                <AnimatedRow delay={50}>
                    <View style={styles.heroTextContainer}>
                        <View style={styles.heroBadge}>
                            <MaterialCommunityIcons name="lightning-bolt" size={11} color="#FF4D2E" />
                            <Text style={styles.heroBadgeText}>PROGRAM</Text>
                        </View>
                        <Text style={styles.heroTitle}>{list}</Text>
                        <Text style={styles.heroSubtitle}>{Days.length} workout days</Text>
                    </View>
                </AnimatedRow>
            </View>

            {/* Error banner (non-blocking) */}
            {error && (
                <View style={styles.errorBanner}>
                    <Feather name="alert-circle" size={14} color="#FFB800" />
                    <Text style={styles.errorBannerText}>
                        Couldn't load live exercises — using local data
                    </Text>
                </View>
            )}

            {/* Day cards */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <AnimatedRow delay={150}>
                    <Text style={styles.sectionLabel}>SELECT A DAY</Text>
                </AnimatedRow>

                {Days.map((workoutDay, index) => (
                    <WorkoutDayCard
                        key={index}
                        workoutDay={workoutDay}
                        index={index}
                        exercises={getExercisesForDay(workoutDay)}
                        onPress={() =>
                            navigation.navigate('Workout', {
                                exercises: getExercisesForDay(workoutDay),
                                image,
                            })
                        }
                    />
                ))}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

export default Days;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0F',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#0D0D0F',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 14,
    },
    loadingText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 0.5,
    },

    // Hero
    heroContainer: {
        height: height * 0.42,
        position: 'relative',
        overflow: 'hidden',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroBottomFade: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60%',
    },
    backBtn: {
        position: 'absolute',
        top: 56,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 13,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        zIndex: 10,
    },
    heroTextContainer: {
        position: 'absolute',
        bottom: 28,
        left: 22,
        right: 22,
    },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 6,
    },
    heroBadgeText: {
        color: '#FF4D2E',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    heroTitle: {
        color: '#fff',
        fontSize: 34,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    heroSubtitle: {
        color: '#888',
        fontSize: 14,
        fontWeight: '500',
        marginTop: 4,
    },

    // Error banner
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,184,0,0.1)',
        borderLeftWidth: 3,
        borderLeftColor: '#FFB800',
        marginHorizontal: 20,
        marginTop: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
    },
    errorBannerText: {
        color: '#FFB800',
        fontSize: 12,
        fontWeight: '500',
    },

    // Scroll
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    sectionLabel: {
        color: '#444',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 14,
    },

    // Day card
    dayCard: {
        backgroundColor: '#16161A',
        borderRadius: 20,
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    dayAccentBar: {
        height: 3,
        width: '100%',
    },
    dayCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 14,
    },
    dayNumber: {
        width: 46,
        height: 46,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        flexShrink: 0,
    },
    dayNumberText: {
        fontSize: 15,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    dayInfo: {
        flex: 1,
    },
    dayName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: -0.3,
        marginBottom: 2,
    },
    dayFocus: {
        color: '#555',
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 7,
    },
    dayMeta: {
        flexDirection: 'row',
        gap: 10,
    },
    metaTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaTagText: {
        color: '#666',
        fontSize: 11,
        fontWeight: '500',
    },
    startCTA: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    startText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 0.5,
    },

    // Thumbnail strip
    thumbRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 14,
        gap: 8,
    },
    exerciseThumb: {
        width: 52,
        height: 52,
        borderRadius: 12,
        backgroundColor: '#222',
        borderWidth: 1,
    },
    moreThumb: {
        width: 52,
        height: 52,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    moreThumbText: {
        fontSize: 13,
        fontWeight: '900',
    },
});