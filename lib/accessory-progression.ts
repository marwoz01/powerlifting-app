import type { Exercise, LoggedSet, AccessoryProgressionState } from './types';
import { roundTo2_5 } from './calculations';

const LOWER_PATTERNS = ['squat', 'leg', 'hip', 'adduct', 'przywodz', 'hamstring', 'rdl', 'glute', 'hack', 'nóg', 'nog'];
const UPPER_PATTERNS = ['bench', 'press', 'push', 'pull', 'row', 'curl', 'fly', 'face', 'tricep', 'delt', 'lat', 'wrist', 'forearm', 'przedrami', 'wiosł'];

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function getIncrement(exerciseName: string): number {
  const n = normalizeName(exerciseName);
  if (LOWER_PATTERNS.some((p) => n.includes(p))) return 5;
  return 2.5;
}

/**
 * Update accessory progression state after a completed workout.
 * Tracks consecutive sessions where all reps were completed at a given weight,
 * and suggests a weight increase after 2 successful sessions.
 */
export function updateAccessoryAfterWorkout(
  currentState: AccessoryProgressionState,
  exercises: Exercise[],
  loggedSets: LoggedSet[]
): AccessoryProgressionState {
  const newState = { ...currentState };

  for (const exercise of exercises) {
    if (exercise.tag !== 'accessory' && exercise.tag !== 'supplemental') continue;

    const key = normalizeName(exercise.name);
    const setsForEx = loggedSets.filter((s) => s.exerciseId === exercise.id);
    if (setsForEx.length === 0) continue;

    const weightUsed = Math.max(...setsForEx.map((s) => s.actualWeight));
    if (weightUsed <= 0) continue;

    const allRepsHit = setsForEx.every((s) => s.actualReps >= s.plannedReps);

    const prev = newState[key] ?? { lastWeight: 0, consecutiveCompletions: 0, suggestedWeight: 0 };

    if (weightUsed >= prev.lastWeight && allRepsHit) {
      prev.consecutiveCompletions += 1;
    } else {
      prev.consecutiveCompletions = 0;
    }

    prev.lastWeight = weightUsed;

    if (prev.consecutiveCompletions >= 2) {
      const increment = getIncrement(exercise.name);
      prev.suggestedWeight = roundTo2_5(weightUsed + increment);
      prev.consecutiveCompletions = 0;
    } else if (prev.suggestedWeight < weightUsed) {
      prev.suggestedWeight = weightUsed;
    }

    newState[key] = { ...prev };
  }

  return newState;
}

/** Get suggested weight for an accessory exercise */
export function getSuggestedWeight(
  state: AccessoryProgressionState,
  exerciseName: string
): number | null {
  const key = normalizeName(exerciseName);
  const entry = state[key];
  if (!entry) return null;
  if (entry.suggestedWeight > 0) return entry.suggestedWeight;
  if (entry.lastWeight > 0) return entry.lastWeight;
  return null;
}
