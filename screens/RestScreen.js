import { useNavigation } from '@react-navigation/native';
import { useEffect, useState, useRef } from 'react';
import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const RestScreen = () => {
  const navigation = useNavigation();
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef(null);
  const timer = 0;

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          navigation.goBack();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [navigation]);

  const addTime = () => {
    setTimeLeft(prevTime => prevTime + 10);
  };

  const skipRest = () => {
    clearTimeout(timer);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={{
          uri: "https://img.freepik.com/free-photo/full-length-athlete-sipping-water-from-fitness-bottle-exhausted-after-workout_1098-18878.jpg",
        }}
        style={styles.image}
      />

      <Text style={styles.title}>TAKE A BREAK!</Text>
      <Text style={styles.timer}>
        <MaterialIcons name="timer" size={26} color="black" /> {timeLeft}
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={addTime} style={styles.button}>
          <Text style={styles.buttonText}>Add +10</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={skipRest} style={styles.button}>
          <Text style={styles.buttonText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 40
  },
  image: {
    width: "100%",
    height: 420,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    marginTop: 30,
    textAlign: "center",
  },
  timer: {
    fontSize: 35,
    fontWeight: "900",
    marginTop: 50,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 40,
    padding: 30,
    justifyContent: "center",
    shadowColor: "#000",
    elevation: 3,
    backgroundColor: "beige",
    borderRadius: 20,
    marginTop: 20,
    marginHorizontal: 20,
  },
  button: {
    padding: 10,
    backgroundColor: "blue",
    margin: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 40,
    minWidth: 100,
  },
  buttonText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "bold",
    color: "white",
  },
});

export default RestScreen;