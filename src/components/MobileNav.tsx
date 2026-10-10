'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Clock, CalendarDays, Image as ImageIcon, BookOpen, Plus } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0D1117]/95 backdrop-blur-md border-t border-[#1E293B] px-3 py-2 flex items-center justify-around">
      <Link
        href="/"
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
          pathname === '/' ? 'text-[#388BFD]' : 'text-[#8B949E]'
        }`}
      >
        <LayoutDashboard className="w-4 h-4" />
        <span>Overview</span>
      </Link>

      <Link
        href="/timeline"
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
          pathname === '/timeline' ? 'text-[#388BFD]' : 'text-[#8B949E]'
        }`}
      >
        <Clock className="w-4 h-4" />
        <span>Timeline</span>
      </Link>

      {/* Center Quick Action */}
      <Link
        href="/capture"
        className="w-9 h-9 rounded-md bg-[#388BFD] hover:bg-[#3178DE] text-white flex items-center justify-center shadow-sm active:scale-95 transition-transform"
        title="Quick Capture"
      >
        <Plus className="w-4 h-4" />
      </Link>

      <Link
        href="/calendar"
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
          pathname === '/calendar' ? 'text-[#388BFD]' : 'text-[#8B949E]'
        }`}
      >
        <CalendarDays className="w-4 h-4" />
        <span>Calendar</span>
      </Link>

      <Link
        href="/media"
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
          pathname === '/media' ? 'text-[#388BFD]' : 'text-[#8B949E]'
        }`}
      >
        <ImageIcon className="w-4 h-4" />
        <span>Archive</span>
      </Link>
    </nav>
  );
}
