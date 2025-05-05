import { useNavigation } from '@react-navigation/native';
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from '../constants';

export default function Welcome() {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "black" }}>
            <Image source={images.welkom} resizeMode='center' />
            <View style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute" }}>
                <Text style={{ fontSize: 30, marginBottom: 20, color: "white", fontWeight: 50 }}>Welcome to Fitness App!</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('App')} // Navigates to your TabNavigator
                    style={{
                        backgroundColor: 'tomato',
                        padding: 15,
                        borderRadius: 10
                    }}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                        Get Started
                    </Text>
                </TouchableOpacity>
            </View>




        </SafeAreaView>
    )
}