import { NextRequest, NextResponse } from 'next/server';
import { tryClaudeChat, tryOpenRouterChat, tryGeminiChat } from '@/lib/ai-providers';
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
  const { workoutData, systemPrompt } = body as { workoutData: string; systemPrompt: string };
  const userMessage = `Przeanalizuj mój dzisiejszy trening i daj feedback:\n\n${workoutData}`;

  if (anthropicKey) {
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userMessage },
    ];
    const r = await tryClaudeChat(anthropicKey, messages, 1500);
    if (r) return NextResponse.json(r);
  }

  if (apiKey) {
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userMessage },
    ];
    const r = await tryOpenRouterChat(apiKey, messages, 1500);
    if (r) {
      if ('error' in r) {
        return NextResponse.json({ error: r.error }, { status: r.status });
      }
      return NextResponse.json(r);
    }
  }

  if (geminiKey) {
    const r = await tryGeminiChat(
      geminiKey,
      systemPrompt,
      [{ role: 'user', content: userMessage }],
      1500
    );
    if (r) return NextResponse.json(r);
  }

  return NextResponse.json(
    { error: 'Wszystkie modele niedostępne. Sprawdź klucze API i spróbuj ponownie.' },
    { status: 429 }
  );
}
