'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isOnboardingComplete } from '@/lib/storage';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    if (isOnboardingComplete()) {
      router.replace('/dashboard');
    } else {
      router.replace('/onboarding');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-muted-foreground">Ładowanie...</div>
    </div>
  );
}
