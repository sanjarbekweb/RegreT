'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  BookOpen,
  FolderGit2,
  Hourglass,
  Plus,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Activity as ActivityIcon,
  Flame,
  Check,
  X,
  Image as ImageIcon,
  Quote,
} from 'lucide-react';
import ContributionHeatmap from '../components/ContributionHeatmap';
import AnimatedCounter from '../components/AnimatedCounter';
import { storage } from '../lib/storage';
import { Activity, Habit, HabitCompletion, Countdown, KnowledgeDocument, Attachment } from '../lib/types';

export default function DashboardOverview() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDocument[]>([]);
  const [todayStr, setTodayStr] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const loadData = () => {
    setActivities(storage.getActivities());
    setHabits(storage.getHabits());
    setCompletions(storage.getHabitCompletions());
    setCountdowns(storage.getCountdowns());
    setKnowledgeDocs(storage.getKnowledgeDocs());
    setTodayStr(new Date().toISOString().split('T')[0]);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('regret_data_updated', handleUpdate);
    return () => window.removeEventListener('regret_data_updated', handleUpdate);
  }, []);

  // Today's activities sorted chronologically descending
  const todayActivities = useMemo(() => {
    return activities
      .filter((a) => a.startedAt.startsWith(todayStr))
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }, [activities, todayStr]);

  // Recent activities (last 7 recorded if today is sparse)
  const recentActivities = useMemo(() => {
    return [...activities]
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, 8);
  }, [activities]);

  // Calculate total focus time today
  const todayTotalDurationMinutes = useMemo(() => {
    let totalMin = 0;
    todayActivities.forEach((act) => {
      if (act.endedAt) {
        const diff = (new Date(act.endedAt).getTime() - new Date(act.startedAt).getTime()) / (1000 * 60);
        if (diff > 0) totalMin += diff;
      } else {
        totalMin += 30; // default estimated duration if ongoing/point in time
      }
    });
    return Math.round(totalMin);
  }, [todayActivities]);

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const calculateActivityDuration = (act: Activity) => {
    if (!act.endedAt) return '30m';
    const diff = (new Date(act.endedAt).getTime() - new Date(act.startedAt).getTime()) / (1000 * 60);
    return formatDuration(Math.max(1, Math.round(diff)));
  };

  // Toggle habit completion
  const handleToggleHabit = (habitId: string) => {
    storage.toggleHabitCompletion(habitId, todayStr);
    setCompletions(storage.getHabitCompletions());
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('regret_data_updated'));
    }
  };

  const isHabitCompletedToday = (habitId: string) => {
    return completions.some((c) => c.habitId === habitId && c.completedOn === todayStr);
  };

  // Urgent countdowns
  const nextDeadlines = [...countdowns]
    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
    .slice(0, 3);

  const calculateDaysRemaining = (targetDate: string) => {
    const diff = new Date(targetDate).getTime() - new Date(todayStr).getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days}d left` : 'Due today';
  };

  const completedHabitsCount = habits.filter((h) => isHabitCompletedToday(h.id)).length;

  const formattedToday = new Date(todayStr + 'T00:00:00Z').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="space-y-6">
      {/* Top Header: Concept preview match from prompt */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[#8B949E]">
            <span className="text-[#388BFD] font-semibold">Personal OS</span>
            <span className="text-[#484F58]">·</span>
            <span>Private life archive</span>
            <span className="text-[#484F58]">·</span>
            <span>Dark workspace</span>
          </div>

          <div className="mt-1 flex items-baseline gap-3">
            <h1 className="text-2xl sm:text-3xl font-sans font-semibold tracking-tight text-[#F0F6FC]">
              {formattedToday}
            </h1>
          </div>

          <p className="text-xs text-[#8B949E] mt-1">
            {todayActivities.length} {todayActivities.length === 1 ? 'activity' : 'activities'} recorded today
            {todayTotalDurationMinutes > 0 && ` · ${formatDuration(todayTotalDurationMinutes)} total time`}
          </p>
        </div>

        <div className="flex items-center gap-2">
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
          <Link href="/timeline" className="btn-secondary text-xs py-1.5 px-3">
            <span>Life Timeline</span>
            <ArrowRight className="w-3 h-3 text-[#8B949E]" />
          </Link>
        </div>
      </div>

      {/* Summary Metrics Row (Linear-style restrained panels) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="workspace-panel p-3.5 bg-[#111827] border border-[#1E293B]">
          <div className="flex items-center justify-between text-[#8B949E]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Time Spent Today</span>
            <Clock className="w-3.5 h-3.5 text-[#388BFD]" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-semibold text-[#F0F6FC] mt-1.5">
            {formatDuration(todayTotalDurationMinutes)}
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">
            {todayActivities.length} recorded blocks
          </div>
        </div>

        <div className="workspace-panel p-3.5 bg-[#111827] border border-[#1E293B]">
          <div className="flex items-center justify-between text-[#8B949E]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Habit Consistency</span>
            <Check className="w-3.5 h-3.5 text-[#238636]" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-semibold text-[#F0F6FC] mt-1.5">
            {completedHabitsCount}/{habits.length} Done
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">
            {habits.length > 0 ? Math.round((completedHabitsCount / habits.length) * 100) : 0}% daily completion
          </div>
        </div>

        <div className="workspace-panel p-3.5 bg-[#111827] border border-[#1E293B]">
          <div className="flex items-center justify-between text-[#8B949E]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Knowledge Vault</span>
            <BookOpen className="w-3.5 h-3.5 text-[#8B949E]" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-semibold text-[#F0F6FC] mt-1.5">
            <AnimatedCounter value={knowledgeDocs.length} suffix=" Notes" />
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">
            AI quizzes & flashcards active
          </div>
        </div>

        <div className="workspace-panel p-3.5 bg-[#111827] border border-[#1E293B]">
          <div className="flex items-center justify-between text-[#8B949E]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Projects Active</span>
            <FolderGit2 className="w-3.5 h-3.5 text-[#8B949E]" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-semibold text-[#F0F6FC] mt-1.5">
            2 Repos
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">
            GitHub repo sync active
          </div>
        </div>
      </div>

      {/* GitHub-style Compact Contribution Heatmap */}
      <div>
        <ContributionHeatmap
          activities={activities}
          weeksToShow={16}
          onSelectActivity={(act) => setSelectedActivity(act)}
        />
      </div>

      {/* Main Content: What have I been doing? + Habits Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Chronological Activity Stream answering: What have I been doing? */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#F0F6FC]">
                {todayActivities.length > 0 ? "Today's Activities" : "Recent Activities"}
              </span>
              <span className="text-[10px] font-mono text-[#64748B]">
                ({todayActivities.length > 0 ? todayActivities.length : recentActivities.length})
              </span>
            </div>
            <Link href="/timeline" className="text-xs text-[#388BFD] hover:underline flex items-center gap-1">
              <span>View full timeline</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="workspace-panel divide-y divide-[#1E293B] bg-[#111827] border border-[#1E293B] overflow-hidden">
            {(todayActivities.length > 0 ? todayActivities : recentActivities).map((act) => {
              const timeDisplay = act.startedAt.split('T')[1]?.slice(0, 5) || '12:00';
              const duration = calculateActivityDuration(act);
              const hasPhotos = act.attachments && act.attachments.length > 0;

              return (
                <div
                  key={act.id}
                  onClick={() => setSelectedActivity(act)}
                  className="p-3.5 hover:bg-[#161F2E]/60 transition-colors cursor-pointer group flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="pt-0.5 text-right shrink-0">
                      <div className="text-xs font-mono font-medium text-[#F0F6FC]">
                        {timeDisplay}
                      </div>
                      <div className="text-[10px] font-mono text-[#64748B]">
                        {duration}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#F0F6FC] group-hover:text-[#388BFD] transition-colors truncate">
                          {act.title}
                        </span>
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#161F2E] text-[#8B949E] border border-[#1E293B] shrink-0">
                          {act.categoryId}
                        </span>
                      </div>

                      {act.description && (
                        <p className="text-[11px] text-[#8B949E] mt-1 line-clamp-1">
                          {act.description}
                        </p>
                      )}

                      {/* Photo preview pill */}
                      {hasPhotos && (
                        <div className="flex items-center gap-1.5 mt-2">
                          {act.attachments.slice(0, 2).map((att) => (
                            <div
                              key={att.id}
                              className="w-10 h-10 rounded border border-[#1E293B] overflow-hidden bg-black shrink-0"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={att.url}
                                alt={att.caption || 'Thumbnail'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {act.attachments.length > 2 && (
                            <span className="text-[10px] font-mono text-[#64748B]">
                              +{act.attachments.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-[#484F58] group-hover:text-[#F0F6FC] shrink-0 self-center" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Routine Habits Checklist & Upcoming Deadlines */}
        <div className="space-y-4">
          {/* Habits Checklist */}
          <div className="workspace-panel p-4 space-y-3 bg-[#111827] border border-[#1E293B]">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
              <div className="text-xs font-semibold text-[#F0F6FC]">
                Today&apos;s Routine
              </div>
              <Link href="/calendar" className="text-[11px] text-[#388BFD] hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-1.5">
              {habits.map((habit) => {
                const done = isHabitCompletedToday(habit.id);
                return (
                  <button
                    key={habit.id}
                    onClick={() => handleToggleHabit(habit.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-md border text-left text-xs transition-colors ${
                      done
                        ? 'bg-[#161F2E]/40 border-[#1E293B] text-[#8B949E]'
                        : 'bg-[#0D1117] border-[#1E293B] text-[#F0F6FC] hover:border-[#334155]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center transition-colors shrink-0 ${
                          done
                            ? 'bg-[#238636] text-white'
                            : 'border border-[#334155]'
                        }`}
                      >
                        {done && <Check className="w-3 h-3 stroke-[2.5]" />}
                      </div>
                      <span className={`truncate ${done ? 'line-through text-[#64748B]' : ''}`}>
                        {habit.name}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-[#64748B] uppercase shrink-0">
                      {habit.categoryId}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="workspace-panel p-4 space-y-3 bg-[#111827] border border-[#1E293B]">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
              <div className="text-xs font-semibold text-[#F0F6FC]">
                Critical Deadlines
              </div>
              <Link href="/countdowns" className="text-[11px] text-[#388BFD] hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-2">
              {nextDeadlines.map((cd) => (
                <div
                  key={cd.id}
                  className="p-2.5 rounded-md bg-[#0D1117] border border-[#1E293B] text-xs flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-medium text-[#F0F6FC] truncate">
                      {cd.title}
                    </div>
                    <div className="text-[10px] text-[#64748B] font-mono mt-0.5">
                      {cd.targetDate.replace('T', ' ')}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#F85149] px-1.5 py-0.5 rounded bg-[#F85149]/10 border border-[#F85149]/20 shrink-0">
                    {calculateDaysRemaining(cd.targetDate)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Complete Activity Record Modal (Prompt Specification) */}
      <AnimatePresence>
        {selectedActivity && (
          <div className="fixed inset-0 z-50 bg-[#090D12]/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="workspace-panel max-w-lg w-full max-h-[85vh] overflow-y-auto p-5 space-y-4 bg-[#111827] border border-[#1E293B]"
            >
              <div className="flex items-start justify-between border-b border-[#1E293B] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#161F2E] text-[#388BFD] border border-[#232E3E]">
                      {selectedActivity.categoryId}
                    </span>
                    <span className="text-xs font-mono text-[#8B949E]">
                      {selectedActivity.startedAt.replace('T', ' ').slice(0, 16)}
                    </span>
                  </div>
                  <h2 className="text-base font-semibold text-[#F0F6FC] mt-1">
                    {selectedActivity.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="text-[#64748B] hover:text-[#F0F6FC] p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedActivity.description && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider">
                    Notes & Record
                  </div>
                  <p className="text-xs text-[#8B949E] leading-relaxed whitespace-pre-wrap">
                    {selectedActivity.description}
                  </p>
                </div>
              )}

              {/* Book quote if reading */}
              {selectedActivity.bookQuote && (
                <div className="p-3 rounded-md bg-[#0D1117] border border-[#1E293B] text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[#388BFD]">
                    <Quote className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono uppercase">Book Quotation</span>
                  </div>
                  <blockquote className="italic text-[#F0F6FC]">
                    &quot;{selectedActivity.bookQuote.quote}&quot;
                  </blockquote>
                  <div className="text-[10px] text-[#64748B]">
                    — {selectedActivity.bookQuote.author}, {selectedActivity.bookQuote.bookTitle}
                  </div>
                </div>
              )}

              {/* Photos Gallery */}
              {selectedActivity.attachments && selectedActivity.attachments.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider">
                    Attached Photos ({selectedActivity.attachments.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedActivity.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="rounded-md border border-[#1E293B] overflow-hidden bg-black space-y-1"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={att.url}
                          alt={att.caption || 'Attachment'}
                          className="w-full h-40 object-cover"
                        />
                        {att.caption && (
                          <div className="px-2 py-1 text-[10px] text-[#8B949E] bg-[#0D1117] border-t border-[#1E293B]">
                            {att.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedActivity.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2 border-t border-[#1E293B]">
                  {selectedActivity.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-mono text-[#64748B] bg-[#0D1117] px-2 py-0.5 rounded border border-[#1E293B]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  Close Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
