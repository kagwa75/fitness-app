
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Details({ data, image }) {

    return (
        <ScrollView
            style={{ flex: 1, display: "flex" }}
            showsVerticalScrollIndicator={true}>
            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", padding: 20 }} >
                <TouchableOpacity>
                    <Text>INSTRUCTIONS</Text>
                </TouchableOpacity>
                <Text>
                    |
                </Text>
                <TouchableOpacity>
                    <Text>
                        RECORDS
                    </Text>
                </TouchableOpacity>

            </View>

            <View style={{ display: "flex", flexDirection: "column", }}>
                <View style={{ padding: 10, display: "flex", justifyContent: "center", backgroundColor: "#F000", shadowColor: "#000", elevation: 3, shadowOffset: { width: 0, height: 2 } }} >
                    <Image alt="no Image" source={{ uri: image }} resizeMode="contain" style={{ width: "100%", height: "50%" }} />
                </View>

                {/*titles */}
                <View style={{ display: "flex", paddingLeft: 12, gap: 10 }} >
                    <Text style={{ fontWeight: "bold", fontSize: 20 }} >{data.name}</Text>
                    <View style={{ display: "flex", flexDirection: "row", gap: 15 }} >
                        <Text style={{ fontWeight: "bold", fontSize: 14 }}>FOCUS AREA</Text>
                        <Text>{data.sets}</Text>
                    </View>
                    <View style={{ display: "flex", flexDirection: "row", gap: 15 }}>
                        <Text style={{ fontWeight: "bold", fontSize: 14 }}>EQUIPMENT</Text>
                        <Text>{data.sets}</Text>
                    </View>
                </View>
                <View style={{ borderColor: "black", borderWidth: 1, margin: 10, marginTop: 20 }} >

                </View>
                {/*instructions details */}
                <View style={{ paddingLeft: 10, gap: 4 }} >
                    <Text style={{ fontWeight: "bold", fontSize: 20 }}>PREPARATIONS</Text>
                    <Text>{data.preparation}</Text>
                    <Text style={{ fontWeight: "bold", fontSize: 20 }}>EXECUTION</Text>
                    <Text>1 {data.execution1}.</Text>
                    <Text>2 {data.execution2}.</Text>
                    <Text style={{ fontWeight: "bold", fontSize: 20 }}>KEY TIPS</Text>
                    <Text >1 {data.tips[0]}</Text>
                    <Text>2 {data.tips[1]}</Text>
                    <Text>3 {data.tips[2]}</Text>
                </View>
            </View>

        </ScrollView>
    )
}