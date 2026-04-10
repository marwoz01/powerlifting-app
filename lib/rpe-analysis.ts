import type { WorkoutLog, GeneratedProgram, LiftType } from './types';

/**
 * Get average RPE for a specific lift type across a range of weeks.
 * Only considers main/volume exercises with RPE >= 6.
 */
export function getAverageRPEForLift(
  logs: WorkoutLog[],
  program: GeneratedProgram,
  liftType: LiftType,
  fromWeek: number,
  toWeek: number
): number | null {
  const relevantLogs = logs.filter(
    (l) => l.completed && l.weekNumber >= fromWeek && l.weekNumber <= toWeek
  );

  const rpeValues: number[] = [];

  for (const log of relevantLogs) {
    const dayIndex = (log.weekNumber - 1) * 4 + (log.dayNumber - 1);
    const exercises = program.days[dayIndex]?.exercises ?? [];

    for (const set of log.sets) {
      const exercise = exercises.find((e) => e.id === set.exerciseId);
      if (!exercise?.liftType || exercise.liftType !== liftType) continue;
      if (exercise.tag !== 'main' && exercise.tag !== 'volume') continue;
      if (!set.rpe || set.rpe < 6) continue;
      rpeValues.push(set.rpe);
    }
  }

  if (rpeValues.length === 0) return null;
  return rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length;
}

/**
 * Get overall average RPE across all lifts for a range of weeks.
 * Used for fatigue scoring in deload decisions.
 */
export function getOverallAverageRPE(
  logs: WorkoutLog[],
  program: GeneratedProgram,
  fromWeek: number,
  toWeek: number
): number | null {
  const relevantLogs = logs.filter(
    (l) => l.completed && l.weekNumber >= fromWeek && l.weekNumber <= toWeek
  );

  const rpeValues: number[] = [];

  for (const log of relevantLogs) {
    const dayIndex = (log.weekNumber - 1) * 4 + (log.dayNumber - 1);
    const exercises = program.days[dayIndex]?.exercises ?? [];

    for (const set of log.sets) {
      const exercise = exercises.find((e) => e.id === set.exerciseId);
      if (!exercise) continue;
      if (exercise.tag !== 'main' && exercise.tag !== 'volume') continue;
      if (!set.rpe || set.rpe < 6) continue;
      rpeValues.push(set.rpe);
    }
  }

  if (rpeValues.length === 0) return null;
  return rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length;
}

/**
 * Calculate fatigue score from recent RPE data.
 * Uses weighted average (recent weeks count more).
 */
export function calculateFatigueScore(
  logs: WorkoutLog[],
  program: GeneratedProgram,
  currentWeek: number
): { score: number; weeksAboveThreshold: number } {
  const lookback = 3;
  const startWeek = Math.max(1, currentWeek - lookback + 1);

  const weeklyRPEs: number[] = [];
  for (let w = startWeek; w <= currentWeek; w++) {
    const weekRPE = getOverallAverageRPE(logs, program, w, w);
    if (weekRPE !== null) weeklyRPEs.push(weekRPE);
  }

  if (weeklyRPEs.length === 0) return { score: 0, weeksAboveThreshold: 0 };

  // Weighted average: more recent weeks have higher weight
  const weights = weeklyRPEs.length === 1
    ? [1]
    : weeklyRPEs.length === 2
      ? [0.35, 0.65]
      : [0.2, 0.3, 0.5];

  let score = 0;
  for (let i = 0; i < weeklyRPEs.length; i++) {
    score += weeklyRPEs[i] * weights[i];
  }

  const weeksAboveThreshold = weeklyRPEs.filter((r) => r > 8.5).length;

  return { score, weeksAboveThreshold };
}
