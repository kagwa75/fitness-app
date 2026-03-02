import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import API_BASE_URL from "./constants/api";

const FitnessItems = createContext();

const DAY_PROGRESS_STORAGE_KEY = "program_day_progress_v1";
const IN_PROGRESS_WORKOUT_STORAGE_KEY = "in_progress_workout_v1";
const USER_PROFILE_STORAGE_KEY = "user_onboarding_profile_v1";
const PROGRAM_ADAPTATION_STORAGE_KEY = "program_adaptation_v1";

const VALID_GENDERS = new Set(["male", "female", "non_binary", "prefer_not_to_say"]);
const VALID_GOALS = new Set(["lose_weight", "gain_weight", "build_muscle", "maintain_fitness"]);
const VALID_LEVELS = new Set(["beginner", "intermediate", "advanced"]);
const VALID_READINESS = new Set(["fresh", "normal", "fatigued"]);
const VALID_SESSION_DIFFICULTY = new Set(["too_easy", "just_right", "too_hard"]);
const VALID_LIMITATIONS = new Set([
  "none",
  "knee_pain",
  "lower_back_pain",
  "shoulder_pain",
  "wrist_pain",
  "ankle_pain",
]);
const getUserProfileStorageKey = (clerkUserId) =>
  clerkUserId ? `${USER_PROFILE_STORAGE_KEY}_${clerkUserId}` : `${USER_PROFILE_STORAGE_KEY}_guest`;
const getProgramAdaptationStorageKey = (clerkUserId) =>
  clerkUserId ? `${PROGRAM_ADAPTATION_STORAGE_KEY}_${clerkUserId}` : `${PROGRAM_ADAPTATION_STORAGE_KEY}_guest`;

//check if it is web or native and if web, check if localStorage is available. If native, check if SecureStore is available. This is used to determine where to read/write data for user profile and in-progress workout.
const canUseWebStorage = () =>
  Platform.OS === "web" &&
  typeof window !== "undefined" &&
  !!window.localStorage;

const readValueByKey = async (key) => {
  try {
    if (canUseWebStorage()) return window.localStorage.getItem(key);
    if (!SecureStore.getItemAsync) return null;
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Failed to read ${key}:`, error);
    return null;
  }
};

const writeValueByKey = async (key, value) => {
  try {
    if (canUseWebStorage()) { window.localStorage.setItem(key, value); return; }
    if (!SecureStore.setItemAsync) return;
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`Failed to write ${key}:`, error);
  }
};

const removeValueByKey = async (key) => {
  try {
    if (canUseWebStorage()) { window.localStorage.removeItem(key); return; }
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
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const normalizeProgramKey = (value) =>
  String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

const clampNumber = (value, min, max) => Math.min(max, Math.max(min, value));

const sanitizeSessionFeedback = (entry) => {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
  const rpe = Number(entry.rpe);
  const completionRate = Number(entry.completionRate);
  const difficultyValue = String(entry.difficulty || "").trim().toLowerCase();
  const safeDifficulty = VALID_SESSION_DIFFICULTY.has(difficultyValue) ? difficultyValue : "just_right";
  const painPoints = Array.isArray(entry.painPoints)
    ? [...new Set(
        entry.painPoints
          .map((item) => String(item || "").trim())
          .filter((item) => VALID_LIMITATIONS.has(item) && item !== "none")
      )]
    : [];

  return {
    at: entry.at || new Date().toISOString(),
    rpe: Number.isFinite(rpe) ? clampNumber(Math.round(rpe * 10) / 10, 1, 10) : 7,
    completionRate: Number.isFinite(completionRate) ? clampNumber(completionRate, 0, 1) : 1,
    difficulty: safeDifficulty,
    painPoints,
  };
};

const sanitizeProgramAdaptationMap = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const next = {};
  Object.entries(value).forEach(([programKey, adaptation]) => {
    const safeProgramKey = normalizeProgramKey(programKey);
    if (!safeProgramKey || !adaptation || typeof adaptation !== "object" || Array.isArray(adaptation)) return;

    const readinessValue = String(adaptation.readiness || "").trim().toLowerCase();
    const readiness = VALID_READINESS.has(readinessValue) ? readinessValue : "normal";
    const reportedFatigue = readiness === "fatigued" || adaptation.reportedFatigue === true;
    const sessionsCompleted = Number.isInteger(adaptation.sessionsCompleted)
      ? Math.max(0, adaptation.sessionsCompleted)
      : 0;
    const avgRpe = Number(adaptation.avgRpe);
    const avgDifficultyScore = Number(adaptation.avgDifficultyScore);
    const avgCompletionRate = Number(adaptation.avgCompletionRate);
    const painPoints = Array.isArray(adaptation.painPoints)
      ? [...new Set(
          adaptation.painPoints
            .map((item) => String(item || "").trim())
            .filter((item) => VALID_LIMITATIONS.has(item) && item !== "none")
        )]
      : [];
    const contraindications = Array.isArray(adaptation.contraindications)
      ? [...new Set(
          adaptation.contraindications
            .map((item) => String(item || "").trim())
            .filter((item) => VALID_LIMITATIONS.has(item) && item !== "none")
        )]
      : painPoints;
    const feedbackHistory = Array.isArray(adaptation.feedbackHistory)
      ? adaptation.feedbackHistory
          .map(sanitizeSessionFeedback)
          .filter(Boolean)
          .slice(-24)
      : [];
    const lastSession = sanitizeSessionFeedback(adaptation.lastSession) || feedbackHistory[feedbackHistory.length - 1] || null;

    next[safeProgramKey] = {
      readiness,
      reportedFatigue,
      sessionsCompleted,
      avgRpe: Number.isFinite(avgRpe) ? clampNumber(avgRpe, 1, 10) : null,
      avgDifficultyScore: Number.isFinite(avgDifficultyScore) ? clampNumber(avgDifficultyScore, 1, 3) : null,
      avgCompletionRate: Number.isFinite(avgCompletionRate) ? clampNumber(avgCompletionRate, 0, 1) : null,
      painPoints,
      contraindications,
      lastSession,
      feedbackHistory,
      updatedAt: adaptation.updatedAt || new Date().toISOString(),
    };
  });

  return next;
};

const sanitizeInProgressWorkout = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const exercises = Array.isArray(value.exercises) ? value.exercises : [];
  if (!exercises.length) return null;

  const completedExercises = Array.isArray(value.completedExercises)
    ? value.completedExercises.filter(
        (exercise) => exercise && typeof exercise === "object" && String(exercise.name || "").trim()
      )
    : [];

  const programKey = String(value.programKey || "").trim();
  const clerkUserId = value.clerkUserId ? String(value.clerkUserId).trim() : null;
  const safeCurrentIndex = Number.isInteger(value.currentIndex) ? value.currentIndex : 0;
  const maxIndex = Math.max(0, exercises.length - 1);

  return {
    clerkUserId,
    programKey,
    dayIndex:        Number.isInteger(value.dayIndex) ? value.dayIndex : null,
    dayName:         value.dayName ? String(value.dayName) : null,
    totalDays:       Number.isInteger(value.totalDays) ? value.totalDays : exercises.length,
    exercises,
    completedExercises,
    currentIndex:    Math.min(Math.max(0, safeCurrentIndex), maxIndex),
    currentTimeLeft: Number.isFinite(Number(value.currentTimeLeft))
      ? Math.max(0, Math.round(Number(value.currentTimeLeft)))
      : null,
    savedAt: value.savedAt || new Date().toISOString(),
  };
};

const sanitizeUserProfile = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const age          = Number(value.age);
  const height       = Number(value.height);
  const heightUnit   = String(value.heightUnit || "").trim();
  const weightUnit   = String(value.weightUnit || "").trim();
  const activityLevel = String(value.activityLevel || "").trim();
  const weight       = Number(value.weight);
  const gender       = String(value.gender || "").trim();
  const goal         = String(value.goal || "").trim();
  const fitnessLevel = String(value.fitnessLevel || "").trim();
  const workoutLocation = String(value.workoutLocation || "").trim();
  const equipment = Array.isArray(value.equipment) ? value.equipment : [];
const focusAreas = Array.isArray(value.focusAreas) ? value.focusAreas : [];
const limitations = Array.isArray(value.limitations) ? value.limitations : [];
const name      = String(value.name || '').trim();
const bodyFat   = value.bodyFat !== null && value.bodyFat !== undefined
    ? Number(value.bodyFat)
    : null;
const heightFt  = value.heightFt !== undefined ? Number(value.heightFt) : undefined;
const heightIn  = value.heightIn !== undefined ? Number(value.heightIn) : undefined;
  if (!Number.isInteger(age) || age < 10 || age > 120) return null;
  if (!Number.isFinite(weight) || weight <= 0 || weight > 500) return null;
  if (!VALID_GENDERS.has(gender)) return null;
  if (!VALID_GOALS.has(goal)) return null;
  if (!VALID_LEVELS.has(fitnessLevel)) return null;

  const normalizedLimitations = limitations
    .filter((entry) => typeof entry === "string" && VALID_LIMITATIONS.has(entry.trim()))
    .map((entry) => entry.trim());
  const safeLimitations = normalizedLimitations.includes("none")
    ? ["none"]
    : [...new Set(normalizedLimitations)];

  return {
    age,
    weight,
    gender,
    goal,
    height,
    heightUnit:    heightUnit    || "cm",
    weightUnit:    weightUnit    || "kg",
    activityLevel: activityLevel || "sedentary",
    fitnessLevel,
    updatedAt: value.updatedAt || new Date().toISOString(),
    workoutLocation: workoutLocation || "home",
    equipment: equipment.filter(e => typeof e === "string" && e.trim()),
    focusAreas: focusAreas.filter(f => typeof f === "string" && f.trim()),
    limitations: safeLimitations,
    name: name || null,
    bodyFat: Number.isFinite(bodyFat) && bodyFat > 0 && bodyFat < 100 ? bodyFat : null,
    heightFt: Number.isFinite(heightFt) && heightFt >= 0 ? heightFt : null,
    heightIn: Number.isFinite(heightIn) && heightIn >= 0 ? heightIn : null,
  };
};

// ── Cloud helpers ─────────────────────────────────────────────────────────────

const fetchProfileFromCloud = async (clerkId) => {
  const response = await axios.get(`${API_BASE_URL}/users/profile`, {
    params: { clerkId },
  });
  return response.data?.profile ?? null;
};

const pushProfileToCloud = async (clerkId, profile) => {
  const response = await axios.post(`${API_BASE_URL}/users/profile`, {
    clerkId,
    ...profile,
  });
  return response.data?.profile ?? null;
};

const isMissingProfileRouteError = (error) =>
  Number(error?.response?.status) === 404;

// ─────────────────────────────────────────────────────────────────────────────

const FitnessContext = ({ children, clerkUserId }) => {
  const [completed,          setCompleted]          = useState([]);
  const [workout,            setWorkout]            = useState(0);
  const [calories,           setCalories]           = useState(0);
  const [minutes,            setMinutes]            = useState(0);
  const [dayProgress,        setDayProgress]        = useState({});
  const [inProgressWorkout,  setInProgressWorkout]  = useState(null);
  const [userProfile,        setUserProfile]        = useState(null);
  const [isUserProfileHydrated, setIsUserProfileHydrated] = useState(false);
  const [programAdaptation, setProgramAdaptation] = useState({});
  const [isProgramAdaptationHydrated, setIsProgramAdaptationHydrated] = useState(false);
  const [restTimer,          setRestTimer]          = useState({
    isActive: false, endAt: null, timeLeft: 0, duration: 0,
  });

  // ── Load day progress ───────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const raw    = await readValueByKey(DAY_PROGRESS_STORAGE_KEY);
      const parsed = safeParseObject(raw);
      setDayProgress(parsed);
    };
    load();
  }, []);

  // ── Load in-progress workout ────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const raw = await readValueByKey(IN_PROGRESS_WORKOUT_STORAGE_KEY);
      if (!raw) { setInProgressWorkout(null); return; }
      try {
        const parsed = JSON.parse(raw);
        setInProgressWorkout(sanitizeInProgressWorkout(parsed));
      } catch {
        setInProgressWorkout(null);
      }
    };
    load();
  }, []);

  // ── Load user profile: local first → cloud wins if newer ───────────────────
  useEffect(() => {
    const load = async () => {
      const storageKey = getUserProfileStorageKey(clerkUserId);

      try {
        // 1. Read local cache immediately so the app is never blocked
        let raw   = await readValueByKey(storageKey);
        if (!raw && !clerkUserId) {
          // One-time migration from old shared key.
          const legacy = await readValueByKey(USER_PROFILE_STORAGE_KEY);
          if (legacy) {
            raw = legacy;
            await writeValueByKey(storageKey, legacy);
            await removeValueByKey(USER_PROFILE_STORAGE_KEY);
          }
        }
        const local = raw ? sanitizeUserProfile(safeParseObject(raw)) : null;
        setUserProfile(local);

        // 2. If signed in, fetch from cloud and use the more recent version
        if (clerkUserId) {
          try {
            const remote = await fetchProfileFromCloud(clerkUserId);
            if (remote) {
              const sanitizedRemote = sanitizeUserProfile(remote);
              if (sanitizedRemote) {
                const localTs  = new Date(local?.updatedAt  || 0).getTime();
                const remoteTs = new Date(sanitizedRemote.updatedAt || 0).getTime();

                if (remoteTs >= localTs) {
                  // Cloud is authoritative — update local cache to match
                  setUserProfile(sanitizedRemote);
                  writeValueByKey(storageKey, JSON.stringify(sanitizedRemote));
                }
              }
            }
          } catch (cloudError) {
            // If backend profile route is not implemented yet, quietly use local cache.
            if (!isMissingProfileRouteError(cloudError)) {
              console.warn("Could not sync profile from cloud:", cloudError.message);
            }
          }
        }
      } catch {
        setUserProfile(null);
      } finally {
        setIsUserProfileHydrated(true);
      }
    };

    load();
  }, [clerkUserId]);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setIsProgramAdaptationHydrated(false);
      setProgramAdaptation({});
      const storageKey = getProgramAdaptationStorageKey(clerkUserId);
      try {
        const raw = await readValueByKey(storageKey);
        const parsed = sanitizeProgramAdaptationMap(safeParseObject(raw));
        if (isActive) setProgramAdaptation(parsed);
      } catch {
        if (isActive) setProgramAdaptation({});
      } finally {
        if (isActive) setIsProgramAdaptationHydrated(true);
      }
    };

    load();
    return () => {
      isActive = false;
    };
  }, [clerkUserId]);

  // ── Persist helpers ─────────────────────────────────────────────────────────
  const persistDayProgress = useCallback((nextMap) => {
    writeValueByKey(DAY_PROGRESS_STORAGE_KEY, JSON.stringify(nextMap));
  }, []);

  const persistInProgressWorkout = useCallback((payload) => {
    if (!payload) { removeValueByKey(IN_PROGRESS_WORKOUT_STORAGE_KEY); return; }
    writeValueByKey(IN_PROGRESS_WORKOUT_STORAGE_KEY, JSON.stringify(payload));
  }, []);

  useEffect(() => {
    if (!isProgramAdaptationHydrated) return;
    const storageKey = getProgramAdaptationStorageKey(clerkUserId);
    writeValueByKey(storageKey, JSON.stringify(programAdaptation));
  }, [clerkUserId, isProgramAdaptationHydrated, programAdaptation]);

  // ── Day progress ────────────────────────────────────────────────────────────
  const markDayCompleted = useCallback((programKey, dayIndex) => {
    const safeProgramKey = String(programKey || "").trim();
    if (!safeProgramKey || !Number.isInteger(dayIndex) || dayIndex < 0) return;

    setDayProgress((prev) => {
      const existing = Array.isArray(prev[safeProgramKey]) ? prev[safeProgramKey] : [];
      if (existing.includes(dayIndex)) return prev;
      const next = { ...prev, [safeProgramKey]: [...existing, dayIndex].sort((a, b) => a - b) };
      persistDayProgress(next);
      return next;
    });
  }, [persistDayProgress]);

  const getCompletedDaysForProgram = useCallback((programKey) => {
    const safeProgramKey = String(programKey || "").trim();
    if (!safeProgramKey) return [];
    return Array.isArray(dayProgress[safeProgramKey]) ? dayProgress[safeProgramKey] : [];
  }, [dayProgress]);

  // ── In-progress workout ─────────────────────────────────────────────────────
  const saveInProgressWorkout = useCallback((payload) => {
    const sanitized = sanitizeInProgressWorkout(payload);
    if (!sanitized) return;
    setInProgressWorkout(sanitized);
    persistInProgressWorkout(sanitized);
  }, [persistInProgressWorkout]);

  const clearInProgressWorkout = useCallback(() => {
    setInProgressWorkout(null);
    persistInProgressWorkout(null);
  }, [persistInProgressWorkout]);

  const saveProgramAdaptation = useCallback((programKey, payload = {}) => {
    const safeProgramKey = normalizeProgramKey(programKey);
    if (!safeProgramKey || !payload || typeof payload !== "object") return;

    setProgramAdaptation((prev) => {
      const nextEntry = sanitizeProgramAdaptationMap({
        [safeProgramKey]: {
          ...(prev[safeProgramKey] || {}),
          ...payload,
          updatedAt: new Date().toISOString(),
        },
      })[safeProgramKey];
      if (!nextEntry) return prev;
      return { ...prev, [safeProgramKey]: nextEntry };
    });
  }, []);

  const getProgramAdaptation = useCallback((programKey) => {
    const safeProgramKey = normalizeProgramKey(programKey);
    if (!safeProgramKey) return null;
    return programAdaptation[safeProgramKey] || null;
  }, [programAdaptation]);

  const clearProgramAdaptation = useCallback((programKey = null) => {
    if (!programKey) {
      setProgramAdaptation({});
      return;
    }
    const safeProgramKey = normalizeProgramKey(programKey);
    if (!safeProgramKey) return;
    setProgramAdaptation((prev) => {
      if (!prev[safeProgramKey]) return prev;
      const next = { ...prev };
      delete next[safeProgramKey];
      return next;
    });
  }, []);

  // ── User profile ────────────────────────────────────────────────────────────
  const saveUserProfile = useCallback(async (payload) => {
    const sanitized = sanitizeUserProfile(payload);
    if (!sanitized) return false;
    const storageKey = getUserProfileStorageKey(clerkUserId);

    // 1. Update state + local cache immediately
    setUserProfile(sanitized);
    writeValueByKey(storageKey, JSON.stringify(sanitized));

    // 2. Push to cloud in the background if signed in
    if (clerkUserId) {
      try {
        await pushProfileToCloud(clerkUserId, sanitized);
      } catch (error) {
        // Non-blocking — local save already succeeded.
        if (!isMissingProfileRouteError(error)) {
          console.warn("Could not sync profile to cloud:", error.message);
        }
      }
    }

    return true;
  }, [clerkUserId]);

  const clearUserProfile = useCallback(() => {
    const storageKey = getUserProfileStorageKey(clerkUserId);
    const adaptationStorageKey = getProgramAdaptationStorageKey(clerkUserId);
    setUserProfile(null);
    setProgramAdaptation({});
    removeValueByKey(storageKey);
    removeValueByKey(adaptationStorageKey);
    // Note: we intentionally do NOT delete the cloud record so it can
    // be restored if the user signs back in on another device.
  }, [clerkUserId]);

  const isOnboardingComplete = useMemo(() => !!userProfile, [userProfile]);

  // ── Rest timer ──────────────────────────────────────────────────────────────
  const startRestTimer = useCallback((seconds = 15, forceRestart = true) => {
    const parsed     = Number(seconds);
    const safeSeconds = Number.isFinite(parsed) ? Math.max(1, Math.round(parsed)) : 15;

    setRestTimer((prev) => {
      if (prev.isActive && !forceRestart) return prev;
      const endAt = Date.now() + safeSeconds * 1000;
      return { isActive: true, endAt, timeLeft: safeSeconds, duration: safeSeconds };
    });
  }, []);

  const addRestTime = useCallback((seconds = 10) => {
    const parsed = Number(seconds);
    const delta  = Number.isFinite(parsed) ? Math.max(1, Math.round(parsed)) : 10;

    setRestTimer((prev) => {
      const baseEndAt  = prev.isActive && prev.endAt ? prev.endAt : Date.now();
      const nextEndAt  = baseEndAt + delta * 1000;
      const nextTimeLeft = Math.max(0, Math.ceil((nextEndAt - Date.now()) / 1000));
      return { isActive: true, endAt: nextEndAt, timeLeft: nextTimeLeft, duration: Math.max(prev.duration || 0, nextTimeLeft) };
    });
  }, []);

  const stopRestTimer = useCallback(() => {
    setRestTimer({ isActive: false, endAt: null, timeLeft: 0, duration: 0 });
  }, []);

  useEffect(() => {
    if (!restTimer.isActive || !restTimer.endAt) return;

    const interval = setInterval(() => {
      setRestTimer((prev) => {
        if (!prev.isActive || !prev.endAt) return prev;
        const nextTimeLeft = Math.max(0, Math.ceil((prev.endAt - Date.now()) / 1000));
        if (nextTimeLeft === prev.timeLeft) return prev;
        if (nextTimeLeft <= 0) return { ...prev, isActive: false, endAt: null, timeLeft: 0 };
        return { ...prev, timeLeft: nextTimeLeft };
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
        completed,        setCompleted,
        workout,          setWorkout,
        calories,         setCalories,
        minutes,          setMinutes,
        dayProgress,
        markDayCompleted,
        getCompletedDaysForProgram,
        inProgressWorkout,
        saveInProgressWorkout,
        clearInProgressWorkout,
        saveProgramAdaptation,
        getProgramAdaptation,
        clearProgramAdaptation,
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

export { FitnessContext, FitnessItems };
