import type { UserSettings, GeneratedProgram, WorkoutLog } from './types';
import type { DayTemplate, ExerciseTemplate } from './program-generator';
import { PHASE_LABELS } from './constants';

export function buildCoachSystemPrompt(
  settings: UserSettings,
  program: GeneratedProgram | null,
  recentLogs: WorkoutLog[]
): string {
  const { profile, oneRepMaxes, deadliftVariant, schedule, goals, weakPoints } = settings;
  const total = oneRepMaxes.squat + oneRepMaxes.bench + oneRepMaxes.deadlift;
  const totalWeeks = program?.weeks.length ?? 14;

  const currentWeek = program
    ? Math.min(
        recentLogs.filter((l) => l.completed).reduce((max, l) => Math.max(max, l.weekNumber), 0) + 1,
        totalWeeks
      ) || 1
    : null;

  const phase = program && currentWeek
    ? PHASE_LABELS[program.weeks[currentWeek - 1].phase]
    : 'brak programu';

  const prioritiesText = goals.priorities?.length
    ? `\n- Priorytety: ${goals.priorities.join(', ')}`
    : '';

  const targetsText = [
    goals.targetSquat && `przysiad ${goals.targetSquat} kg`,
    goals.targetBench && `ławka ${goals.targetBench} kg`,
    goals.targetDeadlift && `martwy ${goals.targetDeadlift} kg`,
  ].filter(Boolean).join(', ');

  const logsText = recentLogs
    .slice(0, 5)
    .map((log) => {
      const setsInfo = log.sets
        .map((s) => `  ${s.exerciseId}: ${s.actualWeight}kg × ${s.actualReps}${s.rpe ? ` RPE ${s.rpe}` : ''}`)
        .join('\n');
      return `Tydzień ${log.weekNumber}, Dzień ${log.dayNumber} (${new Date(log.date).toLocaleDateString('pl-PL')}):\n${setsInfo}${log.generalNote ? `\nNotatka: ${log.generalNote}` : ''}`;
    })
    .join('\n\n');

  return `Jesteś elitarnym trenerem siłowym z wiedzą opartą na badaniach naukowych i praktyce (poziom Helms/Nuckols/Israetel). Odpowiadasz po polsku. Bezpośredni, konkretny, praktyczny — zero lania wody.

Twoja wiedza obejmuje: periodyzację blokową i DUP, autoregulację RPE/RIR, SRA curves, volume landmarks (MV→MEV→MAV→MRV), stretch-mediated hypertrophy, specificity principle, sticking point analysis.

PROFIL ZAWODNIKA:
- Imię: ${profile.name}
- Masa ciała: ${profile.bodyWeight} kg, wzrost: ${profile.height} cm, wiek: ${profile.age} lat
- Staż treningowy: ${profile.yearsTraining} lat (${program?.trainingLevel ?? 'intermediate'})
- 1RM: Przysiad ${oneRepMaxes.squat} kg, Ława ${oneRepMaxes.bench} kg, Martwy ciąg (${deadliftVariant}) ${oneRepMaxes.deadlift} kg
- Total: ${total} kg
- Trening: ${schedule.daysPerWeek} dni/tydz, sesja ${schedule.sessionDuration} min
- Cel główny: ${goals.primary}${prioritiesText}
${targetsText ? `- Cele na koniec cyklu: ${targetsText}` : ''}
${goals.hasCompetition ? `- Zawody: ${goals.competitionDate}` : ''}
- Słabe boje: ${weakPoints.lifts.join(', ') || 'nie określono'}
- Słabe partie: ${weakPoints.muscleGroups.join(', ') || 'nie określono'}
- Problemy techniczne: ${weakPoints.technicalIssues.join(', ') || 'nie określono'}

AKTUALNY PROGRAM:
- ${totalWeeks}-tygodniowa periodyzacja blokowa (${program?.trainingLevel ?? 'intermediate'})
${currentWeek ? `- Aktualny tydzień: ${currentWeek}/${totalWeeks} — faza: ${phase}` : '- Brak aktywnego programu'}
${program?.aiGenerated ? '- Program wygenerowany przez AI pod profil zawodnika' : '- Program z domyślnych szablonów'}

OSTATNIE TRENINGI:
${logsText || 'Brak zalogowanych treningów'}

INSTRUKCJE:
- Gdy analizujesz trening: oceń RPE vs plan, objętość, tempo progresji. Odnieś się do celów zawodnika.
- Gdy pytają o technikę: konkretne cue, nie ogólniki. Np. "kolana na zewnątrz w dole przysiadu" nie "popraw technikę".
- Gdy sugerujesz ciężar: podawaj dokładne kg (zaokrąglaj do 2.5). Uzasadniaj na podstawie RPE i e1RM.
- Uwzględniaj fazę cyklu — inne rady w hipertrofii, inne w peakingu.
${targetsText ? `- Monitoruj progres w stronę celów (${targetsText}). Jeśli tempo progresji jest niedostateczne, zasugeruj korekty.` : ''}
- Odpowiadaj krótko i na temat.`;
}

export function buildAnalysisPrompt(
  settings: UserSettings,
  program: GeneratedProgram | null
): string {
  return buildCoachSystemPrompt(settings, program, []) +
    '\n\nTwoje zadanie: przeanalizuj podany trening. Oceń wykonanie, porównaj plan z realizacją, zwróć uwagę na RPE i objętość. Daj 2-3 konkretne rady na następny trening. Format: krótkie akapity, bez list dłuższych niż 5 punktów.';
}

/**
 * Build prompt for AI-powered program generation.
 * The AI selects exercises for training days based on user profile.
 * Returns structured JSON that maps to DayTemplate[].
 */
export function buildProgramGenerationPrompt(settings: UserSettings): string {
  const { profile, oneRepMaxes, deadliftVariant, schedule, goals, weakPoints } = settings;
  const dlName = deadliftVariant === 'sumo' ? 'Sumo' : 'Conventional';
  const total = oneRepMaxes.squat + oneRepMaxes.bench + oneRepMaxes.deadlift;

  const prioritiesText = goals.priorities?.length
    ? `- Priorytety: ${goals.priorities.join(', ')}`
    : '';
  const targetsText = [
    goals.targetSquat && `przysiad ${goals.targetSquat} kg`,
    goals.targetBench && `ławka ${goals.targetBench} kg`,
    goals.targetDeadlift && `martwy ${goals.targetDeadlift} kg`,
  ].filter(Boolean).join(', ');

  // Analyze which lifts need the most improvement (ambitious targets)
  const targetEmphasis = getTargetEmphasis(oneRepMaxes, goals);

  // Determine exercise count based on session duration
  const exercisesPerDay = schedule.sessionDuration <= 60 ? 5 : schedule.sessionDuration <= 75 ? 6 : schedule.sessionDuration >= 120 ? 8 : 6;
  const accessoryCount = exercisesPerDay - 3; // 3 compound slots (main + 2 variations)

  // Day labels from preferred days
  const dayLabels = getDayLabelsFromSchedule(schedule.preferredDays);

  // Goal-specific instructions
  const goalInstructions = getGoalInstructions(goals.primary, accessoryCount);

  return `Jesteś elitarnym trenerem trójboju siłowego z głęboką wiedzą o evidence-based programowaniu. Twój dobór ćwiczeń opiera się na:

WIEDZA BAZOWA:
- Specificity principle: główne boje i ich bliskie warianty to fundament siły (Helms, Nuckols)
- Volume landmarks: MV→MEV→MAV→MRV — dobierz wolumen akcesorii pod poziom zawodnika (Mike Israetel / RP)
- SRA curves: różne grupy mięśniowe regenerują się w różnym tempie — uwzględnij to w rozłożeniu na dni
- Weak point analysis: warianty techniczne powinny celować w konkretny sticking point (Tsarindis, Nippard)
- Compound > isolation dla akcesorii siłowych, ale izolacja ma miejsce dla hipertrofii i prewencji kontuzji
- Stretch-mediated hypertrophy: preferuj ćwiczenia w wydłużeniu mięśnia (RDL, incline curl, overhead tricep) — najnowsze badania potwierdzają wyższą hipertrofię
- Balans push/pull: stosunek co najmniej 1:1 dla zdrowia barków
- Prewencja: rotator cuff, adduktory, hamstringi — szczególnie ważne w trójboju

PROFIL ZAWODNIKA:
- Masa ciała: ${profile.bodyWeight} kg, wzrost: ${profile.height} cm, wiek: ${profile.age} lat
- Staż treningowy: ${profile.yearsTraining} lat
- 1RM: Przysiad ${oneRepMaxes.squat} kg, Ława ${oneRepMaxes.bench} kg, Martwy ciąg (${deadliftVariant}) ${oneRepMaxes.deadlift} kg
- Total: ${total} kg | Wilks: ~${Math.round(total * 500 / (profile.bodyWeight * 6.5))}
- Długość sesji: ${schedule.sessionDuration} min → ${exercisesPerDay} ćwiczeń na sesję
- Cel główny: ${goals.primary}
${prioritiesText}
${targetsText ? `- Cele na koniec cyklu: ${targetsText}` : ''}
${targetEmphasis ? `- PRIORYTET WOLUMENU: ${targetEmphasis}` : ''}
${goals.hasCompetition ? `- Zawody: ${goals.competitionDate} — program musi peakować pod tę datę` : ''}
- Wariant martwego: ${dlName}
- Słabe boje: ${weakPoints.lifts.join(', ') || 'brak'}
- Słabe partie mięśniowe: ${weakPoints.muscleGroups.join(', ') || 'brak'}
- Problemy techniczne: ${weakPoints.technicalIssues.join(', ') || 'brak'}

${goalInstructions}

DOBÓR WARIANTÓW TECHNICZNYCH — dopasuj do zgłoszonych problemów:
- Dół przysiadu → Pause Squat (2-3s), Tempo Squat (3s ekscentryk), Pin Squat
- Lockout przysiadu → Belt Squat, Front Squat, Anderson Squat
- Odbicie na klatce → Spoto Press (1-2cm nad klatką), Tempo Bench (3s ekscentryk)
- Lockout ławy → Floor Press, Board Press, Close Grip Bench, Pin Press
- Zerwanie z podłogi → Deficit Deadlift, Pause Deadlift (1s pod kolanami)
- Lockout martwego → Block Pull, Rack Pull, RDL ciężki
- Pozycja startu → Tempo Deadlift (kontrolowany start), Pause at Knee

DOBÓR AKCESORII — kieruj się priorytetami zawodnika i zasadą stretch-mediated hypertrophy:
- Plecy: podciągania (z obciążeniem dla zaawansowanych), wiosłowanie, face pull, pullover
- Nogi: RDL, Bulgarian Split Squat, Leg Curl (seated > lying), Hip Adduction, Leg Extension
- Ramiona: Overhead Tricep Extension (long head), Incline Curl, Hammer Curl
- Barki: Lateral Raise, Rear Delt Fly, Lu Raise
- Prewencja: Band Pull-apart, External Rotation, Copenhagen Adduction
- Core: Pallof Press, Ab Wheel, Hanging Leg Raise

STRUKTURA — 4 DNI:
- Dzień 1 (${dayLabels[0]}): Przysiad ciężki (topset + backoff) + ława wolumen + ${accessoryCount - 1} akcesoria
- Dzień 2 (${dayLabels[1]}): Martwy ciężki (topset + backoff) + ława techniczna + ${accessoryCount - 1} akcesoria
- Dzień 3 (${dayLabels[2]}): Ława ciężka (topset + backoff) + przysiad wolumen + ${accessoryCount - 1} akcesoria
- Dzień 4 (${dayLabels[3]}): Martwy wolumen + ${accessoryCount} akcesoria (nogi, plecy, prewencja)

ZASADY:
1. Każdy dzień ma DOKŁADNIE ${exercisesPerDay} ćwiczeń
2. Pierwsze ćwiczenie = główny bój z topsetem (tag: "main", hasBackoff: true)
3. Drugie/trzecie = warianty techniczne lub wolumenowe głównych bojów — dobrane pod problemy techniczne
4. Reszta = akcesoria dobrane pod słabe punkty i priorytety zawodnika
5. Tygodniowy wolumen na grupę: plecy 10-20 serii, nogi (poza bojami) 6-12, ramiona 6-10, core 4-6
6. Nazwy ćwiczeń po polsku (z angielską nazwą w nawiasie)
7. Zakresy powtórzeń akcesorii: 3×5-8 (siłowe), 3×8-12 (hipertrofia), 3×12-20 (izolacja/prewencja)

Dla ćwiczeń z automatyczną wagą ustaw liftType i weightType:
- liftType: "squat", "bench" lub "deadlift"
- weightType: "topset", "volume", "technical"
Dla akcesorii NIE ustawiaj liftType/weightType.

Odpowiedz TYLKO prawidłowym JSON-em, bez markdown, bez komentarzy. Format:
[
  {
    "dayNumber": 1,
    "label": "Dzień 1",
    "dayOfWeek": "${dayLabels[0]}",
    "focus": "opis skupienia dnia",
    "exercises": [
      { "name": "Przysiad (Back Squat)", "tag": "main", "liftType": "squat", "weightType": "topset", "hasBackoff": true },
      { "name": "Pause Squat", "tag": "technical", "liftType": "squat", "weightType": "technical", "fixedSets": 3, "fixedReps": 3, "note": "Pauza 2s w dole" },
      { "name": "Akcesorium", "tag": "accessory", "fixedSets": 3, "fixedReps": 12 }
    ]
  }
]`;
}

function getGoalInstructions(goal: string, accessoryCount: number): string {
  switch (goal) {
    case 'powerbuilding':
      return `CEL: POWERBUILDING — siła + hipertrofia
- Boje główne: standardowe topset + backoff (jak powerlifting)
- Akcesoria: więcej pracy hipertroficznej — preferuj 3×8-15 z kontrolowanym tempem
- Dodaj izolację na słabe partie (${accessoryCount} akcesorii — wykorzystaj wszystkie)
- Minimalna przerwa między seriami akcesorii: 60-90s (superset gdzie możliwe)
- Uwzględnij przynajmniej 1 ćwiczenie na biceps i 1 na triceps tygodniowo`;
    case 'hypertrophy':
      return `CEL: HIPERTROFIA — masa mięśniowa (boje główne jako baza siłowa)
- Boje główne: standardowe topset + backoff, ale z wyższymi powtórzeniami backoff (+2-3)
- Warianty techniczne zastąp wariantami wolumenowymi (np. zamiast pause squat → front squat 3×8)
- Akcesoria: 3-4×8-15, fokus na stretch-mediated exercises i mind-muscle connection
- Każdy dzień powinien pokrywać ≥3 grupy mięśniowe akcesorycznie
- Dodaj direct arm work (biceps + triceps) i lateral raises`;
    default: // powerlifting
      return `CEL: POWERLIFTING — maksymalna siła w SBD
- Boje główne: ciężkie topsety + backoff to priorytet
- Warianty techniczne: dobrane ściśle pod sticking points
- Akcesoria: wspierające siłę w bojach głównych — compound > isolation
- Prewencja kontuzji: face pull, adduktory, rotator cuff`;
  }
}

/**
 * Analyze target ambitiousness per lift.
 * If one lift has a proportionally bigger target gap, tell the AI to emphasize it.
 */
function getTargetEmphasis(
  maxes: { squat: number; bench: number; deadlift: number },
  goals: { targetSquat?: number; targetBench?: number; targetDeadlift?: number }
): string | null {
  const gaps: Array<{ name: string; percent: number }> = [];
  if (goals.targetSquat && maxes.squat > 0) {
    gaps.push({ name: 'przysiad', percent: ((goals.targetSquat - maxes.squat) / maxes.squat) * 100 });
  }
  if (goals.targetBench && maxes.bench > 0) {
    gaps.push({ name: 'ławka', percent: ((goals.targetBench - maxes.bench) / maxes.bench) * 100 });
  }
  if (goals.targetDeadlift && maxes.deadlift > 0) {
    gaps.push({ name: 'martwy', percent: ((goals.targetDeadlift - maxes.deadlift) / maxes.deadlift) * 100 });
  }
  if (gaps.length < 2) return null;

  gaps.sort((a, b) => b.percent - a.percent);
  const most = gaps[0];
  const avg = gaps.reduce((s, g) => s + g.percent, 0) / gaps.length;

  // Only flag if the top lift needs significantly more than average
  if (most.percent > avg + 3) {
    return `${most.name} potrzebuje największego progresu (+${most.percent.toFixed(0)}% do celu). Daj więcej wolumenu i akcesorii wspierających ten bój.`;
  }
  return null;
}

function getDayLabelsFromSchedule(preferredDays: string[]): string[] {
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

/** Parse AI response JSON into DayTemplate[] with validation */
export function parseAIProgram(raw: string): DayTemplate[] | null {
  try {
    // Try to extract JSON from the response (AI might wrap in markdown)
    let jsonStr = raw.trim();
    const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed) || parsed.length !== 4) return null;

    const validTags = ['main', 'technical', 'volume', 'accessory', 'supplemental'];
    const validLiftTypes = ['squat', 'bench', 'deadlift'];
    const validWeightTypes = ['topset', 'volume', 'technical'];

    const templates: DayTemplate[] = parsed.map((day: Record<string, unknown>, i: number) => {
      const exercises = (day.exercises as Record<string, unknown>[]) ?? [];
      if (exercises.length < 4 || exercises.length > 8) throw new Error('Invalid exercise count');

      return {
        dayNumber: (i + 1) as 1 | 2 | 3 | 4,
        label: String(day.label || `Dzień ${i + 1}`),
        dayOfWeek: String(day.dayOfWeek || ['Pon', 'Wt', 'Czw', 'Pt'][i]),
        focus: String(day.focus || ''),
        exercises: exercises.map((ex): ExerciseTemplate => {
          const tag = validTags.includes(String(ex.tag)) ? String(ex.tag) as ExerciseTemplate['tag'] : 'accessory';
          const tmpl: ExerciseTemplate = {
            name: String(ex.name || 'Ćwiczenie'),
            tag,
          };

          if (ex.liftType && validLiftTypes.includes(String(ex.liftType))) {
            tmpl.liftType = String(ex.liftType) as 'squat' | 'bench' | 'deadlift';
          }
          if (ex.weightType && validWeightTypes.includes(String(ex.weightType))) {
            tmpl.weightType = String(ex.weightType) as 'topset' | 'volume' | 'technical';
          }
          if (ex.hasBackoff) tmpl.hasBackoff = true;
          if (typeof ex.fixedSets === 'number') tmpl.fixedSets = ex.fixedSets;
          if (typeof ex.fixedReps === 'number') tmpl.fixedReps = ex.fixedReps;
          if (ex.note) tmpl.note = String(ex.note);

          return tmpl;
        }),
      };
    });

    // Validate: each day should have at least one main/volume lift with liftType
    for (const day of templates) {
      const hasMainLift = day.exercises.some((e) => e.liftType && e.weightType);
      if (!hasMainLift) return null;
    }

    return templates;
  } catch {
    return null;
  }
}
