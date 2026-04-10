'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStorage } from '@/lib/hooks/use-storage';
import { useSupabaseClient } from '@/lib/supabase/client';
import { useUser } from '@clerk/nextjs';
import { migrateLocalStorageToSupabase } from '@/lib/migration';

export default function RootPage() {
  const router = useRouter();
  const { isReady } = useStorage();
  const sb = useSupabaseClient();
  const { user } = useUser();

  useEffect(() => {
    if (!isReady || !user) return;

    async function init() {
      // Attempt localStorage → Supabase migration for returning users
      await migrateLocalStorageToSupabase(sb, user!.id);

      const { data } = await sb
        .from('user_settings')
        .select('onboarding_complete')
        .eq('clerk_user_id', user!.id)
        .single();

      if (data?.onboarding_complete) {
        router.replace('/dashboard');
      } else {
        router.replace('/onboarding');
      }
    }
    init();
  }, [isReady, user, sb, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-muted-foreground">Ładowanie...</div>
    </div>
  );
}
