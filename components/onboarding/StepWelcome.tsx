'use client';

import { Dumbbell, Brain, TrendingUp, BarChart3 } from 'lucide-react';

const FEATURES = [
  {
    icon: Brain,
    title: 'AI dopasowuje plan do Ciebie',
    desc: 'Na podstawie Twoich danych, celów i słabych punktów AI tworzy spersonalizowany program treningowy.',
  },
  {
    icon: TrendingUp,
    title: 'Autoregulacja w czasie rzeczywistym',
    desc: 'Ciężary i objętość dostosowują się automatycznie na podstawie Twojego RPE z każdego treningu.',
  },
  {
    icon: BarChart3,
    title: 'Analiza po każdym treningu',
    desc: 'Po zakończeniu sesji AI analizuje Twoje wyniki i daje konkretny feedback.',
  },
];

export function StepWelcome() {
  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-primary/10 mb-2">
          <Dumbbell className="size-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">PowerPlan</h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
          Inteligentny plan treningowy oparty na najnowszych badaniach i dostosowany do Twoich celów.
        </p>
      </div>

      <div className="space-y-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="flex gap-3 p-3 rounded-lg bg-muted/50">
            <div className="shrink-0 mt-0.5">
              <f.icon className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{f.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Za chwilę zbierzemy kilka informacji o Tobie, żeby wygenerować optymalny plan. Konfiguracja zajmie ~2 minuty.
      </p>
    </div>
  );
}
