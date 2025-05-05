import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
    Image,
    Modal,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    Animated,
    Easing
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "../constants";
import Details from "../screens/Details";

export default function ExerciseCard({ data, image }) {
    const [success, setSuccess] = useState(false);
    const [scaleValue] = useState(new Animated.Value(1));
    const navigation = useNavigation();

    const onPressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleValue }] }]}>
            <TouchableOpacity
                style={styles.cardTouchable}
                onPress={() => setSuccess(true)}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                activeOpacity={0.8}
            >
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: image }}
                        style={styles.exerciseImage}
                        resizeMode="cover"
                    />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.exerciseName}>{data.name}</Text>
                    <Text style={styles.exerciseSets}>{data.sets} sets</Text>
                </View>

                <View style={styles.arrowContainer}>
                    <Image
                        source={icons.arrowRight}
                        style={styles.arrowIcon}
                    />
                </View>
            </TouchableOpacity>

            <Modal
                visible={success}
                animationType="slide"

                transparent={false}
            >
                <View style={styles.modalContainer}>
                    <Details data={data} image={image} />
                    <TouchableOpacity
                        onPress={() => setSuccess(false)}
                        style={styles.doneButton}
                    >
                        <Text style={styles.doneButtonText}>Done</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 12,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTouchable: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    imageContainer: {
        backgroundColor: '#F5F5F7',
        borderRadius: 12,
        padding: 12,
        marginRight: 16,
    },
    exerciseImage: {
        height: 50,
        width: 50,
        borderRadius: 8,
    },
    textContainer: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 4,
    },
    exerciseSets: {
        fontSize: 14,
        color: '#636366',
    },
    arrowContainer: {
        padding: 8,
    },
    arrowIcon: {
        width: 20,
        height: 20,
        tintColor: '#8E8E93',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    doneButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        alignItems: 'center',
    },
    doneButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
});