import type { UserSettings, GeneratedProgram, WorkoutDay, Exercise, OneRepMaxes, Phase } from './types';
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
        { name: isHypertrophy ? 'Front Squat' : 'Pause Squat', tag: 'technical', liftType: 'squat', weightType: 'technical', fixedSets: 3, fixedReps: isHypertrophy ? 8 : 3, note: isHypertrophy ? 'Trzymaj łokcie wysoko i tułów pionowo. Opuszczaj się kontrolowanym ruchem.' : 'Zatrzymaj się na 2 sekundy w dole bez odbijania. Utrzymaj napięcie brzucha przez całą pauzę.' },
        { name: 'Wyciskanie leżąc (Bench Press)', tag: 'volume', liftType: 'bench', weightType: 'volume' },
        { name: 'Podciąganie z obciążeniem', tag: 'accessory', fixedSets: 3, fixedReps: isPowerbuilding || isHypertrophy ? 8 : 5, note: 'Dodawaj obciążenie na pasie. Zacznij od pełnego wyprostu ramion, ciągnij aż broda znajdzie się nad drążkiem.' },
        { name: 'Face Pull', tag: 'accessory', fixedSets: 3, fixedReps: 15, note: 'Ciągnij linkę do wysokości twarzy, łokcie prowadź wysoko. Na końcu dodaj rotację zewnętrzną ramion.' },
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
        { name: isHypertrophy ? `Rumuński martwy ciąg (RDL)` : `Tempo ${dlName}`, tag: 'technical', liftType: 'deadlift', weightType: 'technical', fixedSets: 3, fixedReps: isHypertrophy ? 10 : 3, note: isHypertrophy ? 'Na dole poczuj pełne rozciągnięcie mięśni dwugłowych uda. Kontrolowane tempo w obu kierunkach.' : 'Opuszczaj sztangę przez 3 sekundy kontrolowanym ruchem. Utrzymuj proste plecy przez cały ruch.' },
        { name: 'Pause Bench Press', tag: 'technical', liftType: 'bench', weightType: 'technical', fixedSets: 3, fixedReps: 4, note: 'Zatrzymaj sztangę na sekundę na klatce piersiowej. Nie odbijaj — buduje siłę wyciskania z martwego punktu.' },
        { name: 'Ściąganie drążka (Lat Pulldown)', tag: 'accessory', fixedSets: 3, fixedReps: isPowerbuilding || isHypertrophy ? 12 : 10 },
        { name: 'Rear Delt Fly', tag: 'accessory', fixedSets: 3, fixedReps: 15, note: 'Pochyl tułów do przodu. Unieś ramiona na boki prowadząc łokciami. Ściskaj łopatki na górze ruchu.' },
        ...(shortSession ? [] : [
          { name: 'Przywodzenie bioder (Hip Adduction)', tag: 'accessory' as const, fixedSets: 3, fixedReps: 15 },
        ]),
        ...(extraAccessories ? [
          { name: 'Incline Dumbbell Curl', tag: 'accessory' as const, fixedSets: 3, fixedReps: 12, note: 'Opuść hantle do pełnego rozciągnięcia bicepsów. Kontrolowane tempo w obu kierunkach.' },
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
        { name: isHypertrophy ? 'Incline Dumbbell Press' : 'Close Grip Bench', tag: 'technical', liftType: 'bench', weightType: 'technical', fixedSets: 3, fixedReps: isHypertrophy ? 10 : 5, note: isHypertrophy ? 'Opuść hantle do pełnego rozciągnięcia klatki piersiowej. Kontrolowane tempo wyciskania.' : 'Chwyć sztangę na szerokość ramion. Łokcie prowadź bliżej tułowia niż w standardowym chwycie.' },
        { name: 'Przysiad (Back Squat)', tag: 'volume', liftType: 'squat', weightType: 'volume' },
        { name: 'Rumuński martwy ciąg (RDL)', tag: 'accessory', fixedSets: 3, fixedReps: isPowerbuilding || isHypertrophy ? 10 : 8 },
        { name: 'Seated Cable Row', tag: 'accessory', fixedSets: 3, fixedReps: isPowerbuilding || isHypertrophy ? 12 : 10 },
        ...(shortSession ? [] : [
          { name: isHypertrophy ? 'Overhead Tricep Extension' : 'Wrist Curl', tag: 'accessory' as const, fixedSets: isHypertrophy ? 3 : 2, fixedReps: 15 },
        ]),
        ...(extraAccessories ? [
          { name: 'Lateral Raise', tag: 'accessory' as const, fixedSets: 3, fixedReps: 15 },
          { name: 'Pallof Press', tag: 'accessory' as const, fixedSets: 3, fixedReps: 12, note: 'Stań bokiem do wyciągu i wypchnij uchwyt przed siebie. Nie pozwól, żeby ciężar obrócił tułów. Wykonaj po obu stronach.' },
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
        { name: 'Podciąganie z obciążeniem', tag: 'accessory', fixedSets: 3, fixedReps: isPowerbuilding || isHypertrophy ? 8 : 6, note: 'Dodawaj obciążenie na pasie. Zacznij od pełnego wyprostu ramion, ciągnij aż broda znajdzie się nad drążkiem.' },
        { name: 'Seated Leg Curl', tag: 'accessory', fixedSets: 3, fixedReps: isPowerbuilding || isHypertrophy ? 12 : 10, note: 'Na dole wyprostuj nogi do pełnego rozciągnięcia mięśni dwugłowych uda. Kontrolowany ruch bez rozpędu.' },
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
  maxes: OneRepMaxes,
  phase: Phase
): WorkoutDay {
  // Test week: only main lift (topset without backoff), skip everything else
  const isTest = phase === 'test';

  const filteredTemplates = isTest
    ? template.exercises.filter((tmpl) => tmpl.weightType === 'topset')
    : template.exercises;

  const exercises: Exercise[] = filteredTemplates.map((tmpl) => {
    // For main lifts, cap sets at reasonable values instead of using raw weekSets
    const mainTopsetSets = Math.min(weekSets, 3); // max 3 topsets
    const mainBackoffSets = Math.min(weekSets, 3); // max 3 backoff sets
    const volumeSets = Math.min(weekSets, 4); // max 4 volume sets

    const ex: Exercise = {
      id: generateId(),
      name: tmpl.name,
      tag: tmpl.tag,
      plannedSets: tmpl.fixedSets ?? weekSets,
      plannedReps: tmpl.fixedReps ?? weekReps,
      liftType: tmpl.liftType,
      weightType: tmpl.weightType,
      note: isTest ? 'Rozgrzej się stopniowo i podejdź do maksymalnej pojedynczej próby.' : tmpl.note,
    };

    // Calculate weight based on weightType
    if (tmpl.liftType && tmpl.weightType) {
      const oneRM = maxes[tmpl.liftType];
      switch (tmpl.weightType) {
        case 'topset':
          ex.plannedSets = tmpl.fixedSets ?? mainTopsetSets;
          ex.plannedWeight = getTopsetWeight(oneRM, percentage);
          // No backoff on test week
          if (tmpl.hasBackoff && !isTest) {
            ex.isBackoff = true;
            ex.backoffSets = tmpl.fixedSets ?? mainBackoffSets;
            ex.backoffReps = (tmpl.fixedReps ?? weekReps) + 2;
            ex.backoffWeight = getBackoffWeight(ex.plannedWeight);
          }
          break;
        case 'volume':
          ex.plannedSets = tmpl.fixedSets ?? volumeSets;
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

  // Test week: update day focus
  const focus = isTest
    ? exercises.map((e) => e.name).join(' + ') + ' — Test 1RM'
    : template.focus;

  return {
    dayNumber: template.dayNumber,
    label: template.label,
    dayOfWeek: template.dayOfWeek,
    focus,
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
    const weekDays: WorkoutDay[] = [];
    for (const template of templates) {
      const day = buildDayFromTemplate(
        template,
        week.sets,
        week.reps,
        week.percentage,
        oneRepMaxes,
        week.phase
      );
      // Skip empty days (e.g. day 4 in test week has no topset exercises)
      if (day.exercises.length > 0) {
        weekDays.push(day);
      }
    }
    // Pad to 4 days per week for consistent indexing
    while (weekDays.length < 4) {
      weekDays.push({
        dayNumber: (weekDays.length + 1) as 1 | 2 | 3 | 4,
        label: `Dzień ${weekDays.length + 1}`,
        dayOfWeek: '',
        focus: 'Dzień wolny — regeneracja',
        exercises: [],
      });
    }
    allDays.push(...weekDays);
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
