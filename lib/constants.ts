import { type Phase, type ProgramWeek, type TrainingLevel } from './types';

/** Beginner: 16 weeks — more hypertrophy volume, higher reps, lower percentages */
export const BEGINNER_WEEK_SCHEME: ProgramWeek[] = [
  { weekNumber: 1,  phase: 'hypertrophy', sets: 5, reps: 8, percentage: 0.65, isDeload: false },
  { weekNumber: 2,  phase: 'hypertrophy', sets: 5, reps: 8, percentage: 0.67, isDeload: false },
  { weekNumber: 3,  phase: 'hypertrophy', sets: 5, reps: 6, percentage: 0.70, isDeload: false },
  { weekNumber: 4,  phase: 'hypertrophy', sets: 5, reps: 6, percentage: 0.72, isDeload: false },
  { weekNumber: 5,  phase: 'hypertrophy', sets: 4, reps: 6, percentage: 0.74, isDeload: false },
  { weekNumber: 6,  phase: 'deload',      sets: 3, reps: 5, percentage: 0.60, isDeload: true, isScheduledDeload: true },
  { weekNumber: 7,  phase: 'strength',    sets: 4, reps: 5, percentage: 0.76, isDeload: false },
  { weekNumber: 8,  phase: 'strength',    sets: 4, reps: 5, percentage: 0.78, isDeload: false },
  { weekNumber: 9,  phase: 'strength',    sets: 4, reps: 4, percentage: 0.80, isDeload: false },
  { weekNumber: 10, phase: 'strength',    sets: 4, reps: 4, percentage: 0.82, isDeload: false },
  { weekNumber: 11, phase: 'deload',      sets: 3, reps: 3, percentage: 0.65, isDeload: true, isScheduledDeload: true },
  { weekNumber: 12, phase: 'peaking',     sets: 3, reps: 3, percentage: 0.85, isDeload: false },
  { weekNumber: 13, phase: 'peaking',     sets: 3, reps: 2, percentage: 0.88, isDeload: false },
  { weekNumber: 14, phase: 'peaking',     sets: 2, reps: 2, percentage: 0.90, isDeload: false },
  { weekNumber: 15, phase: 'peaking',     sets: 2, reps: 1, percentage: 0.93, isDeload: false },
  { weekNumber: 16, phase: 'test',        sets: 1, reps: 1, percentage: 1.00, isDeload: true },
];

/** Intermediate: 14 weeks — balanced periodization (existing scheme) */
export const WEEK_SCHEME: ProgramWeek[] = [
  { weekNumber: 1,  phase: 'hypertrophy', sets: 4, reps: 6, percentage: 0.72, isDeload: false },
  { weekNumber: 2,  phase: 'hypertrophy', sets: 4, reps: 6, percentage: 0.75, isDeload: false },
  { weekNumber: 3,  phase: 'hypertrophy', sets: 5, reps: 5, percentage: 0.77, isDeload: false },
  { weekNumber: 4,  phase: 'hypertrophy', sets: 5, reps: 5, percentage: 0.79, isDeload: false },
  { weekNumber: 5,  phase: 'deload',      sets: 3, reps: 4, percentage: 0.65, isDeload: true, isScheduledDeload: true },
  { weekNumber: 6,  phase: 'strength',    sets: 4, reps: 4, percentage: 0.80, isDeload: false },
  { weekNumber: 7,  phase: 'strength',    sets: 4, reps: 4, percentage: 0.83, isDeload: false },
  { weekNumber: 8,  phase: 'strength',    sets: 4, reps: 3, percentage: 0.85, isDeload: false },
  { weekNumber: 9,  phase: 'strength',    sets: 4, reps: 3, percentage: 0.87, isDeload: false },
  { weekNumber: 10, phase: 'deload',      sets: 3, reps: 3, percentage: 0.72, isDeload: true, isScheduledDeload: true },
  { weekNumber: 11, phase: 'peaking',     sets: 3, reps: 3, percentage: 0.88, isDeload: false },
  { weekNumber: 12, phase: 'peaking',     sets: 3, reps: 2, percentage: 0.91, isDeload: false },
  { weekNumber: 13, phase: 'peaking',     sets: 2, reps: 1, percentage: 0.95, isDeload: false },
  { weekNumber: 14, phase: 'test',        sets: 1, reps: 1, percentage: 1.00, isDeload: true  },
];

/** Advanced: 16 weeks — higher starting %, extended peaking */
export const ADVANCED_WEEK_SCHEME: ProgramWeek[] = [
  { weekNumber: 1,  phase: 'hypertrophy', sets: 4, reps: 5, percentage: 0.75, isDeload: false },
  { weekNumber: 2,  phase: 'hypertrophy', sets: 4, reps: 5, percentage: 0.77, isDeload: false },
  { weekNumber: 3,  phase: 'hypertrophy', sets: 5, reps: 4, percentage: 0.79, isDeload: false },
  { weekNumber: 4,  phase: 'deload',      sets: 3, reps: 4, percentage: 0.65, isDeload: true, isScheduledDeload: true },
  { weekNumber: 5,  phase: 'strength',    sets: 4, reps: 3, percentage: 0.82, isDeload: false },
  { weekNumber: 6,  phase: 'strength',    sets: 4, reps: 3, percentage: 0.85, isDeload: false },
  { weekNumber: 7,  phase: 'strength',    sets: 4, reps: 2, percentage: 0.87, isDeload: false },
  { weekNumber: 8,  phase: 'strength',    sets: 3, reps: 2, percentage: 0.89, isDeload: false },
  { weekNumber: 9,  phase: 'deload',      sets: 3, reps: 2, percentage: 0.70, isDeload: true, isScheduledDeload: true },
  { weekNumber: 10, phase: 'peaking',     sets: 3, reps: 2, percentage: 0.90, isDeload: false },
  { weekNumber: 11, phase: 'peaking',     sets: 3, reps: 1, percentage: 0.92, isDeload: false },
  { weekNumber: 12, phase: 'peaking',     sets: 2, reps: 1, percentage: 0.94, isDeload: false },
  { weekNumber: 13, phase: 'peaking',     sets: 2, reps: 1, percentage: 0.96, isDeload: false },
  { weekNumber: 14, phase: 'peaking',     sets: 1, reps: 1, percentage: 0.97, isDeload: false },
  { weekNumber: 15, phase: 'deload',      sets: 2, reps: 1, percentage: 0.75, isDeload: true, isScheduledDeload: true },
  { weekNumber: 16, phase: 'test',        sets: 1, reps: 1, percentage: 1.00, isDeload: true },
];

/** Get week scheme based on training level */
export function getWeekSchemeForLevel(level: TrainingLevel): ProgramWeek[] {
  switch (level) {
    case 'beginner': return BEGINNER_WEEK_SCHEME;
    case 'advanced': return ADVANCED_WEEK_SCHEME;
    default: return WEEK_SCHEME;
  }
}

export const PHASE_LABELS: Record<Phase, string> = {
  hypertrophy: 'Hipertrofia',
  strength: 'Siła',
  peaking: 'Peaking',
  deload: 'Deload',
  test: 'Test 1RM',
};

export const PHASE_COLORS: Record<Phase, { bg: string; text: string; border: string }> = {
  hypertrophy: { bg: 'bg-emerald-50',  text: 'text-emerald-700',  border: 'border-emerald-200' },
  strength:    { bg: 'bg-blue-50',     text: 'text-blue-700',     border: 'border-blue-200' },
  peaking:     { bg: 'bg-orange-50',   text: 'text-orange-700',   border: 'border-orange-200' },
  deload:      { bg: 'bg-stone-100',   text: 'text-stone-600',    border: 'border-stone-200' },
  test:        { bg: 'bg-amber-50',    text: 'text-amber-700',    border: 'border-amber-200' },
};

export const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Pon' },
  { value: 'tuesday', label: 'Wt' },
  { value: 'wednesday', label: 'Śr' },
  { value: 'thursday', label: 'Czw' },
  { value: 'friday', label: 'Pt' },
  { value: 'saturday', label: 'Sob' },
  { value: 'sunday', label: 'Ndz' },
];

export const MUSCLE_GROUPS = [
  { value: 'adductors', label: 'Adduktory' },
  { value: 'quads', label: 'Czworogłowe' },
  { value: 'hamstrings', label: 'Dwugłowe uda' },
  { value: 'glutes', label: 'Pośladki' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'forearms', label: 'Przedramiona' },
  { value: 'shoulders', label: 'Barki' },
  { value: 'upper_back', label: 'Grzbiet górny' },
  { value: 'lower_back', label: 'Grzbiet dolny' },
  { value: 'lats', label: 'Lats' },
  { value: 'core', label: 'Core / stabilizacja' },
];

export const TECHNICAL_ISSUES = [
  { value: 'bottom_squat', label: 'Dół przysiadu (poniżej parallel)' },
  { value: 'lockout_squat', label: 'Lockout przysiadu' },
  { value: 'bounce_bench', label: 'Odbicie na klatce (bench)' },
  { value: 'lockout_bench', label: 'Lockout ławy' },
  { value: 'off_floor_deadlift', label: 'Zerwanie z podłogi (martwy)' },
  { value: 'lockout_deadlift', label: 'Lockout martwego' },
  { value: 'start_position_deadlift', label: 'Pozycja startu (martwy)' },
];

export const TAG_LABELS: Record<string, string> = {
  main: 'Główne',
  technical: 'Techniczne',
  volume: 'Wolumen',
  accessory: 'Akcesoria',
  supplemental: 'Uzupełnienie',
};

export const TAG_COLORS: Record<string, string> = {
  main: 'bg-red-100 text-red-700',
  technical: 'bg-purple-100 text-purple-700',
  volume: 'bg-blue-100 text-blue-700',
  accessory: 'bg-stone-100 text-stone-600',
  supplemental: 'bg-teal-100 text-teal-700',
};
