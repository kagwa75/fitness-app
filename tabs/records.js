import {
    FlatList,
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    Animated,
    StatusBar,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FitnessItems } from '../Context';
import { useContext, useState, useRef, useEffect } from 'react';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ACCENTS = ['#FF4D2E', '#00E5BE', '#6C63FF', '#FFB800', '#FF4D8C', '#00C2FF'];

// ── Animated stat card ────────────────────────────────────────
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
        <Animated.View
            style={[styles.statCard, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}
        >
            <View style={[styles.statIconBg, { backgroundColor: accentColor + '20' }]}>
                <MaterialCommunityIcons name={icon} size={16} color={accentColor} />
            </View>
            <Text style={[styles.statValue, { color: accentColor }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </Animated.View>
    );
};

// ── Workout history row ───────────────────────────────────────
const WorkoutRow = ({ item, index }) => {
    const slideAnim = useRef(new Animated.Value(20)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const accent = ACCENTS[index % ACCENTS.length];

    useEffect(() => {
        Animated.sequence([
            Animated.delay(index * 60),
            Animated.parallel([
                Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
                Animated.timing(opacityAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
            ]),
        ]).start();
    }, []);

    const name = item?.name || item;
    const date = item?.date;
    const calories = item?.caloriesBurned;
    const duration = item?.duration;

    return (
        <Animated.View
            style={[styles.workoutRow, { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }]}
        >
            <View style={[styles.rowAccent, { backgroundColor: accent }]} />
            <View style={[styles.rowIconBg, { backgroundColor: accent + '18' }]}>
                <MaterialCommunityIcons name="dumbbell" size={16} color={accent} />
            </View>
            <View style={styles.rowInfo}>
                <Text style={styles.rowName} numberOfLines={1}>{name}</Text>
                {date && <Text style={styles.rowDate}>{date}</Text>}
            </View>
            <View style={styles.rowStats}>
                {calories && (
                    <View style={styles.rowStatChip}>
                        <Feather name="zap" size={9} color="#555" />
                        <Text style={styles.rowStatText}>{Math.round(calories)} kcal</Text>
                    </View>
                )}
                {duration && (
                    <View style={styles.rowStatChip}>
                        <Feather name="clock" size={9} color="#555" />
                        <Text style={styles.rowStatText}>{duration}s</Text>
                    </View>
                )}
            </View>
            <View style={[styles.rowCheckBg, { backgroundColor: accent + '18' }]}>
                <Feather name="check" size={13} color={accent} />
            </View>
        </Animated.View>
    );
};

// ── Empty state ───────────────────────────────────────────────
const EmptyState = () => {
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
            <Text style={styles.emptyTitle}>No workouts yet</Text>
            <Text style={styles.emptySubtext}>
                Complete your first session to start building your history
            </Text>
            <View style={styles.emptyHint}>
                <Feather name="arrow-down-left" size={12} color="#FF4D2E" />
                <Text style={styles.emptyHintText}>Head to the Home tab to get started</Text>
            </View>
        </View>
    );
};

// ── Main screen ───────────────────────────────────────────────
export default function Records() {
    const { calories, minutes, workout, completed } = useContext(FitnessItems);
    const [selectedDate, setSelectedDate] = useState('');
    const [calendarOpen, setCalendarOpen] = useState(true);

    const calendarHeight = useRef(new Animated.Value(1)).current;
    const headerFadeAnim = useRef(new Animated.Value(0)).current;
    const headerYAnim = useRef(new Animated.Value(-16)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(headerFadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(headerYAnim, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
        ]).start();
    }, []);

    const toggleCalendar = () => {
        Animated.spring(calendarHeight, {
            toValue: calendarOpen ? 0 : 1,
            tension: 60,
            friction: 12,
            useNativeDriver: false,
        }).start();
        setCalendarOpen(!calendarOpen);
    };

    // Build marked dates from completed workouts
    const markedDates = completed.reduce((acc, item) => {
        const date = item?.date || item;
        if (typeof date === 'string' && date.match(/\d{4}-\d{2}-\d{2}/)) {
            acc[date] = {
                marked: true,
                selected: selectedDate === date,
                selectedColor: '#FF4D2E',
                dotColor: selectedDate === date ? '#fff' : '#FF4D2E',
            };
        }
        return acc;
    }, {});

    const workoutsOnDate = completed.filter((item) => (item?.date || item) === selectedDate);
    const displayList = selectedDate && workoutsOnDate.length > 0 ? workoutsOnDate : completed;

    const streakCount = Object.keys(markedDates).length;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <FlatList
                data={displayList}
                keyExtractor={(_, i) => i.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<EmptyState />}
                renderItem={({ item, index }) => (
                    <WorkoutRow item={item} index={index} />
                )}
                ListHeaderComponent={
                    <View>
                        {/* Top header */}
                        <LinearGradient
                            colors={['#0D0D0F', '#131318']}
                            style={styles.topGradient}
                        >
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
                                    {streakCount > 0 && (
                                        <View style={styles.streakBadge}>
                                            <MaterialCommunityIcons name="fire" size={14} color="#FFB800" />
                                            <Text style={styles.streakText}>{streakCount} day streak</Text>
                                        </View>
                                    )}
                                </Animated.View>

                                {/* Stat row */}
                                <View style={styles.statsRow}>
                                    <StatCard
                                        value={workout}
                                        label="WORKOUTS"
                                        icon="lightning-bolt"
                                        accentColor="#FF4D2E"
                                        delay={100}
                                    />
                                    <StatCard
                                        value={minutes}
                                        label="MINUTES"
                                        icon="clock-outline"
                                        accentColor="#00E5BE"
                                        delay={200}
                                    />
                                    <StatCard
                                        value={calories.toFixed(0)}
                                        label="KCAL"
                                        icon="fire"
                                        accentColor="#6C63FF"
                                        delay={300}
                                    />
                                </View>
                            </SafeAreaView>
                        </LinearGradient>

                        {/* Calendar section */}
                        <View style={styles.calendarSection}>
                            <TouchableOpacity
                                onPress={toggleCalendar}
                                style={styles.calendarToggleRow}
                                activeOpacity={0.8}
                            >
                                <View style={styles.sectionLabelRow}>
                                    <View style={styles.sectionDot} />
                                    <Text style={styles.sectionLabel}>WORKOUT CALENDAR</Text>
                                </View>
                                <View style={styles.toggleChevron}>
                                    <Feather
                                        name={calendarOpen ? 'chevron-up' : 'chevron-down'}
                                        size={14}
                                        color="#555"
                                    />
                                </View>
                            </TouchableOpacity>

                            <Animated.View
                                style={{
                                    maxHeight: calendarHeight.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 400],
                                    }),
                                    opacity: calendarHeight,
                                    overflow: 'hidden',
                                }}
                            >
                                <View style={styles.calendarCard}>
                                    <Calendar
                                        markedDates={markedDates}
                                        onDayPress={(day) =>
                                            setSelectedDate(
                                                selectedDate === day.dateString ? '' : day.dateString
                                            )
                                        }
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
                                    {selectedDate && (
                                        <View style={styles.selectedDateRow}>
                                            <View style={styles.selectedDateDot} />
                                            <Text style={styles.selectedDateText}>
                                                {workoutsOnDate.length > 0
                                                    ? `${workoutsOnDate.length} workout${workoutsOnDate.length > 1 ? 's' : ''} on ${selectedDate}`
                                                    : `No workouts on ${selectedDate}`}
                                            </Text>
                                            <TouchableOpacity onPress={() => setSelectedDate('')}>
                                                <Feather name="x" size={14} color="#555" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </Animated.View>
                        </View>

                        {/* History label */}
                        <View style={styles.historySectionRow}>
                            <View style={styles.sectionLabelRow}>
                                <View style={[styles.sectionDot, { backgroundColor: '#00E5BE' }]} />
                                <Text style={styles.sectionLabel}>
                                    {selectedDate && workoutsOnDate.length > 0
                                        ? `WORKOUTS ON ${selectedDate}`
                                        : 'FULL HISTORY'}
                                </Text>
                            </View>
                            {completed.length > 0 && (
                                <Text style={styles.historyCount}>{displayList.length} sessions</Text>
                            )}
                        </View>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0F',
    },
    listContent: {
        paddingBottom: 100,
    },

    // Top gradient header
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

    // Stats
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

    // Calendar section
    calendarSection: {
        marginHorizontal: 20,
        marginTop: 22,
    },
    calendarToggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },
    sectionDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FF4D2E',
    },
    sectionLabel: {
        color: '#444',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    toggleChevron: {
        width: 28,
        height: 28,
        borderRadius: 9,
        backgroundColor: '#1E1E26',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    calendarCard: {
        backgroundColor: '#16161A',
        borderRadius: 20,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: 6,
    },
    selectedDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 10,
        paddingHorizontal: 8,
        paddingVertical: 8,
        backgroundColor: '#1E1E26',
        borderRadius: 10,
    },
    selectedDateDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FF4D2E',
    },
    selectedDateText: {
        flex: 1,
        color: '#888',
        fontSize: 12,
        fontWeight: '500',
    },

    // History header
    historySectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 22,
        marginBottom: 12,
    },
    historyCount: {
        color: '#444',
        fontSize: 11,
        fontWeight: '700',
    },

    // Workout row
    workoutRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#16161A',
        borderRadius: 18,
        marginHorizontal: 20,
        marginBottom: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.04)',
        gap: 12,
        paddingVertical: 14,
        paddingRight: 14,
    },
    rowAccent: {
        width: 4,
        height: '60%',
        borderRadius: 4,
        marginLeft: 14,
    },
    rowIconBg: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    rowInfo: {
        flex: 1,
    },
    rowName: {
        color: '#EFEFEF',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: -0.2,
        textTransform: 'capitalize',
        marginBottom: 3,
    },
    rowDate: {
        color: '#444',
        fontSize: 11,
        fontWeight: '500',
    },
    rowStats: {
        alignItems: 'flex-end',
        gap: 4,
    },
    rowStatChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    rowStatText: {
        color: '#555',
        fontSize: 10,
        fontWeight: '600',
    },
    rowCheckBg: {
        width: 28,
        height: 28,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },

    // Empty
    emptyState: {
        alignItems: 'center',
        paddingTop: 60,
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
        color: '#444',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
    },
    emptyHint: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 16,
        backgroundColor: 'rgba(255,77,46,0.08)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,77,46,0.2)',
    },
    emptyHintText: {
        color: '#FF4D2E',
        fontSize: 12,
        fontWeight: '600',
    },
});