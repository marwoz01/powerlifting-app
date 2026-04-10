import { NextRequest, NextResponse } from 'next/server';
import { tryClaudeChat, tryOpenRouterChat, tryGeminiChat } from '@/lib/ai-providers';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { anthropicKey, apiKey, geminiKey, workoutData, systemPrompt } = body as {
    anthropicKey?: string;
    apiKey?: string;
    geminiKey?: string;
    workoutData: string;
    systemPrompt: string;
  };

  if (!anthropicKey && !apiKey && !geminiKey) {
    return NextResponse.json({ error: 'Brak klucza API. Dodaj klucz w ustawieniach.' }, { status: 400 });
  }

  const userMessage = `Przeanalizuj mój dzisiejszy trening i daj feedback:\n\n${workoutData}`;

  // 1. Try Claude first
  if (anthropicKey) {
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userMessage },
    ];
    const result = await tryClaudeChat(anthropicKey, messages, 1500);
    if (result) return NextResponse.json(result);
  }

  // 2. Try OpenRouter
  if (apiKey) {
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userMessage },
    ];
    const result = await tryOpenRouterChat(apiKey, messages, 1500);
    if (result) {
      if ('error' in result) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      return NextResponse.json(result);
    }
  }

  // 3. Fallback to Gemini
  if (geminiKey) {
    const result = await tryGeminiChat(
      geminiKey,
      systemPrompt,
      [{ role: 'user', content: userMessage }],
      1500
    );
    if (result) return NextResponse.json(result);
  }

  return NextResponse.json(
    { error: 'Wszystkie modele niedostępne. Sprawdź klucze API i spróbuj ponownie.' },
    { status: 429 }
  );
}
