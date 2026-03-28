import axios from 'axios';
import API_BASE_URL from '../constants/api';

export const saveInProgressToBackend = async ({ userId, payload }) => {
    if (!userId) return;
    await axios.post(`${API_BASE_URL}/users/in-progress`, {
        clerkUserId: userId,
        workout: payload,
    });
};

export const clearInProgressFromBackend = async (userId) => {
    if (!userId) return;
    await axios.delete(`${API_BASE_URL}/users/in-progress`, {
        data: { clerkUserId: userId },
    });
};
