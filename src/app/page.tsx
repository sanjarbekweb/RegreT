'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
  Flame,
  Check,
  Zap,
} from 'lucide-react';
import ContributionHeatmap from '../components/ContributionHeatmap';
import AnimatedCounter from '../components/AnimatedCounter';
import GsapReveal from '../components/GsapReveal';
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

  const completedHabitsCount = habits.filter((h) => isHabitCompletedToday(h.id)).length;
  const habitCompletionRate = habits.length > 0 ? Math.round((completedHabitsCount / habits.length) * 100) : 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Hero Banner & Greeting (Image 1 & 2 Style) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 pb-2 border-b border-slate-200/80 dark:border-white/[0.08]"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/20 text-slate-900 dark:text-lime text-xs font-display font-bold uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 dark:bg-lime" />
            Personal Life Operating System
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-slate-900 dark:text-white">
            Your life, recorded.
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl font-sans">
            Every habit, lesson, project, and milestone organized in a permanent unified record with zero data leakage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/capture" className="btn-primary text-xs py-2.5 px-5">
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Quick Capture</span>
          </Link>
          <Link href="/timeline" className="btn-secondary text-xs py-2.5 px-5">
            <span>Open Timeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.div>

      {/* 4 Core Pillars Bento Metric Cards (Image 1 & 2 & 4 Bento Style) */}
      <GsapReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5" stagger={0.08} duration={0.6}>
        {/* Metric 1 - Soft Lavender Tint */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="rounded-[26px] p-5 bg-[#F4EFFF] dark:bg-[#201738] border border-[#E9D5FF] dark:border-purple-800/40 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-purple-900 dark:text-purple-300">
            <span className="text-xs font-display font-bold uppercase tracking-wider">First Activity</span>
            <div className="w-8 h-8 rounded-full bg-purple-200/60 dark:bg-purple-800/40 flex items-center justify-center">
              <Clock className="w-4 h-4 text-purple-700 dark:text-purple-300" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-display font-black text-purple-950 dark:text-purple-100">
              {todayActivities.length > 0
                ? todayActivities[todayActivities.length - 1]?.startedAt.split('T')[1]?.slice(0, 5)
                : '06:15'}
            </div>
            <div className="text-xs font-medium text-purple-800/80 dark:text-purple-400 mt-1">
              {todayActivities.length} sessions logged today
            </div>
          </div>
        </motion.div>

        {/* Metric 2 - Soft Mint Tint */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="rounded-[26px] p-5 bg-[#EAFBF3] dark:bg-[#0E281F] border border-[#BBF7D0] dark:border-emerald-800/40 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-emerald-900 dark:text-emerald-300">
            <span className="text-xs font-display font-bold uppercase tracking-wider">Knowledge Vault</span>
            <div className="w-8 h-8 rounded-full bg-emerald-200/60 dark:bg-emerald-800/40 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-display font-black text-emerald-950 dark:text-emerald-100">
              <AnimatedCounter value={knowledgeDocs.length} suffix=" Lessons" />
            </div>
            <div className="text-xs font-medium text-emerald-800/80 dark:text-emerald-400 mt-1">
              AI quizzes & flashcards active
            </div>
          </div>
        </motion.div>

        {/* Metric 3 - Soft Coral Tint */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="rounded-[26px] p-5 bg-[#FFF2ED] dark:bg-[#2C1914] border border-[#FED7AA] dark:border-orange-800/40 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-orange-900 dark:text-orange-300">
            <span className="text-xs font-display font-bold uppercase tracking-wider">Project Studio</span>
            <div className="w-8 h-8 rounded-full bg-orange-200/60 dark:bg-orange-800/40 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4 text-orange-700 dark:text-orange-300" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-display font-black text-orange-950 dark:text-orange-100">
              2 Repos
            </div>
            <div className="text-xs font-medium text-orange-800/80 dark:text-orange-400 mt-1">
              GitHub & Vercel connected
            </div>
          </div>
        </motion.div>

        {/* Metric 4 - Royal Iris Hero Card with Electric Lime Pill Button (Image 1 & 2 CTA Block) */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="rounded-[26px] p-5 bg-iris text-white shadow-[0_8px_24px_rgba(94,67,243,0.35)] flex flex-col justify-between relative overflow-hidden group"
        >
          {/* Subtle gradient pattern */}
          <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <span className="text-xs font-display font-bold uppercase tracking-wider text-white/90">
              Habits Engine
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold tracking-wide">
              {habitCompletionRate}%
            </span>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-display font-black text-white">
              {completedHabitsCount}/{habits.length} Done
            </div>
            <p className="text-[11px] text-white/80 mt-1 line-clamp-1">
              Maintain your daily peak momentum.
            </p>
          </div>

          <div className="mt-3 pt-2">
            <Link
              href="/calendar"
              className="w-full bg-lime hover:bg-lime-hover text-slate-950 font-display font-bold text-xs py-2 px-3.5 rounded-full inline-flex items-center justify-center gap-1.5 shadow-md transition-all group-hover:scale-[1.02]"
            >
              <span>Track Today</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </GsapReveal>

      {/* GitHub-Style Contribution Heatmap Calendar */}
      <div>
        <ContributionHeatmap activities={activities} weeksToShow={16} />
      </div>

      {/* Two Column Bento Grid: Routine Checklist & Recent Timeline Stream */}
      <GsapReveal className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-7" delay={0.12}>
        {/* Left Column: Habits & Countdowns */}
        <div className="space-y-6">
          {/* Habits Card */}
          <div className="bento-card p-5 sm:p-6 space-y-4 bg-white dark:bg-[#131A29]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
              <div>
                <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  Today&apos;s Routine
                </h3>
                <div className="text-[11px] text-slate-400 font-mono">{todayStr}</div>
              </div>
              <Link href="/calendar" className="text-xs text-iris font-display font-bold hover:underline">
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
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                      done
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-slate-900 dark:text-white'
                        : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.06] text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                          done ? 'bg-mint text-slate-950' : 'border-2 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className={`text-xs font-display font-bold ${done ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                        {habit.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-display font-semibold uppercase px-2 py-0.5 rounded-full bg-white dark:bg-white/[0.08] text-slate-500">
                      {habit.categoryId}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upcoming Countdowns (Image 4 Virage.ai Style) */}
          <div className="bento-card p-5 sm:p-6 space-y-4 bg-white dark:bg-[#131A29]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
              <div>
                <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  Critical Deadlines
                </h3>
                <div className="text-[11px] text-slate-400">Milestones & timers</div>
              </div>
              <Link href="/countdowns" className="text-xs text-iris font-display font-bold hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {nextDeadlines.map((cd) => (
                <div
                  key={cd.id}
                  className="rounded-2xl p-3.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-display font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                      {cd.title}
                    </span>
                    <span className="shrink-0 font-display font-bold text-[10px] px-2.5 py-0.5 rounded-full bg-coral/15 text-coral-dark dark:text-coral border border-coral/30">
                      {calculateDaysRemaining(cd.targetDate)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {cd.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Real-time Timeline Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bento-card p-5 sm:p-6 space-y-4 bg-white dark:bg-[#131A29]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
              <div>
                <h2 className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                  Timeline Stream
                </h2>
                <div className="text-xs text-slate-400 font-mono">Real-time chronologic life log</div>
              </div>
              <Link
                href="/timeline"
                className="text-xs text-iris font-display font-bold hover:underline flex items-center gap-1"
              >
                <span>Full Archive</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {todayActivities.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/[0.08] text-slate-500 text-xs">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-display font-bold text-slate-700 dark:text-slate-300">
                    No activities logged for today yet.
                  </p>
                  <p className="mt-1">
                    Use Quick Capture to record waking up, exercise, or study.
                  </p>
                </div>
              ) : (
                todayActivities.slice(0, 5).map((act) => (
                  <motion.div
                    key={act.id}
                    whileHover={{ y: -2 }}
                    className="rounded-2xl p-4 bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] space-y-2.5 transition-all hover:border-slate-300 dark:hover:border-white/[0.12]"
                  >
                    {/* Activity Top Meta */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-display font-bold px-2.5 py-0.5 rounded-full bg-lime text-slate-950">
                            {act.categoryId}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {act.startedAt.split('T')[1]?.slice(0, 5)}
                            {act.endedAt ? ` - ${act.endedAt.split('T')[1]?.slice(0, 5)}` : ''}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white mt-1.5">
                          {act.title}
                        </h4>
                      </div>

                      {act.source === 'timer' && (
                        <span className="text-[10px] font-display font-semibold px-2 py-0.5 rounded-full bg-iris/10 text-iris border border-iris/20">
                          Timed
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {act.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                        {act.description}
                      </p>
                    )}

                    {/* Book Quote if any */}
                    {act.bookQuote && (
                      <div className="bg-purple-50 dark:bg-purple-950/20 border-l-4 border-iris p-3 rounded-r-xl text-xs space-y-1">
                        <div className="italic text-purple-950 dark:text-purple-200 font-serif">
                          &quot;{act.bookQuote.quote}&quot;
                        </div>
                        <div className="text-[11px] text-purple-700 dark:text-purple-400 font-sans font-medium">
                          — {act.bookQuote.author}, {act.bookQuote.bookTitle} (p. {act.bookQuote.pageNumber})
                        </div>
                      </div>
                    )}

                    {/* Photos / Attachments */}
                    {act.attachments && act.attachments.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                        {act.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/[0.08] bg-black group"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={att.url}
                              alt={att.caption || 'Activity media'}
                              className="w-full h-32 object-cover object-center group-hover:scale-105 transition-transform duration-300"
                            />
                            {att.caption && (
                              <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 px-2.5 py-1 text-[10px] text-white truncate">
                                {att.caption}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tags & Integrations */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {act.githubRepo && (
                        <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1 bg-white dark:bg-white/[0.06] px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-white/[0.08]">
                          <FolderGit2 className="w-3 h-3 text-iris" />
                          {act.githubRepo}
                        </span>
                      )}
                      {act.vercelUrl && (
                        <a
                          href={act.vercelUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-mono text-iris flex items-center gap-1 bg-white dark:bg-white/[0.06] px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-white/[0.08] hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Vercel
                        </a>
                      )}
                      {act.tags.map((t) => (
                        <span key={t} className="text-[10px] font-mono text-slate-400">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </GsapReveal>
    </div>
  );
}
