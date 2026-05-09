import axios from 'axios';
import API_BASE_URL from '../constants/api';
import { getAppHeaders, withAppBody } from '../constants/app';

export const saveInProgressToBackend = async ({ userId, payload }) => {
    if (!userId) return;
    await axios.post(`${API_BASE_URL}/users/in-progress`, {
        ...withAppBody({
            clerkUserId: userId,
            workout: payload,
        }),
    }, {
        headers: getAppHeaders(),
    });
};

export const clearInProgressFromBackend = async (userId) => {
    if (!userId) return;
    await axios.delete(`${API_BASE_URL}/users/in-progress`, {
        data: withAppBody({ clerkUserId: userId }),
        headers: getAppHeaders(),
    });
};
