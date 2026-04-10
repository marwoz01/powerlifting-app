'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Save, CheckCircle2, Key } from 'lucide-react';
import { getAnthropicKey, saveAnthropicKey, getGeminiKey, saveGeminiKey } from '@/lib/storage';

export function StepApiKeys() {
  const [anthropicKey, setAnthropicKey] = useState(() => getAnthropicKey());
  const [geminiKey, setGeminiKey] = useState(() => getGeminiKey());
  const [showAnthropic, setShowAnthropic] = useState(false);
  const [showGemini, setShowGemini] = useState(false);
  const [anthropicSaved, setAnthropicSaved] = useState(false);
  const [geminiSaved, setGeminiSaved] = useState(false);

  const handleSaveAnthropic = () => {
    saveAnthropicKey(anthropicKey);
    setAnthropicSaved(true);
    setTimeout(() => setAnthropicSaved(false), 2000);
  };

  const handleSaveGemini = () => {
    saveGeminiKey(geminiKey);
    setGeminiSaved(true);
    setTimeout(() => setGeminiSaved(false), 2000);
  };

  const hasAnyKey = anthropicKey || geminiKey;

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Klucz API do AI</h2>
        <p className="text-sm text-muted-foreground">
          AI analizuje Twoje dane (siłę, cele, słabe punkty, harmonogram) i generuje plan treningowy dopasowany do Ciebie — dobiera ćwiczenia, objętość, periodyzację i ciężary. Po każdym treningu analizuje też Twoje wyniki i dostosowuje plan.
        </p>
        <p className="text-sm text-muted-foreground">
          Podaj klucz do jednego z providerów. Jest przechowywany tylko lokalnie w Twojej przeglądarce.
        </p>
      </div>

      {/* Anthropic (recommended) */}
      <Card className="border-primary/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="size-4" />
            Anthropic (Claude Sonnet)
            <Badge variant="default" className="text-[10px] ml-1">Zalecany</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Najlepsza jakość. Klucz z console.anthropic.com — cały cykl kosztuje ~$2-3.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showAnthropic ? 'text' : 'password'}
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder="sk-ant-..."
                className="h-11 pr-10 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowAnthropic(!showAnthropic)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showAnthropic ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <Button onClick={handleSaveAnthropic} size="lg" className="h-11">
              {anthropicSaved ? <CheckCircle2 className="size-4" /> : <Save className="size-4" />}
            </Button>
          </div>
          {anthropicKey && (
            <Badge variant="secondary" className="text-xs">Klucz zapisany</Badge>
          )}
        </CardContent>
      </Card>

      {/* Gemini (free) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="size-4" />
            Google Gemini
            <Badge variant="outline" className="text-[10px] ml-1">Darmowy</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Darmowa alternatywa. Wygeneruj klucz na aistudio.google.com — bez karty kredytowej.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showGemini ? 'text' : 'password'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIza..."
                className="h-11 pr-10 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowGemini(!showGemini)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showGemini ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <Button onClick={handleSaveGemini} size="lg" className="h-11">
              {geminiSaved ? <CheckCircle2 className="size-4" /> : <Save className="size-4" />}
            </Button>
          </div>
          {geminiKey && (
            <Badge variant="secondary" className="text-xs">Klucz zapisany</Badge>
          )}
        </CardContent>
      </Card>

      {!hasAnyKey && (
        <p className="text-xs text-muted-foreground text-center">
          Bez klucza API plan zostanie wygenerowany z domyślnych szablonów — bez personalizacji AI.
        </p>
      )}
    </div>
  );
}
