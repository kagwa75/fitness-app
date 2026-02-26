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

const { width, height } = Dimensions.get('window');

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
    const { exercises } = route.params;
    const [index, setIndex] = useState(0);
    const current = exercises[index];

    const {
        completed,
        setCompleted,
        setCalories,
        setMinutes,
        setWorkout,
    } = useContext(FitnessItems);

    const [timeLeft, setTimeLeft] = useState(
        current?.type === 'time' ? current.duration : 0
    );

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

    // Timer logic
    useEffect(() => {
        if (current?.type !== 'time') return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleNext();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, index]);

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

    const handleNext = () => {
        if (index + 1 < exercises.length) {
            navigation.navigate('Rest');
            setTimeout(() => {
                setCompleted((prev) => [...prev, current]);
                setWorkout((w) => w + 1);
                setMinutes((m) => m + 2.5);
                setCalories((c) => c + 6.3);
                setIndex(index + 1);
                const next = exercises[index + 1];
                if (next?.type === 'time') setTimeLeft(next.duration);
            }, 2000);
        } else {
            finishWorkout();
        }
    };

    const saveWorkout = async (exercise) => {
        if (!user) return;
        try {
            await axios.post('http://192.168.64.194:3000/users/workouts', {
                clerkUserId: user.id,
                exerciseName: exercise.name,
                duration: exercise.type === 'time' ? exercise.duration : null,
                sets: exercise.type === 'reps' ? exercise.sets : null,
                caloriesBurned:
                    exercise.type === 'time'
                        ? (exercise.duration / 60) * 8
                        : exercise.sets * 2.5,
            });
        } catch (error) {
            console.error('Failed to save workout:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to save workout');
        }
    };

    const finishWorkout = async () => {
        const allExercises = [...completed, current];
        await Promise.all(allExercises.map(saveWorkout));
        navigation.navigate('App');
    };

    const handlePrevious = () => {
        if (index === 0) return;
        navigation.navigate('Rest');
        setTimeout(() => setIndex(index - 1), 2000);
    };

    const handleSkip = () => {
        if (index + 1 >= exercises.length) {
            navigation.navigate('App');
            return;
        }
        navigation.navigate('Rest');
        setTimeout(() => {
            setIndex(index + 1);
            const next = exercises[index + 1];
            if (next?.type === 'time') setTimeLeft(next.duration);
        }, 2000);
    };

    const isLast = index + 1 >= exercises.length;
    const isTimeBased = current?.type === 'time';
    const timerColor = timeLeft <= 5 ? '#FF4D2E' : '#00E5BE';

    const onDonePress = () => {
        setCompleted((prev) => [...prev, current]);
        if (isLast) finishWorkout();
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