'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStorage } from '@/lib/hooks/use-storage';

export default function WorkoutRedirect() {
  const router = useRouter();
  const storage = useStorage();

  useEffect(() => {
    if (!storage.isReady) return;

    async function redirect() {
      const [program, logs] = await Promise.all([
        storage.getProgram(),
        storage.getWorkoutLogs(),
      ]);

      if (!program) {
        router.replace('/dashboard');
        return;
      }

      const totalWeeks = program.weeks?.length ?? 14;
      for (let w = 1; w <= totalWeeks; w++) {
        for (let d = 1; d <= 4; d++) {
          const logged = logs.some((l) => l.weekNumber === w && l.dayNumber === d && l.completed);
          if (!logged) {
            router.replace(`/workout/${w}/${d}`);
            return;
          }
        }
      }

      router.replace('/dashboard');
    }
    redirect();
  }, [storage.isReady, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
      Przekierowywanie...
    </div>
  );
}
