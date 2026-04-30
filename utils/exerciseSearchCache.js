import { readCache, writeCache } from './localCache';

const SEARCH_CACHE_KEY = 'exercise_search_cache_v1';
const MAX_ENTRIES = 12;

export const readSearchCache = async () => {
  const cached = await readCache(SEARCH_CACHE_KEY);
  const data = cached?.data;
  return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
};

export const writeSearchCache = async (cache) => {
  await writeCache(SEARCH_CACHE_KEY, cache);
};

export const storeSearchResult = async (query, results) => {
  const trimmed = String(query || '').trim().toLowerCase();
  if (!trimmed) return;
  const cache = await readSearchCache();
  const next = { ...cache, [trimmed]: results.slice(0, 60) };
  const keys = Object.keys(next);
  if (keys.length > MAX_ENTRIES) {
    const oldest = keys[0];
    delete next[oldest];
  }
  await writeSearchCache(next);
};

export const getCachedSearch = (cache, query) => {
  const trimmed = String(query || '').trim().toLowerCase();
  if (!trimmed) return [];
  return Array.isArray(cache?.[trimmed]) ? cache[trimmed] : [];
};
