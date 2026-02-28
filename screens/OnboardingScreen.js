import { useContext, useEffect, useMemo, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { FitnessItems } from '../Context';

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
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
];

const OptionChip = ({ label, selected, onPress, icon }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[styles.chip, selected && styles.chipSelected]}
    >
        {icon ? (
            <MaterialCommunityIcons
                name={icon}
                size={14}
                color={selected ? '#041018' : '#00E5BE'}
            />
        ) : null}
        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
);

export default function OnboardingScreen() {
    const navigation = useNavigation();
    const { userProfile, saveUserProfile } = useContext(FitnessItems);

    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [gender, setGender] = useState('');
    const [goal, setGoal] = useState('');
    const [fitnessLevel, setFitnessLevel] = useState('');

    useEffect(() => {
        if (!userProfile) return;
        setAge(String(userProfile.age || ''));
        setWeight(String(userProfile.weight || ''));
        setGender(String(userProfile.gender || ''));
        setGoal(String(userProfile.goal || ''));
        setFitnessLevel(String(userProfile.fitnessLevel || ''));
    }, [userProfile]);

    const isReadyToSubmit = useMemo(() => {
        const parsedAge = Number.parseInt(age, 10);
        const parsedWeight = Number.parseFloat(weight);
        return (
            Number.isInteger(parsedAge) &&
            parsedAge >= 10 &&
            parsedAge <= 120 &&
            Number.isFinite(parsedWeight) &&
            parsedWeight > 0 &&
            parsedWeight <= 500 &&
            !!gender &&
            !!goal &&
            !!fitnessLevel
        );
    }, [age, weight, gender, goal, fitnessLevel]);

    const handleContinue = () => {
        const parsedAge = Number.parseInt(age, 10);
        const parsedWeight = Number.parseFloat(weight);

        if (!Number.isInteger(parsedAge) || parsedAge < 10 || parsedAge > 120) {
            Alert.alert('Invalid age', 'Enter a valid age between 10 and 120.');
            return;
        }

        if (!Number.isFinite(parsedWeight) || parsedWeight <= 0 || parsedWeight > 500) {
            Alert.alert('Invalid weight', 'Enter a valid weight in kilograms.');
            return;
        }

        if (!gender || !goal || !fitnessLevel) {
            Alert.alert('Missing details', 'Select your gender, goal, and fitness level to continue.');
            return;
        }

        const saved = saveUserProfile({
            age: parsedAge,
            weight: parsedWeight,
            gender,
            goal,
            fitnessLevel,
            updatedAt: new Date().toISOString(),
        });

        if (!saved) {
            Alert.alert('Could not save profile', 'Please review your details and try again.');
            return;
        }

        navigation.replace('App');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#0D0D0F', '#121218', '#191926']} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.header}>
                        <View style={styles.badge}>
                            <Feather name="user-check" size={13} color="#00E5BE" />
                            <Text style={styles.badgeText}>ONBOARDING</Text>
                        </View>
                        <Text style={styles.title}>Build Your Plan</Text>
                        <Text style={styles.subtitle}>
                            Tell us about your body and fitness goals so we can personalize your training.
                        </Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.inputLabel}>Age</Text>
                        <TextInput
                            value={age}
                            onChangeText={setAge}
                            keyboardType="number-pad"
                            placeholder="e.g. 24"
                            placeholderTextColor="#5F5F76"
                            style={styles.input}
                            maxLength={3}
                        />

                        <Text style={styles.inputLabel}>Weight (kg)</Text>
                        <TextInput
                            value={weight}
                            onChangeText={setWeight}
                            keyboardType="decimal-pad"
                            placeholder="e.g. 72.5"
                            placeholderTextColor="#5F5F76"
                            style={styles.input}
                            maxLength={6}
                        />

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

                        <Text style={styles.inputLabel}>Goal</Text>
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

                        <Text style={styles.inputLabel}>Fitness Level</Text>
                        <View style={styles.rowWrap}>
                            {FITNESS_LEVEL_OPTIONS.map((option) => (
                                <OptionChip
                                    key={option.value}
                                    label={option.label}
                                    selected={fitnessLevel === option.value}
                                    onPress={() => setFitnessLevel(option.value)}
                                />
                            ))}
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={handleContinue}
                        activeOpacity={0.9}
                        disabled={!isReadyToSubmit}
                        style={[styles.ctaWrapper, !isReadyToSubmit && styles.ctaDisabled]}
                    >
                        <LinearGradient
                            colors={isReadyToSubmit ? ['#FF4D2E', '#FF2800'] : ['#3A3A4F', '#2B2B3C']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.cta}
                        >
                            <Text style={styles.ctaText}>SAVE & CONTINUE</Text>
                            <Feather name="arrow-right" size={18} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0F',
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 22,
        paddingBottom: 16,
        gap: 14,
    },
    header: {
        paddingTop: 8,
        gap: 8,
    },
    badge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(0,229,190,0.35)',
        backgroundColor: 'rgba(0,229,190,0.12)',
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    badgeText: {
        color: '#00E5BE',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.2,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    subtitle: {
        color: '#A0A0BA',
        fontSize: 13,
        lineHeight: 19,
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: '#111118',
        padding: 14,
        gap: 8,
    },
    inputLabel: {
        color: '#A5A5BE',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginTop: 4,
    },
    input: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#232334',
        backgroundColor: '#171723',
        color: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 11,
        fontSize: 14,
    },
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
        gap: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(0,229,190,0.45)',
        backgroundColor: 'rgba(0,229,190,0.1)',
        paddingHorizontal: 11,
        paddingVertical: 8,
    },
    chipSelected: {
        borderColor: '#00E5BE',
        backgroundColor: '#00E5BE',
    },
    chipText: {
        color: '#00E5BE',
        fontSize: 12,
        fontWeight: '800',
    },
    chipTextSelected: {
        color: '#041018',
    },
    footer: {
        paddingHorizontal: 22,
        paddingBottom: 10,
        paddingTop: 6,
    },
    ctaWrapper: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    ctaDisabled: {
        opacity: 0.9,
    },
    cta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 13,
    },
    ctaText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 0.3,
    },
});
