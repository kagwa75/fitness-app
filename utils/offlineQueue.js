import { readCache, writeCache } from './localCache';

const WORKOUT_QUEUE_KEY = 'workout_upload_queue_v1';

export const readWorkoutQueue = async () => {
  const cached = await readCache(WORKOUT_QUEUE_KEY);
  return Array.isArray(cached?.data) ? cached.data : [];
};

export const writeWorkoutQueue = async (queue) => {
  await writeCache(WORKOUT_QUEUE_KEY, queue);
};

export const enqueueWorkout = async (payload) => {
  const queue = await readWorkoutQueue();
  await writeWorkoutQueue([{ ...payload, queuedAt: new Date().toISOString() }, ...queue]);
};

export const dequeueWorkout = async (id) => {
  const queue = await readWorkoutQueue();
  await writeWorkoutQueue(queue.filter((item) => item.localId !== id));
};
