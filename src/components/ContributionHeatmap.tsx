'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, CategoryId } from '../lib/types';
import { INITIAL_CATEGORIES } from '../lib/storage';
import { calculateStreaks } from '../lib/analytics';
import AnimatedCounter from './AnimatedCounter';
import { Flame, Trophy, CalendarCheck2, Activity as ActivityIcon } from 'lucide-react';

interface ContributionHeatmapProps {
  activities: Activity[];
  weeksToShow?: number;
  onSelectDate?: (dateStr: string, dayActivities: Activity[]) => void;
}

export default function ContributionHeatmap({
  activities,
  weeksToShow = 16,
  onSelectDate,
}: ContributionHeatmapProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [activeDate, setActiveDate] = useState<string | null>(null);

  // Filter activities by category if selected
  const filteredActivities = useMemo(() => {
    if (selectedCategory === 'all') return activities;
    return activities.filter((a) => a.categoryId === selectedCategory);
  }, [activities, selectedCategory]);

  // Aggregate counts by YYYY-MM-DD
  const dateMap = useMemo(() => {
    const map = new Map<string, Activity[]>();
    filteredActivities.forEach((act) => {
      const dateStr = act.startedAt.split('T')[0];
      const existing = map.get(dateStr) || [];
      existing.push(act);
      map.set(dateStr, existing);
    });
    return map;
  }, [filteredActivities]);

  // Generate grid of weeks ending with the current week (aligned to Monday)
  const { grid, stats } = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayUtc = new Date(todayStr + 'T00:00:00Z');

    // Day of week where Monday is 0 and Sunday is 6
    const todayDayOfWeek = (todayUtc.getUTCDay() + 6) % 7;

    // Start of the current week (Monday)
    const currentWeekMonday = new Date(todayUtc);
    currentWeekMonday.setUTCDate(todayUtc.getUTCDate() - todayDayOfWeek);

    // Start of the grid (Monday, weeksToShow - 1 weeks prior)
    const gridStartMonday = new Date(currentWeekMonday);
    gridStartMonday.setUTCDate(currentWeekMonday.getUTCDate() - (weeksToShow - 1) * 7);

    const weeks: {
      date: Date;
      dateStr: string;
      count: number;
      activities: Activity[];
      isFuture: boolean;
      isToday: boolean;
    }[][] = [];

    const pastAndTodayDays: { dateStr: string; count: number }[] = [];

    for (let w = 0; w < weeksToShow; w++) {
      const weekDays: {
        date: Date;
        dateStr: string;
        count: number;
        activities: Activity[];
        isFuture: boolean;
        isToday: boolean;
      }[] = [];

      for (let d = 0; d < 7; d++) {
        const dayDate = new Date(gridStartMonday);
        dayDate.setUTCDate(gridStartMonday.getUTCDate() + w * 7 + d);
        const dateStr = dayDate.toISOString().split('T')[0];

        const isToday = dateStr === todayStr;
        const isFuture = dateStr > todayStr;
        const dayActs = isFuture ? [] : (dateMap.get(dateStr) || []);

        const dayItem = {
          date: dayDate,
          dateStr,
          count: dayActs.length,
          activities: dayActs,
          isFuture,
          isToday,
        };

        weekDays.push(dayItem);
        if (!isFuture) {
          pastAndTodayDays.push({ dateStr, count: dayActs.length });
        }
      }
      weeks.push(weekDays);
    }

    const streakStats = calculateStreaks(pastAndTodayDays);

    return {
      grid: weeks,
      stats: {
        ...streakStats,
        totalLogged: filteredActivities.length,
      },
    };
  }, [weeksToShow, dateMap, filteredActivities]);

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-slate-100 dark:bg-white/[0.05] border-slate-200/50 dark:border-white/[0.05]';
    if (count === 1) return 'bg-[#E4FBB5] border-[#D4F655]/60';
    if (count === 2) return 'bg-[#D4F655] border-[#C2E638]';
    if (count === 3) return 'bg-[#A3E635] border-[#84CC16]';
    return 'bg-[#5E43F3] border-[#4D32E5] text-white';
  };

  const dayLabels = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];
  const selectedDayActivities = activeDate ? dateMap.get(activeDate) || [] : [];

  return (
    <div className="bento-card p-6 md:p-7 space-y-5 bg-white dark:bg-[#131A29]">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
        <div>
          <div className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Consistency Engine
          </div>
          <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white mt-0.5">
            Activity & Habit Consistency
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {weeksToShow} weeks continuous contribution matrix
          </p>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-display font-bold transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-lime text-slate-950 shadow-[0_2px_8px_rgba(212,246,85,0.4)] border border-black/5'
                : 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Tracks
          </button>
          {INITIAL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-display font-bold transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-lime text-slate-950 shadow-[0_2px_8px_rgba(212,246,85,0.4)] border border-black/5'
                  : 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bento Quick Cards (Tinted pastel squircle cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Current Streak - Mint Tint */}
        <div className="rounded-2xl p-4 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/30">
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-400">
            <span className="text-[11px] font-display font-bold uppercase tracking-wider">Current Streak</span>
            <Flame className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-emerald-950 dark:text-emerald-100 mt-2">
            <AnimatedCounter value={stats.currentStreak} suffix=" Days" />
          </div>
          <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-1 font-medium">
            Active daily cadence
          </div>
        </div>

        {/* Longest Streak - Coral Tint */}
        <div className="rounded-2xl p-4 bg-orange-50/70 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-800/30">
          <div className="flex items-center justify-between text-orange-800 dark:text-orange-400">
            <span className="text-[11px] font-display font-bold uppercase tracking-wider">Longest Streak</span>
            <Trophy className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-orange-950 dark:text-orange-100 mt-2">
            <AnimatedCounter value={stats.longestStreak} suffix=" Days" />
          </div>
          <div className="text-[11px] text-orange-700/80 dark:text-orange-400/80 mt-1 font-medium">
            Personal all-time record
          </div>
        </div>

        {/* Active Days - Lilac Tint */}
        <div className="rounded-2xl p-4 bg-purple-50/70 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-800/30">
          <div className="flex items-center justify-between text-purple-800 dark:text-purple-400">
            <span className="text-[11px] font-display font-bold uppercase tracking-wider">Active Days</span>
            <CalendarCheck2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-purple-950 dark:text-purple-100 mt-2">
            <AnimatedCounter value={stats.totalActiveDays} />
          </div>
          <div className="text-[11px] text-purple-700/80 dark:text-purple-400/80 mt-1 font-medium">
            Total recorded dates
          </div>
        </div>

        {/* Total Activities - Royal Iris Tint */}
        <div className="rounded-2xl p-4 bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-800/30">
          <div className="flex items-center justify-between text-indigo-800 dark:text-indigo-400">
            <span className="text-[11px] font-display font-bold uppercase tracking-wider">Total Sessions</span>
            <ActivityIcon className="w-4 h-4 text-iris" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-indigo-950 dark:text-indigo-100 mt-2">
            <AnimatedCounter value={stats.totalLogged} />
          </div>
          <div className="text-[11px] text-indigo-700/80 dark:text-indigo-400/80 mt-1 font-medium">
            Completed life blocks
          </div>
        </div>
      </div>

      {/* GitHub Calendar Grid in Electric Lime & Iris */}
      <div className="overflow-x-auto pt-3 pb-2">
        <div className="inline-flex gap-2 min-w-max">
          <div className="flex flex-col justify-between py-1 text-[10px] text-slate-400 dark:text-slate-500 font-display font-bold pr-1 select-none">
            {dayLabels.map((lbl, idx) => (
              <span key={idx} className="h-4 leading-4">
                {lbl}
              </span>
            ))}
          </div>

          {grid.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-2">
              {week.map((day) => {
                if (day.isFuture) {
                  return (
                    <div
                      key={day.dateStr}
                      className="w-4 h-4 rounded-md border border-transparent opacity-0 pointer-events-none"
                    />
                  );
                }
                const isSelected = activeDate === day.dateStr;
                return (
                  <button
                    key={day.dateStr}
                    onClick={() => {
                      setActiveDate(day.dateStr);
                      if (onSelectDate) onSelectDate(day.dateStr, day.activities);
                    }}
                    title={`${day.dateStr}${day.isToday ? ' (Today)' : ''}: ${day.count} activities logged`}
                    className={`w-4 h-4 rounded-md border transition-all ${getColorClass(
                      day.count
                    )} ${
                      isSelected
                        ? 'ring-2 ring-slate-900 dark:ring-lime ring-offset-2 ring-offset-white dark:ring-offset-[#131A29] scale-110'
                        : day.isToday
                        ? 'ring-2 ring-lime shadow-sm'
                        : 'hover:scale-110'
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend & Selected Day Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.06] text-xs text-slate-500 dark:text-slate-400 font-display">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[11px]">Less</span>
          <span className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-white/[0.05] border border-slate-200/50 inline-block" />
          <span className="w-3.5 h-3.5 rounded bg-[#E4FBB5] border border-[#D4F655]/60 inline-block" />
          <span className="w-3.5 h-3.5 rounded bg-[#D4F655] border border-[#C2E638] inline-block" />
          <span className="w-3.5 h-3.5 rounded bg-[#A3E635] border border-[#84CC16] inline-block" />
          <span className="w-3.5 h-3.5 rounded bg-[#5E43F3] border border-[#4D32E5] inline-block" />
          <span className="font-semibold text-[11px]">More</span>
        </div>

        {activeDate && (
          <div className="text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
            <span>Selected:</span>
            <span className="px-2 py-0.5 rounded-full bg-lime text-slate-950 text-[11px]">
              {activeDate}
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-normal">
              ({selectedDayActivities.length} logs)
            </span>
          </div>
        )}
      </div>

      {/* Day Details Drawer when clicked */}
      <AnimatePresence>
        {activeDate && selectedDayActivities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] space-y-2.5 mt-3"
          >
            <div className="text-xs font-display font-extrabold text-slate-900 dark:text-white">
              Activities logged on {activeDate}:
            </div>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {selectedDayActivities.map((act) => (
                <div
                  key={act.id}
                  className="bg-white dark:bg-[#1A2238] border border-slate-200/60 dark:border-white/[0.06] rounded-xl px-3.5 py-2.5 text-xs flex items-center justify-between shadow-sm"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{act.title}</span>
                    <span className="text-slate-400 font-mono text-[11px] ml-2">
                      {act.startedAt.split('T')[1]?.slice(0, 5)}
                    </span>
                  </div>
                  <span className="text-[10px] font-display font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-slate-200">
                    {act.categoryId}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
