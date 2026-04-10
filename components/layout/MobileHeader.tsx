'use client';

import Link from 'next/link';
import { Dumbbell } from 'lucide-react';

export function MobileHeader() {
  return (
    <header className="md:hidden flex items-center justify-center px-4 h-12 border-b border-border bg-background">
      <Link href="/dashboard" className="flex items-center gap-1.5 font-bold text-sm">
        <Dumbbell className="size-4" />
        <span>PowerPlan</span>
      </Link>
    </header>
  );
}
