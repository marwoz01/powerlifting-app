'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2 } from 'lucide-react';
import { getProgram, getWorkoutLogs } from '@/lib/storage';
import { getWeekDays } from '@/lib/program-generator';
import { PHASE_LABELS, PHASE_COLORS, TAG_LABELS, TAG_COLORS } from '@/lib/constants';
import type { GeneratedProgram, WorkoutLog, Exercise, Phase } from '@/lib/types';

function ExerciseRow({ exercise }: { exercise: Exercise }) {
  return (
    <div className="py-2.5 border-b border-border last:border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className={`text-[10px] px-1.5 py-0 ${TAG_COLORS[exercise.tag]}`}>
            {TAG_LABELS[exercise.tag]}
          </Badge>
          <span className="text-sm font-medium">{exercise.name}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {exercise.plannedSets}×{exercise.plannedReps}
          {exercise.plannedWeight ? ` @ ${exercise.plannedWeight} kg` : ''}
        </span>
      </div>
      {exercise.isBackoff && exercise.backoffWeight && (
        <p className="text-xs text-muted-foreground mt-1 ml-14">
          + Backoff: {exercise.backoffSets}×{exercise.backoffReps} @ {exercise.backoffWeight} kg
        </p>
      )}
      {exercise.note && (
        <p className="text-xs text-muted-foreground mt-0.5 ml-14">{exercise.note}</p>
      )}
    </div>
  );
}

export default function ProgramPage() {
  const [program, setProgram] = useState<GeneratedProgram | null>(null);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(1);

  useEffect(() => {
    setProgram(getProgram());
    setLogs(getWorkoutLogs());
  }, []);

  if (!program) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Brak wygenerowanego programu
      </div>
    );
  }

  const weekDays = getWeekDays(program, selectedWeek);
  const currentWeekInfo = program.weeks[selectedWeek - 1];

  const isLogged = (week: number, day: number) =>
    logs.some((l) => l.weekNumber === week && l.dayNumber === day && l.completed);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-1">Program treningowy</h1>
      <p className="text-sm text-muted-foreground mb-6">{program.weeks.length}-tygodniowa periodyzacja blokowa</p>

      {/* Week grid */}
      <div className="flex flex-wrap gap-2 mb-6">
        {program.weeks.map((week) => {
          const colors = PHASE_COLORS[week.phase];
          const allDone = [1, 2, 3, 4].every((d) => isLogged(week.weekNumber, d));
          return (
            <button
              key={week.weekNumber}
              onClick={() => setSelectedWeek(week.weekNumber)}
              className={`relative p-2 rounded-xl text-center transition-all border w-[calc(12.5%-0.5rem)] min-w-[4rem] ${
                selectedWeek === week.weekNumber
                  ? `${colors.bg} ${colors.text} ${colors.border} ring-2 ring-offset-1 ring-ring`
                  : `${colors.bg} ${colors.text} ${colors.border}`
              }`}
            >
              <span className="text-[10px] font-medium block leading-tight">Tydz</span>
              <span className="text-lg font-bold block">{week.weekNumber}</span>
              <span className="text-[9px] block leading-tight">{PHASE_LABELS[week.phase]}</span>
              {allDone && (
                <CheckCircle2 className="size-3.5 text-emerald-600 absolute top-0.5 right-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Week details */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Tydzień {selectedWeek} — {PHASE_LABELS[currentWeekInfo.phase]}
            </CardTitle>
            <Badge className={`${PHASE_COLORS[currentWeekInfo.phase].bg} ${PHASE_COLORS[currentWeekInfo.phase].text}`}>
              {currentWeekInfo.sets}×{currentWeekInfo.reps} @ {Math.round(currentWeekInfo.percentage * 100)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="1">
            <TabsList className="w-full">
              {weekDays.map((day) => (
                <TabsTrigger key={day.dayNumber} value={String(day.dayNumber)} className="flex-1 relative">
                  {day.label}
                  {isLogged(selectedWeek, day.dayNumber) && (
                    <CheckCircle2 className="size-3 text-emerald-600 ml-1" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {weekDays.map((day) => (
              <TabsContent key={day.dayNumber} value={String(day.dayNumber)} className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-sm">{day.focus}</p>
                    <p className="text-xs text-muted-foreground">{day.dayOfWeek}</p>
                  </div>
                  {isLogged(selectedWeek, day.dayNumber) && (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                      Zaliczone
                    </Badge>
                  )}
                </div>
                <div>
                  {day.exercises.map((ex) => (
                    <ExerciseRow key={ex.id} exercise={ex} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
