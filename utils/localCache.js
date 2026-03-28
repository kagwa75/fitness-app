import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const memoryCache = new Map();

const canUseWebStorage = () =>
  Platform.OS === 'web' && typeof window !== 'undefined' && !!window.localStorage;

const readFromStorage = async (key) => {
  try {
    if (canUseWebStorage()) return window.localStorage.getItem(key);
    if (AsyncStorage?.getItem) return await AsyncStorage.getItem(key);
    if (SecureStore?.getItemAsync) return await SecureStore.getItemAsync(key);
    return null;
  } catch (error) {
    console.error(`Failed to read cache ${key}:`, error);
    return null;
  }
};

const writeToStorage = async (key, value) => {
  try {
    if (canUseWebStorage()) {
      window.localStorage.setItem(key, value);
      return;
    }
    if (AsyncStorage?.setItem) {
      await AsyncStorage.setItem(key, value);
      return;
    }
    if (SecureStore?.setItemAsync) {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.error(`Failed to write cache ${key}:`, error);
  }
};

const removeFromStorage = async (key) => {
  try {
    if (canUseWebStorage()) {
      window.localStorage.removeItem(key);
      return;
    }
    if (AsyncStorage?.removeItem) {
      await AsyncStorage.removeItem(key);
      return;
    }
    if (SecureStore?.deleteItemAsync) {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.error(`Failed to remove cache ${key}:`, error);
  }
};

export const readCache = async (key) => {
  if (memoryCache.has(key)) return memoryCache.get(key);
  const raw = await readFromStorage(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    memoryCache.set(key, parsed);
    return parsed;
  } catch (error) {
    console.error(`Failed to parse cache ${key}:`, error);
    return null;
  }
};

export const writeCache = async (key, data) => {
  const payload = { data, savedAt: new Date().toISOString() };
  memoryCache.set(key, payload);
  await writeToStorage(key, JSON.stringify(payload));
  return payload;
};

export const clearCacheKey = async (key) => {
  memoryCache.delete(key);
  await removeFromStorage(key);
};

export const isCacheFresh = (cacheEntry, maxAgeMs) => {
  if (!cacheEntry?.savedAt) return false;
  const savedAt = new Date(cacheEntry.savedAt).getTime();
  if (!Number.isFinite(savedAt)) return false;
  return Date.now() - savedAt <= maxAgeMs;
};
