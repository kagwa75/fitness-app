export const APP_ID = String(process.env.EXPO_PUBLIC_APP_ID || 'fitness-partner').trim() || 'fitness-partner';
export const APP_HEADER_NAME = 'x-app-id';

export const getAppHeaders = () => ({
    [APP_HEADER_NAME]: APP_ID,
});

export const withAppParams = (params = {}) => ({
    ...params,
    appId: APP_ID,
});

export const withAppBody = (body = {}) => ({
    ...body,
    appId: APP_ID,
});

export const scopeStorageKey = (prefix, clerkUserId) => {
    const userPart = clerkUserId ? String(clerkUserId).trim() : 'guest';
    return `${prefix}_${APP_ID}_${userPart}`;
};
