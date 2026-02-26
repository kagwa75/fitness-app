import { useNavigation } from '@react-navigation/native';
import { useEffect, useState, useRef } from 'react';
import { Text, TouchableOpacity, View, StyleSheet, Animated, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const REST_DURATION = 15;

// Animated circular progress ring (SVG-free, pure RN)
const CountdownRing = ({ timeLeft, total }) => {
    const progress = timeLeft / total;
    const size = 220;
    const strokeWidth = 8;
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;

    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.04, duration: 600, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            ])
        );
        if (timeLeft <= 5) {
            pulse.start();
        } else {
            pulse.stop();
            pulseAnim.setValue(1);
        }
        return () => pulse.stop();
    }, [timeLeft <= 5]);

    // Use a simple arc drawn as a rotated View trick
    const arcProgress = 1 - progress;
    const urgentColor = timeLeft <= 5 ? '#FF4D2E' : '#00E5BE';

    return (
        <Animated.View style={[styles.ringContainer, { transform: [{ scale: pulseAnim }] }]}>
            {/* Track ring */}
            <View style={[styles.ringTrack, { borderColor: '#1E1E26' }]} />
            {/* Progress ring — simplified as border trick */}
            <View
                style={[
                    styles.ringProgress,
                    {
                        borderColor: urgentColor,
                        borderTopColor: progress > 0.75 ? urgentColor : 'transparent',
                        borderRightColor: progress > 0.5 ? urgentColor : 'transparent',
                        borderBottomColor: progress > 0.25 ? urgentColor : 'transparent',
                        borderLeftColor: urgentColor,
                        transform: [{ rotate: `${-90 + (1 - progress) * 360}deg` }],
                        opacity: progress > 0 ? 1 : 0,
                    },
                ]}
            />

            {/* Center content */}
            <View style={styles.ringCenter}>
                <Text style={[styles.ringTime, { color: urgentColor }]}>{timeLeft}</Text>
                <Text style={styles.ringSec}>SEC</Text>
            </View>
        </Animated.View>
    );
};

const RestScreen = () => {
    const navigation = useNavigation();
    const [timeLeft, setTimeLeft] = useState(REST_DURATION);
    const timerRef = useRef(null);

    const contentOpacity = useRef(new Animated.Value(0)).current;
    const contentY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(contentOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(contentY, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
        ]).start();
    }, []);

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    navigation.goBack();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [navigation]);

    const addTime = () => setTimeLeft((prev) => prev + 10);
    const skipRest = () => {
        clearInterval(timerRef.current);
        navigation.goBack();
    };

    const isUrgent = timeLeft <= 5;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Background gradient */}
            <LinearGradient
                colors={['#0D0D0F', '#121218', '#0D0D0F']}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Decorative glow */}
            <View
                style={[
                    styles.glow,
                    { backgroundColor: isUrgent ? '#FF4D2E' : '#00E5BE' },
                ]}
            />

            <SafeAreaView style={styles.safeArea}>
                <Animated.View
                    style={[
                        styles.content,
                        { opacity: contentOpacity, transform: [{ translateY: contentY }] },
                    ]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={[styles.restBadge, { borderColor: isUrgent ? '#FF4D2E40' : '#00E5BE40' }]}>
                            <MaterialCommunityIcons
                                name="lightning-bolt"
                                size={13}
                                color={isUrgent ? '#FF4D2E' : '#00E5BE'}
                            />
                            <Text style={[styles.restBadgeText, { color: isUrgent ? '#FF4D2E' : '#00E5BE' }]}>
                                REST PERIOD
                            </Text>
                        </View>
                        <Text style={styles.title}>TAKE A BREAK</Text>
                        <Text style={styles.subtitle}>
                            {isUrgent ? 'Get ready for the next set!' : 'Recover and breathe deeply'}
                        </Text>
                    </View>

                    {/* Ring */}
                    <CountdownRing timeLeft={timeLeft} total={REST_DURATION} />

                    {/* Tip card */}
                    <View style={styles.tipCard}>
                        <Feather name="wind" size={15} color="#555" style={{ marginRight: 10 }} />
                        <Text style={styles.tipText}>
                            {isUrgent
                                ? 'Prepare your stance — next exercise coming up!'
                                : 'Focus on controlled breathing to speed recovery'}
                        </Text>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity onPress={addTime} style={styles.secondaryBtn} activeOpacity={0.8}>
                            <Feather name="plus" size={16} color="#888" />
                            <Text style={styles.secondaryBtnText}>+10 sec</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={skipRest} activeOpacity={0.9} style={styles.skipBtnWrapper}>
                            <LinearGradient
                                colors={['#FF4D2E', '#FF2800']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.skipBtn}
                            >
                                <Text style={styles.skipBtnText}>Skip Rest</Text>
                                <Feather name="arrow-right" size={16} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
};

export default RestScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0F',
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 40,
        paddingHorizontal: 24,
    },
    glow: {
        position: 'absolute',
        top: '20%',
        alignSelf: 'center',
        width: 280,
        height: 280,
        borderRadius: 140,
        opacity: 0.07,
        transform: [{ scaleY: 0.5 }],
    },

    // Header
    header: {
        alignItems: 'center',
        gap: 8,
    },
    restBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    restBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -0.5,
        marginTop: 4,
    },
    subtitle: {
        color: '#555',
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
    },

    // Ring
    ringContainer: {
        width: 220,
        height: 220,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    ringTrack: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 8,
    },
    ringProgress: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 8,
    },
    ringCenter: {
        alignItems: 'center',
    },
    ringTime: {
        fontSize: 72,
        fontWeight: '900',
        letterSpacing: -3,
        lineHeight: 76,
    },
    ringSec: {
        color: '#444',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 2,
        marginTop: -2,
    },

    // Tip
    tipCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#16161A',
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        width: '100%',
    },
    tipText: {
        flex: 1,
        color: '#555',
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 18,
    },

    // Buttons
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
        alignItems: 'center',
    },
    secondaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#16161A',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
    },
    secondaryBtnText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '700',
    },
    skipBtnWrapper: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
    },
    skipBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 18,
    },
    skipBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
});