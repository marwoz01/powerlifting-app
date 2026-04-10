import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceClient } from '@/lib/supabase/server';

/** GET: check which keys exist (never returns actual values) */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb = createServiceClient();
  const { data } = await sb
    .from('api_keys')
    .select('anthropic_key, openrouter_key, gemini_key')
    .eq('clerk_user_id', userId)
    .single();

  return NextResponse.json({
    hasAnthropic: !!data?.anthropic_key,
    hasOpenRouter: !!data?.openrouter_key,
    hasGemini: !!data?.gemini_key,
  });
}

/** POST: save API keys */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { anthropicKey, openrouterKey, geminiKey } = body as {
    anthropicKey?: string;
    openrouterKey?: string;
    geminiKey?: string;
  };

  const sb = createServiceClient();
  const payload: Record<string, unknown> = {
    clerk_user_id: userId,
    updated_at: new Date().toISOString(),
  };
  if (anthropicKey !== undefined) payload.anthropic_key = anthropicKey || null;
  if (openrouterKey !== undefined) payload.openrouter_key = openrouterKey || null;
  if (geminiKey !== undefined) payload.gemini_key = geminiKey || null;

  await sb.from('api_keys').upsert(payload, { onConflict: 'clerk_user_id' });

  return NextResponse.json({ ok: true });
}
