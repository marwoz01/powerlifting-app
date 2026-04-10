import type { UserSettings, GeneratedProgram, WorkoutDay, Exercise, OneRepMaxes, Phase } from './types';
import { getWeekSchemeForLevel } from './constants';
import {
  getTrainingLevel,
  getTopsetWeight,
  getBackoffWeight,
  getVolumeWeight,
  getTechnicalWeight,
  roundTo2_5,
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
  // Scale accessory sets by phase — reduce in peaking/deload
  const accessorySetScale = (phase === 'peaking' || phase === 'deload') ? -1 : 0;

  const exercises: Exercise[] = template.exercises.map((tmpl) => {
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
      note: tmpl.note,
    };

    // Calculate weight based on weightType
    if (tmpl.liftType && tmpl.weightType) {
      const oneRM = maxes[tmpl.liftType];
      switch (tmpl.weightType) {
        case 'topset':
          ex.plannedSets = tmpl.fixedSets ?? mainTopsetSets;
          ex.plannedWeight = getTopsetWeight(oneRM, percentage);
          // Backoff only in strength and peaking phases (not hypertrophy, deload, or test)
          // In hypertrophy the backoff weight is too light to be useful
          // In deload/test we want minimal volume
          if (tmpl.hasBackoff && (phase === 'strength' || phase === 'peaking')) {
            ex.isBackoff = true;
            ex.backoffSets = tmpl.fixedSets ?? mainBackoffSets;
            ex.backoffReps = (tmpl.fixedReps ?? weekReps) + 2;
            ex.backoffWeight = getBackoffWeight(ex.plannedWeight);
          }
          break;
        case 'volume':
          // Volume always follows periodization — ignore fixedSets/fixedReps
          ex.plannedSets = volumeSets;
          ex.plannedReps = weekReps + 1;
          // On deload: use raw percentage - 10% without the floor (lighter is the point)
          ex.plannedWeight = phase === 'deload'
            ? roundTo2_5(oneRM * Math.max(percentage - 0.10, 0.50))
            : getVolumeWeight(oneRM, percentage);
          break;
        case 'technical':
          ex.plannedWeight = getTechnicalWeight(oneRM);
          // Technical sets follow periodization in peaking (fewer sets)
          if (phase === 'peaking' || phase === 'deload') {
            ex.plannedSets = Math.max(2, (tmpl.fixedSets ?? 3) - 1);
          }
          break;
      }
    }

    // Accessories: reduce sets in peaking/deload phases
    if (!tmpl.liftType && (tmpl.tag === 'accessory' || tmpl.tag === 'supplemental')) {
      ex.plannedSets = Math.max(2, (tmpl.fixedSets ?? 3) + accessorySetScale);
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

/** Build warm-up + max attempt exercises for a single lift on test day */
function buildTestLiftExercises(
  liftName: string,
  liftType: 'squat' | 'bench' | 'deadlift',
  oneRM: number
): Exercise[] {
  // Warm-up progression: 50%×5, 60%×3, 70%×2, 80%×1, 87%×1, 93%×1, 100%×1
  const warmupScheme = [
    { pct: 0.50, reps: 5, label: 'Rozgrzewka' },
    { pct: 0.60, reps: 3, label: 'Rozgrzewka' },
    { pct: 0.70, reps: 2, label: 'Rozgrzewka' },
    { pct: 0.80, reps: 1, label: 'Podejście' },
    { pct: 0.87, reps: 1, label: 'Podejście' },
    { pct: 0.93, reps: 1, label: 'Podejście' },
  ];

  const exercises: Exercise[] = [];

  // Warm-up sets as a single exercise with note listing the progression
  const warmupLines = warmupScheme
    .map((w) => `${roundTo2_5(oneRM * w.pct)} kg × ${w.reps} (${Math.round(w.pct * 100)}%)`)
    .join('  →  ');

  exercises.push({
    id: generateId(),
    name: `${liftName} — rozgrzewka`,
    tag: 'technical',
    plannedSets: warmupScheme.length,
    plannedReps: 1,
    plannedWeight: roundTo2_5(oneRM * 0.50),
    liftType,
    note: warmupLines,
  });

  // Max attempt
  exercises.push({
    id: generateId(),
    name: `${liftName} — MAKS`,
    tag: 'main',
    plannedSets: 1,
    plannedReps: 1,
    plannedWeight: roundTo2_5(oneRM),
    liftType,
    weightType: 'topset',
    note: 'Podejście do nowego rekordu życiowego. Jeśli poszło lekko, możesz podbić o 2.5 kg.',
  });

  return exercises;
}

/** Build the single test day with all 3 lifts */
function buildTestDay(maxes: OneRepMaxes, dayOfWeek: string, dlVariant: string): WorkoutDay {
  const dlName = dlVariant === 'sumo' ? 'Martwy ciąg Sumo' : 'Martwy ciąg Conventional';

  return {
    dayNumber: 1,
    label: 'Dzień 1',
    dayOfWeek,
    focus: 'Test 1RM — Przysiad, Ławka, Martwy ciąg',
    exercises: [
      ...buildTestLiftExercises('Przysiad (Back Squat)', 'squat', maxes.squat),
      ...buildTestLiftExercises('Wyciskanie leżąc (Bench Press)', 'bench', maxes.bench),
      ...buildTestLiftExercises(dlName, 'deadlift', maxes.deadlift),
    ],
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

  const dlVariant = settings.deadliftVariant ?? 'sumo';
  const preferredDays = settings.schedule.preferredDays;
  const dayMap: Record<string, string> = {
    monday: 'Pon', tuesday: 'Wt', wednesday: 'Śr',
    thursday: 'Czw', friday: 'Pt', saturday: 'Sob', sunday: 'Ndz',
  };
  const firstDayLabel = dayMap[preferredDays[0]] ?? 'Pon';

  const allDays: WorkoutDay[] = [];
  for (const week of weeks) {
    // Test week: single day with all 3 lifts + warm-ups
    if (week.phase === 'test') {
      const effectiveMaxes = oneRepMaxes; // will be recalculated by autoregulation during cycle
      const testDay = buildTestDay(effectiveMaxes, firstDayLabel, dlVariant);
      const restDay = (n: number): WorkoutDay => ({
        dayNumber: n as 1 | 2 | 3 | 4,
        label: `Dzień ${n}`,
        dayOfWeek: '',
        focus: 'Dzień wolny — regeneracja',
        exercises: [],
      });
      allDays.push(testDay, restDay(2), restDay(3), restDay(4));
      continue;
    }

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
      weekDays.push(day);
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
