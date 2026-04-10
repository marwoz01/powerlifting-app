import { auth } from '@clerk/nextjs/server';
import { createServiceClient } from '@/lib/supabase/server';

export interface ApiKeys {
  anthropicKey: string;
  openrouterKey: string;
  geminiKey: string;
}

/**
 * Read API keys for the authenticated user from Supabase (server-side only).
 * Returns null if not authenticated.
 */
export async function getServerApiKeys(): Promise<{ userId: string; keys: ApiKeys } | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const sb = createServiceClient();
  const { data } = await sb
    .from('api_keys')
    .select('anthropic_key, openrouter_key, gemini_key')
    .eq('clerk_user_id', userId)
    .single();

  return {
    userId,
    keys: {
      anthropicKey: (data?.anthropic_key as string) ?? '',
      openrouterKey: (data?.openrouter_key as string) ?? '',
      geminiKey: (data?.gemini_key as string) ?? '',
    },
  };
}
