import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState, useContext, useRef } from 'react';
import {
    Image,
    Text,
    TouchableOpacity,
    View,
    Alert,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { FitnessItems } from '../Context';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import API_BASE_URL from '../constants/api';

const { width, height } = Dimensions.get('window');
const REST_BETWEEN_EXERCISES_SECONDS = 15;

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeCompletedExercises = (list) =>
    Array.isArray(list)
        ? list.filter(
              (exercise) =>
                  exercise &&
                  typeof exercise === 'object' &&
                  String(exercise.name || '').trim()
          )
        : [];

// Animated progress dots
const ProgressDots = ({ total, current }) => (
    <View style={styles.dotsRow}>
        {Array.from({ length: Math.min(total, 10) }).map((_, i) => {
            const isDone = i < current;
            const isActive = i === current;
            return (
                <View
                    key={i}
                    style={[
                        styles.dot,
                        isDone && styles.dotDone,
                        isActive && styles.dotActive,
                    ]}
                />
            );
        })}
        {total > 10 && (
            <Text style={styles.dotsMore}>+{total - 10}</Text>
        )}
    </View>
);

const FitScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { user } = useUser();
    const {
        exercises = [],
        dayIndex,
        dayName,
        totalDays,
        programKey,
        resumeSession,
    } = route.params || {};
    const initialIndex = (() => {
        const savedIndex = Number.isInteger(resumeSession?.currentIndex)
            ? resumeSession.currentIndex
            : 0;
        const maxIndex = Math.max(0, exercises.length - 1);
        return Math.min(Math.max(0, savedIndex), maxIndex);
    })();

    const [index, setIndex] = useState(initialIndex);
    const current = exercises[index];
    const allowExitRef = useRef(false);
    const hydratedResumeRef = useRef(false);

    const {
        completed,
        setCompleted,
        setCalories,
        setMinutes,
        setWorkout,
        markDayCompleted,
        saveInProgressWorkout,
        clearInProgressWorkout,
        startRestTimer,
        stopRestTimer,
    } = useContext(FitnessItems);

    const [timeLeft, setTimeLeft] = useState(() => {
        const initialExercise = exercises[initialIndex];
        if (initialExercise?.type !== 'time') return 0;

        const savedTimeLeft = toNumber(resumeSession?.currentTimeLeft, -1);
        if (savedTimeLeft > 0) return savedTimeLeft;
        return toNumber(initialExercise.duration, 0);
    });

    const gifOpacity = useRef(new Animated.Value(0)).current;
    const gifScale = useRef(new Animated.Value(0.95)).current;
    const infoY = useRef(new Animated.Value(20)).current;
    const infoOpacity = useRef(new Animated.Value(0)).current;
    const btnScale = useRef(new Animated.Value(1)).current;
    const timerPulse = useRef(new Animated.Value(1)).current;

    // Animate in on exercise change
    const animateIn = () => {
        gifOpacity.setValue(0);
        gifScale.setValue(0.95);
        infoY.setValue(20);
        infoOpacity.setValue(0);

        Animated.parallel([
            Animated.timing(gifOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.spring(gifScale, { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }),
            Animated.timing(infoY, { toValue: 0, duration: 400, useNativeDriver: true }),
            Animated.timing(infoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();
    };

    useEffect(() => { animateIn(); }, [index]);

    useEffect(() => {
        if (hydratedResumeRef.current) return;
        hydratedResumeRef.current = true;

        if (!resumeSession) return;
        setCompleted(normalizeCompletedExercises(resumeSession.completedExercises));
    }, [resumeSession, setCompleted]);

    const mapExerciseForStorage = (exercise) => {
        const durationSeconds = exercise?.type === 'time' ? toNumber(exercise.duration, 0) : null;
        const sets = exercise?.type === 'reps' ? toNumber(exercise.sets, 0) : null;
        const caloriesBurned = exercise?.type === 'time'
            ? (durationSeconds / 60) * 8
            : sets * 2.5;

        return {
            name: String(exercise?.name || '').trim(),
            type: exercise?.type || 'reps',
            target: exercise?.target || null,
            durationSeconds,
            sets,
            caloriesBurned,
        };
    };

    const buildWorkoutPayload = (allExercises) => {
        const workoutExercises = (allExercises || [])
            .map(mapExerciseForStorage)
            .filter((exercise) => exercise.name);

        const summary = workoutExercises.reduce(
            (acc, exercise) => {
                acc.totalExercises += 1;
                acc.totalCaloriesBurned += toNumber(exercise.caloriesBurned, 0);
                acc.totalDurationSeconds += toNumber(exercise.durationSeconds, 0);
                return acc;
            },
            { totalExercises: 0, totalCaloriesBurned: 0, totalDurationSeconds: 0 }
        );

        return { workoutExercises, summary };
    };

    const normalizeSessionSummary = (session) => {
        const rawWorkoutData = session?.workoutData;
        let parsedWorkoutData = rawWorkoutData;
        if (typeof rawWorkoutData === 'string') {
            try {
                parsedWorkoutData = JSON.parse(rawWorkoutData);
            } catch {
                parsedWorkoutData = {};
            }
        }

        const rawSummary = parsedWorkoutData?.summary || {};
        return {
            totalExercises: toNumber(session?.totalExercises, toNumber(rawSummary.totalExercises, 0)),
            totalCaloriesBurned: toNumber(session?.totalCaloriesBurned, toNumber(rawSummary.totalCaloriesBurned, 0)),
            totalDurationSeconds: toNumber(session?.totalDurationSeconds, toNumber(rawSummary.totalDurationSeconds, 0)),
        };
    };

    const fetchPreviousBestStats = async () => {
        if (!user?.id) {
            return { totalExercises: 0, totalCaloriesBurned: 0, totalDurationSeconds: 0 };
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/users/workouts`, {
                params: { clerkUserId: user.id },
            });
            const sessions = Array.isArray(response.data) ? response.data : [];

            return sessions.reduce(
                (best, session) => {
                    const summary = normalizeSessionSummary(session);
                    return {
                        totalExercises: Math.max(best.totalExercises, summary.totalExercises),
                        totalCaloriesBurned: Math.max(best.totalCaloriesBurned, summary.totalCaloriesBurned),
                        totalDurationSeconds: Math.max(best.totalDurationSeconds, summary.totalDurationSeconds),
                    };
                },
                { totalExercises: 0, totalCaloriesBurned: 0, totalDurationSeconds: 0 }
            );
        } catch (error) {
            console.error('Failed to read previous workout records:', error);
            return { totalExercises: 0, totalCaloriesBurned: 0, totalDurationSeconds: 0 };
        }
    };

    const buildPersonalRecords = (summary, previousBest) => {
        const broken = [];

        if (summary.totalExercises > previousBest.totalExercises) {
            broken.push('Most exercises completed');
        }

        if (summary.totalDurationSeconds > previousBest.totalDurationSeconds) {
            broken.push('Longest workout duration');
        }

        if (summary.totalCaloriesBurned > previousBest.totalCaloriesBurned) {
            broken.push('Highest calories burned');
        }

        return broken;
    };

    const saveInProgressToBackend = async (payload) => {
        if (!user?.id) return;

        try {
            await axios.post(`${API_BASE_URL}/users/in-progress`, {
                clerkUserId: user.id,
                workout: payload,
            });
        } catch (error) {
            console.error('Failed to save in-progress workout to backend:', error);
        }
    };

    const clearInProgressFromBackend = async () => {
        if (!user?.id) return;

        try {
            await axios.delete(`${API_BASE_URL}/users/in-progress`, {
                data: { clerkUserId: user.id },
            });
        } catch (error) {
            console.error('Failed to clear in-progress workout from backend:', error);
        }
    };

    const saveWorkoutObject = async (allExercises) => {
        const { workoutExercises, summary } = buildWorkoutPayload(allExercises);
        if (!workoutExercises.length) {
            return { workoutExercises: [], summary, personalRecords: [] };
        }

        let personalRecords = [];
        if (user?.id) {
            const previousBest = await fetchPreviousBestStats();
            personalRecords = buildPersonalRecords(summary, previousBest);
        }

        try {
            if (!user?.id) {
                return { workoutExercises, summary, personalRecords };
            }

            await axios.post(`${API_BASE_URL}/users/workouts`, {
                clerkUserId: user.id,
                exercises: workoutExercises,
                summary,
            });
        } catch (error) {
            console.error('Failed to save workout object:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to save workout');
        }

        return { workoutExercises, summary, personalRecords };
    };

    const finishWorkout = async (allExercises) => {
        const doneExercises = Array.isArray(allExercises) ? allExercises : [...completed, current];
        const result = await saveWorkoutObject(doneExercises);

        if (programKey && Number.isInteger(dayIndex)) {
            markDayCompleted(programKey, dayIndex);
        }

        clearInProgressWorkout();
        await clearInProgressFromBackend();
        stopRestTimer();
        allowExitRef.current = true;
        navigation.replace('Celebration', {
            summary: result.summary,
            personalRecords: result.personalRecords,
            dayName: dayName || null,
            dayNumber: Number.isInteger(dayIndex) ? dayIndex + 1 : null,
            totalDays: Number.isInteger(totalDays) ? totalDays : exercises.length,
        });
    };

    const handleNext = () => {
        if (index + 1 < exercises.length) {
            startRestTimer(REST_BETWEEN_EXERCISES_SECONDS, true);
            navigation.navigate('Rest', { duration: REST_BETWEEN_EXERCISES_SECONDS });
            setTimeout(() => {
                setIndex(index + 1);
                const next = exercises[index + 1];
                if (next?.type === 'time') setTimeLeft(next.duration);
            }, 2000);
        } else {
            const allExercises = [...completed, current];
            finishWorkout(allExercises);
        }
    };

    const handlePrevious = () => {
        if (index === 0) return;
        startRestTimer(REST_BETWEEN_EXERCISES_SECONDS, true);
        navigation.navigate('Rest', { duration: REST_BETWEEN_EXERCISES_SECONDS });
        setTimeout(() => setIndex(index - 1), 2000);
    };

    const handleSkip = async () => {
        if (index + 1 >= exercises.length) {
            clearInProgressWorkout();
            await clearInProgressFromBackend();
            stopRestTimer();
            allowExitRef.current = true;
            navigation.navigate('App');
            return;
        }
        startRestTimer(REST_BETWEEN_EXERCISES_SECONDS, true);
        navigation.navigate('Rest', { duration: REST_BETWEEN_EXERCISES_SECONDS });
        setTimeout(() => {
            setIndex(index + 1);
            const next = exercises[index + 1];
            if (next?.type === 'time') setTimeLeft(next.duration);
        }, 2000);
    };

    const openQuitPrompt = (onQuitConfirmed) => {
        const buildInProgressPayload = () => ({
            clerkUserId: user?.id || null,
            programKey: String(programKey || '').trim(),
            dayIndex: Number.isInteger(dayIndex) ? dayIndex : null,
            dayName: dayName || null,
            totalDays: Number.isInteger(totalDays) ? totalDays : exercises.length,
            exercises,
            completedExercises: normalizeCompletedExercises(completed),
            currentIndex: index,
            currentTimeLeft: current?.type === 'time' ? toNumber(timeLeft, 0) : null,
            savedAt: new Date().toISOString(),
        });

        Alert.alert('Pause workout?', 'Why do you want to leave this workout?', [
            {
                text: 'Away for a while',
                onPress: async () => {
                    const payload = buildInProgressPayload();
                    saveInProgressWorkout(payload);
                    await saveInProgressToBackend(payload);
                    stopRestTimer();
                    allowExitRef.current = true;
                    navigation.navigate('App');
                },
            },
            {
                text: 'Quit',
                style: 'destructive',
                onPress: async () => {
                    clearInProgressWorkout();
                    await clearInProgressFromBackend();
                    stopRestTimer();
                    setCompleted([]);
                    allowExitRef.current = true;
                    if (typeof onQuitConfirmed === 'function') {
                        onQuitConfirmed();
                        return;
                    }
                    navigation.navigate('App');
                },
            },
            {
                text: 'Resume',
                style: 'cancel',
            },
        ]);
    };

    // Intercept back gestures/buttons and ask why the user wants to quit.
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (event) => {
            if (allowExitRef.current) return;
            event.preventDefault();
            openQuitPrompt(() => navigation.dispatch(event.data.action));
        });

        return unsubscribe;
    }, [navigation, index, exercises.length]);

    // Timer logic
    useEffect(() => {
        if (current?.type !== 'time') return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);

                    const allExercises = [...completed, current];
                    setCompleted(allExercises);
                    setWorkout((w) => w + 1);
                    setMinutes((m) => m + 2.5);
                    setCalories((c) => c + 6.3);

                    if (index + 1 < exercises.length) {
                        handleNext();
                    } else {
                        finishWorkout(allExercises);
                    }

                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, index, current]);

    // Pulse timer when low
    useEffect(() => {
        if (current?.type !== 'time') return;
        if (timeLeft <= 5 && timeLeft > 0) {
            Animated.sequence([
                Animated.timing(timerPulse, { toValue: 1.15, duration: 200, useNativeDriver: true }),
                Animated.timing(timerPulse, { toValue: 1, duration: 200, useNativeDriver: true }),
            ]).start();
        }
    }, [timeLeft]);

    const isLast = index + 1 >= exercises.length;
    const isTimeBased = current?.type === 'time';
    const timerColor = timeLeft <= 5 ? '#FF4D2E' : '#00E5BE';

    const onDonePress = () => {
        const allExercises = [...completed, current];
        setCompleted(allExercises);
        setWorkout((w) => w + 1);
        setMinutes((m) => m + 2.5);
        setCalories((c) => c + 6.3);

        if (isLast) finishWorkout(allExercises);
        else handleNext();
    };

    const handleBtnPressIn = () =>
        Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true, tension: 300 }).start();
    const handleBtnPressOut = () =>
        Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, tension: 300 }).start();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* GIF */}
            <Animated.View
                style={[
                    styles.gifWrapper,
                    { opacity: gifOpacity, transform: [{ scale: gifScale }] },
                ]}
            >
                <Image
                    source={{ uri: current?.gifUrl }}
                    style={styles.gif}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['rgba(0,0,0,0.4)', 'transparent']}
                    style={StyleSheet.absoluteFillObject}
                />
                <LinearGradient
                    colors={['transparent', '#0D0D0F']}
                    style={styles.gifFade}
                />

                {/* Exercise count badge */}
                <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>
                        {index + 1} / {exercises.length}
                    </Text>
                </View>

                <TouchableOpacity onPress={() => openQuitPrompt()} style={styles.quitBtn} activeOpacity={0.85}>
                    <Feather name="x" size={17} color="#fff" />
                    <Text style={styles.quitBtnText}>Quit</Text>
                </TouchableOpacity>
            </Animated.View>

            <SafeAreaView style={styles.safeArea} edges={['bottom']}>
                <Animated.View
                    style={[
                        styles.infoSection,
                        { opacity: infoOpacity, transform: [{ translateY: infoY }] },
                    ]}
                >
                    {/* Progress dots */}
                    <ProgressDots total={exercises.length} current={index} />

                    {/* Exercise name */}
                    <Text style={styles.exerciseName} numberOfLines={2}>
                        {current?.name}
                    </Text>

                    {/* Target muscle */}
                    {current?.target && (
                        <Text style={styles.targetMuscle}>
                            {current.target.toUpperCase()}
                        </Text>
                    )}

                    {/* Timer / Reps display */}
                    <View style={styles.metricContainer}>
                        {isTimeBased ? (
                            <Animated.View
                                style={[styles.timerDisplay, { transform: [{ scale: timerPulse }] }]}
                            >
                                <Text style={[styles.timerValue, { color: timerColor }]}>
                                    {timeLeft}
                                </Text>
                                <Text style={[styles.timerUnit, { color: timerColor + '80' }]}>
                                    SEC
                                </Text>
                            </Animated.View>
                        ) : (
                            <View style={styles.repsDisplay}>
                                <Text style={styles.repsValue}>×{current?.sets}</Text>
                                <Text style={styles.repsUnit}>REPS</Text>
                            </View>
                        )}
                    </View>

                    {/* DONE button */}
                    <TouchableOpacity
                        onPress={onDonePress}
                        onPressIn={handleBtnPressIn}
                        onPressOut={handleBtnPressOut}
                        activeOpacity={1}
                        style={{ width: '100%', marginBottom: 14 }}
                    >
                        <Animated.View style={[styles.doneBtn, { transform: [{ scale: btnScale }] }]}>
                            <LinearGradient
                                colors={isLast ? ['#00E5BE', '#00B89C'] : ['#FF4D2E', '#FF2800']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.doneBtnGradient}
                            >
                                <MaterialCommunityIcons
                                    name={isLast ? 'flag-checkered' : 'check-bold'}
                                    size={22}
                                    color="#fff"
                                />
                                <Text style={styles.doneBtnText}>
                                    {isLast ? 'FINISH WORKOUT' : 'DONE'}
                                </Text>
                            </LinearGradient>
                        </Animated.View>
                    </TouchableOpacity>

                    {/* Prev / Skip row */}
                    <View style={styles.navRow}>
                        <TouchableOpacity
                            onPress={handlePrevious}
                            disabled={index === 0}
                            style={[styles.navBtn, index === 0 && { opacity: 0.3 }]}
                        >
                            <Feather name="skip-back" size={16} color="#666" />
                            <Text style={styles.navBtnText}>PREV</Text>
                        </TouchableOpacity>

                        <View style={styles.navDivider} />

                        <TouchableOpacity onPress={handleSkip} style={styles.navBtn}>
                            <Text style={styles.navBtnText}>SKIP</Text>
                            <Feather name="skip-forward" size={16} color="#666" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
};

export default FitScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0F',
    },

    // GIF
    gifWrapper: {
        height: height * 0.45,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#111',
    },
    gif: {
        width: '100%',
        height: '100%',
    },
    gifFade: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
    },
    countBadge: {
        position: 'absolute',
        top: 52,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.55)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    countBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    quitBtn: {
        position: 'absolute',
        top: 52,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
    },
    quitBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },

    safeArea: {
        flex: 1,
    },
    infoSection: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 10,
        alignItems: 'center',
    },

    // Progress dots
    dotsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 16,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#222',
    },
    dotDone: {
        backgroundColor: '#FF4D2E',
    },
    dotActive: {
        width: 18,
        backgroundColor: '#FF4D2E',
        opacity: 0.6,
    },
    dotsMore: {
        color: '#444',
        fontSize: 10,
        fontWeight: '700',
        marginLeft: 2,
    },

    // Exercise info
    exerciseName: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: -0.5,
        textAlign: 'center',
        textTransform: 'capitalize',
        marginBottom: 4,
    },
    targetMuscle: {
        color: '#444',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 16,
    },

    // Metric
    metricContainer: {
        marginBottom: 22,
        alignItems: 'center',
    },
    timerDisplay: {
        alignItems: 'center',
    },
    timerValue: {
        fontSize: 80,
        fontWeight: '900',
        letterSpacing: -4,
        lineHeight: 84,
    },
    timerUnit: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 2,
        marginTop: -4,
    },
    repsDisplay: {
        alignItems: 'center',
    },
    repsValue: {
        color: '#fff',
        fontSize: 80,
        fontWeight: '900',
        letterSpacing: -4,
        lineHeight: 84,
    },
    repsUnit: {
        color: '#444',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 2,
        marginTop: -4,
    },

    // Done button
    doneBtn: {
        borderRadius: 18,
        overflow: 'hidden',
        width: '100%',
    },
    doneBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 18,
    },
    doneBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
    },

    // Nav row
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#16161A',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
    },
    navBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
    },
    navBtnText: {
        color: '#555',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    navDivider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.07)',
    },
});
