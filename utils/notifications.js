import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const NOTIF_ENABLED_KEY = 'notifications_enabled';
const STREAK_REMINDER_ID_KEY = 'streak_reminder_id_v1';

const canUseWebStorage = () =>
  Platform.OS === 'web' && typeof window !== 'undefined' && !!window.localStorage;

const readValueByKey = async (key) => {
  try {
    if (canUseWebStorage()) return window.localStorage.getItem(key);
    if (!SecureStore.getItemAsync) return null;
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
};

const writeValueByKey = async (key, value) => {
  try {
    if (canUseWebStorage()) {
      window.localStorage.setItem(key, value);
      return;
    }
    if (!SecureStore.setItemAsync) return;
    await SecureStore.setItemAsync(key, value);
  } catch {
    // ignore
  }
};

const getNotificationsModule = () => {
  try {
    // Lazy require to avoid crashing when module isn't installed.
    // eslint-disable-next-line global-require
    return require('expo-notifications');
  } catch {
    return null;
  }
};

export const getNotificationsEnabled = async () => {
  const raw = await readValueByKey(NOTIF_ENABLED_KEY);
  if (raw == null) return true;
  return raw === 'true';
};

export const clearStreakReminder = async () => {
  const Notifications = getNotificationsModule();
  if (!Notifications) return;
  const storedId = await readValueByKey(STREAK_REMINDER_ID_KEY);
  if (storedId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(storedId);
    } catch {
      // ignore
    }
    await writeValueByKey(STREAK_REMINDER_ID_KEY, '');
  }
};

export const scheduleStreakReminder = async ({ streak = 0, hasWorkoutToday = false }) => {
  const Notifications = getNotificationsModule();
  if (!Notifications) return { ok: false, reason: 'missing-module' };

  const enabled = await getNotificationsEnabled();
  if (!enabled || streak <= 0) {
    await clearStreakReminder();
    return { ok: false, reason: 'disabled-or-no-streak' };
  }

  const permission = await Notifications.getPermissionsAsync();
  if (permission.status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    if (req.status !== 'granted') return { ok: false, reason: 'no-permission' };
  }

  const storedId = await readValueByKey(STREAK_REMINDER_ID_KEY);
  if (storedId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(storedId);
    } catch {
      // ignore
    }
  }

  if (hasWorkoutToday) {
    await writeValueByKey(STREAK_REMINDER_ID_KEY, '');
    return { ok: false, reason: 'already-worked-out' };
  }

  const now = new Date();
  const triggerDate = new Date();
  triggerDate.setHours(20, 0, 0, 0);
  if (triggerDate <= now) {
    triggerDate.setDate(triggerDate.getDate() + 1);
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Keep your streak',
      body: `You're on a ${streak}-day streak. Train today to keep it alive.`,
    },
    trigger: triggerDate,
  });

  await writeValueByKey(STREAK_REMINDER_ID_KEY, String(id));
  return { ok: true };
};
