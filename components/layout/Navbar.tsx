'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dumbbell, LayoutDashboard, Calendar, ClipboardList, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/program', label: 'Program', icon: Calendar },
  { href: '/history', label: 'Historia', icon: ClipboardList },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="hidden md:flex items-center justify-between border-b border-border bg-background px-6 h-14">
      <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
        <Dumbbell className="size-5" />
        <span>PowerPlan</span>
      </Link>
      <div className="flex items-center gap-1">
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname.startsWith(item.href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="w-px h-6 bg-border mx-2" />
        <Link
          href="/settings"
          className={cn(
            'flex items-center justify-center size-9 rounded-full transition-colors',
            pathname.startsWith('/settings')
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
          title="Ustawienia i profil"
        >
          <UserCircle className="size-5" />
        </Link>
      </div>
    </header>
  );
}
