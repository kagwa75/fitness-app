/**
 * screens/PersonalizedPlanScreen.js
 *
 * Displays the AI-free, rule-based personalized workout plan
 * generated from the user's onboarding profile.
 *
 * Navigation: place a tab or a card on the Home screen that routes here.
 */

import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FitnessItems } from '../Context';
import { generateWorkoutPlan, buildWeeklySchedule } from '../utils/Workoutgenerator';

const { width } = Dimensions.get('window');

// ─── Constants ────────────────────────────────────────────────────────────────

const GOAL_CONFIG = {
    lose_weight:      { label: 'Fat Burn',   color: '#FF4D2E', icon: 'fire'         },
    build_muscle:     { label: 'Muscle',     color: '#00E5BE', icon: 'arm-flex'     },
    gain_weight:      { label: 'Mass',       color: '#FFB800', icon: 'scale-bathroom'},
    maintain_fitness: { label: 'Maintain',   color: '#6C63FF', icon: 'heart-pulse'  },
};

const LEVEL_CONFIG = {
    beginner:     { label: 'Beginner',     color: '#00E5BE' },
    intermediate: { label: 'Intermediate', color: '#FFB800' },
    advanced:     { label: 'Advanced',     color: '#FF4D2E' },
};

const DAY_ACCENT = ['#FF4D2E', '#00E5BE', '#6C63FF', '#FFB800', '#FF4D8C', '#00C2FF', '#8B5CF6'];
const READINESS_OPTIONS = [
    { value: 'fresh', label: 'Fresh', icon: 'trending-up', color: '#00E5BE' },
    { value: 'normal', label: 'Normal', icon: 'activity', color: '#00C2FF' },
    { value: 'fatigued', label: 'Fatigued', icon: 'battery-charging', color: '#FFB800' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatChip = ({ icon, label, value, color }) => (
    <View style={styles.chip}>
        <View style={[styles.chipIcon, { backgroundColor: color + '22' }]}>
            <MaterialCommunityIcons name={icon} size={14} color={color} />
        </View>
        <View>
            <Text style={styles.chipValue}>{value}</Text>
            <Text style={styles.chipLabel}>{label}</Text>
        </View>
    </View>
);

const WeekDot = ({ item, accent }) => (
    <View style={styles.weekDotWrap}>
        <View style={[
            styles.weekDot,
            item.isRest
                ? styles.weekDotRest
                : { backgroundColor: accent, shadowColor: accent, shadowOpacity: 0.6, shadowRadius: 6, elevation: 4 }
        ]}>
            {!item.isRest && <Feather name="zap" size={10} color="#fff" />}
        </View>
        <Text style={[styles.weekDotLabel, !item.isRest && { color: '#fff' }]}>{item.day}</Text>
    </View>
);

const ExerciseRow = ({ exercise, index, accent }) => (
    <View style={styles.exerciseRow}>
        <View style={[styles.exerciseNum, { backgroundColor: accent + '22' }]}>
            <Text style={[styles.exerciseNumText, { color: accent }]}>{index + 1}</Text>
        </View>
        <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.exerciseMeta}>
                {exercise.sets} sets
                {exercise.duration
                    ? ` · ${exercise.duration}s`
                    : exercise.reps
                    ? ` · ${exercise.reps} reps`
                    : ''}
                {exercise.rest ? ` · ${exercise.rest}s rest` : ''}
            </Text>
        </View>
        {exercise.image ? (
            <Image source={{ uri: exercise.image }} style={styles.exerciseThumb} resizeMode="cover" />
        ) : null}
    </View>
);

const DayCard = ({ day, index, onPress }) => {
    const accent = DAY_ACCENT[index % DAY_ACCENT.length];
    const slideAnim = useRef(new Animated.Value(40)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.delay(index * 80),
            Animated.parallel([
                Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
                Animated.timing(opacityAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
            ]),
        ]).start();
    }, []);

    return (
        <Animated.View style={{ opacity: opacityAnim, transform: [{ translateY: slideAnim }] }}>
            <TouchableOpacity
                style={styles.dayCard}
                activeOpacity={0.88}
                onPress={() => onPress(day, accent)}
            >
                {/* Left accent strip */}
                <View style={[styles.dayStrip, { backgroundColor: accent }]} />

                <View style={styles.dayContent}>
                    <View style={styles.dayHeader}>
                        <Text style={styles.dayTitle}>{day.name}</Text>
                        <View style={[styles.focusBadge, { backgroundColor: accent + '22', borderColor: accent + '44' }]}>
                            <Text style={[styles.focusBadgeText, { color: accent }]}>
                                {day.focus?.replace(/_/g, ' ').toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.dayMeta}>
                        {day.exercises?.length ?? 0} exercises · {day.sets} sets each
                    </Text>

                    {/* First 3 exercise names preview */}
                    <View style={styles.exercisePreview}>
                        {(day.exercises || []).slice(0, 3).map((ex, i) => (
                            <View key={ex.id ?? i} style={styles.previewPill}>
                                <Text style={styles.previewPillText} numberOfLines={1}>{ex.name}</Text>
                            </View>
                        ))}
                        {(day.exercises?.length ?? 0) > 3 && (
                            <View style={[styles.previewPill, { backgroundColor: accent + '22' }]}>
                                <Text style={[styles.previewPillText, { color: accent }]}>
                                    +{day.exercises.length - 3}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={[styles.dayChevron, { backgroundColor: accent + '18' }]}>
                    <Feather name="chevron-right" size={16} color={accent} />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function PersonalizedPlanScreen() {
    const navigation = useNavigation();
    const {
        userProfile,
        getCompletedDaysForProgram,
        getProgramAdaptation,
        saveProgramAdaptation,
    } = useContext(FitnessItems);
    const [plan, setPlan] = useState(null);
    const [isLoadingPlan, setIsLoadingPlan] = useState(true);
    const personalizedCompletedDays = getCompletedDaysForProgram('personalized');
    const adherenceRate = Math.min(1, personalizedCompletedDays.length / 4);
    const adaptation = getProgramAdaptation('personalized');
    const readiness = adaptation?.readiness || 'normal';
    const reportedFatigue = readiness === 'fatigued' || adaptation?.reportedFatigue === true;
    const adaptationVersion = adaptation?.updatedAt || '';

    const schedule = useMemo(() => buildWeeklySchedule(plan), [plan]);

    useEffect(() => {
        let isActive = true;

        const loadPlan = async () => {
            setIsLoadingPlan(true);
            try {
                const generated = await generateWorkoutPlan(userProfile, {
                    ...(adaptation || {}),
                    adherenceRate,
                    reportedFatigue,
                });
                if (isActive) setPlan(generated);
            } catch (error) {
                console.error('Failed to generate personalized plan:', error);
                if (isActive) setPlan(null);
            } finally {
                if (isActive) setIsLoadingPlan(false);
            }
        };

        loadPlan();
        return () => {
            isActive = false;
        };
    }, [userProfile, adherenceRate, reportedFatigue, adaptationVersion]);

    const handleReadinessChange = (value) => {
        saveProgramAdaptation('personalized', {
            readiness: value,
            reportedFatigue: value === 'fatigued',
        });
    };

    // Entrance animations
    const headerOp = useRef(new Animated.Value(0)).current;
    const headerY  = useRef(new Animated.Value(-20)).current;
    const bodyOp   = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(headerOp, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.spring(headerY,  { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
            ]),
            Animated.timing(bodyOp, { toValue: 1, duration: 350, useNativeDriver: true }),
        ]).start();
    }, []);

    if (isLoadingPlan) {
        return (
            <View style={styles.emptyWrap}>
                <LinearGradient colors={['#0D0D0F', '#17171F']} style={StyleSheet.absoluteFillObject} />
                <MaterialCommunityIcons name="timer-sand" size={44} color="#444" />
                <Text style={styles.emptyTitle}>Building your plan...</Text>
                <Text style={styles.emptyBody}>Fetching exercises that match your profile.</Text>
            </View>
        );
    }

    if (!plan) {
        return (
            <View style={styles.emptyWrap}>
                <LinearGradient colors={['#0D0D0F', '#17171F']} style={StyleSheet.absoluteFillObject} />
                <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#444" />
                <Text style={styles.emptyTitle}>No plan yet</Text>
                <Text style={styles.emptyBody}>Complete your profile to unlock your personalized plan.</Text>
                <TouchableOpacity
                    style={styles.emptyBtn}
                    onPress={() => navigation.navigate('Onboarding')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.emptyBtnText}>Set Up Profile</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const goalCfg  = GOAL_CONFIG[userProfile?.goal]         ?? GOAL_CONFIG.maintain_fitness;
    const levelCfg = LEVEL_CONFIG[userProfile?.fitnessLevel] ?? LEVEL_CONFIG.beginner;

    const handleDayPress = (day) => {
        // Navigate to the existing WorkoutScreen with exercises from the generated day
        navigation.navigate('Workout', {
            exercises: day.exercises,
            dayName:   day.name,
            dayIndex:  parseInt(day.id?.split('_')[1] ?? '1') - 1,
            programKey: 'personalized',
            totalDays:  plan.days.length,
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#0D0D0F', '#111118', '#17171F']}
                style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.glowOrb} pointerEvents="none" />

            <SafeAreaView style={styles.safe}>

                {/* ── Top bar ── */}
                <Animated.View style={[styles.topBar, { opacity: headerOp, transform: [{ translateY: headerY }] }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
                        <Feather name="arrow-left" size={18} color="#A5A5BE" />
                    </TouchableOpacity>
                    <Text style={styles.screenTitle}>My Plan</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Onboarding')}
                        style={styles.editBtn}
                        activeOpacity={0.8}
                    >
                        <Feather name="edit-2" size={13} color="#00E5BE" />
                        <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                </Animated.View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scroll}
                >

                    {/* ── Hero banner ── */}
                    <Animated.View style={[styles.heroBanner, { opacity: bodyOp }]}>
                        <Image
                            source={{ uri: plan.image }}
                            style={StyleSheet.absoluteFillObject}
                            resizeMode="cover"
                        />
                        <LinearGradient
                            colors={['rgba(13,13,15,0.2)', 'rgba(13,13,15,0.85)']}
                            style={StyleSheet.absoluteFillObject}
                        />
                        <View style={styles.heroBadge}>
                            <MaterialCommunityIcons name="lightning-bolt" size={12} color="#FF4D2E" />
                            <Text style={styles.heroBadgeText}>PERSONALIZED FOR YOU</Text>
                        </View>
                        <Text style={styles.heroPlanName}>{plan.name}</Text>
                        <Text style={styles.heroDesc} numberOfLines={2}>{plan.description}</Text>
                        {plan?.progression ? (
                            <Text style={styles.heroCycleText}>
                                Cycle week {plan.progression.week} · {String(plan.progression.phase || '').toUpperCase()}
                            </Text>
                        ) : null}
                    </Animated.View>

                    {/* ── Stats row ── */}
                    <Animated.View style={[styles.statsRow, { opacity: bodyOp }]}>
                        <StatChip
                            icon={goalCfg.icon}
                            label="Goal"
                            value={goalCfg.label}
                            color={goalCfg.color}
                        />
                        <StatChip
                            icon="lightning-bolt"
                            label="Level"
                            value={levelCfg.label}
                            color={levelCfg.color}
                        />
                        <StatChip
                            icon="calendar-week"
                            label="Frequency"
                            value={plan.daysPerWeek}
                            color="#00C2FF"
                        />
                    </Animated.View>

                    <Animated.View style={[styles.section, { opacity: bodyOp }]}>
                        <Text style={styles.sectionLabel}>READINESS CHECK-IN</Text>
                        <View style={styles.readinessCard}>
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
                                                size={12}
                                                color={active ? option.color : '#6E6E84'}
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
                                    Recovery mode active: weekly volume is reduced to protect consistency.
                                </Text>
                            ) : null}
                        </View>
                    </Animated.View>

                    {/* ── Weekly schedule ── */}
                    <Animated.View style={[styles.section, { opacity: bodyOp }]}>
                        <Text style={styles.sectionLabel}>WEEKLY SCHEDULE</Text>
                        <View style={styles.weekRow}>
                            {schedule.map((item, i) => (
                                <WeekDot
                                    key={item.day}
                                    item={item}
                                    accent={DAY_ACCENT[i % DAY_ACCENT.length]}
                                />
                            ))}
                        </View>
                    </Animated.View>

                    {/* ── Training days ── */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>TRAINING DAYS</Text>
                        {plan.days.map((day, index) => (
                            <DayCard
                                key={day.id}
                                day={day}
                                index={index}
                                onPress={handleDayPress}
                            />
                        ))}
                    </View>

                    {/* ── Disclaimer ── */}
                    <View style={styles.disclaimer}>
                        <Feather name="info" size={12} color="#555" />
                        <Text style={styles.disclaimerText}>
                            Plan updates monthly based on your profile. Edit your profile anytime to refresh it.
                        </Text>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0D0D0F' },
    safe:      { flex: 1 },
    glowOrb: {
        position:  'absolute',
        top:       -120,
        right:     -100,
        width:     320,
        height:    320,
        borderRadius: 160,
        backgroundColor: '#FF4D2E',
        opacity:   0.04,
    },

    // Top bar
    topBar: {
        flexDirection:  'row',
        alignItems:     'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical:   14,
    },
    backBtn: {
        width: 36, height: 36,
        borderRadius: 12,
        backgroundColor: '#1A1A22',
        alignItems: 'center',
        justifyContent: 'center',
    },
    screenTitle: {
        color:      '#FFFFFF',
        fontSize:   17,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    editBtn: {
        flexDirection:  'row',
        alignItems:     'center',
        gap:            5,
        paddingHorizontal: 12,
        paddingVertical:    7,
        borderRadius:    10,
        backgroundColor: '#00E5BE18',
        borderWidth:     1,
        borderColor:    '#00E5BE33',
    },
    editBtnText: {
        color:      '#00E5BE',
        fontSize:   12,
        fontWeight: '700',
    },

    scroll: { paddingBottom: 40 },

    // Hero banner
    heroBanner: {
        height:           200,
        marginHorizontal: 16,
        marginBottom:     20,
        borderRadius:     20,
        overflow:         'hidden',
        justifyContent:   'flex-end',
        padding:          18,
    },
    heroBadge: {
        flexDirection:  'row',
        alignItems:     'center',
        gap:            5,
        marginBottom:   8,
    },
    heroBadgeText: {
        color:      '#FF4D2E',
        fontSize:   10,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    heroPlanName: {
        color:      '#FFFFFF',
        fontSize:   24,
        fontWeight: '900',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    heroDesc: {
        color:    '#FFFFFFAA',
        fontSize: 12,
        lineHeight: 18,
    },
    heroCycleText: {
        marginTop: 6,
        color: '#FF4D2E',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.1,
    },

    // Stats row
    statsRow: {
        flexDirection:    'row',
        justifyContent:   'space-between',
        marginHorizontal: 16,
        marginBottom:     24,
        gap:              10,
    },
    chip: {
        flex:           1,
        backgroundColor: '#1A1A24',
        borderRadius:   14,
        padding:        12,
        alignItems:     'center',
        gap:            8,
    },
    chipIcon: {
        width:        32,
        height:       32,
        borderRadius: 10,
        alignItems:   'center',
        justifyContent: 'center',
    },
    chipValue: {
        color:      '#FFFFFF',
        fontSize:   12,
        fontWeight: '800',
        textAlign:  'center',
    },
    chipLabel: {
        color:    '#666',
        fontSize:  9,
        fontWeight: '700',
        letterSpacing: 0.8,
        textAlign: 'center',
        marginTop: 2,
    },
    readinessCard: {
        backgroundColor: '#141419',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        padding: 12,
        gap: 10,
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
        backgroundColor: '#171723',
        paddingVertical: 10,
    },
    readinessPillText: {
        color: '#8A8AA1',
        fontSize: 11,
        fontWeight: '700',
    },
    readinessHint: {
        color: '#FFB800',
        fontSize: 10,
        fontWeight: '600',
        lineHeight: 14,
    },

    // Section
    section: { marginBottom: 28, paddingHorizontal: 16 },
    sectionLabel: {
        color:      '#555',
        fontSize:   10,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 14,
    },

    // Week schedule
    weekRow: {
        flexDirection:  'row',
        justifyContent: 'space-between',
        backgroundColor: '#141419',
        borderRadius:   16,
        padding:        16,
    },
    weekDotWrap: { alignItems: 'center', gap: 6 },
    weekDot: {
        width:        28,
        height:       28,
        borderRadius: 9,
        alignItems:   'center',
        justifyContent: 'center',
    },
    weekDotRest: { backgroundColor: '#1E1E26' },
    weekDotLabel: {
        color:      '#555',
        fontSize:    9,
        fontWeight: '700',
    },

    // Day card
    dayCard: {
        flexDirection:    'row',
        alignItems:       'center',
        backgroundColor:  '#141419',
        borderRadius:     18,
        marginBottom:     12,
        overflow:         'hidden',
    },
    dayStrip: { width: 4, alignSelf: 'stretch', borderRadius: 4 },
    dayContent: { flex: 1, padding: 14 },
    dayHeader: {
        flexDirection:  'row',
        alignItems:     'center',
        justifyContent: 'space-between',
        marginBottom:   4,
    },
    dayTitle: {
        color:      '#FFFFFF',
        fontSize:   14,
        fontWeight: '800',
        flex:       1,
        marginRight: 8,
    },
    focusBadge: {
        paddingHorizontal: 8,
        paddingVertical:   3,
        borderRadius:      8,
        borderWidth:       1,
    },
    focusBadgeText: {
        fontSize:   8,
        fontWeight: '800',
        letterSpacing: 1,
    },
    dayMeta: {
        color:      '#666',
        fontSize:   11,
        marginBottom: 10,
    },
    exercisePreview: {
        flexDirection: 'row',
        flexWrap:      'wrap',
        gap:            6,
    },
    previewPill: {
        backgroundColor: '#1E1E28',
        borderRadius:    8,
        paddingHorizontal: 8,
        paddingVertical:   3,
    },
    previewPillText: {
        color:      '#AAAACC',
        fontSize:    10,
        fontWeight: '600',
    },
    dayChevron: {
        width:        34,
        height:       34,
        borderRadius: 11,
        alignItems:   'center',
        justifyContent: 'center',
        marginRight:  14,
    },

    // Empty state
    emptyWrap: {
        flex:           1,
        alignItems:     'center',
        justifyContent: 'center',
        padding:        32,
        gap:            12,
    },
    emptyTitle: {
        color:      '#FFFFFF',
        fontSize:   22,
        fontWeight: '800',
    },
    emptyBody: {
        color:     '#666',
        fontSize:   14,
        textAlign: 'center',
        lineHeight: 20,
    },
    emptyBtn: {
        marginTop:        16,
        backgroundColor:  '#FF4D2E',
        borderRadius:     14,
        paddingHorizontal: 28,
        paddingVertical:   13,
    },
    emptyBtnText: {
        color:      '#fff',
        fontSize:   15,
        fontWeight: '800',
    },

    // Disclaimer
    disclaimer: {
        flexDirection:    'row',
        alignItems:       'flex-start',
        gap:              8,
        marginHorizontal: 20,
        marginTop:        4,
    },
    disclaimerText: {
        color:    '#444',
        fontSize:  11,
        lineHeight: 16,
        flex:       1,
    },
});
