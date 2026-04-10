'use client';

import { Label } from '@/components/ui/label';
import type { UserSettings } from '@/lib/types';
import { MUSCLE_GROUPS, TECHNICAL_ISSUES } from '@/lib/constants';

interface Props {
  settings: UserSettings;
  update: (partial: Partial<UserSettings>) => void;
  errors: Record<string, string>;
}

function ChipSelect({
  options,
  selected,
  onToggle,
}: {
  options: Array<{ value: string; label: string }>;
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onToggle(opt.value)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            selected.includes(opt.value)
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function StepWeakPoints({ settings, update }: Props) {
  const { weakPoints } = settings;

  const toggleLift = (lift: 'squat' | 'bench' | 'deadlift') => {
    const lifts = weakPoints.lifts.includes(lift)
      ? weakPoints.lifts.filter((l) => l !== lift)
      : [...weakPoints.lifts, lift];
    update({ weakPoints: { ...weakPoints, lifts } });
  };

  const toggleMuscle = (muscle: string) => {
    const groups = weakPoints.muscleGroups.includes(muscle)
      ? weakPoints.muscleGroups.filter((m) => m !== muscle)
      : [...weakPoints.muscleGroups, muscle];
    update({ weakPoints: { ...weakPoints, muscleGroups: groups } });
  };

  const toggleTechnical = (issue: string) => {
    const issues = weakPoints.technicalIssues.includes(issue)
      ? weakPoints.technicalIssues.filter((i) => i !== issue)
      : [...weakPoints.technicalIssues, issue];
    update({ weakPoints: { ...weakPoints, technicalIssues: issues } });
  };

  const liftOptions = [
    { value: 'squat', label: 'Przysiad' },
    { value: 'bench', label: 'Ława' },
    { value: 'deadlift', label: 'Martwy ciąg' },
  ];

  return (
    <div className="space-y-6 pt-4">
      <div>
        <Label className="mb-3 block">Który bój jest najsłabszy?</Label>
        <ChipSelect
          options={liftOptions}
          selected={weakPoints.lifts}
          onToggle={(v) => toggleLift(v as 'squat' | 'bench' | 'deadlift')}
        />
      </div>

      <div>
        <Label className="mb-3 block">Słabe partie mięśniowe</Label>
        <ChipSelect
          options={MUSCLE_GROUPS}
          selected={weakPoints.muscleGroups}
          onToggle={toggleMuscle}
        />
      </div>

      <div>
        <Label className="mb-3 block">Problemy techniczne</Label>
        <ChipSelect
          options={TECHNICAL_ISSUES}
          selected={weakPoints.technicalIssues}
          onToggle={toggleTechnical}
        />
      </div>
    </div>
  );
}
