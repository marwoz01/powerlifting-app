import type { UserSettings, GeneratedProgram, WorkoutLog, AccessoryProgressionState } from './types';
import { calculateAdjustedMaxes, recalculateWeights, adjustVolume } from './autoregulation';
import { evaluateDeload, applyDeloadDecision } from './deload-manager';

const KEYS = {
  settings: 'pl-settings',
  program: 'pl-program',
  logs: 'pl-workout-logs',
  programHistory: 'pl-program-history',
  accessoryProgress: 'pl-accessory-progress',
} as const;

function safeGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage full or unavailable
  }
}

// --- User Settings ---

export function getUserSettings(): UserSettings | null {
  return safeGet<UserSettings>(KEYS.settings);
}

export function saveUserSettings(settings: UserSettings): void {
  safeSet(KEYS.settings, settings);
}

export function isOnboardingComplete(): boolean {
  const settings = getUserSettings();
  return settings?.onboardingComplete ?? false;
}

// --- Program ---

export function getProgram(): GeneratedProgram | null {
  return safeGet<GeneratedProgram>(KEYS.program);
}

export function saveProgram(program: GeneratedProgram): void {
  safeSet(KEYS.program, program);
}

/** Swap an exercise by name across all weeks in the program */
export function swapExerciseInProgram(
  oldName: string,
  newName: string,
  newNote?: string
): void {
  const program = getProgram();
  if (!program) return;

  for (const day of program.days) {
    for (const ex of day.exercises) {
      if (ex.name === oldName) {
        ex.name = newName;
        if (newNote) ex.note = newNote;
      }
    }
  }
  saveProgram(program);
}

// --- Workout Logs ---

export function getWorkoutLogs(): WorkoutLog[] {
  return safeGet<WorkoutLog[]>(KEYS.logs) ?? [];
}

export function saveWorkoutLog(log: WorkoutLog): void {
  const logs = getWorkoutLogs();
  const existingIndex = logs.findIndex((l) => l.id === log.id);
  if (existingIndex >= 0) {
    logs[existingIndex] = log;
  } else {
    logs.push(log);
  }
  safeSet(KEYS.logs, logs);
}

export function getWorkoutLog(weekNumber: number, dayNumber: number): WorkoutLog | null {
  const logs = getWorkoutLogs();
  return logs.find((l) => l.weekNumber === weekNumber && l.dayNumber === dayNumber) ?? null;
}

// --- Program History (for new cycles) ---

export function archiveCurrentProgram(): void {
  const program = getProgram();
  const logs = getWorkoutLogs();
  if (!program) return;

  const history = safeGet<Array<{ program: GeneratedProgram; logs: WorkoutLog[] }>>(KEYS.programHistory) ?? [];
  history.push({ program, logs });
  safeSet(KEYS.programHistory, history);
}

export function getProgramHistory(): Array<{ program: GeneratedProgram; logs: WorkoutLog[] }> {
  return safeGet<Array<{ program: GeneratedProgram; logs: WorkoutLog[] }>>(KEYS.programHistory) ?? [];
}

/**
 * Run autoregulation: analyze RPE from completed workouts and adjust
 * weights and volume for remaining weeks.
 */
export function runAutoregulation(completedWeek: number): void {
  let program = getProgram();
  if (!program) return;

  const logs = getWorkoutLogs();
  let changed = false;

  // Step 1: Weight autoregulation (adjust 1RM based on RPE)
  const adjusted = calculateAdjustedMaxes(logs, program, completedWeek);
  if (adjusted) {
    program = recalculateWeights(program, completedWeek + 1, adjusted);
    changed = true;
  }

  // Step 2: Volume autoregulation (adjust sets based on RPE trends)
  const volumeAdjusted = adjustVolume(program, logs, completedWeek);
  if (volumeAdjusted) {
    program = volumeAdjusted;
    changed = true;
  }

  // Step 3: Flexible deload evaluation (only after completing all 4 days of a week)
  const decision = evaluateDeload(program, logs, completedWeek);
  if (decision === 'skip' || decision === 'convert-to-deload') {
    const effectiveMaxes = program.effectiveOneRepMaxes ?? program.baseOneRepMaxes;
    program = applyDeloadDecision(program, completedWeek, decision, effectiveMaxes);
    changed = true;
  }

  if (changed) {
    saveProgram(program);
  }
}

export function clearCurrentCycle(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYS.program);
  localStorage.removeItem(KEYS.logs);
}

// --- Accessory Progression ---

export function getAccessoryProgress(): AccessoryProgressionState {
  return safeGet<AccessoryProgressionState>(KEYS.accessoryProgress) ?? {};
}

export function saveAccessoryProgress(state: AccessoryProgressionState): void {
  safeSet(KEYS.accessoryProgress, state);
}

// --- Active Workout ---

export interface ActiveWorkout {
  weekNumber: number;
  dayNumber: number;
  startTime: string;
}

const ACTIVE_WORKOUT_KEY = 'pl-active-workout';

export function getActiveWorkout(): ActiveWorkout | null {
  return safeGet<ActiveWorkout>(ACTIVE_WORKOUT_KEY);
}

export function setActiveWorkout(workout: ActiveWorkout): void {
  safeSet(ACTIVE_WORKOUT_KEY, workout);
}

export function clearActiveWorkout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACTIVE_WORKOUT_KEY);
}

// --- API Keys ---

const ANTHROPIC_KEY_KEY = 'pl-anthropic-key';
const API_KEY_KEY = 'pl-openrouter-key';
const GEMINI_KEY_KEY = 'pl-gemini-key';

export function getAnthropicKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(ANTHROPIC_KEY_KEY) ?? '';
}

export function saveAnthropicKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (key) {
    localStorage.setItem(ANTHROPIC_KEY_KEY, key);
  } else {
    localStorage.removeItem(ANTHROPIC_KEY_KEY);
  }
}

export function getApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(API_KEY_KEY) ?? '';
}

export function saveApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (key) {
    localStorage.setItem(API_KEY_KEY, key);
  } else {
    localStorage.removeItem(API_KEY_KEY);
  }
}

export function getGeminiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(GEMINI_KEY_KEY) ?? '';
}

export function saveGeminiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (key) {
    localStorage.setItem(GEMINI_KEY_KEY, key);
  } else {
    localStorage.removeItem(GEMINI_KEY_KEY);
  }
}
