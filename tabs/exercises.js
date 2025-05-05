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
    Switch
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import ExerciseCard from "../components/ExerciseCard";
import Workouts from "../data/exercises";

export default function Exercises() {
    // State management
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [darkMode, setDarkMode] = useState(false);
    const [filteredWorkouts, setFilteredWorkouts] = useState(Workouts);
    const scrollY = useRef(new Animated.Value(0)).current;

    // Categories extracted from workouts
    const categories = ['All', ...new Set(Workouts.map(item => item.category))];

    // Filter logic
    useEffect(() => {
        let results = Workouts;

        // Apply search filter
        if (searchQuery) {
            results = results.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply category filter
        if (selectedCategory !== 'All') {
            results = results.filter(item => item.category === selectedCategory);
        }

        setFilteredWorkouts(results);
    }, [searchQuery, selectedCategory]);

    // Refresh control
    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    // Animation configurations
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 80],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const searchTranslateY = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, -50],
        extrapolate: 'clamp',
    });

    // Theme styles
    const themeStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: darkMode ? '#121212' : '#F5F5F7',
        },
        headerText: {
            color: darkMode ? '#FFFFFF' : '#1C1C1E',
        },
        subText: {
            color: darkMode ? '#AEAEB2' : '#636366',
        },
        searchContainer: {
            backgroundColor: darkMode ? '#1E1E1E' : '#FFFFFF',
        },
        searchInput: {
            color: darkMode ? '#FFFFFF' : '#000000',
        },
        categoryButton: {
            backgroundColor: darkMode ? '#2C2C2E' : '#E5E5EA',
        },
        categoryText: {
            color: darkMode ? '#FFFFFF' : '#000000',
        },
        activeCategory: {
            backgroundColor: '#007AFF',
        },
        activeCategoryText: {
            color: '#FFFFFF',
        },
    });

    return (
        <SafeAreaView style={themeStyles.container}>
            {/* Search Bar with Animation */}
            <Animated.View style={[
                styles.searchContainer,
                themeStyles.searchContainer,
                { transform: [{ translateY: searchTranslateY }] }
            ]}>
                <Ionicons
                    name="search"
                    size={20}
                    color={darkMode ? '#AEAEB2' : '#8E8E93'}
                    style={styles.searchIcon}
                />
                <TextInput
                    style={[styles.searchInput, themeStyles.searchInput]}
                    placeholder="Search workouts..."
                    placeholderTextColor={darkMode ? '#636366' : '#8E8E93'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <View style={styles.themeToggle}>
                    <Ionicons
                        name={darkMode ? 'moon' : 'sunny'}
                        size={20}
                        color={darkMode ? '#FFD60A' : '#FF9F0A'}
                    />
                    <Switch
                        value={darkMode}
                        onValueChange={setDarkMode}
                        trackColor={{ false: '#E5E5EA', true: '#2C2C2E' }}
                        thumbColor={darkMode ? '#007AFF' : '#FFFFFF'}
                    />
                </View>
            </Animated.View>

            {/* Category Filter Chips */}
            <View style={styles.categoryContainer}>
                <FlatList
                    horizontal
                    data={categories}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.categoryButton,
                                themeStyles.categoryButton,
                                selectedCategory === item && styles.activeCategory,
                                selectedCategory === item && themeStyles.activeCategory,
                            ]}
                            onPress={() => setSelectedCategory(item)}
                        >
                            <Text style={[
                                styles.categoryText,
                                themeStyles.categoryText,
                                selectedCategory === item && styles.activeCategoryText,
                            ]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryList}
                />
            </View>

            {/* Main Workout List */}
            <Animated.FlatList
                data={filteredWorkouts}
                renderItem={({ item, index }) => (
                    <ExerciseCard
                        data={item}
                        image={item.image}
                        darkMode={darkMode}
                        style={{
                            opacity: scrollY.interpolate({
                                inputRange: [0, 100, 200],
                                outputRange: [1, 1, 1],
                                extrapolate: 'clamp'
                            }),
                            transform: [{
                                translateY: scrollY.interpolate({
                                    inputRange: [-1, 0, 100 * index, 100 * (index + 2)],
                                    outputRange: [0, 0, 0, -50],
                                })
                            }]
                        }}
                    />
                )}
                keyExtractor={(item, index) => index.toString()}
                ListHeaderComponent={
                    <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
                        <Text style={[styles.title, themeStyles.headerText]}>Discover Workouts</Text>
                        <Text style={[styles.subtitle, themeStyles.subText]}>
                            {filteredWorkouts.length} {filteredWorkouts.length === 1 ? 'workout' : 'workouts'} found
                        </Text>
                    </Animated.View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="sad-outline" size={48} color={darkMode ? '#636366' : '#8E8E93'} />
                        <Text style={[styles.emptyText, themeStyles.subText]}>No workouts found</Text>
                    </View>
                }
                ListFooterComponent={<View style={styles.footer} />}
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
                        tintColor={darkMode ? '#636366' : '#8E8E93'}
                        colors={['#007AFF']}
                    />
                }
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={[0]}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // Search Styles
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        margin: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 4,
    },
    themeToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    // Category Filter Styles
    categoryContainer: {
        paddingLeft: 16,
    },
    categoryList: {
        paddingRight: 16,
        gap: 8,
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        marginRight: 8,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
    },
    activeCategory: {
        backgroundColor: '#007AFF',
    },
    activeCategoryText: {
        color: '#FFFFFF',
    },

    // Header Styles
    header: {
        paddingHorizontal: 24,
        paddingBottom: 16,
        paddingTop: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
    },

    // List Styles
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    footer: {
        height: 80,
    },

    // Empty State
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        marginTop: 16,
    },
});