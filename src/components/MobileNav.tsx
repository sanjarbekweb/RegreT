'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Clock, Plus, CalendarDays, Brain, Menu } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-border px-3 py-2 flex items-center justify-around">
      <Link
        href="/"
        className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
          pathname === '/' ? 'text-primary' : 'text-muted'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Home</span>
      </Link>

      <Link
        href="/timeline"
        className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
          pathname === '/timeline' ? 'text-primary' : 'text-muted'
        }`}
      >
        <Clock className="w-5 h-5" />
        <span>Timeline</span>
      </Link>

      <Link
        href="/capture"
        className="w-10 h-10 -mt-5 rounded-full bg-primary flex items-center justify-center text-white border-2 border-background shadow-lg"
      >
        <Plus className="w-6 h-6" />
      </Link>

      <Link
        href="/calendar"
        className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
          pathname === '/calendar' ? 'text-primary' : 'text-muted'
        }`}
      >
        <CalendarDays className="w-5 h-5" />
        <span>Habits</span>
      </Link>

      <Link
        href="/knowledge"
        className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
          pathname === '/knowledge' ? 'text-primary' : 'text-muted'
        }`}
      >
        <Brain className="w-5 h-5" />
        <span>Learn</span>
      </Link>
    </nav>
  );
}
