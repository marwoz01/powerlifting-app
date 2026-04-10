import type { UserSettings, GeneratedProgram, WorkoutDay, Exercise, OneRepMaxes } from './types';
import { getWeekSchemeForLevel } from './constants';
import { getTrainingLevel } from './calculations';
import {
  getTopsetWeight,
  getBackoffWeight,
  getVolumeWeight,
  getTechnicalWeight,
} from './calculations';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Exercise template — defines the structure without weights.
 * Weights are calculated per-week based on periodization.
 */
export interface ExerciseTemplate {
  name: string;
  tag: 'main' | 'technical' | 'volume' | 'accessory' | 'supplemental';
  liftType?: 'squat' | 'bench' | 'deadlift';
  weightType?: 'topset' | 'volume' | 'technical';
  hasBackoff?: boolean;
  fixedSets?: number;
  fixedReps?: number;
  note?: string;
}

export interface DayTemplate {
  dayNumber: 1 | 2 | 3 | 4;
  label: string;
  dayOfWeek: string;
  focus: string;
  exercises: ExerciseTemplate[];
}

/** Map preferred days to short labels */
function getDayLabels(preferredDays: string[]): string[] {
  const dayMap: Record<string, string> = {
    monday: 'Pon', tuesday: 'Wt', wednesday: 'Śr',
    thursday: 'Czw', friday: 'Pt', saturday: 'Sob', sunday: 'Ndz',
  };
  const labels = preferredDays.slice(0, 4).map((d) => dayMap[d] || d);
  while (labels.length < 4) {
    labels.push(['Pon', 'Wt', 'Czw', 'Pt'][labels.length]);
  }
  return labels;
}

/** Default hardcoded templates — used as fallback when AI generation is unavailable */
function getDefaultTemplates(settings: UserSettings): DayTemplate[] {
  const dlName = (settings.deadliftVariant ?? 'sumo') === 'sumo' ? 'Sumo' : 'Conventional';
  const days = getDayLabels(settings.schedule.preferredDays);
  const goal = settings.goals.primary;
  const duration = settings.schedule.sessionDuration;

  // Adjust accessory count based on session duration
  const extraAccessories = duration >= 120;
  const shortSession = duration <= 60;

  // Goal-specific accessory selection
  const isHypertrophy = goal === 'hypertrophy';
  const isPowerbuilding = goal === 'powerbuilding';

  return [
    {
      dayNumber: 1,
      label: 'Dzień 1',
      dayOfWeek: days[0],
      focus: 'Przysiad ciężki + Ława wolumen',
      exercises: [
        { name: 'Przysiad (Back Squat)', tag: 'main', liftType: 'squat', weightType: 'topset', hasBackoff: true },
        { name: isHypertrophy ? 'Front Squat' : 'Pause Squat', tag: 'technical', liftType: 'squat', weightType: 'technical', fixedSets: 3, fixedReps: isHypertrophy ? 8 : 3, note: isHypertrophy ? 'Kontrolowany ekscentryk' : 'Pauza 2s w dole' },
        { name: 'Wyciskanie leżąc (Bench Press)', tag: 'volume', liftType: 'bench', weightType: 'volume' },
        { name: 'Podciąganie z obciążeniem', tag: 'accessory', fixedSets: 3, fixedReps: isPowerbuilding || isHypertrophy ? 8 : 5, note: 'Dodaj obciążenie' },
        { name: 'Face Pull', tag: 'accessory', fixedSets: 3, fixedReps: 15 },
        ...(shortSession ? [] : [
          { name: isHypertrophy ? 'Overhead Tricep Extension' : 'Tricep Pushdown', tag: 'accessory' as const, fixedSets: 3, fixedReps: isHypertrophy ? 12 : 15 },
        ]),
        ...(extraAccessories ? [
          { name: 'Lateral Raise', tag: 'accessory' as const, fixedSets: 3, fixedReps: 15 },
          { name: 'Ab Wheel Rollout', tag: 'accessory' as const, fixedSets: 3, fixedReps: 10 },
        ] : []),
      ],
    },
    {
      dayNumber: 2,
      label: 'Dzień 2',
      dayOfWeek: days[1],
      focus: 'Martwy ciężki + Ława techniczny',
      exercises: [
        { name: `Martwy ciąg ${dlName}`, tag: 'main', liftType: 'deadlift', weightType: 'topset', hasBackoff: true },
        { name: isHypertrophy ? `Rumuński martwy ciąg (RDL)` : `Tempo ${dlName}`, tag: 'technical', liftType: 'deadlift', weightType: 'technical', fixedSets: 3, fixedReps: isHypertrophy ? 10 : 3, note: isHypertrophy ? 'Stretch w dole, kontrolowany ruch' : 'Tempo 3s ekscentryk' },
        { name: 'Pause Bench Press', tag: 'technical', liftType: 'bench', weightType: 'technical', fixedSets: 3, fixedReps: 4, note: 'Pauza 1s na klatce' },
        { name: 'Ściąganie drążka (Lat Pulldown)', tag: 'accessory', fixedSets: 3, fixedReps: isPowerbuilding || isHypertrophy ? 12 : 10 },
        { name: 'Rear Delt Fly', tag: 'accessory', fixedSets: 3, fixedReps: 15 },
        ...(shortSession ? [] : [
          { name: 'Przywodzenie bioder (Hip Adduction)', tag: 'accessory' as const, fixedSets: 3, fixedReps: 15 },
        ]),
        ...(extraAccessories ? [
          { name: 'Incline Dumbbell Curl', tag: 'accessory' as const, fixedSets: 3, fixedReps: 12, note: 'Stretch w dole' },
          { name: 'Hanging Leg Raise', tag: 'accessory' as const, fixedSets: 3, fixedReps: 12 },
        ] : []),
      ],
    },
    {
      dayNumber: 3,
      label: 'Dzień 3',
      dayOfWeek: days[2],
      focus: 'Ława ciężka + Przysiad wolumen',
      exercises: [
        { name: 'Wyciskanie leżąc (Bench Press)', tag: 'main', liftType: 'bench', weightType: 'topset', hasBackoff: true },
        { name: isHypertrophy ? 'Incline Dumbbell Press' : 'Close Grip Bench', tag: 'technical', liftType: 'bench', weightType: 'technical', fixedSets: 3, fixedReps: isHypertrophy ? 10 : 5, note: isHypertrophy ? 'Stretch w dole' : 'Wąski chwyt' },
        { name: 'Przysiad (Back Squat)', tag: 'volume', liftType: 'squat', weightType: 'volume' },
        { name: 'Rumuński martwy ciąg (RDL)', tag: 'accessory', fixedSets: 3, fixedReps: isPowerbuilding || isHypertrophy ? 10 : 8 },
        { name: 'Seated Cable Row', tag: 'accessory', fixedSets: 3, fixedReps: isPowerbuilding || isHypertrophy ? 12 : 10 },
        ...(shortSession ? [] : [
          { name: isHypertrophy ? 'Overhead Tricep Extension' : 'Wrist Curl', tag: 'accessory' as const, fixedSets: isHypertrophy ? 3 : 2, fixedReps: 15 },
        ]),
        ...(extraAccessories ? [
          { name: 'Lateral Raise', tag: 'accessory' as const, fixedSets: 3, fixedReps: 15 },
          { name: 'Pallof Press', tag: 'accessory' as const, fixedSets: 3, fixedReps: 12, note: 'Naprzemienna strona' },
        ] : []),
      ],
    },
    {
      dayNumber: 4,
      label: 'Dzień 4',
      dayOfWeek: days[3],
      focus: isHypertrophy ? 'Martwy wolumen + Hipertrofia nóg i pleców' : 'Martwy wolumen + Akcesoria',
      exercises: [
        { name: `Martwy ciąg ${dlName}`, tag: 'volume', liftType: 'deadlift', weightType: 'volume' },
        { name: isHypertrophy ? 'Bulgarian Split Squat' : 'Hack Squat / Leg Press', tag: 'supplemental', fixedSets: 3, fixedReps: isHypertrophy ? 10 : 10 },
        { name: 'Podciąganie z obciążeniem', tag: 'accessory', fixedSets: 3, fixedReps: isPowerbuilding || isHypertrophy ? 8 : 6, note: 'Dodaj obciążenie' },
        { name: 'Seated Leg Curl', tag: 'accessory', fixedSets: 3, fixedReps: isPowerbuilding || isHypertrophy ? 12 : 10, note: 'Stretch w dole' },
        { name: 'Przywodzenie bioder (Hip Adduction)', tag: 'accessory', fixedSets: 3, fixedReps: 15 },
        ...(shortSession ? [] : [
          { name: isHypertrophy ? 'Incline Dumbbell Curl' : 'Band Pull-apart', tag: 'accessory' as const, fixedSets: 3, fixedReps: isHypertrophy ? 12 : 20 },
        ]),
        ...(extraAccessories ? [
          { name: 'Leg Extension', tag: 'accessory' as const, fixedSets: 3, fixedReps: 15 },
          { name: 'Ab Wheel Rollout', tag: 'accessory' as const, fixedSets: 3, fixedReps: 10 },
        ] : []),
      ],
    },
  ];
}

/** Build a single WorkoutDay from a template + week periodization */
function buildDayFromTemplate(
  template: DayTemplate,
  weekSets: number,
  weekReps: number,
  percentage: number,
  maxes: OneRepMaxes
): WorkoutDay {
  const exercises: Exercise[] = template.exercises.map((tmpl) => {
    const ex: Exercise = {
      id: generateId(),
      name: tmpl.name,
      tag: tmpl.tag,
      plannedSets: tmpl.fixedSets ?? weekSets,
      plannedReps: tmpl.fixedReps ?? weekReps,
      liftType: tmpl.liftType,
      weightType: tmpl.weightType,
      note: tmpl.note,
    };

    // Calculate weight based on weightType
    if (tmpl.liftType && tmpl.weightType) {
      const oneRM = maxes[tmpl.liftType];
      switch (tmpl.weightType) {
        case 'topset':
          ex.plannedWeight = getTopsetWeight(oneRM, percentage);
          if (tmpl.hasBackoff) {
            ex.isBackoff = true;
            ex.backoffSets = tmpl.fixedSets ?? weekSets;
            ex.backoffReps = (tmpl.fixedReps ?? weekReps) + 2;
            ex.backoffWeight = getBackoffWeight(ex.plannedWeight);
          }
          break;
        case 'volume':
          ex.plannedSets = (tmpl.fixedSets ?? weekSets) + (tmpl.tag === 'volume' && template.dayNumber === 4 ? 1 : 0);
          ex.plannedReps = (tmpl.fixedReps ?? weekReps) + 1;
          ex.plannedWeight = getVolumeWeight(oneRM, percentage);
          break;
        case 'technical':
          ex.plannedWeight = getTechnicalWeight(oneRM);
          break;
      }
    }

    return ex;
  });

  return {
    dayNumber: template.dayNumber,
    label: template.label,
    dayOfWeek: template.dayOfWeek,
    focus: template.focus,
    exercises,
  };
}

/** Generate a program adapted to training level from templates */
export function generateProgram(
  settings: UserSettings,
  dayTemplates?: DayTemplate[]
): GeneratedProgram {
  const { oneRepMaxes } = settings;
  const total = oneRepMaxes.squat + oneRepMaxes.bench + oneRepMaxes.deadlift;
  const level = getTrainingLevel(settings.profile.yearsTraining, settings.profile.bodyWeight, total);
  const templates = dayTemplates ?? getDefaultTemplates(settings);
  const weeks = getWeekSchemeForLevel(level).map((w) => ({ ...w }));

  const allDays: WorkoutDay[] = [];
  for (const week of weeks) {
    for (const template of templates) {
      const day = buildDayFromTemplate(
        template,
        week.sets,
        week.reps,
        week.percentage,
        oneRepMaxes
      );
      allDays.push(day);
    }
  }

  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    weeks,
    days: allDays,
    baseOneRepMaxes: { ...oneRepMaxes },
    effectiveOneRepMaxes: { ...oneRepMaxes },
    aiGenerated: !!dayTemplates,
    trainingLevel: level,
    totalWeeks: weeks.length,
  };
}

/** Get the 4 workout days for a specific week */
export function getWeekDays(program: GeneratedProgram, weekNumber: number): WorkoutDay[] {
  const startIndex = (weekNumber - 1) * 4;
  return program.days.slice(startIndex, startIndex + 4);
}
