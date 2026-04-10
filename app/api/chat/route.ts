import { NextRequest, NextResponse } from 'next/server';
import { tryClaudeChat, tryOpenRouterChat, tryGeminiChat } from '@/lib/ai-providers';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { anthropicKey, apiKey, geminiKey, messages, systemPrompt } = body as {
    anthropicKey?: string;
    apiKey?: string;
    geminiKey?: string;
    messages: ChatMessage[];
    systemPrompt: string;
  };

  if (!anthropicKey && !apiKey && !geminiKey) {
    return NextResponse.json({ error: 'Brak klucza API. Dodaj klucz w ustawieniach.' }, { status: 400 });
  }

  const apiMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  // 1. Try Claude first
  if (anthropicKey) {
    const result = await tryClaudeChat(anthropicKey, apiMessages, 1500);
    if (result) return NextResponse.json(result);
  }

  // 2. Try OpenRouter
  if (apiKey) {
    const result = await tryOpenRouterChat(apiKey, apiMessages, 1500);
    if (result) {
      if ('error' in result) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      return NextResponse.json(result);
    }
  }

  // 3. Fallback to Gemini
  if (geminiKey) {
    const result = await tryGeminiChat(geminiKey, systemPrompt, messages, 1500);
    if (result) return NextResponse.json(result);
  }

  return NextResponse.json(
    { error: 'Wszystkie modele niedostępne. Sprawdź klucze API i spróbuj ponownie.' },
    { status: 429 }
  );
}
