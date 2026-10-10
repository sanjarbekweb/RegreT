'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  Brain,
  Layers,
  FolderGit2,
  Hourglass,
  Film,
  Search,
  Settings,
  PlusCircle,
  Database,
  Sparkles,
  Zap,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/timeline', label: 'Timeline', icon: Clock },
  { href: '/capture', label: 'Quick Capture', icon: PlusCircle, isAction: true },
  { href: '/calendar', label: 'Consistency', icon: CalendarDays },
  { href: '/knowledge', label: 'Knowledge Vault', icon: Brain },
  { href: '/vocabulary', label: 'SRS & Vocab', icon: Layers },
  { href: '/projects', label: 'Project Studio', icon: FolderGit2 },
  { href: '/countdowns', label: 'Deadlines', icon: Hourglass },
  { href: '/media', label: 'Media & Papers', icon: Film },
  { href: '/search', label: 'Universal Search', icon: Search },
  { href: '/settings', label: 'Storage & Backup', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white dark:bg-[#0F1420] border-r border-slate-200/80 dark:border-white/[0.08] shrink-0 h-screen sticky top-0 select-none z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      {/* Brand Header */}
      <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-slate-950 dark:bg-white text-lime dark:text-slate-950 flex items-center justify-center font-display font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <div>
            <div className="font-display font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>RegreT</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-lime text-slate-950 font-sans">
                OS
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium tracking-wide">
              Personal Life Engine
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-3 py-1 tracking-widest uppercase font-display">
          Life OS Modules
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative block"
            >
              <motion.div
                whileTap={{ scale: 0.98 }}
                className={`relative flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-colors duration-200 ${
                  isActive
                    ? 'bg-lime text-slate-950 font-bold shadow-[0_4px_14px_rgba(212,246,85,0.4)]'
                    : item.isAction
                    ? 'bg-iris/10 text-iris hover:bg-iris/15 border border-iris/20 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/[0.05]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform ${
                    isActive ? 'text-slate-950 stroke-[2.5]' : item.isAction ? 'text-iris' : 'text-slate-500 dark:text-slate-400'
                  }`}
                />
                <span className="flex-1 font-display tracking-tight text-[13px]">{item.label}</span>
                {item.isAction && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-iris animate-pulse" />
                )}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="w-1.5 h-1.5 rounded-full bg-slate-950"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Storage and System Status Card */}
      <div className="p-4 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50/70 dark:bg-white/[0.02]">
        <div className="bg-white dark:bg-[#131A29] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-3.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-mint animate-pulse" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-display">
                Local Vault Active
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-mint/15 text-mint-dark dark:text-mint">
              ONLINE
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            Zero telemetry. Encrypted permanent storage.
          </p>
        </div>
      </div>
    </aside>
  );
}
