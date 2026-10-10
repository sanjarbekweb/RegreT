'use client';

import React, { useState, useMemo } from 'react';
import { Activity, CategoryId } from '../lib/types';
import { INITIAL_CATEGORIES } from '../lib/storage';

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

  // Generate grid of weeks ending today
  const { grid, stats } = useMemo(() => {
    const today = new Date();
    const totalDays = weeksToShow * 7;
    const days: { date: Date; dateStr: string; count: number; activities: Activity[] }[] = [];

    // Calculate start date so that today is at the end
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + 1);

    for (let i = 0; i < totalDays; i++) {
      const current = new Date(startDate);
      current.setDate(startDate.getDate() + i);
      const dateStr = current.toISOString().split('T')[0];
      const dayActs = dateMap.get(dateStr) || [];
      days.push({
        date: current,
        dateStr,
        count: dayActs.length,
        activities: dayActs,
      });
    }

    // Split into weeks of 7 days
    const weeks: typeof days[] = [];
    for (let w = 0; w < weeksToShow; w++) {
      weeks.push(days.slice(w * 7, (w + 1) * 7));
    }

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let totalActiveDays = 0;

    for (let i = 0; i < days.length; i++) {
      if (days[i].count > 0) {
        totalActiveDays++;
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    // Check current streak from end backwards
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) {
        currentStreak++;
      } else if (i === days.length - 1) {
        // Today has 0 so far, check yesterday
        continue;
      } else {
        break;
      }
    }

    return {
      grid: weeks,
      stats: {
        currentStreak,
        longestStreak,
        totalActiveDays,
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
          {INITIAL_CATEGORIES.slice(0, 5).map((cat) => (
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
                const isSelected = activeDate === day.dateStr;
                return (
                  <button
                    key={day.dateStr}
                    onClick={() => {
                      setActiveDate(day.dateStr);
                      if (onSelectDate) onSelectDate(day.dateStr, day.activities);
                    }}
                    title={`${day.dateStr}: ${day.count} activities logged`}
                    className={`w-3.5 h-3.5 rounded-sm border transition-all ${getColorClass(
                      day.count
                    )} ${
                      isSelected
                        ? 'ring-2 ring-primary ring-offset-1 ring-offset-background'
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
