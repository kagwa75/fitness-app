import { useNavigation, useRoute } from '@react-navigation/native';
import {
    Alert,
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
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { FitnessItems } from '../Context';
import { generateProgramDaysFromTemplate } from '../utils/Workoutgenerator';
const { width, height } = Dimensions.get('window');

const READINESS_OPTIONS = [
    { value: 'fresh', label: 'Fresh', icon: 'trending-up', color: '#00E5BE' },
    { value: 'normal', label: 'Normal', icon: 'activity', color: '#00C2FF' },
    { value: 'fatigued', label: 'Fatigued', icon: 'battery-charging', color: '#FFB800' },
];

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
const WorkoutDayCard = ({ workoutDay, index, exercises, onPress, isLocked, isCompleted }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () =>
        Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, tension: 300 }).start();
    const handlePressOut = () =>
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300 }).start();

    const accents = ['#FF4D2E', '#00E5BE', '#6C63FF', '#FFB800', '#FF4D8C', '#00C2FF'];
    const accent = accents[index % accents.length];

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
                <Animated.View
                    style={[
                        styles.dayCard,
                        { transform: [{ scale: scaleAnim }] },
                        isLocked && styles.dayCardLocked,
                    ]}
                >
                    <View style={[styles.dayAccentBar, { backgroundColor: accent }]} />

                    <View style={styles.dayCardContent}>
                        <View style={[styles.dayNumber, { backgroundColor: accent + '20', borderColor: accent + '40' }]}>
                            <Text style={[styles.dayNumberText, { color: accent }]}>
                                {String(index + 1).padStart(2, '0')}
                            </Text>
                        </View>

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

                        <View style={[styles.startCTA, { backgroundColor: isLocked ? '#3D3D52' : accent }]}>
                            {isCompleted ? (
                                <>
                                    <Feather name="check-circle" size={12} color="#fff" />
                                    <Text style={styles.startText}>DONE</Text>
                                </>
                            ) : isLocked ? (
                                <>
                                    <Feather name="lock" size={12} color="#D6D6E6" />
                                    <Text style={styles.startText}>LOCKED</Text>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.startText}>GO</Text>
                                    <Feather name="arrow-right" size={12} color="#fff" />
                                </>
                            )}
                        </View>
                    </View>

                    {exercises.slice(0, 3).some((e) => e.gifUrl) && (
                        <View style={styles.thumbRow}>
                            {exercises.slice(0, 3).map((ex, i) =>
                                ex.gifUrl ? (
                                    <Image
                                        key={i}
                                        source={{ uri: ex.gifUrl }}
                                        style={[styles.exerciseThumb, { borderColor: accent + '50' }]}
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

                    {isCompleted ? (
                        <View style={styles.completedPill}>
                            <Feather name="check-circle" size={11} color="#00E5BE" />
                            <Text style={styles.completedPillText}>Completed</Text>
                        </View>
                    ) : null}
                </Animated.View>
            </TouchableOpacity>
        </AnimatedRow>
    );
};

const Days = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const {
        getCompletedDaysForProgram,
        userProfile,
        getProgramAdaptation,
        saveProgramAdaptation,
    } = useContext(FitnessItems);
    const [personalizedDays, setPersonalizedDays] = useState([]);
    const [planMeta, setPlanMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { list = '', category = '', Days: programDays = [], image } = route.params || {};

    const programKey = useMemo(
        () => String(list || 'program').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        [list]
    );
    const adaptation = getProgramAdaptation(programKey);
    const readiness = adaptation?.readiness || 'normal';
    const reportedFatigue = readiness === 'fatigued' || adaptation?.reportedFatigue === true;
    const adaptationVersion = adaptation?.updatedAt || '';
    const completedDayIndexes = getCompletedDaysForProgram(programKey);

    const heroScale = useRef(new Animated.Value(1.08)).current;
    const heroOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(heroScale, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(heroOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]).start();
    }, []);

    useEffect(() => {
        let isActive = true;

        const buildDays = async () => {
            try {
                setLoading(true);
                setError(null);

                const generated = await generateProgramDaysFromTemplate({
                    programDays,
                    userProfile,
                    categoryLabel: category,
                    listLabel: list,
                    adaptation: {
                        ...(adaptation || {}),
                        adherenceRate: programDays.length
                            ? Math.min(1, completedDayIndexes.length / programDays.length)
                            : 0,
                        reportedFatigue,
                    },
                });

                if (!isActive) return;
                const nextDays = Array.isArray(generated?.days) ? generated.days : [];
                setPersonalizedDays(nextDays.length ? nextDays : programDays);
                setPlanMeta(generated?.meta || null);
                if (generated?.meta?.source !== 'api') {
                    setError('Couldn\'t load live exercises — using local data');
                }
            } catch (err) {
                if (!isActive) return;
                console.error('API Error:', err);
                setError('Couldn\'t load live exercises — using local data');
                setPersonalizedDays(programDays);
                setPlanMeta(null);
            } finally {
                if (isActive) setLoading(false);
            }
        };

        buildDays();
        return () => {
            isActive = false;
        };
    }, [programDays, userProfile, category, list, completedDayIndexes.length, reportedFatigue, adaptationVersion]);

    const handleReadinessChange = (value) => {
        saveProgramAdaptation(programKey, {
            readiness: value,
            reportedFatigue: value === 'fatigued',
        });
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

                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="chevron-left" size={22} color="#fff" />
                </TouchableOpacity>

                <AnimatedRow delay={50}>
                    <View style={styles.heroTextContainer}>
                        <View style={styles.heroBadge}>
                            <MaterialCommunityIcons name="lightning-bolt" size={11} color="#FF4D2E" />
                            <Text style={styles.heroBadgeText}>PROGRAM</Text>
                        </View>
                        <Text style={styles.heroTitle}>{list}</Text>
                        <Text style={styles.heroSubtitle}>{personalizedDays.length || programDays.length} workout days</Text>
                        {planMeta?.progression ? (
                            <Text style={styles.heroCycleText}>
                                WEEK {planMeta.progression.week} · {String(planMeta.progression.phase || '').toUpperCase()}
                            </Text>
                        ) : null}
                    </View>
                </AnimatedRow>
            </View>

            {/* Error banner (non-blocking) */}
            {error && (
                <View style={styles.errorBanner}>
                    <Feather name="alert-circle" size={14} color="#FFB800" />
                    <Text style={styles.errorBannerText}>
                        {error}
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

                <AnimatedRow delay={190}>
                    <View style={styles.readinessCard}>
                        <View style={styles.readinessHeader}>
                            <Feather name="heart" size={12} color="#FF4D2E" />
                            <Text style={styles.readinessTitle}>How are you feeling today?</Text>
                        </View>
                        <View style={styles.readinessOptions}>
                            {READINESS_OPTIONS.map((option) => {
                                const active = readiness === option.value;
                                return (
                                    <TouchableOpacity
                                        key={option.value}
                                        activeOpacity={0.85}
                                        onPress={() => handleReadinessChange(option.value)}
                                        style={[
                                            styles.readinessPill,
                                            active && {
                                                borderColor: option.color,
                                                backgroundColor: option.color + '1F',
                                            },
                                        ]}
                                    >
                                        <Feather
                                            name={option.icon}
                                            size={11}
                                            color={active ? option.color : '#63637A'}
                                        />
                                        <Text
                                            style={[
                                                styles.readinessPillText,
                                                active && { color: option.color },
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        {reportedFatigue ? (
                            <Text style={styles.readinessHint}>
                                Recovery mode active: lighter sets/reps are being applied.
                            </Text>
                        ) : null}
                    </View>
                </AnimatedRow>

                {(personalizedDays.length ? personalizedDays : programDays).map((workoutDay, index) => {
                    const isCompleted = completedDayIndexes.includes(index);
                    const isLocked = index > 0 && !completedDayIndexes.includes(index - 1);
                    const dayExercises = Array.isArray(workoutDay?.exercises) ? workoutDay.exercises : [];

                    return (
                        <WorkoutDayCard
                            key={index}
                            workoutDay={workoutDay}
                            index={index}
                            exercises={dayExercises}
                            isLocked={isLocked}
                            isCompleted={isCompleted}
                            onPress={() => {
                                if (isLocked) {
                                    Alert.alert(
                                        'Day locked',
                                        `Complete Day ${index} first to unlock Day ${index + 1}.`
                                    );
                                    return;
                                }
                                navigation.navigate('Workout', {
                                    exercises: dayExercises,
                                    image,
                                    dayIndex: index,
                                    dayName: workoutDay?.name || `Day ${index + 1}`,
                                    totalDays: personalizedDays.length || programDays.length,
                                    programKey,
                                });
                            }}
                        />
                    );
                })}

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
    heroCycleText: {
        color: '#FF4D2E',
        marginTop: 6,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.1,
    },
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
        marginBottom: 12,
    },
    readinessCard: {
        marginBottom: 14,
        backgroundColor: '#141419',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 12,
        paddingVertical: 11,
        gap: 10,
    },
    readinessHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    readinessTitle: {
        color: '#B5B5C7',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.4,
    },
    readinessOptions: {
        flexDirection: 'row',
        gap: 8,
    },
    readinessPill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        paddingVertical: 9,
        backgroundColor: '#171723',
    },
    readinessPillText: {
        color: '#80809A',
        fontSize: 11,
        fontWeight: '700',
    },
    readinessHint: {
        color: '#FFB800',
        fontSize: 10,
        fontWeight: '600',
        lineHeight: 14,
    },
    dayCard: {
        backgroundColor: '#16161A',
        borderRadius: 20,
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    dayCardLocked: {
        borderColor: 'rgba(138,138,168,0.28)',
        opacity: 0.8,
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
    completedPill: {
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(0,229,190,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(0,229,190,0.32)',
        borderRadius: 14,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    completedPillText: {
        color: '#00E5BE',
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.6,
    },
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
