'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProgram, getWorkoutLogs } from '@/lib/storage';

export default function WorkoutRedirect() {
  const router = useRouter();

  useEffect(() => {
    const program = getProgram();
    const logs = getWorkoutLogs();

    if (!program) {
      router.replace('/dashboard');
      return;
    }

    // Find next unlogged workout
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
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
      Przekierowywanie...
    </div>
  );
}
