'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  BookOpen,
  FolderGit2,
  Hourglass,
  CheckCircle2,
  Circle,
  Plus,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Activity as ActivityIcon,
  Play,
  RotateCw,
} from 'lucide-react';
import ContributionHeatmap from '../components/ContributionHeatmap';
import { storage } from '../lib/storage';
import { Activity, Habit, HabitCompletion, Countdown, KnowledgeDocument } from '../lib/types';

export default function DashboardOverview() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDocument[]>([]);
  const [todayStr, setTodayStr] = useState<string>(() => new Date().toISOString().split('T')[0]);

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

  // Today's activities
  const todayActivities = activities.filter((a) => a.startedAt.startsWith(todayStr));

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

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="text-xs font-mono text-muted uppercase tracking-wider">
            Personal Life Operating System
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
            Your life, recorded.
          </h1>
          <p className="text-xs text-muted mt-1">
            Every habit, lesson, project, and milestone organized in a permanent unified record.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/capture" className="btn-primary text-xs py-2 px-4">
            <Plus className="w-4 h-4" />
            <span>Quick Capture</span>
          </Link>
          <Link href="/timeline" className="btn-secondary text-xs py-2 px-4">
            <span>Open Timeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Core Pillars Metric Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-xs font-mono text-muted flex items-center justify-between">
            <span>First Activity</span>
            <Clock className="w-3.5 h-3.5 text-muted" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-foreground mt-2">
            {todayActivities.length > 0
              ? todayActivities[todayActivities.length - 1]?.startedAt.split('T')[1]?.slice(0, 5)
              : '06:15'}
          </div>
          <div className="text-[11px] text-muted mt-1">
            {todayActivities.length} sessions logged today
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-xs font-mono text-muted flex items-center justify-between">
            <span>Knowledge Vault</span>
            <BookOpen className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-primary mt-2">
            {knowledgeDocs.length} Lessons
          </div>
          <div className="text-[11px] text-muted mt-1">
            AI quizzes & flashcards active
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-xs font-mono text-muted flex items-center justify-between">
            <span>Projects Studio</span>
            <FolderGit2 className="w-3.5 h-3.5 text-success" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-success mt-2">
            2 Repos
          </div>
          <div className="text-[11px] text-muted mt-1">
            GitHub & Vercel connected
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-xs font-mono text-muted flex items-center justify-between">
            <span>Deadlines</span>
            <Hourglass className="w-3.5 h-3.5 text-warning" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-warning mt-2">
            {countdowns.length} Targets
          </div>
          <div className="text-[11px] text-muted mt-1">
            University & competition milestones
          </div>
        </div>
      </div>

      {/* GitHub-Style Contribution Heatmap Calendar */}
      <div>
        <ContributionHeatmap activities={activities} weeksToShow={16} />
      </div>

      {/* Two Column Grid: Today's Routine & Habit Checklist + Recent Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Habits & Countdowns */}
        <div className="space-y-6">
          {/* Habits Card */}
          <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">
                Today&apos;s Daily Routine ({todayStr})
              </h3>
              <Link href="/calendar" className="text-xs text-primary hover:underline font-mono">
                All Habits
              </Link>
            </div>
            <div className="space-y-2">
              {habits.map((habit) => {
                const done = isHabitCompletedToday(habit.id);
                return (
                  <button
                    key={habit.id}
                    onClick={() => handleToggleHabit(habit.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded border text-left transition-colors ${
                      done
                        ? 'bg-elevated border-success/40 text-foreground'
                        : 'bg-surface border-border text-muted hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted/60 shrink-0" />
                      )}
                      <span className={`text-xs font-medium ${done ? 'line-through opacity-80' : ''}`}>
                        {habit.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-muted uppercase">
                      {habit.categoryId}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upcoming Countdowns */}
          <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">
                Critical Deadlines
              </h3>
              <Link href="/countdowns" className="text-xs text-primary hover:underline font-mono">
                View All
              </Link>
            </div>
            <div className="space-y-2.5">
              {nextDeadlines.map((cd) => (
                <div key={cd.id} className="bg-elevated border border-border rounded p-3 text-xs space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-foreground line-clamp-1">{cd.title}</span>
                    <span className="shrink-0 font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-warning">
                      {calculateDaysRemaining(cd.targetDate)}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted line-clamp-2">{cd.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (2 cols): Today's Timeline & Photo Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div>
              <h2 className="font-semibold text-sm text-foreground">Timeline Stream</h2>
              <div className="text-xs text-muted font-mono">Real-time chronologic life log</div>
            </div>
            <Link href="/timeline" className="text-xs text-primary hover:underline font-mono flex items-center gap-1">
              <span>Full Archive</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {todayActivities.length === 0 ? (
              <div className="p-8 text-center bg-surface border border-border rounded-lg text-muted text-xs">
                No activities logged for today yet. Use Quick Capture to record waking up, exercise, or study.
              </div>
            ) : (
              todayActivities.slice(0, 5).map((act) => (
                <div
                  key={act.id}
                  className="bg-surface border border-border rounded-lg p-4 space-y-3 hover:border-primary/40 transition-colors"
                >
                  {/* Activity Top Meta */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-elevated border border-border text-primary font-medium">
                          {act.categoryId}
                        </span>
                        <span className="text-xs font-mono text-muted">
                          {act.startedAt.split('T')[1]?.slice(0, 5)}
                          {act.endedAt ? ` - ${act.endedAt.split('T')[1]?.slice(0, 5)}` : ''}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-foreground mt-1.5">{act.title}</h4>
                    </div>

                    {act.source === 'timer' && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-elevated border border-border text-muted">
                        Timed
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {act.description && (
                    <p className="text-xs text-muted leading-relaxed">{act.description}</p>
                  )}

                  {/* Book Quote if any */}
                  {act.bookQuote && (
                    <div className="bg-elevated border-l-2 border-primary p-3 rounded-r text-xs space-y-1">
                      <div className="italic text-foreground">&quot;{act.bookQuote.quote}&quot;</div>
                      <div className="text-[11px] font-mono text-muted">
                        — {act.bookQuote.author}, {act.bookQuote.bookTitle} (p. {act.bookQuote.pageNumber})
                      </div>
                    </div>
                  )}

                  {/* Photos / Attachments */}
                  {act.attachments && act.attachments.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                      {act.attachments.map((att) => (
                        <div key={att.id} className="relative rounded overflow-hidden border border-border bg-black group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={att.url}
                            alt={att.caption || 'Activity media'}
                            className="w-full h-32 object-cover object-center group-hover:scale-105 transition-transform"
                          />
                          {att.caption && (
                            <div className="absolute bottom-0 inset-x-0 bg-black/80 px-2 py-1 text-[10px] text-foreground truncate">
                              {att.caption}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tags & Linked integrations */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {act.githubRepo && (
                      <span className="text-[11px] font-mono text-muted flex items-center gap-1 bg-elevated px-2 py-0.5 rounded border border-border">
                        <FolderGit2 className="w-3 h-3 text-primary" />
                        {act.githubRepo}
                      </span>
                    )}
                    {act.vercelUrl && (
                      <a
                        href={act.vercelUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-mono text-primary flex items-center gap-1 bg-elevated px-2 py-0.5 rounded border border-border hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Vercel Deployment
                      </a>
                    )}
                    {act.tags.map((t) => (
                      <span key={t} className="text-[10px] font-mono text-muted/80">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
