import { useNavigation, useRoute } from "@react-navigation/native"
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "./constants";
import { useContext, useEffect, useState } from "react";

const Days = () => {

    const navigate = useNavigation();

    /*const data = [
        {
            id: "1",
            image: "https://i.pinimg.com/originals/ff/cf/40/ffcf40474f0758dfedebc823f5532aa1.gif",
            name: "DECLINE PUSH-UPS",
            exercises: [
                {
                    id: "10",
                    image:
                        "https://sworkit.com/wp-content/uploads/2020/06/sworkit-jumping-jack.gif",
                    name: "JUMPING JACKS",
                    sets: 12,
                },
                {
                    id: "11",
                    image: "https://media.self.com/photos/583c641ca8746f6e65a60c7e/master/w_1600%2Cc_limit/DIAMOND_PUSHUP_MOTIFIED.gif",
                    name: "INCLINED PUSH-UPS",
                    sets: 10,
                },
                {
                    id: "12",
                    image: "https://cdn.prod.openfit.com/uploads/2020/03/10162714/wide-arm-push-up.gif",
                    name: "WIDE ARM PUSH-UPS",
                    sets: 12,
                },
                {
                    id: "13",
                    image: "https://www.yogajournal.com/wp-content/uploads/2021/12/Cobra.gif?width=730",
                    name: "COBRA STRETCH",
                    sets: 10,
                },
                {
                    id: "14",
                    image: "https://www.vissco.com/wp-content/uploads/animation/sub/double-knee-to-chest-stretch.gif",
                    name: "CHEST STRETCH",
                    sets: 10,
                }
            ],
            sets: 9,
        },
        {
            id: "2",
            image: "https://image.2bstronger.com/article/fitness/the-14-toughest-do-anywhere-workout-moves-56348/1006.gif",
            name: "HINDU PUSH-UPS",
            sets: 10,
        },
        {
            id: "3",
            image: "https://thumbs.gfycat.com/TheseRigidBorer-size_restricted.gif",
            name: "SHOULDER STRETCH",
            sets: 5,
        },
        {
            id: "4",
            image: "https://thumbs.gfycat.com/AlertAfraidAldabratortoise-max-1mb.gif",
            name: "COBRA STRETCH",
            sets: 4,
        },
        {
            id: "5",
            image: "https://media4.popsugar-assets.com/files/thumbor/BaWEAcCjtJEjiwf3PqJHnZ_S23A/fit-in/2048xorig/filters:format_auto-!!-:strip_icc-!!-/2016/08/10/766/n/1922729/1eae2dcf3d395379_PushUpTwist.gif",
            name: "PUSH-UP & ROTATION",
            sets: 12,
        },
        {
            id: "6",
            image: "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif",
            name: "BURPEES",
            sets: 10
        },
        {
            id: "7",
            image: "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif",
            name: "BURPEES",
            sets: 10
        },
        {
            id: "8",
            image: "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif",
            name: "BURPEES",
            sets: 10
        },
        {
            id: "9",
            image: "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif",
            name: "BURPEES",
            sets: 10
        },
        {
            id: "10",
            image: "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif",
            name: "BURPEES",
            sets: 10
        },
        {
            id: "11",
            image: "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif",
            name: "BURPEES",
            sets: 10
        },
        {
            id: "12",
            image: "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif",
            name: "BURPEES",
            sets: 10
        },
        {
            id: "13",
            image: "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif",
            name: "BURPEES",
            sets: 10
        },
        {
            id: "14",
            image: "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif",
            name: "BURPEES",
            sets: 10
        },
        {
            id: "15",
            image: "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif",
            name: "BURPEES",
            sets: 10
        },
        {
            id: "16",
            image: "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif",
            name: "BURPEES",
            sets: 10
        },
        {
            id: "17",
            image: "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif",
            name: "BURPEES",
            sets: 10
        },
        {
            id: "18",
            image: "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif",
            name: "BURPEES",
            sets: 10
        },
        {
            id: "19",
            image: "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif",
            name: "BURPEES",
            sets: 10
        },
        {
            id: "20",
            image: "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif",
            name: "BURPEES",
            sets: 10
        },
        {
            id: "21",
            image: "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif",
            name: "BURPEES",
            sets: 10
        },
        {
            id: "22",
            image: "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif",
            name: "BURPEES",
            sets: 10
        },
        {
            id: "23",
            image: "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif",
            name: "BURPEES",
            sets: 10
        },
        {
            id: "24",
            image: "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif",
            name: "BURPEES",
            sets: 10
        },
        {
            id: "25",
            image: "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif",
            name: "BURPEES",
            sets: 10
        },
        {
            id: "26",
            image: "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif",
            name: "BURPEES",
            sets: 10
        },
        {
            id: "27",
            image: "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif",
            name: "BURPEES",
            sets: 10
        },
        {
            id: "28",
            image: "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif",
            name: "BURPEES",
            sets: 10
        },
        {
            id: "29",
            image: "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif",
            name: "BURPEES",
            sets: 10
        },
        {
            id: "30",
            image: "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif",
            name: "BURPEES",
            sets: 10
        }
    ]*/
    const { category, item: data, workouts } = useRoute().params;




    return (
        <SafeAreaView>
            {/* Header Image */}
            <Image
                source={{ uri: "https://i.pinimg.com/originals/ff/cf/40/ffcf40474f0758dfedebc823f5532aa1.gif" }}
                style={{ width: '100%', height: 200, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, marginBottom: 10 }}
                resizeMode="cover"
            />

            {/* Back Arrow */}
            <TouchableOpacity
                onPress={() => navigation.navigate("Home")}
                style={{ position: 'absolute', top: 50, left: 20, zIndex: 10 }}
            >
                <Image
                    source={icons.backArrow}
                    style={{ width: 30, height: 30, tintColor: '#000' }}
                />
            </TouchableOpacity>
            <ScrollView>


                {data.map((item, index) => (
                    <TouchableOpacity key={index} onPress={() => navigate.navigate("Workout", {
                        exercises: item.exercises ? item.exercises : [item],
                        image: item.image,
                    })}>
                        <View
                            style={{
                                flexDirection: 'column',
                                margin: 10,
                                backgroundColor: 'beige',
                            }}
                        >

                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 10,
                                    borderRadius: "full",
                                    justifyContent: 'space-between',
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Text>Day {item.id}</Text>
                                    <Text>{item.sets} Exercises</Text>
                                </View>
                                <View
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 9999, // full rounded
                                        backgroundColor: 'white',
                                        paddingHorizontal: 10,
                                        paddingVertical: 5,
                                    }}
                                >
                                    <Text style={{ color: 'blue', fontSize: 16 }}>START</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    )
}

export default Days;



const [completed, minutes, calories, setCompleted, setCalories, setMinutes, workout, setWorkout] = useContext();