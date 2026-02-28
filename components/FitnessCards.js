import { Image, Text, View, TouchableOpacity, Animated, Dimensions, StyleSheet } from 'react-native';
import fitness from '../data/fitness';
import fity from '../data/deepSeek';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useEffect, useState } from 'react';

const { width } = Dimensions.get('window');

// Accent colors per card for variety
const ACCENTS = ['#FF4D2E', '#00E5BE', '#6C63FF', '#FFB800', '#FF4D8C', '#00C2FF'];

const DIFFICULTY_MAP = {
    beginner: { label: 'BEGINNER', color: '#00E5BE' },
    intermediate: { label: 'INTERMEDIATE', color: '#FFB800' },
    advanced: { label: 'ADVANCED', color: '#FF4D2E' },
};

// Animated card wrapper
const AnimatedCard = ({ children, delay = 0, style }) => {
    const translateY = useRef(new Animated.Value(40)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    tension: 80,
                    friction: 10,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    return (
        <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
            {children}
        </Animated.View>
    );
};

// Featured (large) card — first item
const FeaturedCard = ({ item, index, accent, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [imageLoadFailed, setImageLoadFailed] = useState(false);
    const imageUri = typeof item?.image === 'string' ? item.image.trim() : '';
    const shouldShowImage = !!imageUri && !imageLoadFailed;

    useEffect(() => {
        setImageLoadFailed(false);
    }, [imageUri]);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.97,
            useNativeDriver: true,
            tension: 300,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 300,
        }).start();
    };

    const difficulty = DIFFICULTY_MAP[item.difficulty?.toLowerCase()] || DIFFICULTY_MAP.intermediate;

    return (
        <AnimatedCard delay={index * 80} style={{ marginBottom: 14 }}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                <Animated.View style={[styles.featuredCard, { transform: [{ scale: scaleAnim }] }]}>
                    <View style={styles.imageFallbackOverlay}>
                        <MaterialCommunityIcons name="image-off-outline" size={24} color="#6D6D84" />
                        <Text style={styles.imageFallbackText}>Image unavailable</Text>
                    </View>
                    {shouldShowImage ? (
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.featuredImage}
                            resizeMode="cover"
                            onError={() => setImageLoadFailed(true)}
                        />
                    ) : null}

                    {/* Gradient overlays */}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.85)']}
                        style={styles.featuredGradient}
                    />
                    <LinearGradient
                        colors={[accent + '40', 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFillObject}
                    />

                    {/* Top badges */}
                    <View style={styles.featuredTopRow}>
                        <View style={[styles.accentBadge, { backgroundColor: accent }]}>
                            <MaterialCommunityIcons name="lightning-bolt" size={12} color="#fff" />
                            <Text style={styles.accentBadgeText}>FEATURED</Text>
                        </View>
                        <View style={[styles.difficultyBadge, { borderColor: difficulty.color + '60' }]}>
                            <View style={[styles.difficultyDot, { backgroundColor: difficulty.color }]} />
                            <Text style={[styles.difficultyText, { color: difficulty.color }]}>
                                {difficulty.label}
                            </Text>
                        </View>
                    </View>

                    {/* Bottom content */}
                    <View style={styles.featuredBottom}>
                        <Text style={styles.featuredName}>{item.name}</Text>
                        <View style={styles.featuredMeta}>
                            <View style={styles.metaChip}>
                                <Feather name="calendar" size={11} color="#aaa" />
                                <Text style={styles.metaText}>{item.days?.length ?? 0} days</Text>
                            </View>
                            <View style={styles.metaChip}>
                                <Feather name="zap" size={11} color="#aaa" />
                                <Text style={styles.metaText}>{item.category}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Start arrow */}
                    <View style={[styles.startBtn, { backgroundColor: accent }]}>
                        <Feather name="arrow-right" size={16} color="#fff" />
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </AnimatedCard>
    );
};

// Regular (compact) card
const CompactCard = ({ item, index, accent, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [imageLoadFailed, setImageLoadFailed] = useState(false);
    const imageUri = typeof item?.image === 'string' ? item.image.trim() : '';
    const shouldShowImage = !!imageUri && !imageLoadFailed;

    useEffect(() => {
        setImageLoadFailed(false);
    }, [imageUri]);

    const handlePressIn = () =>
        Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, tension: 300 }).start();
    const handlePressOut = () =>
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300 }).start();

    return (
        <AnimatedCard delay={index * 80} style={{ marginBottom: 12 }}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                <Animated.View style={[styles.compactCard, { transform: [{ scale: scaleAnim }] }]}>
                    <View style={styles.imageFallbackOverlay}>
                        <MaterialCommunityIcons name="image-off-outline" size={18} color="#6D6D84" />
                    </View>
                    {shouldShowImage ? (
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.compactImage}
                            resizeMode="cover"
                            onError={() => setImageLoadFailed(true)}
                        />
                    ) : null}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        style={styles.compactGradient}
                    />

                    {/* Left accent strip */}
                    <View style={[styles.cardStrip, { backgroundColor: accent }]} />

                    <View style={styles.compactContent}>
                        <View>
                            <Text style={styles.compactName}>{item.name}</Text>
                            <Text style={styles.compactCategory}>{item.category?.toUpperCase()}</Text>
                        </View>
                        <View style={styles.compactRight}>
                            <Text style={styles.compactDays}>{item.days?.length ?? 0}</Text>
                            <Text style={styles.compactDaysLabel}>DAYS</Text>
                        </View>
                    </View>

                    <View style={[styles.compactStartBtn, { backgroundColor: accent + '22', borderColor: accent + '50' }]}>
                        <Feather name="chevron-right" size={16} color={accent} />
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </AnimatedCard>
    );
};

const FitnessCards = () => {
    const FitnessData = fitness;
    const RefinedData = fity;
    const navigation = useNavigation();

    const handleNavigate = (item) => {
        navigation.navigate('Days', {
            item: FitnessData,
            Days: item.days,
            image: item.image,
            list: item.category,
            category: item.name.toLowerCase(),
        });
    };

    return (
        <View style={styles.container}>
            {RefinedData.map((item, index) => {
                const accent = ACCENTS[index % ACCENTS.length];
                const isFeatured = index === 0;

                return isFeatured ? (
                    <FeaturedCard
                        key={index}
                        item={item}
                        index={index}
                        accent={accent}
                        onPress={() => handleNavigate(item)}
                    />
                ) : (
                    <CompactCard
                        key={index}
                        item={item}
                        index={index}
                        accent={accent}
                        onPress={() => handleNavigate(item)}
                    />
                );
            })}
        </View>
    );
};

export default FitnessCards;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 4,
    },

    // Featured card
    featuredCard: {
        borderRadius: 24,
        overflow: 'hidden',
        height: 240,
        backgroundColor: '#1A1A22',
    },
    featuredImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    imageFallbackOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1C1C26',
        gap: 6,
    },
    imageFallbackText: {
        color: '#7A7A93',
        fontSize: 11,
        fontWeight: '600',
    },
    featuredGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    featuredTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },
    accentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 4,
    },
    accentBadgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 1,
    },
    difficultyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        gap: 5,
    },
    difficultyDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    difficultyText: {
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 1,
    },
    featuredBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 18,
    },
    featuredName: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    featuredMeta: {
        flexDirection: 'row',
        gap: 12,
    },
    metaChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        color: '#bbb',
        fontSize: 12,
        fontWeight: '500',
    },
    startBtn: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Compact card
    compactCard: {
        height: 90,
        borderRadius: 18,
        overflow: 'hidden',
        backgroundColor: '#1A1A22',
        flexDirection: 'row',
        alignItems: 'center',
    },
    compactImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    compactGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    cardStrip: {
        width: 4,
        height: '60%',
        borderRadius: 4,
        marginLeft: 14,
        marginRight: 12,
    },
    compactContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: 50,
    },
    compactName: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    compactCategory: {
        color: '#888',
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginTop: 2,
    },
    compactRight: {
        alignItems: 'center',
    },
    compactDays: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '900',
    },
    compactDaysLabel: {
        color: '#666',
        fontSize: 8,
        fontWeight: '700',
        letterSpacing: 1,
    },
    compactStartBtn: {
        position: 'absolute',
        right: 14,
        width: 32,
        height: 32,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
