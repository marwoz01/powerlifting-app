import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  UserSettings,
  GeneratedProgram,
  WorkoutLog,
  AccessoryProgressionState,
} from './types';
import { calculateAdjustedMaxes, recalculateWeights, adjustVolume } from './autoregulation';
import { evaluateDeload, applyDeloadDecision } from './deload-manager';

// ─── Mappers: DB row ↔ App types ───

function mapRowToSettings(row: Record<string, unknown>): UserSettings {
  return {
    profile: row.profile as UserSettings['profile'],
    oneRepMaxes: row.one_rep_maxes as UserSettings['oneRepMaxes'],
    deadliftVariant: row.deadlift_variant as UserSettings['deadliftVariant'],
    schedule: row.schedule as UserSettings['schedule'],
    goals: row.goals as UserSettings['goals'],
    weakPoints: row.weak_points as UserSettings['weakPoints'],
    onboardingComplete: row.onboarding_complete as boolean,
  };
}

function mapRowToProgram(row: Record<string, unknown>): GeneratedProgram {
  return {
    id: row.program_id as string,
    createdAt: row.created_at as string,
    weeks: row.weeks as GeneratedProgram['weeks'],
    days: row.days as GeneratedProgram['days'],
    baseOneRepMaxes: row.base_one_rep_maxes as GeneratedProgram['baseOneRepMaxes'],
    effectiveOneRepMaxes: row.effective_one_rep_maxes as GeneratedProgram['effectiveOneRepMaxes'],
    aiGenerated: row.ai_generated as boolean | undefined,
    trainingLevel: row.training_level as GeneratedProgram['trainingLevel'],
    totalWeeks: row.total_weeks as number | undefined,
    deloadHistory: row.deload_history as GeneratedProgram['deloadHistory'],
  };
}

function mapRowToLog(row: Record<string, unknown>): WorkoutLog {
  return {
    id: row.log_id as string,
    programId: row.program_id as string,
    weekNumber: row.week_number as number,
    dayNumber: row.day_number as number,
    date: row.date as string,
    startTime: row.start_time as string,
    endTime: row.end_time as string | undefined,
    sets: row.sets as WorkoutLog['sets'],
    generalNote: row.general_note as string | undefined,
    completed: row.completed as boolean,
  };
}

// ─── User Settings ───

export async function getUserSettings(
  sb: SupabaseClient,
  userId: string
): Promise<UserSettings | null> {
  const { data } = await sb
    .from('user_settings')
    .select('*')
    .eq('clerk_user_id', userId)
    .single();
  return data ? mapRowToSettings(data) : null;
}

export async function saveUserSettings(
  sb: SupabaseClient,
  userId: string,
  settings: UserSettings
): Promise<void> {
  await sb.from('user_settings').upsert(
    {
      clerk_user_id: userId,
      profile: settings.profile,
      one_rep_maxes: settings.oneRepMaxes,
      deadlift_variant: settings.deadliftVariant,
      schedule: settings.schedule,
      goals: settings.goals,
      weak_points: settings.weakPoints,
      onboarding_complete: settings.onboardingComplete,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'clerk_user_id' }
  );
}

export async function isOnboardingComplete(
  sb: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data } = await sb
    .from('user_settings')
    .select('onboarding_complete')
    .eq('clerk_user_id', userId)
    .single();
  return data?.onboarding_complete ?? false;
}

// ─── Program ───

export async function getProgram(
  sb: SupabaseClient,
  userId: string
): Promise<GeneratedProgram | null> {
  const { data } = await sb
    .from('programs')
    .select('*')
    .eq('clerk_user_id', userId)
    .eq('is_current', true)
    .single();
  return data ? mapRowToProgram(data) : null;
}

export async function saveProgram(
  sb: SupabaseClient,
  userId: string,
  program: GeneratedProgram
): Promise<void> {
  await sb.from('programs').upsert(
    {
      clerk_user_id: userId,
      program_id: program.id,
      is_current: true,
      weeks: program.weeks,
      days: program.days,
      base_one_rep_maxes: program.baseOneRepMaxes,
      effective_one_rep_maxes: program.effectiveOneRepMaxes ?? null,
      ai_generated: program.aiGenerated ?? false,
      training_level: program.trainingLevel ?? null,
      total_weeks: program.totalWeeks ?? null,
      deload_history: program.deloadHistory ?? [],
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'clerk_user_id,program_id' }
  );
}

export async function swapExerciseInProgram(
  sb: SupabaseClient,
  userId: string,
  oldName: string,
  newName: string,
  newNote?: string
): Promise<void> {
  const program = await getProgram(sb, userId);
  if (!program) return;

  for (const day of program.days) {
    for (const ex of day.exercises) {
      if (ex.name === oldName) {
        ex.name = newName;
        if (newNote) ex.note = newNote;
      }
    }
  }
  await saveProgram(sb, userId, program);
}

// ─── Workout Logs ───

export async function getWorkoutLogs(
  sb: SupabaseClient,
  userId: string
): Promise<WorkoutLog[]> {
  const { data } = await sb
    .from('workout_logs')
    .select('*')
    .eq('clerk_user_id', userId)
    .order('date', { ascending: true });
  return (data ?? []).map(mapRowToLog);
}

export async function saveWorkoutLog(
  sb: SupabaseClient,
  userId: string,
  log: WorkoutLog
): Promise<void> {
  await sb.from('workout_logs').upsert(
    {
      clerk_user_id: userId,
      log_id: log.id,
      program_id: log.programId,
      week_number: log.weekNumber,
      day_number: log.dayNumber,
      date: log.date,
      start_time: log.startTime,
      end_time: log.endTime ?? null,
      sets: log.sets,
      general_note: log.generalNote ?? null,
      completed: log.completed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'clerk_user_id,log_id' }
  );
}

export async function getWorkoutLog(
  sb: SupabaseClient,
  userId: string,
  weekNumber: number,
  dayNumber: number
): Promise<WorkoutLog | null> {
  const { data } = await sb
    .from('workout_logs')
    .select('*')
    .eq('clerk_user_id', userId)
    .eq('week_number', weekNumber)
    .eq('day_number', dayNumber)
    .single();
  return data ? mapRowToLog(data) : null;
}

// ─── Program History ───

export async function archiveCurrentProgram(
  sb: SupabaseClient,
  userId: string
): Promise<void> {
  await sb
    .from('programs')
    .update({ is_current: false, updated_at: new Date().toISOString() })
    .eq('clerk_user_id', userId)
    .eq('is_current', true);
}

export async function getProgramHistory(
  sb: SupabaseClient,
  userId: string
): Promise<Array<{ program: GeneratedProgram; logs: WorkoutLog[] }>> {
  const { data: programs } = await sb
    .from('programs')
    .select('*')
    .eq('clerk_user_id', userId)
    .eq('is_current', false)
    .order('created_at', { ascending: false });

  if (!programs || programs.length === 0) return [];

  const result: Array<{ program: GeneratedProgram; logs: WorkoutLog[] }> = [];
  for (const row of programs) {
    const program = mapRowToProgram(row);
    const { data: logRows } = await sb
      .from('workout_logs')
      .select('*')
      .eq('clerk_user_id', userId)
      .eq('program_id', program.id)
      .order('date', { ascending: true });
    result.push({ program, logs: (logRows ?? []).map(mapRowToLog) });
  }
  return result;
}

export async function clearCurrentCycle(
  sb: SupabaseClient,
  userId: string
): Promise<void> {
  // Get current program to find its logs
  const program = await getProgram(sb, userId);
  if (program) {
    await sb
      .from('workout_logs')
      .delete()
      .eq('clerk_user_id', userId)
      .eq('program_id', program.id);
    await sb
      .from('programs')
      .delete()
      .eq('clerk_user_id', userId)
      .eq('program_id', program.id);
  }
}

// ─── Accessory Progression ───

export async function getAccessoryProgress(
  sb: SupabaseClient,
  userId: string
): Promise<AccessoryProgressionState> {
  const { data } = await sb
    .from('accessory_progress')
    .select('state')
    .eq('clerk_user_id', userId)
    .single();
  return (data?.state as AccessoryProgressionState) ?? {};
}

export async function saveAccessoryProgress(
  sb: SupabaseClient,
  userId: string,
  state: AccessoryProgressionState
): Promise<void> {
  await sb.from('accessory_progress').upsert(
    {
      clerk_user_id: userId,
      state,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'clerk_user_id' }
  );
}

// ─── Active Workout ───

export interface ActiveWorkout {
  weekNumber: number;
  dayNumber: number;
  startTime: string;
}

export async function getActiveWorkout(
  sb: SupabaseClient,
  userId: string
): Promise<ActiveWorkout | null> {
  const { data } = await sb
    .from('active_workouts')
    .select('week_number, day_number, start_time')
    .eq('clerk_user_id', userId)
    .single();
  if (!data) return null;
  return {
    weekNumber: data.week_number as number,
    dayNumber: data.day_number as number,
    startTime: data.start_time as string,
  };
}

export async function setActiveWorkout(
  sb: SupabaseClient,
  userId: string,
  workout: ActiveWorkout
): Promise<void> {
  await sb.from('active_workouts').upsert(
    {
      clerk_user_id: userId,
      week_number: workout.weekNumber,
      day_number: workout.dayNumber,
      start_time: workout.startTime,
    },
    { onConflict: 'clerk_user_id' }
  );
}

export async function clearActiveWorkout(
  sb: SupabaseClient,
  userId: string
): Promise<void> {
  await sb
    .from('active_workouts')
    .delete()
    .eq('clerk_user_id', userId);
}

// ─── API Keys (write-only from client) ───

export async function saveApiKeys(
  sb: SupabaseClient,
  userId: string,
  keys: { anthropicKey?: string; openrouterKey?: string; geminiKey?: string }
): Promise<void> {
  const payload: Record<string, unknown> = {
    clerk_user_id: userId,
    updated_at: new Date().toISOString(),
  };
  if (keys.anthropicKey !== undefined) payload.anthropic_key = keys.anthropicKey || null;
  if (keys.openrouterKey !== undefined) payload.openrouter_key = keys.openrouterKey || null;
  if (keys.geminiKey !== undefined) payload.gemini_key = keys.geminiKey || null;

  await sb.from('api_keys').upsert(payload, { onConflict: 'clerk_user_id' });
}

// ─── Autoregulation ───

export async function runAutoregulation(
  sb: SupabaseClient,
  userId: string,
  completedWeek: number
): Promise<void> {
  let program = await getProgram(sb, userId);
  if (!program) return;

  const logs = await getWorkoutLogs(sb, userId);
  let changed = false;

  // Step 1: Weight autoregulation
  const adjusted = calculateAdjustedMaxes(logs, program, completedWeek);
  if (adjusted) {
    program = recalculateWeights(program, completedWeek + 1, adjusted);
    changed = true;
  }

  // Step 2: Volume autoregulation
  const volumeAdjusted = adjustVolume(program, logs, completedWeek);
  if (volumeAdjusted) {
    program = volumeAdjusted;
    changed = true;
  }

  // Step 3: Flexible deload evaluation
  const decision = evaluateDeload(program, logs, completedWeek);
  if (decision === 'skip' || decision === 'convert-to-deload') {
    const effectiveMaxes = program.effectiveOneRepMaxes ?? program.baseOneRepMaxes;
    program = applyDeloadDecision(program, completedWeek, decision, effectiveMaxes);
    changed = true;
  }

  if (changed) {
    await saveProgram(sb, userId, program);
  }
}
