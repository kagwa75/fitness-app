import * as SecureStore from "expo-secure-store";

const createTokenCache = () => {
    return {
        getToken: async (key) => {
            try {
                const item = await SecureStore.getItemAsync(key);
                if (item) {
                    console.log(`${key} was used`);
                } else {
                    console.log("No values stored under key: " + key);
                } return item
            }
            catch (error) {
                console.error("Error retrieving token:", error);
                await SecureStore.deleteItemAsync(key);
                return null;
            }
        },
        saveToken: async (key, token) => {
            try {
                await SecureStore.setItemAsync(key, token);
                console.log("Token saved successfully.");
            } catch (error) {
                console.error("Error saving token:", error);
            }
        },
    }
}
export const TokenCache = createTokenCache();