import { Image, Text, View, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';

const ApiExercises = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const response = await fetch(
                    'https://exercisedb.p.rapidapi.com/exercises?limit=30&offset=0',
                    {
                        method: 'GET',
                        headers: {
                            'x-rapidapi-key': '4b35b2e3camshc1fb6629a92c312p1f22b2jsnf8899d2596dd', // Replace with your key
                            'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
                        },
                    }
                );

                const data = await response.json();
                console.log("response :", data);
                setExercises(data);
            } catch (error) {
                console.error("Error fetching exercises:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExercises();
    }, []);

    if (loading) {
        return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
    }

    return (
        <ScrollView style={{ marginTop: 80, marginHorizontal: 20, marginBottom: 20 }}>
            {exercises.map((item, id) => (
                <TouchableOpacity
                    key={id}
                    onPress={() =>
                        navigation.navigate("Days", {
                            item: item, // Pass the exercise data
                            workouts: item.bodyPart, // Example: Could be "chest", "legs", etc.
                            image: item.gifUrl, // GIF from API
                            category: item.name.toLowerCase(),
                        })
                    }
                    style={{ alignItems: 'center', justifyContent: "center", marginTop: 10, marginBottom: 10 }}
                >
                    <Image
                        style={{ width: "100%", height: 120, borderRadius: 12 }}
                        source={{ uri: item.gifUrl }} // Use GIF from API
                    />
                    <Text style={{ position: "absolute", color: "red", fontSize: 16, fontWeight: "bold", left: 20, top: 20 }}>
                        {item.name}
                    </Text>
                    <MaterialCommunityIcons
                        name="lightning-bolt"
                        size={30}
                        color="#dfbe04"
                        style={{ position: "absolute", bottom: 15, left: 15 }}
                    />
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

export default ApiExercises;