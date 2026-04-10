'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Dumbbell, ClipboardList, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/program', label: 'Program', icon: Calendar },
  { href: '/workout', label: 'Trening', icon: Dumbbell, highlight: true },
  { href: '/history', label: 'Historia', icon: ClipboardList },
  { href: '/settings', label: 'Profil', icon: UserCircle },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 py-1 px-3 min-w-[56px] rounded-lg transition-colors',
                item.highlight && !isActive && 'text-primary',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center rounded-full transition-all',
                  item.highlight ? 'size-11 -mt-5 bg-primary text-primary-foreground shadow-lg' : 'size-6',
                  item.highlight && isActive && 'ring-2 ring-ring'
                )}
              >
                <item.icon className={cn(item.highlight ? 'size-5' : 'size-5')} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
