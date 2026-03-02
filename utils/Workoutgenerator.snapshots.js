import { buildPlanSnapshot, generateWorkoutPlan, generateProgramDaysFromTemplate } from './Workoutgenerator';

const FIXED_DATE = '2026-01-12T00:00:00.000Z';

const SEEDED_POOL = [
  { id: 'e1', name: 'Push-up', bodyPart: 'chest', bodyParts: ['chest'], category: 'chest', apiCategory: 'strength', equipment: 'body weight', equipmentList: ['body weight'], difficulty: 'beginner', gifUrl: 'https://example.com/1.gif' },
  { id: 'e2', name: 'Bodyweight Squat', bodyPart: 'upper legs', bodyParts: ['upper legs'], category: 'legs', apiCategory: 'strength', equipment: 'body weight', equipmentList: ['body weight'], difficulty: 'beginner', gifUrl: 'https://example.com/2.gif' },
  { id: 'e3', name: 'Mountain Climber', bodyPart: 'waist', bodyParts: ['waist'], category: 'abs', apiCategory: 'cardio', equipment: 'body weight', equipmentList: ['body weight'], difficulty: 'beginner', gifUrl: 'https://example.com/3.gif' },
  { id: 'e4', name: 'Dumbbell Row', bodyPart: 'back', bodyParts: ['back'], category: 'back', apiCategory: 'strength', equipment: 'dumbbell', equipmentList: ['dumbbell'], difficulty: 'intermediate', gifUrl: 'https://example.com/4.gif' },
  { id: 'e5', name: 'Shoulder Tap Plank', bodyPart: 'shoulders', bodyParts: ['shoulders'], category: 'shoulders', apiCategory: 'strength', equipment: 'body weight', equipmentList: ['body weight'], difficulty: 'beginner', gifUrl: 'https://example.com/5.gif' },
  { id: 'e6', name: 'Reverse Lunge', bodyPart: 'upper legs', bodyParts: ['upper legs'], category: 'legs', apiCategory: 'strength', equipment: 'body weight', equipmentList: ['body weight'], difficulty: 'beginner', gifUrl: 'https://example.com/6.gif' },
  { id: 'e7', name: 'Burpee', bodyPart: 'full_body', bodyParts: ['full_body'], category: 'full body', apiCategory: 'cardio', equipment: 'body weight', equipmentList: ['body weight'], difficulty: 'intermediate', gifUrl: 'https://example.com/7.gif' },
  { id: 'e8', name: 'Deadlift', bodyPart: 'back', bodyParts: ['back'], category: 'back', apiCategory: 'strength', equipment: 'barbell', equipmentList: ['barbell'], difficulty: 'advanced', gifUrl: 'https://example.com/8.gif' },
];

export async function runWorkoutGeneratorSnapshotChecks() {
  const profile = {
    updatedAt: '2025-11-01T00:00:00.000Z',
    goal: 'build_muscle',
    fitnessLevel: 'intermediate',
    activityLevel: 'moderate',
    focusAreas: ['chest', 'back', 'legs'],
    equipment: ['bodyweight', 'dumbbells'],
    workoutLocation: 'home',
    age: 31,
    weight: 82,
    weightUnit: 'kg',
    bodyFat: 21,
    gender: 'male',
    limitations: ['none'],
  };

  const plan = await generateWorkoutPlan(profile, {
    exercisePool: SEEDED_POOL,
    seedDate: FIXED_DATE,
    referenceDate: FIXED_DATE,
  });
  const snapshot = buildPlanSnapshot(plan);

  const templatePlan = await generateProgramDaysFromTemplate({
    programDays: [
      { name: 'Day 1 - Upper Body', focus: 'upper_body', exercises: [{ name: 'Push-up', bodyPart: 'chest', equipment: 'body weight', difficulty: 'beginner' }] },
      { name: 'Day 2 - Lower Body', focus: 'lower_body', exercises: [{ name: 'Bodyweight Squat', bodyPart: 'upper legs', equipment: 'body weight', difficulty: 'beginner' }] },
    ],
    userProfile: profile,
    categoryLabel: 'full body',
    listLabel: 'starter',
    adaptation: { referenceDate: FIXED_DATE },
    exercisePool: SEEDED_POOL,
  });

  return {
    personalized: snapshot,
    template: {
      source: templatePlan?.meta?.source,
      progression: templatePlan?.meta?.progression,
      dayExerciseCounts: (templatePlan?.days || []).map((day) => day?.exercises?.length || 0),
    },
  };
}
