'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import type { UserSettings } from '@/lib/types';
import { saveUserSettings, saveProgram, getUserSettings, getAnthropicKey, getApiKey, getGeminiKey } from '@/lib/storage';
import { generateProgram } from '@/lib/program-generator';
import { buildProgramGenerationPrompt, parseAIProgram } from '@/lib/ai-prompts';
import { StepWelcome } from '@/components/onboarding/StepWelcome';
import { StepApiKeys } from '@/components/onboarding/StepApiKeys';
import { StepPersonal } from '@/components/onboarding/StepPersonal';
import { StepLifts } from '@/components/onboarding/StepLifts';
import { StepSchedule } from '@/components/onboarding/StepSchedule';
import { StepGoals } from '@/components/onboarding/StepGoals';
import { StepWeakPoints } from '@/components/onboarding/StepWeakPoints';
import { StepSummary } from '@/components/onboarding/StepSummary';

const STEPS = ['Start', 'Klucz API', 'Dane osobowe', 'Aktualne 1RM', 'Plan tygodnia', 'Cele', 'Słabe punkty', 'Podsumowanie'];

const defaultSettings: UserSettings = {
  profile: { name: '', bodyWeight: 80, height: 175, age: 25, yearsTraining: 3, createdAt: '' },
  oneRepMaxes: { squat: 0, bench: 0, deadlift: 0 },
  deadliftVariant: 'sumo',
  schedule: { daysPerWeek: 4, sessionDuration: 90, preferredDays: ['monday', 'tuesday', 'thursday', 'friday'] },
  goals: { primary: 'powerlifting', hasCompetition: false },
  weakPoints: { lifts: [], muscleGroups: [], technicalIssues: [] },
  onboardingComplete: false,
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const existing = getUserSettings();
    if (existing) {
      setSettings({ ...existing, onboardingComplete: false });
    }
  }, []);

  const update = useCallback((partial: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
    setErrors({});
  }, []);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 2) {
      if (!settings.profile.name.trim()) errs.name = 'Podaj imię';
      if (settings.profile.bodyWeight < 40 || settings.profile.bodyWeight > 200) errs.bodyWeight = '40-200 kg';
      if (settings.profile.height < 140 || settings.profile.height > 230) errs.height = '140-230 cm';
      if (settings.profile.age < 14 || settings.profile.age > 80) errs.age = '14-80 lat';
    }
    if (step === 3) {
      if (settings.oneRepMaxes.squat <= 0) errs.squat = 'Podaj wartość';
      if (settings.oneRepMaxes.bench <= 0) errs.bench = 'Podaj wartość';
      if (settings.oneRepMaxes.deadlift <= 0) errs.deadlift = 'Podaj wartość';
    }
    if (step === 4) {
      if (settings.schedule.preferredDays.length !== settings.schedule.daysPerWeek)
        errs.days = `Zaznacz dokładnie ${settings.schedule.daysPerWeek} dni`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const finish = async () => {
    setGenerating(true);

    const finalSettings: UserSettings = {
      ...settings,
      profile: { ...settings.profile, createdAt: new Date().toISOString() },
      onboardingComplete: true,
    };
    saveUserSettings(finalSettings);

    // Try AI-powered generation first
    const anthropicKey = getAnthropicKey();
    const apiKey = getApiKey();
    const geminiKey = getGeminiKey();
    let aiTemplates = null;

    if (anthropicKey || apiKey || geminiKey) {
      try {
        const prompt = buildProgramGenerationPrompt(finalSettings);
        const res = await fetch('/api/generate-program', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ anthropicKey, apiKey, geminiKey, prompt }),
        });
        if (res.ok) {
          const data = await res.json();
          aiTemplates = parseAIProgram(data.content);
        }
      } catch {
        // AI failed — fall back to templates silently
      }
    }

    const program = generateProgram(finalSettings, aiTemplates ?? undefined);
    saveProgram(program);
    setGenerating(false);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      {step > 0 && (
        <div className="px-4 pt-8 pb-4 max-w-lg mx-auto w-full">
          <h1 className="text-2xl font-bold mb-1">Konfiguracja</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Krok {step} z {STEPS.length - 1} — {STEPS[step]}
          </p>
          <Progress value={(step / (STEPS.length - 1)) * 100} className="h-2" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 px-4 pb-32 max-w-lg mx-auto w-full">
        {step === 0 && <StepWelcome />}
        {step === 1 && <StepApiKeys />}
        {step === 2 && <StepPersonal settings={settings} update={update} errors={errors} />}
        {step === 3 && <StepLifts settings={settings} update={update} errors={errors} />}
        {step === 4 && <StepSchedule settings={settings} update={update} errors={errors} />}
        {step === 5 && <StepGoals settings={settings} update={update} errors={errors} />}
        {step === 6 && <StepWeakPoints settings={settings} update={update} errors={errors} />}
        {step === 7 && <StepSummary settings={settings} />}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={prev} size="lg" className="flex-1 h-12" disabled={generating}>
              <ArrowLeft className="size-4 mr-1" />
              Wstecz
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button onClick={next} size="lg" className="flex-1 h-12">
              {step === 0 ? 'Zaczynamy' : 'Dalej'}
              <ArrowRight className="size-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={finish} size="lg" className="flex-1 h-12" disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="size-4 mr-1 animate-spin" />
                  AI generuje plan...
                </>
              ) : (
                <>
                  <Sparkles className="size-4 mr-1" />
                  Generuj program
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
