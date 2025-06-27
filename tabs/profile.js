import { useNavigation } from '@react-navigation/native';
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, useOAuth, useUser } from '@clerk/clerk-expo';
import { fetchAPI } from '../auth/fetch';
import axios from 'axios';

export default function Welcome() {
    const { isSignedIn } = useAuth();
    const { user } = useUser();
    const navigation = useNavigation();

    const SettingItem = ({ iconName, iconColor, title, backgroundColor, onPress }) => (
        <TouchableOpacity style={styles.settingItem} onPress={onPress}>
            <View style={[styles.iconContainer, { backgroundColor }]}>
                <Ionicons name={iconName} size={20} color={iconColor ? iconColor : "white"} />
            </View>
            <Text style={styles.settingText}>{title}</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
        </TouchableOpacity>
    );
    const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

    const googleOAth = async (startOAuthFlow) => {
        try {
            const { createdSessionId, setActive } = await startOAuthFlow();

            if (createdSessionId && setActive) {
                await setActive({ session: createdSessionId });

                if (isSignedIn && user) {
                    console.log("User object after sign-in:", user);

                    await axios.post("http://192.168.64.194:3000/users", {
                        name: `${user.firstName} ${user.lastName}`,
                        email: user.primaryEmailAddress.emailAddress,
                        clerkId: user.id,

                    });

                    return {
                        success: true,
                        code: "success",
                        message: "You have successfully signed in with Google",
                    };
                }
            }

            return {
                success: false,
                message: "An error occurred while signing in with Google",
            };
        } catch (error) {
            console.error(error);
            return {
                success: false,
                code: error.code,
                message: error?.errors?.[0]?.longMessage || error.message,
            };
        }
    };
    const LoginWithGoogle = async () => {
        const result = await googleOAth(startOAuthFlow);

        console.log("result", result);
        if (result.code === "session_exists") {
            Alert.alert("Succcess", "Session exists. Redrirectin to home screen");
            navigation.navigate("App");
        }

        Alert.alert(result.success ? "success" : " Error"), result.message;
    };

    return (
        <SafeAreaView style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    {isSignedIn ? (
                        <>
                            <Text style={styles.greetingText}>
                                {user.firstName}!
                            </Text>
                            <Text style={styles.headerSubtitle}>Welcome back</Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.headerTitle}>Backup & Restore</Text>
                            <Text style={styles.headerSubtitle}>Synchronize your data</Text>
                        </>
                    )}
                </View>
                <TouchableOpacity onPress={LoginWithGoogle}>
                    <Ionicons name='reload' size={22} color="#4A90E2" />
                </TouchableOpacity>
            </View>

            {/* Settings Sections */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Settings</Text>

                <SettingItem
                    iconName="happy"
                    title="My Profile"
                    backgroundColor="#FF9500"
                    onPress={() => navigation.navigate("userProfile")}
                />
                <View style={styles.divider} />

                <SettingItem
                    iconName="settings"
                    title="General Settings"
                    backgroundColor="#34C759"

                />
                <View style={styles.divider} />

                <SettingItem
                    iconName="globe"
                    title="Language"
                    backgroundColor="#5856D6"
                />
            </View>

            {/*app details */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>App</Text>

                <SettingItem
                    iconName="close"
                    title="Remove Ads"
                    backgroundColor="#FF3B30"
                />
                <View style={styles.divider} />

                <SettingItem
                    iconName="star"
                    title="Rate Us"
                    backgroundColor="#FFCC00"
                />
                <View style={styles.divider} />

                <SettingItem
                    iconName="create"
                    title="Feedback"
                    backgroundColor="#5AC8FA"
                    onPress={() => navigation.navigate("feedback")}
                />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 12,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerContent: {
        flexDirection: 'column',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
    },
    section: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginVertical: 10,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#888',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    divider: {
        height: 1,
        backgroundColor: '#EEE',
        marginLeft: 60,
    },
});