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
  Sun,
  Moon,
  Bell,
  Sparkles,
  Flame,
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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    // Check initial theme
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark') ||
        localStorage.getItem('regret_theme') === 'dark';
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
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

  const toggleTheme = () => {
    const newDark = !isDarkMode;
    setIsDarkMode(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('regret_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('regret_theme', 'light');
    }
  };

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
    <header className="h-20 px-5 md:px-8 bg-white/80 dark:bg-[#0F1420]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between sticky top-0 z-40">
      {/* Left: Date & Time in geometric display font */}
      <div className="flex items-center gap-3">
        <div>
          <div className="text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {currentDate || 'Today'}
          </div>
          <div className="text-base sm:text-lg font-display font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{currentTime || '00:00:00'}</span>
            <span className="w-2 h-2 rounded-full bg-lime shadow-[0_0_8px_rgba(212,246,85,0.8)]" />
          </div>
        </div>
      </div>

      {/* Right Controls: Timer pill, Search, Theme toggle, Quick capture */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Active Timer Pill */}
        {timerSeconds > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-950 text-white rounded-full text-xs font-mono shadow-md border border-slate-800"
          >
            <Clock className="w-3.5 h-3.5 text-lime animate-spin" style={{ animationDuration: '4s' }} />
            <span className="text-lime font-bold tracking-tight">{formatTimer(timerSeconds)}</span>
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className="text-slate-300 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
              title={timerRunning ? 'Pause' : 'Resume'}
            >
              {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleFinishTimer}
              className="text-coral hover:text-coral-hover p-1 rounded-full hover:bg-slate-800 transition-colors"
              title="Stop and Save"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}

        {/* Start Timer Pill */}
        {timerSeconds === 0 && (
          <button
            onClick={() => setShowTimerModal(true)}
            className="hidden sm:inline-flex btn-secondary text-xs py-2 px-4 gap-2"
          >
            <Play className="w-3.5 h-3.5 text-iris" />
            <span className="font-display font-bold">Start Timer</span>
          </button>
        )}

        {/* Theme Toggle Segmented Pill (Image 2 style) */}
        <div className="flex items-center p-1 rounded-full border border-slate-200/80 dark:border-white/[0.08] bg-slate-100/80 dark:bg-white/[0.04] text-xs font-display">
          <button
            type="button"
            onClick={() => {
              if (isDarkMode) toggleTheme();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all text-[11px] font-bold ${
              !isDarkMode
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Switch to Light mode"
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Light</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (!isDarkMode) toggleTheme();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all text-[11px] font-bold ${
              isDarkMode
                ? 'bg-iris text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Switch to Dark mode"
          >
            <Moon className="w-3.5 h-3.5 text-lime" />
            <span className="hidden sm:inline">Dark</span>
          </button>
        </div>

        {/* Search Pill (Image 2 style) */}
        <Link
          href="/search"
          className="p-2 sm:px-4 sm:py-2 rounded-full border border-slate-200/80 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all flex items-center gap-2 text-xs font-display font-semibold"
          title="Universal Search"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline text-xs text-slate-400 font-sans">Search or type command...</span>
          <kbd className="hidden lg:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white dark:bg-white/10 border border-slate-200/80 dark:border-white/10 text-slate-400">
            /
          </kbd>
        </Link>

        {/* Quick Log Pill Button */}
        <Link href="/capture" className="btn-primary text-xs py-2 px-4 sm:px-5">
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="font-display font-extrabold tracking-tight">Quick Log</span>
        </Link>
      </div>

      {/* Start Timer Bento Modal */}
      <AnimatePresence>
        {showTimerModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bento-card max-w-sm w-full p-6 space-y-5 bg-white dark:bg-[#131A29]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-lime/20 text-slate-950 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-slate-900 dark:text-lime" />
                  </div>
                  <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                    Launch Focus Timer
                  </h3>
                </div>
                <button
                  onClick={() => setShowTimerModal(false)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Session Title
                </label>
                <input
                  type="text"
                  value={timerTitle}
                  onChange={(e) => setTimerTitle(e.target.value)}
                  placeholder="e.g. Deep Coding, Reading, Workout"
                  className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
                />
              </div>

              <div>
                <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Category Track
                </label>
                <select
                  value={timerCategory}
                  onChange={(e) => setTimerCategory(e.target.value as CategoryId)}
                  className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
                >
                  {INITIAL_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.description})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  onClick={() => setShowTimerModal(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setTimerRunning(true);
                    setShowTimerModal(false);
                  }}
                  className="btn-primary text-xs py-2 px-5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Tracking</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
