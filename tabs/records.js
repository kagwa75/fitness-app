import {
    ActivityIndicator,
    ScrollView,
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    Animated,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FitnessItems } from '../Context';
import { useCallback, useContext, useMemo, useRef, useEffect, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-expo';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import API_BASE_URL from '../constants/api';
import { scheduleStreakReminder } from '../utils/notifications';
import { readCache, writeCache, isCacheFresh } from '../utils/localCache';
import { mapWorkoutSession } from '../utils/recordsMapper';
import { RECORDS_CACHE_KEY_PREFIX, RECORDS_CACHE_TTL_MS } from '../constants/cache';

const ACCENTS = ['#FF4D2E', '#00E5BE', '#6C63FF', '#FFB800', '#FF4D8C', '#00C2FF'];

const VIEW_MODES = [
    { key: 'timeline', label: 'Timeline', icon: 'timeline-outline' },
    { key: 'monthly', label: 'Monthly', icon: 'calendar-month-outline' },
    { key: 'heatmap', label: 'Heatmap', icon: 'calendar-blank' },
];

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const INSIGHT_MILESTONES = [
    { id: 'first-workout', label: 'First Step', metric: 'workouts', target: 1, icon: 'dumbbell', color: '#00E5BE' },
    { id: 'workout-10', label: '10 Workouts', metric: 'workouts', target: 10, icon: 'dumbbell', color: '#FFB800' },
    { id: 'calories-1k', label: '1K Calories', metric: 'calories', target: 1000, icon: 'fire', color: '#FF4D2E' },
    { id: 'minutes-300', label: '5 Hours', metric: 'minutes', target: 300, icon: 'clock-outline', color: '#6C63FF' },
    { id: 'days-20', label: '20 Active Days', metric: 'activeDays', target: 20, icon: 'calendar-check', color: '#00C2FF' },
    { id: 'streak-7', label: '7 Day Streak', metric: 'streak', target: 7, icon: 'lightning-bolt', color: '#FF4D8C' },
];

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const pad2 = (value) => String(value).padStart(2, '0');

const toDateObj = (value) => {
    const date = value instanceof Date ? value : new Date(value || Date.now());
    return Number.isNaN(date.getTime()) ? null : date;
};

const toDateKey = (value) => {
    const date = toDateObj(value);
    if (!date) return '';
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

const fromDateKey = (dateKey) => {
    if (!dateKey) return null;
    const [year, month, day] = dateKey.split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
};

const formatDateTime = (value) => {
    const date = toDateObj(value);
    if (!date) return 'Unknown date';

    return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

const formatDayLabel = (dateKey) => {
    const date = fromDateKey(dateKey);
    if (!date) return dateKey;

    return date.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    });
};

const formatMonthLabel = (monthKey) => {
    const [year, month] = String(monthKey || '').split('-').map(Number);
    if (!year || !month) return monthKey;

    return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
    });
};

const formatShortDate = (value) => {
    const date = toDateObj(value);
    if (!date) return '';

    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
    });
};

const formatDuration = (totalSeconds) => {
    const safeSeconds = Math.max(0, Math.round(toNumber(totalSeconds, 0)));
    const minutes = Math.round(safeSeconds / 60);

    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins ? `${hours}h ${mins}m` : `${hours}h`;
};

const formatDelta = (current, previous) => {
    if (previous === 0) return current > 0 ? 'New' : '0%';
    const pct = Math.round(((current - previous) / previous) * 100);
    return `${pct > 0 ? '+' : ''}${pct}%`;
};

const getDeltaTone = (current, previous) => {
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'flat';
};

const getWeekStartKey = (dateKey) => {
    const date = fromDateKey(dateKey);
    if (!date) return '';

    const dayIndex = (date.getDay() + 6) % 7; // Monday-based
    date.setDate(date.getDate() - dayIndex);
    return toDateKey(date);
};

const getWeekStartDate = (value) => {
    const date = toDateObj(value);
    if (!date) return null;

    date.setHours(0, 0, 0, 0);
    const dayIndex = (date.getDay() + 6) % 7;
    date.setDate(date.getDate() - dayIndex);
    return date;
};

const isInRange = (value, start, end) => {
    const date = toDateObj(value);
    if (!date || !start || !end) return false;
    return date >= start && date < end;
};

const calculateCurrentStreak = (dateKeys) => {
    if (!Array.isArray(dateKeys) || dateKeys.length === 0) return 0;

    const keySet = new Set(dateKeys);
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    if (!keySet.has(toDateKey(cursor))) {
        cursor.setDate(cursor.getDate() - 1);
        if (!keySet.has(toDateKey(cursor))) return 0;
    }

    let streak = 0;
    while (streak < 366 && keySet.has(toDateKey(cursor))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
};

const getHeatColor = (count, maxCount) => {
    if (!count || !maxCount) return 'rgba(255,255,255,0.06)';

    const intensity = count / maxCount;
    if (intensity > 0.75) return '#FF4D2E';
    if (intensity > 0.5) return '#FF6E55';
    if (intensity > 0.25) return 'rgba(255,77,46,0.52)';
    return 'rgba(255,77,46,0.28)';
};

const getSessionTotals = (sessions) =>
    sessions.reduce(
        (acc, session) => {
            acc.sessionCount += 1;
            acc.totalExercises += toNumber(session?.summary?.totalExercises, 0);
            acc.totalCaloriesBurned += toNumber(session?.summary?.totalCaloriesBurned, 0);
            acc.totalDurationSeconds += toNumber(session?.summary?.totalDurationSeconds, 0);
            return acc;
        },
        { sessionCount: 0, totalExercises: 0, totalCaloriesBurned: 0, totalDurationSeconds: 0 }
    );

const buildRecordsErrorMessage = (error) => {
    const status = error?.response?.status;
    const details = error?.response?.data?.error || error?.response?.data?.details || error?.message;

    if (status === 404) {
        return 'Workouts API route not found. Restart backend with latest routes.';
    }

    if (status) {
        return `Could not load records (${status}). ${details || ''}`.trim();
    }

    return details || 'Could not load records.';
};

const StatCard = ({ value, label, icon, accentColor, delay = 0 }) => {
    const scaleAnim = useRef(new Animated.Value(0.85)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
                Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]),
        ]).start();
    }, []);

    return (
        <Animated.View style={[styles.statCard, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}> 
            <View style={[styles.statIconBg, { backgroundColor: accentColor + '20' }]}> 
                <MaterialCommunityIcons name={icon} size={16} color={accentColor} />
            </View>
            <Text style={[styles.statValue, { color: accentColor }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </Animated.View>
    );
};

const SessionCard = ({ session, index, isExpanded, onToggle, onViewDetails, showDate = true }) => {
    const accent = ACCENTS[index % ACCENTS.length];

    return (
        <View style={styles.sessionCard}>
            <TouchableOpacity style={styles.sessionHeader} activeOpacity={0.85} onPress={onToggle}>
                <View style={[styles.sessionAccent, { backgroundColor: accent }]} />
                <View style={[styles.sessionIconWrap, { backgroundColor: accent + '18' }]}> 
                    <MaterialCommunityIcons name="clipboard-text-clock-outline" size={15} color={accent} />
                </View>

                <View style={styles.sessionMainInfo}>
                    <Text style={styles.sessionTitle}>Workout Session</Text>
                    {showDate ? <Text style={styles.sessionDate}>{session.displayDate}</Text> : null}
                </View>

                <View style={styles.sessionSummaryCol}>
                    <Text style={styles.sessionSummaryText}>{session.summary.totalExercises} ex</Text>
                    <Text style={styles.sessionSummaryText}>{Math.round(session.summary.totalCaloriesBurned)} kcal</Text>
                    <Text style={styles.sessionSummaryText}>{formatDuration(session.summary.totalDurationSeconds)}</Text>
                </View>

                <View style={[styles.sessionChevronWrap, { backgroundColor: accent + '18' }]}> 
                    <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={13} color={accent} />
                </View>
            </TouchableOpacity>

            {isExpanded ? (
                <View style={styles.exerciseListWrap}>
                    {session.exercises.length === 0 ? (
                        <Text style={styles.sessionEmptyText}>No exercise details available.</Text>
                    ) : (
                        session.exercises.map((exercise, exerciseIndex) => (
                            <View key={exercise.id} style={styles.exerciseRow}>
                                <View style={styles.exerciseIndexBubble}>
                                    <Text style={styles.exerciseIndexText}>{exerciseIndex + 1}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                                    <Text style={styles.exerciseMeta}>
                                        {exercise.target || 'General'}
                                        {'  •  '}
                                        {exercise.sets != null ? `${exercise.sets} sets` : '- sets'}
                                        {'  •  '}
                                        {exercise.durationSeconds != null ? `${exercise.durationSeconds}s` : '-s'}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                    {typeof onViewDetails === 'function' ? (
                        <TouchableOpacity onPress={onViewDetails} style={styles.sessionDetailBtn} activeOpacity={0.85}>
                            <Text style={styles.sessionDetailBtnText}>View full session</Text>
                            <Feather name="chevron-right" size={12} color="#00E5BE" />
                        </TouchableOpacity>
                    ) : null}
                </View>
            ) : null}
        </View>
    );
};

const LoadingState = () => (
    <View style={styles.emptyState}>
        <ActivityIndicator size="small" color="#FF4D2E" />
        <Text style={styles.emptyTitle}>Loading records...</Text>
    </View>
);

const EmptyState = ({ signedIn }) => {
    const pulseAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.06, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 0.9, duration: 1000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.emptyState}>
            <Animated.View style={[styles.emptyIconBg, { transform: [{ scale: pulseAnim }] }]}> 
                <MaterialCommunityIcons name="weight-lifter" size={36} color="#FF4D2E" />
            </Animated.View>
            <Text style={styles.emptyTitle}>{signedIn ? 'No workouts yet' : 'Sign in to sync records'}</Text>
            <Text style={styles.emptySubtext}>
                {signedIn
                    ? 'Complete your first session to build timeline, monthly, and heatmap views.'
                    : 'Google sign in to sync completed workout sessions across devices.'}
            </Text>
        </View>
    );
};

export default function Records() {
    const { calories, minutes, workout, completed } = useContext(FitnessItems);
    const { user, isLoaded: isUserLoaded } = useUser();
    const navigation = useNavigation();

    const [records, setRecords] = useState([]);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [recordsError, setRecordsError] = useState('');

    const [viewMode, setViewMode] = useState('timeline');
    const [selectedDate, setSelectedDate] = useState('');
    const [expandedSessionId, setExpandedSessionId] = useState(null);
    const [expandedDayKey, setExpandedDayKey] = useState(null);

    const headerFadeAnim = useRef(new Animated.Value(0)).current;
    const headerYAnim = useRef(new Animated.Value(-16)).current;
    const recordsCacheKey = user?.id ? `${RECORDS_CACHE_KEY_PREFIX}${user.id}` : null;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(headerFadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(headerYAnim, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
        ]).start();
    }, []);

    useEffect(() => {
        let isMounted = true;
        const hydrate = async () => {
            if (!recordsCacheKey) return;
            const cached = await readCache(recordsCacheKey);
            if (isMounted && Array.isArray(cached?.data)) {
                setRecords(cached.data);
            }
        };
        hydrate();
        return () => {
            isMounted = false;
        };
    }, [recordsCacheKey]);

    const fetchRecords = useCallback(async ({ force = false } = {}) => {
        if (!isUserLoaded) return;

        if (!user?.id) {
            setRecords([]);
            setRecordsError('');
            setLoadingRecords(false);
            return;
        }

        let cached = null;
        if (!force && recordsCacheKey) {
            cached = await readCache(recordsCacheKey);
            if (isCacheFresh(cached, RECORDS_CACHE_TTL_MS) && Array.isArray(cached?.data)) {
                setRecords(cached.data);
                setRecordsError('');
                setLoadingRecords(false);
                return;
            }
        }

        setLoadingRecords(true);
        setRecordsError('');

        try {
            const response = await axios.get(`${API_BASE_URL}/users/workouts`, {
                params: { clerkUserId: user.id },
            });

            const payload = Array.isArray(response.data) ? response.data : [];
            const mapped = payload.map(mapWorkoutSession).filter(Boolean);
            setRecords(mapped);
            if (recordsCacheKey) {
                await writeCache(recordsCacheKey, mapped);
            }
        } catch (error) {
            console.error('Failed to load workout records:', error);
            if (Array.isArray(cached?.data)) {
                setRecords(cached.data);
            } else {
                setRecords([]);
            }
            setRecordsError(buildRecordsErrorMessage(error));
        } finally {
            setLoadingRecords(false);
        }
    }, [isUserLoaded, recordsCacheKey, user?.id]);

    useFocusEffect(
        useCallback(() => {
            fetchRecords();
        }, [fetchRecords])
    );

    const fallbackLocalRecords = useMemo(() => {
        if (user?.id || !completed.length) return [];

        const localExercises = completed
            .map((exercise, index) => {
                const name = String(exercise?.name || '').trim();
                if (!name) return null;

                return {
                    id: `local-exercise-${index}`,
                    name,
                    target: exercise?.target || null,
                    sets: exercise?.sets != null ? toNumber(exercise.sets, 0) : null,
                    durationSeconds: exercise?.duration != null ? toNumber(exercise.duration, 0) : null,
                    caloriesBurned: 0,
                };
            })
            .filter(Boolean);

        if (!localExercises.length) return [];

        return [
            {
                id: 'local-session',
                createdAt: new Date().toISOString(),
                dateKey: toDateKey(new Date()),
                displayDate: 'Current local session',
                summary: {
                    totalExercises: localExercises.length,
                    totalCaloriesBurned: 0,
                    totalDurationSeconds: 0,
                },
                exercises: localExercises,
            },
        ];
    }, [completed, user?.id]);

    const allRecords = user?.id ? records : fallbackLocalRecords;

    const sessionsByDate = useMemo(() => {
        const grouped = {};

        allRecords.forEach((session) => {
            if (!session?.dateKey) return;
            if (!grouped[session.dateKey]) grouped[session.dateKey] = [];
            grouped[session.dateKey].push(session);
        });

        Object.keys(grouped).forEach((dateKey) => {
            grouped[dateKey] = grouped[dateKey].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        });

        return grouped;
    }, [allRecords]);

    const sortedDateKeys = useMemo(
        () =>
            Object.keys(sessionsByDate).sort(
                (a, b) => new Date(`${b}T00:00:00`).getTime() - new Date(`${a}T00:00:00`).getTime()
            ),
        [sessionsByDate]
    );

    const timelineItems = useMemo(() => {
        const items = [];
        let currentWeekKey = '';
        let sessionIndex = 0;

        sortedDateKeys.forEach((dateKey) => {
            const weekKey = getWeekStartKey(dateKey);

            if (weekKey !== currentWeekKey) {
                items.push({
                    type: 'week',
                    key: `week-${weekKey}`,
                    label: `Week of ${formatDayLabel(weekKey).replace(/^\w+,\s/, '')}`,
                });
                currentWeekKey = weekKey;
            }

            const daySessions = sessionsByDate[dateKey] || [];
            const dayTotals = getSessionTotals(daySessions);

            items.push({
                type: 'day',
                key: `day-${dateKey}`,
                dateKey,
                label: formatDayLabel(dateKey),
                totals: dayTotals,
            });

            daySessions.forEach((session) => {
                items.push({
                    type: 'session',
                    key: `session-${session.id}`,
                    session,
                    sessionIndex,
                });
                sessionIndex += 1;
            });
        });

        return items;
    }, [sortedDateKeys, sessionsByDate]);

    const monthlyGroups = useMemo(() => {
        const grouped = {};

        sortedDateKeys.forEach((dateKey) => {
            const monthKey = dateKey.slice(0, 7);
            if (!grouped[monthKey]) {
                grouped[monthKey] = {
                    key: monthKey,
                    label: formatMonthLabel(monthKey),
                    days: [],
                };
            }

            const daySessions = sessionsByDate[dateKey] || [];
            grouped[monthKey].days.push({
                key: `${monthKey}-${dateKey}`,
                dateKey,
                label: formatDayLabel(dateKey),
                totals: getSessionTotals(daySessions),
                sessions: daySessions,
            });
        });

        return Object.values(grouped)
            .sort((a, b) => (a.key < b.key ? 1 : -1))
            .map((month) => ({
                ...month,
                days: month.days.sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1)),
            }));
    }, [sortedDateKeys, sessionsByDate]);

    const weeklySnapshot = useMemo(() => {
        const thisWeekStart = getWeekStartDate(new Date());
        if (!thisWeekStart) {
            return {
                rangeLabel: '',
                activeDays: 0,
                metrics: [],
                daily: WEEKDAY_LABELS.map((day) => ({ day, sessionCount: 0 })),
                maxDailySessions: 0,
            };
        }

        const thisWeekEnd = new Date(thisWeekStart);
        thisWeekEnd.setDate(thisWeekEnd.getDate() + 7);
        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        const thisWeekSessions = allRecords.filter((session) => isInRange(session?.createdAt, thisWeekStart, thisWeekEnd));
        const lastWeekSessions = allRecords.filter((session) => isInRange(session?.createdAt, lastWeekStart, thisWeekStart));

        const thisWeekTotals = getSessionTotals(thisWeekSessions);
        const lastWeekTotals = getSessionTotals(lastWeekSessions);

        const thisWeekMinutes = Math.round(thisWeekTotals.totalDurationSeconds / 60);
        const lastWeekMinutes = Math.round(lastWeekTotals.totalDurationSeconds / 60);
        const thisWeekCalories = Math.round(thisWeekTotals.totalCaloriesBurned);
        const lastWeekCalories = Math.round(lastWeekTotals.totalCaloriesBurned);

        const daily = WEEKDAY_LABELS.map((day, index) => {
            const date = new Date(thisWeekStart);
            date.setDate(thisWeekStart.getDate() + index);
            const dayKey = toDateKey(date);
            const daySessions = sessionsByDate[dayKey] || [];
            return {
                day,
                dayKey,
                sessionCount: daySessions.length,
            };
        });

        const activeDays = daily.filter((item) => item.sessionCount > 0).length;
        const maxDailySessions = daily.reduce((max, item) => Math.max(max, item.sessionCount), 0);

        return {
            rangeLabel: `${formatShortDate(thisWeekStart)} - ${formatShortDate(new Date(thisWeekEnd.getTime() - 1))}`,
            activeDays,
            metrics: [
                {
                    id: 'workouts',
                    label: 'Workouts',
                    icon: 'lightning-bolt',
                    color: '#FF4D2E',
                    value: thisWeekTotals.sessionCount,
                    previousValue: lastWeekTotals.sessionCount,
                },
                {
                    id: 'minutes',
                    label: 'Minutes',
                    icon: 'clock-outline',
                    color: '#00E5BE',
                    value: thisWeekMinutes,
                    previousValue: lastWeekMinutes,
                },
                {
                    id: 'calories',
                    label: 'Calories',
                    icon: 'fire',
                    color: '#6C63FF',
                    value: thisWeekCalories,
                    previousValue: lastWeekCalories,
                },
            ],
            daily,
            maxDailySessions,
        };
    }, [allRecords, sessionsByDate]);

    const weeklyTrendTiles = useMemo(
        () =>
            weeklySnapshot.metrics.map((metric) => ({
                id: metric.id,
                label: metric.label,
                value: metric.value,
                delta: formatDelta(metric.value, metric.previousValue),
                tone: getDeltaTone(metric.value, metric.previousValue),
                color: metric.color,
                icon: metric.icon,
            })),
        [weeklySnapshot.metrics]
    );

    const monthlyRollup = useMemo(() => {
        const thisWeekStart = getWeekStartDate(new Date());
        if (!thisWeekStart) {
            return {
                totals: { workouts: 0, minutes: 0, calories: 0, consistencyPct: 0 },
                weeks: [],
                bestWeek: null,
                weekTrend: 0,
            };
        }

        const weeks = [];

        for (let offset = 3; offset >= 0; offset -= 1) {
            const weekStart = new Date(thisWeekStart);
            weekStart.setDate(weekStart.getDate() - offset * 7);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);

            const weekSessions = allRecords.filter((session) => isInRange(session?.createdAt, weekStart, weekEnd));
            const totals = getSessionTotals(weekSessions);

            weeks.push({
                key: `W${4 - offset}`,
                rangeLabel: `${formatShortDate(weekStart)} - ${formatShortDate(new Date(weekEnd.getTime() - 1))}`,
                workouts: totals.sessionCount,
                calories: Math.round(totals.totalCaloriesBurned),
                minutes: Math.round(totals.totalDurationSeconds / 60),
            });
        }

        const totals = weeks.reduce(
            (acc, week) => {
                acc.workouts += week.workouts;
                acc.minutes += week.minutes;
                acc.calories += week.calories;
                return acc;
            },
            { workouts: 0, minutes: 0, calories: 0 }
        );

        const fourWeekStart = new Date(thisWeekStart);
        fourWeekStart.setDate(fourWeekStart.getDate() - 21);
        const nextWeekEnd = new Date(thisWeekStart);
        nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);

        const uniqueDays = new Set(
            allRecords
                .filter((session) => isInRange(session?.createdAt, fourWeekStart, nextWeekEnd))
                .map((session) => session.dateKey)
                .filter(Boolean)
        );

        const bestWeek = weeks.reduce((best, week) => {
            if (!best) return week;
            if (week.workouts > best.workouts) return week;
            if (week.workouts === best.workouts && week.calories > best.calories) return week;
            return best;
        }, null);

        return {
            totals: {
                ...totals,
                consistencyPct: Math.min(100, Math.round((uniqueDays.size / 28) * 100)),
            },
            weeks,
            bestWeek,
            weekTrend: weeks.length > 1 ? weeks[weeks.length - 1].workouts - weeks[weeks.length - 2].workouts : 0,
        };
    }, [allRecords]);

    const achievementSummary = useMemo(() => {
        const totals = getSessionTotals(allRecords);
        const totalMinutesValue = Math.round(totals.totalDurationSeconds / 60);
        const totalCaloriesValue = Math.round(totals.totalCaloriesBurned);
        const activeDaysValue = sortedDateKeys.length;
        const streakValue = calculateCurrentStreak(sortedDateKeys);

        const metricValues = {
            workouts: allRecords.length,
            calories: totalCaloriesValue,
            minutes: totalMinutesValue,
            activeDays: activeDaysValue,
            streak: streakValue,
        };

        const badges = INSIGHT_MILESTONES.map((milestone) => {
            const raw = toNumber(metricValues[milestone.metric], 0);
            return {
                ...milestone,
                earned: raw >= milestone.target,
                progress: Math.min(100, Math.round((raw / milestone.target) * 100)),
                current: Math.min(raw, milestone.target),
                total: raw,
            };
        }).sort((a, b) => {
            if (a.earned && !b.earned) return -1;
            if (!a.earned && b.earned) return 1;
            if (a.earned && b.earned) return b.target - a.target;
            return b.progress - a.progress;
        });

        return {
            streak: streakValue,
            earnedCount: badges.filter((badge) => badge.earned).length,
            badges,
        };
    }, [allRecords, sortedDateKeys]);

    const hasWorkoutToday = useMemo(() => {
        const todayKey = toDateKey(new Date());
        return sortedDateKeys.includes(todayKey);
    }, [sortedDateKeys]);

    useEffect(() => {
        if (loadingRecords || showEmpty) return;
        scheduleStreakReminder({ streak: achievementSummary.streak, hasWorkoutToday });
    }, [achievementSummary.streak, hasWorkoutToday, loadingRecords, showEmpty]);

    const handleViewSession = useCallback(
        (session) => {
            navigation.navigate('SessionDetail', { session });
        },
        [navigation]
    );

    const personalHighlights = useMemo(() => {
        if (!allRecords.length) return [];

        const bestCaloriesSession = allRecords.reduce((best, session) =>
            toNumber(session?.summary?.totalCaloriesBurned, 0) > toNumber(best?.summary?.totalCaloriesBurned, 0) ? session : best
        );
        const longestSession = allRecords.reduce((best, session) =>
            toNumber(session?.summary?.totalDurationSeconds, 0) > toNumber(best?.summary?.totalDurationSeconds, 0) ? session : best
        );
        const highestExerciseSession = allRecords.reduce((best, session) =>
            toNumber(session?.summary?.totalExercises, 0) > toNumber(best?.summary?.totalExercises, 0) ? session : best
        );

        const exerciseFrequency = {};
        allRecords.forEach((session) => {
            session.exercises.forEach((exercise) => {
                const key = String(exercise?.name || '').trim();
                if (!key) return;
                exerciseFrequency[key] = (exerciseFrequency[key] || 0) + 1;
            });
        });

        const mostFrequentExercise = Object.entries(exerciseFrequency).sort((a, b) => b[1] - a[1])[0];

        const highlights = [
            {
                id: 'calories-pr',
                icon: 'fire',
                label: 'Calorie Burn PR',
                value: `${Math.round(toNumber(bestCaloriesSession?.summary?.totalCaloriesBurned, 0))} kcal`,
                meta: bestCaloriesSession ? formatDateTime(bestCaloriesSession.createdAt) : 'No sessions yet',
            },
            {
                id: 'duration-pr',
                icon: 'clock-outline',
                label: 'Longest Session',
                value: formatDuration(toNumber(longestSession?.summary?.totalDurationSeconds, 0)),
                meta: longestSession ? formatDateTime(longestSession.createdAt) : 'No sessions yet',
            },
            {
                id: 'volume-pr',
                icon: 'dumbbell',
                label: 'Most Exercises',
                value: `${toNumber(highestExerciseSession?.summary?.totalExercises, 0)} in one session`,
                meta: highestExerciseSession ? formatDateTime(highestExerciseSession.createdAt) : 'No sessions yet',
            },
        ];

        if (mostFrequentExercise) {
            highlights.push({
                id: 'favorite-move',
                icon: 'star-circle-outline',
                label: 'Most Logged Exercise',
                value: `${mostFrequentExercise[0]} x${mostFrequentExercise[1]}`,
                meta: 'Across all recorded sessions',
            });
        }

        return highlights;
    }, [allRecords]);

    const maxHeatCount = useMemo(
        () => sortedDateKeys.reduce((max, dateKey) => Math.max(max, (sessionsByDate[dateKey] || []).length), 0),
        [sortedDateKeys, sessionsByDate]
    );

    const heatmapMarkedDates = useMemo(() => {
        const marks = {};

        sortedDateKeys.forEach((dateKey) => {
            const count = (sessionsByDate[dateKey] || []).length;
            const backgroundColor = getHeatColor(count, maxHeatCount);

            marks[dateKey] = {
                customStyles: {
                    container: {
                        backgroundColor,
                        borderRadius: 8,
                    },
                    text: {
                        color: count / Math.max(maxHeatCount, 1) > 0.5 ? '#fff' : '#EFEFEF',
                        fontWeight: '700',
                    },
                },
            };
        });

        if (selectedDate) {
            const existing = marks[selectedDate]?.customStyles || { container: {}, text: {} };
            marks[selectedDate] = {
                customStyles: {
                    container: {
                        ...existing.container,
                        borderWidth: 1,
                        borderColor: '#FFFFFF',
                        backgroundColor: existing.container.backgroundColor || 'rgba(255,77,46,0.28)',
                    },
                    text: {
                        ...existing.text,
                        color: '#FFFFFF',
                    },
                },
            };
        }

        return marks;
    }, [maxHeatCount, selectedDate, sessionsByDate, sortedDateKeys]);

    const heatmapSessions = selectedDate ? sessionsByDate[selectedDate] || [] : [];

    const totalWorkouts = user?.id ? allRecords.length : workout;
    const totalDurationSeconds = useMemo(
        () => allRecords.reduce((sum, session) => sum + toNumber(session?.summary?.totalDurationSeconds, 0), 0),
        [allRecords]
    );
    const totalCalories = useMemo(
        () => allRecords.reduce((sum, session) => sum + toNumber(session?.summary?.totalCaloriesBurned, 0), 0),
        [allRecords]
    );

    const totalMinutes = user?.id ? Math.round(totalDurationSeconds / 60) : minutes;
    const totalKcal = user?.id ? Math.round(totalCalories) : Math.round(toNumber(calories, 0));
    const streakCount = sortedDateKeys.length;

    const showEmpty = !loadingRecords && allRecords.length === 0;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <LinearGradient colors={['#0D0D0F', '#131318']} style={styles.topGradient}>
                    <SafeAreaView edges={['top']}>
                        <Animated.View
                            style={[
                                styles.pageHeader,
                                {
                                    opacity: headerFadeAnim,
                                    transform: [{ translateY: headerYAnim }],
                                },
                            ]}
                        >
                            <View>
                                <View style={styles.pageBadge}>
                                    <MaterialCommunityIcons name="chart-line" size={11} color="#FF4D2E" />
                                    <Text style={styles.pageBadgeText}>ACTIVITY</Text>
                                </View>
                                <Text style={styles.pageTitle}>Records</Text>
                            </View>
                            {streakCount > 0 ? (
                                <View style={styles.streakBadge}>
                                    <MaterialCommunityIcons name="fire" size={14} color="#FFB800" />
                                    <Text style={styles.streakText}>{streakCount} active day{streakCount === 1 ? '' : 's'}</Text>
                                </View>
                            ) : null}
                        </Animated.View>

                        <View style={styles.statsRow}>
                            <StatCard value={totalWorkouts} label="WORKOUTS" icon="lightning-bolt" accentColor="#FF4D2E" delay={100} />
                            <StatCard value={totalMinutes} label="MINUTES" icon="clock-outline" accentColor="#00E5BE" delay={200} />
                            <StatCard value={totalKcal} label="KCAL" icon="fire" accentColor="#6C63FF" delay={300} />
                        </View>
                    </SafeAreaView>
                </LinearGradient>

                {recordsError ? (
                    <View style={styles.errorBanner}>
                        <Feather name="alert-triangle" size={13} color="#FF4D2E" />
                        <Text style={styles.errorBannerText}>{recordsError}</Text>
                    </View>
                ) : null}

                    {!loadingRecords && !showEmpty ? (
                    <View style={styles.insightsWrap}>
                        <View style={styles.insightCard}>
                            <View style={styles.insightHeaderRow}>
                                <View>
                                    <Text style={styles.insightTitle}>Weekly Snapshot</Text>
                                    <Text style={styles.insightSubtitle}>{weeklySnapshot.rangeLabel}</Text>
                                </View>
                                <View style={styles.weeklyActiveBadge}>
                                    <MaterialCommunityIcons name="calendar-check" size={12} color="#00E5BE" />
                                    <Text style={styles.weeklyActiveBadgeText}>
                                        {weeklySnapshot.activeDays} active day{weeklySnapshot.activeDays === 1 ? '' : 's'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.weeklyMetricRow}>
                                {weeklySnapshot.metrics.map((metric) => {
                                    const tone = getDeltaTone(metric.value, metric.previousValue);
                                    const deltaLabel = formatDelta(metric.value, metric.previousValue);
                                    return (
                                        <View key={metric.id} style={styles.weeklyMetricCard}>
                                            <View style={[styles.weeklyMetricIconWrap, { backgroundColor: metric.color + '18' }]}>
                                                <MaterialCommunityIcons name={metric.icon} size={14} color={metric.color} />
                                            </View>
                                            <Text style={[styles.weeklyMetricValue, { color: metric.color }]}>{metric.value}</Text>
                                            <Text style={styles.weeklyMetricLabel}>{metric.label}</Text>
                                            <View
                                                style={[
                                                    styles.weeklyDeltaBadge,
                                                    tone === 'up'
                                                        ? styles.weeklyDeltaUp
                                                        : tone === 'down'
                                                          ? styles.weeklyDeltaDown
                                                          : styles.weeklyDeltaFlat,
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.weeklyDeltaText,
                                                        tone === 'up'
                                                            ? styles.weeklyDeltaTextUp
                                                            : tone === 'down'
                                                              ? styles.weeklyDeltaTextDown
                                                              : styles.weeklyDeltaTextFlat,
                                                    ]}
                                                >
                                                    {deltaLabel}
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>

                            <View style={styles.weeklyBarsRow}>
                                {weeklySnapshot.daily.map((day) => {
                                    const barHeight = weeklySnapshot.maxDailySessions
                                        ? Math.max(4, Math.round((day.sessionCount / weeklySnapshot.maxDailySessions) * 36))
                                        : 4;
                                    return (
                                        <View key={day.day} style={styles.weeklyBarItem}>
                                            <View style={styles.weeklyBarTrack}>
                                                <View style={[styles.weeklyBarFill, { height: barHeight }]} />
                                            </View>
                                            <Text style={styles.weeklyBarValue}>{day.sessionCount}</Text>
                                            <Text style={styles.weeklyBarLabel}>{day.day}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={styles.insightCard}>
                            <View style={styles.insightHeaderRow}>
                                <View>
                                    <Text style={styles.insightTitle}>Weekly Trend</Text>
                                    <Text style={styles.insightSubtitle}>Compared to last week</Text>
                                </View>
                            </View>
                            <View style={styles.trendRow}>
                                {weeklyTrendTiles.map((tile) => (
                                    <View key={tile.id} style={styles.trendCard}>
                                        <View style={[styles.trendIconWrap, { backgroundColor: tile.color + '18' }]}>
                                            <MaterialCommunityIcons name={tile.icon} size={14} color={tile.color} />
                                        </View>
                                        <Text style={styles.trendValue}>{tile.value}</Text>
                                        <Text style={styles.trendLabel}>{tile.label}</Text>
                                        <View
                                            style={[
                                                styles.trendDeltaPill,
                                                tile.tone === 'up'
                                                    ? styles.trendDeltaUp
                                                    : tile.tone === 'down'
                                                      ? styles.trendDeltaDown
                                                      : styles.trendDeltaFlat,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.trendDeltaText,
                                                    tile.tone === 'up'
                                                        ? styles.trendDeltaTextUp
                                                        : tile.tone === 'down'
                                                          ? styles.trendDeltaTextDown
                                                          : styles.trendDeltaTextFlat,
                                                ]}
                                            >
                                                {tile.delta}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={styles.insightCard}>
                            <View style={styles.insightHeaderRow}>
                                <View>
                                    <Text style={styles.insightTitle}>Monthly Rollup</Text>
                                    <Text style={styles.insightSubtitle}>Last 4 weeks</Text>
                                </View>
                                <View style={styles.monthlyTrendChip}>
                                    <Feather
                                        name={
                                            monthlyRollup.weekTrend > 0
                                                ? 'trending-up'
                                                : monthlyRollup.weekTrend < 0
                                                  ? 'trending-down'
                                                  : 'minus'
                                        }
                                        size={12}
                                        color={
                                            monthlyRollup.weekTrend > 0
                                                ? '#2DD4BF'
                                                : monthlyRollup.weekTrend < 0
                                                  ? '#F87171'
                                                  : '#8A8AA2'
                                        }
                                    />
                                    <Text
                                        style={[
                                            styles.monthlyTrendText,
                                            monthlyRollup.weekTrend > 0
                                                ? styles.monthlyTrendTextUp
                                                : monthlyRollup.weekTrend < 0
                                                  ? styles.monthlyTrendTextDown
                                                  : styles.monthlyTrendTextFlat,
                                        ]}
                                    >
                                        {monthlyRollup.weekTrend > 0 ? '+' : ''}
                                        {monthlyRollup.weekTrend} vs last week
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.monthlyTotalsRow}>
                                <View style={styles.monthlyTotalCard}>
                                    <Text style={styles.monthlyTotalValue}>{monthlyRollup.totals.workouts}</Text>
                                    <Text style={styles.monthlyTotalLabel}>Workouts</Text>
                                </View>
                                <View style={styles.monthlyTotalCard}>
                                    <Text style={styles.monthlyTotalValue}>{monthlyRollup.totals.minutes}m</Text>
                                    <Text style={styles.monthlyTotalLabel}>Minutes</Text>
                                </View>
                                <View style={styles.monthlyTotalCard}>
                                    <Text style={styles.monthlyTotalValue}>{monthlyRollup.totals.calories}</Text>
                                    <Text style={styles.monthlyTotalLabel}>Calories</Text>
                                </View>
                                <View style={styles.monthlyTotalCard}>
                                    <Text style={styles.monthlyTotalValue}>{monthlyRollup.totals.consistencyPct}%</Text>
                                    <Text style={styles.monthlyTotalLabel}>Consistency</Text>
                                </View>
                            </View>

                            <View style={styles.monthlyWeeksRow}>
                                {monthlyRollup.weeks.map((week) => {
                                    const isBestWeek = monthlyRollup.bestWeek?.key === week.key && week.workouts > 0;
                                    return (
                                        <View key={week.key} style={[styles.monthlyWeekPill, isBestWeek && styles.monthlyWeekPillBest]}>
                                            <Text style={[styles.monthlyWeekKey, isBestWeek && styles.monthlyWeekKeyBest]}>{week.key}</Text>
                                            <Text style={[styles.monthlyWeekWorkouts, isBestWeek && styles.monthlyWeekWorkoutsBest]}>
                                                {week.workouts} wk
                                            </Text>
                                            <Text style={styles.monthlyWeekRange}>{week.rangeLabel}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={styles.insightCard}>
                            <View style={styles.insightHeaderRow}>
                                <View>
                                    <Text style={styles.insightTitle}>Milestones & Highlights</Text>
                                    <Text style={styles.insightSubtitle}>
                                        {achievementSummary.earnedCount}/{achievementSummary.badges.length} milestones unlocked
                                    </Text>
                                </View>
                                {achievementSummary.streak > 0 ? (
                                    <View style={styles.streakMiniChip}>
                                        <MaterialCommunityIcons name="fire" size={12} color="#FFB800" />
                                        <Text style={styles.streakMiniText}>{achievementSummary.streak}d streak</Text>
                                    </View>
                                ) : null}
                            </View>

                            <View style={styles.badgesGrid}>
                                {achievementSummary.badges.slice(0, 6).map((badge) => (
                                    <View
                                        key={badge.id}
                                        style={[styles.badgeItem, badge.earned ? styles.badgeItemEarned : styles.badgeItemLocked]}
                                    >
                                        <View style={[styles.badgeIconWrap, { backgroundColor: badge.earned ? badge.color + '22' : '#212129' }]}>
                                            <MaterialCommunityIcons
                                                name={badge.icon}
                                                size={13}
                                                color={badge.earned ? badge.color : '#6E6E86'}
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.badgeName, !badge.earned && styles.badgeNameLocked]} numberOfLines={1}>
                                                {badge.label}
                                            </Text>
                                            <Text style={styles.badgeProgressText}>
                                                {badge.current}/{badge.target}
                                            </Text>
                                            <View style={styles.badgeProgressTrack}>
                                                <View
                                                    style={[
                                                        styles.badgeProgressFill,
                                                        { width: `${badge.progress}%`, backgroundColor: badge.earned ? badge.color : '#5A5A72' },
                                                    ]}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.prHighlightsList}>
                                {personalHighlights.map((highlight) => (
                                    <View key={highlight.id} style={styles.prHighlightItem}>
                                        <View style={styles.prHighlightIconWrap}>
                                            <MaterialCommunityIcons name={highlight.icon} size={13} color="#00E5BE" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.prHighlightLabel}>{highlight.label}</Text>
                                            <Text style={styles.prHighlightValue}>{highlight.value}</Text>
                                            <Text style={styles.prHighlightMeta}>{highlight.meta}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                ) : null}

                <View style={styles.modeSwitchWrap}>
                    {VIEW_MODES.map((mode) => {
                        const isActive = viewMode === mode.key;
                        return (
                            <TouchableOpacity
                                key={mode.key}
                                activeOpacity={0.85}
                                style={[styles.modePill, isActive && styles.modePillActive]}
                                onPress={() => {
                                    setViewMode(mode.key);
                                    setExpandedSessionId(null);
                                }}
                            >
                                <MaterialCommunityIcons
                                    name={mode.icon}
                                    size={13}
                                    color={isActive ? '#041018' : '#7A7A93'}
                                />
                                <Text style={[styles.modePillText, isActive && styles.modePillTextActive]}>{mode.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {loadingRecords ? <LoadingState /> : null}
                {showEmpty ? <EmptyState signedIn={!!user?.id} /> : null}

                {!loadingRecords && !showEmpty && viewMode === 'timeline' ? (
                    <View style={styles.sectionWrap}>
                        {timelineItems.map((item) => {
                            if (item.type === 'week') {
                                return (
                                    <View key={item.key} style={styles.timelineWeekHeader}>
                                        <View style={styles.timelineWeekLine} />
                                        <Text style={styles.timelineWeekText}>{item.label}</Text>
                                    </View>
                                );
                            }

                            if (item.type === 'day') {
                                return (
                                    <View key={item.key} style={styles.timelineDayHeader}>
                                        <View>
                                            <Text style={styles.timelineDayTitle}>{item.label}</Text>
                                            <Text style={styles.timelineDayMeta}>{item.totals.sessionCount} sessions</Text>
                                        </View>
                                        <View style={styles.timelineDayChips}>
                                            <Text style={styles.timelineDayChip}>{item.totals.totalExercises} ex</Text>
                                            <Text style={styles.timelineDayChip}>{Math.round(item.totals.totalCaloriesBurned)} kcal</Text>
                                            <Text style={styles.timelineDayChip}>{formatDuration(item.totals.totalDurationSeconds)}</Text>
                                        </View>
                                    </View>
                                );
                            }

                            return (
                                <SessionCard
                                    key={item.key}
                                    session={item.session}
                                    index={item.sessionIndex}
                                    showDate={false}
                                    isExpanded={expandedSessionId === item.session.id}
                                    onToggle={() => setExpandedSessionId((prev) => (prev === item.session.id ? null : item.session.id))}
                                    onViewDetails={() => handleViewSession(item.session)}
                                />
                            );
                        })}
                    </View>
                ) : null}

                {!loadingRecords && !showEmpty && viewMode === 'monthly' ? (
                    <View style={styles.sectionWrap}>
                        {monthlyGroups.map((monthGroup) => (
                            <View key={monthGroup.key} style={styles.monthCard}>
                                <Text style={styles.monthTitle}>{monthGroup.label}</Text>

                                {monthGroup.days.map((day) => {
                                    const isOpen = expandedDayKey === day.key;
                                    return (
                                        <View key={day.key} style={styles.monthDayBlock}>
                                            <TouchableOpacity
                                                activeOpacity={0.85}
                                                style={styles.monthDayHeader}
                                                onPress={() => setExpandedDayKey((prev) => (prev === day.key ? null : day.key))}
                                            >
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.monthDayTitle}>{day.label}</Text>
                                                    <Text style={styles.monthDayMeta}>{day.totals.sessionCount} session{day.totals.sessionCount === 1 ? '' : 's'}</Text>
                                                </View>
                                                <View style={styles.monthDayChips}>
                                                    <Text style={styles.monthDayChip}>{day.totals.totalExercises} ex</Text>
                                                    <Text style={styles.monthDayChip}>{Math.round(day.totals.totalCaloriesBurned)} kcal</Text>
                                                    <Text style={styles.monthDayChip}>{formatDuration(day.totals.totalDurationSeconds)}</Text>
                                                </View>
                                                <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={14} color="#77778F" />
                                            </TouchableOpacity>

                                            {isOpen ? (
                                                <View style={styles.monthDaySessions}>
                                                    {day.sessions.map((session, index) => (
                                                        <SessionCard
                                                            key={session.id}
                                                            session={session}
                                                            index={index}
                                                            showDate={false}
                                                            isExpanded={expandedSessionId === session.id}
                                                            onToggle={() =>
                                                                setExpandedSessionId((prev) => (prev === session.id ? null : session.id))
                                                            }
                                                            onViewDetails={() => handleViewSession(session)}
                                                        />
                                                    ))}
                                                </View>
                                            ) : null}
                                        </View>
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                ) : null}

                {!loadingRecords && !showEmpty && viewMode === 'heatmap' ? (
                    <View style={styles.sectionWrap}>
                        <View style={styles.heatmapCard}>
                            <Calendar
                                markingType="custom"
                                markedDates={heatmapMarkedDates}
                                onDayPress={(day) => {
                                    setSelectedDate((prev) => (prev === day.dateString ? '' : day.dateString));
                                    setExpandedSessionId(null);
                                }}
                                theme={{
                                    backgroundColor: 'transparent',
                                    calendarBackground: 'transparent',
                                    textSectionTitleColor: '#444',
                                    selectedDayBackgroundColor: '#FF4D2E',
                                    selectedDayTextColor: '#fff',
                                    todayTextColor: '#FF4D2E',
                                    dayTextColor: '#EFEFEF',
                                    textDisabledColor: '#333',
                                    dotColor: '#FF4D2E',
                                    selectedDotColor: '#fff',
                                    arrowColor: '#FF4D2E',
                                    monthTextColor: '#fff',
                                    textDayFontWeight: '600',
                                    textMonthFontWeight: '900',
                                    textDayHeaderFontWeight: '700',
                                    textDayFontSize: 13,
                                    textMonthFontSize: 16,
                                    textDayHeaderFontSize: 11,
                                }}
                            />

                            <View style={styles.heatLegendRow}>
                                <Text style={styles.heatLegendLabel}>Less</Text>
                                <View style={styles.heatLegendScale}>
                                    <View style={[styles.heatLegendBox, { backgroundColor: 'rgba(255,77,46,0.2)' }]} />
                                    <View style={[styles.heatLegendBox, { backgroundColor: 'rgba(255,77,46,0.4)' }]} />
                                    <View style={[styles.heatLegendBox, { backgroundColor: 'rgba(255,77,46,0.6)' }]} />
                                    <View style={[styles.heatLegendBox, { backgroundColor: '#FF4D2E' }]} />
                                </View>
                                <Text style={styles.heatLegendLabel}>More</Text>
                            </View>
                        </View>

                        <View style={styles.heatmapDayHeader}>
                            <Text style={styles.heatmapDayTitle}>
                                {selectedDate ? `Sessions on ${selectedDate}` : 'Tap a day to open sessions'}
                            </Text>
                            {selectedDate ? (
                                <TouchableOpacity onPress={() => setSelectedDate('')}>
                                    <Feather name="x" size={14} color="#77778F" />
                                </TouchableOpacity>
                            ) : null}
                        </View>

                        {selectedDate ? (
                            heatmapSessions.length > 0 ? (
                                heatmapSessions.map((session, index) => (
                                    <SessionCard
                                        key={session.id}
                                        session={session}
                                        index={index}
                                        isExpanded={expandedSessionId === session.id}
                                        onToggle={() => setExpandedSessionId((prev) => (prev === session.id ? null : session.id))}
                                        onViewDetails={() => handleViewSession(session)}
                                    />
                                ))
                            ) : (
                                <View style={styles.dayEmptyState}>
                                    <Text style={styles.dayEmptyText}>No sessions on this date.</Text>
                                </View>
                            )
                        ) : null}
                    </View>
                ) : null}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0F',
    },
    scrollContent: {
        paddingBottom: 100,
    },

    topGradient: {
        paddingHorizontal: 22,
        paddingBottom: 24,
    },
    pageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingTop: 12,
        paddingBottom: 20,
    },
    pageBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 4,
    },
    pageBadgeText: {
        color: '#FF4D2E',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    pageTitle: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -0.8,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(255,184,0,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255,184,0,0.25)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    streakText: {
        color: '#FFB800',
        fontSize: 12,
        fontWeight: '700',
    },

    statsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 10,
        alignItems: 'center',
        gap: 5,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
    },
    statIconBg: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    statLabel: {
        color: '#555',
        fontSize: 8,
        fontWeight: '800',
        letterSpacing: 1.2,
    },

    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginHorizontal: 20,
        marginTop: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: 'rgba(255,77,46,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,77,46,0.2)',
    },
    errorBannerText: {
        flex: 1,
        color: '#FF9A86',
        fontSize: 12,
        fontWeight: '500',
    },

    insightsWrap: {
        marginTop: 16,
        paddingHorizontal: 20,
        gap: 10,
    },
    insightCard: {
        backgroundColor: '#16161A',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        padding: 12,
        gap: 10,
    },
    insightHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
    },
    insightTitle: {
        color: '#F1F1FA',
        fontSize: 14,
        fontWeight: '800',
    },
    insightSubtitle: {
        color: '#7A7A93',
        fontSize: 10,
        marginTop: 2,
    },
    weeklyActiveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(0,229,190,0.12)',
        borderColor: 'rgba(0,229,190,0.25)',
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    weeklyActiveBadgeText: {
        color: '#00E5BE',
        fontSize: 10,
        fontWeight: '700',
    },
    weeklyMetricRow: {
        flexDirection: 'row',
        gap: 8,
    },
    weeklyMetricCard: {
        flex: 1,
        backgroundColor: '#111116',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.04)',
        paddingVertical: 10,
        paddingHorizontal: 8,
        alignItems: 'center',
        gap: 3,
    },
    weeklyMetricIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 1,
    },
    weeklyMetricValue: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    weeklyMetricLabel: {
        color: '#8A8AA2',
        fontSize: 10,
        fontWeight: '600',
    },
    weeklyDeltaBadge: {
        marginTop: 3,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 999,
    },
    weeklyDeltaUp: {
        backgroundColor: 'rgba(45,212,191,0.12)',
    },
    weeklyDeltaDown: {
        backgroundColor: 'rgba(248,113,113,0.12)',
    },
    weeklyDeltaFlat: {
        backgroundColor: 'rgba(138,138,162,0.16)',
    },
    weeklyDeltaText: {
        fontSize: 9,
        fontWeight: '700',
    },
    weeklyDeltaTextUp: {
        color: '#2DD4BF',
    },
    weeklyDeltaTextDown: {
        color: '#F87171',
    },
    weeklyDeltaTextFlat: {
        color: '#9A9AB2',
    },
    weeklyBarsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 6,
        paddingTop: 2,
    },
    weeklyBarItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    weeklyBarTrack: {
        width: 16,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#101015',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'flex-end',
        padding: 2,
    },
    weeklyBarFill: {
        width: '100%',
        borderRadius: 6,
        backgroundColor: '#FF4D2E',
    },
    weeklyBarValue: {
        color: '#C7C7D8',
        fontSize: 9,
        fontWeight: '700',
    },
    weeklyBarLabel: {
        color: '#6F6F86',
        fontSize: 9,
        fontWeight: '600',
    },
    trendRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 12,
    },
    trendCard: {
        flex: 1,
        backgroundColor: '#15151B',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        padding: 12,
    },
    trendIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    trendValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
    },
    trendLabel: {
        color: '#7B7B8F',
        fontSize: 10,
        fontWeight: '700',
        marginTop: 2,
        letterSpacing: 1.1,
    },
    trendDeltaPill: {
        alignSelf: 'flex-start',
        marginTop: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    trendDeltaUp: {
        backgroundColor: 'rgba(45,212,191,0.15)',
    },
    trendDeltaDown: {
        backgroundColor: 'rgba(248,113,113,0.15)',
    },
    trendDeltaFlat: {
        backgroundColor: 'rgba(138,138,162,0.18)',
    },
    trendDeltaText: {
        fontSize: 10,
        fontWeight: '800',
    },
    trendDeltaTextUp: {
        color: '#2DD4BF',
    },
    trendDeltaTextDown: {
        color: '#F87171',
    },
    trendDeltaTextFlat: {
        color: '#8A8AA2',
    },
    monthlyTrendChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#111116',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    monthlyTrendText: {
        fontSize: 10,
        fontWeight: '700',
    },
    monthlyTrendTextUp: {
        color: '#2DD4BF',
    },
    monthlyTrendTextDown: {
        color: '#F87171',
    },
    monthlyTrendTextFlat: {
        color: '#8A8AA2',
    },
    monthlyTotalsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    monthlyTotalCard: {
        width: '48%',
        backgroundColor: '#111116',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    monthlyTotalValue: {
        color: '#F2F2FB',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: -0.2,
    },
    monthlyTotalLabel: {
        color: '#6F6F86',
        fontSize: 10,
        marginTop: 2,
    },
    monthlyWeeksRow: {
        flexDirection: 'row',
        gap: 6,
    },
    monthlyWeekPill: {
        flex: 1,
        backgroundColor: '#111116',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        paddingVertical: 7,
        paddingHorizontal: 7,
        alignItems: 'center',
    },
    monthlyWeekPillBest: {
        borderColor: 'rgba(0,229,190,0.4)',
        backgroundColor: 'rgba(0,229,190,0.08)',
    },
    monthlyWeekKey: {
        color: '#B3B3C8',
        fontSize: 10,
        fontWeight: '700',
    },
    monthlyWeekKeyBest: {
        color: '#00E5BE',
    },
    monthlyWeekWorkouts: {
        color: '#E9E9F6',
        fontSize: 11,
        fontWeight: '800',
        marginTop: 1,
    },
    monthlyWeekWorkoutsBest: {
        color: '#B2FFF0',
    },
    monthlyWeekRange: {
        color: '#6A6A84',
        fontSize: 8,
        marginTop: 1,
    },
    streakMiniChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(255,184,0,0.24)',
        backgroundColor: 'rgba(255,184,0,0.1)',
    },
    streakMiniText: {
        color: '#FFB800',
        fontSize: 10,
        fontWeight: '700',
    },
    badgesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    badgeItem: {
        width: '48%',
        borderRadius: 12,
        borderWidth: 1,
        padding: 8,
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    badgeItemEarned: {
        borderColor: 'rgba(0,229,190,0.2)',
        backgroundColor: 'rgba(0,229,190,0.08)',
    },
    badgeItemLocked: {
        borderColor: 'rgba(255,255,255,0.05)',
        backgroundColor: '#111116',
    },
    badgeIconWrap: {
        width: 26,
        height: 26,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeName: {
        color: '#EDEDF8',
        fontSize: 10,
        fontWeight: '700',
    },
    badgeNameLocked: {
        color: '#9B9BB3',
    },
    badgeProgressText: {
        color: '#767690',
        fontSize: 9,
        marginTop: 1,
    },
    badgeProgressTrack: {
        marginTop: 4,
        height: 4,
        width: '100%',
        borderRadius: 4,
        backgroundColor: '#212132',
        overflow: 'hidden',
    },
    badgeProgressFill: {
        height: '100%',
        borderRadius: 4,
    },
    prHighlightsList: {
        gap: 7,
        marginTop: 2,
    },
    prHighlightItem: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        backgroundColor: '#111116',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    prHighlightIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,229,190,0.12)',
    },
    prHighlightLabel: {
        color: '#9B9BB1',
        fontSize: 10,
        fontWeight: '600',
    },
    prHighlightValue: {
        color: '#F2F2FA',
        fontSize: 12,
        fontWeight: '700',
        marginTop: 1,
    },
    prHighlightMeta: {
        color: '#676780',
        fontSize: 9,
        marginTop: 1,
    },

    modeSwitchWrap: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 16,
        gap: 8,
    },
    modePill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#16161A',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    modePillActive: {
        backgroundColor: '#00E5BE',
        borderColor: 'rgba(0,229,190,0.65)',
    },
    modePillText: {
        color: '#7A7A93',
        fontSize: 11,
        fontWeight: '700',
    },
    modePillTextActive: {
        color: '#041018',
    },

    sectionWrap: {
        marginTop: 16,
        paddingHorizontal: 20,
        gap: 10,
    },

    timelineWeekHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 10,
        marginBottom: 4,
    },
    timelineWeekLine: {
        width: 16,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    timelineWeekText: {
        color: '#5E5E75',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.4,
    },
    timelineDayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#131318',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 2,
    },
    timelineDayTitle: {
        color: '#EDEDF6',
        fontSize: 12,
        fontWeight: '700',
    },
    timelineDayMeta: {
        color: '#6D6D84',
        fontSize: 10,
        marginTop: 1,
    },
    timelineDayChips: {
        flexDirection: 'row',
        gap: 6,
    },
    timelineDayChip: {
        color: '#8A8AA2',
        fontSize: 10,
        fontWeight: '600',
    },

    monthCard: {
        backgroundColor: '#16161A',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        padding: 12,
        gap: 8,
    },
    monthTitle: {
        color: '#F1F1FA',
        fontSize: 14,
        fontWeight: '800',
    },
    monthDayBlock: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        paddingTop: 8,
        gap: 8,
    },
    monthDayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    monthDayTitle: {
        color: '#E7E7F2',
        fontSize: 12,
        fontWeight: '700',
    },
    monthDayMeta: {
        color: '#74748D',
        fontSize: 10,
        marginTop: 2,
    },
    monthDayChips: {
        alignItems: 'flex-end',
        gap: 2,
    },
    monthDayChip: {
        color: '#8A8AA2',
        fontSize: 10,
        fontWeight: '600',
    },
    monthDaySessions: {
        gap: 8,
        paddingTop: 2,
    },

    heatmapCard: {
        backgroundColor: '#16161A',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        padding: 10,
    },
    heatLegendRow: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    heatLegendScale: {
        flexDirection: 'row',
        gap: 4,
    },
    heatLegendBox: {
        width: 14,
        height: 10,
        borderRadius: 3,
    },
    heatLegendLabel: {
        color: '#6E6E86',
        fontSize: 10,
    },
    heatmapDayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    heatmapDayTitle: {
        color: '#B2B2C6',
        fontSize: 12,
        fontWeight: '600',
    },
    dayEmptyState: {
        backgroundColor: '#16161A',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        paddingVertical: 16,
        alignItems: 'center',
    },
    dayEmptyText: {
        color: '#7A7A93',
        fontSize: 12,
    },

    sessionCard: {
        backgroundColor: '#16161A',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
    },
    sessionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 12,
        paddingRight: 12,
    },
    sessionAccent: {
        width: 4,
        height: '62%',
        borderRadius: 3,
        marginLeft: 10,
    },
    sessionIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sessionMainInfo: {
        flex: 1,
    },
    sessionTitle: {
        color: '#EFEFEF',
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 1,
    },
    sessionDate: {
        color: '#666681',
        fontSize: 10,
    },
    sessionSummaryCol: {
        alignItems: 'flex-end',
        gap: 2,
    },
    sessionSummaryText: {
        color: '#7E7E96',
        fontSize: 10,
        fontWeight: '600',
    },
    sessionChevronWrap: {
        width: 24,
        height: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },

    exerciseListWrap: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 10,
        paddingVertical: 8,
        gap: 8,
    },
    sessionDetailBtn: {
        marginTop: 6,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,229,190,0.35)',
        backgroundColor: 'rgba(0,229,190,0.1)',
    },
    sessionDetailBtnText: {
        color: '#00E5BE',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.4,
    },
    exerciseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
    },
    exerciseIndexBubble: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    exerciseIndexText: {
        color: '#D9D9E8',
        fontSize: 10,
        fontWeight: '700',
    },
    exerciseName: {
        color: '#EFEFEF',
        fontSize: 12,
        fontWeight: '700',
    },
    exerciseMeta: {
        color: '#707087',
        fontSize: 10,
        marginTop: 1,
    },
    sessionEmptyText: {
        color: '#7A7A93',
        fontSize: 12,
    },

    emptyState: {
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 30,
        gap: 10,
    },
    emptyIconBg: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: 'rgba(255,77,46,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,77,46,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    emptyTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '900',
    },
    emptySubtext: {
        color: '#55556E',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
    },
});
