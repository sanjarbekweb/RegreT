'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, X, Keyboard } from 'lucide-react';
import GlobalQuickCaptureModal from './GlobalQuickCaptureModal';

export default function GlobalShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Universal Search (Cmd+K or Ctrl+K)
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        router.push('/search');
        return;
      }

      // If user is currently typing in an input, textarea, select, or editable element, skip navigation keys
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // If meta or ctrl or alt is held, do not trigger single key shortcuts
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      const key = e.key.toLowerCase();

      // Help overlay (? or Shift+/)
      if (e.key === '?') {
        e.preventDefault();
        setShowHelp((prev) => !prev);
        return;
      }

      // Close help on Escape
      if (e.key === 'Escape') {
        setShowHelp(false);
        return;
      }

      switch (key) {
        case 'n': // Quick capture
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('regret_open_quick_capture', { detail: {} }));
          break;
        case 'o': // Overview
          e.preventDefault();
          router.push('/');
          break;
        case 't': // Life Timeline
          e.preventDefault();
          router.push('/timeline');
          break;
        case 'c': // Activity Calendar
          e.preventDefault();
          router.push('/calendar');
          break;
        case 'm': // Media Archive
          e.preventDefault();
          router.push('/media');
          break;
        case 'v': // Knowledge Vault
          e.preventDefault();
          router.push('/knowledge');
          break;
        case 's': // Vocabulary & SRS
          e.preventDefault();
          router.push('/vocabulary');
          break;
        case 'p': // Projects Studio
          e.preventDefault();
          router.push('/projects');
          break;
        case 'd': // Deadlines & Countdowns
          e.preventDefault();
          router.push('/countdowns');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const SHORTCUTS = [
    { key: 'N', desc: 'Record what happened (Quick Capture)' },
    { key: 'O', desc: 'Overview Dashboard' },
    { key: 'T', desc: 'Life Timeline (Chronological Stream)' },
    { key: 'C', desc: 'Activity Calendar (Full-Year Heatmap)' },
    { key: 'M', desc: 'Media Archive (Apple Photos Grid)' },
    { key: 'V', desc: 'Knowledge Vault (Obsidian Workspace)' },
    { key: 'S', desc: 'Vocabulary & Spaced Repetition (SRS)' },
    { key: 'P', desc: 'Project Studio' },
    { key: 'D', desc: 'Deadlines & Countdowns' },
    { key: '⌘K', desc: 'Universal Search' },
    { key: '?', desc: 'Toggle Shortcuts Help' },
    { key: 'Esc', desc: 'Close open modal or drawer' },
  ];

  return (
    <>
      <GlobalQuickCaptureModal />

      <AnimatePresence>
        {showHelp && (
          <div
            className="fixed inset-0 z-50 bg-[#090D12]/80 backdrop-blur-sm flex items-center justify-center p-4 select-none"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.12 }}
              onClick={(e) => e.stopPropagation()}
              className="workspace-panel max-w-md w-full bg-[#111827] border border-[#1E293B] shadow-2xl rounded-lg p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#161F2E] border border-[#232E3E] text-[#388BFD] flex items-center justify-center">
                    <Keyboard className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[#F0F6FC] uppercase tracking-wider font-sans">
                      Keyboard Shortcuts
                    </h3>
                    <span className="text-[10px] text-[#64748B] font-mono">
                      Linear-style rapid keyboard navigation
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-[#64748B] hover:text-[#F0F6FC] p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                {SHORTCUTS.map((s) => (
                  <div
                    key={s.key}
                    className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-[#161F2E]/60 text-xs"
                  >
                    <span className="text-[#8B949E]">{s.desc}</span>
                    <kbd className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#090D12] text-[#F0F6FC] border border-[#1E293B]">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#1E293B] flex justify-end">
                <button
                  onClick={() => setShowHelp(false)}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
