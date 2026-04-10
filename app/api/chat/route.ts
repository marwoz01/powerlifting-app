import { NextRequest, NextResponse } from 'next/server';
import { tryClaudeChat, tryOpenRouterChat, tryGeminiChat } from '@/lib/ai-providers';
import { getServerApiKeys } from '@/lib/server-keys';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  const result = await getServerApiKeys();
  if (!result) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { keys } = result;
  const { anthropicKey, openrouterKey: apiKey, geminiKey } = keys;

  if (!anthropicKey && !apiKey && !geminiKey) {
    return NextResponse.json({ error: 'Brak klucza API. Dodaj klucz w ustawieniach.' }, { status: 400 });
  }

  const body = await req.json();
  const { messages, systemPrompt } = body as {
    messages: ChatMessage[];
    systemPrompt: string;
  };

  const apiMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  if (anthropicKey) {
    const r = await tryClaudeChat(anthropicKey, apiMessages, 1500);
    if (r) return NextResponse.json(r);
  }

  if (apiKey) {
    const r = await tryOpenRouterChat(apiKey, apiMessages, 1500);
    if (r) {
      if ('error' in r) {
        return NextResponse.json({ error: r.error }, { status: r.status });
      }
      return NextResponse.json(r);
    }
  }

  if (geminiKey) {
    const r = await tryGeminiChat(geminiKey, systemPrompt, messages, 1500);
    if (r) return NextResponse.json(r);
  }

  return NextResponse.json(
    { error: 'Wszystkie modele niedostępne. Sprawdź klucze API i spróbuj ponownie.' },
    { status: 429 }
  );
}
