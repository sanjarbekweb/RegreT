'use client';

import React, { useState, useEffect } from 'react';
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

  // Generate last 7 days for the weekly adherence matrix
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(todayStr);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="text-xs font-mono text-muted uppercase tracking-wider">
            Consistency Engine
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
            Habit & Activity Consistency
          </h1>
          <p className="text-xs text-muted mt-1">
            Track reading, coding, workouts, wake-up times, and homework adherence across GitHub-style heatmaps.
          </p>
        </div>
        <button
          onClick={() => setShowAddHabit(!showAddHabit)}
          className="btn-primary text-xs py-2 px-4 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Habit Target</span>
        </button>
      </div>

      {/* Add Habit Form Modal/Drawer */}
      {showAddHabit && (
        <form
          onSubmit={handleAddHabit}
          className="bg-surface border border-border rounded-lg p-4 space-y-4 max-w-lg"
        >
          <div className="flex justify-between items-center border-b border-border pb-2">
            <h3 className="text-xs font-semibold text-foreground uppercase font-mono">
              Define New Habit
            </h3>
            <button
              type="button"
              onClick={() => setShowAddHabit(false)}
              className="text-muted hover:text-foreground text-xs"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-mono text-muted mb-1">Habit Name *</label>
              <input
                type="text"
                required
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="e.g. Read 30 Mins, Wake up at 06:30, LeetCode"
                className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-muted mb-1">Category</label>
                <select
                  value={newHabitCategory}
                  onChange={(e) => setNewHabitCategory(e.target.value as any)}
                  className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                >
                  {INITIAL_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1">Days Per Week</label>
                <select
                  value={newHabitTarget}
                  onChange={(e) => setNewHabitTarget(Number(e.target.value))}
                  className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                >
                  {[7, 6, 5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} days / week
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddHabit(false)}
                className="btn-secondary text-xs"
              >
                Close
              </button>
              <button type="submit" className="btn-primary text-xs">
                Save Habit
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Primary Heatmap (24 Weeks) */}
      <div>
        <ContributionHeatmap activities={activities} weeksToShow={24} />
      </div>

      {/* Habit Matrix - Last 7 Days */}
      <div className="bg-surface border border-border rounded-lg p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
          <div>
            <h3 className="font-semibold text-sm text-foreground">7-Day Habit Matrix</h3>
            <div className="text-xs text-muted font-mono">
              Click individual cells to check off past or current days
            </div>
          </div>
          <div className="text-xs font-mono text-muted">Reference: {todayStr}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted font-mono">
                <th className="pb-2 font-medium">Habit</th>
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 font-medium text-center">Target</th>
                {past7Days.map((d) => (
                  <th key={d} className="pb-2 font-medium text-center px-1">
                    <div>{new Date(d).toLocaleDateString('en-US', { weekday: 'narrow' })}</div>
                    <div className="text-[10px] text-muted/60">{d.slice(8)}</div>
                  </th>
                ))}
                <th className="pb-2 font-medium text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {habits.map((habit) => {
                const weeklyDoneCount = past7Days.filter((d) => isHabitCompleted(habit.id, d)).length;
                return (
                  <tr key={habit.id} className="hover:bg-elevated/40 transition-colors">
                    <td className="py-3 font-medium text-foreground pr-4">
                      {habit.name}
                    </td>
                    <td className="py-3 font-mono text-[11px] text-muted pr-4">
                      <span className="px-2 py-0.5 rounded bg-elevated border border-border">
                        {habit.categoryId}
                      </span>
                    </td>
                    <td className="py-3 text-center font-mono text-[11px] text-muted pr-2">
                      <span
                        className={
                          weeklyDoneCount >= habit.targetPerWeek
                            ? 'text-success font-bold'
                            : 'text-foreground'
                        }
                      >
                        {weeklyDoneCount}/{habit.targetPerWeek}
                      </span>
                    </td>

                    {past7Days.map((d) => {
                      const done = isHabitCompleted(habit.id, d);
                      const isToday = d === todayStr;
                      return (
                        <td key={d} className="py-3 text-center px-1">
                          <button
                            onClick={() => handleToggleHabit(habit.id, d)}
                            className={`w-7 h-7 rounded flex items-center justify-center mx-auto transition-all ${
                              done
                                ? 'bg-success/20 border border-success/60 text-success'
                                : 'bg-elevated border border-border/80 text-muted/40 hover:text-foreground hover:border-muted'
                            } ${isToday ? 'ring-1 ring-primary' : ''}`}
                            title={`${habit.name} on ${d}`}
                          >
                            {done ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Circle className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                    <td className="py-3 text-right pr-2">
                      <button
                        onClick={() => handleDeleteHabit(habit.id)}
                        className="p-1 rounded text-muted hover:text-danger hover:bg-elevated transition-colors"
                        title="Delete Habit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
