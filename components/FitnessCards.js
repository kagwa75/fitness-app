import { Image, Text, View, TouchableOpacity } from 'react-native'
import fitness from '../data/fitness'
import fity from "../data/deepSeek"
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const FitnessCards = () => {
  const FitnessData = fitness;
  const RefinedData = fity;
  const navigation = useNavigation();




  return (
    <View style={{ marginTop: 80, marginHorizontal: 20, marginBottom: 20 }}>
      {
        RefinedData.map((item, id) => (
          <TouchableOpacity onPress={() => navigation.navigate("Days", {
            item: FitnessData,
            workouts: item.days,
            image: item.image,
            list: item.category,
            category: item.name.toLowerCase()
          })} style={{ alignItems: 'center', justifyContent: "center", marginTop: 10, marginBottom: 10 }} key={id}>
            <Image style={{ width: "100%", height: 120, borderRadius: 12 }} source={{ uri: item.image }} />
            <Text style={{ position: "absolute", color: "white", fontSize: 16, fontWeight: "bold", left: 20, top: 20 }}>{item.name}</Text>
            <MaterialCommunityIcons name="lightning-bolt" size={30} color="#dfbe04" style={{ position: "absolute", bottom: 15, left: 15 }} />
          </TouchableOpacity>
        ))
      }
    </View>
  )
}

export default FitnessCards