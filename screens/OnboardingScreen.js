import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
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
import { FitnessItems } from '../Context';

const { width } = Dimensions.get('window');
const TOTAL_STEPS = 8; // 0-6 data steps + step 7 plan preview

// ─── Data maps ────────────────────────────────────────────────────────────────

const GENDER_OPTIONS = [
    { value: 'male',             label: 'Male',              icon: 'gender-male' },
    { value: 'female',           label: 'Female',            icon: 'gender-female' },
    { value: 'non_binary',       label: 'Non-binary',        icon: 'gender-non-binary' },
    { value: 'prefer_not_to_say',label: 'Prefer not to say', icon: 'account-question' },
];

const GOAL_OPTIONS = [
    {
        value: 'lose_weight',
        label: 'Lose Weight',
        icon: 'fire',
        color: '#FF4D2E',
        desc: 'Burn fat through cardio and calorie-conscious training.',
        feedback: "Great choice. We'll design high-intensity fat-burning sessions tailored to you.",
    },
    {
        value: 'gain_weight',
        label: 'Gain Weight',
        icon: 'scale-bathroom',
        color: '#FFB800',
        desc: 'Increase mass with progressive overload programs.',
        feedback: "We'll build a calorie surplus plan with progressive strength loading.",
    },
    {
        value: 'build_muscle',
        label: 'Build Muscle',
        icon: 'arm-flex',
        color: '#00E5BE',
        desc: 'Hypertrophy-focused workouts for lean muscle gain.',
        feedback: "Perfect. Hypertrophy splits incoming — expect volume, rest, and growth.",
    },
    {
        value: 'maintain_fitness',
        label: 'Maintain Fitness',
        icon: 'heart-pulse',
        color: '#6C63FF',
        desc: 'Keep your current fitness level with balanced routines.',
        feedback: "Smart. We'll keep your body challenged without overtaxing it.",
    },
];

const FITNESS_LEVEL_OPTIONS = [
    {
        value: 'beginner',
        label: 'Beginner',
        icon: 'seedling',
        color: '#00E5BE',
        desc: 'New to structured training. Focus on form and foundations.',
        feedback: "No rush — we'll start with the fundamentals and build up safely.",
    },
    {
        value: 'intermediate',
        label: 'Intermediate',
        icon: 'lightning-bolt',
        color: '#FFB800',
        desc: 'Some experience. Ready to push harder and add variety.',
        feedback: "Nice. We'll progressively challenge you with more complex movements.",
    },
    {
        value: 'advanced',
        label: 'Advanced',
        icon: 'trophy',
        color: '#FF4D2E',
        desc: 'Seasoned athlete. Expect high intensity and complex programming.',
        feedback: "Let's go. Elite-level programming with maximum intensity ahead.",
    },
];

const ACTIVITY_OPTIONS = [
    {
        value: 'sedentary',
        label: 'Sedentary',
        icon: 'sofa',
        color: '#6C63FF',
        desc: 'Desk job, minimal movement throughout the day.',
        feedback: "We'll factor in a lower baseline — your workouts will make a real difference.",
    },
    {
        value: 'light',
        label: 'Lightly Active',
        icon: 'walk',
        color: '#00C2FF',
        desc: 'Light walks or activity 1–3 days per week.',
        feedback: "Good foundation. We'll build on your existing movement habits.",
    },
    {
        value: 'moderate',
        label: 'Moderate',
        icon: 'run',
        color: '#00E5BE',
        desc: 'Exercise or active job 3–5 days per week.',
        feedback: "Solid base. We'll match your plan intensity to your lifestyle.",
    },
    {
        value: 'very_active',
        label: 'Very Active',
        icon: 'lightning-bolt-circle',
        color: '#FF4D2E',
        desc: 'Hard training or physical job 6–7 days per week.',
        feedback: "Beast mode. We'll program smart recovery into your high-output plan.",
    },
];

// ─── Plan summary helpers ─────────────────────────────────────────────────────

const buildPlanSummary = ({ goal, fitnessLevel, activityLevel, gender, age, weight, weightUnit, height, heightUnit }) => {
    const goalMap = {
        lose_weight:      { label: 'Fat Loss',         color: '#FF4D2E', icon: 'fire' },
        gain_weight:      { label: 'Mass Gain',         color: '#FFB800', icon: 'scale-bathroom' },
        build_muscle:     { label: 'Muscle Building',   color: '#00E5BE', icon: 'arm-flex' },
        maintain_fitness: { label: 'Maintenance',       color: '#6C63FF', icon: 'heart-pulse' },
    };
    const levelMap = {
        beginner:     { sessions: '3–4x / week', intensity: 'Low–Medium' },
        intermediate: { sessions: '4–5x / week', intensity: 'Medium–High' },
        advanced:     { sessions: '5–6x / week', intensity: 'High' },
    };
    const activityBoost = { sedentary: 0, light: 50, moderate: 100, very_active: 200 };

    const g   = goalMap[goal]         || goalMap.maintain_fitness;
    const lvl = levelMap[fitnessLevel] || levelMap.beginner;

    // Rough TDEE approximation
    const kg  = weightUnit === 'lbs' ? (parseFloat(weight) || 70) * 0.453592 : (parseFloat(weight) || 70);
    const cm  = heightUnit === 'ft'  ? (parseFloat(height) || 1.75) * 30.48  : (parseFloat(height) || 170);
    const a   = parseInt(age, 10) || 25;
    const bmr = gender === 'female'
        ? 10 * kg + 6.25 * cm - 5 * a - 161
        : 10 * kg + 6.25 * cm - 5 * a + 5;
    const actMultiplier = { sedentary: 1.2, light: 1.375, moderate: 1.55, very_active: 1.725 };
    const tdee  = Math.round(bmr * (actMultiplier[activityLevel] || 1.375));
    const boost = activityBoost[activityLevel] || 0;
    const targetCalories = goal === 'lose_weight'
        ? tdee - 500
        : goal === 'gain_weight' || goal === 'build_muscle'
            ? tdee + 300
            : tdee;

    const focusMap = {
        lose_weight:      ['HIIT', 'Cardio', 'Full Body'],
        gain_weight:      ['Compound Lifts', 'Strength', 'Hypertrophy'],
        build_muscle:     ['Hypertrophy', 'Progressive Overload', 'Isolation'],
        maintain_fitness: ['Functional', 'Conditioning', 'Mobility'],
    };

    return {
        planType:      g.label,
        planColor:     g.color,
        planIcon:      g.icon,
        sessions:      lvl.sessions,
        intensity:     lvl.intensity,
        targetCalories,
        tdee,
        focuses:       focusMap[goal] || focusMap.maintain_fitness,
    };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const ProgressDots = ({ current, total }) => (
    <View style={styles.dotsRow}>
        {Array.from({ length: total }).map((_, i) => (
            <View
                key={i}
                style={[
                    styles.dot,
                    i < current && styles.dotDone,
                    i === current && styles.dotActive,
                ]}
            />
        ))}
    </View>
);

const FeedbackBubble = ({ message, color }) => {
    const op  = useRef(new Animated.Value(0)).current;
    const ty  = useRef(new Animated.Value(8)).current;

    useEffect(() => {
        op.setValue(0); ty.setValue(8);
        Animated.parallel([
            Animated.timing(op, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.spring(ty, { toValue: 0, tension: 100, friction: 10, useNativeDriver: true }),
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

const UnitToggle = ({ options, selected, onSelect }) => (
    <View style={styles.unitToggle}>
        {options.map((opt) => (
            <TouchableOpacity key={opt} onPress={() => onSelect(opt)} style={[styles.unitBtn, selected === opt && styles.unitBtnSelected]}>
                <Text style={[styles.unitBtnText, selected === opt && styles.unitBtnTextSelected]}>{opt}</Text>
            </TouchableOpacity>
        ))}
    </View>
);

// Large selectable card for goal / level / activity
const OptionCard = ({ option, selected, onPress }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const onIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 300 }).start();
    const onOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 300 }).start();

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={onIn}
                onPressOut={onOut}
                activeOpacity={1}
                style={[
                    styles.optionCard,
                    selected && { borderColor: option.color, backgroundColor: option.color + '12' },
                ]}
            >
                <View style={[styles.optionIconBg, { backgroundColor: option.color + (selected ? '28' : '14') }]}>
                    <MaterialCommunityIcons name={option.icon} size={22} color={option.color} />
                </View>
                <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, selected && { color: option.color }]}>{option.label}</Text>
                    <Text style={styles.optionDesc} numberOfLines={2}>{option.desc}</Text>
                </View>
                {selected && (
                    <MaterialCommunityIcons name="check-circle" size={18} color={option.color} style={{ marginLeft: 4 }} />
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

// Gender pill (smaller, horizontal row)
const GenderPill = ({ option, selected, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[styles.genderPill, selected && styles.genderPillSelected]}
    >
        <MaterialCommunityIcons name={option.icon} size={16} color={selected ? '#041018' : '#A5A5BE'} />
        <Text style={[styles.genderPillText, selected && styles.genderPillTextSelected]}>{option.label}</Text>
    </TouchableOpacity>
);

// ─── Step wrapper (handles slide-in animation) ────────────────────────────────

const StepWrapper = ({ children, direction }) => {
    const tx = useRef(new Animated.Value(direction === 'forward' ? width : -width)).current;
    const op = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(tx, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
            Animated.timing(op, { toValue: 1, duration: 250, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <Animated.View style={[styles.stepWrapper, { opacity: op, transform: [{ translateX: tx }] }]}>
            {children}
        </Animated.View>
    );
};

// ─── Plan Preview (final step) ────────────────────────────────────────────────

const PlanPreview = ({ data }) => {
    const summary = buildPlanSummary(data);

    const items = [
        { label: 'Plan Type',    value: summary.planType,          color: summary.planColor, icon: summary.planIcon },
        { label: 'Sessions',     value: summary.sessions,          color: '#00C2FF',         icon: 'calendar-week' },
        { label: 'Intensity',    value: summary.intensity,         color: '#FFB800',         icon: 'speedometer' },
        { label: 'Daily Target', value: `${summary.targetCalories} kcal`, color: '#FF4D2E',  icon: 'fire' },
    ];

    const op  = useRef(new Animated.Value(0)).current;
    const ty  = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.delay(200),
            Animated.parallel([
                Animated.timing(op, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.spring(ty, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
            ]),
        ]).start();
    }, []);

    return (
        <Animated.View style={{ opacity: op, transform: [{ translateY: ty }] }}>
            {/* Header card */}
            <LinearGradient
                colors={[summary.planColor + '22', summary.planColor + '06']}
                style={[styles.previewHero, { borderColor: summary.planColor + '40' }]}
            >
                <View style={[styles.previewHeroIcon, { backgroundColor: summary.planColor + '20' }]}>
                    <MaterialCommunityIcons name={summary.planIcon} size={36} color={summary.planColor} />
                </View>
                <Text style={[styles.previewHeroLabel, { color: summary.planColor }]}>YOUR PLAN</Text>
                <Text style={styles.previewHeroTitle}>{summary.planType}</Text>
                <Text style={styles.previewHeroSub}>Personalized for your body and goals</Text>
            </LinearGradient>

            {/* Stats grid */}
            <View style={styles.previewGrid}>
                {items.map((item) => (
                    <View key={item.label} style={[styles.previewCell, { borderColor: item.color + '25' }]}>
                        <MaterialCommunityIcons name={item.icon} size={16} color={item.color} />
                        <Text style={[styles.previewCellValue, { color: item.color }]}>{item.value}</Text>
                        <Text style={styles.previewCellLabel}>{item.label}</Text>
                    </View>
                ))}
            </View>

            {/* Focus areas */}
            <View style={styles.focusRow}>
                <Text style={styles.focusTitle}>Training Focus</Text>
                <View style={styles.focusTags}>
                    {summary.focuses.map((f) => (
                        <View key={f} style={[styles.focusTag, { borderColor: summary.planColor + '40', backgroundColor: summary.planColor + '10' }]}>
                            <Text style={[styles.focusTagText, { color: summary.planColor }]}>{f}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </Animated.View>
    );
};

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
    const navigation  = useNavigation();
    const { userProfile, saveUserProfile } = useContext(FitnessItems);

    const [step,         setStep]         = useState(0);
    const [direction,    setDirection]    = useState('forward');
    const [stepKey,      setStepKey]      = useState(0); // forces StepWrapper remount on step change

    // Form state
    const [age,          setAge]          = useState('');
    const [gender,       setGender]       = useState('');
    const [weight,       setWeight]       = useState('');
    const [weightUnit,   setWeightUnit]   = useState('kg');
    const [height,       setHeight]       = useState('');
    const [heightUnit,   setHeightUnit]   = useState('cm');
    const [goal,         setGoal]         = useState('');
    const [fitnessLevel, setFitnessLevel] = useState('');
    const [activityLevel,setActivityLevel]= useState('');

    const inputRef = useRef(null);

    // Pre-fill if editing
    useEffect(() => {
        if (!userProfile) return;
        setAge(String(userProfile.age          || ''));
        setGender(String(userProfile.gender    || ''));
        setWeight(String(userProfile.weight    || ''));
        setWeightUnit(userProfile.weightUnit   || 'kg');
        setHeight(String(userProfile.height    || ''));
        setHeightUnit(userProfile.heightUnit   || 'cm');
        setGoal(String(userProfile.goal        || ''));
        setFitnessLevel(String(userProfile.fitnessLevel || ''));
        setActivityLevel(String(userProfile.activityLevel || ''));
    }, [userProfile]);

    // Auto-focus text inputs when step changes
    useEffect(() => {
        if ([0, 2, 3].includes(step)) {
            const t = setTimeout(() => inputRef.current?.focus(), 400);
            return () => clearTimeout(t);
        }
    }, [step]);

    // ── Validation per step ───────────────────────────────────────────────────
    const parsedAge    = Number.parseInt(age, 10);
    const parsedWeight = Number.parseFloat(weight);
    const parsedHeight = Number.parseFloat(height);

    const stepValid = useMemo(() => [
        Number.isInteger(parsedAge) && parsedAge >= 10 && parsedAge <= 120,           // 0 age
        !!gender,                                                                       // 1 gender
        Number.isFinite(parsedWeight) && parsedWeight > 0 && parsedWeight <= 500,     // 2 weight
        Number.isFinite(parsedHeight) && parsedHeight > 0 && parsedHeight <= 300,     // 3 height
        !!goal,                                                                         // 4 goal
        !!fitnessLevel,                                                                 // 5 fitness level
        !!activityLevel,                                                                // 6 activity level
        true,                                                                           // 7 plan preview (always ok)
    ], [parsedAge, gender, parsedWeight, parsedHeight, goal, fitnessLevel, activityLevel]);

    // ── Navigation ────────────────────────────────────────────────────────────
    const goTo = (next, dir) => {
        setDirection(dir);
        setStep(next);
        setStepKey((k) => k + 1);
    };

    const handleNext = () => {
        if (step < TOTAL_STEPS - 1) goTo(step + 1, 'forward');
    };

    const handleBack = () => {
        if (step === 0) { navigation.goBack(); return; }
        goTo(step - 1, 'back');
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        const saved = await saveUserProfile({
            age:           parsedAge,
            weight:        parsedWeight,
            weightUnit,
            height:        parsedHeight,
            heightUnit,
            gender,
            goal,
            fitnessLevel,
            activityLevel,
            updatedAt:     new Date().toISOString(),
        });
        if (saved) navigation.replace('App');
    };

    // ── Step config ───────────────────────────────────────────────────────────
    const stepConfig = [
        { emoji: '🎂', question: "How old are you?",             sub: "We use your age to calibrate workout intensity and recovery time." },
        { emoji: '🧬', question: "What's your biological sex?",  sub: "Used to calculate accurate calorie targets and hormonal factors." },
        { emoji: '⚖️',  question: "What do you currently weigh?", sub: "Your starting point — we never judge, we only plan." },
        { emoji: '📏', question: "How tall are you?",            sub: "Height helps us calculate your BMI and adjust body composition goals." },
        { emoji: '🎯', question: "What's your primary goal?",    sub: "This shapes every workout, every week." },
        { emoji: '💪', question: "What's your fitness level?",   sub: "Be honest — the right starting point beats burning out." },
        { emoji: '🏃', question: "How active is your lifestyle?", sub: "This tells us how many calories you burn outside the gym." },
        { emoji: '✨', question: "Your plan is ready.",           sub: "Here's what we've built for you based on your answers." },
    ];

    const cfg = stepConfig[step];

    // Feedback per step
    const feedback = useMemo(() => {
        if (step === 4 && goal)         return GOAL_OPTIONS.find(o => o.value === goal);
        if (step === 5 && fitnessLevel) return FITNESS_LEVEL_OPTIONS.find(o => o.value === fitnessLevel);
        if (step === 6 && activityLevel)return ACTIVITY_OPTIONS.find(o => o.value === activityLevel);
        return null;
    }, [step, goal, fitnessLevel, activityLevel]);

    const isLastStep = step === TOTAL_STEPS - 1;

    // ── Render step content ───────────────────────────────────────────────────
    const renderStepContent = () => {
        switch (step) {

            // Step 0: Age
            case 0:
                return (
                    <View style={styles.inputBlock}>
                        <TextInput
                            ref={inputRef}
                            value={age}
                            onChangeText={setAge}
                            keyboardType="number-pad"
                            placeholder="24"
                            placeholderTextColor="#2A2A3A"
                            style={styles.bigInput}
                            maxLength={3}
                            returnKeyType="done"
                            onSubmitEditing={() => stepValid[0] && handleNext()}
                        />
                        <Text style={styles.bigInputUnit}>years old</Text>
                    </View>
                );

            // Step 1: Gender
            case 1:
                return (
                    <View style={styles.pillGrid}>
                        {GENDER_OPTIONS.map((opt) => (
                            <GenderPill
                                key={opt.value}
                                option={opt}
                                selected={gender === opt.value}
                                onPress={() => setGender(opt.value)}
                            />
                        ))}
                    </View>
                );

            // Step 2: Weight
            case 2:
                return (
                    <View style={styles.inputBlock}>
                        <View style={styles.inputRow}>
                            <TextInput
                                ref={inputRef}
                                value={weight}
                                onChangeText={setWeight}
                                keyboardType="decimal-pad"
                                placeholder={weightUnit === 'kg' ? '72' : '160'}
                                placeholderTextColor="#2A2A3A"
                                style={[styles.bigInput, { flex: 1 }]}
                                maxLength={6}
                                returnKeyType="done"
                                onSubmitEditing={() => stepValid[2] && handleNext()}
                            />
                            <UnitToggle options={['kg', 'lbs']} selected={weightUnit} onSelect={setWeightUnit} />
                        </View>
                    </View>
                );

            // Step 3: Height
            case 3:
                return (
                    <View style={styles.inputBlock}>
                        <View style={styles.inputRow}>
                            <TextInput
                                ref={inputRef}
                                value={height}
                                onChangeText={setHeight}
                                keyboardType="decimal-pad"
                                placeholder={heightUnit === 'cm' ? '175' : '5.9'}
                                placeholderTextColor="#2A2A3A"
                                style={[styles.bigInput, { flex: 1 }]}
                                maxLength={5}
                                returnKeyType="done"
                                onSubmitEditing={() => stepValid[3] && handleNext()}
                            />
                            <UnitToggle options={['cm', 'ft']} selected={heightUnit} onSelect={setHeightUnit} />
                        </View>
                    </View>
                );

            // Step 4: Goal
            case 4:
                return (
                    <View style={styles.cardList}>
                        {GOAL_OPTIONS.map((opt) => (
                            <OptionCard
                                key={opt.value}
                                option={opt}
                                selected={goal === opt.value}
                                onPress={() => setGoal(opt.value)}
                            />
                        ))}
                    </View>
                );

            // Step 5: Fitness level
            case 5:
                return (
                    <View style={styles.cardList}>
                        {FITNESS_LEVEL_OPTIONS.map((opt) => (
                            <OptionCard
                                key={opt.value}
                                option={opt}
                                selected={fitnessLevel === opt.value}
                                onPress={() => setFitnessLevel(opt.value)}
                            />
                        ))}
                    </View>
                );

            // Step 6: Activity level
            case 6:
                return (
                    <View style={styles.cardList}>
                        {ACTIVITY_OPTIONS.map((opt) => (
                            <OptionCard
                                key={opt.value}
                                option={opt}
                                selected={activityLevel === opt.value}
                                onPress={() => setActivityLevel(opt.value)}
                            />
                        ))}
                    </View>
                );

            // Step 7: Plan preview
            case 7:
                return (
                    <PlanPreview data={{ goal, fitnessLevel, activityLevel, gender, age, weight, weightUnit, height, heightUnit }} />
                );

            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#0D0D0F', '#111118', '#18181F']} style={StyleSheet.absoluteFillObject} />

            {/* Ambient glow that changes color per step */}
            <View style={[styles.ambientGlow, { backgroundColor: (feedback?.color || '#00E5BE') + '0A' }]} pointerEvents="none" />

            <SafeAreaView style={styles.safe}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={0}
                >

                    {/* ── Top bar ── */}
                    <View style={styles.topBar}>
                        <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
                            <Feather name="arrow-left" size={18} color="#A5A5BE" />
                        </TouchableOpacity>

                        <ProgressDots current={step} total={TOTAL_STEPS} />

                        <Text style={styles.stepCounter}>{step + 1}/{TOTAL_STEPS}</Text>
                    </View>

                    {/* ── Step content ── */}
                    <View style={styles.body}>
                        <StepWrapper key={stepKey} direction={direction}>

                            {/* Emoji */}
                            <Text style={styles.stepEmoji}>{cfg.emoji}</Text>

                            {/* Question */}
                            <Text style={styles.question}>{cfg.question}</Text>
                            <Text style={styles.questionSub}>{cfg.sub}</Text>

                            {/* Input area */}
                            <View style={styles.contentArea}>
                                {renderStepContent()}
                            </View>

                            {/* Personalized feedback bubble */}
                            {feedback && (
                                <FeedbackBubble message={feedback.feedback} color={feedback.color} />
                            )}

                        </StepWrapper>
                    </View>

                    {/* ── CTA button ── */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            onPress={isLastStep ? handleSubmit : handleNext}
                            disabled={!stepValid[step]}
                            activeOpacity={0.88}
                            style={[styles.ctaBtn, !stepValid[step] && styles.ctaBtnDisabled]}
                        >
                            <LinearGradient
                                colors={stepValid[step]
                                    ? isLastStep ? ['#FF4D2E', '#FF2800'] : ['#00E5BE', '#00B89F']
                                    : ['#1E1E2A', '#161620']
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.ctaBtnInner}
                            >
                                <Text style={[styles.ctaText, !stepValid[step] && styles.ctaTextDisabled]}>
                                    {isLastStep ? "Let's Go 🚀" : 'Continue'}
                                </Text>
                                {!isLastStep && (
                                    <Feather
                                        name="arrow-right"
                                        size={16}
                                        color={stepValid[step] ? '#041018' : '#333'}
                                    />
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {!isLastStep && (
                            <Text style={styles.skipHint}>
                                {step < 4 ? 'Enter your details above to continue' : 'Select an option to continue'}
                            </Text>
                        )}
                    </View>

                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0D0D0F' },
    safe:      { flex: 1 },

    ambientGlow: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 0,
    },

    // Top bar
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 16,
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
    dotsRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dotDone: {
        backgroundColor: 'rgba(0,229,190,0.4)',
        width: 8,
    },
    dotActive: {
        backgroundColor: '#00E5BE',
        width: 20,
        borderRadius: 3,
    },
    stepCounter: {
        color: '#333',
        fontSize: 11,
        fontWeight: '700',
        width: 36,
        textAlign: 'right',
    },

    // Body
    body: {
        flex: 1,
        overflow: 'hidden',
    },
    stepWrapper: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 8,
    },

    // Step header
    stepEmoji: {
        fontSize: 44,
        marginBottom: 16,
    },
    question: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -0.8,
        lineHeight: 34,
        marginBottom: 8,
    },
    questionSub: {
        color: '#555',
        fontSize: 13,
        lineHeight: 19,
        marginBottom: 32,
    },

    // Content area
    contentArea: {
        gap: 10,
    },

    // Big number input (age, weight, height)
    inputBlock: {
        gap: 8,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    bigInput: {
        color: '#FFFFFF',
        fontSize: 52,
        fontWeight: '900',
        letterSpacing: -2,
        paddingVertical: 0,
        borderBottomWidth: 2,
        borderBottomColor: 'rgba(0,229,190,0.4)',
        minWidth: 100,
    },
    bigInputUnit: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 4,
    },

    // Unit toggle
    unitToggle: {
        flexDirection: 'column',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    unitBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignItems: 'center',
    },
    unitBtnSelected: {
        backgroundColor: 'rgba(0,229,190,0.15)',
    },
    unitBtnText: {
        color: '#444',
        fontSize: 13,
        fontWeight: '800',
    },
    unitBtnTextSelected: {
        color: '#00E5BE',
    },

    // Gender pills
    pillGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    genderPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 18,
        paddingVertical: 13,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    genderPillSelected: {
        borderColor: '#00E5BE',
        backgroundColor: '#00E5BE',
    },
    genderPillText: {
        color: '#A5A5BE',
        fontSize: 14,
        fontWeight: '700',
    },
    genderPillTextSelected: {
        color: '#041018',
    },

    // Large option cards
    cardList: {
        gap: 10,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
        backgroundColor: 'rgba(22,22,30,0.8)',
    },
    optionIconBg: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    optionText: { flex: 1 },
    optionLabel: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
        marginBottom: 2,
    },
    optionDesc: {
        color: '#555',
        fontSize: 12,
        lineHeight: 16,
    },

    // Feedback bubble
    feedback: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginTop: 16,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    feedbackText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 18,
    },

    // Plan preview
    previewHero: {
        alignItems: 'center',
        borderRadius: 20,
        borderWidth: 1,
        paddingVertical: 24,
        paddingHorizontal: 20,
        marginBottom: 14,
        gap: 6,
    },
    previewHeroIcon: {
        width: 72,
        height: 72,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    previewHeroLabel: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
    },
    previewHeroTitle: {
        color: '#fff',
        fontSize: 26,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    previewHeroSub: {
        color: '#555',
        fontSize: 12,
        textAlign: 'center',
    },
    previewGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 14,
    },
    previewCell: {
        width: (width - 48 - 8) / 2,
        borderWidth: 1,
        borderRadius: 14,
        backgroundColor: 'rgba(20,20,28,0.9)',
        paddingVertical: 14,
        paddingHorizontal: 14,
        gap: 4,
    },
    previewCellValue: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: -0.3,
    },
    previewCellLabel: {
        color: '#444',
        fontSize: 11,
        fontWeight: '600',
    },
    focusRow: {
        gap: 10,
    },
    focusTitle: {
        color: '#555',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    focusTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    focusTag: {
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    focusTagText: {
        fontSize: 12,
        fontWeight: '700',
    },

    // Footer CTA
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 12,
        paddingTop: 8,
        gap: 10,
        alignItems: 'center',
    },
    ctaBtn: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    ctaBtnDisabled: {
        opacity: 0.45,
    },
    ctaBtnInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
    },
    ctaText: {
        color: '#041018',
        fontSize: 15,
        fontWeight: '900',
        letterSpacing: 0.2,
    },
    ctaTextDisabled: {
        color: '#333',
    },
    skipHint: {
        color: '#2A2A3A',
        fontSize: 11,
        fontWeight: '500',
        textAlign: 'center',
    },
});