'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dumbbell, CheckCircle2, ArrowRight, ArrowLeft, Calendar } from 'lucide-react';
import { getUserSettings, getProgram, getWorkoutLogs } from '@/lib/storage';
import { AppTour } from '@/components/layout/AppTour';
import { WorkoutHeatmap } from '@/components/layout/WorkoutHeatmap';
import { getWeekDays } from '@/lib/program-generator';
import { PHASE_LABELS, PHASE_COLORS } from '@/lib/constants';
import { getTrainingLevel, estimatedProgress } from '@/lib/calculations';
import type { UserSettings, GeneratedProgram, WorkoutLog } from '@/lib/types';

function fromSlot(slot: number): { week: number; day: number } {
  return { week: Math.floor(slot / 4) + 1, day: (slot % 4) + 1 };
}

function getAutoSlot(logs: WorkoutLog[], totalSlots: number): number {
  for (let s = 0; s < totalSlots; s++) {
    const { week, day } = fromSlot(s);
    const done = logs.some((l) => l.weekNumber === week && l.dayNumber === day && l.completed);
    if (!done) return s;
  }
  return totalSlots - 1;
}

export default function DashboardPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [program, setProgram] = useState<GeneratedProgram | null>(null);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [slot, setSlot] = useState(0);

  useEffect(() => {
    setSettings(getUserSettings());
    const p = getProgram();
    setProgram(p);
    const allLogs = getWorkoutLogs();
    setLogs(allLogs);
    const totalSlots = p ? p.weeks.length * 4 : 56;
    setSlot(getAutoSlot(allLogs, totalSlots));
  }, []);

  const maxSlot = program ? program.weeks.length * 4 - 1 : 55;
  const prev = useCallback(() => setSlot((s) => Math.max(0, s - 1)), []);
  const next = useCallback(() => setSlot((s) => Math.min(maxSlot, s + 1)), [maxSlot]);

  if (!settings || !program) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Ładowanie...
      </div>
    );
  }

  const { week: currentWeek, day: currentDay } = fromSlot(slot);
  const currentWeekInfo = program.weeks[currentWeek - 1];
  const weekDays = getWeekDays(program, currentWeek);
  const todayWorkout = weekDays[currentDay - 1];
  const todayLogged = logs.some(
    (l) => l.weekNumber === currentWeek && l.dayNumber === currentDay && l.completed
  );

  const completedWorkouts = logs.filter((l) => l.completed).length;
  const totalWorkouts = program.weeks.length * 4;
  const progressPercent = (completedWorkouts / totalWorkouts) * 100;

  const baseMaxes = settings.oneRepMaxes;
  const baseTotal = baseMaxes.squat + baseMaxes.bench + baseMaxes.deadlift;
  const level = getTrainingLevel(settings.profile.yearsTraining, settings.profile.bodyWeight, baseTotal);
  const effectiveMaxes = program.effectiveOneRepMaxes ?? baseMaxes;

  const lifts = [
    { name: 'Przysiad', base: baseMaxes.squat, current: effectiveMaxes.squat, target: settings.goals.targetSquat || estimatedProgress(baseMaxes.squat, level, settings.profile.bodyWeight, baseMaxes.squat + baseMaxes.bench + baseMaxes.deadlift) },
    { name: 'Ława', base: baseMaxes.bench, current: effectiveMaxes.bench, target: settings.goals.targetBench || estimatedProgress(baseMaxes.bench, level, settings.profile.bodyWeight, baseMaxes.squat + baseMaxes.bench + baseMaxes.deadlift) },
    { name: 'Martwy', base: baseMaxes.deadlift, current: effectiveMaxes.deadlift, target: settings.goals.targetDeadlift || estimatedProgress(baseMaxes.deadlift, level, settings.profile.bodyWeight, baseMaxes.squat + baseMaxes.bench + baseMaxes.deadlift) },
  ];

  const recentLogs = [...logs]
    .filter((l) => l.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const phaseColors = PHASE_COLORS[currentWeekInfo.phase];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <AppTour />
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Hej, {settings.profile.name}!</h1>
        <p className="text-sm text-muted-foreground">
          Tydzień {currentWeek}/{program.weeks.length} — {PHASE_LABELS[currentWeekInfo.phase]}
        </p>
      </div>

      {/* Workout heatmap */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Aktywność treningowa</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkoutHeatmap logs={logs} plannedDays={settings.schedule.preferredDays} />
        </CardContent>
      </Card>

      {/* Today's workout */}
      <Card id="tour-workout" className={`mb-4 border ${phaseColors.border}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Dumbbell className="size-4" />
              Następny trening
            </CardTitle>
            <Badge className={`${phaseColors.bg} ${phaseColors.text}`}>
              {PHASE_LABELS[currentWeekInfo.phase]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Navigation arrows */}
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={prev}
              disabled={slot === 0}
              className="size-9"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="text-center">
              <p className="text-sm font-semibold">
                Tydzień {currentWeek} / {todayWorkout.label}
              </p>
              <p className="text-xs text-muted-foreground">{todayWorkout.focus}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={next}
              disabled={slot === maxSlot}
              className="size-9"
            >
              <ArrowRight className="size-4" />
            </Button>
          </div>

          {todayLogged ? (
            <div className="flex items-center gap-3 py-2">
              <CheckCircle2 className="size-8 text-emerald-500" />
              <div>
                <p className="font-medium text-emerald-700">Trening zaliczony!</p>
                <p className="text-sm text-muted-foreground">{todayWorkout.focus}</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                {todayWorkout.exercises.length} ćwiczeń •{' '}
                {currentWeekInfo.sets}×{currentWeekInfo.reps} @ {Math.round(currentWeekInfo.percentage * 100)}%
              </p>
              <Link href={`/workout/${currentWeek}/${currentDay}`}>
                <Button className="w-full h-12">
                  Rozpocznij trening
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress */}
      <div id="tour-progress" className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Postęp cyklu</p>
          <p className="text-sm text-muted-foreground">
            {completedWorkouts}/{totalWorkouts} treningów
          </p>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Lift progress — hide for hypertrophy goal */}
      {settings.goals.primary !== 'hypertrophy' && <Card id="tour-lifts" className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Progres siłowy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {lifts.map((lift) => {
            const gained = lift.current - lift.base;
            const needed = lift.target - lift.base;
            const percent = needed > 0 ? Math.min(100, Math.max(0, (gained / needed) * 100)) : (lift.current >= lift.target ? 100 : 0);
            const diff = lift.current - lift.base;
            return (
              <div key={lift.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{lift.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {lift.current} kg {diff !== 0 && (
                      <span className={diff > 0 ? 'text-emerald-600' : 'text-red-500'}>
                        ({diff > 0 ? '+' : ''}{diff})
                      </span>
                    )} → {lift.target} kg
                  </span>
                </div>
                <Progress value={percent} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>}

      {/* Recent workouts */}
      <h2 className="font-semibold mb-3">Ostatnie treningi</h2>
      {recentLogs.length === 0 ? (
        <p className="text-sm text-muted-foreground">Brak zalogowanych treningów</p>
      ) : (
        <div className="space-y-2">
          {recentLogs.map((log) => (
            <Card key={log.id}>
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Tydzień {log.weekNumber}, Dzień {log.dayNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.date).toLocaleDateString('pl-PL')}
                      {log.generalNote && ` — ${log.generalNote}`}
                    </p>
                  </div>
                </div>
                <CheckCircle2 className="size-4 text-emerald-500" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
