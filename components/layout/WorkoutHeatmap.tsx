'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { WorkoutLog } from '@/lib/types';

const DAY_LABELS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];
const MONTH_LABELS = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];

interface Props {
  logs: WorkoutLog[];
  plannedDays?: string[]; // e.g. ['monday', 'tuesday', 'thursday', 'friday']
}

function getMondayBasedDay(date: Date): number {
  // JS: 0=Sun..6=Sat → Mon-based: 0=Mon..6=Sun
  return (date.getDay() + 6) % 7;
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = getMondayBasedDay(d);
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

const PLANNED_DAY_MAP: Record<string, number> = {
  monday: 0, tuesday: 1, wednesday: 2, thursday: 3,
  friday: 4, saturday: 5, sunday: 6,
};

export function WorkoutHeatmap({ logs, plannedDays = [] }: Props) {
  const { weeks, monthMarkers, trainedDates, plannedDayIndices, totalWorkouts, currentStreak } = useMemo(() => {
    const trained = new Set<string>();
    logs.filter((l) => l.completed).forEach((l) => {
      const d = new Date(l.date);
      trained.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    });

    const planned = new Set(plannedDays.map((d) => PLANNED_DAY_MAP[d]).filter((d) => d !== undefined));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 20 weeks back
    const totalWeeks = 20;
    const startMonday = getMonday(today);
    startMonday.setDate(startMonday.getDate() - (totalWeeks - 1) * 7);

    const weeksList: Date[][] = [];
    const markers: Array<{ weekIndex: number; label: string }> = [];
    let lastMonth = -1;

    for (let w = 0; w < totalWeeks; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(startMonday);
        date.setDate(startMonday.getDate() + w * 7 + d);
        week.push(date);
      }
      weeksList.push(week);

      const firstOfWeek = week[0];
      if (firstOfWeek.getMonth() !== lastMonth) {
        lastMonth = firstOfWeek.getMonth();
        markers.push({ weekIndex: w, label: MONTH_LABELS[lastMonth] });
      }
    }

    // Current streak
    let streak = 0;
    const cursor = new Date(today);
    // Go back day by day
    while (true) {
      const dayOfWeek = getMondayBasedDay(cursor);
      const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;

      if (planned.has(dayOfWeek)) {
        if (trained.has(key)) {
          streak++;
        } else if (cursor < today) {
          break; // missed a planned day
        }
      }
      cursor.setDate(cursor.getDate() - 1);
      // Don't go back more than 60 days
      if (today.getTime() - cursor.getTime() > 60 * 24 * 60 * 60 * 1000) break;
    }

    return {
      weeks: weeksList,
      monthMarkers: markers,
      trainedDates: trained,
      plannedDayIndices: planned,
      totalWorkouts: trained.size,
      currentStreak: streak,
    };
  }, [logs, plannedDays]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-2xl font-bold">{totalWorkouts}</p>
            <p className="text-[10px] text-muted-foreground">treningów</p>
          </div>
          {currentStreak > 0 && (
            <div>
              <p className="text-2xl font-bold">{currentStreak}</p>
              <p className="text-[10px] text-muted-foreground">z rzędu</p>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-0.5 min-w-0">
          {/* Month labels */}
          <div className="flex gap-0.5 ml-7">
            {weeks.map((_, wi) => {
              const marker = monthMarkers.find((m) => m.weekIndex === wi);
              return (
                <div key={wi} className="w-3 text-[9px] text-muted-foreground">
                  {marker ? marker.label : ''}
                </div>
              );
            })}
          </div>

          {/* Grid rows (Mon-Sun) */}
          {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
            <div key={dayIndex} className="flex items-center gap-0.5">
              <span className="w-6 text-[9px] text-muted-foreground text-right pr-1">
                {dayIndex % 2 === 0 ? DAY_LABELS[dayIndex] : ''}
              </span>
              {weeks.map((week, wi) => {
                const date = week[dayIndex];
                const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                const isTrained = trainedDates.has(key);
                const isPlanned = plannedDayIndices.has(dayIndex);
                const isFuture = date > today;
                const isToday = date.getTime() === today.getTime();
                const isMissed = isPlanned && !isTrained && !isFuture && date < today;

                return (
                  <div
                    key={wi}
                    className={cn(
                      'size-3 rounded-sm transition-colors',
                      isFuture && isPlanned && 'bg-muted-foreground/10',
                      isFuture && !isPlanned && 'bg-muted/20',
                      !isFuture && !isTrained && isPlanned && 'bg-muted-foreground/15',
                      !isFuture && !isTrained && !isPlanned && 'bg-muted/30',
                      isTrained && 'bg-foreground',
                      isToday && 'ring-1 ring-foreground',
                    )}
                    title={`${date.toLocaleDateString('pl-PL')}${isTrained ? ' — trening' : isMissed ? ' — pominięty' : ''}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
