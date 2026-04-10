import type { WorkoutLog, GeneratedProgram, OneRepMaxes, DeloadDecision } from './types';
import { calculateFatigueScore } from './rpe-analysis';
import {
  getTopsetWeight,
  getBackoffWeight,
  getVolumeWeight,
  getTechnicalWeight,
} from './calculations';

type DeloadAction = 'skip' | 'convert-to-deload' | 'keep' | 'none';

/**
 * Evaluate whether to modify the next week's deload status.
 * Only runs when all 4 days of the current week are complete.
 *
 * Returns:
 * - 'skip': next week is a scheduled deload but lifter is fresh → convert to training
 * - 'convert-to-deload': next week is training but lifter is too fatigued → convert to deload
 * - 'keep': scheduled deload stays as-is
 * - 'none': no action needed
 */
export function evaluateDeload(
  program: GeneratedProgram,
  logs: WorkoutLog[],
  completedWeek: number
): DeloadAction {
  // Check if all 4 days of the week are logged
  const weekLogs = logs.filter(
    (l) => l.weekNumber === completedWeek && l.completed
  );
  if (weekLogs.length < 4) return 'none';

  const nextWeekIdx = completedWeek; // 0-based index of next week
  const nextWeek = program.weeks[nextWeekIdx];
  if (!nextWeek) return 'none';

  // Never touch test week
  if (nextWeek.phase === 'test') return 'none';

  const { score, weeksAboveThreshold } = calculateFatigueScore(
    logs,
    program,
    completedWeek
  );

  // Scenario A: next week is a scheduled deload
  if (nextWeek.isDeload && nextWeek.isScheduledDeload) {
    if (score < 7.5 && weeksAboveThreshold === 0) {
      return 'skip'; // lifter is fresh, skip the deload
    }
    return 'keep';
  }

  // Scenario B: next week is training but fatigue is too high
  if (!nextWeek.isDeload) {
    if (weeksAboveThreshold >= 3 && score > 8.5) {
      return 'convert-to-deload';
    }
  }

  return 'none';
}

/**
 * Apply a deload decision by converting the next week in-place.
 * - 'skip': Convert deload → light training week (parameters from following phase, -3%)
 * - 'convert-to-deload': Convert training → deload (3×3 @ 65%)
 *
 * Recalculates all exercise weights for the modified week.
 */
export function applyDeloadDecision(
  program: GeneratedProgram,
  completedWeek: number,
  decision: 'skip' | 'convert-to-deload',
  maxes: OneRepMaxes
): GeneratedProgram {
  const updatedProgram = {
    ...program,
    weeks: [...program.weeks],
    days: [...program.days],
    deloadHistory: [...(program.deloadHistory ?? [])],
  };

  const nextWeekIdx = completedWeek; // 0-based
  const nextWeek = { ...updatedProgram.weeks[nextWeekIdx] };

  const { score } = calculateFatigueScore(
    [], // not needed for logging, already computed
    program,
    completedWeek
  );

  if (decision === 'skip') {
    // Convert deload to light training week
    // Take parameters from the phase after the deload, but 3pp lower
    const phaseAfter = updatedProgram.weeks[nextWeekIdx + 1];
    if (phaseAfter) {
      nextWeek.phase = phaseAfter.phase;
      nextWeek.sets = phaseAfter.sets;
      nextWeek.reps = phaseAfter.reps;
      nextWeek.percentage = Math.max(0.60, phaseAfter.percentage - 0.03);
      nextWeek.isDeload = false;
    }
  } else if (decision === 'convert-to-deload') {
    // Convert training week to deload
    nextWeek.phase = 'deload';
    nextWeek.sets = 3;
    nextWeek.reps = 3;
    nextWeek.percentage = 0.65;
    nextWeek.isDeload = true;
  }

  updatedProgram.weeks[nextWeekIdx] = nextWeek;

  // Recalculate exercise weights for the modified week
  const baseIndex = nextWeekIdx * 4;
  for (let d = 0; d < 4; d++) {
    const dayIndex = baseIndex + d;
    const day = updatedProgram.days[dayIndex];
    if (!day) continue;

    updatedProgram.days[dayIndex] = {
      ...day,
      exercises: day.exercises.map((ex) => {
        // Update sets/reps for main/volume exercises
        const result = { ...ex };

        if (ex.liftType && ex.weightType) {
          const oneRM = maxes[ex.liftType];

          // Recalculate weight
          switch (ex.weightType) {
            case 'topset': {
              result.plannedWeight = getTopsetWeight(oneRM, nextWeek.percentage);
              result.plannedSets = ex.tag === 'main' ? nextWeek.sets : result.plannedSets;
              result.plannedReps = ex.tag === 'main' ? nextWeek.reps : result.plannedReps;
              if (result.isBackoff) {
                result.backoffWeight = getBackoffWeight(result.plannedWeight);
                result.backoffSets = result.plannedSets;
                result.backoffReps = result.plannedReps + 2;
              }
              break;
            }
            case 'volume': {
              result.plannedWeight = getVolumeWeight(oneRM, nextWeek.percentage);
              result.plannedSets = nextWeek.sets;
              result.plannedReps = nextWeek.reps + 1;
              break;
            }
            case 'technical':
              result.plannedWeight = getTechnicalWeight(oneRM);
              break;
          }
        }

        return result;
      }),
    };
  }

  // Log the decision
  const deloadEntry: DeloadDecision = {
    afterWeek: completedWeek,
    action: decision,
    fatigueScore: score,
    date: new Date().toISOString(),
  };
  updatedProgram.deloadHistory.push(deloadEntry);

  return updatedProgram;
}
