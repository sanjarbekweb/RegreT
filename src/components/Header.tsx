'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Play,
  Pause,
  Square,
  Clock,
  X,
} from 'lucide-react';
import { Activity, CategoryId } from '../lib/types';
import { storage, INITIAL_CATEGORIES } from '../lib/storage';

export default function Header() {
  const [currentDate, setCurrentDate] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerTitle, setTimerTitle] = useState<string>('Deep Focus Session');
  const [timerCategory, setTimerCategory] = useState<CategoryId>('coding');
  const [showTimerModal, setShowTimerModal] = useState<boolean>(false);

  useEffect(() => {
    // Ensure dark theme is applied
    if (typeof window !== 'undefined') {
      document.documentElement.classList.add('dark');
    }

    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      );
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinishTimer = () => {
    if (timerSeconds < 5) {
      setTimerRunning(false);
      setTimerSeconds(0);
      setShowTimerModal(false);
      return;
    }

    const now = new Date();
    const started = new Date(now.getTime() - timerSeconds * 1000);

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      title: timerTitle || 'Timed Focus Session',
      categoryId: timerCategory,
      description: `Timed session completed. Total duration: ${formatTimer(timerSeconds)}.`,
      startedAt: started.toISOString(),
      endedAt: now.toISOString(),
      tags: ['timer', timerCategory],
      attachments: [],
      source: 'timer',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    storage.addActivity(newActivity);
    setTimerRunning(false);
    setTimerSeconds(0);
    setShowTimerModal(false);
    window.dispatchEvent(new Event('regret_data_updated'));
  };

  return (
    <header className="h-14 px-4 md:px-6 bg-[#0D1117]/90 backdrop-blur-md border-b border-[#1E293B] flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Left: Clean Date & Time Display */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-[#8B949E]">
          <span className="text-[#F0F6FC] font-medium">{currentDate || 'Today'}</span>
          <span className="text-[#484F58]">·</span>
          <span>{currentTime || '00:00:00'}</span>
        </div>
      </div>

      {/* Right Controls: Linear-style Timer, Search, and Quick Capture */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active Timer Pill */}
        {timerSeconds > 0 && (
          <div className="flex items-center gap-2 px-2.5 py-1 bg-[#161F2E] text-[#F0F6FC] rounded-md text-xs font-mono border border-[#1E293B]">
            <Clock className="w-3.5 h-3.5 text-[#388BFD]" />
            <span className="text-[#388BFD] font-medium">{formatTimer(timerSeconds)}</span>
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className="text-[#8B949E] hover:text-[#F0F6FC] p-0.5 rounded transition-colors"
              title={timerRunning ? 'Pause' : 'Resume'}
            >
              {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleFinishTimer}
              className="text-[#F85149] hover:text-[#DA3633] p-0.5 rounded transition-colors"
              title="Stop and Save"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Start Timer Button */}
        {timerSeconds === 0 && (
          <button
            onClick={() => setShowTimerModal(true)}
            className="hidden sm:inline-flex btn-secondary text-xs py-1.5 px-3 gap-1.5"
          >
            <Play className="w-3 h-3 text-[#8B949E]" />
            <span>Focus Timer</span>
          </button>
        )}

        {/* Search Input Trigger */}
        <Link
          href="/search"
          className="px-2.5 py-1.5 rounded-md border border-[#1E293B] bg-[#111827] text-[#8B949E] hover:text-[#F0F6FC] hover:border-[#334155] transition-colors flex items-center gap-2 text-xs"
          title="Universal Search (⌘K)"
        >
          <Search className="w-3.5 h-3.5 text-[#64748B]" />
          <span className="hidden sm:inline text-xs font-sans">Search archive...</span>
          <kbd className="hidden lg:inline-flex text-[10px] font-mono px-1 py-0.2 rounded bg-[#161F2E] border border-[#1E293B] text-[#64748B]">
            ⌘K
          </kbd>
        </Link>

        {/* Quick Log Button (Muted blue Linear style) */}
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('regret_open_quick_capture', { detail: {} }));
            }
          }}
          className="btn-primary text-xs py-1.5 px-3 gap-1.5"
          title="Record what happened (N)"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Quick Capture</span>
          <kbd className="hidden sm:inline text-[9px] font-mono opacity-60">N</kbd>
        </button>
      </div>

      {/* Focus Timer Modal (Linear dark surface) */}
      <AnimatePresence>
        {showTimerModal && (
          <div className="fixed inset-0 z-50 bg-[#090D12]/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="workspace-panel max-w-sm w-full p-5 space-y-4 bg-[#111827] border border-[#1E293B]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#161F2E] border border-[#232E3E] text-[#388BFD] flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-sans font-semibold text-sm text-[#F0F6FC]">
                    Launch Focus Timer
                  </h3>
                </div>
                <button
                  onClick={() => setShowTimerModal(false)}
                  className="text-[#64748B] hover:text-[#F0F6FC] p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8B949E] mb-1">
                  Session Description
                </label>
                <input
                  type="text"
                  value={timerTitle}
                  onChange={(e) => setTimerTitle(e.target.value)}
                  placeholder="e.g. Deep coding, reading, thesis research"
                  className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] placeholder:text-[#64748B] focus:outline-none focus:border-[#388BFD]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8B949E] mb-1">
                  Activity Track
                </label>
                <select
                  value={timerCategory}
                  onChange={(e) => setTimerCategory(e.target.value as CategoryId)}
                  className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                >
                  {INITIAL_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setShowTimerModal(false)}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setTimerRunning(true);
                    setShowTimerModal(false);
                  }}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  <Play className="w-3 h-3" />
                  <span>Start Focus</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
