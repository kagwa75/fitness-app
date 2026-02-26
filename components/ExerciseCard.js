import { useState, useRef, useEffect } from 'react';
import {
    Image,
    Modal,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    Animated,
    Dimensions,
    ScrollView,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Details from '../screens/Details';

const { width, height } = Dimensions.get('window');

const CATEGORY_ICONS = {
    Chest: 'heart-pulse',
    Back: 'human-handsdown',
    Legs: 'run',
    Arms: 'arm-flex',
    Shoulders: 'human-queue',
    Core: 'circle-outline',
    Cardio: 'heart',
    default: 'dumbbell',
};

// ── Bottom-sheet modal ────────────────────────────────────────
const ExerciseModal = ({ visible, onClose, data, image, accentColor }) => {
    const slideAnim = useRef(new Animated.Value(height)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 65,
                    friction: 11,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: height,
                    duration: 280,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 0,
                    duration: 240,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const sets = data?.sets ?? null;
    const duration = data?.duration ?? null;
    const isTimeBased = !!duration;

    return (
        <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
            <StatusBar barStyle="light-content" />

            {/* Dim backdrop */}
            <Animated.View style={[styles.modalBackdrop, { opacity: backdropOpacity }]}>
                <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
            </Animated.View>

            {/* Sheet */}
            <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
                {/* Drag handle */}
                <View style={styles.sheetHandle} />

                {/* Accent stripe */}
                <View style={[styles.sheetAccentBar, { backgroundColor: accentColor }]} />

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.sheetScroll}
                    bounces={false}
                >
                    {/* GIF hero */}
                    <View style={styles.gifWrapper}>
                        <Image
                            source={{ uri: image }}
                            style={styles.sheetGif}
                            resizeMode="cover"
                        />
                        <LinearGradient
                            colors={[accentColor + '30', 'transparent']}
                            style={StyleSheet.absoluteFillObject}
                        />
                        <LinearGradient
                            colors={['transparent', '#16161A']}
                            style={styles.gifBottomFade}
                        />
                        {/* Category badge */}
                        <View style={[styles.sheetCategoryBadge, { backgroundColor: accentColor }]}>
                            <MaterialCommunityIcons
                                name={CATEGORY_ICONS[data?.category] || CATEGORY_ICONS.default}
                                size={12}
                                color="#fff"
                            />
                            <Text style={styles.sheetCategoryText}>
                                {data?.category?.toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    {/* Exercise name */}
                    <View style={styles.sheetNameRow}>
                        <Text style={styles.sheetName}>{data?.name}</Text>
                    </View>

                    {/* Metric tiles */}
                    <View style={styles.metricRow}>
                        <View style={[styles.metricTile, { borderColor: accentColor + '30' }]}>
                            <View style={[styles.metricIcon, { backgroundColor: accentColor + '18' }]}>
                                <Feather
                                    name={isTimeBased ? 'clock' : 'refresh-cw'}
                                    size={16}
                                    color={accentColor}
                                />
                            </View>
                            <Text style={[styles.metricValue, { color: accentColor }]}>
                                {isTimeBased ? `${duration}s` : `×${sets}`}
                            </Text>
                            <Text style={styles.metricLabel}>
                                {isTimeBased ? 'DURATION' : 'REPS'}
                            </Text>
                        </View>

                        {data?.target && (
                            <View style={styles.metricTile}>
                                <View style={[styles.metricIcon, { backgroundColor: '#00E5BE18' }]}>
                                    <MaterialCommunityIcons name="target" size={16} color="#00E5BE" />
                                </View>
                                <Text style={[styles.metricValue, { color: '#00E5BE', fontSize: 13 }]}>
                                    {data.target}
                                </Text>
                                <Text style={styles.metricLabel}>TARGET</Text>
                            </View>
                        )}

                        {data?.equipment && (
                            <View style={styles.metricTile}>
                                <View style={[styles.metricIcon, { backgroundColor: '#6C63FF18' }]}>
                                    <Feather name="tool" size={16} color="#6C63FF" />
                                </View>
                                <Text style={[styles.metricValue, { color: '#6C63FF', fontSize: 13 }]}>
                                    {data.equipment}
                                </Text>
                                <Text style={styles.metricLabel}>GEAR</Text>
                            </View>
                        )}
                    </View>

                    {/* Details component */}
                    <View style={styles.detailsWrapper}>
                        <Details data={data} image={image} />
                    </View>
                </ScrollView>

                {/* Sticky close button */}
                <View style={styles.sheetFooter}>
                    <TouchableOpacity onPress={onClose} activeOpacity={0.9} style={{ flex: 1 }}>
                        <LinearGradient
                            colors={[accentColor, accentColor + 'BB']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.closeBtn}
                        >
                            <MaterialCommunityIcons name="check-bold" size={18} color="#fff" />
                            <Text style={styles.closeBtnText}>GOT IT</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Modal>
    );
};

// ── Card ──────────────────────────────────────────────────────
export default function ExerciseCard({ data, image, accentColor = '#FF4D2E' }) {
    const [modalVisible, setModalVisible] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const categoryIcon = CATEGORY_ICONS[data?.category] || CATEGORY_ICONS.default;

    const handlePressIn = () =>
        Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, tension: 300 }).start();
    const handlePressOut = () =>
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300 }).start();

    const sets = data?.sets ?? null;
    const duration = data?.duration ?? null;

    return (
        <>
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
                style={{ marginBottom: 12 }}
            >
                <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
                    {/* Colored top accent */}
                    <View style={[styles.topAccent, { backgroundColor: accentColor }]} />

                    <View style={styles.cardBody}>
                        {/* Thumbnail */}
                        <View style={styles.thumbWrapper}>
                            <Image
                                source={{ uri: image }}
                                style={styles.thumb}
                                resizeMode="cover"
                            />
                            <LinearGradient
                                colors={[accentColor + '28', 'transparent']}
                                style={StyleSheet.absoluteFillObject}
                            />
                            <View style={[styles.thumbBadge, { backgroundColor: accentColor }]}>
                                <MaterialCommunityIcons name={categoryIcon} size={11} color="#fff" />
                            </View>
                        </View>

                        {/* Info */}
                        <View style={styles.info}>
                            <Text style={styles.name} numberOfLines={2}>
                                {data?.name}
                            </Text>

                            <View style={styles.metaRow}>
                                {data?.category && (
                                    <Text style={[styles.categoryLabel, { color: accentColor }]}>
                                        {data.category.toUpperCase()}
                                    </Text>
                                )}
                                {data?.target && (
                                    <>
                                        <View style={styles.metaDivider} />
                                        <Text style={styles.targetLabel}>{data.target}</Text>
                                    </>
                                )}
                            </View>

                            <View style={styles.chips}>
                                {duration ? (
                                    <View style={[styles.chip, { backgroundColor: accentColor + '15', borderColor: accentColor + '35' }]}>
                                        <Feather name="clock" size={10} color={accentColor} />
                                        <Text style={[styles.chipText, { color: accentColor }]}>{duration}s</Text>
                                    </View>
                                ) : sets ? (
                                    <View style={[styles.chip, { backgroundColor: accentColor + '15', borderColor: accentColor + '35' }]}>
                                        <Feather name="refresh-cw" size={10} color={accentColor} />
                                        <Text style={[styles.chipText, { color: accentColor }]}>{sets} reps</Text>
                                    </View>
                                ) : null}
                                {data?.equipment && (
                                    <View style={styles.chip}>
                                        <Feather name="tool" size={10} color="#555" />
                                        <Text style={styles.chipText}>{data.equipment}</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Arrow */}
                        <View style={[styles.arrowBtn, { backgroundColor: accentColor + '15', borderColor: accentColor + '30' }]}>
                            <Feather name="chevron-right" size={16} color={accentColor} />
                        </View>
                    </View>
                </Animated.View>
            </TouchableOpacity>

            <ExerciseModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                data={data}
                image={image}
                accentColor={accentColor}
            />
        </>
    );
}

const styles = StyleSheet.create({
    // Card
    card: {
        backgroundColor: '#16161A',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    topAccent: {
        height: 3,
        width: '100%',
    },
    cardBody: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 14,
    },
    thumbWrapper: {
        width: 76,
        height: 76,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#222',
        flexShrink: 0,
    },
    thumb: {
        width: '100%',
        height: '100%',
    },
    thumbBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 20,
        height: 20,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: {
        flex: 1,
        gap: 4,
    },
    name: {
        color: '#EFEFEF',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: -0.2,
        textTransform: 'capitalize',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    categoryLabel: {
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 1.2,
    },
    metaDivider: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#333',
    },
    targetLabel: {
        color: '#444',
        fontSize: 10,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    chips: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 4,
        flexWrap: 'wrap',
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        backgroundColor: '#1E1E26',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    chipText: {
        color: '#555',
        fontSize: 10,
        fontWeight: '600',
    },
    arrowBtn: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        flexShrink: 0,
    },

    // Modal / Sheet
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.78)',
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.88,
        backgroundColor: '#16161A',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
    },
    sheetHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#2E2E3A',
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 4,
    },
    sheetAccentBar: {
        height: 3,
        width: '100%',
    },
    sheetScroll: {
        paddingBottom: 20,
    },
    gifWrapper: {
        height: 240,
        backgroundColor: '#111',
        position: 'relative',
    },
    sheetGif: {
        width: '100%',
        height: '100%',
    },
    gifBottomFade: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
    },
    sheetCategoryBadge: {
        position: 'absolute',
        top: 14,
        right: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    sheetCategoryText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 1,
    },
    sheetNameRow: {
        paddingHorizontal: 22,
        paddingTop: 18,
        paddingBottom: 16,
    },
    sheetName: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: -0.5,
        textTransform: 'capitalize',
    },
    metricRow: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 22,
        marginBottom: 22,
    },
    metricTile: {
        flex: 1,
        backgroundColor: '#1E1E26',
        borderRadius: 16,
        padding: 14,
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    metricIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    metricValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
        textTransform: 'capitalize',
        textAlign: 'center',
    },
    metricLabel: {
        color: '#444',
        fontSize: 8,
        fontWeight: '800',
        letterSpacing: 1.2,
    },
    detailsWrapper: {
        paddingHorizontal: 22,
    },
    sheetFooter: {
        flexDirection: 'row',
        paddingHorizontal: 22,
        paddingBottom: 34,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        backgroundColor: '#16161A',
    },
    closeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 18,
        borderRadius: 18,
    },
    closeBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
});