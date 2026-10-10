'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/timeline', label: 'Timeline', icon: Clock },
  { href: '/capture', label: 'Quick Capture', icon: PlusCircle, highlight: true },
  { href: '/calendar', label: 'Consistency', icon: CalendarDays },
  { href: '/knowledge', label: 'Knowledge Vault', icon: Brain },
  { href: '/vocabulary', label: 'Vocabulary & SRS', icon: Layers },
  { href: '/projects', label: 'Project Studio', icon: FolderGit2 },
  { href: '/countdowns', label: 'Deadlines', icon: Hourglass },
  { href: '/media', label: 'Media & Papers', icon: Film },
  { href: '/search', label: 'Universal Search', icon: Search },
  { href: '/settings', label: 'Storage & Backup', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-border shrink-0 h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-surface border border-border flex items-center justify-center font-mono font-bold text-primary">
            R
          </div>
          <div>
            <div className="font-semibold text-sm tracking-wide text-foreground">RegreT OS</div>
            <div className="text-[11px] text-muted font-mono">Personal Life Engine</div>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold text-muted px-2 py-1 tracking-wider uppercase">
          Operating System
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-elevated text-primary border border-border'
                  : item.highlight
                  ? 'text-primary hover:bg-surface border border-primary/20'
                  : 'text-muted hover:text-foreground hover:bg-surface'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive || item.highlight ? 'text-primary' : 'text-muted'}`} />
              <span className="flex-1">{item.label}</span>
              {item.highlight && !isActive && (
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Storage and System Status */}
      <div className="p-3 border-t border-border bg-surface/50">
        <div className="flex items-center justify-between text-[11px] text-muted font-mono mb-2">
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-success" />
            Storage: Local & Synced
          </span>
          <span className="text-success font-semibold">Active</span>
        </div>
        <div className="text-[10px] text-muted/80">
          Permanent persistence enabled. Zero data leakage.
        </div>
      </div>
    </aside>
  );
}
