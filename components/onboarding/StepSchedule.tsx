'use client';

import { Label } from '@/components/ui/label';
import type { UserSettings } from '@/lib/types';
import { DAYS_OF_WEEK } from '@/lib/constants';

interface Props {
  settings: UserSettings;
  update: (partial: Partial<UserSettings>) => void;
  errors: Record<string, string>;
}

export function StepSchedule({ settings, update, errors }: Props) {
  const { schedule } = settings;

  const setSchedule = (field: string, value: unknown) => {
    const newSchedule = { ...schedule, [field]: value };
    // Reset preferred days when changing daysPerWeek
    if (field === 'daysPerWeek') {
      newSchedule.preferredDays = [];
    }
    update({ schedule: newSchedule as typeof schedule });
  };

  const toggleDay = (day: string) => {
    const days = schedule.preferredDays.includes(day)
      ? schedule.preferredDays.filter((d) => d !== day)
      : [...schedule.preferredDays, day];
    setSchedule('preferredDays', days);
  };

  return (
    <div className="space-y-6 pt-4">
      <div>
        <Label className="mb-3 block">Ile dni w tygodniu możesz trenować?</Label>
        <div className="flex gap-2">
          {([3, 4, 5] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setSchedule('daysPerWeek', n)}
              className={`flex-1 h-12 rounded-lg text-sm font-semibold transition-all ${
                schedule.daysPerWeek === n
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {n} dni
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {schedule.daysPerWeek === 3 && 'Mniej dni = dłuższe sesje i więcej odpoczynku między nimi. Dobry wybór jeśli regeneracja jest priorytetem lub masz mało czasu.'}
          {schedule.daysPerWeek === 4 && 'Klasyczny upper/lower split. Optymalny balans między objętością treningową a regeneracją — najpopularniejszy wybór w trójboju.'}
          {schedule.daysPerWeek === 5 && 'Więcej dni pozwala rozłożyć objętość na krótsze sesje. Wymaga dobrej regeneracji — odpowiedni dla bardziej zaawansowanych.'}
        </p>
      </div>

      <div>
        <Label className="mb-3 block">Preferowana długość sesji</Label>
        <div className="flex gap-2">
          {([60, 75, 90, 120] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setSchedule('sessionDuration', n)}
              className={`flex-1 h-12 rounded-lg text-sm font-semibold transition-all ${
                schedule.sessionDuration === n
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {n} min
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {schedule.sessionDuration <= 60 && 'Krótsze sesje = mniej ćwiczeń akcesoryjnych, skupienie na głównych bojach. Wystarczające jeśli priorytetem jest siła.'}
          {schedule.sessionDuration === 75 && 'Pozwala na solidny trening głównych bojów + 2-3 ćwiczenia dodatkowe. Dobry kompromis między czasem a objętością.'}
          {schedule.sessionDuration === 90 && 'Standardowa długość sesji w trójboju. Daje czas na rozgrzewkę, boje główne, akcesoria i mobility.'}
          {schedule.sessionDuration >= 120 && 'Długie sesje pozwalają na pełną pracę akcesoryjną i dłuższe przerwy między seriami — idealne przy ciężkim treningu siłowym.'}
        </p>
      </div>

      <div>
        <Label className="mb-3 block">
          Które dni tygodnia?{' '}
          <span className="text-muted-foreground font-normal">
            (wybierz {schedule.daysPerWeek})
          </span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={`h-11 px-4 rounded-lg text-sm font-medium transition-all ${
                schedule.preferredDays.includes(day.value)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
        {errors.days && <p className="text-sm text-destructive mt-2">{errors.days}</p>}
      </div>
    </div>
  );
}
