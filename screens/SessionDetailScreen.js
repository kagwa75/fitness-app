import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const formatDuration = (totalSeconds) => {
    const safeSeconds = Math.max(0, Math.round(toNumber(totalSeconds, 0)));
    const minutes = Math.round(safeSeconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins ? `${hours}h ${mins}m` : `${hours}h`;
};

export default function SessionDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const session = route.params?.session || {};
    const summary = session.summary || {};
    const exercises = Array.isArray(session.exercises) ? session.exercises : [];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Feather name="chevron-left" size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Session Detail</Text>
                </View>
            </SafeAreaView>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Workout Summary</Text>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <MaterialCommunityIcons name="dumbbell" size={16} color="#FF4D2E" />
                            <Text style={styles.summaryValue}>{toNumber(summary.totalExercises, 0)}</Text>
                            <Text style={styles.summaryLabel}>Exercises</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <MaterialCommunityIcons name="clock-outline" size={16} color="#00E5BE" />
                            <Text style={styles.summaryValue}>{formatDuration(summary.totalDurationSeconds)}</Text>
                            <Text style={styles.summaryLabel}>Time</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <MaterialCommunityIcons name="fire" size={16} color="#6C63FF" />
                            <Text style={styles.summaryValue}>{Math.round(toNumber(summary.totalCaloriesBurned, 0))}</Text>
                            <Text style={styles.summaryLabel}>Kcal</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.exerciseCard}>
                    <Text style={styles.exerciseTitle}>Exercises</Text>
                    {exercises.length === 0 ? (
                        <Text style={styles.emptyText}>No exercise details available.</Text>
                    ) : (
                        exercises.map((exercise, index) => (
                            <View key={exercise.id || `${exercise.name}-${index}`} style={styles.exerciseRow}>
                                <View style={styles.exerciseIndex}>
                                    <Text style={styles.exerciseIndexText}>{index + 1}</Text>
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
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0F',
    },
    safeArea: {
        backgroundColor: '#0D0D0F',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 8,
        gap: 10,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    scroll: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    summaryCard: {
        marginTop: 12,
        backgroundColor: '#15151B',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        padding: 16,
    },
    summaryTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '800',
        marginBottom: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryItem: {
        alignItems: 'center',
        flex: 1,
        gap: 4,
    },
    summaryValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
    },
    summaryLabel: {
        color: '#7A7A93',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },
    exerciseCard: {
        marginTop: 14,
        backgroundColor: '#15151B',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        padding: 16,
        gap: 10,
    },
    exerciseTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '800',
    },
    emptyText: {
        color: '#7A7A93',
        fontSize: 12,
    },
    exerciseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    exerciseIndex: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    exerciseIndexText: {
        color: '#CFCFE2',
        fontSize: 11,
        fontWeight: '700',
    },
    exerciseName: {
        color: '#EFEFEF',
        fontSize: 12,
        fontWeight: '700',
    },
    exerciseMeta: {
        color: '#77778F',
        fontSize: 10,
        marginTop: 2,
    },
});
