import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const FitnessItems = createContext();

const DAY_PROGRESS_STORAGE_KEY = "program_day_progress_v1";
const IN_PROGRESS_WORKOUT_STORAGE_KEY = "in_progress_workout_v1";
const USER_PROFILE_STORAGE_KEY = "user_onboarding_profile_v1";

const VALID_GENDERS = new Set(["male", "female", "non_binary", "prefer_not_to_say"]);
const VALID_GOALS = new Set(["lose_weight", "gain_weight", "build_muscle", "maintain_fitness"]);
const VALID_LEVELS = new Set(["beginner", "intermediate", "advanced"]);

const canUseWebStorage = () =>
  Platform.OS === "web" &&
  typeof window !== "undefined" &&
  !!window.localStorage;

const readValueByKey = async (key) => {
  try {
    if (canUseWebStorage()) {
      return window.localStorage.getItem(key);
    }

    if (!SecureStore.getItemAsync) return null;
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Failed to read ${key}:`, error);
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
  } catch (error) {
    console.error(`Failed to write ${key}:`, error);
  }
};

const removeValueByKey = async (key) => {
  try {
    if (canUseWebStorage()) {
      window.localStorage.removeItem(key);
      return;
    }

    if (!SecureStore.deleteItemAsync) return;
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Failed to remove ${key}:`, error);
  }
};

const safeParseObject = (raw) => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
};

const sanitizeInProgressWorkout = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const exercises = Array.isArray(value.exercises) ? value.exercises : [];
  if (!exercises.length) return null;

  const completedExercises = Array.isArray(value.completedExercises)
    ? value.completedExercises.filter(
        (exercise) =>
          exercise &&
          typeof exercise === "object" &&
          String(exercise.name || "").trim()
      )
    : [];

  const programKey = String(value.programKey || "").trim();
  const clerkUserId = value.clerkUserId
    ? String(value.clerkUserId).trim()
    : null;
  const safeCurrentIndex = Number.isInteger(value.currentIndex)
    ? value.currentIndex
    : 0;
  const maxIndex = Math.max(0, exercises.length - 1);

  return {
    clerkUserId,
    programKey,
    dayIndex: Number.isInteger(value.dayIndex) ? value.dayIndex : null,
    dayName: value.dayName ? String(value.dayName) : null,
    totalDays: Number.isInteger(value.totalDays)
      ? value.totalDays
      : exercises.length,
    exercises,
    completedExercises,
    currentIndex: Math.min(Math.max(0, safeCurrentIndex), maxIndex),
    currentTimeLeft: Number.isFinite(Number(value.currentTimeLeft))
      ? Math.max(0, Math.round(Number(value.currentTimeLeft)))
      : null,
    savedAt: value.savedAt || new Date().toISOString(),
  };
};

const sanitizeUserProfile = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const age = Number(value.age);
  const weight = Number(value.weight);
  const gender = String(value.gender || "").trim();
  const goal = String(value.goal || "").trim();
  const fitnessLevel = String(value.fitnessLevel || "").trim();

  if (!Number.isInteger(age) || age < 10 || age > 120) return null;
  if (!Number.isFinite(weight) || weight <= 0 || weight > 500) return null;
  if (!VALID_GENDERS.has(gender)) return null;
  if (!VALID_GOALS.has(goal)) return null;
  if (!VALID_LEVELS.has(fitnessLevel)) return null;

  return {
    age,
    weight,
    gender,
    goal,
    fitnessLevel,
    updatedAt: value.updatedAt || new Date().toISOString(),
  };
};

const FitnessContext = ({ children }) => {
  const [completed, setCompleted] = useState([]);
  const [workout, setWorkout] = useState(0);
  const [calories, setCalories] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [dayProgress, setDayProgress] = useState({});
  const [inProgressWorkout, setInProgressWorkout] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isUserProfileHydrated, setIsUserProfileHydrated] = useState(false);
  const [restTimer, setRestTimer] = useState({
    isActive: false,
    endAt: null,
    timeLeft: 0,
    duration: 0,
  });

  useEffect(() => {
    const loadDayProgress = async () => {
      const raw = await readValueByKey(DAY_PROGRESS_STORAGE_KEY);
      const parsed = safeParseObject(raw);
      setDayProgress(parsed);
    };
    loadDayProgress();
  }, []);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const raw = await readValueByKey(USER_PROFILE_STORAGE_KEY);
        if (!raw) {
          setUserProfile(null);
          return;
        }

        const parsed = JSON.parse(raw);
        setUserProfile(sanitizeUserProfile(parsed));
      } catch {
        setUserProfile(null);
      } finally {
        setIsUserProfileHydrated(true);
      }
    };

    loadUserProfile();
  }, []);

  useEffect(() => {
    const loadInProgressWorkout = async () => {
      const raw = await readValueByKey(IN_PROGRESS_WORKOUT_STORAGE_KEY);
      if (!raw) {
        setInProgressWorkout(null);
        return;
      }

      try {
        const parsed = JSON.parse(raw);
        setInProgressWorkout(sanitizeInProgressWorkout(parsed));
      } catch {
        setInProgressWorkout(null);
      }
    };

    loadInProgressWorkout();
  }, []);

  const persistDayProgress = useCallback((nextMap) => {
    writeValueByKey(DAY_PROGRESS_STORAGE_KEY, JSON.stringify(nextMap));
  }, []);

  const persistInProgressWorkout = useCallback((payload) => {
    if (!payload) {
      removeValueByKey(IN_PROGRESS_WORKOUT_STORAGE_KEY);
      return;
    }

    writeValueByKey(IN_PROGRESS_WORKOUT_STORAGE_KEY, JSON.stringify(payload));
  }, []);

  const markDayCompleted = useCallback(
    (programKey, dayIndex) => {
      const safeProgramKey = String(programKey || "").trim();
      if (!safeProgramKey || !Number.isInteger(dayIndex) || dayIndex < 0) return;

      setDayProgress((prev) => {
        const existing = Array.isArray(prev[safeProgramKey]) ? prev[safeProgramKey] : [];
        if (existing.includes(dayIndex)) return prev;

        const next = {
          ...prev,
          [safeProgramKey]: [...existing, dayIndex].sort((a, b) => a - b),
        };
        persistDayProgress(next);
        return next;
      });
    },
    [persistDayProgress]
  );

  const getCompletedDaysForProgram = useCallback(
    (programKey) => {
      const safeProgramKey = String(programKey || "").trim();
      if (!safeProgramKey) return [];
      return Array.isArray(dayProgress[safeProgramKey]) ? dayProgress[safeProgramKey] : [];
    },
    [dayProgress]
  );

  const saveInProgressWorkout = useCallback(
    (payload) => {
      const sanitized = sanitizeInProgressWorkout(payload);
      if (!sanitized) return;
      setInProgressWorkout(sanitized);
      persistInProgressWorkout(sanitized);
    },
    [persistInProgressWorkout]
  );

  const clearInProgressWorkout = useCallback(() => {
    setInProgressWorkout(null);
    persistInProgressWorkout(null);
  }, [persistInProgressWorkout]);

  const saveUserProfile = useCallback((payload) => {
    const sanitized = sanitizeUserProfile(payload);
    if (!sanitized) return false;

    setUserProfile(sanitized);
    writeValueByKey(USER_PROFILE_STORAGE_KEY, JSON.stringify(sanitized));
    return true;
  }, []);

  const clearUserProfile = useCallback(() => {
    setUserProfile(null);
    removeValueByKey(USER_PROFILE_STORAGE_KEY);
  }, []);

  const isOnboardingComplete = useMemo(() => !!userProfile, [userProfile]);

  const startRestTimer = useCallback((seconds = 15, forceRestart = true) => {
    const parsed = Number(seconds);
    const safeSeconds = Number.isFinite(parsed) ? Math.max(1, Math.round(parsed)) : 15;

    setRestTimer((prev) => {
      if (prev.isActive && !forceRestart) return prev;
      const endAt = Date.now() + safeSeconds * 1000;
      return {
        isActive: true,
        endAt,
        timeLeft: safeSeconds,
        duration: safeSeconds,
      };
    });
  }, []);

  const addRestTime = useCallback((seconds = 10) => {
    const parsed = Number(seconds);
    const delta = Number.isFinite(parsed) ? Math.max(1, Math.round(parsed)) : 10;

    setRestTimer((prev) => {
      const baseEndAt = prev.isActive && prev.endAt ? prev.endAt : Date.now();
      const nextEndAt = baseEndAt + delta * 1000;
      const nextTimeLeft = Math.max(0, Math.ceil((nextEndAt - Date.now()) / 1000));

      return {
        isActive: true,
        endAt: nextEndAt,
        timeLeft: nextTimeLeft,
        duration: Math.max(prev.duration || 0, nextTimeLeft),
      };
    });
  }, []);

  const stopRestTimer = useCallback(() => {
    setRestTimer({
      isActive: false,
      endAt: null,
      timeLeft: 0,
      duration: 0,
    });
  }, []);

  useEffect(() => {
    if (!restTimer.isActive || !restTimer.endAt) return;

    const interval = setInterval(() => {
      setRestTimer((prev) => {
        if (!prev.isActive || !prev.endAt) return prev;

        const nextTimeLeft = Math.max(0, Math.ceil((prev.endAt - Date.now()) / 1000));
        if (nextTimeLeft === prev.timeLeft) return prev;
        if (nextTimeLeft <= 0) {
          return {
            ...prev,
            isActive: false,
            endAt: null,
            timeLeft: 0,
          };
        }

        return {
          ...prev,
          timeLeft: nextTimeLeft,
        };
      });
    }, 250);

    return () => clearInterval(interval);
  }, [restTimer.isActive, restTimer.endAt]);

  const isRestTimerUrgent = useMemo(
    () => restTimer.isActive && restTimer.timeLeft > 0 && restTimer.timeLeft <= 5,
    [restTimer.isActive, restTimer.timeLeft]
  );

  return (
    <FitnessItems.Provider
      value={{
        completed,
        setCompleted,
        workout,
        setWorkout,
        calories,
        setCalories,
        minutes,
        setMinutes,
        dayProgress,
        markDayCompleted,
        getCompletedDaysForProgram,
        inProgressWorkout,
        saveInProgressWorkout,
        clearInProgressWorkout,
        userProfile,
        saveUserProfile,
        clearUserProfile,
        isOnboardingComplete,
        isUserProfileHydrated,
        restTimer,
        startRestTimer,
        addRestTime,
        stopRestTimer,
        isRestTimerUrgent,
      }}
    >
      {children}
    </FitnessItems.Provider>
  );
};

export { FitnessContext, FitnessItems }
