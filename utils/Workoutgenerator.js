/**
 * workoutGenerator.js
 * Rule-based personalized workout plan generator.
 * Uses onboarding profile data to curate a weekly plan from API exercise data.
 */

import { api } from '../config/api';

// ─── Focus area → exercise category mapping ──────────────────────────────────
const FOCUS_TO_CATEGORY = {
  chest:     'chest',
  back:      'back',
  shoulders: 'shoulders',
  arms:      'arms',
  abs:       'abs',
  glutes:    'legs',   // glutes exercises live under legs category
  legs:      'legs',
  full_body: 'full body',
};

const CATEGORY_TO_BODY_PARTS = {
  'full body': ['chest', 'back', 'upper legs', 'shoulders', 'upper arms', 'waist'],
  chest: ['chest'],
  back: ['back'],
  shoulders: ['shoulders'],
  arms: ['upper arms'],
  abs: ['waist'],
  legs: ['upper legs', 'lower legs'],
};

const CATEGORY_LABEL_TO_BODY_PARTS = {
  chest: ['chest'],
  back: ['back'],
  shoulders: ['shoulders'],
  shoulder: ['shoulders'],
  abs: ['waist'],
  core: ['waist'],
  arms: ['upper arms'],
  arm: ['upper arms'],
  legs: ['upper legs', 'lower legs'],
  glutes: ['upper legs'],
  lower_body: ['upper legs', 'lower legs'],
  upper_body: ['chest', 'back', 'shoulders', 'upper arms'],
  cardio: ['full_body'],
  full_body: ['full_body'],
};

const LEVEL_TO_DIFFICULTY = {
  beginner: 'beginner',
  intermediate: 'intermediate',
  advanced: 'advanced',
};

const EQUIPMENT_ALIAS = {
  bodyweight: 'body weight',
  dumbbells: 'dumbbell',
  cables: 'cable',
  machines: 'machine',
  resistance: 'resistance band',
  pullup_bar: 'pull up bar',
  smith: 'smith machine',
};

const EQUIPMENT_ALIASES = {
  barbell: ['barbell'],
  dumbbells: ['dumbbell'],
  cables: ['cable'],
  machines: ['machine'],
  kettlebell: ['kettlebell'],
  pullup_bar: ['pull up bar'],
  bench: ['bench'],
  smith: ['smith machine'],
  bodyweight: ['body weight'],
  resistance: ['resistance band'],
};

const LIMITATION_RULES = {
  knee_pain: {
    blockedCategories: ['legs'],
    blockedBodyParts: ['upper legs', 'lower legs'],
    blockedKeywords: ['jump', 'box jump', 'burpee', 'lunge', 'pistol squat'],
  },
  lower_back_pain: {
    blockedCategories: ['back'],
    blockedBodyParts: ['back'],
    blockedKeywords: ['deadlift', 'good morning', 'hyperextension', 'back extension'],
  },
  shoulder_pain: {
    blockedCategories: ['shoulders'],
    blockedBodyParts: ['shoulders'],
    blockedKeywords: ['overhead press', 'upright row', 'snatch', 'shoulder press'],
  },
  wrist_pain: {
    blockedCategories: [],
    blockedBodyParts: [],
    blockedKeywords: ['push up', 'plank', 'dip', 'handstand', 'burpee'],
  },
  ankle_pain: {
    blockedCategories: ['legs'],
    blockedBodyParts: ['lower legs'],
    blockedKeywords: ['jump', 'run', 'sprint', 'jump rope', 'box jump'],
  },
};

const LIMITATION_ALIASES = {
  knee: 'knee_pain',
  knee_discomfort: 'knee_pain',
  lower_back: 'lower_back_pain',
  back_pain: 'lower_back_pain',
  shoulder: 'shoulder_pain',
  shoulder_discomfort: 'shoulder_pain',
  wrist: 'wrist_pain',
  wrist_discomfort: 'wrist_pain',
  ankle: 'ankle_pain',
  ankle_discomfort: 'ankle_pain',
};

// ─── Config tables ────────────────────────────────────────────────────────────

/** Weekly training days based on activity level */
const WEEKLY_DAYS = {
  sedentary:   3,
  light:       4,
  moderate:    4,
  very_active: 5,
};

/** Sets/reps per goal */
const GOAL_PARAMS = {
  lose_weight:      { sets: 3, reps: 15, rest: 45,  intensity: 'high'   },
  build_muscle:     { sets: 4, reps: 10, rest: 90,  intensity: 'medium' },
  gain_weight:      { sets: 5, reps: 8,  rest: 120, intensity: 'heavy'  },
  maintain_fitness: { sets: 3, reps: 12, rest: 60,  intensity: 'medium' },
};

const MICRO_CYCLE = [
  { week: 1, phase: 'foundation', volume: 0.95, rest: 1.05 },
  { week: 2, phase: 'build', volume: 1.0, rest: 1.0 },
  { week: 3, phase: 'overreach', volume: 1.08, rest: 0.95 },
  { week: 4, phase: 'deload', volume: 0.82, rest: 1.15 },
];

const MESO_CYCLE = [
  { week: 1, phase: 'base',      volume: 0.92, intensity: 0.9,  rest: 1.06 },
  { week: 2, phase: 'base',      volume: 0.97, intensity: 0.94, rest: 1.03 },
  { week: 3, phase: 'base',      volume: 1.0,  intensity: 0.98, rest: 1.0 },
  { week: 4, phase: 'build',     volume: 1.02, intensity: 1.0,  rest: 0.98 },
  { week: 5, phase: 'build',     volume: 1.05, intensity: 1.03, rest: 0.97 },
  { week: 6, phase: 'build',     volume: 1.08, intensity: 1.05, rest: 0.96 },
  { week: 7, phase: 'intensify', volume: 1.0,  intensity: 1.08, rest: 1.0 },
  { week: 8, phase: 'intensify', volume: 0.98, intensity: 1.1,  rest: 1.02 },
  { week: 9, phase: 'intensify', volume: 0.95, intensity: 1.12, rest: 1.04 },
  { week: 10, phase: 'restore',  volume: 0.88, intensity: 0.92, rest: 1.12 },
  { week: 11, phase: 'restore',  volume: 0.84, intensity: 0.88, rest: 1.15 },
  { week: 12, phase: 'restore',  volume: 0.9,  intensity: 0.9,  rest: 1.1 },
];

/** Exercise count per session based on fitness level */
const EXERCISES_PER_DAY = {
  beginner:     5,
  intermediate: 7,
  advanced:     9,
};

/** Training splits by goal + weekly days */
const SPLITS = {
  lose_weight: {
    3: ['full body', 'full body', 'full body'],
    4: ['full body', 'upper body', 'full body', 'lower body'],
    5: ['full body', 'upper body', 'full body', 'lower body', 'full body'],
  },
  build_muscle: {
    3: ['push', 'pull', 'legs'],
    4: ['push', 'pull', 'legs', 'upper body'],
    5: ['push', 'pull', 'legs', 'push', 'pull'],
  },
  gain_weight: {
    3: ['push', 'pull', 'legs'],
    4: ['push', 'pull', 'legs', 'upper body'],
    5: ['push', 'pull', 'legs', 'push', 'pull'],
  },
  maintain_fitness: {
    3: ['full body', 'full body', 'full body'],
    4: ['upper body', 'lower body', 'full body', 'cardio'],
    5: ['upper body', 'lower body', 'full body', 'cardio', 'full body'],
  },
};

/** Day type → exercise categories to pull from */
const DAY_TYPE_CATEGORIES = {
  'full body':   ['full body', 'chest', 'legs', 'arms', 'back', 'shoulders'],
  'upper body':  ['chest', 'arms', 'back', 'shoulders'],
  'lower body':  ['legs'],
  'push':        ['chest', 'shoulders', 'arms'],
  'pull':        ['back', 'arms'],
  'legs':        ['legs'],
  'cardio':      ['full body'],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns true if the exercise can be performed with the user's available equipment.
 */
function canPerformExercise(exercise, userEquipment) {
  const needed = Array.isArray(exercise?.equipmentList)
    ? exercise.equipmentList
    : [];
  if (!needed.length) return true;
  if (needed.includes('body weight')) return true;
  return needed.some((eq) => userEquipment.includes(eq));
}

/**
 * Adjusts an exercise's sets/reps based on goal & fitness level.
 */
function applyParams(exercise, goalParams, fitnessLevel, goal, options = {}) {
  const base = { ...exercise };
  const { dayIndex = 0, weeklyDays = 4 } = options;
  const dayProgression = weeklyDays > 1 ? dayIndex / (weeklyDays - 1) : 0;
  const daySetBump = dayProgression > 0.65 ? 1 : 0;
  const cyclePhase = normalizeKey(goalParams?.mesoCyclePhase || goalParams?.microCyclePhase || '');
  const loadBias = Number(goalParams?.loadBias) || 1;
  const phaseRepBump =
    cyclePhase === 'intensify'
      ? -1
      : cyclePhase === 'restore' || cyclePhase === 'deload'
        ? 1
        : 0;

  // Override sets
  base.sets = goalParams.sets + daySetBump;

  // Cardio work is time-based; strength work is reps-based.
  if (base.apiCategory === 'cardio') {
    base.type = 'time';
    const baseDuration = goal === 'lose_weight' ? 45 : 30;
    const cardioBias = Number(goalParams.cardioBias) || 1;
    base.duration = Math.round(baseDuration * cardioBias);
    delete base.reps;
  } else if (!exercise.duration) {
    base.type = 'reps';
    base.reps = clampNumber(goalParams.reps + phaseRepBump, 6, 24);
  } else {
    base.type = 'time';
  }

  // Beginners do fewer reps/sets
  if (fitnessLevel === 'beginner') {
    base.sets = Math.max(2, goalParams.sets - 1);
    if (!exercise.duration) base.reps = Math.max(8, goalParams.reps - 3);
  }

  // Advanced athletes get bonus sets
  if (fitnessLevel === 'advanced') {
    base.sets = goalParams.sets + 1;
  }

  base.rest = goalParams.rest;
  base.rpeTarget = Number((goalParams.rpeTarget || 7).toFixed(1));
  if (base.type === 'reps') {
    const intensityByGoal = {
      lose_weight: 0.62,
      maintain_fitness: 0.68,
      build_muscle: 0.74,
      gain_weight: 0.8,
    };
    const baseIntensity = intensityByGoal[goal] || 0.7;
    base.intensityPct1RM = clampNumber(Math.round(baseIntensity * loadBias * 100), 55, 92);
  }
  base.goalTag = goal;
  base.gifUrl = base.gifUrl || base.image || '';

  return base;
}

/**
 * Shuffle an array deterministically for repeatable plans.
 */
function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function resolveMicroCycle(updatedAt, nowTime = Date.now()) {
  const reference = updatedAt ? new Date(updatedAt) : new Date();
  const referenceTime = Number.isNaN(reference.getTime()) ? Date.now() : reference.getTime();
  const diffDays = Math.max(0, Math.floor((nowTime - referenceTime) / 86400000));
  const index = Math.floor(diffDays / 7) % MICRO_CYCLE.length;
  return MICRO_CYCLE[index];
}

function resolveMesoCycle(updatedAt, nowTime = Date.now()) {
  const reference = updatedAt ? new Date(updatedAt) : new Date();
  const referenceTime = Number.isNaN(reference.getTime()) ? Date.now() : reference.getTime();
  const diffDays = Math.max(0, Math.floor((nowTime - referenceTime) / 86400000));
  const totalWeeks = Math.floor(diffDays / 7);
  const index = totalWeeks % MESO_CYCLE.length;
  const cycleNumber = Math.floor(totalWeeks / MESO_CYCLE.length) + 1;
  return {
    ...MESO_CYCLE[index],
    cycleNumber,
    totalWeeks,
  };
}

function resolveProfileModifiers(userProfile) {
  const age = Number(userProfile?.age);
  const bodyFat = Number(userProfile?.bodyFat);
  const activityLevel = normalizeKey(userProfile?.activityLevel);
  const workoutLocation = normalizeKey(userProfile?.workoutLocation || userProfile?.trainArea);
  const weight = Number(userProfile?.weight);
  const weightUnit = normalizeKey(userProfile?.weightUnit || 'kg');
  const gender = normalizeKey(userProfile?.gender);
  const equipmentCount = Array.isArray(userProfile?.equipment)
    ? userProfile.equipment.filter(Boolean).length
    : 0;

  let volume = 1;
  let rest = 1;
  let cardioBias = 1;
  let exerciseCountDelta = 0;

  const weightKg = Number.isFinite(weight)
    ? (weightUnit === 'lb' || weightUnit === 'lbs' ? weight * 0.45359237 : weight)
    : null;

  if (Number.isFinite(age) && age >= 45) {
    volume *= 0.92;
    rest *= 1.1;
    exerciseCountDelta -= 1;
  }

  if (activityLevel === 'sedentary' || activityLevel === 'light') {
    volume *= 0.95;
  } else if (activityLevel === 'very_active') {
    volume *= 1.05;
    exerciseCountDelta += 1;
  }

  if (Number.isFinite(bodyFat) && bodyFat >= 30) {
    const highBodyFatThreshold = gender === 'female'
      ? 36
      : gender === 'male'
        ? 28
        : 32;
    if (bodyFat >= highBodyFatThreshold) {
      cardioBias *= 1.16;
      rest *= 1.04;
    } else {
      cardioBias *= 1.08;
    }
  }

  if (Number.isFinite(weightKg)) {
    if (weightKg <= 52) {
      volume *= 0.96;
      rest *= 1.05;
    } else if (weightKg >= 110) {
      volume *= 0.93;
      rest *= 1.08;
      cardioBias *= 1.05;
    }
  }

  if (workoutLocation === 'outdoors') {
    cardioBias *= 1.15;
  } else if (workoutLocation === 'home' && equipmentCount <= 1) {
    exerciseCountDelta -= 1;
  } else if (workoutLocation === 'gym') {
    exerciseCountDelta += 1;
  }

  return {
    volume,
    rest,
    cardioBias,
    exerciseCountDelta,
  };
}

function resolveGoalParams(goal, userProfile, adaptation = {}) {
  const base = GOAL_PARAMS[goal] ?? GOAL_PARAMS.maintain_fitness;
  const referenceDate = adaptation?.referenceDate ? new Date(adaptation.referenceDate).getTime() : Date.now();
  const nowTime = Number.isFinite(referenceDate) ? referenceDate : Date.now();
  const cycle = resolveMicroCycle(userProfile?.updatedAt, nowTime);
  const mesoCycle = resolveMesoCycle(userProfile?.updatedAt, nowTime);
  const modifiers = resolveProfileModifiers(userProfile);
  const adherenceRate = Number(adaptation?.adherenceRate);
  const validAdherence = Number.isFinite(adherenceRate)
    ? clampNumber(adherenceRate, 0, 1)
    : null;
  const adherenceVolume = validAdherence === null
    ? 1
    : validAdherence >= 0.75
      ? 1.05
      : validAdherence <= 0.35
        ? 0.9
        : 1;
  const avgRpe = Number(adaptation?.avgRpe);
  const avgDifficultyScore = Number(adaptation?.avgDifficultyScore);
  const avgCompletionRate = Number(adaptation?.avgCompletionRate);
  const painPointsCount = Array.isArray(adaptation?.painPoints) ? adaptation.painPoints.length : 0;
  const fatigueSignals = [
    adaptation?.reportedFatigue === true,
    Number.isFinite(avgRpe) && avgRpe >= 8,
    Number.isFinite(avgDifficultyScore) && avgDifficultyScore >= 2.4,
    Number.isFinite(avgCompletionRate) && avgCompletionRate <= 0.65,
    painPointsCount > 0,
  ].filter(Boolean).length;
  const fatiguePenalty = fatigueSignals >= 2 ? 0.86 : fatigueSignals === 1 ? 0.93 : 1;
  const fatigueRestBoost = fatigueSignals >= 2 ? 1.15 : fatigueSignals === 1 ? 1.08 : 1;
  const readinessBonus = (
    (validAdherence === null || validAdherence >= 0.8) &&
    Number.isFinite(avgRpe) &&
    avgRpe <= 6.5 &&
    Number.isFinite(avgDifficultyScore) &&
    avgDifficultyScore <= 1.8
  ) ? 1.04 : 1;

  return {
    sets: clampNumber(
      Math.round(
        base.sets *
        cycle.volume *
        mesoCycle.volume *
        modifiers.volume *
        adherenceVolume *
        fatiguePenalty *
        readinessBonus
      ),
      2,
      7
    ),
    reps: clampNumber(
      Math.round(
        base.reps *
        cycle.volume *
        mesoCycle.volume *
        modifiers.volume *
        adherenceVolume *
        fatiguePenalty
      ),
      6,
      20
    ),
    rest: clampNumber(
      Math.round(
        base.rest *
        cycle.rest *
        mesoCycle.rest *
        modifiers.rest *
        fatigueRestBoost
      ),
      30,
      210
    ),
    intensity: base.intensity,
    cardioBias: modifiers.cardioBias,
    loadBias: clampNumber(mesoCycle.intensity * readinessBonus * (1 / Math.max(fatiguePenalty, 0.85)), 0.75, 1.2),
    rpeTarget: clampNumber(
      (mesoCycle.phase === 'intensify' ? 8 : mesoCycle.phase === 'restore' ? 6.5 : 7.2) - (fatigueSignals >= 2 ? 0.6 : 0),
      5.5,
      9
    ),
    microCycleWeek: cycle.week,
    microCyclePhase: cycle.phase,
    mesoCycleWeek: mesoCycle.week,
    mesoCyclePhase: mesoCycle.phase,
    mesoCycleLength: MESO_CYCLE.length,
    exerciseCountDelta: modifiers.exerciseCountDelta,
  };
}

function applySafetyConstraints(exercises, userProfile, options = {}) {
  const safeExercises = Array.isArray(exercises) ? exercises : [];
  const age = Number(userProfile?.age);
  const preferredDifficulty = LEVEL_TO_DIFFICULTY[normalizeKey(userProfile?.fitnessLevel)] || '';
  const resolvedLimitations = Array.isArray(options?.limitations)
    ? options.limitations
    : resolveAdaptiveLimitations(userProfile, options?.adaptation);
  const { blockedBodyParts, blockedKeywords } = buildLimitationSets(resolvedLimitations);

  return safeExercises.filter((exercise) => {
    const difficulty = normalizeText(exercise?.difficulty);
    const bodyParts = unique(
      [normalizeBodyPart(exercise?.bodyPart), ...(exercise?.bodyParts || []).map(normalizeBodyPart)]
        .filter(Boolean)
    );
    const textBlob = normalizeText(
      `${exercise?.name || ''} ${exercise?.target || ''} ${exercise?.category || ''} ${exercise?.apiCategory || ''}`
    );

    if (bodyParts.some((part) => blockedBodyParts.has(part))) return false;
    for (const keyword of blockedKeywords) {
      if (textBlob.includes(keyword)) return false;
    }

    if (preferredDifficulty && difficulty) {
      const distance = getDifficultyDistance(difficulty, preferredDifficulty);
      if (distance > 1) return false;
    }

    if ((preferredDifficulty === 'beginner' || (Number.isFinite(age) && age >= 45)) && difficulty === 'advanced') {
      return false;
    }

    return true;
  });
}

/**
 * Maps a "day type" to relevant exercise categories,
 * then biases towards the user's focus areas.
 */
function getCategoriesForDay(dayType, focusAreas) {
  const base = DAY_TYPE_CATEGORIES[dayType] || ['full body'];

  // Intersect with user's focus area categories if defined
  if (focusAreas && focusAreas.length > 0) {
    const focusCats = focusAreas.map((f) => FOCUS_TO_CATEGORY[f]).filter(Boolean);

    // For focused day types, weight results toward focus areas
    const weighted = [...base];
    focusCats.forEach((cat) => {
      if (base.includes(cat)) {
        weighted.push(cat); // push again to double the weight
      }
    });
    return weighted;
  }

  return base;
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_');
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function normalizeLimitations(limitations) {
  const values = unique(
    (Array.isArray(limitations) ? limitations : [])
      .map((entry) => LIMITATION_ALIASES[normalizeKey(entry)] || normalizeKey(entry))
      .filter(Boolean)
  );
  if (values.includes('none')) return [];
  return values.filter((entry) => LIMITATION_RULES[entry]);
}

function resolveAdaptiveLimitations(userProfile, adaptation = {}) {
  const profileLimitations = Array.isArray(userProfile?.limitations) ? userProfile.limitations : [];
  const adaptationPainPoints = Array.isArray(adaptation?.painPoints) ? adaptation.painPoints : [];
  const contraindications = Array.isArray(adaptation?.contraindications) ? adaptation.contraindications : [];
  return normalizeLimitations([...profileLimitations, ...adaptationPainPoints, ...contraindications]);
}

function buildLimitationSets(limitations) {
  const normalized = normalizeLimitations(limitations);
  const blockedCategories = new Set();
  const blockedBodyParts = new Set();
  const blockedKeywords = new Set();

  normalized.forEach((key) => {
    const rule = LIMITATION_RULES[key];
    if (!rule) return;
    (rule.blockedCategories || []).forEach((entry) => blockedCategories.add(normalizeText(entry)));
    (rule.blockedBodyParts || []).forEach((entry) => blockedBodyParts.add(normalizeBodyPart(entry)));
    (rule.blockedKeywords || []).forEach((entry) => blockedKeywords.add(normalizeText(entry)));
  });

  return { blockedCategories, blockedBodyParts, blockedKeywords };
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeBodyPart(value) {
  const key = normalizeKey(value);
  if (!key) return '';

  const aliases = {
    abs: 'waist',
    abdomen: 'waist',
    core: 'waist',
    waist: 'waist',
    arm: 'upper arms',
    arms: 'upper arms',
    biceps: 'upper arms',
    triceps: 'upper arms',
    chest: 'chest',
    back: 'back',
    shoulder: 'shoulders',
    shoulders: 'shoulders',
    leg: 'upper legs',
    legs: 'upper legs',
    glute: 'upper legs',
    glutes: 'upper legs',
    hamstrings: 'upper legs',
    quads: 'upper legs',
    calves: 'lower legs',
    upper_legs: 'upper legs',
    lower_legs: 'lower legs',
    full_body: 'full_body',
    fullbody: 'full_body',
    cardio: 'full_body',
  };

  return aliases[key] || key.replace(/_/g, ' ');
}

function getBodyPartsFromLabel(label) {
  const key = normalizeKey(label);
  if (!key) return [];

  if (CATEGORY_LABEL_TO_BODY_PARTS[key]) return CATEGORY_LABEL_TO_BODY_PARTS[key];

  const bySubstring = Object.keys(CATEGORY_LABEL_TO_BODY_PARTS).find((tag) =>
    key.includes(tag)
  );
  return bySubstring ? CATEGORY_LABEL_TO_BODY_PARTS[bySubstring] : [];
}

function getPreferredBodyParts(profile, categoryLabel, listLabel) {
  const fromFocus = unique(
    (Array.isArray(profile?.focusAreas) ? profile.focusAreas : [])
      .flatMap((focus) => CATEGORY_TO_BODY_PARTS[FOCUS_TO_CATEGORY[normalizeKey(focus)]] || [])
      .map(normalizeBodyPart)
  );

  const fromCategory = unique(
    [...getBodyPartsFromLabel(categoryLabel), ...getBodyPartsFromLabel(listLabel)].map(normalizeBodyPart)
  );

  const specificCategory = fromCategory.filter((part) => part && part !== 'full_body');
  const specificFocus = fromFocus.filter((part) => part && part !== 'full_body');

  if (specificCategory.length) return unique([...specificCategory, ...specificFocus]);
  if (specificFocus.length) return specificFocus;

  const normalizedFallback = normalizeBodyPart(listLabel);
  if (normalizedFallback && normalizedFallback !== 'full_body') return [normalizedFallback];

  return ['chest', 'back', 'upper legs', 'waist'];
}

function getPreferredEquipment(equipmentValues) {
  return unique(
    (Array.isArray(equipmentValues) ? equipmentValues : [])
      .flatMap((entry) => {
        const key = normalizeKey(entry);
        if (EQUIPMENT_ALIASES[key]) return EQUIPMENT_ALIASES[key];
        const normalized = EQUIPMENT_ALIAS[key] || normalizeText(entry).replace(/_/g, ' ');
        return normalized ? [normalized] : [];
      })
      .map((item) => normalizeText(item))
  );
}

function getDifficultyDistance(left, right) {
  const order = { beginner: 0, intermediate: 1, advanced: 2 };
  if (!(left in order) || !(right in order)) return 99;
  return Math.abs(order[left] - order[right]);
}

function hashString(value) {
  const input = String(value || '');
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function normalizeUserEquipment(equipment) {
  const list = Array.isArray(equipment) ? equipment : ['bodyweight'];
  return [...new Set(
    list
      .map((item) => normalizeText(item))
      .map((item) => EQUIPMENT_ALIAS[item] || item)
      .filter(Boolean)
  )];
}

function mapBodyPartToCategory(bodyPart) {
  const v = normalizeText(bodyPart);
  if (v === 'chest') return 'chest';
  if (v === 'back') return 'back';
  if (v === 'shoulders') return 'shoulders';
  if (v === 'upper arms') return 'arms';
  if (v === 'waist') return 'abs';
  if (v === 'upper legs' || v === 'lower legs') return 'legs';
  return 'full body';
}

function mapApiExercise(exercise) {
  const bodyParts = unique(
    (Array.isArray(exercise?.bodyParts) ? exercise.bodyParts : []).map((part) => normalizeBodyPart(part))
  );
  const equipment = unique(
    (Array.isArray(exercise?.equipment) ? exercise.equipment : []).map((item) => normalizeText(item))
  );
  const primaryBodyPart = bodyParts[0] || '';
  const category = mapBodyPartToCategory(primaryBodyPart);
  const image = exercise?.gif_url || exercise?.images?.[0] || '';
  return {
    id: String(exercise?.id || ''),
    name: String(exercise?.name || '').trim(),
    category,
    bodyPart: primaryBodyPart,
    bodyParts,
    apiCategory: normalizeText(exercise?.category),
    difficulty: normalizeText(exercise?.difficulty),
    image,
    gifUrl: image,
    equipment: equipment[0] || '',
    equipmentList: equipment,
    tips: Array.isArray(exercise?.instructions) ? exercise.instructions.slice(0, 3) : [],
    instructions: Array.isArray(exercise?.instructions) ? exercise.instructions : [],
    secondaryMuscles: Array.isArray(exercise?.secondaryMuscles) ? exercise.secondaryMuscles : [],
    target: Array.isArray(exercise?.primaryMuscles) ? exercise.primaryMuscles[0] || '' : '',
    sets: 10,
  };
}

function normalizeInjectedExercise(exercise, index = 0) {
  if (!exercise || typeof exercise !== 'object') return null;

  if (exercise.primaryMuscles || exercise.secondaryMuscles || exercise.gif_url || exercise.images) {
    return mapApiExercise(exercise);
  }

  const name = String(exercise.name || '').trim();
  if (!name) return null;
  const bodyPart = normalizeBodyPart(exercise.bodyPart || exercise.target || '');
  const bodyParts = unique(
    [
      bodyPart,
      ...(Array.isArray(exercise.bodyParts) ? exercise.bodyParts : []).map((entry) => normalizeBodyPart(entry)),
    ].filter(Boolean)
  );
  const equipmentList = unique(
    (Array.isArray(exercise.equipmentList)
      ? exercise.equipmentList
      : exercise.equipment
        ? [exercise.equipment]
        : [])
      .map((entry) => normalizeText(entry))
      .filter(Boolean)
  );
  const category = normalizeText(exercise.category || mapBodyPartToCategory(bodyPart));
  const apiCategory = normalizeText(exercise.apiCategory || exercise.category || '');
  const image = exercise.gifUrl || exercise.image || '';

  return {
    id: String(exercise.id || `seed-${index}-${normalizeKey(name)}`),
    name,
    category,
    bodyPart,
    bodyParts,
    apiCategory,
    difficulty: normalizeText(exercise.difficulty),
    image,
    gifUrl: image,
    equipment: equipmentList[0] || normalizeText(exercise.equipment || ''),
    equipmentList,
    tips: Array.isArray(exercise.tips) ? exercise.tips : [],
    instructions: Array.isArray(exercise.instructions) ? exercise.instructions : [],
    secondaryMuscles: Array.isArray(exercise.secondaryMuscles) ? exercise.secondaryMuscles : [],
    target: exercise.target || '',
    sets: clampNumber(Math.round(Number(exercise.sets) || 3), 2, 7),
  };
}

async function fetchApiExercisePool({
  split,
  focusAreas,
  fitnessLevel,
  equipment,
  bodyPartsOverride = null,
  difficultyOverride = null,
  limitPerQuery = 60,
}) {
  const difficulty = difficultyOverride || LEVEL_TO_DIFFICULTY[fitnessLevel] || 'beginner';
  const normalizedEquipment = getPreferredEquipment(equipment);
  if (!normalizedEquipment.length) normalizedEquipment.push('body weight');
  const equipmentFilter = normalizedEquipment.find((item) => item !== 'body weight') || normalizedEquipment[0] || null;

  const categoriesNeeded = Array.isArray(split)
    ? [...new Set(
      split
        .flatMap((dayType) => DAY_TYPE_CATEGORIES[dayType] || [])
        .concat((focusAreas || []).map((f) => FOCUS_TO_CATEGORY[f]).filter(Boolean))
    )]
    : [];

  const bodyPartsNeeded = Array.isArray(bodyPartsOverride) && bodyPartsOverride.length
    ? unique(bodyPartsOverride.map((part) => normalizeBodyPart(part)).filter((part) => part && part !== 'full_body'))
    : [...new Set(
      categoriesNeeded
        .flatMap((category) => CATEGORY_TO_BODY_PARTS[category] || [])
        .filter((bodyPart) => bodyPart && bodyPart !== 'full body')
    )];

  if (!bodyPartsNeeded.length) bodyPartsNeeded.push('chest', 'back', 'upper legs', 'waist');

  const requests = bodyPartsNeeded.map((bodyPart) =>
    api.getFiltered({
      bodyPart,
      difficulty,
      equipment: equipmentFilter,
      limit: limitPerQuery,
    })
  );

  const settled = await Promise.allSettled(requests);
  const merged = [];
  settled.forEach((result) => {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      merged.push(...result.value);
    }
  });

  const uniqueById = new Map();
  merged.forEach((exercise) => {
    if (!exercise?.id) return;
    if (!uniqueById.has(exercise.id)) uniqueById.set(exercise.id, exercise);
  });

  let pool = Array.from(uniqueById.values()).map(mapApiExercise).filter((ex) => ex.id && ex.name);
  if (!pool.length && bodyPartsNeeded[0]) {
    const fallback = await api.getByBodyPart(bodyPartsNeeded[0], limitPerQuery);
    pool = (Array.isArray(fallback) ? fallback : []).map(mapApiExercise).filter((ex) => ex.id && ex.name);
  }

  return { pool, normalizedEquipment };
}

// ─── Main generator ───────────────────────────────────────────────────────────

/**
 * generateWorkoutPlan(userProfile)
 *
 * Returns a plan object:
 * {
 *   name: string,
 *   category: string,
 *   image: string,
 *   weeklyDays: number,
 *   daysPerWeek: string,
 *   description: string,
 *   days: [
 *     {
 *       id: string,
 *       name: string,
 *       focus: string,
 *       sets: number,
 *       exercises: [ { id, name, sets, reps?, duration?, rest, image, tips, ... } ]
 *     }
 *   ]
 * }
 */
export async function generateWorkoutPlan(userProfile, options = {}) {
  if (!userProfile) return null;

  const {
    goal           = 'maintain_fitness',
    fitnessLevel   = 'beginner',
    activityLevel  = 'moderate',
    focusAreas     = [],
    equipment      = ['bodyweight'],
  } = userProfile;
  const adaptation = options?.adaptation && typeof options.adaptation === 'object'
    ? options.adaptation
    : options;
  const effectiveLimitations = resolveAdaptiveLimitations(userProfile, adaptation);
  const profileModifiers = resolveProfileModifiers(userProfile);

  // ── 1. Resolve weekly frequency ──
  const weeklyDays = WEEKLY_DAYS[activityLevel] ?? 3;

  // ── 2. Resolve goal params ──
  const goalParams = resolveGoalParams(goal, userProfile, adaptation);

  // ── 3. Resolve split ──
  const split =
    SPLITS[goal]?.[weeklyDays] ??
    SPLITS.maintain_fitness[3];

  // ── 4. Resolve exercises per day ──
  const exPerDay = clampNumber(
    (EXERCISES_PER_DAY[fitnessLevel] ?? 6) + profileModifiers.exerciseCountDelta,
    4,
    11
  );

  // ── 5. Fetch API pool and filter by available equipment ──
  const normalizedEquipment = getPreferredEquipment(equipment);
  if (!normalizedEquipment.length) normalizedEquipment.push('body weight');
  const injectedPool = Array.isArray(options?.exercisePool)
    ? options.exercisePool
        .map((exercise, index) => normalizeInjectedExercise(exercise, index))
        .filter(Boolean)
    : [];
  const fetchedPool = injectedPool.length
    ? injectedPool
    : (await fetchApiExercisePool({
        split,
        focusAreas,
        fitnessLevel,
        equipment,
      })).pool;
  const safePool = applySafetyConstraints(fetchedPool, userProfile, { limitations: effectiveLimitations, adaptation });
  const availableExercises = safePool.filter((ex) =>
    canPerformExercise(ex, normalizedEquipment)
  );
  if (!availableExercises.length) return null;

  // ── 6. Seed for reproducible plan (changes monthly so plan rotates) ──
  const seedDate = options?.seedDate ? new Date(options.seedDate) : new Date();
  const now = Number.isNaN(seedDate.getTime()) ? new Date() : seedDate;
  const seed = now.getFullYear() * 100 + now.getMonth() + (goal.charCodeAt(0) || 0);

  // ── 7. Build each training day ──
  // Prefer unseen exercises across the week before reusing any.
  const { blockedCategories } = buildLimitationSets(effectiveLimitations);
  const usedExerciseIds = new Set();
  const days = split.map((dayType, index) => {
    const categories = getCategoriesForDay(dayType, focusAreas);
    const safeCategories = categories.filter((entry) => !blockedCategories.has(normalizeText(entry)));
    const categoriesToUse = safeCategories.length ? safeCategories : categories;

    // Pull exercises that match the day's categories
    let pool = availableExercises.filter((ex) => categoriesToUse.includes(ex.category));

    // Fallback: if no exercises match, use full pool
    if (pool.length < 3) pool = availableExercises;

    // Shuffle pool with a day-specific seed for variety across days
    const shuffled = seededShuffle(pool, seed + index * 37);

    // Pick exercises up to limit, prioritizing ones not used on prior days.
    const fresh = shuffled.filter((ex) => !usedExerciseIds.has(ex.id));
    const recycled = shuffled.filter((ex) => usedExerciseIds.has(ex.id));
    const picked = [...fresh, ...recycled].slice(0, exPerDay);
    picked.forEach((exercise) => usedExerciseIds.add(exercise.id));

    // Apply sets/reps based on goal + level
    const exercises = picked.map((ex) =>
      applyParams(ex, goalParams, fitnessLevel, goal, {
        dayIndex: index,
        weeklyDays,
      })
    );

    // Build a human-readable day name
    const dayName = buildDayName(dayType, index, focusAreas);

    return {
      id:        `day_${index + 1}`,
      name:      `Day ${index + 1} — ${dayName}`,
      focus:     dayType,
      sets:      goalParams.sets,
      exercises,
    };
  });

  // ── 8. Build the plan shell ──
  const planMeta = buildPlanMeta(goal, fitnessLevel, weeklyDays, focusAreas);

  return {
    ...planMeta,
    weeklyDays,
    daysPerWeek: `${weeklyDays} days / week`,
    days,
    generatedAt: new Date().toISOString(),
    isPersonalized: true,
    progression: {
      week: goalParams.mesoCycleWeek,
      phase: goalParams.mesoCyclePhase,
      microWeek: goalParams.microCycleWeek,
      microPhase: goalParams.microCyclePhase,
      cycleLength: goalParams.mesoCycleLength,
    },
    periodization: {
      model: 'mesocycle',
      lengthWeeks: goalParams.mesoCycleLength,
      currentWeek: goalParams.mesoCycleWeek,
      currentPhase: goalParams.mesoCyclePhase,
      phases: ['base', 'build', 'intensify', 'restore'],
    },
  };
}

// ─── Meta helpers ─────────────────────────────────────────────────────────────

function buildDayName(dayType, index, focusAreas) {
  const DAY_LABELS = {
    'full body':   'Full Body',
    'upper body':  'Upper Body',
    'lower body':  'Lower Body',
    'push':        'Push',
    'pull':        'Pull',
    'legs':        'Legs',
    'cardio':      'Cardio & Core',
  };

  return DAY_LABELS[dayType] ?? 'Training';
}

function buildPlanMeta(goal, fitnessLevel, weeklyDays, focusAreas) {
  const PLAN_NAMES = {
    lose_weight:      'Fat Burn Protocol',
    build_muscle:     'Hypertrophy Blueprint',
    gain_weight:      'Mass Builder',
    maintain_fitness: 'Balanced Fitness Plan',
  };

  const PLAN_DESCRIPTIONS = {
    lose_weight:
      'High-rep, short-rest sessions designed to maximise calorie burn and preserve lean muscle.',
    build_muscle:
      'Volume-focused splits with progressive overload to drive hypertrophy and muscle growth.',
    gain_weight:
      'Heavy compound lifts with sufficient volume to stimulate mass gain and strength.',
    maintain_fitness:
      'Balanced mix of strength and conditioning to keep you healthy, mobile, and consistent.',
  };

  const PLAN_IMAGES = {
    lose_weight:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
    build_muscle:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    gain_weight:
      'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=800',
    maintain_fitness:
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800',
  };

  return {
    name:        PLAN_NAMES[goal]        ?? 'My Custom Plan',
    description: PLAN_DESCRIPTIONS[goal] ?? 'Your personalised training plan.',
    image:       PLAN_IMAGES[goal]       ?? PLAN_IMAGES.maintain_fitness,
    category:    goal.replace(/_/g, ' '),
  };
}

function normalizeTemplateExercise(exercise, index, goalParams, fitnessLevel, goal, options = {}) {
  if (!exercise || typeof exercise !== 'object') return null;
  const name = String(exercise.name || '').trim();
  if (!name) return null;

  const mapped = {
    id: exercise.id || `local-${index}-${normalizeKey(name)}`,
    name,
    category: normalizeText(exercise.category || ''),
    apiCategory: normalizeText(exercise.category || ''),
    bodyPart: normalizeBodyPart(exercise.bodyPart || exercise.target || ''),
    bodyParts: normalizeBodyPart(exercise.bodyPart || exercise.target || '')
      ? [normalizeBodyPart(exercise.bodyPart || exercise.target || '')]
      : [],
    equipment: normalizeText(exercise.equipment || ''),
    equipmentList: exercise.equipment ? [normalizeText(exercise.equipment)] : [],
    difficulty: normalizeText(exercise.difficulty || ''),
    image: exercise.image || exercise.gifUrl || '',
    gifUrl: exercise.gifUrl || exercise.image || '',
    target: exercise.target || '',
    tips: Array.isArray(exercise.tips) ? exercise.tips : [],
    instructions: Array.isArray(exercise.instructions) ? exercise.instructions : [],
    secondaryMuscles: Array.isArray(exercise.secondaryMuscles) ? exercise.secondaryMuscles : [],
  };

  if (exercise.type === 'time' || Number(exercise.duration) > 0) {
    return {
      ...mapped,
      type: 'time',
      duration: clampNumber(Math.round(Number(exercise.duration) || 30), 15, 180),
      sets: clampNumber(Math.round(Number(exercise.sets) || goalParams.sets), 2, 7),
      rest: clampNumber(Math.round(Number(exercise.rest) || goalParams.rest), 30, 210),
    };
  }

  return applyParams(mapped, goalParams, fitnessLevel, goal, options);
}

function scoreTemplateExercise(exercise, context, dayIndex, dayMeta = null) {
  let score = 0;
  const exerciseBodyParts = unique(
    [normalizeBodyPart(exercise?.bodyPart), ...(exercise?.bodyParts || []).map(normalizeBodyPart)].filter(Boolean)
  );
  const exerciseEquipment = unique((exercise?.equipmentList || []).map((value) => normalizeText(value)));
  const exerciseDifficulty = normalizeKey(exercise?.difficulty);
  const exerciseCategory = normalizeKey(exercise?.apiCategory || exercise?.category);

  const {
    preferredBodyParts,
    categoryBodyParts,
    preferredEquipment,
    preferredDifficulty,
    goal,
    categoryLabel,
    listLabel,
    workoutLocation,
  } = context;

  const dayTargets = dayMeta
    ? getBodyPartsFromLabel(dayMeta.focus || dayMeta.name || '')
        .map((part) => normalizeBodyPart(part))
        .filter(Boolean)
    : [];

  if (preferredBodyParts.length) {
    const dayTarget = preferredBodyParts[dayIndex % preferredBodyParts.length];
    if (dayTarget && exerciseBodyParts.includes(dayTarget)) score += 12;
    if (exerciseBodyParts.some((part) => preferredBodyParts.includes(part))) score += 24;
    else score -= 3;
  }

  if (dayTargets.length) {
    if (exerciseBodyParts.some((part) => dayTargets.includes(part))) score += 18;
    else score -= 6;
  }

  if (categoryBodyParts.some((part) => part !== 'full_body')) {
    if (exerciseBodyParts.some((part) => categoryBodyParts.includes(part))) score += 30;
    else score -= 12;
  }

  if (preferredEquipment.length) {
    if (exerciseEquipment.some((item) => preferredEquipment.includes(item))) score += 22;
    else if (exerciseEquipment.includes('body weight')) score += 8;
    else score -= 8;
  }

  if (preferredDifficulty) {
    if (exerciseDifficulty === preferredDifficulty) score += 18;
    else if (getDifficultyDistance(exerciseDifficulty, preferredDifficulty) === 1) score += 8;
    else score -= 3;
  }

  if (goal === 'lose_weight') {
    score += exerciseCategory === 'cardio' ? 18 : 8;
  } else if (goal === 'gain_weight' || goal === 'build_muscle') {
    score += exerciseCategory === 'strength' ? 18 : 4;
  } else {
    score += 10;
  }

  if (workoutLocation === 'outdoors') {
    if (exerciseCategory === 'cardio') score += 10;
    if (exerciseEquipment.some((item) => ['machine', 'smith machine', 'cable'].includes(item))) score -= 16;
  } else if (workoutLocation === 'home') {
    if (exerciseEquipment.some((item) => ['machine', 'smith machine'].includes(item))) score -= 14;
  }

  score += (hashString(`${exercise?.id || exercise?.name}-${dayIndex}-${categoryLabel}-${listLabel}`) % 1000) / 1000;
  return score;
}

/**
 * Shared engine for category/template-based programs on Days screen.
 * Returns API-personalized exercises aligned to the same profile model as Personalized plan.
 */
export async function generateProgramDaysFromTemplate({
  programDays = [],
  userProfile,
  categoryLabel = '',
  listLabel = '',
  adaptation = {},
  exercisePool = null,
}) {
  const safeProgramDays = Array.isArray(programDays) ? programDays : [];
  if (!safeProgramDays.length) return { days: [], meta: { source: 'template-empty' } };

  const goal = normalizeKey(userProfile?.goal) || 'maintain_fitness';
  const fitnessLevel = normalizeKey(userProfile?.fitnessLevel) || 'beginner';
  const goalParams = resolveGoalParams(goal, userProfile, adaptation);
  const effectiveLimitations = resolveAdaptiveLimitations(userProfile, adaptation);
  const preferredBodyParts = getPreferredBodyParts(userProfile, categoryLabel, listLabel).slice(0, 4);
  const categoryBodyParts = unique(
    [...getBodyPartsFromLabel(categoryLabel), ...getBodyPartsFromLabel(listLabel)]
      .map(normalizeBodyPart)
      .filter(Boolean)
  );
  const preferredEquipment = getPreferredEquipment(userProfile?.equipment).slice(0, 3);
  const preferredDifficulty = LEVEL_TO_DIFFICULTY[fitnessLevel] || 'beginner';

  const totalNeeded = safeProgramDays.reduce((total, day) => total + (day?.exercises?.length || 0), 0);
  const queryLimit = Math.min(Math.max(totalNeeded * 2, 24), 100);
  const querySource = categoryBodyParts.some((part) => part !== 'full_body')
    ? categoryBodyParts
    : preferredBodyParts;
  const bodyPartQueries = querySource.filter((bodyPart) => bodyPart !== 'full_body');

  const injectedPool = Array.isArray(exercisePool)
    ? exercisePool
        .map((exercise, index) => normalizeInjectedExercise(exercise, index))
        .filter(Boolean)
    : [];
  const { pool } = injectedPool.length
    ? { pool: injectedPool }
    : await fetchApiExercisePool({
        split: [],
        focusAreas: [],
        fitnessLevel,
        equipment: preferredEquipment.length ? preferredEquipment : userProfile?.equipment,
        bodyPartsOverride: bodyPartQueries,
        difficultyOverride: preferredDifficulty,
        limitPerQuery: queryLimit,
      });

  const safePool = applySafetyConstraints(pool, userProfile, {
    limitations: effectiveLimitations,
    adaptation,
  });
  const basePool = (Array.isArray(safePool) ? safePool : []).filter((exercise) => exercise && exercise.name && exercise.gifUrl);
  const context = {
    preferredBodyParts,
    categoryBodyParts,
    preferredEquipment,
    preferredDifficulty,
    goal,
    categoryLabel,
    listLabel,
    workoutLocation: normalizeKey(userProfile?.workoutLocation || userProfile?.trainArea),
  };

  const usedExerciseIds = new Set();
  const days = safeProgramDays.map((day, dayIndex) => {
    const localExercises = applySafetyConstraints((Array.isArray(day?.exercises) ? day.exercises : [])
      .map((exercise, index) =>
        normalizeTemplateExercise(
          exercise,
          index,
          goalParams,
          fitnessLevel,
          goal,
          { dayIndex, weeklyDays: safeProgramDays.length }
        )
      )
      .filter(Boolean), userProfile, {
        limitations: effectiveLimitations,
        adaptation,
      });

    const desiredCount = Math.max(1, localExercises.length || 5);
    if (!basePool.length) {
      return {
        ...day,
        exercises: localExercises,
      };
    }

    const ranked = basePool
      .map((exercise) => ({
        ...exercise,
        _score: scoreTemplateExercise(exercise, context, dayIndex, day),
      }))
      .sort((a, b) => b._score - a._score);

    const selected = [];
    const seenNames = new Set();
    const fresh = ranked.filter((exercise) => !usedExerciseIds.has(exercise.id));
    const recycled = ranked.filter((exercise) => usedExerciseIds.has(exercise.id));
    const ordered = [...fresh, ...recycled];
    for (const exercise of ordered) {
      const key = normalizeKey(exercise.name);
      if (!key || seenNames.has(key)) continue;
      selected.push(
        applyParams(exercise, goalParams, fitnessLevel, goal, {
          dayIndex,
          weeklyDays: safeProgramDays.length,
        })
      );
      seenNames.add(key);
      usedExerciseIds.add(exercise.id);
      if (selected.length >= desiredCount) break;
    }

    if (selected.length < desiredCount) {
      for (const exercise of localExercises) {
        const key = normalizeKey(exercise.name);
        if (!key || seenNames.has(key)) continue;
        selected.push(exercise);
        seenNames.add(key);
        if (selected.length >= desiredCount) break;
      }
    }

    return {
      ...day,
      exercises: selected.length ? selected : localExercises,
      sets: goalParams.sets,
    };
  });

  return {
    days,
    meta: {
      source: basePool.length ? 'api' : 'template',
      progression: {
        week: goalParams.mesoCycleWeek,
        phase: goalParams.mesoCyclePhase,
        microWeek: goalParams.microCycleWeek,
        microPhase: goalParams.microCyclePhase,
        cycleLength: goalParams.mesoCycleLength,
      },
      periodization: {
        model: 'mesocycle',
        lengthWeeks: goalParams.mesoCycleLength,
        currentWeek: goalParams.mesoCycleWeek,
        currentPhase: goalParams.mesoCyclePhase,
      },
    },
  };
}

// ─── Weekly schedule helper ───────────────────────────────────────────────────

/**
 * Maps the generated training days to Mon–Sun.
 * Rest days are automatically inserted.
 *
 * Returns an array of 7 objects:
 * { day: 'Mon', label: 'Day 1 — Full Body', isRest: false, dayData: {...} | null }
 */
export function buildWeeklySchedule(plan) {
  if (!plan) return [];

  const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const { days, weeklyDays } = plan;

  // Spread training days evenly across the week
  const trainingIndices = spreadDays(weeklyDays);

  return WEEK.map((label, i) => {
    const trainIdx = trainingIndices.indexOf(i);
    const isTraining = trainIdx !== -1;

    return {
      day:     label,
      isRest:  !isTraining,
      label:   isTraining ? days[trainIdx]?.name ?? 'Training' : 'Rest',
      dayData: isTraining ? days[trainIdx] : null,
    };
  });
}

export function buildPlanSnapshot(plan) {
  if (!plan || !Array.isArray(plan.days)) return null;
  return {
    name: plan.name,
    weeklyDays: plan.weeklyDays,
    progression: plan.progression || null,
    daySignatures: plan.days.map((day) => ({
      id: day.id,
      focus: day.focus,
      sets: day.sets,
      exerciseNames: (Array.isArray(day.exercises) ? day.exercises : [])
        .slice(0, 5)
        .map((exercise) => normalizeKey(exercise?.name)),
    })),
  };
}

/** Spread n training days evenly across a 7-day week starting Monday */
function spreadDays(n) {
  if (!Number.isFinite(n) || n <= 0) return [];
  const slots = [];
  const gap = 7 / n;
  for (let i = 0; i < n; i++) {
    slots.push(Math.round(i * gap));
  }
  return slots;
}
