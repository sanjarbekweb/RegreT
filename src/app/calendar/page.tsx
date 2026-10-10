'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Plus,
  Flame,
  Award,
  TrendingUp,
  Target,
  Trash2,
  Check,
} from 'lucide-react';
import ContributionHeatmap from '../../components/ContributionHeatmap';
import { storage, INITIAL_CATEGORIES } from '../../lib/storage';
import { Activity, Habit, HabitCompletion, CategoryId } from '../../lib/types';

export default function ConsistencyCalendarPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);

  // New habit form
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<CategoryId>('personal');
  const [newHabitTarget, setNewHabitTarget] = useState(7);
  const [showAddHabit, setShowAddHabit] = useState(false);

  const [todayStr, setTodayStr] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const loadData = () => {
    setActivities(storage.getActivities());
    setHabits(storage.getHabits());
    setCompletions(storage.getHabitCompletions());
    setTodayStr(new Date().toISOString().split('T')[0]);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('regret_data_updated', handleUpdate);
    return () => window.removeEventListener('regret_data_updated', handleUpdate);
  }, []);

  const handleDeleteHabit = (id: string) => {
    if (confirm('Permanently remove this habit and its tracking history?')) {
      storage.deleteHabit(id);
      loadData();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('regret_data_updated'));
      }
    }
  };

  const handleToggleHabit = (habitId: string, dateStr: string) => {
    storage.toggleHabitCompletion(habitId, dateStr);
    setCompletions(storage.getHabitCompletions());
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('regret_data_updated'));
    }
  };

  const isHabitCompleted = (habitId: string, dateStr: string) => {
    return completions.some((c) => c.habitId === habitId && c.completedOn === dateStr);
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: `h-${Date.now()}`,
      name: newHabitName.trim(),
      categoryId: newHabitCategory,
      targetPerWeek: Number(newHabitTarget),
      icon: 'Target',
      isArchived: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [...habits, newHabit];
    storage.saveHabits(updated);
    setHabits(updated);
    setNewHabitName('');
    setShowAddHabit(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('regret_data_updated'));
    }
  };

  // Generate last 7 days for the weekly adherence matrix using UTC methods
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(todayStr + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <div className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Consistency Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Habit Adherence & Heatmaps
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl font-sans">
            Track reading, coding, workouts, wake-up times, and project milestones across interactive contribution grids.
          </p>
        </div>
        <button
          onClick={() => setShowAddHabit(!showAddHabit)}
          className="btn-primary text-xs py-2.5 px-5 self-start sm:self-auto gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Habit Target</span>
        </button>
      </div>

      {/* Add Habit Form Modal */}
      <AnimatePresence>
        {showAddHabit && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="bento-card p-6 space-y-4 max-w-lg bg-white dark:bg-[#131A29]"
          >
            <form onSubmit={handleAddHabit}>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/[0.06] pb-3">
                <h3 className="text-sm font-display font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Define New Habit Target
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddHabit(false)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 pt-3">
                <div>
                  <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Habit Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="e.g. Read 30 Mins, Wake up at 06:30, LeetCode"
                    className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Category
                    </label>
                    <select
                      value={newHabitCategory}
                      onChange={(e) => setNewHabitCategory(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
                    >
                      {INITIAL_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Target Cadence
                    </label>
                    <select
                      value={newHabitTarget}
                      onChange={(e) => setNewHabitTarget(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
                    >
                      {[7, 6, 5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} days / week
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddHabit(false)}
                    className="btn-secondary text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs py-2 px-5">
                    Save Habit
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Heatmap (24 Weeks) */}
      <div>
        <ContributionHeatmap activities={activities} weeksToShow={24} />
      </div>

      {/* Habit Matrix - Last 7 Days (Bento Table Card) */}
      <div className="bento-card p-6 md:p-7 space-y-5 bg-white dark:bg-[#131A29]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
          <div>
            <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">
              7-Day Adherence Matrix
            </h3>
            <div className="text-xs text-slate-400 font-sans mt-0.5">
              Interactive checkoff for past and current days
            </div>
          </div>
          <div className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300">
            Today: {todayStr}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/[0.06] text-slate-400 font-display font-bold">
                <th className="pb-3 pl-1">Habit</th>
                <th className="pb-3">Category</th>
                <th className="pb-3 text-center">Weekly Target</th>
                {past7Days.map((d) => (
                  <th key={d} className="pb-3 text-center px-1.5">
                    <div className="font-display font-bold text-slate-800 dark:text-slate-200">
                      {new Date(d).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{d.slice(8)}</div>
                  </th>
                ))}
                <th className="pb-3 text-right pr-3">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {habits.map((habit) => {
                const weeklyDoneCount = past7Days.filter((d) => isHabitCompleted(habit.id, d)).length;
                return (
                  <tr key={habit.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 font-display font-bold text-slate-900 dark:text-white pr-4 pl-1">
                      {habit.name}
                    </td>
                    <td className="py-3.5 font-display text-[11px] text-slate-500 pr-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 font-semibold">
                        {habit.categoryId}
                      </span>
                    </td>
                    <td className="py-3.5 text-center font-display text-[12px] font-bold pr-2">
                      <span
                        className={
                          weeklyDoneCount >= habit.targetPerWeek
                            ? 'text-emerald-600 dark:text-mint font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30'
                            : 'text-slate-700 dark:text-slate-300'
                        }
                      >
                        {weeklyDoneCount}/{habit.targetPerWeek}
                      </span>
                    </td>

                    {past7Days.map((d) => {
                      const done = isHabitCompleted(habit.id, d);
                      const isToday = d === todayStr;
                      return (
                        <td key={d} className="py-3.5 text-center px-1.5">
                          <button
                            onClick={() => handleToggleHabit(habit.id, d)}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center mx-auto transition-all ${
                              done
                                ? 'bg-mint text-slate-950 shadow-sm'
                                : 'bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.06] text-slate-400 hover:border-lime'
                            } ${isToday ? 'ring-2 ring-lime ring-offset-2 ring-offset-white dark:ring-offset-[#131A29]' : ''}`}
                            title={`${habit.name} on ${d}`}
                          >
                            {done ? (
                              <Check className="w-4 h-4 stroke-[3]" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                    <td className="py-3.5 text-right pr-3">
                      <button
                        onClick={() => handleDeleteHabit(habit.id)}
                        className="p-1.5 rounded-full text-slate-400 hover:text-coral hover:bg-coral/10 transition-colors"
                        title="Delete Habit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
