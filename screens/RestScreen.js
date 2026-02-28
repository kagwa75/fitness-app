import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { useContext, useEffect, useMemo, useRef } from 'react';
import { Text, TouchableOpacity, View, StyleSheet, Animated, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FitnessItems } from '../Context';

const FALLBACK_REST_DURATION = 15;

// Animated circular progress ring (SVG-free, pure RN)
const CountdownRing = ({ timeLeft, total }) => {
    const safeTotal = Math.max(1, Number(total) || 1);
    const progress = Math.max(0, Math.min(1, timeLeft / safeTotal));
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.04, duration: 600, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            ])
        );

        if (timeLeft <= 5 && timeLeft > 0) {
            pulse.start();
        } else {
            pulse.stop();
            pulseAnim.setValue(1);
        }

        return () => pulse.stop();
    }, [pulseAnim, timeLeft]);

    const urgentColor = timeLeft <= 5 ? '#FF4D2E' : '#00E5BE';

    return (
        <Animated.View style={[styles.ringContainer, { transform: [{ scale: pulseAnim }] }]}>
            <View style={[styles.ringTrack, { borderColor: '#1E1E26' }]} />
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

            <View style={styles.ringCenter}>
                <Text style={[styles.ringTime, { color: urgentColor }]}>{timeLeft}</Text>
                <Text style={styles.ringSec}>SEC</Text>
            </View>
        </Animated.View>
    );
};

const RestScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const isFocused = useIsFocused();
    const {
        restTimer,
        startRestTimer,
        addRestTime,
        stopRestTimer,
        isRestTimerUrgent,
    } = useContext(FitnessItems);

    const contentOpacity = useRef(new Animated.Value(0)).current;
    const contentY = useRef(new Animated.Value(20)).current;
    const hasInitializedRef = useRef(false);
    const hadActiveTimerRef = useRef(false);

    const requestedDuration = useMemo(() => {
        const parsed = Number(route.params?.duration);
        return Number.isFinite(parsed) && parsed > 0
            ? Math.round(parsed)
            : FALLBACK_REST_DURATION;
    }, [route.params?.duration]);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(contentOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(contentY, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
        ]).start();
    }, [contentOpacity, contentY]);

    // If screen opens and no timer is active, initialize one using the route duration.
    useEffect(() => {
        if (hasInitializedRef.current) return;
        hasInitializedRef.current = true;

        if (!restTimer.isActive && restTimer.timeLeft <= 0) {
            startRestTimer(requestedDuration, true);
        }
    }, [requestedDuration, restTimer.isActive, restTimer.timeLeft, startRestTimer]);

    useEffect(() => {
        if (restTimer.isActive && restTimer.timeLeft > 0) {
            hadActiveTimerRef.current = true;
        }
    }, [restTimer.isActive, restTimer.timeLeft]);

    // When timer ends while this screen is open, return to previous screen automatically.
    useEffect(() => {
        if (!isFocused || !hadActiveTimerRef.current) return;
        if (restTimer.isActive || restTimer.timeLeft > 0) return;

        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('App');
        }
    }, [isFocused, navigation, restTimer.isActive, restTimer.timeLeft]);

    const timeLeft = restTimer.timeLeft > 0 ? restTimer.timeLeft : requestedDuration;
    const totalDuration = restTimer.duration > 0 ? restTimer.duration : requestedDuration;
    const isUrgent = isRestTimerUrgent || timeLeft <= 5;

    const addTime = () => addRestTime(10);
    const skipRest = () => {
        stopRestTimer();
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('App');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <LinearGradient
                colors={['#0D0D0F', '#121218', '#0D0D0F']}
                style={StyleSheet.absoluteFillObject}
            />

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

                    <CountdownRing timeLeft={timeLeft} total={totalDuration} />

                    <View style={styles.tipCard}>
                        <Feather name="wind" size={15} color="#555" style={{ marginRight: 10 }} />
                        <Text style={styles.tipText}>
                            {isUrgent
                                ? 'Prepare your stance — next exercise coming up!'
                                : 'Focus on controlled breathing to speed recovery'}
                        </Text>
                    </View>

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
        justifyContent: 'center',
    },
    ringTime: {
        fontSize: 72,
        fontWeight: '900',
        letterSpacing: -3,
        lineHeight: 72,
    },
    ringSec: {
        color: '#555',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 2,
        marginTop: 2,
    },

    tipCard: {
        width: '100%',
        backgroundColor: '#16161A',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tipText: {
        color: '#7A7A93',
        fontSize: 12,
        fontWeight: '500',
        flex: 1,
    },

    buttonRow: {
        width: '100%',
        flexDirection: 'row',
        gap: 10,
    },
    secondaryBtn: {
        flex: 1,
        height: 52,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: '#15151A',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    secondaryBtnText: {
        color: '#888',
        fontSize: 13,
        fontWeight: '700',
    },
    skipBtnWrapper: {
        flex: 1.4,
        borderRadius: 14,
        overflow: 'hidden',
    },
    skipBtn: {
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
    },
    skipBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 0.6,
    },
});
