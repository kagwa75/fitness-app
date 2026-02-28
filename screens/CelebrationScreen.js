import { useNavigation, useRoute } from '@react-navigation/native';
import { useMemo, useRef, useEffect } from 'react';
import { Animated, Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const CONFETTI_COLORS = ['#FF4D2E', '#00E5BE', '#FFB800', '#6C63FF', '#00C2FF', '#FF4D8C'];

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const formatDuration = (secondsInput) => {
    const totalSeconds = Math.max(0, Math.round(toNumber(secondsInput, 0)));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins ? `${hours}h ${mins}m` : `${hours}h`;
    }

    if (minutes > 0) {
        return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
    }

    return `${seconds}s`;
};

const buildPieces = (count = 70) =>
    Array.from({ length: count }).map((_, index) => ({
        id: `confetti-${index}`,
        startX: Math.random() * width,
        drift: (Math.random() - 0.5) * 180,
        rotate: (Math.random() > 0.5 ? 1 : -1) * (140 + Math.random() * 320),
        size: 6 + Math.random() * 8,
        duration: 1700 + Math.random() * 1300,
        delay: Math.random() * 450,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    }));

const ConfettiPiece = ({ piece, burstKey }) => {
    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        progress.setValue(0);
        Animated.timing(progress, {
            toValue: 1,
            duration: piece.duration,
            delay: piece.delay,
            useNativeDriver: true,
        }).start();
    }, [burstKey, piece.delay, piece.duration, progress]);

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                styles.confetti,
                {
                    width: piece.size,
                    height: piece.size * 1.6,
                    backgroundColor: piece.color,
                    transform: [
                        {
                            translateX: progress.interpolate({
                                inputRange: [0, 1],
                                outputRange: [piece.startX, piece.startX + piece.drift],
                            }),
                        },
                        {
                            translateY: progress.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-80, height + 100],
                            }),
                        },
                        {
                            rotate: progress.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', `${piece.rotate}deg`],
                            }),
                        },
                    ],
                    opacity: progress.interpolate({
                        inputRange: [0, 0.12, 0.85, 1],
                        outputRange: [0, 1, 1, 0],
                    }),
                },
            ]}
        />
    );
};

const SummaryChip = ({ icon, label, value, accent }) => (
    <View style={styles.summaryChip}>
        <View style={[styles.summaryIconWrap, { backgroundColor: `${accent}26` }]}>
            <MaterialCommunityIcons name={icon} size={16} color={accent} />
        </View>
        <Text style={styles.summaryValue}>{value}</Text>
        <Text style={styles.summaryLabel}>{label}</Text>
    </View>
);

const CelebrationScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const burstKey = useRef(Date.now()).current;
    const pieces = useMemo(() => buildPieces(72), []);

    const summary = route.params?.summary || {};
    const personalRecords = Array.isArray(route.params?.personalRecords) ? route.params.personalRecords : [];
    const dayName = route.params?.dayName;
    const dayNumber = route.params?.dayNumber;
    const totalDays = route.params?.totalDays;

    const totalExercises = Math.max(0, Math.round(toNumber(summary.totalExercises, 0)));
    const totalCalories = Math.max(0, Math.round(toNumber(summary.totalCaloriesBurned, 0)));
    const totalDurationSeconds = Math.max(0, Math.round(toNumber(summary.totalDurationSeconds, 0)));
    const totalPrs = personalRecords.length;

    const completionLabel =
        Number.isInteger(dayNumber) && Number.isInteger(totalDays)
            ? `Day ${dayNumber} of ${totalDays} completed`
            : 'Workout completed';

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#09090C', '#101017', '#171421']} style={StyleSheet.absoluteFillObject} />

            <View style={styles.confettiLayer} pointerEvents="none">
                {pieces.map((piece) => (
                    <ConfettiPiece key={piece.id} piece={piece} burstKey={burstKey} />
                ))}
            </View>

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    <View style={styles.badge}>
                        <MaterialCommunityIcons name="party-popper" size={14} color="#FFB800" />
                        <Text style={styles.badgeText}>WORKOUT COMPLETE</Text>
                    </View>

                    <Text style={styles.title}>You Crushed It</Text>
                    <Text style={styles.subtitle}>{dayName || completionLabel}</Text>
                    {dayName ? <Text style={styles.dayProgressText}>{completionLabel}</Text> : null}

                    <View style={styles.summaryRow}>
                        <SummaryChip icon="clock-outline" label="Total Time" value={formatDuration(totalDurationSeconds)} accent="#00E5BE" />
                        <SummaryChip icon="dumbbell" label="Exercises" value={totalExercises} accent="#FF4D2E" />
                    </View>
                    <View style={styles.summaryRow}>
                        <SummaryChip icon="fire" label="Calories" value={`${totalCalories} kcal`} accent="#FFB800" />
                        <SummaryChip icon="trophy-outline" label="PR Broken" value={totalPrs} accent="#6C63FF" />
                    </View>

                    <View style={styles.prCard}>
                        <Text style={styles.prTitle}>Personal Records</Text>
                        {totalPrs > 0 ? (
                            personalRecords.map((record, index) => (
                                <View key={`${record}-${index}`} style={styles.prRow}>
                                    <Feather name="award" size={13} color="#FFB800" />
                                    <Text style={styles.prText}>{record}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.prEmptyText}>
                                No record broken this time. Keep pushing.
                            </Text>
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('App', { screen: 'Records' })}
                        activeOpacity={0.9}
                        style={styles.primaryBtnWrapper}
                    >
                        <LinearGradient
                            colors={['#FF4D2E', '#FF2800']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.primaryBtn}
                        >
                            <MaterialCommunityIcons name="chart-line-variant" size={18} color="#fff" />
                            <Text style={styles.primaryBtnText}>View Records</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('App', { screen: 'Main' })}
                        activeOpacity={0.85}
                        style={styles.secondaryBtn}
                    >
                        <Text style={styles.secondaryBtnText}>Back to Home</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
};

export default CelebrationScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0F',
    },
    safeArea: {
        flex: 1,
    },
    confettiLayer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    confetti: {
        position: 'absolute',
        top: -80,
        borderRadius: 2,
    },
    content: {
        flex: 1,
        paddingHorizontal: 22,
        paddingTop: 24,
        paddingBottom: 20,
    },
    badge: {
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,184,0,0.14)',
        borderWidth: 1,
        borderColor: 'rgba(255,184,0,0.28)',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 24,
        marginBottom: 16,
    },
    badgeText: {
        color: '#FFB800',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.4,
    },
    title: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 42,
        fontWeight: '900',
        letterSpacing: -1,
    },
    subtitle: {
        color: '#D9D9EA',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '700',
        marginTop: 6,
    },
    dayProgressText: {
        color: '#82829D',
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '500',
        marginTop: 4,
    },
    summaryRow: {
        marginTop: 14,
        flexDirection: 'row',
        gap: 10,
    },
    summaryChip: {
        flex: 1,
        minHeight: 94,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.04)',
        paddingHorizontal: 12,
        paddingVertical: 10,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    summaryIconWrap: {
        width: 30,
        height: 30,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    summaryValue: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: -0.4,
    },
    summaryLabel: {
        color: '#8A8AA4',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.1,
    },
    prCard: {
        marginTop: 18,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.04)',
        paddingHorizontal: 14,
        paddingVertical: 14,
        gap: 8,
    },
    prTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 0.4,
        marginBottom: 2,
    },
    prRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    prText: {
        color: '#E7E7F2',
        fontSize: 13,
        fontWeight: '600',
    },
    prEmptyText: {
        color: '#8A8AA4',
        fontSize: 13,
        fontWeight: '500',
    },
    primaryBtnWrapper: {
        marginTop: 20,
        borderRadius: 16,
        overflow: 'hidden',
    },
    primaryBtn: {
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 9,
    },
    primaryBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '900',
        letterSpacing: 0.8,
    },
    secondaryBtn: {
        marginTop: 10,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.04)',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryBtnText: {
        color: '#CACADD',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.6,
    },
});
