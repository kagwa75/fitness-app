import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState, useContext } from 'react';
import { Image, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Octicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { FitnessItems } from '../Context';
import axios from 'axios';

const FitScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useUser();
  const { exercises } = route.params;
  const [index, setIndex] = useState(0);
  const current = exercises[index];

  const {
    completed,
    setCompleted,
    calories,
    setCalories,
    minutes,
    setMinutes,
    workout,
    setWorkout,
  } = useContext(FitnessItems);

  const [timeLeft, setTimeLeft] = useState(
    current?.type === 'time' ? current.duration : 0
  );

  // Timer logic
  useEffect(() => {
    if (current?.type !== 'time') return;

    const timer = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft((prev) => prev - 1);
      } else {
        handleNext(); // Auto-advance
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, index]);

  const handleNext = () => {
    if (index + 1 < exercises.length) {
      navigation.navigate('Rest');

      setTimeout(() => {
        setCompleted((prev) => [...prev, current]);
        setWorkout((w) => w + 1);
        setMinutes((m) => m + 2.5);
        setCalories((c) => c + 6.3);
        setIndex(index + 1);

        const nextExercise = exercises[index + 1];
        if (nextExercise?.type === 'time') {
          setTimeLeft(nextExercise.duration);
        }
      }, 2000);
    } else {
      finishWorkout();
    }
  };

  const saveWorkout = async (exercise) => {
    if (!user) return;

    try {
      const response = await axios.post("http://192.168.64.194:3000/users/workouts", {
        clerkUserId: user.id,
        exerciseName: exercise.name,
        duration: exercise.type === 'time' ? exercise.duration : null,
        sets: exercise.type === 'reps' ? exercise.sets : null,
        caloriesBurned: exercise.type === 'time'
          ? (exercise.duration / 60) * 8
          : exercise.sets * 2.5,
      });
      console.log("Workout saved:", response.data);
    } catch (error) {
      console.error("Failed to save workout:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      Alert.alert('Error', error.response?.data?.message || 'Failed to save workout');
    }
  };

  const finishWorkout = async () => {
    const allExercises = [...completed, current];

    await Promise.all(allExercises.map((exercise) => saveWorkout(exercise)));


    navigation.navigate('App');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Image source={{ uri: current?.gifUrl }} style={{ width: "auto", height: 400 }} />

      <View style={{ marginTop: 20, alignItems: 'center' }}>
        <Text style={{ fontSize: 30, fontWeight: "bold" }}>
          {current?.name} <Octicons name="question" size={22} color="#6d6868" />
        </Text>

        {current?.type === "time" ? (
          <Text style={{ fontSize: 45, fontWeight: "bold", marginTop: 10 }}>
            {timeLeft}s
          </Text>
        ) : (
          <Text style={{ fontSize: 45, fontWeight: "bold", marginTop: 10 }}>
            x{current?.sets}
          </Text>
        )}
      </View>

      {/* DONE button */}
      {index + 1 >= exercises.length ? (
        <TouchableOpacity
          onPress={() => {
            setCompleted((prev) => [...prev, current]);
            finishWorkout();
          }}
          style={{
            backgroundColor: "#198f51",
            marginLeft: "auto",
            marginRight: "auto",
            marginTop: 50,
            borderRadius: 30,
            padding: 10,
            width: "90%",
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 20, textAlign: "center" }}>
            <Ionicons name="checkmark-circle" size={24} color="white" /> DONE
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={handleNext}
          style={{
            backgroundColor: "#198f51",
            marginLeft: "auto",
            marginRight: "auto",
            marginTop: 50,
            borderRadius: 30,
            padding: 10,
            width: "90%",
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 20, textAlign: "center" }}>
            <Ionicons name="checkmark-circle" size={24} color="white" /> DONE
          </Text>
        </TouchableOpacity>
      )}

      {/* PREV and SKIP Buttons */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        marginTop: 25
      }}>
        <TouchableOpacity
          disabled={index === 0}
          onPress={() => {
            navigation.navigate("Rest");
            setTimeout(() => {
              setIndex(index - 1);
            }, 2000);
          }}
          style={{ borderRadius: 30, padding: 10, width: "42%" }}
        >
          <Text style={{ color: "#6d6868", fontWeight: "bold", fontSize: 18, textAlign: "center" }}>
            <Ionicons name="play-skip-back" size={22} color="#6d6868" /> PREV
          </Text>
        </TouchableOpacity>

        {index + 1 >= exercises.length ? (
          <TouchableOpacity
            onPress={() => navigation.navigate("App")}
            style={{ borderRadius: 30, padding: 10, width: "42%" }}
          >
            <Text style={{ color: "#3f3d3d", fontWeight: "bold", fontSize: 18, textAlign: "center" }}>
              <Ionicons name="play-skip-forward" size={22} color="#3f3d3d" /> SKIP
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Rest");
              setTimeout(() => {
                setIndex(index + 1);
              }, 2000);
            }}
            style={{ borderRadius: 30, padding: 10, width: "42%" }}
          >
            <Text style={{ color: "#3f3d3d", fontWeight: "bold", fontSize: 18, textAlign: "center" }}>
              <Ionicons name="play-skip-forward" size={22} color="#3f3d3d" /> SKIP
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default FitScreen;
