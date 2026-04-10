import { NextRequest, NextResponse } from 'next/server';
import { tryClaude, tryOpenRouter, tryGemini } from '@/lib/ai-providers';
import { getServerApiKeys } from '@/lib/server-keys';

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
  const { prompt } = body as { prompt: string };

  const systemMsg = 'Jesteś ekspertem od programowania treningowego w trójboju siłowym. Odpowiadasz TYLKO prawidłowym JSON-em.';
  const messages = [
    { role: 'system' as const, content: systemMsg },
    { role: 'user' as const, content: prompt },
  ];

  if (anthropicKey) {
    const r = await tryClaude(anthropicKey, messages, 4000, 0.3);
    if (r) return NextResponse.json(r);
  }

  if (apiKey) {
    const r = await tryOpenRouter(apiKey, messages, 4000, 0.3);
    if (r) return NextResponse.json(r);
  }

  if (geminiKey) {
    const r = await tryGemini(geminiKey, systemMsg, prompt, 4000, 0.3);
    if (r) return NextResponse.json(r);
  }

  return NextResponse.json(
    { error: 'Nie udało się wygenerować programu. Sprawdź klucze API i spróbuj ponownie.' },
    { status: 500 }
  );
}
