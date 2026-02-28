import { useContext, useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-expo';
import { FitnessItems } from '../Context';

const { width } = Dimensions.get('window');

// ── Label maps ────────────────────────────────────────────────────────────────

const GOAL_LABELS = {
    lose_weight:      { label: 'Lose Weight',     icon: 'fire',            color: '#FF4D2E' },
    gain_weight:      { label: 'Gain Weight',      icon: 'scale-bathroom', color: '#FFB800' },
    build_muscle:     { label: 'Build Muscle',     icon: 'arm-flex',       color: '#00E5BE' },
    maintain_fitness: { label: 'Maintain Fitness', icon: 'heart-pulse',    color: '#6C63FF' },
};

const LEVEL_LABELS = {
    beginner:     { label: 'Beginner',     icon: 'seedling',       color: '#00E5BE' },
    intermediate: { label: 'Intermediate', icon: 'lightning-bolt', color: '#FFB800' },
    advanced:     { label: 'Advanced',     icon: 'trophy',         color: '#FF4D2E' },
};

const ACTIVITY_LABELS = {
    sedentary:   { label: 'Sedentary',   icon: 'sofa',                  color: '#6C63FF', desc: 'Little or no exercise' },
    light:       { label: 'Light',       icon: 'walk',                  color: '#00C2FF', desc: '1–3 days / week' },
    moderate:    { label: 'Moderate',    icon: 'run',                   color: '#00E5BE', desc: '3–5 days / week' },
    very_active: { label: 'Very Active', icon: 'lightning-bolt-circle', color: '#FF4D2E', desc: '6–7 days / week' },
};

const GENDER_LABELS = {
    male:            'Male',
    female:          'Female',
    non_binary:      'Non-binary',
    prefer_not_to_say: 'Prefer not to say',
};

// ── BMI helpers ───────────────────────────────────────────────────────────────

const calcBMI = (weight, weightUnit, height, heightUnit) => {
    if (!weight || !height) return null;

    // Convert everything to kg and metres
    const kg = weightUnit === 'lbs' ? weight * 0.453592 : weight;
    const m  = heightUnit === 'ft'  ? height * 0.3048   : height / 100;

    if (m <= 0) return null;
    return +(kg / (m * m)).toFixed(1);
};

const bmiCategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Underweight', color: '#00C2FF' };
    if (bmi < 25)   return { label: 'Healthy',     color: '#00E5BE' };
    if (bmi < 30)   return { label: 'Overweight',  color: '#FFB800' };
    return               { label: 'Obese',         color: '#FF4D2E' };
};

// ── Small reusable pieces ─────────────────────────────────────────────────────

const SectionLabel = ({ icon, text }) => (
    <View style={styles.sectionLabel}>
        <MaterialCommunityIcons name={icon} size={12} color="#555" />
        <Text style={styles.sectionLabelText}>{text}</Text>
    </View>
);

const DataRow = ({ label, value, accent = '#fff' }) => (
    <View style={styles.dataRow}>
        <Text style={styles.dataLabel}>{label}</Text>
        <Text style={[styles.dataValue, { color: accent }]}>{value}</Text>
    </View>
);

const TagChip = ({ icon, label, color }) => (
    <View style={[styles.tag, { borderColor: color + '50', backgroundColor: color + '12' }]}>
        <MaterialCommunityIcons name={icon} size={13} color={color} />
        <Text style={[styles.tagText, { color }]}>{label}</Text>
    </View>
);

// ── Animated stat card ────────────────────────────────────────────────────────

const StatCard = ({ icon, value, label, color, delay }) => {
    const scale   = useRef(new Animated.Value(0.85)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.spring(scale,   { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
            ]),
        ]).start();
    }, []);

    return (
        <Animated.View style={[styles.statCard, { opacity, transform: [{ scale }] }]}>
            <LinearGradient
                colors={[color + '20', color + '08']}
                style={styles.statCardInner}
            >
                <View style={[styles.statIconBg, { backgroundColor: color + '20' }]}>
                    <MaterialCommunityIcons name={icon} size={18} color={color} />
                </View>
                <Text style={[styles.statValue, { color }]}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
            </LinearGradient>
        </Animated.View>
    );
};

// ── Main component ────────────────────────────────────────────────────────────

export default function UserProfile() {
    const navigation = useNavigation();
    const { userProfile, calories, minutes, workout } = useContext(FitnessItems);
    const { user, isSignedIn } = useUser();

    // Entrance animations
    const headerY   = useRef(new Animated.Value(-24)).current;
    const headerOp  = useRef(new Animated.Value(0)).current;
    const bodyOp    = useRef(new Animated.Value(0)).current;
    const bodyY     = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.spring(headerY,  { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
                Animated.timing(headerOp, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]),
            Animated.parallel([
                Animated.spring(bodyY,  { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
                Animated.timing(bodyOp, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]),
        ]).start();
    }, []);

    // Derived values
    const bmi     = userProfile ? calcBMI(userProfile.weight, userProfile.weightUnit, userProfile.height, userProfile.heightUnit) : null;
    const bmiCat  = bmi ? bmiCategory(bmi) : null;
    const goal    = GOAL_LABELS[userProfile?.goal]         || null;
    const level   = LEVEL_LABELS[userProfile?.fitnessLevel]   || null;
    const activity = ACTIVITY_LABELS[userProfile?.activityLevel] || null;

    const syncedAt = userProfile?.updatedAt
        ? new Date(userProfile.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : null;

    const displayName = (() => {
        if (!user) return 'You';
        const first = String(user.firstName || '').trim();
        const last  = String(user.lastName  || '').trim();
        return `${first} ${last}`.trim() || user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'You';
    })();

    const initials = displayName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#0D0D0F', '#111118', '#17171F']}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Glow orb */}
            <View style={styles.glowOrb} pointerEvents="none" />

            <SafeAreaView style={styles.safe}>

                {/* ── Top bar ── */}
                <Animated.View style={[styles.topBar, { opacity: headerOp, transform: [{ translateY: headerY }] }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
                        <Feather name="arrow-left" size={18} color="#A5A5BE" />
                    </TouchableOpacity>

                    <Text style={styles.screenTitle}>My Profile</Text>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('Onboarding')}
                        style={styles.editBtn}
                        activeOpacity={0.8}
                    >
                        <Feather name="edit-2" size={13} color="#00E5BE" />
                        <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                </Animated.View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scroll}
                >

                    {/* ── Identity hero ── */}
                    <Animated.View style={[styles.hero, { opacity: headerOp, transform: [{ translateY: headerY }] }]}>
                        {/* Avatar */}
                        <LinearGradient colors={['#FF4D2E', '#FF2800']} style={styles.avatar}>
                            <Text style={styles.avatarInitials}>{initials}</Text>
                        </LinearGradient>

                        <View style={styles.heroInfo}>
                            <Text style={styles.heroName}>{displayName}</Text>

                            {user?.primaryEmailAddress?.emailAddress ? (
                                <Text style={styles.heroEmail} numberOfLines={1}>
                                    {user.primaryEmailAddress.emailAddress}
                                </Text>
                            ) : null}

                            {/* Sync badge */}
                            {isSignedIn && syncedAt ? (
                                <View style={styles.syncBadge}>
                                    <MaterialCommunityIcons name="cloud-check" size={11} color="#00E5BE" />
                                    <Text style={styles.syncText}>Synced · {syncedAt}</Text>
                                </View>
                            ) : (
                                <View style={styles.syncBadge}>
                                    <MaterialCommunityIcons name="cloud-off-outline" size={11} color="#555" />
                                    <Text style={[styles.syncText, { color: '#555' }]}>Local only</Text>
                                </View>
                            )}
                        </View>
                    </Animated.View>

                    <Animated.View style={{ opacity: bodyOp, transform: [{ translateY: bodyY }] }}>

                        {/* ── Today's activity stats ── */}
                        <SectionLabel icon="chart-bar" text="TODAY'S ACTIVITY" />
                        <View style={styles.statsRow}>
                            <StatCard icon="fire"        value={calories.toFixed(0)} label="Calories"  color="#FF4D2E" delay={0}   />
                            <StatCard icon="clock-fast"  value={minutes}             label="Minutes"   color="#00E5BE" delay={60}  />
                            <StatCard icon="dumbbell"    value={workout}             label="Workouts"  color="#6C63FF" delay={120} />
                        </View>

                        {userProfile ? (
                            <>
                                {/* ── BMI chip ── */}
                                {bmi && bmiCat ? (
                                    <View style={[styles.bmiCard, { borderColor: bmiCat.color + '40' }]}>
                                        <LinearGradient
                                            colors={[bmiCat.color + '18', bmiCat.color + '06']}
                                            style={styles.bmiCardInner}
                                        >
                                            <View>
                                                <Text style={styles.bmiTitle}>Body Mass Index</Text>
                                                <Text style={styles.bmiSub}>Calculated from your height & weight</Text>
                                            </View>
                                            <View style={styles.bmiRight}>
                                                <Text style={[styles.bmiNumber, { color: bmiCat.color }]}>{bmi}</Text>
                                                <View style={[styles.bmiCatBadge, { backgroundColor: bmiCat.color + '20' }]}>
                                                    <Text style={[styles.bmiCatText, { color: bmiCat.color }]}>
                                                        {bmiCat.label}
                                                    </Text>
                                                </View>
                                            </View>
                                        </LinearGradient>
                                    </View>
                                ) : null}

                                {/* ── Body metrics card ── */}
                                <SectionLabel icon="human" text="BODY METRICS" />
                                <View style={styles.card}>
                                    <DataRow
                                        label="Age"
                                        value={`${userProfile.age} years`}
                                    />
                                    <View style={styles.divider} />
                                    <DataRow
                                        label="Weight"
                                        value={`${userProfile.weight} ${userProfile.weightUnit || 'kg'}`}
                                        accent="#00E5BE"
                                    />
                                    {userProfile.height ? (
                                        <>
                                            <View style={styles.divider} />
                                            <DataRow
                                                label="Height"
                                                value={`${userProfile.height} ${userProfile.heightUnit || 'cm'}`}
                                                accent="#00C2FF"
                                            />
                                        </>
                                    ) : null}
                                    <View style={styles.divider} />
                                    <DataRow
                                        label="Gender"
                                        value={GENDER_LABELS[userProfile.gender] || userProfile.gender}
                                    />
                                </View>

                                {/* ── Goals card ── */}
                                <SectionLabel icon="target" text="YOUR GOALS" />
                                <View style={styles.card}>
                                    {goal ? (
                                        <View style={styles.tagRow}>
                                            <Text style={styles.dataLabel}>Primary Goal</Text>
                                            <TagChip icon={goal.icon} label={goal.label} color={goal.color} />
                                        </View>
                                    ) : null}

                                    {level ? (
                                        <>
                                            <View style={styles.divider} />
                                            <View style={styles.tagRow}>
                                                <Text style={styles.dataLabel}>Fitness Level</Text>
                                                <TagChip icon={level.icon} label={level.label} color={level.color} />
                                            </View>
                                        </>
                                    ) : null}

                                    {activity ? (
                                        <>
                                            <View style={styles.divider} />
                                            <View style={styles.tagRow}>
                                                <Text style={styles.dataLabel}>Activity Level</Text>
                                                <View style={styles.activityChipWrap}>
                                                    <TagChip icon={activity.icon} label={activity.label} color={activity.color} />
                                                    <Text style={styles.activityDesc}>{activity.desc}</Text>
                                                </View>
                                            </View>
                                        </>
                                    ) : null}
                                </View>
                            </>
                        ) : (
                            /* ── Empty state ── */
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="account-edit-outline" size={48} color="#2A2A3A" />
                                <Text style={styles.emptyTitle}>No profile yet</Text>
                                <Text style={styles.emptySubtitle}>
                                    Complete your profile to unlock personalized training.
                                </Text>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Onboarding')}
                                    style={styles.emptyBtn}
                                    activeOpacity={0.85}
                                >
                                    <LinearGradient colors={['#00E5BE', '#00B89F']} style={styles.emptyBtnInner}>
                                        <Text style={styles.emptyBtnText}>Set Up Profile</Text>
                                        <Feather name="arrow-right" size={14} color="#041018" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* ── Edit CTA at bottom ── */}
                        {userProfile ? (
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Onboarding')}
                                activeOpacity={0.88}
                                style={styles.editCta}
                            >
                                <LinearGradient
                                    colors={['rgba(0,229,190,0.12)', 'rgba(0,229,190,0.06)']}
                                    style={styles.editCtaInner}
                                >
                                    <Feather name="edit-2" size={14} color="#00E5BE" />
                                    <Text style={styles.editCtaText}>Update My Profile</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        ) : null}

                        <View style={{ height: 32 }} />
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0D0D0F' },
    safe:      { flex: 1 },

    glowOrb: {
        position: 'absolute',
        top: -60,
        right: -80,
        width: 320,
        height: 320,
        borderRadius: 160,
        backgroundColor: '#00E5BE',
        opacity: 0.04,
    },

    // Top bar
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 14,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    screenTitle: {
        flex: 1,
        textAlign: 'center',
        color: '#fff',
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.2,
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(0,229,190,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(0,229,190,0.25)',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
    },
    editBtnText: {
        color: '#00E5BE',
        fontSize: 12,
        fontWeight: '700',
    },

    scroll: {
        paddingHorizontal: 16,
        paddingTop: 4,
    },

    // Hero
    hero: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 24,
        paddingHorizontal: 4,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    avatarInitials: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    heroInfo: { flex: 1, gap: 3 },
    heroName: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: -0.3,
    },
    heroEmail: {
        color: '#555',
        fontSize: 12,
        fontWeight: '400',
    },
    syncBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    syncText: {
        color: '#00E5BE',
        fontSize: 11,
        fontWeight: '600',
    },

    // Section label
    sectionLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 8,
        marginTop: 16,
        paddingLeft: 2,
    },
    sectionLabelText: {
        color: '#444',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
    },

    // Stat cards
    statsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 4,
    },
    statCard: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    statCardInner: {
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 6,
        gap: 6,
    },
    statIconBg: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    statLabel: {
        color: '#555',
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },

    // BMI card
    bmiCard: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        marginTop: 16,
    },
    bmiCardInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    bmiTitle: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '800',
        marginBottom: 2,
    },
    bmiSub: {
        color: '#555',
        fontSize: 10,
        fontWeight: '500',
    },
    bmiRight: { alignItems: 'flex-end', gap: 4 },
    bmiNumber: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -1,
    },
    bmiCatBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    bmiCatText: {
        fontSize: 11,
        fontWeight: '800',
    },

    // Data card
    card: {
        backgroundColor: 'rgba(20,20,28,0.9)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    dataRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 13,
    },
    dataLabel: {
        color: '#555',
        fontSize: 13,
        fontWeight: '600',
    },
    dataValue: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.04)',
    },

    // Tag chip
    tagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        gap: 10,
    },
    activityChipWrap: { alignItems: 'flex-end', gap: 3 },
    activityDesc: {
        color: '#444',
        fontSize: 10,
        fontWeight: '500',
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '700',
    },

    // Edit CTA
    editCta: {
        marginTop: 20,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,229,190,0.2)',
    },
    editCtaInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
    },
    editCtaText: {
        color: '#00E5BE',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 0.2,
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
        gap: 10,
    },
    emptyTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        marginTop: 8,
    },
    emptySubtitle: {
        color: '#555',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
        maxWidth: 240,
    },
    emptyBtn: {
        marginTop: 12,
        borderRadius: 14,
        overflow: 'hidden',
    },
    emptyBtnInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 13,
    },
    emptyBtnText: {
        color: '#041018',
        fontSize: 14,
        fontWeight: '900',
    },
});