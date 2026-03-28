const FALLBACK_IMAGE = 'https://sworkit.com/wp-content/uploads/2020/06/sworkit-jumping-jack.gif';

const normalizeText = (value) => String(value || '').trim();
const toTitleCase = (value) =>
  normalizeText(value)
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

export const normalizeCategoryLabel = (value) => toTitleCase(value || 'Other');

export const formatCategory = (category = 'general') => {
  const safe = String(category).trim();
  if (!safe) return 'General';
  return safe.charAt(0).toUpperCase() + safe.slice(1);
};

export const getExerciseApiEndpoints = (apiBaseUrl) => {
  const endpoints = [];
  if (apiBaseUrl) {
    endpoints.push(
      `${apiBaseUrl}/api/exercises/filter`,
      `${apiBaseUrl}/api/exercises`,
      `${apiBaseUrl}/exercises/filter`,
      `${apiBaseUrl}/exercises`
    );
  }
  endpoints.push(
    'http://192.168.100.6:3000/api/exercises/filter',
    'http://192.168.100.6:3000/api/exercises'
  );
  return endpoints;
};

export const fetchAllApiExercises = async (endpoint) => {
  const limit = 100;
  let offset = 0;
  let total = Infinity;
  const rows = [];

  while (offset < total) {
    const separator = endpoint.includes('?') ? '&' : '?';
    const res = await fetch(`${endpoint}${separator}limit=${limit}&offset=${offset}`);
    if (!res.ok) {
      throw new Error(`Failed ${endpoint} (${res.status})`);
    }
    const payload = await res.json();
    const data = Array.isArray(payload?.data) ? payload.data : [];
    const parsedTotal = Number(payload?.total);
    rows.push(...data);
    total = Number.isFinite(parsedTotal) ? parsedTotal : rows.length;

    if (!data.length || data.length < limit) break;
    offset += data.length;
  }

  return rows;
};

export const normalizeApiExercise = (exercise, index) => {
  const instructionsFromApi = Array.isArray(exercise?.instructions)
    ? exercise.instructions.map((step) => normalizeText(step)).filter(Boolean)
    : [];
  const description = normalizeText(exercise?.description);
  const fallbackInstructions = description ? [description] : [];
  const instructions = instructionsFromApi.length ? instructionsFromApi : fallbackInstructions;
  const equipment =
    Array.isArray(exercise?.equipment) && exercise.equipment.length
      ? exercise.equipment[0]
      : normalizeText(exercise?.equipment);
  const target =
    Array.isArray(exercise?.bodyParts) && exercise.bodyParts.length
      ? exercise.bodyParts[0]
      : normalizeText(exercise?.target);
  const normalizedTarget = normalizeCategoryLabel(target);
  const normalizedApiCategory = normalizeCategoryLabel(exercise?.category);
  const image =
    normalizeText(exercise?.gif_url) ||
    normalizeText(exercise?.gifUrl) ||
    (Array.isArray(exercise?.images) ? normalizeText(exercise.images[0]) : '') ||
    FALLBACK_IMAGE;

  return {
    id: exercise?.id != null ? `api-${exercise.id}` : `api-${index}`,
    name: normalizeText(exercise?.name) || `Exercise ${index + 1}`,
    category: normalizedTarget || normalizedApiCategory || 'Other',
    image,
    target: normalizedTarget || undefined,
    equipment: equipment || undefined,
    sets: Number.isFinite(Number(exercise?.sets)) ? Number(exercise.sets) : 10,
    tips: instructions.slice(0, 3),
    preparation: description || `Set up and keep controlled form for ${normalizeText(exercise?.name) || 'this exercise'}.`,
    execution1: normalizeText(instructions[0]),
    execution2: normalizeText(instructions[1]),
    instructions,
    source: 'api',
  };
};

export const mapApiExerciseToLibrary = (item, index) => {
  const target =
    (Array.isArray(item?.bodyParts) && item.bodyParts.length ? item.bodyParts[0] : '') ||
    item?.target ||
    item?.category ||
    'General';
  const sourceRef = item?.id ?? item?.sourceId ?? item?.slug ?? index;

  return {
    sourceId: `api-${String(sourceRef)}`,
    name: String(item?.name || '').trim(),
    categoryLabel: formatCategory(target),
    defaultSets: item?.sets != null ? String(item.sets) : '',
    defaultReps: item?.duration != null ? String(item.duration) : '',
  };
};

export { FALLBACK_IMAGE };
