const API_BASE_URL = String(
    process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.100.6:4000'
).replace(/\/$/, '');

export default API_BASE_URL;
