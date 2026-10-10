'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Clock, Plus, CalendarDays, Brain } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-3 left-4 right-4 z-50 bg-white/90 dark:bg-[#0F1420]/90 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.1] rounded-full px-4 py-2.5 flex items-center justify-around shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      <Link
        href="/"
        className={`flex flex-col items-center gap-1 text-[10px] font-display font-bold transition-colors ${
          pathname === '/' ? 'text-slate-950 dark:text-lime' : 'text-slate-400 dark:text-slate-500'
        }`}
      >
        <LayoutDashboard className={`w-5 h-5 ${pathname === '/' ? 'stroke-[2.5]' : ''}`} />
        <span>Home</span>
      </Link>

      <Link
        href="/timeline"
        className={`flex flex-col items-center gap-1 text-[10px] font-display font-bold transition-colors ${
          pathname === '/timeline' ? 'text-slate-950 dark:text-lime' : 'text-slate-400 dark:text-slate-500'
        }`}
      >
        <Clock className={`w-5 h-5 ${pathname === '/timeline' ? 'stroke-[2.5]' : ''}`} />
        <span>Timeline</span>
      </Link>

      {/* Floating Center Action Pill in Electric Lime */}
      <Link
        href="/capture"
        className="w-12 h-12 -mt-7 rounded-full bg-lime text-slate-950 flex items-center justify-center border-4 border-slate-100 dark:border-[#090D14] shadow-[0_4px_16px_rgba(212,246,85,0.5)] active:scale-95 transition-transform"
        title="Quick Log"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </Link>

      <Link
        href="/calendar"
        className={`flex flex-col items-center gap-1 text-[10px] font-display font-bold transition-colors ${
          pathname === '/calendar' ? 'text-slate-950 dark:text-lime' : 'text-slate-400 dark:text-slate-500'
        }`}
      >
        <CalendarDays className={`w-5 h-5 ${pathname === '/calendar' ? 'stroke-[2.5]' : ''}`} />
        <span>Habits</span>
      </Link>

      <Link
        href="/knowledge"
        className={`flex flex-col items-center gap-1 text-[10px] font-display font-bold transition-colors ${
          pathname === '/knowledge' ? 'text-slate-950 dark:text-lime' : 'text-slate-400 dark:text-slate-500'
        }`}
      >
        <Brain className={`w-5 h-5 ${pathname === '/knowledge' ? 'stroke-[2.5]' : ''}`} />
        <span>Learn</span>
      </Link>
    </nav>
  );
}
