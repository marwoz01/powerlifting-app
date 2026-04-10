'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { UserSettings } from '@/lib/types';

interface Props {
  settings: UserSettings;
  update: (partial: Partial<UserSettings>) => void;
  errors: Record<string, string>;
}

const PRIMARY_OPTIONS = [
  { value: 'powerlifting', label: 'Powerlifting', desc: 'Maksymalna siła w SBD. Program skupiony na ciężkich seriach i peakingu.' },
  { value: 'powerbuilding', label: 'Powerbuilding', desc: 'Siła + masa mięśniowa. Więcej akcesorii i pracy w wyższych powtórzeniach.' },
  { value: 'hypertrophy', label: 'Hipertrofia', desc: 'Priorytet na budowę masy. Wyższy wolumen, umiarkowane ciężary, więcej izolacji.' },
] as const;

const PRIORITY_OPTIONS = [
  { value: 'squat-strength', label: 'Siła przysiadu' },
  { value: 'bench-strength', label: 'Siła ławki' },
  { value: 'deadlift-strength', label: 'Siła martwego' },
  { value: 'chest-mass', label: 'Masa — klatka' },
  { value: 'back-mass', label: 'Masa — plecy' },
  { value: 'legs-mass', label: 'Masa — nogi' },
  { value: 'shoulders-mass', label: 'Masa — barki' },
  { value: 'arms-mass', label: 'Masa — ramiona' },
];

export function StepGoals({ settings, update, errors }: Props) {
  const { goals } = settings;

  const setGoals = (field: string, value: unknown) => {
    update({ goals: { ...goals, [field]: value } as typeof goals });
  };

  const togglePriority = (value: string) => {
    const current = goals.priorities ?? [];
    const next = current.includes(value)
      ? current.filter((p) => p !== value)
      : current.length < 3
        ? [...current, value]
        : current;
    setGoals('priorities', next);
  };

  return (
    <div className="space-y-6 pt-4">
      <div>
        <Label className="mb-3 block">Główny cel</Label>
        <div className="space-y-2">
          {PRIMARY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setGoals('primary', opt.value)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all border ${
                goals.primary === opt.value
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              <span className="font-medium">{opt.label}</span>
              <span className="block text-xs mt-0.5 opacity-75">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-1 block">Na czym chcesz się skupić?</Label>
        <p className="text-xs text-muted-foreground mb-3">Opcjonalne — wybierz maks. 3 priorytety</p>
        <div className="flex flex-wrap gap-2">
          {PRIORITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => togglePriority(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                (goals.priorities ?? []).includes(opt.value)
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {goals.primary !== 'hypertrophy' && <div className="space-y-4">
        <Label>Cele na koniec cyklu (opcjonalne)</Label>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Przysiad</p>
            <Input
              type="number"
              placeholder="kg"
              value={goals.targetSquat || ''}
              onChange={(e) => setGoals('targetSquat', Number(e.target.value) || undefined)}
              className="h-11"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Ława</p>
            <Input
              type="number"
              placeholder="kg"
              value={goals.targetBench || ''}
              onChange={(e) => setGoals('targetBench', Number(e.target.value) || undefined)}
              className="h-11"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Martwy</p>
            <Input
              type="number"
              placeholder="kg"
              value={goals.targetDeadlift || ''}
              onChange={(e) => setGoals('targetDeadlift', Number(e.target.value) || undefined)}
              className="h-11"
            />
          </div>
        </div>
      </div>}

      <div className="flex items-center justify-between py-3">
        <div>
          <p className="text-sm font-medium">Planujesz start w zawodach?</p>
          <p className="text-xs text-muted-foreground">Program dostosuje peaking do daty</p>
        </div>
        <Switch
          checked={goals.hasCompetition}
          onCheckedChange={(v) => setGoals('hasCompetition', v)}
        />
      </div>

      {goals.hasCompetition && (
        <div>
          <Label htmlFor="compDate">Data zawodów</Label>
          <Input
            id="compDate"
            type="date"
            value={goals.competitionDate || ''}
            onChange={(e) => setGoals('competitionDate', e.target.value)}
            className="mt-1.5 h-12"
          />
        </div>
      )}
    </div>
  );
}
