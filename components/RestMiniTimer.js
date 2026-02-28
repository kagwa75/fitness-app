import { useContext, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { FitnessItems } from '../Context';

const formatSeconds = (value) => {
    const safe = Math.max(0, Math.round(Number(value) || 0));
    const minutes = Math.floor(safe / 60);
    const seconds = safe % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const RestMiniTimer = ({ currentRouteName, navigationRef }) => {
    const insets = useSafeAreaInsets();
    const { restTimer, stopRestTimer, isRestTimerUrgent } = useContext(FitnessItems);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const isVisible =
        restTimer.isActive &&
        restTimer.timeLeft > 0 &&
        currentRouteName !== 'Rest';

    useEffect(() => {
        if (!isVisible) {
            pulseAnim.setValue(1);
            return undefined;
        }

        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.03, duration: 250, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
            ])
        );

        if (isRestTimerUrgent) {
            pulse.start();
        } else {
            pulse.stop();
            pulseAnim.setValue(1);
        }

        return () => pulse.stop();
    }, [isVisible, isRestTimerUrgent, pulseAnim]);

    if (!isVisible) return null;

    const openRestScreen = () => {
        if (!navigationRef?.isReady?.()) return;
        navigationRef.navigate('Rest', {
            duration: restTimer.duration || restTimer.timeLeft,
        });
    };

    const bottomOffset = Math.max(88, insets.bottom + 74);
    const formatted = formatSeconds(restTimer.timeLeft);

    return (
        <Animated.View
            pointerEvents="box-none"
            style={[
                styles.wrapper,
                { bottom: bottomOffset, transform: [{ scale: pulseAnim }] },
                isRestTimerUrgent && styles.wrapperUrgent,
            ]}
        >
            <TouchableOpacity activeOpacity={0.9} onPress={openRestScreen} style={styles.mainBtn}>
                <View style={styles.leftGroup}>
                    <View
                        style={[
                            styles.iconWrap,
                            isRestTimerUrgent && styles.iconWrapUrgent,
                        ]}
                    >
                        <MaterialCommunityIcons
                            name="timer-outline"
                            size={14}
                            color={isRestTimerUrgent ? '#FF4D2E' : '#00E5BE'}
                        />
                    </View>

                    <View>
                        <Text style={styles.title}>Rest in progress</Text>
                        <Text style={styles.subtitle}>Tap to return</Text>
                    </View>
                </View>

                <Text style={[styles.timerText, isRestTimerUrgent && styles.timerTextUrgent]}>
                    {formatted}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                activeOpacity={0.85}
                onPress={stopRestTimer}
                style={styles.closeBtn}
                accessibilityLabel="Stop rest timer"
            >
                <Feather name="x" size={14} color="#CFCFE2" />
            </TouchableOpacity>
        </Animated.View>
    );
};

export default RestMiniTimer;

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        left: 14,
        right: 14,
        zIndex: 2000,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    wrapperUrgent: {
        shadowColor: '#FF4D2E',
        shadowOpacity: 0.32,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
    },
    mainBtn: {
        flex: 1,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(11,11,15,0.94)',
        paddingVertical: 12,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    iconWrap: {
        width: 28,
        height: 28,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,229,190,0.16)',
    },
    iconWrapUrgent: {
        backgroundColor: 'rgba(255,77,46,0.18)',
    },
    title: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    subtitle: {
        color: '#7B7B95',
        fontSize: 11,
        fontWeight: '500',
        marginTop: 1,
    },
    timerText: {
        color: '#00E5BE',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 0.8,
    },
    timerTextUrgent: {
        color: '#FF4D2E',
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(11,11,15,0.94)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
