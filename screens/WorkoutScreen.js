import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import {
    Alert,
    Image,
    ScrollView,
    TouchableOpacity,
    View,
    Text,
    StyleSheet,
    Dimensions,
    Animated,
    StatusBar,
} from 'react-native';
import { Feather, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import { useContext, useRef, useEffect, useMemo, useCallback } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { FitnessItems } from '../Context';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { isMatchingSession } from '../utils/sessionMatch';
import { clearInProgressFromBackend } from '../utils/inProgressApi';
import API_BASE_URL from '../constants/api';
import { getAppHeaders, withAppParams } from '../constants/app';

const { width, height } = Dimensions.get('window');

const ACCENTS = ['#FF4D2E', '#00E5BE', '#6C63FF', '#FFB800', '#FF4D8C', '#00C2FF'];

const getExerciseName = (value) =>
    typeof value === 'string' ? value.trim() : String(value?.name || '').trim();

const toTimestamp = (value) => {
    const timestamp = new Date(value || 0).getTime();
    return Number.isFinite(timestamp) ? timestamp : 0;
};

const formatElapsed = (totalSeconds) => {
    const safeSeconds = Number.isFinite(totalSeconds) ? Math.max(0, Math.round(totalSeconds)) : 0;
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const ExerciseRow = ({ item, index, isCompleted }) => {
    const slideAnim = useRef(new Animated.Value(30)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const accent = ACCENTS[index % ACCENTS.length];

    useEffect(() => {
        Animated.sequence([
            Animated.delay(index * 70),
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 80,
                    friction: 10,
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

    const label = item.duration
        ? `${item.duration}s`
        : item.sets
        ? `${item.sets} reps`
        : '—';

    return (
        <Animated.View style={{ opacity: opacityAnim, transform: [{ translateX: slideAnim }] }}>
            <View style={styles.exerciseRow}>
                {/* Accent strip */}
                <View style={[styles.rowAccent, { backgroundColor: accent }]} />

                {/* GIF thumbnail */}
                <View style={styles.gifContainer}>
                    <Image
                        source={{ uri: item.gifUrl }}
                        style={styles.gifImage}
                        resizeMode="cover"
                    />
                </View>

                {/* Info */}
                <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName} numberOfLines={2}>
                        {item.name}
                    </Text>
                    <View style={styles.exerciseMeta}>
                        <View style={[styles.metaBadge, { backgroundColor: accent + '18', borderColor: accent + '40' }]}>
                            <Feather
                                name={item.duration ? 'clock' : 'refresh-cw'}
                                size={10}
                                color={accent}
                            />
                            <Text style={[styles.metaBadgeText, { color: accent }]}>{label}</Text>
                        </View>
                        {item.target && (
                            <Text style={styles.targetText}>{item.target.toUpperCase()}</Text>
                        )}
                    </View>
                </View>

                {/* Completion indicator */}
                <View style={styles.completionIcon}>
                    {isCompleted ? (
                        <View style={styles.completedBadge}>
                            <AntDesign name="check" size={14} color="#fff" />
                        </View>
                    ) : (
                        <View style={styles.pendingBadge}>
                            <Text style={styles.pendingIndex}>{index + 1}</Text>
                        </View>
                    )}
                </View>
            </View>
        </Animated.View>
    );
};

const WorkoutScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { user, isLoaded: isUserLoaded } = useUser();
    const {
        completed,
        inProgressWorkout,
        saveInProgressWorkout,
    } = useContext(FitnessItems);
    const { exercises, image } = route.params;

    const heroScale = useRef(new Animated.Value(1.06)).current;
    const heroOpacity = useRef(new Animated.Value(0)).current;
    const btnScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(heroScale, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.timing(heroOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    const handlePressIn = () =>
        Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true, tension: 300 }).start();
    const handlePressOut = () =>
        Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, tension: 300 }).start();

    const completedNameSet = useMemo(
        () => new Set((completed || []).map(getExerciseName).filter(Boolean)),
        [completed]
    );

    const fitParams = useMemo(
        () => ({
            exercises: route.params.exercises,
            dayIndex: route.params.dayIndex,
            dayName: route.params.dayName,
            totalDays: route.params.totalDays,
            programKey: route.params.programKey,
            programMode: route.params.programMode,
        }),
        [
            route.params.exercises,
            route.params.dayIndex,
            route.params.dayName,
            route.params.totalDays,
            route.params.programKey,
            route.params.programMode,
        ]
    );

    const syncInProgressFromBackend = useCallback(async () => {
        if (!isUserLoaded || !user?.id) return;

        try {
            const response = await axios.get(`${API_BASE_URL}/users/in-progress`, {
                params: withAppParams({ clerkUserId: user.id }),
                headers: getAppHeaders(),
            });

            const remoteWorkout = response.data?.workoutData || null;
            if (!remoteWorkout) return;

            const normalizedRemote = {
                ...remoteWorkout,
                clerkUserId: remoteWorkout.clerkUserId || user.id,
                savedAt: remoteWorkout.savedAt || response.data?.updatedAt || new Date().toISOString(),
            };

            const localSavedAt = toTimestamp(inProgressWorkout?.savedAt);
            const remoteSavedAt = toTimestamp(normalizedRemote.savedAt);
            const localOwner = String(inProgressWorkout?.clerkUserId || '').trim();
            const currentOwner = String(user.id || '').trim();
            const isLocalForCurrentUser = !localOwner || localOwner === currentOwner;

            if (!inProgressWorkout || !isLocalForCurrentUser || remoteSavedAt >= localSavedAt) {
                saveInProgressWorkout(normalizedRemote);
            }
        } catch (error) {
            console.error('Failed to sync in-progress workout from backend:', error);
        }
    }, [inProgressWorkout, isUserLoaded, saveInProgressWorkout, user?.id]);

    const clearInProgressRemote = useCallback(async () => {
        try {
            await clearInProgressFromBackend(user?.id);
        } catch (error) {
            console.error('Failed to clear in-progress workout in backend:', error);
        }
    }, [user?.id]);

    useFocusEffect(
        useCallback(() => {
            syncInProgressFromBackend();
        }, [syncInProgressFromBackend])
    );
    

    const hasMatchingSavedSession = useMemo(() => {
        if (!inProgressWorkout) return false;

        return isMatchingSession({ currentUserId: user?.id, routeParams: route.params, saved: inProgressWorkout, exercises, getExerciseName });
    }, [exercises, inProgressWorkout, route.params?.dayIndex,route.params?.programMode, route.params?.programKey, user?.id]);

    const savedCompletedNameSet = useMemo(
        () =>
            new Set(
                (inProgressWorkout?.completedExercises || [])
                    .map(getExerciseName)
                    .filter(Boolean)
            ),
        [inProgressWorkout?.completedExercises]
    );

    const activeCompletedNameSet =
        hasMatchingSavedSession && savedCompletedNameSet.size
            ? savedCompletedNameSet
            : completedNameSet;
    const completedCount = exercises.filter((ex) => activeCompletedNameSet.has(getExerciseName(ex))).length;
    const progress = exercises.length ? completedCount / exercises.length : 0;
    const remainingCount = Math.max(0, exercises.length - completedCount);
    const savedAtLabel = inProgressWorkout?.savedAt
        ? new Date(inProgressWorkout.savedAt).toLocaleString()
        : null;
    const savedElapsedLabel = formatElapsed(inProgressWorkout?.elapsedSeconds);

    const startFreshWorkout = async ({ clearRemote = false } = {}) => {
        if (clearRemote) {
            await clearInProgressRemote();
        }
        navigation.navigate('Fit', { ...fitParams, resetProgress: clearRemote });
    };

    const resumeSavedWorkout = () => {
        if (!hasMatchingSavedSession || !inProgressWorkout) {
            startFreshWorkout();
            return;
        }

        navigation.navigate('Fit', {
            ...fitParams,
            resumeSession: inProgressWorkout,
            resetProgress: false,
        });
    };

    const onStartPress = () => {
        if (!hasMatchingSavedSession) {
            startFreshWorkout();
            return;
        }

        Alert.alert(
            'Resume workout?',
            'We found your saved progress for this day. Do you want to continue from where you stopped?',
            [
                {
                    text: 'Resume',
                    onPress: resumeSavedWorkout,
                },
                {
                    text: 'Restart',
                    style: 'destructive',
                    onPress: () => startFreshWorkout({ clearRemote: true }),
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Hero */}
                <View style={styles.heroContainer}>
                    <Animated.Image
                        source={{ uri: image }}
                        style={[styles.heroImage, { transform: [{ scale: heroScale }], opacity: heroOpacity }]}
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.45)', 'transparent']}
                        style={StyleSheet.absoluteFillObject}
                    />
                    <LinearGradient
                        colors={['transparent', '#0D0D0F']}
                        style={styles.heroFade}
                    />

                    {/* Back button */}
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Feather name="chevron-left" size={22} color="#fff" />
                    </TouchableOpacity>

                    {/* Hero info */}
                    <View style={styles.heroInfo}>
                        <Text style={styles.heroTitle}>Today's Workout</Text>
                        <Text style={styles.heroSubtitle}>{exercises.length} exercises</Text>
                    </View>
                </View>

                {/* Progress bar */}
                <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>PROGRESS</Text>
                        <Text style={styles.progressCount}>
                            {completedCount}/{exercises.length}
                        </Text>
                    </View>
                    <View style={styles.progressTrack}>
                        <Animated.View
                            style={[styles.progressFill, { width: `${progress * 100}%` }]}
                        />
                    </View>
                </View>

                {hasMatchingSavedSession && inProgressWorkout ? (
                    <View style={styles.resumeCard}>
                        <View style={styles.resumeHeader}>
                            <View>
                                <Text style={styles.resumeTitle}>Resume your session</Text>
                                {savedAtLabel ? (
                                    <Text style={styles.resumeSubtitle}>Saved {savedAtLabel}</Text>
                                ) : null}
                            </View>
                            <View style={styles.resumeBadge}>
                                <Feather name="clock" size={12} color="#00E5BE" />
                                <Text style={styles.resumeBadgeText}>{savedElapsedLabel}</Text>
                            </View>
                        </View>

                        <View style={styles.resumeStatsRow}>
                            <View style={styles.resumeStat}>
                                <Text style={styles.resumeStatValue}>{completedCount}</Text>
                                <Text style={styles.resumeStatLabel}>Done</Text>
                            </View>
                            <View style={styles.resumeStatDivider} />
                            <View style={styles.resumeStat}>
                                <Text style={styles.resumeStatValue}>{remainingCount}</Text>
                                <Text style={styles.resumeStatLabel}>Left</Text>
                            </View>
                            <View style={styles.resumeStatDivider} />
                            <View style={styles.resumeStat}>
                                <Text style={styles.resumeStatValue}>{Math.round(progress * 100)}%</Text>
                                <Text style={styles.resumeStatLabel}>Progress</Text>
                            </View>
                        </View>

                        <View style={styles.resumeActions}>
                            <TouchableOpacity onPress={() => startFreshWorkout({ clearRemote: true })} style={styles.resumeBtnGhost}>
                                <Text style={styles.resumeBtnGhostText}>Restart</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={resumeSavedWorkout} style={styles.resumeBtnPrimary}>
                                <Text style={styles.resumeBtnPrimaryText}>Resume</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : null}

                {/* Exercise list */}
                <View style={styles.listContainer}>
                    {exercises.map((item, index) => (
                        <ExerciseRow
                            key={index}
                            item={item}
                            index={index}
                            isCompleted={activeCompletedNameSet.has(getExerciseName(item))}
                        />
                    ))}
                </View>
            </ScrollView>

            {/* Sticky START button */}
            <View style={styles.stickyBottom}>
                <TouchableOpacity
                    onPress={onStartPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={1}
                >
                    <Animated.View style={[styles.startBtn, { transform: [{ scale: btnScale }] }]}>
                        <LinearGradient
                            colors={['#FF4D2E', '#FF2800']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                                style={styles.startBtnGradient}
                            >
                                <MaterialCommunityIcons name="whistle" size={22} color="#fff" />
                                <Text style={styles.startBtnText}>
                                    {hasMatchingSavedSession ? 'RESUME WORKOUT' : 'START WORKOUT'}
                                </Text>
                                <Feather name="arrow-right" size={18} color="#fff" />
                            </LinearGradient>
                        </Animated.View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default WorkoutScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0F',
    },

    // Hero
    heroContainer: {
        height: height * 0.35,
        overflow: 'hidden',
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroFade: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '55%',
    },
    backBtn: {
        position: 'absolute',
        top: 52,
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
    heroInfo: {
        position: 'absolute',
        bottom: 22,
        left: 22,
    },
    heroTitle: {
        color: '#fff',
        fontSize: 26,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    heroSubtitle: {
        color: '#888',
        fontSize: 13,
        marginTop: 3,
        fontWeight: '500',
    },

    // Progress
    progressSection: {
        paddingHorizontal: 22,
        paddingTop: 22,
        paddingBottom: 10,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    progressLabel: {
        color: '#555',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    progressCount: {
        color: '#FF4D2E',
        fontSize: 12,
        fontWeight: '800',
    },
    progressTrack: {
        height: 4,
        backgroundColor: '#1E1E26',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FF4D2E',
        borderRadius: 4,
    },
    resumeCard: {
        marginHorizontal: 20,
        marginTop: 16,
        padding: 16,
        borderRadius: 18,
        backgroundColor: '#16161C',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    resumeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    resumeTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
    },
    resumeSubtitle: {
        color: '#7C7C90',
        fontSize: 11,
        fontWeight: '700',
        marginTop: 4,
    },
    resumeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 14,
        backgroundColor: 'rgba(0,229,190,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(0,229,190,0.3)',
    },
    resumeBadgeText: {
        color: '#00E5BE',
        fontSize: 12,
        fontWeight: '800',
    },
    resumeStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 14,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: '#1C1C24',
    },
    resumeStat: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    resumeStatValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
    },
    resumeStatLabel: {
        color: '#6E6E86',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.1,
    },
    resumeStatDivider: {
        width: 1,
        height: 32,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    resumeActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 14,
    },
    resumeBtnGhost: {
        flex: 1,
        borderRadius: 14,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        backgroundColor: '#1B1B22',
    },
    resumeBtnGhostText: {
        color: '#C7C7D6',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    resumeBtnPrimary: {
        flex: 1,
        borderRadius: 14,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#00E5BE',
    },
    resumeBtnPrimaryText: {
        color: '#0C0C10',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 0.8,
    },

    // List
    listContainer: {
        paddingHorizontal: 20,
        paddingTop: 14,
        gap: 10,
    },
    exerciseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#16161A',
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: 10,
    },
    rowAccent: {
        width: 4,
        height: '65%',
        borderRadius: 4,
        marginLeft: 14,
        marginRight: 12,
        flexShrink: 0,
    },
    gifContainer: {
        width: 72,
        height: 72,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: '#222',
        marginVertical: 12,
        flexShrink: 0,
    },
    gifImage: {
        width: '100%',
        height: '100%',
    },
    exerciseInfo: {
        flex: 1,
        paddingLeft: 12,
        paddingRight: 6,
    },
    exerciseName: {
        color: '#EFEFEF',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: -0.2,
        marginBottom: 6,
        textTransform: 'capitalize',
    },
    exerciseMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    metaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        borderWidth: 1,
    },
    metaBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    targetText: {
        color: '#444',
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 1,
    },
    completionIcon: {
        marginRight: 16,
        flexShrink: 0,
    },
    completedBadge: {
        width: 28,
        height: 28,
        borderRadius: 10,
        backgroundColor: '#00E5BE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pendingBadge: {
        width: 28,
        height: 28,
        borderRadius: 10,
        backgroundColor: '#1E1E26',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#2E2E3A',
    },
    pendingIndex: {
        color: '#555',
        fontSize: 11,
        fontWeight: '700',
    },

    // Sticky button
    stickyBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingBottom: 34,
        paddingTop: 12,
        backgroundColor: 'rgba(13,13,15,0.95)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    startBtn: {
        borderRadius: 18,
        overflow: 'hidden',
    },
    startBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 18,
        paddingHorizontal: 24,
    },
    startBtnText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 16,
        letterSpacing: 1,
    },
});
