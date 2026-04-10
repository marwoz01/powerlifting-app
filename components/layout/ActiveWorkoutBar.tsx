'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Dumbbell, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStorage } from '@/lib/hooks/use-storage';
import type { ActiveWorkout } from '@/lib/supabase-storage';

export function ActiveWorkoutBar() {
  const pathname = usePathname();
  const router = useRouter();
  const storage = useStorage();
  const [active, setActive] = useState<ActiveWorkout | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!storage.isReady) return;
    storage.getActiveWorkout().then((aw) => {
      setActive(aw);
      if (aw) {
        setElapsed(Math.floor((Date.now() - new Date(aw.startTime).getTime()) / 1000));
      }
    });
  }, [pathname, storage.isReady]);

  useEffect(() => {
    if (!active || pathname.startsWith('/workout/')) return;
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(active.startTime).getTime()) / 1000));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, pathname]);

  if (!active) return null;
  if (pathname.startsWith('/workout/')) return null;

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  const handleReturn = () => {
    router.push(`/workout/${active.weekNumber}/${active.dayNumber}`);
  };

  const handleEnd = async () => {
    await storage.clearActiveWorkout();
    setActive(null);
    setShowConfirm(false);
  };

  return (
    <>
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-50 px-3 pb-1">
        <div className="max-w-lg mx-auto bg-primary text-primary-foreground rounded-xl shadow-lg px-4 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Dumbbell className="size-4 shrink-0 animate-pulse" />
            <div className="text-sm font-medium truncate">
              Trening W{active.weekNumber}D{active.dayNumber} — {timeStr}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 px-3 text-xs"
              onClick={handleReturn}
            >
              Wróć
              <ArrowRight className="size-3 ml-1" />
            </Button>
            <button
              onClick={() => setShowConfirm(true)}
              className="p-1.5 rounded-lg hover:bg-primary-foreground/20 transition-colors"
              title="Anuluj trening"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-background rounded-xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-base font-semibold">Zakończyć trening?</h3>
            <p className="text-sm text-muted-foreground">
              Trening W{active.weekNumber}D{active.dayNumber} zostanie anulowany. Niezapisane dane zostaną utracone.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowConfirm(false)}
              >
                Kontynuuj
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleEnd}
              >
                Zakończ
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
