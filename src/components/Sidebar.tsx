'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  Image as ImageIcon,
  BookOpen,
  Layers,
  FolderGit2,
  Hourglass,
  Search,
  Settings,
  Plus,
  ShieldCheck,
  Command,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard, shortcut: 'O' },
  { href: '/timeline', label: 'Life Timeline', icon: Clock, shortcut: 'T' },
  { href: '/calendar', label: 'Activity Calendar', icon: CalendarDays, shortcut: 'C' },
  { href: '/media', label: 'Media Archive', icon: ImageIcon, shortcut: 'M' },
  { href: '/knowledge', label: 'Knowledge Vault', icon: BookOpen, shortcut: 'V' },
  { href: '/vocabulary', label: 'Vocabulary & SRS', icon: Layers, shortcut: 'S' },
  { href: '/projects', label: 'Project Studio', icon: FolderGit2, shortcut: 'P' },
  { href: '/countdowns', label: 'Deadlines', icon: Hourglass, shortcut: 'D' },
  { href: '/search', label: 'Universal Search', icon: Search, shortcut: '⌘K' },
  { href: '/settings', label: 'Storage & Backup', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 lg:w-64 bg-[#0D1117] border-r border-[#1E293B] shrink-0 h-screen sticky top-0 select-none z-30">
      {/* Linear-style Restrained Brand Header (NO emoji) */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#1E293B]">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-md bg-[#161F2E] border border-[#232E3E] text-[#388BFD] flex items-center justify-center transition-colors group-hover:border-[#388BFD]/40">
            <Command className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-sans font-semibold text-xs tracking-tight text-[#F0F6FC]">
                Personal OS
              </span>
              <span className="text-[9px] font-mono uppercase font-medium px-1 py-0.2 rounded bg-[#161F2E] text-[#8B949E] border border-[#232E3E]">
                Vault
              </span>
            </div>
            <span className="text-[10px] text-[#64748B] font-normal leading-tight">
              Private life archive
            </span>
          </div>
        </Link>
      </div>

      {/* Quick Action Button */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('regret_open_quick_capture', { detail: {} }));
            }
          }}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md bg-[#161F2E] hover:bg-[#1E293B] border border-[#232E3E] text-xs font-medium text-[#F0F6FC] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Plus className="w-3.5 h-3.5 text-[#388BFD]" />
            <span>Record Activity</span>
          </span>
          <kbd className="text-[10px] font-mono text-[#64748B] bg-[#090D12] px-1.5 py-0.5 rounded border border-[#1E293B]">
            N
          </kbd>
        </button>
      </div>

      {/* Linear Navigation Links */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <div className="text-[10px] font-semibold text-[#484F58] px-2.5 py-1 uppercase tracking-wider">
          Workspace
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors duration-150 ${
                isActive
                  ? 'bg-[#161F2E] text-[#F0F6FC] font-medium border-l-2 border-[#388BFD]'
                  : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#111827]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#388BFD]' : 'text-[#64748B] group-hover:text-[#8B949E]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.shortcut && (
                <span className={`text-[10px] font-mono shrink-0 ${
                  isActive ? 'text-[#388BFD]/70' : 'text-[#484F58] group-hover:text-[#64748B]'
                }`}>
                  {item.shortcut}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Workspace Privacy & Storage Status */}
      <div className="p-3 border-t border-[#1E293B] bg-[#090D12]/50">
        <div className="flex items-center justify-between text-[11px] text-[#8B949E]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#238636]" />
            <span className="font-medium text-[#F0F6FC]">Vault Active</span>
          </div>
          <span className="text-[10px] font-mono text-[#64748B]">100% Private</span>
        </div>
        <p className="text-[10px] text-[#64748B] mt-0.5 leading-snug">
          Zero telemetry · Local storage
        </p>
      </div>
    </aside>
  );
}
