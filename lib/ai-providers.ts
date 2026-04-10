const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

const OPENROUTER_MODELS = [
  'meta-llama/llama-3.3-70b-instruct',
  'meta-llama/llama-3.3-70b-instruct:free',
];

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// --- Claude (Anthropic) ---

export async function tryClaude(
  apiKey: string,
  messages: ChatMessage[],
  maxTokens: number,
  temperature: number
): Promise<Record<string, unknown> | null> {
  try {
    const systemMsg = messages.find((m) => m.role === 'system')?.content ?? '';
    const nonSystemMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role, content: m.content }));

    const res = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: maxTokens,
        temperature,
        system: systemMsg,
        messages: nonSystemMessages,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Claude error:', data?.error?.message ?? data);
      return null;
    }

    const content = data?.content?.[0]?.text;
    if (content) return { content };
  } catch (e) {
    console.error('Claude exception:', e);
  }
  return null;
}

export async function tryClaudeChat(
  apiKey: string,
  messages: ChatMessage[],
  maxTokens: number
): Promise<{ content: string } | null> {
  const result = await tryClaude(apiKey, messages, maxTokens, 0.7);
  if (result && typeof result.content === 'string') {
    return { content: result.content };
  }
  return null;
}

// --- OpenRouter ---

export async function tryOpenRouter(
  apiKey: string,
  messages: ChatMessage[],
  maxTokens: number,
  temperature: number
): Promise<Record<string, unknown> | null> {
  for (const model of OPENROUTER_MODELS) {
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature }),
      });

      if (res.status === 429 || res.status === 402) continue;

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data?.error?.message ?? data?.error ?? 'Błąd API OpenRouter';
        console.error(`OpenRouter error (${model}):`, errMsg);
        continue;
      }

      const content = data?.choices?.[0]?.message?.content;
      if (content) return { content };
    } catch (e) {
      console.error(`OpenRouter exception (${model}):`, e);
      continue;
    }
  }
  return null;
}

export async function tryOpenRouterChat(
  apiKey: string,
  messages: ChatMessage[],
  maxTokens: number
): Promise<{ content: string } | { error: string; status: number } | null> {
  for (const model of OPENROUTER_MODELS) {
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
      });

      if (res.status === 429 || res.status === 402) continue;

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data?.error?.message ?? data?.error ?? 'Błąd API OpenRouter';
        return { error: String(errMsg), status: res.status };
      }

      const content = data?.choices?.[0]?.message?.content ?? '';
      return { content };
    } catch {
      continue;
    }
  }
  return null;
}

// --- Gemini ---

export async function tryGemini(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
  temperature: number
): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature,
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errMsg = data?.error?.message ?? 'Błąd API Gemini';
      console.error('Gemini error:', errMsg);
      return null;
    }

    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (content) return { content };
  } catch (e) {
    console.error('Gemini exception:', e);
  }
  return null;
}

export async function tryGeminiChat(
  apiKey: string,
  systemPrompt: string,
  messages: ChatMessage[],
  maxTokens: number
): Promise<{ content: string } | null> {
  try {
    const geminiContents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: geminiContents,
        generationConfig: { maxOutputTokens: maxTokens },
      }),
    });

    const data = await res.json();
    if (!res.ok) return null;

    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (content) return { content };
  } catch {
    // Gemini failed
  }
  return null;
}
