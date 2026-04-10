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
    isReady: !!user && !!sb,

    // Settings
    getUserSettings: () => sb ? getUserSettings(sb, userId) : Promise.resolve(null),
    saveUserSettings: (s: UserSettings) => sb ? saveUserSettings(sb, userId, s) : Promise.resolve(),
    isOnboardingComplete: () => sb ? isOnboardingComplete(sb, userId) : Promise.resolve(false),

    // Program
    getProgram: () => sb ? getProgram(sb, userId) : Promise.resolve(null),
    saveProgram: (p: GeneratedProgram) => sb ? saveProgram(sb, userId, p) : Promise.resolve(),
    swapExerciseInProgram: (oldName: string, newName: string, newNote?: string) =>
      sb ? swapExerciseInProgram(sb, userId, oldName, newName, newNote) : Promise.resolve(),

    // Workout Logs
    getWorkoutLogs: () => sb ? getWorkoutLogs(sb, userId) : Promise.resolve([]),
    saveWorkoutLog: (log: WorkoutLog) => sb ? saveWorkoutLog(sb, userId, log) : Promise.resolve(),
    getWorkoutLog: (week: number, day: number) => sb ? getWorkoutLog(sb, userId, week, day) : Promise.resolve(null),

    // History
    archiveCurrentProgram: () => sb ? archiveCurrentProgram(sb, userId) : Promise.resolve(),
    getProgramHistory: () => sb ? getProgramHistory(sb, userId) : Promise.resolve([]),
    clearCurrentCycle: () => sb ? clearCurrentCycle(sb, userId) : Promise.resolve(),

    // Accessory Progression
    getAccessoryProgress: () => sb ? getAccessoryProgress(sb, userId) : Promise.resolve({}),
    saveAccessoryProgress: (state: AccessoryProgressionState) =>
      sb ? saveAccessoryProgress(sb, userId, state) : Promise.resolve(),

    // Active Workout
    getActiveWorkout: () => sb ? getActiveWorkout(sb, userId) : Promise.resolve(null),
    setActiveWorkout: (w: ActiveWorkout) => sb ? setActiveWorkout(sb, userId, w) : Promise.resolve(),
    clearActiveWorkout: () => sb ? clearActiveWorkout(sb, userId) : Promise.resolve(),

    // API Keys (write-only)
    saveApiKeys: (keys: { anthropicKey?: string; openrouterKey?: string; geminiKey?: string }) =>
      sb ? saveApiKeys(sb, userId, keys) : Promise.resolve(),

    // Autoregulation
    runAutoregulation: (completedWeek: number) => sb ? runAutoregulation(sb, userId, completedWeek) : Promise.resolve(),
  };
}
