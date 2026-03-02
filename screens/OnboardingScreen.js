import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    KeyboardAvoidingView,
    Platform,
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
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-expo';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import { FitnessItems } from '../Context';

const { width } = Dimensions.get('window');

// ─── Steps ───────────────────────────────────────────────────────────────────
//  0  Name
//  1  Age
//  2  Gender
//  3  Weight
//  4  Height
//  5  Body fat % (optional)
//  6  Goal
//  7  Fitness level
//  8  Activity level
//  9  Focus areas
// 10  Workout location
// 11  Equipment
// 12  Limitations / pain points
// 13  Analyzing + Plan preview

const TOTAL_STEPS = 14;
const ONBOARDING_DRAFT_STORAGE_KEY = 'user_onboarding_draft_v1';

const getOnboardingDraftStorageKey = (clerkUserId) =>
    clerkUserId ? `${ONBOARDING_DRAFT_STORAGE_KEY}_${clerkUserId}` : `${ONBOARDING_DRAFT_STORAGE_KEY}_guest`;

const canUseWebStorage = () =>
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    !!window.localStorage;

const readValueByKey = async (key) => {
    try {
        if (canUseWebStorage()) return window.localStorage.getItem(key);
        if (!SecureStore.getItemAsync) return null;
        return await SecureStore.getItemAsync(key);
    } catch {
        return null;
    }
};

const writeValueByKey = async (key, value) => {
    try {
        if (canUseWebStorage()) {
            window.localStorage.setItem(key, value);
            return;
        }
        if (!SecureStore.setItemAsync) return;
        await SecureStore.setItemAsync(key, value);
    } catch {}
};

const removeValueByKey = async (key) => {
    try {
        if (canUseWebStorage()) {
            window.localStorage.removeItem(key);
            return;
        }
        if (!SecureStore.deleteItemAsync) return;
        await SecureStore.deleteItemAsync(key);
    } catch {}
};

const safeParseObject = (raw) => {
    if (!raw) return {};
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
        return {};
    }
};

// ─── Option data ──────────────────────────────────────────────────────────────

const GENDER_OPTIONS = [
    { value: 'male',              label: 'Male',              icon: 'gender-male' },
    { value: 'female',            label: 'Female',            icon: 'gender-female' },
    { value: 'non_binary',        label: 'Non-binary',        icon: 'gender-non-binary' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say', icon: 'account-question' },
];

const GOAL_OPTIONS = [
    { value: 'lose_weight',      label: 'Lose Weight',  icon: 'fire',          color: '#FF4D2E', desc: 'Burn fat with cardio and calorie-deficit training.',  feedback: "We'll design high-intensity fat-burning sessions tailored to you." },
    { value: 'gain_weight',      label: 'Gain Weight',  icon: 'scale-bathroom',color: '#FFB800', desc: 'Increase mass with progressive overload programs.',    feedback: "A calorie surplus plan with progressive strength loading incoming." },
    { value: 'build_muscle',     label: 'Build Muscle', icon: 'arm-flex',      color: '#00E5BE', desc: 'Hypertrophy-focused workouts for lean muscle gain.',   feedback: "Hypertrophy splits incoming — expect volume, rest, and growth." },
    { value: 'maintain_fitness', label: 'Stay Fit',     icon: 'heart-pulse',   color: '#6C63FF', desc: 'Balanced routines to maintain your current fitness.',  feedback: "Smart. We'll keep your body challenged without overtaxing it." },
];

const GOAL_CTA_LABELS = {
    lose_weight: 'Start Cutting 🔥',
    gain_weight: 'Start Building 💪',
    build_muscle: 'Start Building 💪',
    maintain_fitness: 'Maintain & Optimize ⚡',
};

const GOAL_CTA_THEMES = {
    lose_weight: { colors: ['#FF4D2E', '#FF2800'], textColor: '#FFFFFF' },
    gain_weight: { colors: ['#00E5BE', '#00B89F'], textColor: '#041018' },
    build_muscle: { colors: ['#00E5BE', '#00B89F'], textColor: '#041018' },
    maintain_fitness: { colors: ['#6C63FF', '#4F46E5'], textColor: '#FFFFFF' },
    default: { colors: ['#00E5BE', '#00B89F'], textColor: '#041018' },
};

const FITNESS_LEVEL_OPTIONS = [
    { value: 'beginner',     label: 'Beginner',     icon: 'seedling',       color: '#00E5BE', desc: 'New to structured training. Focus on form and foundations.',    feedback: "No rush — we'll build from the ground up safely." },
    { value: 'intermediate', label: 'Intermediate', icon: 'lightning-bolt', color: '#FFB800', desc: 'Some experience. Ready to push harder and add variety.',         feedback: "Nice. Progressive complexity incoming your way." },
    { value: 'advanced',     label: 'Advanced',     icon: 'trophy',         color: '#FF4D2E', desc: 'Seasoned athlete. High intensity and complex programming.',      feedback: "Elite-level programming. No holding back." },
];

const ACTIVITY_OPTIONS = [
    { value: 'sedentary',   label: 'Sedentary',      icon: 'sofa',                  color: '#6C63FF', desc: 'Desk job, minimal movement day-to-day.',           feedback: "Your workouts will make a real metabolic difference." },
    { value: 'light',       label: 'Lightly Active', icon: 'walk',                  color: '#00C2FF', desc: '1–3 days of light exercise or walks per week.',     feedback: "Good foundation. We'll build on your habits." },
    { value: 'moderate',    label: 'Moderate',       icon: 'run',                   color: '#00E5BE', desc: 'Exercise or active job 3–5 days per week.',         feedback: "Solid base. Intensity matched to your lifestyle." },
    { value: 'very_active', label: 'Very Active',    icon: 'lightning-bolt-circle', color: '#FF4D2E', desc: 'Hard training or physical job 6–7 days per week.',  feedback: "Beast mode. Recovery built into every cycle." },
];

const BODY_FAT_SEGMENTS_BY_GENDER = {
    male: [
        { label: 'Essential', lo: 2,  hi: 6,   color: '#00C2FF', range: '2–5%' },
        { label: 'Athletic',  lo: 6,  hi: 14,  color: '#00E5BE', range: '6–13%' },
        { label: 'Fit',       lo: 14, hi: 18,  color: '#4ADE80', range: '14–17%' },
        { label: 'Average',   lo: 18, hi: 25,  color: '#FFB800', range: '18–24%' },
        { label: 'High',      lo: 25, hi: 100, color: '#FF4D2E', range: '25%+' },
    ],
    female: [
        { label: 'Essential', lo: 10, hi: 14,  color: '#00C2FF', range: '10–13%' },
        { label: 'Athletic',  lo: 14, hi: 21,  color: '#00E5BE', range: '14–20%' },
        { label: 'Fit',       lo: 21, hi: 25,  color: '#4ADE80', range: '21–24%' },
        { label: 'Average',   lo: 25, hi: 32,  color: '#FFB800', range: '25–31%' },
        { label: 'High',      lo: 32, hi: 100, color: '#FF4D2E', range: '32%+' },
    ],
    default: [
        { label: 'Essential', lo: 5,  hi: 9,   color: '#00C2FF', range: '5–8%' },
        { label: 'Athletic',  lo: 9,  hi: 17,  color: '#00E5BE', range: '9–16%' },
        { label: 'Fit',       lo: 17, hi: 25,  color: '#4ADE80', range: '17–24%' },
        { label: 'Average',   lo: 25, hi: 32,  color: '#FFB800', range: '25–31%' },
        { label: 'High',      lo: 32, hi: 100, color: '#FF4D2E', range: '32%+' },
    ],
};

const FOCUS_OPTIONS = [
    { value: 'back',      label: 'Back',      icon: 'human-handsdown', color: '#00C2FF' },
    { value: 'shoulders', label: 'Shoulders', icon: 'human-handsup',   color: '#6C63FF' },
    { value: 'arms',      label: 'Arms',      icon: 'arm-flex',        color: '#FFB800' },
    { value: 'chest',     label: 'Chest',     icon: 'human',           color: '#FF4D2E' },
    { value: 'abs',       label: 'Abs',       icon: 'ab-testing',      color: '#00E5BE' },
    { value: 'glutes',    label: 'Glutes',    icon: 'run-fast',        color: '#FF9500' },
    { value: 'legs',      label: 'Legs',      icon: 'human-male',      color: '#FF4D8C' },
    { value: 'full_body', label: 'Full Body', icon: 'human-greeting',  color: '#8B5CF6' },
];

const LOCATION_OPTIONS = [
    { value: 'gym',     label: 'Gym',         icon: 'dumbbell',        color: '#FF4D2E', desc: 'Full access to machines, free weights and cables.' },
    { value: 'home',    label: 'Home',         icon: 'home',           color: '#00E5BE', desc: 'Training in your own space with available gear.' },
    { value: 'outdoor', label: 'Outdoors',     icon: 'tree',           color: '#FFB800', desc: 'Parks, tracks or outdoor calisthenics areas.' },
    { value: 'hybrid',  label: 'Mix of Both',  icon: 'shuffle-variant',color: '#6C63FF', desc: 'Some days gym, some days home or outside.' },
];

const EQUIPMENT_BY_LOCATION = {
    gym: [
        { value: 'barbell',    label: 'Barbell',        icon: 'weight-lifter' },
        { value: 'dumbbells',  label: 'Dumbbells',      icon: 'dumbbell' },
        { value: 'cables',     label: 'Cable Machines', icon: 'vector-line' },
        { value: 'machines',   label: 'Gym Machines',   icon: 'robot-industrial' },
        { value: 'kettlebell', label: 'Kettlebells',    icon: 'kettle' },
        { value: 'pullup_bar', label: 'Pull-up Bar',    icon: 'human-handsup' },
        { value: 'bench',      label: 'Bench',          icon: 'seat-flat' },
        { value: 'smith',      label: 'Smith Machine',  icon: 'progress-wrench' },
    ],
    home: [
        { value: 'bodyweight', label: 'Bodyweight Only',  icon: 'human-greeting' },
        { value: 'dumbbells',  label: 'Dumbbells',        icon: 'dumbbell' },
        { value: 'resistance', label: 'Resistance Bands', icon: 'vector-bezier' },
        { value: 'kettlebell', label: 'Kettlebells',      icon: 'kettle' },
        { value: 'pullup_bar', label: 'Pull-up Bar',      icon: 'human-handsup' },
        { value: 'bench',      label: 'Bench / Box',      icon: 'seat-flat' },
    ],
    outdoor: [
        { value: 'bodyweight', label: 'Bodyweight Only',  icon: 'human-greeting' },
        { value: 'resistance', label: 'Resistance Bands', icon: 'vector-bezier' },
        { value: 'pullup_bar', label: 'Pull-up Bar',      icon: 'human-handsup' },
    ],
    hybrid: [
        { value: 'barbell',    label: 'Barbell',          icon: 'weight-lifter' },
        { value: 'dumbbells',  label: 'Dumbbells',        icon: 'dumbbell' },
        { value: 'cables',     label: 'Cable Machines',   icon: 'vector-line' },
        { value: 'machines',   label: 'Gym Machines',     icon: 'robot-industrial' },
        { value: 'bodyweight', label: 'Bodyweight Only',  icon: 'human-greeting' },
        { value: 'kettlebell', label: 'Kettlebells',      icon: 'kettle' },
        { value: 'resistance', label: 'Resistance Bands', icon: 'vector-bezier' },
        { value: 'pullup_bar', label: 'Pull-up Bar',      icon: 'human-handsup' },
    ],
};

const LIMITATION_OPTIONS = [
    { value: 'none',             label: 'No current limitations', icon: 'check-circle-outline', color: '#00E5BE' },
    { value: 'knee_pain',        label: 'Knee discomfort',        icon: 'run',                  color: '#FFB800' },
    { value: 'lower_back_pain',  label: 'Lower back discomfort',  icon: 'human-handsdown',      color: '#FF4D2E' },
    { value: 'shoulder_pain',    label: 'Shoulder discomfort',    icon: 'human-handsup',        color: '#00C2FF' },
    { value: 'wrist_pain',       label: 'Wrist discomfort',       icon: 'hand-back-right',      color: '#6C63FF' },
    { value: 'ankle_pain',       label: 'Ankle discomfort',       icon: 'shoe-sneaker',         color: '#FF4D8C' },
];

// ─── Calculation helpers ──────────────────────────────────────────────────────

const toKg  = (w, unit) => unit === 'lbs' ? w * 0.453592 : w;
const toCm  = (cm, ft, inches, unit) =>
    unit === 'ft' ? (parseInt(ft) || 0) * 30.48 + (parseFloat(inches) || 0) * 2.54 : parseFloat(cm) || 0;

const calcBMI = (kg, cm) => {
    if (!kg || !cm) return null;
    return +(kg / Math.pow(cm / 100, 2)).toFixed(1);
};

const bmiCategory = (bmi) => {
    if (!bmi)   return null;
    if (bmi < 16)   return { label: 'Severely Underweight', color: '#00C2FF' };
    if (bmi < 18.5) return { label: 'Underweight',          color: '#00E5BE' };
    if (bmi < 25)   return { label: 'Healthy Weight',       color: '#4ADE80' };
    if (bmi < 30)   return { label: 'Overweight',           color: '#FFB800' };
    if (bmi < 35)   return { label: 'Obese Class I',        color: '#FF9500' };
    return                 { label: 'Obese Class II+',      color: '#FF4D2E' };
};

const calcTDEE = (kg, cm, age, gender, activity) => {
    if (!kg || !cm || !age) return 2000;
    const bmr = gender === 'female'
        ? 10 * kg + 6.25 * cm - 5 * age - 161
        : 10 * kg + 6.25 * cm - 5 * age + 5;
    const m = { sedentary: 1.2, light: 1.375, moderate: 1.55, very_active: 1.725 };
    return Math.round(bmr * (m[activity] || 1.375));
};

const calcMacros = (tdee, goal, bf, kg) => {
    const target = goal === 'lose_weight' ? tdee - 500 : goal !== 'maintain_fitness' ? tdee + 300 : tdee;
    const lean   = bf ? kg * (1 - bf / 100) : kg;
    const prot   = Math.round(bf ? lean * 2.2 : kg * 1.8);
    const fat    = Math.round((target * 0.25) / 9);
    const carb   = Math.max(0, Math.round((target - prot * 4 - fat * 9) / 4));
    return { target, prot, fat, carb };
};

const buildPlan = ({ goal, fitnessLevel, activityLevel, gender, age, weightKg, heightCm, bodyFatPct, focusAreas, limitations: limitationValues = [] }) => {
    const gMap  = { lose_weight: { label: 'Fat Loss', color: '#FF4D2E', icon: 'fire' }, gain_weight: { label: 'Mass Gain', color: '#FFB800', icon: 'scale-bathroom' }, build_muscle: { label: 'Muscle Building', color: '#00E5BE', icon: 'arm-flex' }, maintain_fitness: { label: 'Maintenance', color: '#6C63FF', icon: 'heart-pulse' } };
    const lMap  = { beginner: { sessions: '3x / week', intensity: 'Low–Medium' }, intermediate: { sessions: '4–5x / week', intensity: 'Medium–High' }, advanced: { sessions: '5–6x / week', intensity: 'High' } };
    const fMap  = { back: 'Back', shoulders: 'Shoulders', arms: 'Arms', chest: 'Chest', abs: 'Abs', glutes: 'Glutes', legs: 'Legs', full_body: 'Full Body' };
    const g     = gMap[goal]           || gMap.maintain_fitness;
    const l     = lMap[fitnessLevel]   || lMap.beginner;
    const tdee  = calcTDEE(weightKg, heightCm, parseInt(age), gender, activityLevel);
    const macros = calcMacros(tdee, goal, parseFloat(bodyFatPct) || null, weightKg);
    const bmi    = calcBMI(weightKg, heightCm);
    const bmiCat = bmiCategory(bmi);
    const lmMap = {
        none: 'No major limitations',
        knee_pain: 'Knee discomfort',
        lower_back_pain: 'Lower back discomfort',
        shoulder_pain: 'Shoulder discomfort',
        wrist_pain: 'Wrist discomfort',
        ankle_pain: 'Ankle discomfort',
    };
    const focuses = (focusAreas || []).map(v => fMap[v] || v);
    const limitations = (limitationValues || []).map(v => lmMap[v] || v);
    return { ...g, ...l, tdee, macros, bmi, bmiCat, focuses, limitations };
};

// ─── Shared sub-components ────────────────────────────────────────────────────

// Linear progress bar replaces dots across all onboarding steps
const LinearProgress = ({ current, total }) => {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.spring(anim, { toValue: current / (total - 1), tension: 60, friction: 10, useNativeDriver: false }).start();
    }, [current]);
    const w = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
    const pct = Math.round((current / (total - 1)) * 100);
    return (
        <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, { width: w }]} />
            </View>
            <Text style={styles.progressPct}>{pct}%</Text>
        </View>
    );
};

const FeedbackBubble = ({ message, color }) => {
    const op = useRef(new Animated.Value(0)).current;
    const ty = useRef(new Animated.Value(8)).current;
    useEffect(() => {
        if (!message) return;
        op.setValue(0); ty.setValue(8);
        Animated.parallel([
            Animated.timing(op, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.spring(ty,  { toValue: 0, tension: 100, friction: 10, useNativeDriver: true }),
        ]).start();
    }, [message]);
    if (!message) return null;
    return (
        <Animated.View style={[styles.feedback, { borderColor: color + '40', backgroundColor: color + '10', opacity: op, transform: [{ translateY: ty }] }]}>
            <MaterialCommunityIcons name="check-circle" size={14} color={color} />
            <Text style={[styles.feedbackText, { color }]}>{message}</Text>
        </Animated.View>
    );
};

const ErrorHint = ({ message }) => {
    const op = useRef(new Animated.Value(0)).current;
    const tx = useRef(new Animated.Value(-6)).current;
    useEffect(() => {
        if (!message) { Animated.timing(op, { toValue: 0, duration: 150, useNativeDriver: true }).start(); return; }
        tx.setValue(-6);
        Animated.parallel([
            Animated.timing(op, { toValue: 1, duration: 220, useNativeDriver: true }),
            Animated.spring(tx, { toValue: 0, tension: 200, friction: 10, useNativeDriver: true }),
        ]).start();
    }, [message]);
    return (
        <Animated.View style={[styles.errorHint, { opacity: op, transform: [{ translateX: tx }] }]}>
            {message ? <><Feather name="alert-circle" size={11} color="#FF4D2E" /><Text style={styles.errorHintText}>{message}</Text></> : null}
        </Animated.View>
    );
};

const UnitToggle = ({ options, selected, onSelect, vertical = false }) => (
    <View style={[styles.unitToggle, vertical && { flexDirection: 'column' }]}>
        {options.map(opt => (
            <TouchableOpacity key={opt} onPress={() => onSelect(opt)} style={[styles.unitBtn, selected === opt && styles.unitBtnSel]}>
                <Text style={[styles.unitBtnTxt, selected === opt && styles.unitBtnTxtSel]}>{opt}</Text>
            </TouchableOpacity>
        ))}
    </View>
);

const GenderPill = ({ option, selected, onPress }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.genderPill, selected && styles.genderPillSel]}>
        <MaterialCommunityIcons name={option.icon} size={16} color={selected ? '#041018' : '#A5A5BE'} />
        <Text style={[styles.genderPillTxt, selected && styles.genderPillTxtSel]}>{option.label}</Text>
    </TouchableOpacity>
);

const OptionCard = ({ option, selected, onPress }) => {
    const scale = useRef(new Animated.Value(1)).current;
    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 300 }).start()}
                onPressOut={() => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 300 }).start()}
                activeOpacity={1}
                style={[styles.optionCard, selected && { borderColor: option.color, backgroundColor: option.color + '12' }]}
            >
                <View style={[styles.optionIconBg, { backgroundColor: option.color + (selected ? '28' : '14') }]}>
                    <MaterialCommunityIcons name={option.icon} size={22} color={option.color} />
                </View>
                <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, selected && { color: option.color }]}>{option.label}</Text>
                    <Text style={styles.optionDesc} numberOfLines={2}>{option.desc}</Text>
                </View>
                {selected && <MaterialCommunityIcons name="check-circle" size={18} color={option.color} />}
            </TouchableOpacity>
        </Animated.View>
    );
};

const MultiChip = ({ option, selected, onPress, color = '#00E5BE' }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}
        style={[styles.multiChip, selected && { borderColor: color, backgroundColor: color + '18' }]}>
        <MaterialCommunityIcons name={option.icon} size={14} color={selected ? color : '#555'} />
        <Text style={[styles.multiChipTxt, selected && { color }]}>{option.label}</Text>
    </TouchableOpacity>
);

const StepWrapper = ({ children, direction }) => {
    const tx = useRef(new Animated.Value(direction === 'forward' ? width : -width)).current;
    const op = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.parallel([
            Animated.spring(tx, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
            Animated.timing(op,  { toValue: 1, duration: 240, useNativeDriver: true }),
        ]).start();
    }, []);
    return (
        <Animated.View style={[{ flex: 1, opacity: op, transform: [{ translateX: tx }] }]}>
            {children}
        </Animated.View>
    );
};

// ─── Analyzing screen ─────────────────────────────────────────────────────────

const ANALYZING_PHRASES = [
    'Crunching your numbers…',
    'Calibrating intensity levels…',
    'Mapping your focus areas…',
    'Calculating macro targets…',
    'Finalizing your program…',
];

const AnalyzingScreen = ({ onDone, name }) => {
    const [phraseIdx, setPhraseIdx] = useState(0);
    const dotAnim  = useRef(new Animated.Value(0)).current;
    const iconScl  = useRef(new Animated.Value(0.6)).current;
    const iconOp   = useRef(new Animated.Value(0)).current;
    const doneOp   = useRef(new Animated.Value(0)).current;
    const doneScl  = useRef(new Animated.Value(0.8)).current;
    const [done,    setDone]   = useState(false);
    const phraseOp  = useRef(new Animated.Value(1)).current;

    // Rotating dots
    useEffect(() => {
        Animated.loop(
            Animated.timing(dotAnim, { toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: true })
        ).start();
        Animated.parallel([
            Animated.spring(iconScl, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
            Animated.timing(iconOp,  { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();
    }, []);

    // Cycle phrases
    useEffect(() => {
        if (done) return;
        const interval = setInterval(() => {
            Animated.timing(phraseOp, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
                setPhraseIdx(i => (i + 1) % ANALYZING_PHRASES.length);
                Animated.timing(phraseOp, { toValue: 1, duration: 200, useNativeDriver: true }).start();
            });
        }, 700);
        return () => clearInterval(interval);
    }, [done]);

    // After 3.2s show checkmark then call onDone
    useEffect(() => {
        const t = setTimeout(() => {
            setDone(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Animated.sequence([
                Animated.parallel([
                    Animated.spring(doneScl, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
                    Animated.timing(doneOp,  { toValue: 1, duration: 350, useNativeDriver: true }),
                ]),
                Animated.delay(700),
            ]).start(() => onDone());
        }, 3200);
        return () => clearTimeout(t);
    }, []);

    const spin = dotAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

    return (
        <View style={styles.analyzingWrap}>
            <Animated.View style={[styles.analyzingIconRing, { opacity: iconOp, transform: [{ scale: iconScl }] }]}>
                {!done ? (
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                        <MaterialCommunityIcons name="loading" size={40} color="#00E5BE" />
                    </Animated.View>
                ) : (
                    <Animated.View style={{ opacity: doneOp, transform: [{ scale: doneScl }] }}>
                        <MaterialCommunityIcons name="check-circle" size={44} color="#4ADE80" />
                    </Animated.View>
                )}
            </Animated.View>

            <Text style={styles.analyzingTitle}>
                {done ? `Done, ${name || 'let\'s go'}! 🎉` : 'Building your plan…'}
            </Text>
            {!done && (
                <Animated.Text style={[styles.analyzingPhrase, { opacity: phraseOp }]}>
                    {ANALYZING_PHRASES[phraseIdx]}
                </Animated.Text>
            )}
            {done && (
                <Animated.Text style={[styles.analyzingPhrase, { opacity: doneOp, color: '#4ADE80' }]}>
                    Your personalized plan is ready
                </Animated.Text>
            )}
        </View>
    );
};

// ─── Macro bar ────────────────────────────────────────────────────────────────

const MacroBar = ({ label, grams, calories, color, totalCals }) => {
    const pct  = totalCals > 0 ? Math.round((calories / totalCals) * 100) : 0;
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(anim, { toValue: pct / 100, duration: 700, delay: 300, useNativeDriver: false }).start();
    }, [pct]);
    const barW = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
    return (
        <View style={styles.macroRow}>
            <View style={styles.macroLabels}>
                <Text style={styles.macroName}>{label}</Text>
                <Text style={[styles.macroGrams, { color }]}>{grams}g</Text>
            </View>
            <View style={styles.macroTrack}>
                <Animated.View style={[styles.macroFill, { width: barW, backgroundColor: color }]} />
            </View>
            <Text style={styles.macroPct}>{pct}%</Text>
        </View>
    );
};

// ─── Plan preview ─────────────────────────────────────────────────────────────

const PlanPreview = ({ data }) => {
    const plan = buildPlan(data);
    const { macros, bmi, bmiCat, focuses, limitations, label, color, icon, sessions, intensity, tdee } = plan;
    const op = useRef(new Animated.Value(0)).current;
    const ty = useRef(new Animated.Value(20)).current;
    useEffect(() => {
        Animated.parallel([
            Animated.timing(op, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(ty, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <Animated.ScrollView showsVerticalScrollIndicator={false} style={{ opacity: op, transform: [{ translateY: ty }] }} contentContainerStyle={{ gap: 12, paddingBottom: 8 }}>

            {/* Hero */}
            <LinearGradient colors={[color + '22', color + '06']} style={[styles.previewHero, { borderColor: color + '40' }]}>
                <View style={[styles.previewHeroIcon, { backgroundColor: color + '22' }]}>
                    <MaterialCommunityIcons name={icon} size={36} color={color} />
                </View>
                <Text style={[styles.previewEyebrow, { color }]}>YOUR PLAN</Text>
                <Text style={styles.previewTitle}>{label}</Text>
                <Text style={styles.previewSub}>Personalized for your body and goals</Text>
            </LinearGradient>

            {/* 2×2 stats */}
            <View style={styles.previewGrid}>
                {[
                    { icon: 'calendar-week', label: 'Sessions',    value: sessions,              color: '#00C2FF' },
                    { icon: 'speedometer',   label: 'Intensity',   value: intensity,             color: '#FFB800' },
                    { icon: 'fire',          label: 'Daily Cals',  value: `${macros.target}`,    color: '#FF4D2E' },
                    { icon: 'database',      label: 'Maintenance', value: `${tdee} kcal`,        color: '#6C63FF' },
                ].map(item => (
                    <View key={item.label} style={[styles.previewCell, { borderColor: item.color + '25' }]}>
                        <MaterialCommunityIcons name={item.icon} size={16} color={item.color} />
                        <Text style={[styles.previewCellVal, { color: item.color }]}>{item.value}</Text>
                        <Text style={styles.previewCellLbl}>{item.label}</Text>
                    </View>
                ))}
            </View>

            {/* BMI card */}
            {bmi && bmiCat && (
                <View style={[styles.bmiCard, { borderColor: bmiCat.color + '40' }]}>
                    <View style={styles.bmiLeft}>
                        <Text style={styles.bmiEyebrow}>BODY MASS INDEX</Text>
                        <Text style={[styles.bmiNum, { color: bmiCat.color }]}>{bmi}</Text>
                        <View style={[styles.bmiCatBadge, { backgroundColor: bmiCat.color + '20' }]}>
                            <Text style={[styles.bmiCatTxt, { color: bmiCat.color }]}>{bmiCat.label}</Text>
                        </View>
                    </View>
                    <View style={styles.bmiScale}>
                        {[
                            { label: 'Under', color: '#00C2FF', lo: 0,    hi: 18.5 },
                            { label: 'OK',    color: '#4ADE80', lo: 18.5, hi: 25 },
                            { label: 'Over',  color: '#FFB800', lo: 25,   hi: 30 },
                            { label: 'Obese', color: '#FF4D2E', lo: 30,   hi: 99 },
                        ].map(seg => {
                            const active = bmi >= seg.lo && bmi < seg.hi;
                            return (
                                <View key={seg.label} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                                    <View style={[styles.bmiSegBar, { backgroundColor: seg.color + (active ? 'FF' : '28') }]} />
                                    <Text style={[styles.bmiSegLbl, { color: active ? seg.color : '#2A2A3A' }]}>{seg.label}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            )}

            {/* Macros */}
            <View style={styles.macroCard}>
                <Text style={styles.macroCardTitle}>Daily Macros</Text>
                <Text style={styles.macroCardSub}>{macros.target} kcal target / day</Text>
                <View style={{ gap: 10, marginTop: 14 }}>
                    <MacroBar label="Protein" grams={macros.prot} calories={macros.prot * 4} color="#FF4D2E" totalCals={macros.target} />
                    <MacroBar label="Carbs"   grams={macros.carb} calories={macros.carb * 4} color="#FFB800" totalCals={macros.target} />
                    <MacroBar label="Fat"     grams={macros.fat}  calories={macros.fat * 9}  color="#00E5BE" totalCals={macros.target} />
                </View>
            </View>

            {/* Focus areas */}
            {focuses.length > 0 && (
                <View style={styles.focusCard}>
                    <Text style={styles.focusEyebrow}>TRAINING FOCUS</Text>
                    <View style={styles.focusTags}>
                        {focuses.map(f => (
                            <View key={f} style={[styles.focusTag, { borderColor: color + '40', backgroundColor: color + '10' }]}>
                                <Text style={[styles.focusTagTxt, { color }]}>{f}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {limitations.length > 0 && (
                <View style={styles.focusCard}>
                    <Text style={styles.focusEyebrow}>SAFETY ADAPTATIONS</Text>
                    <View style={styles.focusTags}>
                        {limitations.map(item => (
                            <View key={item} style={[styles.focusTag, { borderColor: '#FFB80055', backgroundColor: '#FFB80012' }]}>
                                <Text style={[styles.focusTagTxt, { color: '#FFB800' }]}>{item}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </Animated.ScrollView>
    );
};

// ─── Submit celebration overlay ───────────────────────────────────────────────

const SuccessFlash = ({ name, onDone }) => {
    const scl = useRef(new Animated.Value(0.7)).current;
    const op  = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Animated.sequence([
            Animated.parallel([
                Animated.spring(scl, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
                Animated.timing(op,  { toValue: 1, duration: 300, useNativeDriver: true }),
            ]),
            Animated.delay(900),
            Animated.timing(op, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => onDone());
    }, []);
    return (
        <Animated.View style={[styles.flashOverlay, { opacity: op }]}>
            <Animated.View style={[styles.flashCard, { transform: [{ scale: scl }] }]}>
                <MaterialCommunityIcons name="check-circle" size={56} color="#4ADE80" />
                <Text style={styles.flashTitle}>You're all set{name ? `, ${name}` : ''}! 🚀</Text>
                <Text style={styles.flashSub}>Your plan is saved and ready to go.</Text>
            </Animated.View>
        </Animated.View>
    );
};

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
    const { user } = useUser();
    const navigation = useNavigation();
    const { userProfile, saveUserProfile, isUserProfileHydrated } = useContext(FitnessItems);
    const clerkUserId = user?.id || null;
    const onboardingDraftStorageKey = useMemo(
        () => getOnboardingDraftStorageKey(clerkUserId),
        [clerkUserId]
    );

    const [step,           setStep]           = useState(0);
    const [direction,      setDirection]      = useState('forward');
    const [stepKey,        setStepKey]        = useState(0);
    const [showAnalyzing,  setShowAnalyzing]  = useState(false);
    const [showFlash,      setShowFlash]      = useState(false);
    const [touched,        setTouched]        = useState({});

    // Form state
    const [name,           setName]           = useState('');
    const [age,            setAge]            = useState('');
    const [gender,         setGender]         = useState('');
    const [weight,         setWeight]         = useState('');
    const [weightUnit,     setWeightUnit]     = useState('kg');
    const [heightCm,       setHeightCm]       = useState('');
    const [heightFt,       setHeightFt]       = useState('');
    const [heightIn,       setHeightIn]       = useState('');
    const [heightUnit,     setHeightUnit]     = useState('cm');
    const [bodyFat,        setBodyFat]        = useState('');
    const [goal,           setGoal]           = useState('');
    const [fitnessLevel,   setFitnessLevel]   = useState('');
    const [activityLevel,  setActivityLevel]  = useState('');
    const [focusAreas,     setFocusAreas]     = useState([]);
    const [workoutLocation,setWorkoutLocation]= useState('');
    const [equipment,      setEquipment]      = useState([]);
    const [limitations,    setLimitations]    = useState([]);
    const [isDraftHydrated,setIsDraftHydrated]= useState(false);
    const [showResumeToast,setShowResumeToast]= useState(false);

    // Input refs
    const nameRef   = useRef(null);
    const ageRef    = useRef(null);
    const weightRef = useRef(null);
    const cmRef     = useRef(null);
    const ftRef     = useRef(null);
    const inRef     = useRef(null);
    const bfRef     = useRef(null);
    const resumeToastOp = useRef(new Animated.Value(0)).current;
    const resumeToastTy = useRef(new Animated.Value(-8)).current;

    const touch = f => setTouched(p => ({ ...p, [f]: true }));

    // Hydrate screen from latest source (draft or saved profile)
    useEffect(() => {
        if (!isUserProfileHydrated) return;
        let isActive = true;

        const hydrate = async () => {
            setIsDraftHydrated(false);

            const draftRaw = await readValueByKey(onboardingDraftStorageKey);
            const draft = safeParseObject(draftRaw);
            const profileTs = new Date(userProfile?.updatedAt || 0).getTime();
            const draftTs = new Date(draft.updatedAt || 0).getTime();
            const hasDraft = Object.keys(draft).length > 0;
            const useDraft = hasDraft && draftTs >= profileTs;
            const source = useDraft ? draft : (userProfile || {});

            if (!isActive) return;

            setName(String(source.name || ''));
            setAge(String(source.age || ''));
            setGender(String(source.gender || ''));
            setWeight(String(source.weight || ''));
            setWeightUnit(source.weightUnit || 'kg');
            setHeightUnit(source.heightUnit || 'cm');
            if (source.heightUnit === 'ft') {
                setHeightFt(String(source.heightFt || ''));
                setHeightIn(String(source.heightIn || ''));
                setHeightCm('');
            } else {
                setHeightCm(String(source.height || ''));
                setHeightFt('');
                setHeightIn('');
            }
            setBodyFat(String(source.bodyFat || ''));
            setGoal(String(source.goal || ''));
            setFitnessLevel(String(source.fitnessLevel || ''));
            setActivityLevel(String(source.activityLevel || ''));
            setFocusAreas(Array.isArray(source.focusAreas) ? source.focusAreas : []);
            setWorkoutLocation(String(source.workoutLocation || ''));
            setEquipment(Array.isArray(source.equipment) ? source.equipment : []);
            setLimitations(Array.isArray(source.limitations) ? source.limitations : []);
            setTouched({});

            const parsedStep = Number.isInteger(source.step) ? source.step : 0;
            const clampedStep = Math.min(Math.max(0, parsedStep), TOTAL_STEPS - 1);
            setStep(useDraft ? clampedStep : 0);
            setDirection('forward');
            setStepKey(k => k + 1);
            setShowResumeToast(useDraft);
            setIsDraftHydrated(true);
        };

        hydrate();
        return () => {
            isActive = false;
        };
    }, [onboardingDraftStorageKey, isUserProfileHydrated]);

    // Persist draft progress so onboarding can resume after app close
    useEffect(() => {
        if (!isDraftHydrated) return;
        if (showFlash) return;
        const payload = {
            step,
            name,
            age,
            gender,
            weight,
            weightUnit,
            heightCm,
            heightFt,
            heightIn,
            heightUnit,
            bodyFat,
            goal,
            fitnessLevel,
            activityLevel,
            focusAreas,
            workoutLocation,
            equipment,
            limitations,
            updatedAt: new Date().toISOString(),
        };
        writeValueByKey(onboardingDraftStorageKey, JSON.stringify(payload));
    }, [
        isDraftHydrated,
        onboardingDraftStorageKey,
        step,
        name,
        age,
        gender,
        weight,
        weightUnit,
        heightCm,
        heightFt,
        heightIn,
        heightUnit,
        bodyFat,
        goal,
        fitnessLevel,
        activityLevel,
        focusAreas,
        workoutLocation,
        equipment,
        limitations,
        showFlash,
    ]);

    // Resume toast animation
    useEffect(() => {
        if (!showResumeToast) return;
        resumeToastOp.setValue(0);
        resumeToastTy.setValue(-8);
        const animation = Animated.sequence([
            Animated.parallel([
                Animated.timing(resumeToastOp, { toValue: 1, duration: 260, useNativeDriver: true }),
                Animated.spring(resumeToastTy, { toValue: 0, tension: 120, friction: 10, useNativeDriver: true }),
            ]),
            Animated.delay(2200),
            Animated.timing(resumeToastOp, { toValue: 0, duration: 220, useNativeDriver: true }),
        ]);
        animation.start(() => setShowResumeToast(false));
        return () => animation.stop();
    }, [showResumeToast, resumeToastOp, resumeToastTy]);

    // Auto-focus text inputs
    useEffect(() => {
        if (!isDraftHydrated) return;
        const map = {
            0: nameRef,
            1: ageRef,
            3: weightRef,
            4: heightUnit === 'cm' ? cmRef : ftRef,
            5: bfRef,
        };
        const ref = map[step];
        if (ref) {
            const t = setTimeout(() => ref.current?.focus(), 400);
            return () => clearTimeout(t);
        }
    }, [step, heightUnit, isDraftHydrated]);

    // ── Derived values ────────────────────────────────────────────────────────
    const parsedAge    = Number.parseInt(age, 10);
    const parsedWeight = Number.parseFloat(weight);
    const parsedBF     = Number.parseFloat(bodyFat);
    const heightValid  = heightUnit === 'cm'
        ? (parseFloat(heightCm) > 50 && parseFloat(heightCm) <= 300)
        : (Number.isInteger(parseInt(heightFt)) && parseInt(heightFt) >= 1 && parseInt(heightFt) <= 9 && parseFloat(heightIn) >= 0 && parseFloat(heightIn) < 12);
    const bfValid = bodyFat === '' || (Number.isFinite(parsedBF) && parsedBF > 2 && parsedBF < 70);

    const errors = {
        age:      touched.age      && (!Number.isInteger(parsedAge)   || parsedAge < 10    || parsedAge > 120)    ? 'Please enter an age between 10 and 120'          : null,
        weight:   touched.weight   && (!Number.isFinite(parsedWeight) || parsedWeight <= 0 || parsedWeight > 500) ? 'Please enter a valid weight'                     : null,
        heightCm: touched.heightCm && heightUnit === 'cm' && !heightValid                                         ? 'Please enter a height between 50 and 300 cm'     : null,
        heightFt: touched.heightFt && heightUnit === 'ft' && !heightValid                                         ? 'Please enter valid feet (1–9) and inches (0–11)' : null,
        bodyFat:  touched.bodyFat  && !bfValid                                                                    ? 'Please enter a body fat % between 2 and 70'      : null,
    };

    // ── Per-step validity ─────────────────────────────────────────────────────
    const stepValid = useMemo(() => [
        name.trim().length >= 1,                                                        //  0 name
        Number.isInteger(parsedAge)   && parsedAge >= 10   && parsedAge <= 120,         //  1 age
        !!gender,                                                                        //  2 gender
        Number.isFinite(parsedWeight) && parsedWeight > 0  && parsedWeight <= 500,      //  3 weight
        heightValid,                                                                     //  4 height
        bfValid,                                                                         //  5 body fat (optional)
        !!goal,                                                                          //  6 goal
        !!fitnessLevel,                                                                  //  7 fitness level
        !!activityLevel,                                                                 //  8 activity level
        focusAreas.length > 0,                                                           //  9 focus areas
        !!workoutLocation,                                                               // 10 workout location
        equipment.length > 0,                                                            // 11 equipment
        true,                                                                            // 12 limitations (optional)
        true,                                                                            // 13 plan preview
    ], [name, parsedAge, gender, parsedWeight, heightValid, bfValid, goal, fitnessLevel, activityLevel, focusAreas, workoutLocation, equipment]);

    // ── Navigation ────────────────────────────────────────────────────────────
    const goTo = (next, dir = 'forward') => { setDirection(dir); setStep(next); setStepKey(k => k + 1); };
    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (step === 0) { navigation.goBack(); return; }
        goTo(step - 1, 'back');
    };
    const handleNext = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (step === 12) {
            // Trigger analyzing animation before showing plan
            setShowAnalyzing(true);
        } else if (step < TOTAL_STEPS - 1) {
            goTo(step + 1, 'forward');
        }
    };

    // Auto-advance on single-select steps with haptic
    const autoAdvance = (setterFn, value, delay = 350) => {
        setterFn(value);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setTimeout(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            goTo(step + 1, 'forward');
        }, delay);
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        const computedCm = toCm(heightCm, heightFt, heightIn, heightUnit);
        const saved = await saveUserProfile({
            name:          name.trim(),
            age:           parsedAge,
            weight:        parsedWeight,
            weightUnit,
            height:        computedCm,
            heightUnit,
            heightFt:      heightUnit === 'ft' ? parseInt(heightFt) : undefined,
            heightIn:      heightUnit === 'ft' ? parseFloat(heightIn) : undefined,
            bodyFat:       bodyFat !== '' ? parsedBF : null,
            gender,
            goal,
            fitnessLevel,
            activityLevel,
            focusAreas,
            workoutLocation,
            equipment,
            limitations,
            updatedAt:     new Date().toISOString(),
        });
        if (saved) {
            setIsDraftHydrated(false);
            await removeValueByKey(onboardingDraftStorageKey);
            setShowFlash(true);
        }
    };

    // ── Toggles ───────────────────────────────────────────────────────────────
    const toggleFocus = val => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setFocusAreas(p => p.includes(val) ? p.filter(v => v !== val) : [...p, val]);
    };
    const toggleEquipment = val => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setEquipment(p => p.includes(val) ? p.filter(v => v !== val) : [...p, val]);
    };
    const toggleLimitation = val => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setLimitations(prev => {
            if (val === 'none') {
                return prev.includes('none') ? [] : ['none'];
            }
            const withoutNone = prev.filter(v => v !== 'none');
            return withoutNone.includes(val)
                ? withoutNone.filter(v => v !== val)
                : [...withoutNone, val];
        });
    };

    // ── Feedback bubble source ────────────────────────────────────────────────
    const feedbackOption = useMemo(() => {
        if (step === 6 && goal)          return GOAL_OPTIONS.find(o => o.value === goal);
        if (step === 7 && fitnessLevel)  return FITNESS_LEVEL_OPTIONS.find(o => o.value === fitnessLevel);
        if (step === 8 && activityLevel) return ACTIVITY_OPTIONS.find(o => o.value === activityLevel);
        return null;
    }, [step, goal, fitnessLevel, activityLevel]);

    const bodyFatScaleSegments = useMemo(
        () => BODY_FAT_SEGMENTS_BY_GENDER[gender] || BODY_FAT_SEGMENTS_BY_GENDER.default,
        [gender]
    );

    const finalCtaLabel = useMemo(
        () => GOAL_CTA_LABELS[goal] || 'Start Your Plan ⚡',
        [goal]
    );

    const finalCtaTheme = useMemo(
        () => GOAL_CTA_THEMES[goal] || GOAL_CTA_THEMES.default,
        [goal]
    );

    // ── Plan preview data ─────────────────────────────────────────────────────
    const previewData = useMemo(() => {
        const cm = toCm(heightCm, heightFt, heightIn, heightUnit);
        const kg = toKg(parsedWeight || 70, weightUnit);
        return { goal, fitnessLevel, activityLevel, gender, age, weightKg: kg, heightCm: cm, bodyFatPct: bodyFat || null, focusAreas, limitations };
    }, [goal, fitnessLevel, activityLevel, gender, age, parsedWeight, weightUnit, heightCm, heightFt, heightIn, heightUnit, bodyFat, focusAreas, limitations]);

    // ── Step config ───────────────────────────────────────────────────────────
    const STEPS = useMemo(() => [
        { emoji: '👋', question: 'What should we call you?',       sub: "We'll use your name to personalize your experience." },
        { emoji: '🎂', question: 'How old are you?',                sub: 'Calibrates workout intensity and recovery time.' },
        { emoji: '🧬', question: "What's your biological sex?",     sub: 'Helps calculate accurate calorie targets.' },
        { emoji: '⚖️',  question: 'What do you currently weigh?',    sub: 'Your starting point — we never judge, only plan.' },
        { emoji: '📏', question: 'How tall are you?',               sub: 'Used to calculate BMI and body composition goals.' },
        { emoji: '📊', question: 'Know your body fat %?',           sub: 'Optional — unlocks more accurate macro targets.', optional: true },
        { emoji: '🎯', question: "What's your primary goal?",       sub: 'This shapes every workout, every week.' },
        { emoji: '💪', question: "What's your current level?",      sub: 'Be honest — the right start beats burning out.' },
        { emoji: '🏃', question: 'How active is your lifestyle?',   sub: 'Tells us how many calories you burn outside the gym.' },
        { emoji: '🎯', question: 'Which areas do you want to focus on?', sub: 'Pick all that apply — we\'ll prioritize these muscle groups.' },
        { emoji: '🏋️', question: 'Where do you train?',             sub: 'We\'ll build your program around your environment.' },
        { emoji: '🔧', question: 'What equipment do you have access to?', sub: 'We\'ll only program exercises you can actually do.' },
        { emoji: '🛟', question: 'Any pain points or limitations?',   sub: 'Optional — we\'ll avoid risky movements and swap safer alternatives.', optional: true },
        { emoji: '✨', question: 'Your plan is ready.',              sub: `Built specifically for you, ${name || 'athlete'}.` },
    ], [name]);

    const cfg        = STEPS[step];
    const isLastStep = step === TOTAL_STEPS - 1;
    const accentColor = feedbackOption?.color || '#00E5BE';

    // ── Equipment options based on selected location ───────────────────────────
    const equipmentOptions = EQUIPMENT_BY_LOCATION[workoutLocation] || [];

    // ── Render step content ───────────────────────────────────────────────────
    const renderContent = () => {
        switch (step) {
            case 0: return (
                <View style={styles.inputBlock}>
                    <TextInput
                        ref={nameRef}
                        value={name}
                        onChangeText={setName}
                        placeholder="Alex"
                        placeholderTextColor="#222"
                        style={styles.bigInput}
                        autoCapitalize="words"
                        returnKeyType="done"
                        onSubmitEditing={() => stepValid[0] && handleNext()}
                    />
                    <Text style={styles.bigUnit}>that's you 👆</Text>
                </View>
            );

            case 1: return (
                <View style={styles.inputBlock}>
                    <TextInput ref={ageRef} value={age} onChangeText={setAge} onBlur={() => touch('age')} keyboardType="number-pad" placeholder="24" placeholderTextColor="#222" style={[styles.bigInput, errors.age && styles.bigInputError]} maxLength={3} returnKeyType="done" onSubmitEditing={() => stepValid[1] && handleNext()} />
                    <Text style={styles.bigUnit}>years old</Text>
                    <ErrorHint message={errors.age} />
                </View>
            );

            case 2: return (
                <View style={styles.pillGrid}>
                    {GENDER_OPTIONS.map(opt => (
                        <GenderPill key={opt.value} option={opt} selected={gender === opt.value}
                            onPress={() => autoAdvance(setGender, opt.value)} />
                    ))}
                </View>
            );

            case 3: return (
                <View style={styles.inputBlock}>
                    <View style={styles.inputRowCenter}>
                        <TextInput ref={weightRef} value={weight} onChangeText={setWeight} onBlur={() => touch('weight')} keyboardType="decimal-pad" placeholder={weightUnit === 'kg' ? '72' : '160'} placeholderTextColor="#222" style={[styles.bigInput, { flex: 1 }, errors.weight && styles.bigInputError]} maxLength={6} returnKeyType="done" onSubmitEditing={() => stepValid[3] && handleNext()} />
                        <UnitToggle options={['kg', 'lbs']} selected={weightUnit} onSelect={setWeightUnit} vertical />
                    </View>
                    <ErrorHint message={errors.weight} />
                </View>
            );

            case 4: return (
                <View style={styles.inputBlock}>
                    <UnitToggle options={['cm', 'ft + in']} selected={heightUnit === 'ft' ? 'ft + in' : 'cm'} onSelect={v => setHeightUnit(v === 'ft + in' ? 'ft' : 'cm')} />
                    <View style={{ height: 10 }} />
                    {heightUnit === 'cm' ? (
                        <View style={styles.inputRowCenter}>
                            <TextInput ref={cmRef} value={heightCm} onChangeText={setHeightCm} onBlur={() => touch('heightCm')} keyboardType="decimal-pad" placeholder="175" placeholderTextColor="#222" style={[styles.bigInput, { flex: 1 }, errors.heightCm && styles.bigInputError]} maxLength={5} returnKeyType="done" onSubmitEditing={() => stepValid[4] && handleNext()} />
                            <Text style={styles.bigUnit}>cm</Text>
                        </View>
                    ) : (
                        <View style={styles.ftInRow}>
                            <View style={styles.ftBlock}>
                                <TextInput ref={ftRef} value={heightFt} onChangeText={setHeightFt} onBlur={() => touch('heightFt')} keyboardType="number-pad" placeholder="5" placeholderTextColor="#222" style={[styles.bigInput, { textAlign: 'center' }, errors.heightFt && styles.bigInputError]} maxLength={1} returnKeyType="next" onSubmitEditing={() => inRef.current?.focus()} />
                                <Text style={styles.ftLabel}>ft</Text>
                            </View>
                            <Text style={styles.ftSep}>'</Text>
                            <View style={styles.ftBlock}>
                                <TextInput ref={inRef} value={heightIn} onChangeText={setHeightIn} onBlur={() => touch('heightFt')} keyboardType="decimal-pad" placeholder="11" placeholderTextColor="#222" style={[styles.bigInput, { textAlign: 'center' }, errors.heightFt && styles.bigInputError]} maxLength={4} returnKeyType="done" onSubmitEditing={() => stepValid[4] && handleNext()} />
                                <Text style={styles.ftLabel}>in</Text>
                            </View>
                        </View>
                    )}
                    <ErrorHint message={errors.heightCm || errors.heightFt} />
                </View>
            );

            case 5: return (
                <View style={styles.inputBlock}>
                    <View style={styles.inputRowCenter}>
                        <TextInput ref={bfRef} value={bodyFat} onChangeText={setBodyFat} onBlur={() => touch('bodyFat')} keyboardType="decimal-pad" placeholder="18" placeholderTextColor="#222" style={[styles.bigInput, { flex: 1 }, errors.bodyFat && styles.bigInputError]} maxLength={4} returnKeyType="done" onSubmitEditing={handleNext} />
                        <Text style={styles.bigUnit}>%</Text>
                    </View>
                    <ErrorHint message={errors.bodyFat} />
                    <View style={styles.bfScaleRow}>
                        {bodyFatScaleSegments.map(seg => {
                            const active = Number.isFinite(parsedBF) && parsedBF >= seg.lo && parsedBF < seg.hi;
                            return (
                                <View key={seg.label} style={styles.bfSegment}>
                                    <View style={[styles.bfSegBar, { backgroundColor: seg.color + (active ? 'FF' : '25') }]} />
                                    <Text style={[styles.bfSegLabel, { color: active ? seg.color : '#2A2A3A' }]}>{seg.label}</Text>
                                    <Text style={[styles.bfSegRange,  { color: active ? seg.color : '#1A1A24' }]}>{seg.range}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            );

            case 6: return (
                <View style={styles.cardList}>
                    {GOAL_OPTIONS.map(opt => (
                        <OptionCard key={opt.value} option={opt} selected={goal === opt.value}
                            onPress={() => autoAdvance(setGoal, opt.value)} />
                    ))}
                </View>
            );

            case 7: return (
                <View style={styles.cardList}>
                    {FITNESS_LEVEL_OPTIONS.map(opt => (
                        <OptionCard key={opt.value} option={opt} selected={fitnessLevel === opt.value}
                            onPress={() => autoAdvance(setFitnessLevel, opt.value)} />
                    ))}
                </View>
            );

            case 8: return (
                <View style={styles.cardList}>
                    {ACTIVITY_OPTIONS.map(opt => (
                        <OptionCard key={opt.value} option={opt} selected={activityLevel === opt.value}
                            onPress={() => autoAdvance(setActivityLevel, opt.value)} />
                    ))}
                </View>
            );

            case 9: return (
                <View style={styles.chipGrid}>
                    {FOCUS_OPTIONS.map(opt => (
                        <MultiChip key={opt.value} option={opt} selected={focusAreas.includes(opt.value)} onPress={() => toggleFocus(opt.value)} color={opt.color} />
                    ))}
                </View>
            );

            case 10: return (
                <View style={styles.cardList}>
                    {LOCATION_OPTIONS.map(opt => (
                        <OptionCard key={opt.value} option={opt} selected={workoutLocation === opt.value}
                            onPress={() => autoAdvance(val => { setWorkoutLocation(val); setEquipment([]); }, opt.value)} />
                    ))}
                </View>
            );

            case 11: return equipmentOptions.length > 0 ? (
                <View style={styles.chipGrid}>
                    {equipmentOptions.map(opt => (
                        <MultiChip key={opt.value} option={opt} selected={equipment.includes(opt.value)} onPress={() => toggleEquipment(opt.value)} color="#00E5BE" />
                    ))}
                </View>
            ) : null;

            case 12: return (
                <View style={styles.chipGrid}>
                    {LIMITATION_OPTIONS.map(opt => (
                        <MultiChip
                            key={opt.value}
                            option={opt}
                            selected={limitations.includes(opt.value)}
                            onPress={() => toggleLimitation(opt.value)}
                            color={opt.color}
                        />
                    ))}
                </View>
            );

            case 13: return <PlanPreview data={previewData} />;

            default: return null;
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#0D0D0F', '#111118', '#18181F']} style={StyleSheet.absoluteFillObject} />
            <View style={[styles.ambientGlow, { backgroundColor: accentColor + '09' }]} pointerEvents="none" />

            <SafeAreaView style={styles.safe}>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>

                    {/* Top bar */}
                    <View style={styles.topBar}>
                        <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
                            <Feather name="arrow-left" size={18} color="#A5A5BE" />
                        </TouchableOpacity>
                        <LinearProgress current={step} total={TOTAL_STEPS} />
                    </View>
                    {showResumeToast && (
                        <Animated.View style={[styles.resumeToast, { opacity: resumeToastOp, transform: [{ translateY: resumeToastTy }] }]}>
                            <Feather name="refresh-cw" size={13} color="#00E5BE" />
                            <Text style={styles.resumeToastTxt}>Resumed from where you left off</Text>
                        </Animated.View>
                    )}

                    {/* Step */}
                    <StepWrapper key={stepKey} direction={direction}>
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                            <Text style={styles.stepEmoji}>{cfg.emoji}</Text>
                            <View style={styles.questionRow}>
                                <Text style={styles.question}>{cfg.question}</Text>
                                {cfg.optional && (
                                    <View style={styles.optionalBadge}><Text style={styles.optionalText}>Optional</Text></View>
                                )}
                            </View>
                            <Text style={styles.questionSub}>{cfg.sub}</Text>
                            {step === 0 && (
                                <View style={styles.startMetaWrap}>
                                    <View style={styles.startMetaPill}>
                                        <Feather name="clock" size={12} color="#00E5BE" />
                                        <Text style={styles.startMetaText}>~2 min setup</Text>
                                    </View>
                                    <View style={styles.startMetaPill}>
                                        <MaterialCommunityIcons name="shield-lock-outline" size={13} color="#6C63FF" />
                                        <Text style={styles.startMetaText}>Used only to personalize training/macros</Text>
                                    </View>
                                </View>
                            )}
                            <View style={styles.contentArea}>{renderContent()}</View>
                            {feedbackOption && <FeedbackBubble message={feedbackOption.feedback} color={feedbackOption.color} />}
                            <View style={{ height: 16 }} />
                        </ScrollView>
                    </StepWrapper>

                    {/* CTA footer */}
                    <View style={styles.footer}>
                        {/* Only show Continue for non-auto-advance steps */}
                        {![2, 6, 7, 8, 10].includes(step) && (
                            <TouchableOpacity
                                onPress={isLastStep ? handleSubmit : handleNext}
                                disabled={!stepValid[step]}
                                activeOpacity={0.88}
                                style={[styles.ctaBtn, !stepValid[step] && styles.ctaBtnDim]}
                            >
                                <LinearGradient
                                    colors={stepValid[step]
                                        ? isLastStep ? finalCtaTheme.colors : ['#00E5BE', '#00B89F']
                                        : ['#1E1E2A', '#161620']}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    style={styles.ctaBtnInner}
                                >
                                    <Text style={[styles.ctaTxt, isLastStep && { color: finalCtaTheme.textColor }, !stepValid[step] && styles.ctaTxtDim]}>
                                        {isLastStep ? finalCtaLabel : 'Continue'}
                                    </Text>
                                    {!isLastStep && <Feather name="arrow-right" size={16} color={stepValid[step] ? '#041018' : '#333'} />}
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                        {cfg.optional && (
                            <TouchableOpacity onPress={handleNext} activeOpacity={0.7}>
                                <Text style={styles.skipLink}>Skip this step</Text>
                            </TouchableOpacity>
                        )}
                        {[2, 6, 7, 8, 10].includes(step) && (
                            <Text style={styles.tapHint}>Tap an option above to continue</Text>
                        )}
                    </View>

                </KeyboardAvoidingView>
            </SafeAreaView>

            {/* Analyzing overlay */}
            {showAnalyzing && (
                <View style={StyleSheet.absoluteFillObject}>
                    <LinearGradient colors={['#0D0D0F', '#111118', '#18181F']} style={StyleSheet.absoluteFillObject} />
                    <SafeAreaView style={{ flex: 1, justifyContent: 'center' }}>
                        <AnalyzingScreen
                            name={name.trim().split(' ')[0]}
                            onDone={() => {
                                setShowAnalyzing(false);
                                goTo(13, 'forward');
                            }}
                        />
                    </SafeAreaView>
                </View>
            )}

            {/* Success flash overlay */}
            {showFlash && (
                <SuccessFlash
                    name={name.trim().split(' ')[0]}
                    onDone={() => navigation.replace('App')}
                />
            )}
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container:   { flex: 1, backgroundColor: '#0D0D0F' },
    safe:        { flex: 1 },
    ambientGlow: { ...StyleSheet.absoluteFillObject },

    topBar:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, gap: 12 },
    backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    resumeToast: { marginHorizontal: 16, marginTop: -4, marginBottom: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(0,229,190,0.35)', backgroundColor: 'rgba(0,229,190,0.1)', paddingHorizontal: 11, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 7 },
    resumeToastTxt: { color: '#A5FFE9', fontSize: 12, fontWeight: '700' },

    // Linear progress bar
    progressWrap:  { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
    progressTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.07)', overflow: 'hidden' },
    progressFill:  { height: '100%', borderRadius: 2, backgroundColor: '#00E5BE' },
    progressPct:   { color: '#2A2A3A', fontSize: 11, fontWeight: '700', width: 32, textAlign: 'right' },

    scrollContent: { paddingHorizontal: 24, paddingTop: 4, paddingBottom: 24 },

    stepEmoji:    { fontSize: 46, marginBottom: 14 },
    questionRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' },
    question:     { color: '#FFFFFF', fontSize: 26, fontWeight: '900', letterSpacing: -0.7, lineHeight: 32, flexShrink: 1 },
    questionSub:  { color: '#444', fontSize: 13, lineHeight: 19, marginBottom: 10 },
    startMetaWrap:{ gap: 8, marginBottom: 22 },
    startMetaPill:{ flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)', paddingHorizontal: 10, paddingVertical: 8 },
    startMetaText:{ color: '#A5A5BE', fontSize: 12, fontWeight: '600', flexShrink: 1 },
    optionalBadge:{ backgroundColor: 'rgba(255,184,0,0.12)', borderWidth: 1, borderColor: 'rgba(255,184,0,0.3)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    optionalText: { color: '#FFB800', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    contentArea:  { gap: 10 },

    inputBlock:     { gap: 6 },
    inputRowCenter: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    bigInput:       { color: '#FFFFFF', fontSize: 52, fontWeight: '900', letterSpacing: -2, paddingVertical: 0, borderBottomWidth: 2, borderBottomColor: 'rgba(0,229,190,0.35)', minWidth: 80 },
    bigInputError:  { borderBottomColor: 'rgba(255,77,46,0.8)' },
    bigUnit:        { color: '#2A2A3A', fontSize: 16, fontWeight: '600', marginTop: 4 },

    ftInRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
    ftBlock: { flex: 1, alignItems: 'center', gap: 6 },
    ftLabel: { color: '#333', fontSize: 13, fontWeight: '700' },
    ftSep:   { color: '#2A2A3A', fontSize: 38, fontWeight: '200', paddingBottom: 10 },

    unitToggle:    { flexDirection: 'row', alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    unitBtn:       { paddingHorizontal: 16, paddingVertical: 9, alignItems: 'center' },
    unitBtnSel:    { backgroundColor: 'rgba(0,229,190,0.15)' },
    unitBtnTxt:    { color: '#444', fontSize: 12, fontWeight: '800' },
    unitBtnTxtSel: { color: '#00E5BE' },

    errorHint:     { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 18 },
    errorHintText: { color: '#FF4D2E', fontSize: 11, fontWeight: '600' },

    bfScaleRow:  { flexDirection: 'row', gap: 4, marginTop: 18 },
    bfSegment:   { flex: 1, alignItems: 'center', gap: 4 },
    bfSegBar:    { width: '100%', height: 5, borderRadius: 3 },
    bfSegLabel:  { fontSize: 8, fontWeight: '800', textAlign: 'center' },
    bfSegRange:  { fontSize: 7, fontWeight: '500', textAlign: 'center' },

    pillGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    genderPill:      { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingVertical: 13, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)' },
    genderPillSel:   { borderColor: '#00E5BE', backgroundColor: '#00E5BE' },
    genderPillTxt:   { color: '#A5A5BE', fontSize: 14, fontWeight: '700' },
    genderPillTxtSel:{ color: '#041018' },

    cardList:     { gap: 10 },
    optionCard:   { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', backgroundColor: 'rgba(20,20,28,0.85)' },
    optionIconBg: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    optionText:   { flex: 1 },
    optionLabel:  { color: '#FFF', fontSize: 15, fontWeight: '800', marginBottom: 2 },
    optionDesc:   { color: '#444', fontSize: 12, lineHeight: 16 },

    chipGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    multiChip:   { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', backgroundColor: 'rgba(20,20,28,0.85)' },
    multiChipTxt:{ color: '#444', fontSize: 13, fontWeight: '700' },

    feedback:     { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 14, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
    feedbackText: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },

    footer:   { paddingHorizontal: 24, paddingBottom: 12, paddingTop: 8, gap: 8, alignItems: 'center' },
    ctaBtn:   { width: '100%', borderRadius: 16, overflow: 'hidden' },
    ctaBtnDim:{ opacity: 0.4 },
    ctaBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
    ctaTxt:   { color: '#041018', fontSize: 15, fontWeight: '900', letterSpacing: 0.2 },
    ctaTxtDim:{ color: '#333' },
    skipLink: { color: '#2A2A3A', fontSize: 12, fontWeight: '600' },
    tapHint:  { color: '#2A2A3A', fontSize: 11, fontWeight: '500' },

    // Analyzing screen
    analyzingWrap:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, paddingHorizontal: 32 },
    analyzingIconRing:{ width: 100, height: 100, borderRadius: 28, backgroundColor: 'rgba(0,229,190,0.08)', borderWidth: 1, borderColor: 'rgba(0,229,190,0.2)', alignItems: 'center', justifyContent: 'center' },
    analyzingTitle:   { color: '#FFFFFF', fontSize: 24, fontWeight: '900', letterSpacing: -0.5, textAlign: 'center' },
    analyzingPhrase:  { color: '#555', fontSize: 14, fontWeight: '500', textAlign: 'center', lineHeight: 20 },

    // Plan preview
    previewHero:     { alignItems: 'center', borderRadius: 20, borderWidth: 1, paddingVertical: 24, paddingHorizontal: 20, gap: 5 },
    previewHeroIcon: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    previewEyebrow:  { fontSize: 10, fontWeight: '900', letterSpacing: 2 },
    previewTitle:    { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
    previewSub:      { color: '#555', fontSize: 12, textAlign: 'center' },
    previewGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    previewCell:     { width: (width - 48 - 8) / 2, borderWidth: 1, borderRadius: 14, backgroundColor: 'rgba(20,20,28,0.9)', paddingVertical: 14, paddingHorizontal: 14, gap: 4 },
    previewCellVal:  { fontSize: 15, fontWeight: '900', letterSpacing: -0.3 },
    previewCellLbl:  { color: '#333', fontSize: 11, fontWeight: '600' },

    bmiCard:    { borderRadius: 16, borderWidth: 1, backgroundColor: 'rgba(20,20,28,0.9)', padding: 16, gap: 12 },
    bmiLeft:    { gap: 5 },
    bmiEyebrow: { color: '#333', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
    bmiNum:     { fontSize: 36, fontWeight: '900', letterSpacing: -1 },
    bmiCatBadge:{ alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    bmiCatTxt:  { fontSize: 12, fontWeight: '800' },
    bmiScale:   { flexDirection: 'row', gap: 4 },
    bmiSegBar:  { height: 5, borderRadius: 3, marginBottom: 4 },
    bmiSegLbl:  { fontSize: 8, fontWeight: '800', textAlign: 'center' },

    macroCard:      { borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(20,20,28,0.9)', padding: 16 },
    macroCardTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
    macroCardSub:   { color: '#444', fontSize: 11, marginTop: 2 },
    macroRow:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
    macroLabels:    { width: 64, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    macroName:      { color: '#555', fontSize: 11, fontWeight: '700' },
    macroGrams:     { fontSize: 11, fontWeight: '800' },
    macroTrack:     { flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
    macroFill:      { height: '100%', borderRadius: 3 },
    macroPct:       { color: '#2A2A3A', fontSize: 10, fontWeight: '700', width: 28, textAlign: 'right' },

    focusCard:    { borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(20,20,28,0.9)', padding: 16, gap: 10 },
    focusEyebrow: { color: '#333', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
    focusTags:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    focusTag:     { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
    focusTagTxt:  { fontSize: 12, fontWeight: '700' },

    // Success flash
    flashOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
    flashCard:    { backgroundColor: '#14141C', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)', padding: 32, alignItems: 'center', gap: 14, maxWidth: 300 },
    flashTitle:   { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: -0.5, textAlign: 'center' },
    flashSub:     { color: '#555', fontSize: 13, textAlign: 'center', lineHeight: 19 },
});
