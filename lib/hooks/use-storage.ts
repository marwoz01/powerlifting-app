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
import type { SupabaseClient } from '@supabase/supabase-js';

class StorageUnavailableError extends Error {
  constructor() {
    super(
      'Baza danych niedostępna — sprawdź połączenie internetowe i zaloguj się ponownie. ' +
      'Jeśli problem się powtarza, skontaktuj się z administratorem (brak konfiguracji Supabase).'
    );
    this.name = 'StorageUnavailableError';
  }
}

function requireSb(sb: SupabaseClient | null, userId: string): SupabaseClient {
  if (!sb || !userId) {
    const err = new StorageUnavailableError();
    console.error('[useStorage] Attempted operation without Supabase client or user.', {
      hasSb: !!sb,
      hasUserId: !!userId,
    });
    throw err;
  }
  return sb;
}

export function useStorage() {
  const sb = useSupabaseClient();
  const { user } = useUser();
  const userId = user?.id ?? '';
  const ready = !!user && !!sb;

  return {
    userId,
    isReady: ready,

    // Settings
    getUserSettings: () => getUserSettings(requireSb(sb, userId), userId),
    saveUserSettings: (s: UserSettings) => saveUserSettings(requireSb(sb, userId), userId, s),
    isOnboardingComplete: () => isOnboardingComplete(requireSb(sb, userId), userId),

    // Program
    getProgram: () => getProgram(requireSb(sb, userId), userId),
    saveProgram: (p: GeneratedProgram) => saveProgram(requireSb(sb, userId), userId, p),
    swapExerciseInProgram: (oldName: string, newName: string, newNote?: string) =>
      swapExerciseInProgram(requireSb(sb, userId), userId, oldName, newName, newNote),

    // Workout Logs
    getWorkoutLogs: () => getWorkoutLogs(requireSb(sb, userId), userId),
    saveWorkoutLog: (log: WorkoutLog) => saveWorkoutLog(requireSb(sb, userId), userId, log),
    getWorkoutLog: (week: number, day: number) => getWorkoutLog(requireSb(sb, userId), userId, week, day),

    // History
    archiveCurrentProgram: () => archiveCurrentProgram(requireSb(sb, userId), userId),
    getProgramHistory: () => getProgramHistory(requireSb(sb, userId), userId),
    clearCurrentCycle: () => clearCurrentCycle(requireSb(sb, userId), userId),

    // Accessory Progression
    getAccessoryProgress: () => getAccessoryProgress(requireSb(sb, userId), userId),
    saveAccessoryProgress: (state: AccessoryProgressionState) =>
      saveAccessoryProgress(requireSb(sb, userId), userId, state),

    // Active Workout
    getActiveWorkout: () => getActiveWorkout(requireSb(sb, userId), userId),
    setActiveWorkout: (w: ActiveWorkout) => setActiveWorkout(requireSb(sb, userId), userId, w),
    clearActiveWorkout: () => clearActiveWorkout(requireSb(sb, userId), userId),

    // API Keys (write-only)
    saveApiKeys: (keys: { anthropicKey?: string; openrouterKey?: string; geminiKey?: string }) =>
      saveApiKeys(requireSb(sb, userId), userId, keys),

    // Autoregulation
    runAutoregulation: (completedWeek: number) => runAutoregulation(requireSb(sb, userId), userId, completedWeek),
  };
}
