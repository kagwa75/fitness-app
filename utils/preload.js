import axios from 'axios';
import { readCache, writeCache, isCacheFresh } from './localCache';
import {
  fetchAllApiExercises,
  getExerciseApiEndpoints,
  mapApiExerciseToLibrary,
  normalizeApiExercise,
} from './exerciseApi';
import { mapWorkoutSession } from './recordsMapper';
import {
  API_LIBRARY_CACHE_KEY,
  API_LIBRARY_CACHE_TTL_MS,
  EXERCISES_CACHE_KEY,
  EXERCISES_CACHE_TTL_MS,
  RECORDS_CACHE_KEY_PREFIX,
  RECORDS_CACHE_TTL_MS,
} from '../constants/cache';

export const preloadExerciseLibrary = async (apiBaseUrl) => {
  const cached = await readCache(EXERCISES_CACHE_KEY);
  if (isCacheFresh(cached, EXERCISES_CACHE_TTL_MS) && Array.isArray(cached?.data)) return;

  for (const endpoint of [...new Set(getExerciseApiEndpoints(apiBaseUrl))]) {
    try {
      const rows = await fetchAllApiExercises(endpoint);
      const normalized = rows.map((item, index) => normalizeApiExercise(item, index));
      await writeCache(EXERCISES_CACHE_KEY, normalized);
      return;
    } catch {
      // try next endpoint
    }
  }
};

export const preloadCustomLibrary = async (apiBaseUrl) => {
  const cached = await readCache(API_LIBRARY_CACHE_KEY);
  if (isCacheFresh(cached, API_LIBRARY_CACHE_TTL_MS) && Array.isArray(cached?.data)) return;

  for (const endpoint of [...new Set(getExerciseApiEndpoints(apiBaseUrl))]) {
    try {
      const rows = await fetchAllApiExercises(endpoint);
      const mapped = rows.map((item, index) => mapApiExerciseToLibrary(item, index)).filter((item) => item.name);
      await writeCache(API_LIBRARY_CACHE_KEY, mapped);
      return;
    } catch {
      // try next endpoint
    }
  }
};

export const preloadRecords = async (apiBaseUrl, clerkUserId) => {
  if (!clerkUserId) return;
  const cacheKey = `${RECORDS_CACHE_KEY_PREFIX}${clerkUserId}`;
  const cached = await readCache(cacheKey);
  if (isCacheFresh(cached, RECORDS_CACHE_TTL_MS) && Array.isArray(cached?.data)) return;

  try {
    const response = await axios.get(`${apiBaseUrl}/users/workouts`, {
      params: { clerkUserId },
    });
    const payload = Array.isArray(response.data) ? response.data : [];
    const mapped = payload.map(mapWorkoutSession).filter(Boolean);
    await writeCache(cacheKey, mapped);
  } catch {
    // ignore preload failures
  }
};
