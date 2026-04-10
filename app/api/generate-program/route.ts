import { NextRequest, NextResponse } from 'next/server';
import { tryClaude, tryOpenRouter, tryGemini } from '@/lib/ai-providers';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { anthropicKey, apiKey, geminiKey, prompt } = body as {
    anthropicKey?: string;
    apiKey?: string;
    geminiKey?: string;
    prompt: string;
  };

  if (!anthropicKey && !apiKey && !geminiKey) {
    return NextResponse.json({ error: 'Brak klucza API. Dodaj klucz w ustawieniach.' }, { status: 400 });
  }

  const systemMsg = 'Jesteś ekspertem od programowania treningowego w trójboju siłowym. Odpowiadasz TYLKO prawidłowym JSON-em.';
  const messages = [
    { role: 'system' as const, content: systemMsg },
    { role: 'user' as const, content: prompt },
  ];

  // 1. Try Claude first (best quality)
  if (anthropicKey) {
    const result = await tryClaude(anthropicKey, messages, 4000, 0.3);
    if (result) return NextResponse.json(result);
  }

  // 2. Try OpenRouter
  if (apiKey) {
    const result = await tryOpenRouter(apiKey, messages, 4000, 0.3);
    if (result) return NextResponse.json(result);
  }

  // 3. Fallback to Gemini
  if (geminiKey) {
    const result = await tryGemini(geminiKey, systemMsg, prompt, 4000, 0.3);
    if (result) return NextResponse.json(result);
  }

  return NextResponse.json(
    { error: 'Nie udało się wygenerować programu. Sprawdź klucze API i spróbuj ponownie.' },
    { status: 500 }
  );
}
