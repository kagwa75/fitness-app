import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { FitnessItems } from '../Context';

// ─── Options ────────────────────────────────────────────────────────────────

const GENDER_OPTIONS = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Non-binary', value: 'non_binary' },
    { label: 'Prefer not to say', value: 'prefer_not_to_say' },
];

const GOAL_OPTIONS = [
    { label: 'Lose Weight', value: 'lose_weight', icon: 'fire' },
    { label: 'Gain Weight', value: 'gain_weight', icon: 'scale-bathroom' },
    { label: 'Build Muscle', value: 'build_muscle', icon: 'arm-flex' },
    { label: 'Maintain Fitness', value: 'maintain_fitness', icon: 'heart-pulse' },
];

const FITNESS_LEVEL_OPTIONS = [
    { label: 'Beginner', value: 'beginner', icon: 'seedling' },
    { label: 'Intermediate', value: 'intermediate', icon: 'lightning-bolt' },
    { label: 'Advanced', value: 'advanced', icon: 'trophy' },
];

const ACTIVITY_LEVEL_OPTIONS = [
    { label: 'Sedentary', value: 'sedentary', icon: 'sofa', desc: 'Little or no exercise' },
    { label: 'Light', value: 'light', icon: 'walk', desc: '1–3 days/week' },
    { label: 'Moderate', value: 'moderate', icon: 'run', desc: '3–5 days/week' },
    { label: 'Very Active', value: 'very_active', icon: 'lightning-bolt-circle', desc: '6–7 days/week' },
];

// ─── Small components ────────────────────────────────────────────────────────

const OptionChip = ({ label, selected, onPress, icon }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[styles.chip, selected && styles.chipSelected]}
    >
        {icon ? (
            <MaterialCommunityIcons
                name={icon}
                size={13}
                color={selected ? '#041018' : '#00E5BE'}
            />
        ) : null}
        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
);

const ActivityChip = ({ option, selected, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[styles.activityChip, selected && styles.activityChipSelected]}
    >
        <MaterialCommunityIcons
            name={option.icon}
            size={16}
            color={selected ? '#041018' : '#00E5BE'}
            style={{ marginBottom: 2 }}
        />
        <Text style={[styles.activityChipLabel, selected && styles.activityChipLabelSelected]}>
            {option.label}
        </Text>
        <Text style={[styles.activityChipDesc, selected && styles.activityChipDescSelected]}>
            {option.desc}
        </Text>
    </TouchableOpacity>
);

const UnitToggle = ({ options, selected, onSelect }) => (
    <View style={styles.unitToggle}>
        {options.map((opt) => (
            <TouchableOpacity
                key={opt}
                onPress={() => onSelect(opt)}
                style={[styles.unitBtn, selected === opt && styles.unitBtnSelected]}
            >
                <Text style={[styles.unitBtnText, selected === opt && styles.unitBtnTextSelected]}>
                    {opt}
                </Text>
            </TouchableOpacity>
        ))}
    </View>
);

const FieldError = ({ message }) =>
    message ? (
        <Text style={styles.fieldError}>
            <Feather name="alert-circle" size={10} /> {message}
        </Text>
    ) : null;

// ─── Progress bar ────────────────────────────────────────────────────────────

const ProgressBar = ({ progress }) => {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(anim, {
            toValue: progress,
            tension: 80,
            friction: 10,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

    return (
        <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width }]} />
        </View>
    );
};

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
    const navigation = useNavigation();
    const { userProfile, saveUserProfile } = useContext(FitnessItems);

    // Body metrics
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [weightUnit, setWeightUnit] = useState('kg');
    const [height, setHeight] = useState('');
    const [heightUnit, setHeightUnit] = useState('cm');
    const [gender, setGender] = useState('');

    // Goals
    const [goal, setGoal] = useState('');
    const [fitnessLevel, setFitnessLevel] = useState('');
    const [activityLevel, setActivityLevel] = useState('');

    // Inline validation (show after field is touched)
    const [touched, setTouched] = useState({});

    const touch = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

    // Populate from existing profile
    useEffect(() => {
        if (!userProfile) return;
        setAge(String(userProfile.age || ''));
        setWeight(String(userProfile.weight || ''));
        setHeight(String(userProfile.height || ''));
        setGender(String(userProfile.gender || ''));
        setGoal(String(userProfile.goal || ''));
        setFitnessLevel(String(userProfile.fitnessLevel || ''));
        setActivityLevel(String(userProfile.activityLevel || ''));
        setWeightUnit(userProfile.weightUnit || 'kg');
        setHeightUnit(userProfile.heightUnit || 'cm');
    }, [userProfile]);

    // ── Validation ────────────────────────────────────────────────────────────

    const parsedAge = Number.parseInt(age, 10);
    const parsedWeight = Number.parseFloat(weight);
    const parsedHeight = Number.parseFloat(height);

    const errors = {
        age:
            touched.age && (age === '' || !Number.isInteger(parsedAge) || parsedAge < 10 || parsedAge > 120)
                ? 'Enter a valid age (10–120)'
                : null,
        weight:
            touched.weight && (weight === '' || !Number.isFinite(parsedWeight) || parsedWeight <= 0 || parsedWeight > 500)
                ? 'Enter a valid weight'
                : null,
        height:
            touched.height && (height === '' || !Number.isFinite(parsedHeight) || parsedHeight <= 0 || parsedHeight > 300)
                ? 'Enter a valid height'
                : null,
    };

    const fieldsComplete = {
        age: Number.isInteger(parsedAge) && parsedAge >= 10 && parsedAge <= 120,
        weight: Number.isFinite(parsedWeight) && parsedWeight > 0 && parsedWeight <= 500,
        height: Number.isFinite(parsedHeight) && parsedHeight > 0 && parsedHeight <= 300,
        gender: !!gender,
        goal: !!goal,
        fitnessLevel: !!fitnessLevel,
        activityLevel: !!activityLevel,
    };

    const completedCount = Object.values(fieldsComplete).filter(Boolean).length;
    const totalFields = Object.keys(fieldsComplete).length;
    const progress = completedCount / totalFields;

    const isReadyToSubmit = completedCount === totalFields;

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleContinue = async () => {
        if (!isReadyToSubmit) {
            // Touch all fields to reveal any remaining errors
            setTouched({ age: true, weight: true, height: true });
            Alert.alert('Almost there', 'Please complete all fields before continuing.');
            return;
        }

        const saved = await saveUserProfile({
            age: parsedAge,
            weight: parsedWeight,
            weightUnit,
            height: parsedHeight,
            heightUnit,
            gender,
            goal,
            fitnessLevel,
            activityLevel,
            updatedAt: new Date().toISOString(),
        });

        if (!saved) {
            Alert.alert('Could not save profile', 'Please review your details and try again.');
            return;
        }

        navigation.replace('App');
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#0D0D0F', '#121218', '#191926']} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={styles.safeArea}>

                {/* ── Header bar ── */}
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
                        <Feather name="arrow-left" size={18} color="#A5A5BE" />
                    </TouchableOpacity>

                    <View style={styles.progressWrapper}>
                        <ProgressBar progress={progress} />
                        <Text style={styles.progressLabel}>
                            {completedCount}/{totalFields} complete
                        </Text>
                    </View>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ── Page header ── */}
                    <View style={styles.header}>
                        <View style={styles.badge}>
                            <Feather name="user-check" size={13} color="#00E5BE" />
                            <Text style={styles.badgeText}>ONBOARDING</Text>
                        </View>
                        <Text style={styles.title}>Build Your Plan</Text>
                        <Text style={styles.subtitle}>
                            Tell us about yourself so we can personalize your training.
                        </Text>
                    </View>

                    {/* ── Card 1: Body Metrics ── */}
                    <View style={styles.sectionLabel}>
                        <MaterialCommunityIcons name="human" size={13} color="#A5A5BE" />
                        <Text style={styles.sectionLabelText}>BODY METRICS</Text>
                    </View>
                    <View style={styles.card}>

                        {/* Age */}
                        <Text style={styles.inputLabel}>Age</Text>
                        <TextInput
                            value={age}
                            onChangeText={setAge}
                            onBlur={() => touch('age')}
                            keyboardType="number-pad"
                            placeholder="e.g. 24"
                            placeholderTextColor="#5F5F76"
                            style={[styles.input, errors.age && styles.inputError]}
                            maxLength={3}
                        />
                        <FieldError message={errors.age} />

                        {/* Weight */}
                        <View style={styles.labelRow}>
                            <Text style={styles.inputLabel}>Weight</Text>
                            <UnitToggle
                                options={['kg', 'lbs']}
                                selected={weightUnit}
                                onSelect={setWeightUnit}
                            />
                        </View>
                        <TextInput
                            value={weight}
                            onChangeText={setWeight}
                            onBlur={() => touch('weight')}
                            keyboardType="decimal-pad"
                            placeholder={weightUnit === 'kg' ? 'e.g. 72.5' : 'e.g. 160'}
                            placeholderTextColor="#5F5F76"
                            style={[styles.input, errors.weight && styles.inputError]}
                            maxLength={6}
                        />
                        <FieldError message={errors.weight} />

                        {/* Height */}
                        <View style={styles.labelRow}>
                            <Text style={styles.inputLabel}>Height</Text>
                            <UnitToggle
                                options={['cm', 'ft']}
                                selected={heightUnit}
                                onSelect={setHeightUnit}
                            />
                        </View>
                        <TextInput
                            value={height}
                            onChangeText={setHeight}
                            onBlur={() => touch('height')}
                            keyboardType="decimal-pad"
                            placeholder={heightUnit === 'cm' ? 'e.g. 175' : 'e.g. 5.9'}
                            placeholderTextColor="#5F5F76"
                            style={[styles.input, errors.height && styles.inputError]}
                            maxLength={5}
                        />
                        <FieldError message={errors.height} />

                        {/* Gender */}
                        <Text style={styles.inputLabel}>Gender</Text>
                        <View style={styles.rowWrap}>
                            {GENDER_OPTIONS.map((option) => (
                                <OptionChip
                                    key={option.value}
                                    label={option.label}
                                    selected={gender === option.value}
                                    onPress={() => setGender(option.value)}
                                />
                            ))}
                        </View>
                    </View>

                    {/* ── Card 2: Goals ── */}
                    <View style={styles.sectionLabel}>
                        <MaterialCommunityIcons name="target" size={13} color="#A5A5BE" />
                        <Text style={styles.sectionLabelText}>YOUR GOALS</Text>
                    </View>
                    <View style={styles.card}>

                        {/* Goal */}
                        <Text style={styles.inputLabel}>Primary Goal</Text>
                        <View style={styles.rowWrap}>
                            {GOAL_OPTIONS.map((option) => (
                                <OptionChip
                                    key={option.value}
                                    label={option.label}
                                    icon={option.icon}
                                    selected={goal === option.value}
                                    onPress={() => setGoal(option.value)}
                                />
                            ))}
                        </View>

                        {/* Fitness level */}
                        <Text style={[styles.inputLabel, { marginTop: 14 }]}>Fitness Level</Text>
                        <View style={styles.rowWrap}>
                            {FITNESS_LEVEL_OPTIONS.map((option) => (
                                <OptionChip
                                    key={option.value}
                                    label={option.label}
                                    icon={option.icon}
                                    selected={fitnessLevel === option.value}
                                    onPress={() => setFitnessLevel(option.value)}
                                />
                            ))}
                        </View>

                        {/* Activity level */}
                        <Text style={[styles.inputLabel, { marginTop: 14 }]}>Activity Level</Text>
                        <View style={styles.activityRow}>
                            {ACTIVITY_LEVEL_OPTIONS.map((option) => (
                                <ActivityChip
                                    key={option.value}
                                    option={option}
                                    selected={activityLevel === option.value}
                                    onPress={() => setActivityLevel(option.value)}
                                />
                            ))}
                        </View>
                    </View>

                    <View style={{ height: 24 }} />
                </ScrollView>

                {/* ── CTA ── */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={handleContinue}
                        activeOpacity={0.9}
                        style={[styles.ctaWrapper, !isReadyToSubmit && styles.ctaDisabled]}
                    >
                        <LinearGradient
                            colors={isReadyToSubmit ? ['#00E5BE', '#00B89F'] : ['#2a2a3a', '#1e1e2e']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.cta}
                        >
                            <Text style={[styles.ctaText, !isReadyToSubmit && styles.ctaTextDisabled]}>
                                Build My Plan
                            </Text>
                            <Feather
                                name="arrow-right"
                                size={16}
                                color={isReadyToSubmit ? '#041018' : '#555'}
                            />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

            </SafeAreaView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0D0D0F' },
    safeArea: { flex: 1 },

    // Top bar
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
        gap: 12,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    progressWrapper: { flex: 1, gap: 4 },
    progressTrack: {
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
        backgroundColor: '#00E5BE',
    },
    progressLabel: {
        color: '#555',
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.3,
    },

    // Scroll content
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },

    // Header
    header: { marginBottom: 20, marginTop: 4 },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(0,229,190,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(0,229,190,0.3)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        marginBottom: 10,
    },
    badgeText: {
        color: '#00E5BE',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: '900',
        letterSpacing: -0.5,
        marginBottom: 6,
    },
    subtitle: {
        color: '#6B6B86',
        fontSize: 13,
        lineHeight: 19,
    },

    // Section labels
    sectionLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
        marginTop: 4,
    },
    sectionLabelText: {
        color: '#A5A5BE',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
    },

    // Card
    card: {
        backgroundColor: 'rgba(22,22,30,0.9)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        padding: 16,
        marginBottom: 12,
        gap: 6,
    },

    // Input
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    inputLabel: {
        color: '#A5A5BE',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginTop: 8,
        marginBottom: 4,
    },
    input: {
        backgroundColor: '#121218',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
        borderRadius: 10,
        color: '#FFFFFF',
        paddingHorizontal: 14,
        paddingVertical: 11,
        fontSize: 15,
        fontWeight: '600',
    },
    inputError: {
        borderColor: 'rgba(255,77,46,0.6)',
    },
    fieldError: {
        color: '#FF6B4D',
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    },

    // Unit toggle
    unitToggle: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        overflow: 'hidden',
    },
    unitBtn: {
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    unitBtnSelected: {
        backgroundColor: 'rgba(0,229,190,0.15)',
    },
    unitBtnText: {
        color: '#555',
        fontSize: 11,
        fontWeight: '700',
    },
    unitBtnTextSelected: {
        color: '#00E5BE',
    },

    // Chips
    rowWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 2,
        marginBottom: 4,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(0,229,190,0.35)',
        backgroundColor: 'rgba(0,229,190,0.06)',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    chipSelected: {
        borderColor: '#00E5BE',
        backgroundColor: '#00E5BE',
    },
    chipText: {
        color: '#00E5BE',
        fontSize: 12,
        fontWeight: '700',
    },
    chipTextSelected: {
        color: '#041018',
    },

    // Activity level chips
    activityRow: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 4,
    },
    activityChip: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,229,190,0.3)',
        backgroundColor: 'rgba(0,229,190,0.05)',
        gap: 2,
    },
    activityChipSelected: {
        borderColor: '#00E5BE',
        backgroundColor: '#00E5BE',
    },
    activityChipLabel: {
        color: '#00E5BE',
        fontSize: 10,
        fontWeight: '800',
        textAlign: 'center',
    },
    activityChipLabelSelected: {
        color: '#041018',
    },
    activityChipDesc: {
        color: '#00E5BE',
        fontSize: 8,
        fontWeight: '500',
        textAlign: 'center',
        opacity: 0.7,
    },
    activityChipDescSelected: {
        color: '#041018',
        opacity: 0.7,
    },

    // Footer / CTA
    footer: {
        paddingHorizontal: 16,
        paddingBottom: 10,
        paddingTop: 8,
    },
    ctaWrapper: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    ctaDisabled: {
        opacity: 0.5,
    },
    cta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 14,
    },
    ctaText: {
        color: '#041018',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 0.3,
    },
    ctaTextDisabled: {
        color: '#555',
    },
});
