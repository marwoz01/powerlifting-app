'use client';

import { useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/supabase/client';
import {
  getUserSettings,
  saveUserSettings,
  isOnboardingComplete,
  getProgram,
  saveProgram,
  swapExerciseInProgram,
  getWorkoutLogs,
  saveWorkoutLog,
  getWorkoutLog,
  archiveCurrentProgram,
  getProgramHistory,
  clearCurrentCycle,
  getAccessoryProgress,
  saveAccessoryProgress,
  getActiveWorkout,
  setActiveWorkout,
  clearActiveWorkout,
  saveApiKeys,
  runAutoregulation,
} from '@/lib/supabase-storage';
import type {
  UserSettings,
  GeneratedProgram,
  WorkoutLog,
  AccessoryProgressionState,
} from '@/lib/types';
import type { ActiveWorkout } from '@/lib/supabase-storage';

export function useStorage() {
  const sb = useSupabaseClient();
  const { user } = useUser();
  const userId = user?.id ?? '';

  return {
    userId,
    isReady: !!user,

    // Settings
    getUserSettings: () => getUserSettings(sb, userId),
    saveUserSettings: (s: UserSettings) => saveUserSettings(sb, userId, s),
    isOnboardingComplete: () => isOnboardingComplete(sb, userId),

    // Program
    getProgram: () => getProgram(sb, userId),
    saveProgram: (p: GeneratedProgram) => saveProgram(sb, userId, p),
    swapExerciseInProgram: (oldName: string, newName: string, newNote?: string) =>
      swapExerciseInProgram(sb, userId, oldName, newName, newNote),

    // Workout Logs
    getWorkoutLogs: () => getWorkoutLogs(sb, userId),
    saveWorkoutLog: (log: WorkoutLog) => saveWorkoutLog(sb, userId, log),
    getWorkoutLog: (week: number, day: number) => getWorkoutLog(sb, userId, week, day),

    // History
    archiveCurrentProgram: () => archiveCurrentProgram(sb, userId),
    getProgramHistory: () => getProgramHistory(sb, userId),
    clearCurrentCycle: () => clearCurrentCycle(sb, userId),

    // Accessory Progression
    getAccessoryProgress: () => getAccessoryProgress(sb, userId),
    saveAccessoryProgress: (state: AccessoryProgressionState) =>
      saveAccessoryProgress(sb, userId, state),

    // Active Workout
    getActiveWorkout: () => getActiveWorkout(sb, userId),
    setActiveWorkout: (w: ActiveWorkout) => setActiveWorkout(sb, userId, w),
    clearActiveWorkout: () => clearActiveWorkout(sb, userId),

    // API Keys (write-only)
    saveApiKeys: (keys: { anthropicKey?: string; openrouterKey?: string; geminiKey?: string }) =>
      saveApiKeys(sb, userId, keys),

    // Autoregulation
    runAutoregulation: (completedWeek: number) => runAutoregulation(sb, userId, completedWeek),
  };
}
