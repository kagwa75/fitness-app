import { useState, useRef, useEffect } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// ── Tab switcher ──────────────────────────────────────────────
const TabBar = ({ activeTab, onTabChange, accentColor }) => {
    const tabs = [
        { key: 'instructions', label: 'INSTRUCTIONS', icon: 'clipboard' },
        { key: 'records', label: 'RECORDS', icon: 'bar-chart-2' },
    ];

    const slideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: activeTab === 'instructions' ? 0 : 1,
            tension: 80,
            friction: 12,
            useNativeDriver: false,
        }).start();
    }, [activeTab]);

    const tabWidth = (width - 44) / 2; // 22px padding each side

    return (
        <View style={styles.tabBar}>
            {/* Sliding indicator */}
            <Animated.View
                style={[
                    styles.tabIndicator,
                    {
                        backgroundColor: accentColor,
                        width: tabWidth,
                        transform: [
                            {
                                translateX: slideAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, tabWidth],
                                }),
                            },
                        ],
                    },
                ]}
            />
            {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                    <TouchableOpacity
                        key={tab.key}
                        onPress={() => onTabChange(tab.key)}
                        style={[styles.tabBtn, { width: tabWidth }]}
                        activeOpacity={0.8}
                    >
                        <Feather
                            name={tab.icon}
                            size={13}
                            color={isActive ? '#fff' : '#444'}
                        />
                        <Text style={[styles.tabLabel, isActive && { color: '#fff' }]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

// ── Numbered step row ─────────────────────────────────────────
const StepRow = ({ number, text, accentColor, delay = 0 }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(-16)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
                Animated.spring(translateX, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
            ]),
        ]).start();
    }, []);

    return (
        <Animated.View style={[styles.stepRow, { opacity, transform: [{ translateX }] }]}>
            <View style={[styles.stepNumber, { backgroundColor: accentColor + '20', borderColor: accentColor + '40' }]}>
                <Text style={[styles.stepNumberText, { color: accentColor }]}>{number}</Text>
            </View>
            <Text style={styles.stepText}>{text}</Text>
        </Animated.View>
    );
};

// ── Section header ────────────────────────────────────────────
const SectionHeader = ({ icon, label, accentColor }) => (
    <View style={styles.sectionHeader}>
        <View style={[styles.sectionIconBg, { backgroundColor: accentColor + '18' }]}>
            <MaterialCommunityIcons name={icon} size={13} color={accentColor} />
        </View>
        <Text style={[styles.sectionLabel, { color: accentColor }]}>{label}</Text>
        <View style={[styles.sectionLine, { backgroundColor: accentColor + '20' }]} />
    </View>
);

// ── Tip chip ──────────────────────────────────────────────────
const TipChip = ({ number, text, delay = 0 }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(12)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
                Animated.spring(translateY, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
            ]),
        ]).start();
    }, []);

    return (
        <Animated.View style={[styles.tipChip, { opacity, transform: [{ translateY }] }]}>
            <View style={styles.tipNumber}>
                <Text style={styles.tipNumberText}>{number}</Text>
            </View>
            <Text style={styles.tipText}>{text}</Text>
        </Animated.View>
    );
};

// ── Records placeholder ───────────────────────────────────────
const RecordsTab = ({ data }) => {
    const pulseAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 0.9, duration: 1000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.recordsEmpty}>
            <Animated.View style={[styles.recordsIconBg, { transform: [{ scale: pulseAnim }] }]}>
                <MaterialCommunityIcons name="chart-line-variant" size={30} color="#FF4D2E" />
            </Animated.View>
            <Text style={styles.recordsTitle}>No records yet</Text>
            <Text style={styles.recordsSubtext}>
                Complete {data?.name ?? 'this exercise'} to start tracking your progress
            </Text>

            {/* Placeholder stat row */}
            <View style={styles.recordsStatRow}>
                {['Best', 'Last', 'Total'].map((label) => (
                    <View key={label} style={styles.recordsStat}>
                        <Text style={styles.recordsStatValue}>—</Text>
                        <Text style={styles.recordsStatLabel}>{label.toUpperCase()}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

// ── Main component ────────────────────────────────────────────
export default function Details({ data, image, accentColor = '#FF4D2E' }) {
    const [activeTab, setActiveTab] = useState('instructions');
    const contentOpacity = useRef(new Animated.Value(1)).current;

    const handleTabChange = (tab) => {
        Animated.sequence([
            Animated.timing(contentOpacity, { toValue: 0, duration: 120, useNativeDriver: true }),
            Animated.timing(contentOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        ]).start();
        setActiveTab(tab);
    };

    const tips = data?.tips || [];
    const execSteps = [data?.execution1, data?.execution2].filter(Boolean);

    return (
        <View style={styles.container}>
            {/* Tab bar */}
            <TabBar
                activeTab={activeTab}
                onTabChange={handleTabChange}
                accentColor={accentColor}
            />

            {/* Content */}
            <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
                {activeTab === 'instructions' ? (
                    <View style={styles.instructionsTab}>
                        {/* Preparation */}
                        {data?.preparation && (
                            <View style={styles.section}>
                                <SectionHeader
                                    icon="clipboard-text-outline"
                                    label="PREPARATION"
                                    accentColor={accentColor}
                                />
                                <View style={styles.prepCard}>
                                    <Text style={styles.prepText}>{data.preparation}</Text>
                                </View>
                            </View>
                        )}

                        {/* Execution steps */}
                        {execSteps.length > 0 && (
                            <View style={styles.section}>
                                <SectionHeader
                                    icon="play-circle-outline"
                                    label="EXECUTION"
                                    accentColor={accentColor}
                                />
                                {execSteps.map((step, i) => (
                                    <StepRow
                                        key={i}
                                        number={i + 1}
                                        text={step}
                                        accentColor={accentColor}
                                        delay={i * 80}
                                    />
                                ))}
                            </View>
                        )}

                        {/* Key tips */}
                        {tips.length > 0 && (
                            <View style={styles.section}>
                                <SectionHeader
                                    icon="lightbulb-on-outline"
                                    label="KEY TIPS"
                                    accentColor="#FFB800"
                                />
                                <View style={styles.tipsGrid}>
                                    {tips.filter(Boolean).map((tip, i) => (
                                        <TipChip
                                            key={i}
                                            number={i + 1}
                                            text={tip}
                                            delay={i * 80}
                                        />
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Focus & equipment info row */}
                        <View style={styles.infoRow}>
                            {data?.target && (
                                <View style={styles.infoTile}>
                                    <MaterialCommunityIcons name="target" size={18} color="#00E5BE" />
                                    <Text style={styles.infoTileLabel}>FOCUS</Text>
                                    <Text style={[styles.infoTileValue, { color: '#00E5BE' }]}>
                                        {data.target}
                                    </Text>
                                </View>
                            )}
                            {data?.equipment && (
                                <View style={styles.infoTile}>
                                    <Feather name="tool" size={18} color="#6C63FF" />
                                    <Text style={styles.infoTileLabel}>EQUIPMENT</Text>
                                    <Text style={[styles.infoTileValue, { color: '#6C63FF' }]}>
                                        {data.equipment}
                                    </Text>
                                </View>
                            )}
                            {data?.sets && (
                                <View style={styles.infoTile}>
                                    <Feather name="refresh-cw" size={18} color={accentColor} />
                                    <Text style={styles.infoTileLabel}>SETS</Text>
                                    <Text style={[styles.infoTileValue, { color: accentColor }]}>
                                        {data.sets}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                ) : (
                    <RecordsTab data={data} />
                )}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    // Tab bar
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#1E1E26',
        borderRadius: 16,
        padding: 4,
        marginBottom: 22,
        position: 'relative',
        overflow: 'hidden',
    },
    tabIndicator: {
        position: 'absolute',
        top: 4,
        left: 4,
        height: '100%',
        marginBottom: 4,
        borderRadius: 12,
    },
    tabBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        zIndex: 1,
    },
    tabLabel: {
        color: '#444',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },

    // Content
    content: {
        flex: 1,
    },
    instructionsTab: {
        gap: 22,
        paddingBottom: 12,
    },

    // Section
    section: {
        gap: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 2,
    },
    sectionIconBg: {
        width: 26,
        height: 26,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    sectionLine: {
        flex: 1,
        height: 1,
    },

    // Preparation card
    prepCard: {
        backgroundColor: '#1E1E26',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    prepText: {
        color: '#999',
        fontSize: 13,
        lineHeight: 20,
        fontWeight: '400',
    },

    // Step rows
    stepRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        backgroundColor: '#1E1E26',
        borderRadius: 14,
        padding: 13,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.04)',
    },
    stepNumber: {
        width: 26,
        height: 26,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        flexShrink: 0,
        marginTop: 1,
    },
    stepNumberText: {
        fontSize: 12,
        fontWeight: '900',
    },
    stepText: {
        flex: 1,
        color: '#ADADBE',
        fontSize: 13,
        lineHeight: 20,
        fontWeight: '400',
    },

    // Tips
    tipsGrid: {
        gap: 8,
    },
    tipChip: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        backgroundColor: '#1E1E26',
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,184,0,0.1)',
    },
    tipNumber: {
        width: 22,
        height: 22,
        borderRadius: 7,
        backgroundColor: '#FFB80018',
        borderWidth: 1,
        borderColor: '#FFB80040',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: 1,
    },
    tipNumberText: {
        color: '#FFB800',
        fontSize: 10,
        fontWeight: '900',
    },
    tipText: {
        flex: 1,
        color: '#888',
        fontSize: 13,
        lineHeight: 20,
    },

    // Info row (focus, equipment, sets)
    infoRow: {
        flexDirection: 'row',
        gap: 10,
    },
    infoTile: {
        flex: 1,
        backgroundColor: '#1E1E26',
        borderRadius: 16,
        padding: 14,
        alignItems: 'center',
        gap: 5,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.04)',
    },
    infoTileLabel: {
        color: '#444',
        fontSize: 8,
        fontWeight: '800',
        letterSpacing: 1.2,
    },
    infoTileValue: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'capitalize',
        textAlign: 'center',
    },

    // Records tab
    recordsEmpty: {
        alignItems: 'center',
        paddingVertical: 30,
        gap: 10,
    },
    recordsIconBg: {
        width: 72,
        height: 72,
        borderRadius: 22,
        backgroundColor: 'rgba(255,77,46,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,77,46,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    recordsTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    recordsSubtext: {
        color: '#444',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    recordsStatRow: {
        flexDirection: 'row',
        gap: 10,
        width: '100%',
        marginTop: 10,
    },
    recordsStat: {
        flex: 1,
        backgroundColor: '#1E1E26',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.04)',
    },
    recordsStatValue: {
        color: '#333',
        fontSize: 20,
        fontWeight: '900',
    },
    recordsStatLabel: {
        color: '#333',
        fontSize: 8,
        fontWeight: '800',
        letterSpacing: 1.2,
    },
});