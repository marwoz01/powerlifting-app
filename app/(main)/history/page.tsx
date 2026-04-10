'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useStorage } from '@/lib/hooks/use-storage';
import { getWeekDays } from '@/lib/program-generator';
import { PHASE_LABELS, PHASE_COLORS } from '@/lib/constants';
import type { WorkoutLog, GeneratedProgram } from '@/lib/types';

function WorkoutDetail({ log, program }: { log: WorkoutLog; program: GeneratedProgram | null }) {
  const [expanded, setExpanded] = useState(false);

  const weekInfo = program?.weeks[(log.weekNumber - 1)];
  const phaseColors = weekInfo ? PHASE_COLORS[weekInfo.phase] : null;

  const duration = log.endTime
    ? Math.round((new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / 60000)
    : null;

  let focus = '';
  if (program) {
    const days = getWeekDays(program, log.weekNumber);
    const day = days[log.dayNumber - 1];
    if (day) focus = day.focus;
  }

  const exerciseSets = new Map<string, typeof log.sets>();
  for (const set of log.sets) {
    const existing = exerciseSets.get(set.exerciseId) ?? [];
    existing.push(set);
    exerciseSets.set(set.exerciseId, existing);
  }

  const exerciseNames = new Map<string, string>();
  if (program) {
    const days = getWeekDays(program, log.weekNumber);
    const day = days[log.dayNumber - 1];
    if (day) {
      for (const ex of day.exercises) {
        exerciseNames.set(ex.id, ex.name);
      }
    }
  }

  return (
    <Card>
      <CardContent className="py-3">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-3">
            <Calendar className="size-4 text-muted-foreground shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">
                  Tydzień {log.weekNumber}, Dzień {log.dayNumber}
                </p>
                {weekInfo && phaseColors && (
                  <Badge className={`text-[10px] px-1.5 py-0 ${phaseColors.bg} ${phaseColors.text}`}>
                    {PHASE_LABELS[weekInfo.phase]}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(log.date).toLocaleDateString('pl-PL', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
                {focus && ` — ${focus}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {duration && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" />
                {duration} min
              </div>
            )}
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </div>
        </div>

        {log.generalNote && (
          <p className="text-xs text-muted-foreground mt-1 ml-7">{log.generalNote}</p>
        )}

        {expanded && (
          <div className="mt-3 pt-3 border-t space-y-2">
            {Array.from(exerciseSets.entries()).map(([exerciseId, sets]) => (
              <div key={exerciseId} className="text-sm">
                <p className="font-medium text-xs mb-1">
                  {exerciseNames.get(exerciseId) ?? exerciseId}
                </p>
                {sets.map((set, i) => (
                  <p key={i} className="text-xs text-muted-foreground ml-3">
                    S{set.setNumber}: {set.actualWeight}kg × {set.actualReps}
                    {set.rpe ? ` @ RPE ${set.rpe}` : ''}
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function HistoryPage() {
  const storage = useStorage();
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [program, setProgram] = useState<GeneratedProgram | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storage.isReady) return;
    async function load() {
      const [allLogs, prog] = await Promise.all([
        storage.getWorkoutLogs(),
        storage.getProgram(),
      ]);
      setLogs(
        allLogs
          .filter((l) => l.completed)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
      setProgram(prog);
      setLoading(false);
    }
    load();
  }, [storage.isReady]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-1">Historia treningów</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {logs.length} {logs.length === 1 ? 'trening' : logs.length < 5 ? 'treningi' : 'treningów'} zalogowanych
      </p>

      {logs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Brak zalogowanych treningów</p>
          <p className="text-sm mt-1">Zacznij swój pierwszy trening z dashboardu!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <WorkoutDetail key={log.id} log={log} program={program} />
          ))}
        </div>
      )}
    </div>
  );
}
