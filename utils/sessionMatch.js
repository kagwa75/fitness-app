export const isMatchingSession = ({ routeParams, currentUserId, saved, exercises, getExerciseName }) => { 
        if (!saved) return false;
        const savedOwner = String(saved.clerkUserId || '').trim();
        const currentOwner = String(currentUserId || '').trim();
        if (savedOwner && savedOwner !== currentOwner) {
            return false;
        }
        const routeDayIndex = Number.isInteger(routeParams.dayIndex) ? routeParams.dayIndex : null;
        const savedDayIndex = Number.isInteger(saved.dayIndex) ? saved.dayIndex : null;
        if (routeDayIndex == null || savedDayIndex == null || routeDayIndex !== savedDayIndex) {
            return false;
        }

        const routeProgramKey = String(routeParams?.programKey || '').trim();
        const savedProgramKey = String(saved.programKey || '').trim();
        if (routeProgramKey && savedProgramKey && routeProgramKey !== savedProgramKey) {
            return false;
        }
        const routeProgramMode = String(routeParams?.programMode || '').trim();
        const savedProgramMode = String(saved.programMode || '').trim();
        if (routeProgramMode && savedProgramMode && routeProgramMode !== savedProgramMode) {
            return false;
        }
        const routeNames = (exercises || []).map(getExerciseName).filter(Boolean);
        const savedNames = (saved.exercises || []).map(getExerciseName).filter(Boolean);
        if (!routeNames.length || routeNames.length !== savedNames.length) return false;
        return routeNames.every((name, index) => name === savedNames[index]);
    }