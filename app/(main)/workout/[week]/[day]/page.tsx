'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Timer,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Bot,
  Loader2,
  Info,
  X,
} from 'lucide-react';
import { getProgram, getWorkoutLog, saveWorkoutLog, getAnthropicKey, getApiKey, getGeminiKey, getUserSettings, runAutoregulation, getAccessoryProgress, saveAccessoryProgress, setActiveWorkout, clearActiveWorkout } from '@/lib/storage';
import { updateAccessoryAfterWorkout, getSuggestedWeight } from '@/lib/accessory-progression';
import type { AccessoryProgressionState } from '@/lib/types';
import { getWeekDays } from '@/lib/program-generator';
import { buildAnalysisPrompt } from '@/lib/ai-prompts';
import { getExerciseNote } from '@/lib/exercise-notes';
import { TAG_LABELS, TAG_COLORS, PHASE_LABELS, PHASE_COLORS } from '@/lib/constants';
import type { GeneratedProgram, WorkoutDay, Exercise, WorkoutLog, LoggedSet, Phase } from '@/lib/types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function RestTimer({ defaultSeconds, trigger }: { defaultSeconds: number; trigger: number }) {
  const [timeLeft, setTimeLeft] = useState(defaultSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-start when trigger changes (set completed)
  useEffect(() => {
    if (trigger > 0) {
      setTimeLeft(defaultSeconds);
      setRunning(true);
    }
  }, [trigger, defaultSeconds]);

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setRunning(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, timeLeft]);

  const reset = () => {
    setTimeLeft(defaultSeconds);
    setRunning(false);
  };

  const toggle = () => {
    if (timeLeft === 0) {
      setTimeLeft(defaultSeconds);
      setRunning(true);
    } else {
      setRunning(!running);
    }
  };

  return (
    <div className="flex items-center gap-2 mb-3">
      <button
        onClick={toggle}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-sm font-medium hover:bg-muted/80 transition-colors"
      >
        {running ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
        <Timer className="size-3.5" />
        <span className={timeLeft === 0 ? 'text-emerald-600 font-bold' : ''}>
          {formatTime(timeLeft)}
        </span>
      </button>
      <button
        onClick={reset}
        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
      >
        <RotateCcw className="size-3.5 text-muted-foreground" />
      </button>
    </div>
  );
}

interface SetInputProps {
  setIndex: number;
  plannedWeight: number;
  plannedReps: number;
  logged: LoggedSet | undefined;
  onUpdate: (set: LoggedSet) => void;
  onSetDone?: () => void;
  targetRPE?: string;
}

function SetInput({ setIndex, plannedWeight, plannedReps, logged, onUpdate, onSetDone, targetRPE }: SetInputProps) {
  const [actualWeight, setActualWeight] = useState(logged?.actualWeight ?? plannedWeight);
  const [actualReps, setActualReps] = useState(logged?.actualReps ?? plannedReps);
  const [rpe, setRpe] = useState(logged?.rpe ?? 0);
  const [done, setDone] = useState(!!logged);

  const handleDone = (checked: boolean) => {
    setDone(checked);
    if (checked) {
      onUpdate({
        exerciseId: '',
        setNumber: setIndex + 1,
        plannedWeight,
        plannedReps,
        actualWeight,
        actualReps,
        rpe: rpe > 0 ? rpe : undefined,
      });
      onSetDone?.();
    }
  };

  return (
    <div className={`grid grid-cols-[2rem_1fr_auto_1fr_1fr_1.5rem] items-center gap-1.5 py-1.5 ${done ? 'opacity-60' : ''}`}>
      <span className="text-xs text-muted-foreground text-center">{setIndex + 1}</span>
      <Input
        type="number"
        value={actualWeight || ''}
        onChange={(e) => setActualWeight(Number(e.target.value))}
        className="h-9 text-center"
        placeholder="kg"
      />
      <span className="text-xs text-muted-foreground">×</span>
      <Input
        type="number"
        value={actualReps || ''}
        onChange={(e) => setActualReps(Number(e.target.value))}
        className="h-9 text-center"
        placeholder="reps"
      />
      <Input
        type="number"
        value={rpe || ''}
        onChange={(e) => setRpe(Number(e.target.value))}
        className="h-9 text-center"
        placeholder={targetRPE ?? 'RPE'}
        min={1}
        max={10}
      />
      <Checkbox checked={done} onCheckedChange={(c) => handleDone(c === true)} className="size-5" />
    </div>
  );
}

/** Target RPE based on training phase and exercise role */
function getTargetRPE(phase: Phase, tag: Exercise['tag'], isBackoff?: boolean): string {
  if (isBackoff) {
    // Backoff sets are always lighter — lower RPE target
    return phase === 'peaking' ? '7-8' : '6-7';
  }
  switch (tag) {
    case 'main':
      switch (phase) {
        case 'hypertrophy': return '7-8';
        case 'strength': return '8-9';
        case 'peaking': return '9-9.5';
        case 'test': return '10';
        case 'deload': return '6-7';
      }
      break;
    case 'volume':
      switch (phase) {
        case 'hypertrophy': return '7-8';
        case 'strength': return '7-8';
        case 'peaking': return '8';
        case 'deload': return '6';
        default: return '7-8';
      }
      break;
    case 'technical':
      return phase === 'deload' ? '5-6' : '6-7';
    case 'accessory':
    case 'supplemental':
      return phase === 'deload' ? '6' : '7-8';
  }
  return '7-8';
}

function ExerciseCard({
  exercise,
  loggedSets,
  onUpdateSet,
  suggestedWeight,
  phase,
}: {
  exercise: Exercise;
  loggedSets: LoggedSet[];
  onUpdateSet: (exerciseId: string, set: LoggedSet) => void;
  suggestedWeight?: number | null;
  phase: Phase;
}) {
  const [expanded, setExpanded] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [restTrigger, setRestTrigger] = useState(0);

  const exerciseNote = exercise.note || getExerciseNote(exercise.name);
  const effectiveWeight = exercise.plannedWeight ?? suggestedWeight ?? 0;

  const topSets: Array<{ weight: number; reps: number }> = [];
  for (let i = 0; i < exercise.plannedSets; i++) {
    topSets.push({
      weight: effectiveWeight,
      reps: exercise.plannedReps,
    });
  }

  const backoffSets: Array<{ weight: number; reps: number }> = [];
  if (exercise.isBackoff && exercise.backoffSets) {
    for (let i = 0; i < exercise.backoffSets; i++) {
      backoffSets.push({
        weight: exercise.backoffWeight ?? 0,
        reps: exercise.backoffReps ?? exercise.plannedReps,
      });
    }
  }

  const hasBackoff = backoffSets.length > 0;
  const restTime = exercise.tag === 'main' || exercise.tag === 'technical' ? 210 : 150;
  const targetRPE = getTargetRPE(phase, exercise.tag);
  const backoffTargetRPE = getTargetRPE(phase, exercise.tag, true);

  const setsHeader = (
    <div className="grid grid-cols-[2rem_1fr_auto_1fr_1fr_1.5rem] items-center gap-1.5 text-xs text-muted-foreground mb-1">
      <span className="text-center">Set</span>
      <span className="text-center">Ciężar</span>
      <span />
      <span className="text-center">Powt.</span>
      <span className="text-center">RPE</span>
      <span className="flex justify-center"><CheckCircle2 className="size-3" /></span>
    </div>
  );

  return (
    <>
    <Card className="mb-3">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Badge className={`text-[10px] px-1.5 py-0 shrink-0 ${TAG_COLORS[exercise.tag]}`}>
              {TAG_LABELS[exercise.tag]}
            </Badge>
            <span className="text-sm font-medium truncate">{exercise.name}</span>
            {exerciseNote && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowInfo(true); }}
                className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
              >
                <Info className="size-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground">
              {exercise.plannedSets}×{exercise.plannedReps}
              {exercise.plannedWeight ? ` @ ${exercise.plannedWeight}kg` : ''}
            </span>
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          <RestTimer defaultSeconds={restTime} trigger={restTrigger} />

          {!exercise.plannedWeight && suggestedWeight && suggestedWeight > 0 && (
            <p className="text-xs text-emerald-600 font-medium mb-2 mt-2">
              Sugerowane: {suggestedWeight} kg
            </p>
          )}

          {/* Topset block */}
          {hasBackoff && (
            <p className="text-xs font-semibold text-foreground mb-1 mt-1">
              Topset — {exercise.plannedSets}×{exercise.plannedReps} @ {exercise.plannedWeight}kg
            </p>
          )}
          {setsHeader}
          {topSets.map((s, i) => (
            <SetInput
              key={`top-${i}`}
              setIndex={i}
              plannedWeight={s.weight}
              plannedReps={s.reps}
              logged={loggedSets.find((ls) => ls.setNumber === i + 1)}
              onUpdate={(set) => onUpdateSet(exercise.id, { ...set, exerciseId: exercise.id, setNumber: i + 1 })}
              onSetDone={() => setRestTrigger((t) => t + 1)}
              targetRPE={targetRPE}
            />
          ))}

          {/* Backoff block */}
          {hasBackoff && (
            <>
              <div className="my-3 border-t border-dashed border-border" />
              <p className="text-xs font-semibold text-foreground mb-1">
                Backoff — {exercise.backoffSets}×{exercise.backoffReps} @ {exercise.backoffWeight}kg
              </p>
              {setsHeader}
              {backoffSets.map((s, i) => {
                const globalIndex = topSets.length + i;
                return (
                  <SetInput
                    key={`bo-${i}`}
                    setIndex={globalIndex}
                    plannedWeight={s.weight}
                    plannedReps={s.reps}
                    logged={loggedSets.find((ls) => ls.setNumber === globalIndex + 1)}
                    onUpdate={(set) => onUpdateSet(exercise.id, { ...set, exerciseId: exercise.id, setNumber: globalIndex + 1 })}
                    onSetDone={() => setRestTrigger((t) => t + 1)}
                    targetRPE={backoffTargetRPE}
                  />
                );
              })}
            </>
          )}
        </CardContent>
      )}
    </Card>

      {showInfo && exerciseNote && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4" onClick={() => setShowInfo(false)}>
          <div className="bg-background rounded-xl shadow-xl p-5 max-w-sm w-full space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-semibold pr-4">{exercise.name}</h3>
              <button type="button" onClick={() => setShowInfo(false)} className="text-muted-foreground hover:text-foreground shrink-0">
                <X className="size-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{exerciseNote}</p>
          </div>
        </div>
      )}
    </>
  );
}

export default function WorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const weekNum = Number(params.week);
  const dayNum = Number(params.day);

  const [program, setProgram] = useState<GeneratedProgram | null>(null);
  const [workout, setWorkout] = useState<WorkoutDay | null>(null);
  const [loggedSets, setLoggedSets] = useState<Map<string, LoggedSet[]>>(new Map());
  const [note, setNote] = useState('');
  const [startTime] = useState(new Date().toISOString());
  const [elapsed, setElapsed] = useState(0);
  const [accProgress, setAccProgress] = useState<AccessoryProgressionState>({});
  const [finished, setFinished] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  useEffect(() => {
    const p = getProgram();
    if (p) {
      setProgram(p);
      const days = getWeekDays(p, weekNum);
      setWorkout(days[dayNum - 1] ?? null);
    }

    setAccProgress(getAccessoryProgress());

    // Mark workout as active
    setActiveWorkout({ weekNumber: weekNum, dayNumber: dayNum, startTime: new Date().toISOString() });

    // Load existing log if any
    const existingLog = getWorkoutLog(weekNum, dayNum);
    if (existingLog) {
      setNote(existingLog.generalNote ?? '');
      const setsMap = new Map<string, LoggedSet[]>();
      for (const set of existingLog.sets) {
        const existing = setsMap.get(set.exerciseId) ?? [];
        existing.push(set);
        setsMap.set(set.exerciseId, existing);
      }
      setLoggedSets(setsMap);
    }
  }, [weekNum, dayNum]);

  // Session timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateSet = useCallback((exerciseId: string, set: LoggedSet) => {
    setLoggedSets((prev) => {
      const next = new Map(prev);
      const sets = [...(next.get(exerciseId) ?? [])];
      const idx = sets.findIndex((s) => s.setNumber === set.setNumber);
      if (idx >= 0) {
        sets[idx] = set;
      } else {
        sets.push(set);
      }
      next.set(exerciseId, sets);
      return next;
    });
  }, []);

  const finishWorkout = async () => {
    if (!program || !workout) return;

    const allSets: LoggedSet[] = [];
    loggedSets.forEach((sets) => allSets.push(...sets));

    const log: WorkoutLog = {
      id: getWorkoutLog(weekNum, dayNum)?.id ?? generateId(),
      programId: program.id,
      weekNumber: weekNum,
      dayNumber: dayNum,
      date: new Date().toISOString(),
      startTime,
      endTime: new Date().toISOString(),
      sets: allSets,
      generalNote: note || undefined,
      completed: true,
    };

    // Save workout and run autoregulation
    saveWorkoutLog(log);
    runAutoregulation(weekNum);

    // Update accessory progression tracking
    const updatedAccProgress = updateAccessoryAfterWorkout(accProgress, workout.exercises, allSets);
    saveAccessoryProgress(updatedAccProgress);

    // Clear active workout
    clearActiveWorkout();
    setFinished(true);

    // Auto-trigger AI analysis if API key is available
    const anthropicKey = getAnthropicKey();
    const apiKey = getApiKey();
    const geminiKey = getGeminiKey();
    const settings = getUserSettings();
    if ((!anthropicKey && !apiKey && !geminiKey) || !settings) return;

    setAnalyzing(true);
    setAnalysisError('');

    const setsText = workout.exercises
      .map((ex) => {
        const exSets = loggedSets.get(ex.id) ?? [];
        const setsInfo = exSets
          .map((s) => `  S${s.setNumber}: ${s.actualWeight}kg × ${s.actualReps}${s.rpe ? ` RPE ${s.rpe}` : ''}`)
          .join('\n');
        return `${ex.name} (plan: ${ex.plannedSets}×${ex.plannedReps}${ex.plannedWeight ? ` @ ${ex.plannedWeight}kg` : ''}):\n${setsInfo || '  (brak zalogowanych serii)'}`;
      })
      .join('\n\n');

    const workoutData = `Tydzień ${weekNum}, ${workout.label} — ${workout.focus}\nFaza: ${PHASE_LABELS[program.weeks[weekNum - 1].phase]}\nCzas treningu: ${formatTime(elapsed)}\n${note ? `Notatka: ${note}\n` : ''}\n${setsText}`;

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anthropicKey,
          apiKey,
          geminiKey,
          systemPrompt: buildAnalysisPrompt(settings, program),
          workoutData,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAnalysisError(data.error || 'Błąd analizy');
      } else {
        setAnalysis(data.content);
      }
    } catch {
      setAnalysisError('Nie udało się połączyć z API');
    } finally {
      setAnalyzing(false);
    }
  };

  if (!program || !workout) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Ładowanie treningu...
      </div>
    );
  }

  const weekInfo = program.weeks[weekNum - 1];
  const phaseColors = PHASE_COLORS[weekInfo.phase];

  return (
    <div className="max-w-lg mx-auto px-4 py-4 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold">
            Tydzień {weekNum} / {workout.label}
          </h1>
          <p className="text-sm text-muted-foreground">{workout.focus}</p>
        </div>
        <div className="text-right">
          <Badge className={`${phaseColors.bg} ${phaseColors.text}`}>
            {PHASE_LABELS[weekInfo.phase]}
          </Badge>
          <p className="text-sm font-mono mt-1">{formatTime(elapsed)}</p>
        </div>
      </div>

      {/* Exercises */}
      {workout.exercises.map((ex) => (
        <ExerciseCard
          key={ex.id}
          exercise={ex}
          loggedSets={loggedSets.get(ex.id) ?? []}
          onUpdateSet={handleUpdateSet}
          suggestedWeight={
            (ex.tag === 'accessory' || ex.tag === 'supplemental') && !ex.plannedWeight
              ? getSuggestedWeight(accProgress, ex.name)
              : undefined
          }
          phase={weekInfo.phase}
        />
      ))}

      {/* Notes and finish */}
      <div className="mt-4 space-y-3">
        {!finished ? (
          <>
            <Textarea
              placeholder="Ogólna notatka z treningu..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[80px]"
            />
            <Button onClick={finishWorkout} size="lg" className="w-full h-12">
              <CheckCircle2 className="size-5 mr-2" />
              Zakończ trening
            </Button>
          </>
        ) : (
          <>
            {analyzing && (
              <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                <span className="text-sm">Analizuję trening...</span>
              </div>
            )}

            {analysisError && (
              <p className="text-sm text-destructive">{analysisError}</p>
            )}

            {analysis && (
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="size-4" />
                    <span className="text-sm font-semibold">Coach AI</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">{analysis}</p>
                </CardContent>
              </Card>
            )}

            {!analyzing && (
              <Button
                onClick={() => router.push('/dashboard')}
                size="lg"
                className="w-full h-12"
              >
                Wróć do dashboardu
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
