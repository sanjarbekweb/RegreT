'use client';

import React, { useState, useMemo } from 'react';
import { Activity, CategoryId } from '../lib/types';
import { INITIAL_CATEGORIES } from '../lib/storage';
import { calculateStreaks } from '../lib/analytics';

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
    if (count === 0) return 'bg-elevated/60 border-border/40';
    if (count === 1) return 'bg-[#1E3A8A] border-[#2563EB]/40';
    if (count === 2) return 'bg-[#2563EB] border-[#3985F6]/50';
    if (count === 3) return 'bg-[#3985F6] border-[#60A5FA]/60 text-white';
    return 'bg-[#36B58A] border-[#36B58A]/80 text-white';
  };

  const dayLabels = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

  const selectedDayActivities = activeDate ? dateMap.get(activeDate) || [] : [];

  return (
    <div className="bg-surface border border-border rounded-lg p-4 md:p-5 space-y-4">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h3 className="font-semibold text-sm text-foreground">Activity & Habit Consistency</h3>
          <div className="text-xs text-muted font-mono">
            {weeksToShow} weeks contribution calendar
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-primary text-white border border-primary'
                : 'bg-elevated text-muted hover:text-foreground border border-border'
            }`}
          >
            All Tracks
          </button>
          {INITIAL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-primary text-white border border-primary'
                  : 'bg-elevated text-muted hover:text-foreground border border-border'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Quick Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-elevated border border-border rounded p-2.5">
          <div className="text-[11px] text-muted font-mono">Current Streak</div>
          <div className="text-lg font-bold text-success font-mono">{stats.currentStreak} Days</div>
        </div>
        <div className="bg-elevated border border-border rounded p-2.5">
          <div className="text-[11px] text-muted font-mono">Longest Streak</div>
          <div className="text-lg font-bold text-foreground font-mono">{stats.longestStreak} Days</div>
        </div>
        <div className="bg-elevated border border-border rounded p-2.5">
          <div className="text-[11px] text-muted font-mono">Active Days</div>
          <div className="text-lg font-bold text-primary font-mono">{stats.totalActiveDays}</div>
        </div>
        <div className="bg-elevated border border-border rounded p-2.5">
          <div className="text-[11px] text-muted font-mono">Total Activities</div>
          <div className="text-lg font-bold text-foreground font-mono">{stats.totalLogged}</div>
        </div>
      </div>

      {/* GitHub Calendar Grid */}
      <div className="overflow-x-auto pt-2 pb-1">
        <div className="inline-flex gap-1.5 min-w-max">
          <div className="flex flex-col justify-between py-1 text-[10px] text-muted/60 font-mono pr-1 select-none">
            {dayLabels.map((lbl, idx) => (
              <span key={idx} className="h-3 leading-3">
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
                return (
                  <button
                    key={day.dateStr}
                    onClick={() => {
                      setActiveDate(day.dateStr);
                      if (onSelectDate) onSelectDate(day.dateStr, day.activities);
                    }}
                    title={`${day.dateStr}${day.isToday ? ' (Today)' : ''}: ${day.count} activities logged`}
                    className={`w-3.5 h-3.5 rounded-sm border transition-all ${getColorClass(
                      day.count
                    )} ${
                      isSelected
                        ? 'ring-2 ring-primary ring-offset-1 ring-offset-background'
                        : day.isToday
                        ? 'ring-1 ring-primary/60'
                        : 'hover:opacity-80'
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend & Selected Day Inspector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border text-xs text-muted font-mono">
        <div className="flex items-center gap-2">
          <span>Less</span>
          <span className="w-3 h-3 rounded-sm bg-elevated/60 border border-border/40 inline-block" />
          <span className="w-3 h-3 rounded-sm bg-[#1E3A8A] border border-[#2563EB]/40 inline-block" />
          <span className="w-3 h-3 rounded-sm bg-[#2563EB] border border-[#3985F6]/50 inline-block" />
          <span className="w-3 h-3 rounded-sm bg-[#3985F6] border border-[#60A5FA]/60 inline-block" />
          <span className="w-3 h-3 rounded-sm bg-[#36B58A] border border-[#36B58A]/80 inline-block" />
          <span>More</span>
        </div>

        {activeDate && (
          <div className="text-foreground">
            Selected: <span className="font-semibold text-primary">{activeDate}</span> (
            {selectedDayActivities.length} activities)
          </div>
        )}
      </div>

      {/* Day Details Drawer when clicked */}
      {activeDate && selectedDayActivities.length > 0 && (
        <div className="bg-elevated border border-border rounded p-3 space-y-2 mt-2">
          <div className="text-xs font-semibold text-foreground font-mono">
            Activities on {activeDate}:
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {selectedDayActivities.map((act) => (
              <div
                key={act.id}
                className="bg-surface border border-border/80 rounded px-2.5 py-1.5 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-medium text-foreground">{act.title}</span>
                  <span className="text-muted text-[11px] ml-2">
                    {act.startedAt.split('T')[1]?.slice(0, 5)}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-elevated text-primary border border-border">
                  {act.categoryId}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
