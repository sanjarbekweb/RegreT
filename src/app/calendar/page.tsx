'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  Plus,
  Flame,
  Award,
  Trash2,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Image as ImageIcon,
  ChevronDown,
  X,
  ArrowRight,
  Calendar as CalendarIcon,
  HelpCircle,
  FolderGit2,
} from 'lucide-react';
import { storage, INITIAL_CATEGORIES } from '../../lib/storage';
import { Activity, Habit, HabitCompletion, CategoryId } from '../../lib/types';
import {
  calculateStreaks,
  getIntensityClass,
  classifyDay,
  getArchiveStartDate,
  DayStatusInfo,
} from '../../lib/analytics';
import AnimatedCounter from '../../components/AnimatedCounter';

interface MonthHeaderInfo {
  label: string;
  fullLabel: string;
  year: number;
  monthIndex: number;
  colIndex: number;
  key: string;
}

export default function ConsistencyCalendarPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);

  // Filter category
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Monthly navigation
  const [activeMonthKey, setActiveMonthKey] = useState<string>('');
  const gridScrollRef = useRef<HTMLDivElement>(null);

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

  // Filter activities by category
  const filteredActivities = useMemo(() => {
    if (selectedCategory === 'all') return activities;
    return activities.filter((a) => a.categoryId === selectedCategory);
  }, [activities, selectedCategory]);

  // Earliest recorded activity serves as archive start date
  const archiveStartDate = useMemo(() => {
    return getArchiveStartDate(activities);
  }, [activities]);

  // Aggregate counts and day lists
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

  // Full-Year (52 weeks) GitHub Grid Generation with Missing Data vs Empty Day distinction
  const { weeks, monthHeaders, stats } = useMemo(() => {
    const totalWeeks = 52;
    const today = new Date();
    const todayIso = today.toISOString().split('T')[0];
    const todayUtc = new Date(todayIso + 'T00:00:00Z');

    // Day of week where Monday is 0 and Sunday is 6
    const todayDayOfWeek = (todayUtc.getUTCDay() + 6) % 7;

    // Start of the current week (Monday)
    const currentWeekMonday = new Date(todayUtc);
    currentWeekMonday.setUTCDate(todayUtc.getUTCDate() - todayDayOfWeek);

    // Start of the 52 weeks grid (Monday)
    const gridStartMonday = new Date(currentWeekMonday);
    gridStartMonday.setUTCDate(currentWeekMonday.getUTCDate() - (totalWeeks - 1) * 7);

    const generatedWeeks: {
      date: Date;
      dateStr: string;
      count: number;
      activities: Activity[];
      isFuture: boolean;
      isToday: boolean;
      statusInfo: DayStatusInfo;
      monthKey: string;
    }[][] = [];

    const headers: MonthHeaderInfo[] = [];
    let lastMonth = -1;

    const pastAndTodayDays: { dateStr: string; count: number }[] = [];

    for (let w = 0; w < totalWeeks; w++) {
      const weekDays: {
        date: Date;
        dateStr: string;
        count: number;
        activities: Activity[];
        isFuture: boolean;
        isToday: boolean;
        statusInfo: DayStatusInfo;
        monthKey: string;
      }[] = [];

      // Check first day of week for month label
      const weekMondayDate = new Date(gridStartMonday);
      weekMondayDate.setUTCDate(gridStartMonday.getUTCDate() + w * 7);
      const m = weekMondayDate.getUTCMonth();
      const y = weekMondayDate.getUTCFullYear();
      const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`;

      if (m !== lastMonth) {
        headers.push({
          label: weekMondayDate.toLocaleDateString('en-US', { month: 'short' }),
          fullLabel: weekMondayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          year: y,
          monthIndex: m,
          colIndex: w,
          key: monthKey,
        });
        lastMonth = m;
      }

      for (let d = 0; d < 7; d++) {
        const dayDate = new Date(gridStartMonday);
        dayDate.setUTCDate(gridStartMonday.getUTCDate() + w * 7 + d);
        const dateStr = dayDate.toISOString().split('T')[0];

        const isToday = dateStr === todayIso;
        const isFuture = dateStr > todayIso;
        const dayActs = isFuture ? [] : (dateMap.get(dateStr) || []);

        const statusInfo = classifyDay(dateStr, dayActs.length, todayIso, archiveStartDate);

        weekDays.push({
          date: dayDate,
          dateStr,
          count: dayActs.length,
          activities: dayActs,
          isFuture,
          isToday,
          statusInfo,
          monthKey,
        });

        if (!isFuture) {
          pastAndTodayDays.push({ dateStr, count: dayActs.length });
        }
      }
      generatedWeeks.push(weekDays);
    }

    const streakStats = calculateStreaks(pastAndTodayDays);

    return {
      weeks: generatedWeeks,
      monthHeaders: headers,
      stats: {
        ...streakStats,
        totalLogged: filteredActivities.length,
      },
    };
  }, [dateMap, filteredActivities, archiveStartDate]);

  // Set default active month to current month if not set
  useEffect(() => {
    if (monthHeaders.length > 0 && !activeMonthKey) {
      const latest = monthHeaders[monthHeaders.length - 1];
      setActiveMonthKey(latest.key);
    }
  }, [monthHeaders, activeMonthKey]);

  // Active month navigation helpers
  const currentMonthIdx = useMemo(() => {
    const idx = monthHeaders.findIndex((m) => m.key === activeMonthKey);
    return idx >= 0 ? idx : monthHeaders.length - 1;
  }, [monthHeaders, activeMonthKey]);

  const activeMonthInfo = monthHeaders[currentMonthIdx] || monthHeaders[monthHeaders.length - 1];

  const handlePrevMonth = () => {
    if (currentMonthIdx > 0) {
      const target = monthHeaders[currentMonthIdx - 1];
      setActiveMonthKey(target.key);
      scrollToMonth(target.colIndex);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIdx < monthHeaders.length - 1) {
      const target = monthHeaders[currentMonthIdx + 1];
      setActiveMonthKey(target.key);
      scrollToMonth(target.colIndex);
    }
  };

  const handleSelectMonth = (mKey: string) => {
    setActiveMonthKey(mKey);
    const target = monthHeaders.find((m) => m.key === mKey);
    if (target) {
      scrollToMonth(target.colIndex);
    }
  };

  const scrollToMonth = (colIdx: number) => {
    if (gridScrollRef.current) {
      const weekWidth = 16; // approximate px per week column
      gridScrollRef.current.scrollTo({
        left: Math.max(0, colIdx * weekWidth - 30),
        behavior: 'smooth',
      });
    }
  };

  // Month-specific activities and consistency metrics
  const activeMonthStats = useMemo(() => {
    if (!activeMonthInfo) {
      return { total: 0, activeDays: 0, totalDays: 30, consistencyPct: 0 };
    }

    let totalActivities = 0;
    let activeDays = 0;
    let totalTrackedDays = 0;

    weeks.forEach((week) => {
      week.forEach((day) => {
        const dayMonth = `${day.date.getUTCFullYear()}-${String(day.date.getUTCMonth() + 1).padStart(2, '0')}`;
        if (dayMonth === activeMonthInfo.key && !day.isFuture) {
          totalTrackedDays++;
          if (day.count > 0) {
            activeDays++;
            totalActivities += day.count;
          }
        }
      });
    });

    const consistencyPct =
      totalTrackedDays > 0 ? Math.round((activeDays / totalTrackedDays) * 100) : 0;

    return {
      total: totalActivities,
      activeDays,
      totalDays: totalTrackedDays,
      consistencyPct,
    };
  }, [weeks, activeMonthInfo]);

  // Single-color intensity scale (Monochromatic blue scale matching GitHub)
  const getColorClass = (count: number) => getIntensityClass(count);

  const dayLabels = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

  // Past 7 days for habit tracking matrix
  const past7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(todayStr + 'T00:00:00Z');
      d.setUTCDate(d.getUTCDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });
  }, [todayStr]);

  const selectedDayActivities = selectedDate ? dateMap.get(selectedDate) || [] : [];
  const selectedDayStatusInfo = useMemo(() => {
    if (!selectedDate) return null;
    return classifyDay(
      selectedDate,
      selectedDayActivities.length,
      todayStr,
      archiveStartDate
    );
  }, [selectedDate, selectedDayActivities.length, todayStr, archiveStartDate]);

  const handleOpenCaptureForDate = (dateToPrefill: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('regret_open_quick_capture', {
          detail: { dateStr: dateToPrefill },
        })
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1E293B]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
            Consistency & Activity Calendar
          </div>
          <h1 className="text-2xl font-sans font-semibold tracking-tight text-[#F0F6FC] mt-0.5">
            Full-Year Activity Heatmap
          </h1>
          <p className="text-xs text-[#8B949E] mt-0.5">
            52 weeks continuous life activity heatmap with monochromatic intensity scale, monthly navigation, and clear empty day vs missing data distinction.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => handleOpenCaptureForDate(todayStr)}
            className="btn-primary text-xs py-1.5 px-3 gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Capture</span>
          </button>
          <button
            onClick={() => setShowAddHabit(!showAddHabit)}
            className="btn-secondary text-xs py-1.5 px-3 gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[#8B949E]" />
            <span>New Habit</span>
          </button>
        </div>
      </div>

      {/* Add Habit Modal */}
      <AnimatePresence>
        {showAddHabit && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="workspace-panel p-5 space-y-4 max-w-lg bg-[#111827] border border-[#1E293B]"
          >
            <form onSubmit={handleAddHabit}>
              <div className="flex justify-between items-center border-b border-[#1E293B] pb-3">
                <h3 className="text-xs font-semibold text-[#F0F6FC] uppercase tracking-wider">
                  Define Habit Target
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddHabit(false)}
                  className="text-[#64748B] hover:text-[#F0F6FC]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 pt-3">
                <div>
                  <label className="block text-xs font-medium text-[#8B949E] mb-1">
                    Habit Name
                  </label>
                  <input
                    type="text"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="e.g. Read 20 pages, Gym Workout, Coding sprint"
                    className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] placeholder:text-[#64748B] focus:outline-none focus:border-[#388BFD]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#8B949E] mb-1">
                      Category
                    </label>
                    <select
                      value={newHabitCategory}
                      onChange={(e) => setNewHabitCategory(e.target.value as CategoryId)}
                      className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                    >
                      {INITIAL_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#8B949E] mb-1">
                      Days per Week
                    </label>
                    <select
                      value={newHabitTarget}
                      onChange={(e) => setNewHabitTarget(Number(e.target.value))}
                      className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                        <option key={num} value={num}>
                          {num} days / week
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddHabit(false)}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs py-1.5 px-3">
                    Save Habit
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Full-Year Calendar Panel */}
      <div className="workspace-panel p-5 space-y-4 bg-[#111827] border border-[#1E293B]">
        {/* Top Controls Bar: Category Filters & Monthly Navigation */}
        <div className="space-y-3 pb-3 border-b border-[#1E293B]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#388BFD]" />
              <span className="text-xs font-semibold text-[#F0F6FC]">
                52-Week Full-Year Grid
              </span>
            </div>

            {/* Category filter pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-[#161F2E] text-[#F0F6FC] border border-[#388BFD]/40'
                    : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161F2E]/60 border border-transparent'
                }`}
              >
                All Categories
              </button>
              {INITIAL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-[#161F2E] text-[#F0F6FC] border border-[#388BFD]/40'
                    : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161F2E]/60 border border-transparent'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Monthly Navigation Bar (Requirement) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#1E293B]/70">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider">
                Monthly Navigation:
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  disabled={currentMonthIdx <= 0}
                  className="p-1 rounded bg-[#161F2E] border border-[#232E3E] text-[#8B949E] hover:text-[#F0F6FC] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-semibold text-[#F0F6FC] min-w-[110px] text-center font-sans">
                  {activeMonthInfo?.fullLabel || 'Current Month'}
                </span>
                <button
                  onClick={handleNextMonth}
                  disabled={currentMonthIdx >= monthHeaders.length - 1}
                  className="p-1 rounded bg-[#161F2E] border border-[#232E3E] text-[#8B949E] hover:text-[#F0F6FC] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  title="Next Month"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Month Jump Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-xs">
              {monthHeaders.map((mh) => {
                const isActive = mh.key === activeMonthKey;
                return (
                  <button
                    key={mh.key}
                    onClick={() => handleSelectMonth(mh.key)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors shrink-0 ${
                      isActive
                        ? 'bg-[#388BFD] text-white font-medium shadow-sm'
                        : 'bg-[#161F2E] text-[#8B949E] hover:text-[#F0F6FC] border border-[#1E293B]'
                    }`}
                  >
                    {mh.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Month Focus Summary Banner */}
        {activeMonthInfo && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-md bg-[#0D1117] border border-[#1E293B] text-xs">
            <div>
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Focused Month</span>
              <div className="text-xs font-semibold text-[#F0F6FC] mt-0.5">
                {activeMonthInfo.fullLabel}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Monthly Activities</span>
              <div className="text-xs font-semibold text-[#388BFD] mt-0.5">
                {activeMonthStats.total} logged blocks
              </div>
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Active Days</span>
              <div className="text-xs font-semibold text-[#F0F6FC] mt-0.5">
                {activeMonthStats.activeDays} of {activeMonthStats.totalDays} days
              </div>
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Monthly Consistency</span>
              <div className="text-xs font-semibold text-[#238636] mt-0.5">
                {activeMonthStats.consistencyPct}% consistency
              </div>
            </div>
          </div>
        )}

        {/* 52-Week Full-Year Heatmap Grid */}
        <div ref={gridScrollRef} className="overflow-x-auto pt-2 pb-2">
          {/* Month headers row */}
          <div className="flex pl-7 text-[10px] font-mono text-[#64748B] mb-1 select-none">
            {monthHeaders.map((ml, idx) => (
              <div
                key={idx}
                style={{ width: `${ml.colIndex === 0 ? 3.8 : 4.2}rem` }}
                className={`shrink-0 cursor-pointer transition-colors ${
                  ml.key === activeMonthKey ? 'text-[#388BFD] font-semibold' : 'hover:text-[#F0F6FC]'
                }`}
                onClick={() => handleSelectMonth(ml.key)}
              >
                {ml.label}
              </div>
            ))}
          </div>

          <div className="inline-flex gap-1 min-w-max">
            {/* Day labels column */}
            <div className="flex flex-col justify-between py-0.5 text-[9px] text-[#64748B] font-mono pr-1 select-none">
              {dayLabels.map((lbl, idx) => (
                <span key={idx} className="h-3 leading-3">
                  {lbl}
                </span>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, wIdx) => {
              const isWeekInActiveMonth = week.some((d) => d.monthKey === activeMonthKey);
              return (
                <div
                  key={wIdx}
                  className={`flex flex-col gap-1 transition-all ${
                    isWeekInActiveMonth ? 'p-0.5 -m-0.5 rounded bg-[#161F2E]/30' : ''
                  }`}
                >
                  {week.map((day) => {
                    if (day.isFuture) {
                      return (
                        <div
                          key={day.dateStr}
                          className="w-3 h-3 rounded-sm border border-transparent opacity-0 pointer-events-none"
                        />
                      );
                    }

                    const isSelected = selectedDate === day.dateStr;
                    const status = day.statusInfo.status;

                    // Compute styling based on exact empty vs missing vs active status
                    let cellClass = '';
                    if (status === 'missing') {
                      cellClass =
                        'bg-[#090D12] border border-dashed border-[#30363D] opacity-60 hover:opacity-100 hover:border-[#64748B]';
                    } else if (status === 'empty') {
                      cellClass =
                        'bg-[#161B22] border border-[#21262D] hover:border-[#388BFD]/70';
                    } else {
                      cellClass = getColorClass(day.count);
                    }

                    return (
                      <button
                        key={day.dateStr}
                        onClick={() =>
                          setSelectedDate(selectedDate === day.dateStr ? null : day.dateStr)
                        }
                        title={`${day.dateStr}${day.isToday ? ' (Today)' : ''} · ${day.statusInfo.label} · ${day.statusInfo.description}`}
                        className={`w-3 h-3 rounded-sm transition-all ${cellClass} ${
                          isSelected
                            ? 'ring-2 ring-[#388BFD] ring-offset-1 ring-offset-[#090D12] scale-125 z-10'
                            : day.isToday
                            ? 'ring-1 ring-[#388BFD]'
                            : ''
                        }`}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Comprehensive GitHub Monochromatic Legend with Empty Day vs Missing Data distinction */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-[#1E293B] text-xs text-[#8B949E]">
          {/* Intensity Scale */}
          <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
            <span className="text-[#64748B]">Activity intensity:</span>
            <span className="text-[#64748B] text-[10px]">Less</span>
            <span className="w-3 h-3 rounded-sm bg-[#0D3868] border border-[#1B4B82]" title="Level 1: 1 activity" />
            <span className="w-3 h-3 rounded-sm bg-[#1A5699] border border-[#236EC2]" title="Level 2: 2 activities" />
            <span className="w-3 h-3 rounded-sm bg-[#2875D0] border border-[#368AE6]" title="Level 3: 3 activities" />
            <span className="w-3 h-3 rounded-sm bg-[#58A6FF] border border-[#79B8FF]" title="Level 4: 4+ activities" />
            <span className="text-[#64748B] text-[10px]">More</span>
          </div>

          {/* Empty Day vs Missing Data distinction swatches */}
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <div className="flex items-center gap-1.5" title="Tracked day with 0 activities logged">
              <span className="w-3 h-3 rounded-sm bg-[#161B22] border border-[#21262D]" />
              <span className="text-[#8B949E]">Empty day (Tracked)</span>
            </div>
            <div className="flex items-center gap-1.5" title="Untracked date prior to archive start or gap">
              <span className="w-3 h-3 rounded-sm bg-[#090D12] border border-dashed border-[#30363D]" />
              <span className="text-[#64748B]">Missing data (Untracked)</span>
            </div>
          </div>
        </div>

        {/* Selected Date Records Drawer */}
        <AnimatePresence>
          {selectedDate && selectedDayStatusInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-md p-4 bg-[#0D1117] border border-[#1E293B] space-y-3 mt-3"
            >
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#F0F6FC]">
                    Records for {new Date(selectedDate + 'T00:00:00Z').toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                      selectedDayStatusInfo.status === 'active'
                        ? 'bg-[#161F2E] text-[#388BFD] border-[#388BFD]/40'
                        : selectedDayStatusInfo.status === 'empty'
                        ? 'bg-[#161B22] text-[#8B949E] border-[#21262D]'
                        : 'bg-[#090D12] text-[#64748B] border-dashed border-[#30363D]'
                    }`}
                  >
                    {selectedDayStatusInfo.status === 'active'
                      ? `${selectedDayActivities.length} ${selectedDayActivities.length === 1 ? 'activity' : 'activities'}`
                      : selectedDayStatusInfo.status === 'empty'
                      ? 'Empty Day (Tracked)'
                      : 'Missing Data (Untracked)'}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-xs text-[#64748B] hover:text-[#F0F6FC]"
                >
                  Close
                </button>
              </div>

              {/* Status Specific Explanations & Quick Action */}
              {selectedDayStatusInfo.status === 'missing' && (
                <div className="py-3 px-3.5 rounded-md bg-[#111827]/70 border border-dashed border-[#30363D] space-y-2">
                  <p className="text-xs text-[#8B949E] leading-relaxed">
                    <strong>Missing Data (Untracked)</strong> — No archive records exist for this date. This date falls before your life archive tracking was active or in an unrecorded gap.
                  </p>
                  <button
                    onClick={() => handleOpenCaptureForDate(selectedDate)}
                    className="inline-flex btn-primary text-xs py-1.5 px-3 gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Backfill Activity for this Date</span>
                  </button>
                </div>
              )}

              {selectedDayStatusInfo.status === 'empty' && (
                <div className="py-3 px-3.5 rounded-md bg-[#111827]/70 border border-[#1E293B] space-y-2">
                  <p className="text-xs text-[#8B949E] leading-relaxed">
                    <strong>Empty Day (Tracked)</strong> — You were actively logging during this period, but recorded zero activities on this date (rest day, offline period, or no scheduled blocks).
                  </p>
                  <button
                    onClick={() => handleOpenCaptureForDate(selectedDate)}
                    className="inline-flex btn-primary text-xs py-1.5 px-3 gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Record Activity for this Date</span>
                  </button>
                </div>
              )}

              {/* Active Day Activities List with Direct Deep-Links to Timeline */}
              {selectedDayStatusInfo.status === 'active' && (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {selectedDayActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-md bg-[#111827] border border-[#1E293B] space-y-2 group hover:border-[#388BFD]/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-medium text-[#F0F6FC] truncate">
                            {act.title}
                          </span>
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#161F2E] text-[#8B949E] border border-[#1E293B] shrink-0">
                            {act.categoryId}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-mono text-[#64748B]">
                            {act.startedAt.split('T')[1]?.slice(0, 5) || '—'}
                          </span>
                          <Link
                            href={`/timeline?id=${act.id}`}
                            className="text-[11px] font-mono text-[#388BFD] hover:underline flex items-center gap-0.5"
                            title="Inspect complete record in Life Timeline"
                          >
                            <span>Timeline</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>

                      {act.description && (
                        <p className="text-[11px] text-[#8B949E] leading-relaxed">
                          {act.description}
                        </p>
                      )}

                      {act.attachments && act.attachments.length > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          {act.attachments.map((att) => (
                            <div
                              key={att.id}
                              className="w-12 h-12 rounded border border-[#1E293B] overflow-hidden bg-black shrink-0"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={att.url}
                                alt={att.caption || 'Photo'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Weekly Habit Target Adherence Matrix */}
      <div className="workspace-panel p-5 space-y-4 bg-[#111827] border border-[#1E293B]">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <div>
            <h3 className="text-xs font-semibold text-[#F0F6FC] uppercase tracking-wider">
              Habit Cadence Matrix
            </h3>
            <p className="text-xs text-[#8B949E]">
              Last 7 days adherence tracking for active weekly habits
            </p>
          </div>
          <span className="text-xs font-mono text-[#64748B]">
            {habits.length} habits configured
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1E293B] text-[#64748B] font-mono text-[10px]">
                <th className="py-2 pr-4 font-normal">Habit Target</th>
                <th className="py-2 px-2 font-normal">Category</th>
                <th className="py-2 px-2 font-normal">Target</th>
                {past7Days.map((d) => (
                  <th key={d} className="py-2 px-2 text-center font-normal">
                    {new Date(d + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'narrow' })}
                    <div className="text-[9px] text-[#484F58]">{d.slice(8)}</div>
                  </th>
                ))}
                <th className="py-2 pl-4 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {habits.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-6 text-center text-[#64748B] text-xs">
                    No habit targets active. Define your first habit above.
                  </td>
                </tr>
              ) : (
                habits.map((habit) => {
                  const completedDaysThisWeek = past7Days.filter((d) =>
                    isHabitCompleted(habit.id, d)
                  ).length;

                  return (
                    <tr key={habit.id} className="hover:bg-[#161F2E]/40 transition-colors">
                      <td className="py-2.5 pr-4 font-medium text-[#F0F6FC]">{habit.name}</td>
                      <td className="py-2.5 px-2">
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#161F2E] text-[#8B949E] border border-[#1E293B]">
                          {habit.categoryId}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-[#8B949E] font-mono text-[11px]">
                        {completedDaysThisWeek}/{habit.targetPerWeek}d
                      </td>
                      {past7Days.map((d) => {
                        const done = isHabitCompleted(habit.id, d);
                        return (
                          <td key={d} className="py-2.5 px-2 text-center">
                            <button
                              onClick={() => handleToggleHabit(habit.id, d)}
                              className={`w-5 h-5 rounded flex items-center justify-center transition-all mx-auto ${
                                done
                                  ? 'bg-[#238636] text-white border border-[#2ea043]'
                                  : 'bg-[#161B22] border border-[#21262D] text-transparent hover:border-[#388BFD]'
                              }`}
                              title={`${habit.name} on ${d}: ${done ? 'Completed' : 'Pending'}`}
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                            </button>
                          </td>
                        );
                      })}
                      <td className="py-2.5 pl-4 text-right">
                        <button
                          onClick={() => handleDeleteHabit(habit.id)}
                          className="p-1 rounded text-[#484F58] hover:text-[#F85149] transition-colors"
                          title="Delete habit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
