import { useNavigation, useRoute } from '@react-navigation/native'
import { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons';
import { Octicons } from '@expo/vector-icons';
import { useContext } from 'react';
import { FitnessItems } from '../Context';

const FitScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { exercises } = route.params;
  const [index, setIndex] = useState(0);
  const current = exercises[index];
  const { completed, setCompleted, calories, setCalories, minutes, setMinutes, workout, setWorkout } = useContext(FitnessItems);

  // Timer only for time-based exercises
  const [timeLeft, setTimeLeft] = useState(
    current?.type === "time" ? current.duration : 0
  );

  // Timer logic (only for time-based)
  useEffect(() => {
    if (current?.type !== "time") return;

    const timer = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft(timeLeft - 1);
      } else {
        handleNext(); // Auto-advance when timer ends
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, index]);

  const handleNext = () => {
    if (index + 1 < exercises.length) {
      navigation.navigate("Rest");
      setTimeout(() => {
        setIndex(index + 1);
        // Reset timer if next exercise is time-based
        const nextExercise = exercises[index + 1];
        if (nextExercise?.type === "time") {
          setTimeLeft(nextExercise.duration);
        }
      }, 2000);
    } else {
      finishWorkout();
    }
  };

  const finishWorkout = () => {
    setCompleted([...completed, current?.name]);
    setWorkout(workout + 1);
    setMinutes(minutes + (current?.type === "time" ? current.sets / 60 : 2.5)); // Adjust minutes for time-based
    setCalories(calories + 6.3);
    navigation.navigate("Home");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Image source={{ uri: current?.gifUrl }} style={{ width: "auto", height: 400 }} />

      <View style={{ marginTop: 20, alignItems: 'center' }}>
        <Text style={{ fontSize: 30, fontWeight: "bold" }}>
          {current?.name} <Octicons name="question" size={22} color="#6d6868" />
        </Text>

        {/* Dynamic Display: Timer or Reps */}
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

      {/* Done Button  */}
      {
        index + 1 >= exercises.length ? (
          <TouchableOpacity onPress={() => {
            navigation.navigate("App");
            setCompleted([...completed, current?.name]);
            setWorkout(workout + 1);
            setMinutes(minutes + 2.5);
            setCalories(calories + 6.3);
            setTimeout(() => {
              setIndex(index + 1);
            }, 2000);
          }} style={{ backgroundColor: "#198f51", marginLeft: "auto", marginRight: "auto", marginTop: 50, borderRadius: 30, padding: 10, width: "90%", }}>
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 20, textAlign: "center" }}><Ionicons name="checkmark-circle" size={24} color="white" /> DONE</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => {
            navigation.navigate("Rest");
            setCompleted([...completed, current?.name]);
            setWorkout(workout + 1);
            setMinutes(minutes + 2.5);
            setCalories(calories + 6.3);
            setTimeout(() => {
              setIndex(index + 1);
            }, 2000);
          }} style={{ backgroundColor: "#198f51", marginLeft: "auto", marginRight: "auto", marginTop: 50, borderRadius: 30, padding: 10, width: "90%", }}>
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 20, textAlign: "center" }}><Ionicons name="checkmark-circle" size={24} color="white" /> DONE</Text>
          </TouchableOpacity>
        )
      }

      {/* Previous Button  */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 25 }}>
        <TouchableOpacity disabled={index === 0} onPress={() => {
          navigation.navigate("Rest"); setTimeout(() => {
            setIndex(index - 1)
          }, 2000)
        }} style={{ borderRadius: 30, padding: 10, width: "42%" }}>
          <Text style={{ color: "#6d6868", fontWeight: "bold", fontSize: 18, textAlign: "center" }}><Ionicons name="play-skip-back" size={22} color="#6d6868" /> PREV</Text>
        </TouchableOpacity>

        {/* Skip Button  */}
        {
          index + 1 >= exercises.length ? (
            <TouchableOpacity onPress={() => {
              navigation.navigate("App");
            }} style={{ borderRadius: 30, padding: 10, width: "42%" }}>
              <Text style={{ color: "#3f3d3d", fontWeight: "bold", fontSize: 18, textAlign: "center", }}><Ionicons name="play-skip-forward" size={22} color="#3f3d3d" /> SKIP</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => {
              navigation.navigate("Rest");

              setTimeout(() => {
                setIndex(index + 1);
              }, 2000);
            }} style={{ borderRadius: 30, padding: 10, width: "42%" }}>
              <Text style={{ color: "#3f3d3d", fontWeight: "bold", fontSize: 18, textAlign: "center", }}><Ionicons name="play-skip-forward" size={22} color="#3f3d3d" /> SKIP</Text>
            </TouchableOpacity>
          )
        }
      </View>
    </SafeAreaView>
  )
}

export default FitScreen