'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UserSettings } from '@/lib/types';

interface Props {
  settings: UserSettings;
  update: (partial: Partial<UserSettings>) => void;
  errors: Record<string, string>;
}

export function StepPersonal({ settings, update, errors }: Props) {
  const { profile } = settings;

  const set = (field: string, value: string | number) => {
    update({ profile: { ...profile, [field]: value } });
  };

  return (
    <div className="space-y-5 pt-4">
      <div>
        <Label htmlFor="name">Imię</Label>
        <Input
          id="name"
          value={profile.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="Twoje imię"
          className="mt-1.5 h-12"
        />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
      </div>

      <div>
        <Label htmlFor="bodyWeight">Masa ciała (kg)</Label>
        <Input
          id="bodyWeight"
          type="number"
          value={profile.bodyWeight || ''}
          onChange={(e) => set('bodyWeight', Number(e.target.value))}
          min={40}
          max={200}
          className="mt-1.5 h-12"
        />
        {errors.bodyWeight && <p className="text-sm text-destructive mt-1">{errors.bodyWeight}</p>}
      </div>

      <div>
        <Label htmlFor="height">Wzrost (cm)</Label>
        <Input
          id="height"
          type="number"
          value={profile.height || ''}
          onChange={(e) => set('height', Number(e.target.value))}
          min={140}
          max={230}
          className="mt-1.5 h-12"
        />
        {errors.height && <p className="text-sm text-destructive mt-1">{errors.height}</p>}
      </div>

      <div>
        <Label htmlFor="age">Wiek</Label>
        <Input
          id="age"
          type="number"
          value={profile.age || ''}
          onChange={(e) => set('age', Number(e.target.value))}
          min={14}
          max={80}
          className="mt-1.5 h-12"
        />
        {errors.age && <p className="text-sm text-destructive mt-1">{errors.age}</p>}
      </div>

      <div>
        <Label htmlFor="years">Staż treningowy (lata)</Label>
        <Input
          id="years"
          type="number"
          value={profile.yearsTraining || ''}
          onChange={(e) => set('yearsTraining', Number(e.target.value))}
          min={0}
          max={50}
          className="mt-1.5 h-12"
        />
      </div>
    </div>
  );
}
