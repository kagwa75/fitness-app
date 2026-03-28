const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const pad2 = (value) => String(value).padStart(2, '0');

const toDateObj = (value) => {
  const date = value instanceof Date ? value : new Date(value || Date.now());
  return Number.isNaN(date.getTime()) ? null : date;
};

const toDateKey = (value) => {
  const date = toDateObj(value);
  if (!date) return '';
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

const formatDateTime = (value) => {
  const date = toDateObj(value);
  if (!date) return 'Unknown date';

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const normalizeWorkoutData = (raw) => {
  if (!raw) return { exercises: [], summary: {} };

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : { exercises: [], summary: {} };
    } catch {
      return { exercises: [], summary: {} };
    }
  }

  return raw && typeof raw === 'object' ? raw : { exercises: [], summary: {} };
};

export const mapWorkoutSession = (item, index) => {
  const workoutData = normalizeWorkoutData(item?.workoutData);

  const exercises = Array.isArray(workoutData?.exercises)
    ? workoutData.exercises
        .map((exercise, exerciseIndex) => {
          const name = String(exercise?.name || '').trim();
          if (!name) return null;

          return {
            id: String(exercise?.id || `${item?.id || 'session'}-exercise-${exerciseIndex}`),
            name,
            target: exercise?.target || null,
            sets: exercise?.sets != null ? toNumber(exercise.sets, 0) : null,
            durationSeconds: exercise?.durationSeconds != null ? toNumber(exercise.durationSeconds, 0) : null,
            caloriesBurned: exercise?.caloriesBurned != null ? toNumber(exercise.caloriesBurned, 0) : 0,
          };
        })
        .filter(Boolean)
    : [];

  const summary = workoutData?.summary || {};
  const totalExercises = toNumber(item?.totalExercises, toNumber(summary?.totalExercises, exercises.length));
  const totalCaloriesBurned = toNumber(
    item?.totalCaloriesBurned,
    toNumber(summary?.totalCaloriesBurned, exercises.reduce((sum, ex) => sum + toNumber(ex.caloriesBurned, 0), 0))
  );
  const totalDurationSeconds = toNumber(
    item?.totalDurationSeconds,
    toNumber(summary?.totalDurationSeconds, exercises.reduce((sum, ex) => sum + toNumber(ex.durationSeconds, 0), 0))
  );

  const createdAt = item?.createdAt || new Date().toISOString();

  return {
    id: String(item?.id || `${createdAt}-${index}`),
    createdAt,
    dateKey: toDateKey(createdAt),
    displayDate: formatDateTime(createdAt),
    summary: {
      totalExercises,
      totalCaloriesBurned,
      totalDurationSeconds,
    },
    exercises,
  };
};
