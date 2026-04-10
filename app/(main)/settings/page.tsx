'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Save, RotateCcw, Eye, EyeOff, CheckCircle2, Key } from 'lucide-react';
import { useStorage } from '@/lib/hooks/use-storage';
import { generateProgram } from '@/lib/program-generator';
import { recalculateWeights } from '@/lib/autoregulation';
import type { UserSettings } from '@/lib/types';

export default function SettingsPage() {
  const router = useRouter();
  const storage = useStorage();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [anthropicKey, setAnthropicKeyState] = useState('');
  const [apiKey, setApiKeyState] = useState('');
  const [geminiKey, setGeminiKeyState] = useState('');
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [anthropicKeySaved, setAnthropicKeySaved] = useState(false);
  const [keySaved, setKeySaved] = useState(false);
  const [geminiKeySaved, setGeminiKeySaved] = useState(false);
  const [showNewCycleModal, setShowNewCycleModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storage.isReady) return;
    async function load() {
      const s = await storage.getUserSettings();
      setSettings(s);
      setLoading(false);
    }
    load();
  }, [storage.isReady]);

  if (loading || !settings) return null;

  const handleSaveProfile = async () => {
    await storage.saveUserSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSave1RM = async () => {
    await storage.saveUserSettings(settings);
    const existingProgram = await storage.getProgram();
    if (existingProgram) {
      const updated = recalculateWeights(existingProgram, 1, settings.oneRepMaxes);
      updated.baseOneRepMaxes = { ...settings.oneRepMaxes };
      await storage.saveProgram(updated);
    } else {
      const program = generateProgram(settings);
      await storage.saveProgram(program);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveAnthropicKey = async () => {
    await storage.saveApiKeys({ anthropicKey });
    setAnthropicKeySaved(true);
    setTimeout(() => setAnthropicKeySaved(false), 2000);
  };

  const handleSaveApiKey = async () => {
    await storage.saveApiKeys({ openrouterKey: apiKey });
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const handleSaveGeminiKey = async () => {
    await storage.saveApiKeys({ geminiKey });
    setGeminiKeySaved(true);
    setTimeout(() => setGeminiKeySaved(false), 2000);
  };

  const handleNewCycle = async () => {
    await storage.archiveCurrentProgram();
    await storage.clearCurrentCycle();
    router.push('/onboarding');
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
      <h1 className="text-2xl font-bold mb-6">Ustawienia</h1>

      {/* Anthropic API Key */}
      <Card className="mb-4 border-primary/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="size-4" />
            Klucz Anthropic (Claude Sonnet)
            <Badge variant="default" className="text-[10px] ml-1">Zalecany</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Najlepsza jakość generowania planów. Klucz z console.anthropic.com — cały cykl kosztuje ~$2-3.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showAnthropicKey ? 'text' : 'password'}
                value={anthropicKey}
                onChange={(e) => setAnthropicKeyState(e.target.value)}
                placeholder="sk-ant-..."
                className="h-11 pr-10 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showAnthropicKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <Button onClick={handleSaveAnthropicKey} size="lg" className="h-11">
              {anthropicKeySaved ? <CheckCircle2 className="size-4" /> : <Save className="size-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Key */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="size-4" />
            Klucz API OpenRouter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Alternatywa. Darmowy model Llama 3.3 70B — używany gdy brak klucza Anthropic.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKeyState(e.target.value)}
                placeholder="sk-or-..."
                className="h-11 pr-10 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <Button onClick={handleSaveApiKey} size="lg" className="h-11">
              {keySaved ? <CheckCircle2 className="size-4" /> : <Save className="size-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gemini API Key */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="size-4" />
            Klucz Google Gemini (darmowy)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Darmowa alternatywa. Wygeneruj klucz na aistudio.google.com — bez karty kredytowej. Używany gdy OpenRouter nie zadziała.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showGeminiKey ? 'text' : 'password'}
                value={geminiKey}
                onChange={(e) => setGeminiKeyState(e.target.value)}
                placeholder="AIza..."
                className="h-11 pr-10 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showGeminiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <Button onClick={handleSaveGeminiKey} size="lg" className="h-11">
              {geminiKeySaved ? <CheckCircle2 className="size-4" /> : <Save className="size-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 1RM */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Aktualne 1RM</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Zmiana 1RM przeliczy ciężary w całym programie.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Przysiad</Label>
              <Input
                type="number"
                value={settings.oneRepMaxes.squat || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    oneRepMaxes: { ...settings.oneRepMaxes, squat: Number(e.target.value) },
                  })
                }
                className="h-11 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Ława</Label>
              <Input
                type="number"
                value={settings.oneRepMaxes.bench || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    oneRepMaxes: { ...settings.oneRepMaxes, bench: Number(e.target.value) },
                  })
                }
                className="h-11 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Martwy</Label>
              <Input
                type="number"
                value={settings.oneRepMaxes.deadlift || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    oneRepMaxes: { ...settings.oneRepMaxes, deadlift: Number(e.target.value) },
                  })
                }
                className="h-11 mt-1"
              />
            </div>
          </div>
          <Button onClick={handleSave1RM} className="w-full h-11">
            {saved ? <CheckCircle2 className="size-4 mr-2" /> : <Save className="size-4 mr-2" />}
            Zapisz i przelicz program
          </Button>
        </CardContent>
      </Card>

      {/* Profile */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Dane osobowe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Imię</Label>
            <Input
              value={settings.profile.name}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  profile: { ...settings.profile, name: e.target.value },
                })
              }
              className="h-11 mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Masa ciała (kg)</Label>
            <Input
              type="number"
              value={settings.profile.bodyWeight || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  profile: { ...settings.profile, bodyWeight: Number(e.target.value) },
                })
              }
              className="h-11 mt-1"
            />
          </div>
          <Button onClick={handleSaveProfile} variant="outline" className="w-full h-11">
            {saved ? <CheckCircle2 className="size-4 mr-2" /> : <Save className="size-4 mr-2" />}
            Zapisz
          </Button>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* New cycle */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Nowy cykl</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Po zakończeniu cyklu wygeneruj nowy. Historia poprzedniego zostanie zachowana.
          </p>
          <Button onClick={() => setShowNewCycleModal(true)} variant="outline" className="w-full h-11">
            <RotateCcw className="size-4 mr-2" />
            Generuj nowy cykl
          </Button>
        </CardContent>
      </Card>

      {showNewCycleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-background rounded-xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-base font-semibold">Nowy cykl treningowy</h3>
            <p className="text-sm text-muted-foreground">
              Czy na pewno chcesz zakończyć bieżący cykl i wygenerować nowy? Historia poprzedniego zostanie zachowana.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowNewCycleModal(false)}
              >
                Anuluj
              </Button>
              <Button
                className="flex-1"
                onClick={handleNewCycle}
              >
                Generuj nowy
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
