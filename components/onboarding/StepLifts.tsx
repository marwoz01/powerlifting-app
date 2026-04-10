'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator } from 'lucide-react';
import type { UserSettings, DeadliftVariant } from '@/lib/types';
import { epley1RM, wilksScore, roundTo2_5 } from '@/lib/calculations';

interface Props {
  settings: UserSettings;
  update: (partial: Partial<UserSettings>) => void;
  errors: Record<string, string>;
}

function RMCalculator({ onCalculate }: { onCalculate: (rm: number) => void }) {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  const w = Number(weight);
  const r = Number(reps);
  const estimated = w > 0 && r > 0 ? roundTo2_5(epley1RM(w, r)) : null;

  return (
    <div className="mt-2 p-3 bg-muted/50 rounded-lg space-y-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
        <Calculator className="size-3.5" />
        Kalkulator 1RM
      </div>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Ciężar</Label>
          <Input
            type="number"
            placeholder="kg"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="h-9 mt-0.5"
          />
        </div>
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Powtórzenia</Label>
          <Input
            type="number"
            placeholder="reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="h-9 mt-0.5"
          />
        </div>
      </div>
      {estimated && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm text-muted-foreground">
            Szacowane 1RM: <span className="font-semibold text-foreground">{estimated} kg</span>
          </span>
          <button
            type="button"
            onClick={() => onCalculate(estimated)}
            className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            Użyj
          </button>
        </div>
      )}
    </div>
  );
}

export function StepLifts({ settings, update, errors }: Props) {
  const { oneRepMaxes, deadliftVariant } = settings;
  const [showCalc, setShowCalc] = useState<Record<string, boolean>>({});

  const setMax = (lift: 'squat' | 'bench' | 'deadlift', value: number) => {
    update({ oneRepMaxes: { ...oneRepMaxes, [lift]: value } });
  };

  const total = oneRepMaxes.squat + oneRepMaxes.bench + oneRepMaxes.deadlift;
  const wilks = total > 0 && settings.profile.bodyWeight > 0
    ? wilksScore(total, settings.profile.bodyWeight)
    : 0;

  const lifts: Array<{ key: 'squat' | 'bench' | 'deadlift'; label: string }> = [
    { key: 'squat', label: 'Przysiad (Back Squat)' },
    { key: 'bench', label: 'Wyciskanie leżąc (Bench Press)' },
    { key: 'deadlift', label: 'Martwy ciąg' },
  ];

  return (
    <div className="space-y-5 pt-4">
      <p className="text-sm text-muted-foreground">
        Podaj swoje aktualne maksymalne pojedyncze powtórzenia (1RM). Jeśli nie znasz dokładnej wartości, użyj kalkulatora.
      </p>

      {lifts.map((lift) => (
        <div key={lift.key}>
          <div className="flex items-center justify-between">
            <Label>{lift.label}</Label>
            <button
              type="button"
              className="text-xs px-2.5 py-1 rounded-md bg-muted font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              onClick={() => setShowCalc((p) => ({ ...p, [lift.key]: !p[lift.key] }))}
            >
              {showCalc[lift.key] ? 'Ukryj kalkulator' : 'Nie znam 1RM'}
            </button>
          </div>

          {lift.key === 'deadlift' && (
            <div className="flex gap-2 my-2">
              {(['sumo', 'conventional'] as DeadliftVariant[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => update({ deadliftVariant: v })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    deadliftVariant === v
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {v === 'sumo' ? 'Sumo' : 'Conventional'}
                </button>
              ))}
            </div>
          )}

          <Input
            type="number"
            value={oneRepMaxes[lift.key] || ''}
            onChange={(e) => setMax(lift.key, Number(e.target.value))}
            placeholder="kg"
            className="mt-1.5 h-12"
          />
          {errors[lift.key] && <p className="text-sm text-destructive mt-1">{errors[lift.key]}</p>}

          {showCalc[lift.key] && (
            <RMCalculator onCalculate={(rm) => { setMax(lift.key, rm); setShowCalc((p) => ({ ...p, [lift.key]: false })); }} />
          )}
        </div>
      ))}

      {total > 0 && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total SBD</p>
                <p className="text-2xl font-bold">{total} kg</p>
              </div>
              {wilks > 0 && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Wilks Score</p>
                  <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                    {wilks}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
