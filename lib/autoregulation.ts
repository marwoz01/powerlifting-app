import type { WorkoutLog, GeneratedProgram, OneRepMaxes, LiftType } from './types';
import { getAverageRPEForLift } from './rpe-analysis';
import {
  roundTo2_5,
  getTopsetWeight,
  getBackoffWeight,
  getVolumeWeight,
  getTechnicalWeight,
} from './calculations';

/** Estimate e1RM from a single set using Epley + RPE */
export function estimateE1RM(weight: number, reps: number, rpe: number): number {
  if (weight <= 0 || reps <= 0 || rpe < 6) return 0;
  const rir = Math.max(0, 10 - rpe);
  const effectiveReps = reps + rir;
  if (effectiveReps <= 1) return weight;
  return weight * (1 + effectiveReps / 30);
}

/**
 * Find the best e1RM estimate for a lift from recent workout logs.
 * Looks at the last 2 completed weeks for that lift's topset exercises.
 */
function getBestE1RM(
  logs: WorkoutLog[],
  program: GeneratedProgram,
  liftType: LiftType,
  upToWeek: number
): number | null {
  const recentLogs = logs.filter(
    (l) => l.completed && l.weekNumber >= Math.max(1, upToWeek - 1) && l.weekNumber <= upToWeek
  );

  let best = 0;

  for (const log of recentLogs) {
    const dayIndex = (log.weekNumber - 1) * 4 + (log.dayNumber - 1);
    const dayExercises = program.days[dayIndex]?.exercises ?? [];

    for (const set of log.sets) {
      const exercise = dayExercises.find((e) => e.id === set.exerciseId);
      if (!exercise?.liftType || exercise.liftType !== liftType) continue;
      if (exercise.weightType !== 'topset' && exercise.weightType !== 'volume') continue;
      if (!set.rpe || set.rpe < 6) continue;

      const e1rm = estimateE1RM(set.actualWeight, set.actualReps, set.rpe);
      if (e1rm > best) best = e1rm;
    }
  }

  return best > 0 ? best : null;
}

/**
 * Calculate adjusted maxes based on RPE data from completed workouts.
 * Uses exponential smoothing: moves 50% toward the estimated value
 * when difference exceeds 2%.
 */
export function calculateAdjustedMaxes(
  logs: WorkoutLog[],
  program: GeneratedProgram,
  completedWeek: number
): OneRepMaxes | null {
  const currentMaxes = program.effectiveOneRepMaxes ?? program.baseOneRepMaxes;
  let changed = false;
  const adjusted = { ...currentMaxes };

  for (const lift of ['squat', 'bench', 'deadlift'] as const) {
    const e1rm = getBestE1RM(logs, program, lift, completedWeek);
    if (!e1rm) continue;

    const current = currentMaxes[lift];
    const diff = e1rm - current;
    const diffPercent = Math.abs(diff) / current;

    if (diffPercent > 0.02) {
      adjusted[lift] = roundTo2_5(current + diff * 0.5);
      changed = true;
    }
  }

  return changed ? adjusted : null;
}

/**
 * Recalculate planned weights in the program for all weeks from `fromWeek` onwards,
 * using the new effective maxes. Preserves exercise IDs and structure.
 */
export function recalculateWeights(
  program: GeneratedProgram,
  fromWeek: number,
  newMaxes: OneRepMaxes
): GeneratedProgram {
  const updatedDays = [...program.days];

  for (let w = fromWeek; w <= program.weeks.length; w++) {
    const weekInfo = program.weeks[w - 1];
    const baseIndex = (w - 1) * 4;

    for (let d = 0; d < 4; d++) {
      const dayIndex = baseIndex + d;
      const day = updatedDays[dayIndex];
      if (!day) continue;

      updatedDays[dayIndex] = {
        ...day,
        exercises: day.exercises.map((ex) => {
          if (!ex.liftType || !ex.weightType) return ex;

          const oneRM = newMaxes[ex.liftType];
          const result = { ...ex };

          switch (ex.weightType) {
            case 'topset': {
              const topset = getTopsetWeight(oneRM, weekInfo.percentage);
              result.plannedWeight = topset;
              if (ex.isBackoff) {
                result.backoffWeight = getBackoffWeight(topset);
              }
              break;
            }
            case 'volume':
              result.plannedWeight = getVolumeWeight(oneRM, weekInfo.percentage);
              break;
            case 'technical':
              result.plannedWeight = getTechnicalWeight(oneRM);
              break;
          }

          return result;
        }),
      };
    }
  }

  return {
    ...program,
    days: updatedDays,
    effectiveOneRepMaxes: { ...newMaxes },
  };
}

const MIN_SETS = 2;
const MAX_SETS = 6;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Adjust volume (number of sets) based on RPE trends.
 * - avgRPE < 7: too easy → add 1 set to main/volume exercises for that lift
 * - avgRPE > 9: too hard → remove 1 set
 * Only modifies future non-deload weeks.
 */
export function adjustVolume(
  program: GeneratedProgram,
  logs: WorkoutLog[],
  completedWeek: number
): GeneratedProgram | null {
  const weekInfo = program.weeks[completedWeek - 1];
  if (!weekInfo || weekInfo.isDeload) return null;

  const lookbackStart = Math.max(1, completedWeek - 1);
  let changed = false;
  const updatedDays = [...program.days];

  for (const liftType of ['squat', 'bench', 'deadlift'] as const) {
    const avgRPE = getAverageRPEForLift(logs, program, liftType, lookbackStart, completedWeek);
    if (avgRPE === null) continue;

    let deltaSet = 0;
    if (avgRPE < 7.0) deltaSet = 1;
    else if (avgRPE > 9.0) deltaSet = -1;
    if (deltaSet === 0) continue;

    for (let w = completedWeek + 1; w <= program.weeks.length; w++) {
      if (program.weeks[w - 1].isDeload) continue;
      const baseIndex = (w - 1) * 4;

      for (let d = 0; d < 4; d++) {
        const dayIndex = baseIndex + d;
        const day = updatedDays[dayIndex];
        if (!day) continue;

        let dayChanged = false;
        const updatedExercises = day.exercises.map((ex) => {
          if (ex.liftType !== liftType) return ex;
          if (ex.tag !== 'main' && ex.tag !== 'volume') return ex;

          const newSets = clamp(ex.plannedSets + deltaSet, MIN_SETS, MAX_SETS);
          if (newSets === ex.plannedSets) return ex;

          dayChanged = true;
          const result = { ...ex, plannedSets: newSets };
          if (result.isBackoff && result.backoffSets) {
            result.backoffSets = clamp(result.backoffSets + deltaSet, MIN_SETS, MAX_SETS);
          }
          return result;
        });

        if (dayChanged) {
          changed = true;
          updatedDays[dayIndex] = { ...day, exercises: updatedExercises };
        }
      }
    }
  }

  return changed ? { ...program, days: updatedDays } : null;
}
