import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  UserSettings,
  GeneratedProgram,
  WorkoutLog,
  AccessoryProgressionState,
} from './types';
import {
  saveUserSettings,
  saveProgram,
  saveWorkoutLog,
  saveAccessoryProgress,
  setActiveWorkout,
} from './supabase-storage';

/**
 * Migrate all data from localStorage to Supabase on first login.
 * Returns true if migration happened, false if skipped (already migrated or no data).
 */
export async function migrateLocalStorageToSupabase(
  sb: SupabaseClient,
  userId: string
): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Check if user already has data in Supabase
  const { data: existing } = await sb
    .from('user_settings')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  if (existing) return false; // Already migrated

  // Read localStorage
  const settingsRaw = localStorage.getItem('pl-settings');
  if (!settingsRaw) return false; // Nothing to migrate

  try {
    const settings = JSON.parse(settingsRaw) as UserSettings;
    const program = JSON.parse(localStorage.getItem('pl-program') || 'null') as GeneratedProgram | null;
    const logs = JSON.parse(localStorage.getItem('pl-workout-logs') || '[]') as WorkoutLog[];
    const history = JSON.parse(localStorage.getItem('pl-program-history') || '[]') as Array<{
      program: GeneratedProgram;
      logs: WorkoutLog[];
    }>;
    const accProgress = JSON.parse(
      localStorage.getItem('pl-accessory-progress') || '{}'
    ) as AccessoryProgressionState;
    const activeWorkout = JSON.parse(localStorage.getItem('pl-active-workout') || 'null');

    // 1. Settings
    await saveUserSettings(sb, userId, settings);

    // 2. Current program
    if (program) {
      await saveProgram(sb, userId, program);
    }

    // 3. Workout logs
    for (const log of logs) {
      await saveWorkoutLog(sb, userId, log);
    }

    // 4. Archived programs + their logs
    for (const entry of history) {
      // Save archived program with is_current = false
      await sb.from('programs').upsert(
        {
          clerk_user_id: userId,
          program_id: entry.program.id,
          is_current: false,
          weeks: entry.program.weeks,
          days: entry.program.days,
          base_one_rep_maxes: entry.program.baseOneRepMaxes,
          effective_one_rep_maxes: entry.program.effectiveOneRepMaxes ?? null,
          ai_generated: entry.program.aiGenerated ?? false,
          training_level: entry.program.trainingLevel ?? null,
          total_weeks: entry.program.totalWeeks ?? null,
          deload_history: entry.program.deloadHistory ?? [],
        },
        { onConflict: 'clerk_user_id,program_id' }
      );
      for (const log of entry.logs) {
        await saveWorkoutLog(sb, userId, log);
      }
    }

    // 5. Accessory progress
    if (Object.keys(accProgress).length > 0) {
      await saveAccessoryProgress(sb, userId, accProgress);
    }

    // 6. Active workout
    if (activeWorkout) {
      await setActiveWorkout(sb, userId, activeWorkout);
    }

    // 7. API keys — send via server endpoint
    const anthropicKey = localStorage.getItem('pl-anthropic-key') || '';
    const openrouterKey = localStorage.getItem('pl-openrouter-key') || '';
    const geminiKey = localStorage.getItem('pl-gemini-key') || '';
    if (anthropicKey || openrouterKey || geminiKey) {
      await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anthropicKey, openrouterKey, geminiKey }),
      });
    }

    // 8. Clear localStorage after successful migration
    [
      'pl-settings', 'pl-program', 'pl-workout-logs', 'pl-program-history',
      'pl-accessory-progress', 'pl-active-workout', 'pl-anthropic-key',
      'pl-openrouter-key', 'pl-gemini-key',
    ].forEach((k) => localStorage.removeItem(k));

    return true;
  } catch (e) {
    console.error('Migration failed:', e);
    return false;
  }
}
