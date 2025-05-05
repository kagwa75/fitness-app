const API_BASE = "localhost:3000";

export const fetchAPI = async (endpoint, options) => {
    const url = `${API_BASE}${endpoint}`;
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
};