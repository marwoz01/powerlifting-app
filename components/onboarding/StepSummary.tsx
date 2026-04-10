'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { UserSettings } from '@/lib/types';
import { wilksScore, getTrainingLevel, estimatedProgress } from '@/lib/calculations';
import { DAYS_OF_WEEK, MUSCLE_GROUPS, TECHNICAL_ISSUES } from '@/lib/constants';

interface Props {
  settings: UserSettings;
}

export function StepSummary({ settings }: Props) {
  const { profile, oneRepMaxes, schedule, goals, weakPoints } = settings;
  const total = oneRepMaxes.squat + oneRepMaxes.bench + oneRepMaxes.deadlift;
  const wilks = wilksScore(total, profile.bodyWeight);
  const level = getTrainingLevel(profile.yearsTraining, profile.bodyWeight, total);

  const levelLabel = level === 'beginner' ? 'początkujący' : level === 'intermediate' ? 'średniozaawansowany' : 'zaawansowany';
  const gainPercent = wilks < 300 ? 8.5 : wilks < 370 ? 5.5 : wilks < 430 ? 3 : 1.5;
  const totalWeeks = level === 'intermediate' ? 14 : 16;
  const hasTargets = !!(goals.targetSquat || goals.targetBench || goals.targetDeadlift);
  const bw = profile.bodyWeight;
  const targetSquat = goals.targetSquat || estimatedProgress(oneRepMaxes.squat, level, bw, total);
  const targetBench = goals.targetBench || estimatedProgress(oneRepMaxes.bench, level, bw, total);
  const targetDeadlift = goals.targetDeadlift || estimatedProgress(oneRepMaxes.deadlift, level, bw, total);
  const targetTotal = targetSquat + targetBench + targetDeadlift;
  const targetWilks = wilksScore(targetTotal, profile.bodyWeight);

  const dayLabels = schedule.preferredDays
    .map((d) => DAYS_OF_WEEK.find((dw) => dw.value === d)?.label)
    .filter(Boolean)
    .join(', ');

  const muscleLabels = weakPoints.muscleGroups
    .map((m) => MUSCLE_GROUPS.find((mg) => mg.value === m)?.label)
    .filter(Boolean);

  const techLabels = weakPoints.technicalIssues
    .map((t) => TECHNICAL_ISSUES.find((ti) => ti.value === t)?.label)
    .filter(Boolean);

  return (
    <div className="space-y-4 pt-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p><span className="text-muted-foreground">Imię:</span> {profile.name}</p>
          <p><span className="text-muted-foreground">Masa ciała:</span> {profile.bodyWeight} kg</p>
          <p><span className="text-muted-foreground">Wzrost:</span> {profile.height} cm</p>
          <p><span className="text-muted-foreground">Wiek:</span> {profile.age} lat</p>
          <p><span className="text-muted-foreground">Staż:</span> {profile.yearsTraining} lat ({level === 'beginner' ? 'początkujący' : level === 'intermediate' ? 'średniozaawansowany' : 'zaawansowany'})</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Aktualne 1RM</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Przysiad</p>
              <p className="text-xl font-bold">{oneRepMaxes.squat} kg</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ława</p>
              <p className="text-xl font-bold">{oneRepMaxes.bench} kg</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Martwy ({settings.deadliftVariant})</p>
              <p className="text-xl font-bold">{oneRepMaxes.deadlift} kg</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-bold">{total} kg</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-muted-foreground">Wilks</span>
            <Badge variant="secondary">{wilks}</Badge>
          </div>
        </CardContent>
      </Card>

      {goals.primary !== 'hypertrophy' && <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {hasTargets ? `Cele na koniec cyklu (${totalWeeks} tyg.)` : `Szacowane wyniki po cyklu (${totalWeeks} tyg.)`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Przysiad</p>
              <p className="text-xl font-bold text-emerald-600">{targetSquat} kg</p>
              <p className="text-xs text-emerald-600">+{targetSquat - oneRepMaxes.squat} kg</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ława</p>
              <p className="text-xl font-bold text-emerald-600">{targetBench} kg</p>
              <p className="text-xs text-emerald-600">+{targetBench - oneRepMaxes.bench} kg</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Martwy</p>
              <p className="text-xl font-bold text-emerald-600">{targetDeadlift} kg</p>
              <p className="text-xs text-emerald-600">+{targetDeadlift - oneRepMaxes.deadlift} kg</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <span className="text-sm text-muted-foreground">{hasTargets ? 'Cel total' : 'Szac. total'}</span>
            <span className="font-bold text-emerald-600">{targetTotal} kg</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-muted-foreground">{hasTargets ? 'Cel Wilks' : 'Szac. Wilks'}</span>
            <Badge variant="secondary" className="text-emerald-600">{targetWilks}</Badge>
          </div>
          {!hasTargets && (
            <p className="text-xs text-muted-foreground mt-3 pt-3 border-t leading-relaxed">
              Szacunek oparty na twoim Wilks ({wilks}) i stosunku siły do masy ciała.
              Przy twoich aktualnych wynikach realistyczny progres to ~{gainPercent}% na cykl {totalWeeks}-tygodniowy
              z periodyzacją blokową i autoregulacją. Faktyczne wyniki zależą od regeneracji, diety i konsekwencji treningowej.
            </p>
          )}
        </CardContent>
      </Card>}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Harmonogram</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p><span className="text-muted-foreground">Dni/tydzień:</span> {schedule.daysPerWeek}</p>
          <p><span className="text-muted-foreground">Czas sesji:</span> {schedule.sessionDuration} min</p>
          <p><span className="text-muted-foreground">Dni:</span> {dayLabels}</p>
        </CardContent>
      </Card>

      {(weakPoints.lifts.length > 0 || muscleLabels.length > 0 || techLabels.length > 0) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Słabe punkty</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {weakPoints.lifts.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {weakPoints.lifts.map((l) => (
                  <Badge key={l} variant="outline">{l === 'squat' ? 'Przysiad' : l === 'bench' ? 'Ława' : 'Martwy'}</Badge>
                ))}
              </div>
            )}
            {muscleLabels.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {muscleLabels.map((l) => (
                  <Badge key={l} variant="secondary" className="text-xs">{l}</Badge>
                ))}
              </div>
            )}
            {techLabels.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {techLabels.map((l) => (
                  <Badge key={l} variant="secondary" className="text-xs">{l}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
