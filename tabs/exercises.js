import { useState, useEffect, useRef } from 'react';
import {
    FlatList,
    Text,
    View,
    StyleSheet,
    Animated,
    RefreshControl,
    TextInput,
    TouchableOpacity,
    StatusBar,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ExerciseCard from '../components/ExerciseCard';
import Workouts from '../data/exercises';

const { width } = Dimensions.get('window');

const ACCENT_MAP = {
    All: { color: '#FF4D2E', icon: 'lightning-bolt' },
    Chest: { color: '#FF4D8C', icon: 'heart-pulse' },
    Back: { color: '#00E5BE', icon: 'human-handsdown' },
    Legs: { color: '#6C63FF', icon: 'run' },
    Arms: { color: '#FFB800', icon: 'arm-flex' },
    Shoulders: { color: '#00C2FF', icon: 'human-queue' },
    Core: { color: '#FF6B35', icon: 'circle-outline' },
    Cardio: { color: '#FF4D2E', icon: 'heart' },
};

const getCategoryAccent = (cat) => ACCENT_MAP[cat] || { color: '#FF4D2E', icon: 'dumbbell' };

// ── Category chip ──────────────────────────────────────────────
const CategoryChip = ({ label, isActive, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const { color } = getCategoryAccent(label);

    const handlePressIn = () =>
        Animated.spring(scaleAnim, { toValue: 0.93, useNativeDriver: true, tension: 300 }).start();
    const handlePressOut = () =>
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300 }).start();

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
        >
            <Animated.View
                style={[
                    styles.chip,
                    isActive && { backgroundColor: color, borderColor: color },
                    !isActive && { borderColor: 'rgba(255,255,255,0.08)' },
                    { transform: [{ scale: scaleAnim }] },
                ]}
            >
                <MaterialCommunityIcons
                    name={getCategoryAccent(label).icon}
                    size={12}
                    color={isActive ? '#fff' : '#555'}
                />
                <Text style={[styles.chipText, isActive && { color: '#fff' }]}>
                    {label}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

// ── Stat badge (header) ────────────────────────────────────────
const StatBadge = ({ count, total }) => (
    <View style={styles.statBadge}>
        <Text style={styles.statBadgeCount}>{count}</Text>
        <Text style={styles.statBadgeSlash}>/</Text>
        <Text style={styles.statBadgeTotal}>{total}</Text>
        <Text style={styles.statBadgeLabel}> shown</Text>
    </View>
);

// ── Empty state ────────────────────────────────────────────────
const EmptyState = ({ query }) => {
    const pulseAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.05, duration: 900, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 0.9, duration: 900, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.emptyState}>
            <Animated.View style={[styles.emptyIconBg, { transform: [{ scale: pulseAnim }] }]}>
                <Feather name="search" size={28} color="#FF4D2E" />
            </Animated.View>
            <Text style={styles.emptyTitle}>No results</Text>
            <Text style={styles.emptySubtext}>
                {query
                    ? `Nothing matched "${query}"`
                    : 'No exercises in this category yet'}
            </Text>
        </View>
    );
};

// ── Main screen ────────────────────────────────────────────────
export default function Exercises() {
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [filteredWorkouts, setFilteredWorkouts] = useState(Workouts);
    const [searchFocused, setSearchFocused] = useState(false);

    const scrollY = useRef(new Animated.Value(0)).current;
    const searchScale = useRef(new Animated.Value(1)).current;
    const headerY = useRef(new Animated.Value(0)).current;
    const headerOpacity = useRef(new Animated.Value(1)).current;

    const categories = ['All', ...new Set(Workouts.map((item) => item.category))];

    useEffect(() => {
        let results = Workouts;
        if (searchQuery) {
            results = results.filter(
                (item) =>
                    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (selectedCategory !== 'All') {
            results = results.filter((item) => item.category === selectedCategory);
        }
        setFilteredWorkouts(results);
    }, [searchQuery, selectedCategory]);

    // Collapse header on scroll
    const headerTranslateY = scrollY.interpolate({
        inputRange: [0, 70],
        outputRange: [0, -70],
        extrapolate: 'clamp',
    });
    const headerFade = scrollY.interpolate({
        inputRange: [0, 60],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    const handleSearchFocus = () => {
        setSearchFocused(true);
        Animated.spring(searchScale, { toValue: 1.02, useNativeDriver: true, tension: 200 }).start();
    };
    const handleSearchBlur = () => {
        setSearchFocused(false);
        Animated.spring(searchScale, { toValue: 1, useNativeDriver: true, tension: 200 }).start();
    };

    const activeAccent = getCategoryAccent(selectedCategory).color;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Fixed dark header background */}
            <LinearGradient
                colors={['#0D0D0F', '#131318']}
                style={styles.headerBg}
            />

            <SafeAreaView style={{ flex: 1 }}>
                {/* ── Page title (collapses on scroll) ── */}
                <Animated.View
                    style={[
                        styles.pageTitleRow,
                        {
                            opacity: headerFade,
                            transform: [{ translateY: headerTranslateY }],
                        },
                    ]}
                >
                    <View>
                        <View style={styles.titleBadge}>
                            <MaterialCommunityIcons name="lightning-bolt" size={11} color="#FF4D2E" />
                            <Text style={styles.titleBadgeText}>LIBRARY</Text>
                        </View>
                        <Text style={styles.pageTitle}>Exercises</Text>
                    </View>
                    <StatBadge count={filteredWorkouts.length} total={Workouts.length} />
                </Animated.View>

                {/* ── Search bar ── */}
                <Animated.View style={[styles.searchWrapper, { transform: [{ scale: searchScale }] }]}>
                    <View
                        style={[
                            styles.searchBar,
                            searchFocused && { borderColor: activeAccent + '60' },
                        ]}
                    >
                        <Feather name="search" size={16} color={searchFocused ? activeAccent : '#444'} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search exercises..."
                            placeholderTextColor="#3A3A4A"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onFocus={handleSearchFocus}
                            onBlur={handleSearchBlur}
                            returnKeyType="search"
                            clearButtonMode="while-editing"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <View style={styles.clearBtn}>
                                    <Feather name="x" size={11} color="#888" />
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>

                {/* ── Category chips ── */}
                <FlatList
                    horizontal
                    data={categories}
                    keyExtractor={(item) => item}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipList}
                    style={styles.chipRow}
                    renderItem={({ item }) => (
                        <CategoryChip
                            label={item}
                            isActive={selectedCategory === item}
                            onPress={() => setSelectedCategory(item)}
                        />
                    )}
                />

                {/* ── Active filter label ── */}
                {selectedCategory !== 'All' && (
                    <View style={styles.activeFilterRow}>
                        <View style={[styles.activeFilterDot, { backgroundColor: activeAccent }]} />
                        <Text style={[styles.activeFilterText, { color: activeAccent }]}>
                            {selectedCategory.toUpperCase()}
                        </Text>
                        <TouchableOpacity
                            onPress={() => setSelectedCategory('All')}
                            style={styles.clearFilterBtn}
                        >
                            <Feather name="x" size={12} color="#555" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* ── Exercise list ── */}
                <Animated.FlatList
                    data={filteredWorkouts}
                    keyExtractor={(_, index) => index.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    scrollEventThrottle={16}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: true }
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#FF4D2E"
                            colors={['#FF4D2E']}
                        />
                    }
                    ListEmptyComponent={<EmptyState query={searchQuery} />}
                    ListFooterComponent={<View style={{ height: 100 }} />}
                    renderItem={({ item, index }) => {
                        const itemAnim = new Animated.Value(0);
                        Animated.timing(itemAnim, {
                            toValue: 1,
                            duration: 400,
                            delay: index * 50,
                            useNativeDriver: true,
                        }).start();

                        return (
                            <Animated.View
                                style={{
                                    opacity: itemAnim,
                                    transform: [
                                        {
                                            translateY: itemAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [20, 0],
                                            }),
                                        },
                                    ],
                                }}
                            >
                                <ExerciseCard
                                    data={item}
                                    image={item.image}
                                    accentColor={getCategoryAccent(item.category).color}
                                />
                            </Animated.View>
                        );
                    }}
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0F',
    },
    headerBg: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 180,
        zIndex: 0,
    },

    // Page title
    pageTitleRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: 22,
        paddingTop: 8,
        paddingBottom: 14,
    },
    titleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 4,
    },
    titleBadgeText: {
        color: '#FF4D2E',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    pageTitle: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -0.8,
    },

    // Stat badge
    statBadge: {
        flexDirection: 'row',
        alignItems: 'baseline',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    statBadgeCount: {
        color: '#FF4D2E',
        fontSize: 16,
        fontWeight: '900',
    },
    statBadgeSlash: {
        color: '#333',
        fontSize: 13,
        marginHorizontal: 1,
    },
    statBadgeTotal: {
        color: '#444',
        fontSize: 13,
        fontWeight: '700',
    },
    statBadgeLabel: {
        color: '#444',
        fontSize: 11,
        fontWeight: '500',
    },

    // Search
    searchWrapper: {
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#16161A',
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 13,
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
        paddingVertical: 0,
    },
    clearBtn: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#2A2A32',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Category chips
    chipRow: {
        minHeight: 46,
        marginBottom: 4,
    },
    chipList: {
        paddingHorizontal: 20,
        gap: 8,
        alignItems: 'center',
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 13,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#16161A',
        borderWidth: 1,
    },
    chipText: {
        color: '#555',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    // Active filter row
    activeFilterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 22,
        paddingVertical: 10,
    },
    activeFilterDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    activeFilterText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
        flex: 1,
    },
    clearFilterBtn: {
        width: 22,
        height: 22,
        borderRadius: 8,
        backgroundColor: '#1E1E26',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // List
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingTop: 80,
        gap: 12,
    },
    emptyIconBg: {
        width: 72,
        height: 72,
        borderRadius: 22,
        backgroundColor: 'rgba(255,77,46,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,77,46,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    emptyTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '800',
    },
    emptySubtext: {
        color: '#444',
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 20,
    },
});