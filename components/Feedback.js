import React, { useState } from "react";
import { SafeAreaView, Text, TextInput, TouchableOpacity, View, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function Feedback() {
    const navigation = useNavigation();
    const [feedback, setFeedback] = useState("");

    const sendEmail = () => {
        const email = "kagwanjajames7@gmail.com";
        const subject = "App Feedback";
        const body = feedback;
        const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        Linking.openURL(mailtoUrl).catch((err) => console.error("Failed to open email:", err));
    };

    return (
        <SafeAreaView style={{ flex: 1, marginTop: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", padding: 20, backgroundColor: "#FFF" }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={{ fontSize: 16, fontWeight: "bold", marginLeft: 10 }}>
                    Feedback
                </Text>
            </View>

            <View style={{ flex: 1, padding: 20 }}>
                <TextInput
                    placeholder="Got any feedback or suggestion..."
                    style={{ padding: 15, borderWidth: 1, borderColor: "#ccc", borderRadius: 10, height: 150, textAlignVertical: "top" }}
                    multiline
                    value={feedback}
                    onChangeText={setFeedback}
                />
            </View>

            <View style={{ alignItems: "center", marginBottom: 30 }}>
                <TouchableOpacity
                    onPress={sendEmail}
                    style={{ backgroundColor: "blue", padding: 10, borderRadius: 50, justifyContent: "center", alignItems: "center", width: 100 }}
                >
                    <Text style={{ color: "#FFF", fontWeight: "bold" }}>SEND</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
