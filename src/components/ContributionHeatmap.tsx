'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, CategoryId } from '../lib/types';
import { INITIAL_CATEGORIES } from '../lib/storage';
import {
  calculateStreaks,
  getIntensityClass,
  classifyDay,
  getArchiveStartDate,
  DayStatusInfo,
} from '../lib/analytics';
import AnimatedCounter from './AnimatedCounter';
import {
  Flame,
  Trophy,
  CalendarCheck2,
  Activity as ActivityIcon,
  Clock,
  ChevronRight,
  Plus,
} from 'lucide-react';

interface ContributionHeatmapProps {
  activities: Activity[];
  weeksToShow?: number;
  onSelectDate?: (dateStr: string, dayActivities: Activity[]) => void;
  onSelectActivity?: (activity: Activity) => void;
  showDayDetails?: boolean;
}

export default function ContributionHeatmap({
  activities,
  weeksToShow = 16,
  onSelectDate,
  onSelectActivity,
  showDayDetails = true,
}: ContributionHeatmapProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [activeDate, setActiveDate] = useState<string | null>(null);

  // Filter activities by category if selected
  const filteredActivities = useMemo(() => {
    if (selectedCategory === 'all') return activities;
    return activities.filter((a) => a.categoryId === selectedCategory);
  }, [activities, selectedCategory]);

  const archiveStartDate = useMemo(() => {
    return getArchiveStartDate(activities);
  }, [activities]);

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
  const { grid, monthLabels, stats } = useMemo(() => {
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
      statusInfo: DayStatusInfo;
    }[][] = [];

    const monthHeaders: { label: string; colIndex: number }[] = [];
    let lastMonth = -1;

    const pastAndTodayDays: { dateStr: string; count: number }[] = [];

    for (let w = 0; w < weeksToShow; w++) {
      const weekDays: {
        date: Date;
        dateStr: string;
        count: number;
        activities: Activity[];
        isFuture: boolean;
        isToday: boolean;
        statusInfo: DayStatusInfo;
      }[] = [];

      const weekMondayDate = new Date(gridStartMonday);
      weekMondayDate.setUTCDate(gridStartMonday.getUTCDate() + w * 7);
      const m = weekMondayDate.getUTCMonth();
      if (m !== lastMonth) {
        monthHeaders.push({
          label: weekMondayDate.toLocaleDateString('en-US', { month: 'short' }),
          colIndex: w,
        });
        lastMonth = m;
      }

      for (let d = 0; d < 7; d++) {
        const dayDate = new Date(gridStartMonday);
        dayDate.setUTCDate(gridStartMonday.getUTCDate() + w * 7 + d);
        const dateStr = dayDate.toISOString().split('T')[0];

        const isToday = dateStr === todayStr;
        const isFuture = dateStr > todayStr;
        const dayActs = isFuture ? [] : (dateMap.get(dateStr) || []);

        const statusInfo = classifyDay(dateStr, dayActs.length, todayStr, archiveStartDate);

        const dayItem = {
          date: dayDate,
          dateStr,
          count: dayActs.length,
          activities: dayActs,
          isFuture,
          isToday,
          statusInfo,
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
      monthLabels: monthHeaders,
      stats: {
        ...streakStats,
        totalLogged: filteredActivities.length,
      },
    };
  }, [weeksToShow, dateMap, filteredActivities, archiveStartDate]);

  // Single-color intensity scale (Monochromatic blue scale matching Linear/GitHub)
  const getColorClass = (count: number) => getIntensityClass(count);

  const dayLabels = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];
  const selectedDayActivities = activeDate ? dateMap.get(activeDate) || [] : [];
  const selectedDayStatus = useMemo(() => {
    if (!activeDate) return null;
    const today = new Date().toISOString().split('T')[0];
    return classifyDay(activeDate, selectedDayActivities.length, today, archiveStartDate);
  }, [activeDate, selectedDayActivities.length, archiveStartDate]);

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
    <div className="workspace-panel p-5 space-y-5 bg-[#111827] border border-[#1E293B]">
      {/* Top Header & Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
            Consistency Matrix
          </div>
          <h3 className="font-sans font-semibold text-sm text-[#F0F6FC] mt-0.5">
            Activity History & Consistency
          </h3>
          <p className="text-xs text-[#8B949E]">
            {weeksToShow} weeks continuous record · Monochromatic single-color scale
          </p>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-[#161F2E] text-[#F0F6FC] border border-[#388BFD]/40'
                : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161F2E]/60 border border-transparent'
            }`}
          >
            All Tracks
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

      {/* Restrained Linear-Style Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-md p-3 bg-[#0D1117] border border-[#1E293B]">
          <div className="flex items-center justify-between text-[#8B949E]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Current Streak</span>
            <Flame className="w-3.5 h-3.5 text-[#388BFD]" />
          </div>
          <div className="text-xl font-mono font-semibold text-[#F0F6FC] mt-1">
            <AnimatedCounter value={stats.currentStreak} suffix=" Days" />
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Active daily cadence</div>
        </div>

        <div className="rounded-md p-3 bg-[#0D1117] border border-[#1E293B]">
          <div className="flex items-center justify-between text-[#8B949E]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Longest Streak</span>
            <Trophy className="w-3.5 h-3.5 text-[#8B949E]" />
          </div>
          <div className="text-xl font-mono font-semibold text-[#F0F6FC] mt-1">
            <AnimatedCounter value={stats.longestStreak} suffix=" Days" />
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Personal record</div>
        </div>

        <div className="rounded-md p-3 bg-[#0D1117] border border-[#1E293B]">
          <div className="flex items-center justify-between text-[#8B949E]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Active Days</span>
            <CalendarCheck2 className="w-3.5 h-3.5 text-[#8B949E]" />
          </div>
          <div className="text-xl font-mono font-semibold text-[#F0F6FC] mt-1">
            <AnimatedCounter value={stats.totalActiveDays} suffix=" Days" />
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Recorded on calendar</div>
        </div>

        <div className="rounded-md p-3 bg-[#0D1117] border border-[#1E293B]">
          <div className="flex items-center justify-between text-[#8B949E]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Total Recorded</span>
            <ActivityIcon className="w-3.5 h-3.5 text-[#388BFD]" />
          </div>
          <div className="text-xl font-mono font-semibold text-[#F0F6FC] mt-1">
            <AnimatedCounter value={stats.totalLogged} suffix=" Logs" />
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Completed life blocks</div>
        </div>
      </div>

      {/* GitHub Calendar Grid (Single-color scale) */}
      <div className="overflow-x-auto pt-1 pb-1">
        {/* Month headers row */}
        {monthLabels.length > 0 && (
          <div className="flex pl-7 text-[10px] font-mono text-[#64748B] mb-1 select-none">
            {monthLabels.map((ml, idx) => (
              <div
                key={idx}
                style={{ width: `${ml.colIndex === 0 ? 3.8 : 4.4}rem` }}
                className="shrink-0"
              >
                {ml.label}
              </div>
            ))}
          </div>
        )}

        <div className="inline-flex gap-1.5 min-w-max">
          <div className="flex flex-col justify-between py-0.5 text-[9px] text-[#64748B] font-mono pr-1 select-none">
            {dayLabels.map((lbl, idx) => (
              <span key={idx} className="h-3.5 leading-3.5">
                {lbl}
              </span>
            ))}
          </div>

          {grid.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((day) => {
                if (day.isFuture) {
                  return (
                    <div
                      key={day.dateStr}
                      className="w-3.5 h-3.5 rounded-sm border border-transparent opacity-0 pointer-events-none"
                    />
                  );
                }
                const isSelected = activeDate === day.dateStr;
                const status = day.statusInfo.status;

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
                    onClick={() => {
                      const nextDate = activeDate === day.dateStr ? null : day.dateStr;
                      setActiveDate(nextDate);
                      if (onSelectDate) onSelectDate(day.dateStr, day.activities);
                    }}
                    title={`${day.dateStr}${day.isToday ? ' (Today)' : ''} · ${day.statusInfo.label} · ${day.statusInfo.description}`}
                    className={`w-3.5 h-3.5 rounded-sm transition-all ${cellClass} ${
                      isSelected
                        ? 'ring-2 ring-[#388BFD] ring-offset-1 ring-offset-[#090D12] scale-110 z-10'
                        : day.isToday
                        ? 'ring-1 ring-[#388BFD]'
                        : ''
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend & Selected Day Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#1E293B] text-xs text-[#8B949E]">
        <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
          <span className="text-[#64748B]">Activity intensity:</span>
          <span className="text-[#64748B] text-[10px]">Less</span>
          <span className="w-3 h-3 rounded-sm bg-[#0D3868] border border-[#1B4B82]" title="Level 1" />
          <span className="w-3 h-3 rounded-sm bg-[#1A5699] border border-[#236EC2]" title="Level 2" />
          <span className="w-3 h-3 rounded-sm bg-[#2875D0] border border-[#368AE6]" title="Level 3" />
          <span className="w-3 h-3 rounded-sm bg-[#58A6FF] border border-[#79B8FF]" title="Level 4" />
          <span className="text-[#64748B] text-[10px]">More</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#161B22] border border-[#21262D]" />
            <span className="text-[#8B949E]">Empty day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#090D12] border border-dashed border-[#30363D]" />
            <span className="text-[#64748B]">Missing data</span>
          </div>
        </div>
      </div>

      {/* Selected Day Timeline & Photos Drawer */}
      <AnimatePresence>
        {showDayDetails && activeDate && selectedDayStatus && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-md p-3.5 bg-[#0D1117] border border-[#1E293B] space-y-2.5 mt-2"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[#F0F6FC]">
                  Records for {new Date(activeDate + 'T00:00:00Z').toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-[10px] font-mono text-[#388BFD]">
                  ({selectedDayStatus.label})
                </span>
              </div>
              <button
                onClick={() => setActiveDate(null)}
                className="text-xs text-[#64748B] hover:text-[#F0F6FC]"
              >
                Close
              </button>
            </div>

            {selectedDayStatus.status === 'missing' && (
              <div className="p-3 rounded-md bg-[#111827]/70 border border-dashed border-[#30363D] text-xs space-y-2">
                <p className="text-[#8B949E]">
                  <strong>Missing Data</strong> — No archive data was recorded for this day (prior to tracking start or unrecorded period).
                </p>
                <button
                  onClick={() => handleOpenCaptureForDate(activeDate)}
                  className="inline-flex btn-primary text-xs py-1 px-2.5 gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Backfill Activity</span>
                </button>
              </div>
            )}

            {selectedDayStatus.status === 'empty' && (
              <div className="p-3 rounded-md bg-[#111827]/70 border border-[#1E293B] text-xs space-y-2">
                <p className="text-[#8B949E]">
                  <strong>Empty Day</strong> — You were tracking during this period, but logged 0 activities (rest day).
                </p>
                <button
                  onClick={() => handleOpenCaptureForDate(activeDate)}
                  className="inline-flex btn-primary text-xs py-1 px-2.5 gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Record Activity</span>
                </button>
              </div>
            )}

            {selectedDayStatus.status === 'active' && (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedDayActivities.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => onSelectActivity && onSelectActivity(act)}
                    className="p-2.5 rounded-md bg-[#111827] border border-[#1E293B] hover:border-[#388BFD]/40 transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-[11px] font-mono text-[#64748B] shrink-0">
                        {act.startedAt.split('T')[1]?.slice(0, 5) || '—'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-[#F0F6FC] truncate group-hover:text-[#388BFD] transition-colors">
                          {act.title}
                        </div>
                        {act.description && (
                          <div className="text-[11px] text-[#8B949E] truncate">
                            {act.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {act.attachments && act.attachments.length > 0 && (
                        <span className="text-[10px] font-mono text-[#388BFD] bg-[#161F2E] px-1.5 py-0.5 rounded border border-[#232E3E]">
                          {act.attachments.length} {act.attachments.length === 1 ? 'photo' : 'photos'}
                        </span>
                      )}
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#161F2E] text-[#8B949E] border border-[#1E293B]">
                        {act.categoryId}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#F0F6FC]" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
