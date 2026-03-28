import { useCallback, useMemo, useState } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import axios from 'axios';
import API_BASE_URL from '../constants/api';

const MEASUREMENT_FIELDS = [
    { key: 'weight', label: 'Weight', unit: 'kg', color: '#FF4D2E', icon: 'scale-bathroom' },
    { key: 'bodyFat', label: 'Body Fat', unit: '%', color: '#00E5BE', icon: 'percent' },
    { key: 'waist', label: 'Waist', unit: 'cm', color: '#6C63FF', icon: 'ruler' },
    { key: 'chest', label: 'Chest', unit: 'cm', color: '#FFB800', icon: 'human-male' },
    { key: 'hips', label: 'Hips', unit: 'cm', color: '#00C2FF', icon: 'human-female' },
];

const toNumber = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const formatDate = (value) => {
    const date = new Date(value || Date.now());
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const formatDelta = (current, previous, unit) => {
    if (!Number.isFinite(current) || !Number.isFinite(previous)) {
        return 'No previous data';
    }

    const diff = current - previous;
    if (diff === 0) return 'No change';

    const sign = diff > 0 ? '+' : '';
    return `${sign}${diff.toFixed(1)} ${unit}`;
};

const GoalProgressBar = ({ progress, color }) => (
    <View style={styles.goalProgressTrack}>
        <View
            style={[
                styles.goalProgressFill,
                {
                    backgroundColor: color,
                    width: `${Math.max(0, Math.min(100, progress))}%`,
                },
            ]}
        />
    </View>
);

export default function BodyTrackerScreen() {
    const navigation = useNavigation();
    const { isSignedIn } = useAuth();
    const { user } = useUser();

    const [loading, setLoading] = useState(true);
    const [measurements, setMeasurements] = useState([]);
    const [goals, setGoals] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showGoalForm, setShowGoalForm] = useState(false);
    const [measurementForm, setMeasurementForm] = useState({
        measuredAt: '',
        weight: '',
        bodyFat: '',
        waist: '',
        chest: '',
        hips: '',
        notes: '',
    });
    const [goalForm, setGoalForm] = useState({});

    const loadData = useCallback(async () => {
        if (!user?.id) {
            setMeasurements([]);
            setGoals([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const [measurementsRes, goalsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/users/body-measurements`, {
                    params: { clerkUserId: user.id },
                }),
                axios.get(`${API_BASE_URL}/users/body-goals`, {
                    params: { clerkUserId: user.id },
                }),
            ]);

            const nextMeasurements = Array.isArray(measurementsRes.data) ? measurementsRes.data : [];
            const nextGoals = Array.isArray(goalsRes.data) ? goalsRes.data : [];

            setMeasurements(nextMeasurements);
            setGoals(nextGoals);

            const formSeed = {};
            nextGoals.forEach((goal) => {
                if (!goal?.metric) return;
                formSeed[goal.metric] = String(goal.targetValue || '');
            });
            setGoalForm(formSeed);
        } catch (error) {
            console.error('Failed to load body tracker data:', error);
            Alert.alert('Error', 'Could not load body tracker data.');
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const latest = measurements[0] || null;
    const previous = measurements[1] || null;

    const goalsByMetric = useMemo(() => {
        const map = {};
        goals.forEach((goal) => {
            map[goal.metric] = goal;
        });
        return map;
    }, [goals]);

    const resetMeasurementForm = () => {
        setMeasurementForm({
            measuredAt: '',
            weight: '',
            bodyFat: '',
            waist: '',
            chest: '',
            hips: '',
            notes: '',
        });
    };

    const saveMeasurement = async () => {
        if (!user?.id) return;

        const payload = {
            clerkUserId: user.id,
            measuredAt: measurementForm.measuredAt || undefined,
            weight: toNumber(measurementForm.weight),
            bodyFat: toNumber(measurementForm.bodyFat),
            waist: toNumber(measurementForm.waist),
            chest: toNumber(measurementForm.chest),
            hips: toNumber(measurementForm.hips),
            notes: measurementForm.notes.trim() || undefined,
        };

        const hasValue = ['weight', 'bodyFat', 'waist', 'chest', 'hips'].some(
            (key) => payload[key] != null
        );

        if (!hasValue) {
            Alert.alert('Missing values', 'Enter at least one measurement value.');
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/users/body-measurements`, payload);
            resetMeasurementForm();
            setShowAddForm(false);
            loadData();
        } catch (error) {
            console.error('Failed to save measurement:', error);
            Alert.alert('Error', 'Could not save measurement.');
        }
    };

    const saveGoals = async () => {
        if (!user?.id) return;

        const goalsPayload = MEASUREMENT_FIELDS.map((field) => {
            const raw = goalForm[field.key];
            const value = Number(raw);
            if (!Number.isFinite(value) || value <= 0) return null;

            const current = latest?.[field.key];
            const currentNumber = Number.isFinite(Number(current)) ? Number(current) : null;
            return {
                metric: field.key,
                targetValue: value,
                startValue: currentNumber,
            };
        }).filter(Boolean);

        if (!goalsPayload.length) {
            Alert.alert('Missing goals', 'Set at least one target value.');
            return;
        }

        try {
            await axios.put(`${API_BASE_URL}/users/body-goals`, {
                clerkUserId: user.id,
                goals: goalsPayload,
            });
            setShowGoalForm(false);
            loadData();
        } catch (error) {
            console.error('Failed to save goals:', error);
            Alert.alert('Error', 'Could not save goals.');
        }
    };

    const deleteMeasurement = (measurementId) => {
        if (!user?.id) return;

        Alert.alert('Delete entry', 'Remove this measurement entry?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await axios.delete(`${API_BASE_URL}/users/body-measurements/${measurementId}`, {
                            data: { clerkUserId: user.id },
                        });
                        loadData();
                    } catch (error) {
                        console.error('Failed to delete measurement:', error);
                        Alert.alert('Error', 'Could not delete measurement.');
                    }
                },
            },
        ]);
    };

    const deleteGoal = async (metric) => {
        if (!user?.id) return;
        try {
            await axios.delete(`${API_BASE_URL}/users/body-goals/${metric}`, {
                data: { clerkUserId: user.id },
            });
            setGoalForm((prev) => ({ ...prev, [metric]: '' }));
            loadData();
        } catch (error) {
            console.error('Failed to delete goal:', error);
            Alert.alert('Error', 'Could not delete goal.');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#0D0D0F', '#131318']} style={styles.headerGradient}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.topRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                            <Feather name="arrow-left" size={18} color="#A5A5BE" />
                        </TouchableOpacity>
                        <View>
                            <Text style={styles.title}>Body Tracker</Text>
                            <Text style={styles.subTitle}>Measurements, trends, and goals</Text>
                        </View>
                        <TouchableOpacity onPress={loadData} style={styles.iconBtn}>
                            <Feather name="refresh-cw" size={16} color="#A5A5BE" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                {!isSignedIn && (
                    <View style={styles.warningCard}>
                        <MaterialCommunityIcons name="cloud-off-outline" size={16} color="#FFB800" />
                        <Text style={styles.warningText}>Sign in to use Body Tracker sync.</Text>
                    </View>
                )}

                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.primaryAction, styles.actionHalf]}
                        onPress={() => setShowAddForm((prev) => !prev)}
                    >
                        <Feather name="plus" size={14} color="#fff" />
                        <Text style={styles.primaryActionText}>
                            {showAddForm ? 'Close Entry Form' : 'Add Measurement'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.secondaryAction, styles.actionHalf]}
                        onPress={() => setShowGoalForm((prev) => !prev)}
                    >
                        <Feather name="target" size={14} color="#00E5BE" />
                        <Text style={styles.secondaryActionText}>
                            {showGoalForm ? 'Close Goals' : 'Set Goals'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {showAddForm && (
                    <View style={styles.formCard}>
                        <Text style={styles.formTitle}>New Measurement</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Measured date (optional, ISO)"
                            placeholderTextColor="#60607A"
                            value={measurementForm.measuredAt}
                            onChangeText={(value) => setMeasurementForm((prev) => ({ ...prev, measuredAt: value }))}
                        />
                        <View style={styles.inputGrid}>
                            {MEASUREMENT_FIELDS.map((field) => (
                                <View key={field.key} style={styles.inputWrapHalf}>
                                    <Text style={styles.inputLabel}>{field.label}</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={field.unit}
                                        placeholderTextColor="#60607A"
                                        keyboardType="decimal-pad"
                                        value={measurementForm[field.key]}
                                        onChangeText={(value) =>
                                            setMeasurementForm((prev) => ({ ...prev, [field.key]: value }))
                                        }
                                    />
                                </View>
                            ))}
                        </View>
                        <TextInput
                            style={[styles.input, styles.notesInput]}
                            placeholder="Notes (optional)"
                            placeholderTextColor="#60607A"
                            multiline
                            value={measurementForm.notes}
                            onChangeText={(value) => setMeasurementForm((prev) => ({ ...prev, notes: value }))}
                        />
                        <TouchableOpacity style={styles.primaryAction} onPress={saveMeasurement}>
                            <Text style={styles.primaryActionText}>Save Measurement</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {showGoalForm && (
                    <View style={styles.formCard}>
                        <Text style={styles.formTitle}>Target Goals</Text>
                        {MEASUREMENT_FIELDS.map((field) => (
                            <View key={field.key} style={styles.goalInputRow}>
                                <Text style={styles.goalInputLabel}>{field.label}</Text>
                                <TextInput
                                    style={styles.goalInput}
                                    placeholder={field.unit}
                                    placeholderTextColor="#60607A"
                                    keyboardType="decimal-pad"
                                    value={String(goalForm[field.key] || '')}
                                    onChangeText={(value) =>
                                        setGoalForm((prev) => ({ ...prev, [field.key]: value }))
                                    }
                                />
                            </View>
                        ))}
                        <TouchableOpacity style={styles.primaryAction} onPress={saveGoals}>
                            <Text style={styles.primaryActionText}>Save Goals</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Text style={styles.sectionLabel}>LATEST METRICS</Text>
                <View style={styles.metricsGrid}>
                    {MEASUREMENT_FIELDS.map((field) => {
                        const currentValue = latest?.[field.key];
                        const previousValue = previous?.[field.key];
                        const currentNumber = toNumber(currentValue);
                        const previousNumber = toNumber(previousValue);
                        const valueText = Number.isFinite(Number(currentValue))
                            ? `${Number(currentValue).toFixed(1)} ${field.unit}`
                            : '--';

                        return (
                            <View key={field.key} style={styles.metricCard}>
                                <View style={styles.metricHeader}>
                                    <View style={[styles.metricIcon, { backgroundColor: field.color + '22' }]}>
                                        <MaterialCommunityIcons name={field.icon} size={14} color={field.color} />
                                    </View>
                                    <Text style={styles.metricLabel}>{field.label}</Text>
                                </View>
                                <Text style={[styles.metricValue, { color: field.color }]}>{valueText}</Text>
                                <Text style={styles.metricDelta}>
                                    {formatDelta(currentNumber, previousNumber, field.unit)}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                <Text style={styles.sectionLabel}>GOAL PROGRESS</Text>
                <View style={styles.goalList}>
                    {MEASUREMENT_FIELDS.map((field) => {
                        const goal = goalsByMetric[field.key];
                        if (!goal) return null;

                        const currentRaw = latest?.[field.key];
                        const currentValue = Number.isFinite(Number(currentRaw)) ? Number(currentRaw) : null;
                        const startValue = Number.isFinite(Number(goal.startValue)) ? Number(goal.startValue) : currentValue;
                        const targetValue = Number(goal.targetValue);

                        let progress = 0;
                        if (currentValue != null && startValue != null && Number.isFinite(targetValue)) {
                            const totalDistance = Math.abs(targetValue - startValue);
                            const coveredDistance = Math.abs(currentValue - startValue);
                            progress = totalDistance > 0 ? (coveredDistance / totalDistance) * 100 : 0;
                            progress = Math.max(0, Math.min(100, progress));
                        }

                        return (
                            <View key={field.key} style={styles.goalRow}>
                                <View style={styles.goalTopRow}>
                                    <Text style={styles.goalName}>{field.label}</Text>
                                    <TouchableOpacity onPress={() => deleteGoal(field.key)}>
                                        <Feather name="trash-2" size={13} color="#FF4D2E" />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.goalNumbers}>
                                    {currentValue != null ? currentValue.toFixed(1) : '--'} {field.unit} / {targetValue.toFixed(1)} {field.unit}
                                </Text>
                                <GoalProgressBar progress={progress} color={field.color} />
                            </View>
                        );
                    })}
                    {!goals.length && (
                        <Text style={styles.emptyText}>No goals yet. Tap "Set Goals" to start tracking targets.</Text>
                    )}
                </View>

                <Text style={styles.sectionLabel}>MEASUREMENT HISTORY</Text>
                <View style={styles.historyList}>
                    {loading ? <Text style={styles.emptyText}>Loading measurements...</Text> : null}
                    {!loading && !measurements.length ? (
                        <Text style={styles.emptyText}>No measurements saved yet.</Text>
                    ) : null}
                    {!loading && measurements.map((entry) => (
                        <View key={entry.id} style={styles.historyCard}>
                            <View style={styles.historyHeader}>
                                <Text style={styles.historyDate}>{formatDate(entry.measuredAt || entry.createdAt)}</Text>
                                <TouchableOpacity onPress={() => deleteMeasurement(entry.id)}>
                                    <Feather name="trash-2" size={13} color="#FF4D2E" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.historyValues}>
                                {MEASUREMENT_FIELDS.map((field) => {
                                    const raw = entry[field.key];
                                    if (!Number.isFinite(Number(raw))) return null;
                                    return (
                                        <Text key={field.key} style={styles.historyValueText}>
                                            {field.label}: {Number(raw).toFixed(1)} {field.unit}
                                        </Text>
                                    );
                                })}
                            </View>
                            {entry.notes ? <Text style={styles.historyNotes}>{entry.notes}</Text> : null}
                        </View>
                    ))}
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
    headerGradient: {
        paddingHorizontal: 20,
        paddingBottom: 14,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    iconBtn: {
        width: 36,
        height: 36,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: '#17171F',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '900',
        textAlign: 'center',
    },
    subTitle: {
        color: '#7A7A93',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 2,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 120,
        gap: 14,
    },
    warningCard: {
        marginTop: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,184,0,0.35)',
        backgroundColor: 'rgba(255,184,0,0.08)',
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    warningText: {
        color: '#FFB800',
        fontSize: 12,
        fontWeight: '600',
    },
    actionRow: {
        marginTop: 6,
        flexDirection: 'row',
        gap: 10,
    },
    actionHalf: {
        flex: 1,
    },
    primaryAction: {
        height: 44,
        borderRadius: 12,
        backgroundColor: '#FF4D2E',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    primaryActionText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
    secondaryAction: {
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,229,190,0.4)',
        backgroundColor: 'rgba(0,229,190,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    secondaryActionText: {
        color: '#00E5BE',
        fontSize: 13,
        fontWeight: '700',
    },
    formCard: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: '#16161A',
        padding: 14,
        gap: 10,
    },
    formTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '800',
    },
    inputGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    inputWrapHalf: {
        width: '48%',
    },
    inputLabel: {
        color: '#7A7A93',
        fontSize: 11,
        marginBottom: 4,
    },
    input: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: '#0F0F14',
        color: '#fff',
        fontSize: 13,
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    notesInput: {
        minHeight: 72,
        textAlignVertical: 'top',
    },
    goalInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    goalInputLabel: {
        color: '#E8E8F0',
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
    },
    goalInput: {
        width: 110,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: '#0F0F14',
        color: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 13,
        textAlign: 'right',
    },
    sectionLabel: {
        color: '#8A8AA4',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.2,
        marginTop: 2,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    metricCard: {
        width: '48%',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: '#16161A',
        padding: 12,
        gap: 4,
    },
    metricHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    metricIcon: {
        width: 24,
        height: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    metricLabel: {
        color: '#A7A7BC',
        fontSize: 12,
        fontWeight: '600',
    },
    metricValue: {
        fontSize: 18,
        fontWeight: '900',
    },
    metricDelta: {
        color: '#6F6F86',
        fontSize: 11,
    },
    goalList: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: '#16161A',
        padding: 12,
        gap: 10,
    },
    goalRow: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        backgroundColor: '#121218',
        padding: 10,
        gap: 6,
    },
    goalTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    goalName: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
    goalNumbers: {
        color: '#A0A0BA',
        fontSize: 11,
    },
    goalProgressTrack: {
        width: '100%',
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
    },
    goalProgressFill: {
        height: '100%',
        borderRadius: 4,
    },
    historyList: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: '#16161A',
        padding: 12,
        gap: 8,
    },
    historyCard: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        backgroundColor: '#121218',
        padding: 10,
        gap: 6,
    },
    historyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    historyDate: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    historyValues: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    historyValueText: {
        color: '#A0A0BA',
        fontSize: 11,
    },
    historyNotes: {
        color: '#7A7A93',
        fontSize: 11,
        fontStyle: 'italic',
    },
    emptyText: {
        color: '#7A7A93',
        fontSize: 12,
    },
});
