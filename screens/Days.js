import { useNavigation, useRoute } from "@react-navigation/native";
import { Image, ScrollView, Text, TouchableOpacity, View, Animated, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { Feather } from "@expo/vector-icons";

const Days = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [apiExercises, setApiExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { list, workouts, image } = route.params;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                setLoading(true);
                setError(null);

                // Calculate total exercises needed across all workout days
                const totalExercisesNeeded = workouts.reduce((total, workoutDay) => {
                    return total + (workoutDay.exercises?.length || 0);
                }, 0);

                // Ensure we fetch at least 10 exercises as a fallback
                const limit = Math.max(totalExercisesNeeded, 10);

                const response = await fetch(
                    `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${list.toLowerCase()}?limit=${limit}`,
                    {
                        headers: {
                            'x-rapidapi-key': '4b35b2e3camshc1fb6629a92c312p1f22b2jsnf8899d2596dd',
                            'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
                        },
                    }
                );

                if (!response.ok) throw new Error("Failed to fetch exercises");
                const data = await response.json();
                setApiExercises(data);

            } catch (err) {
                console.error("API Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true
                }).start();
            }
        };

        fetchExercises();
    }, [list, workouts]);

    const getExercisesForWorkoutDay = (workoutDay) => {
        // If API call failed or no exercises, fall back to local exercises
        if (apiExercises.length === 0 || error) {
            return workoutDay.exercises || [];
        }

        // Return the first N exercises where N is the workout day's exercise count
        return apiExercises.slice(0, workoutDay.exercises?.length || 0);
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
                <Text style={{ color: 'red', marginBottom: 20, textAlign: 'center' }}>
                    Couldn't load exercises. Using local exercises instead.
                </Text>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ padding: 15, backgroundColor: '#6366F1', borderRadius: 10 }}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#F8F9FA" }}>
            {/* Header Image with Gradient Overlay */}
            <View style={{ position: "relative" }}>
                <Image
                    source={{ uri: image }}
                    style={{ width: "100%", height: 250 }}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={["rgba(0,0,0,0.3)", "transparent"]}
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: 0,
                        height: "40%",
                    }}
                />

                {/* Back Button */}
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{
                        position: "absolute",
                        top: 50,
                        left: 20,
                        backgroundColor: "rgba(255,255,255,0.7)",
                        borderRadius: 20,
                        padding: 8,
                        zIndex: 10,
                    }}
                >
                    <Feather name="chevron-left" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <Animated.ScrollView
                style={{
                    flex: 1,
                    marginTop: -30,
                    opacity: fadeAnim
                }}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ paddingHorizontal: 20 }}>
                    <Text style={{
                        fontSize: 28,
                        fontWeight: "800",
                        color: "#333",
                        marginBottom: 5,
                        marginTop: 10
                    }}>
                        {list}
                    </Text>

                    <Text style={{
                        fontSize: 16,
                        color: "#666",
                        marginBottom: 25
                    }}>
                        {workouts.length} workout days
                    </Text>

                    {workouts.map((workoutDay, index) => (
                        <Animated.View
                            key={index}
                            style={{
                                opacity: fadeAnim,
                                transform: [{
                                    translateY: fadeAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [50, 0]
                                    })
                                }]
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => navigation.navigate("Workout", {
                                    exercises: getExercisesForWorkoutDay(workoutDay),
                                    image: image,
                                })}
                                activeOpacity={0.8}
                                style={{
                                    backgroundColor: "white",
                                    borderRadius: 20,
                                    padding: 20,
                                    marginBottom: 15,
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 6,
                                    elevation: 3,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between"
                                }}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={{
                                        fontSize: 18,
                                        fontWeight: "700",
                                        color: "#333",
                                        marginBottom: 5
                                    }}>
                                        {workoutDay.name}
                                    </Text>

                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <Feather name="list" size={16} color="#888" />
                                        <Text style={{
                                            fontSize: 14,
                                            color: "#888",
                                            marginLeft: 5
                                        }}>
                                            {getExercisesForWorkoutDay(workoutDay).length} exercises
                                        </Text>
                                    </View>
                                </View>

                                <View style={{
                                    backgroundColor: "#6366F1",
                                    borderRadius: 12,
                                    paddingVertical: 8,
                                    paddingHorizontal: 15
                                }}>
                                    <Text style={{
                                        color: "white",
                                        fontWeight: "600",
                                        fontSize: 14
                                    }}>
                                        Start
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>
            </Animated.ScrollView>
        </View>
    );
};

export default Days;