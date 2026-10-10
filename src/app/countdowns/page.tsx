'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hourglass,
  Plus,
  ExternalLink,
  CheckCircle2,
  Circle,
  Calendar,
  AlertTriangle,
  Clock,
  Trash2,
  Check,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { Countdown } from '../../lib/types';

export default function CountdownsPage() {
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [now, setNow] = useState<Date>(new Date());

  // Add countdown form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState<'university' | 'exam' | 'competition' | 'project' | 'personal'>('university');
  const [priority, setPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('high');
  const [description, setDescription] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [checklistItems, setChecklistItems] = useState<string>('');

  const loadData = () => {
    setCountdowns(storage.getCountdowns());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('regret_data_updated', handleUpdate);
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => {
      window.removeEventListener('regret_data_updated', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleDeleteCountdown = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Permanently remove this deadline countdown?')) {
      storage.deleteCountdown(id);
      loadData();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('regret_data_updated'));
      }
    }
  };

  const handleToggleChecklist = (countdownId: string, checklistId: string) => {
    storage.toggleCountdownChecklist(countdownId, checklistId);
    loadData();
  };

  const handleCreateCountdown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetDate) return;

    const checklist = checklistItems
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .map((text, idx) => ({
        id: `c-${Date.now()}-${idx}`,
        text,
        done: false,
      }));

    const newCd: Countdown = {
      id: `cd-${Date.now()}`,
      title: title.trim(),
      targetDate,
      category,
      priority,
      description: description.trim() || undefined,
      targetUrl: targetUrl.trim() || undefined,
      checklist: checklist.length > 0 ? checklist : undefined,
      createdAt: new Date().toISOString(),
    };

    storage.addCountdown(newCd);
    loadData();
    setShowAddModal(false);
    setTitle('');
    setTargetDate('');
    setDescription('');
    setTargetUrl('');
    setChecklistItems('');
  };

  const calculateTimeBreakdown = (targetStr: string) => {
    const diff = new Date(targetStr).getTime() - now.getTime();
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds, isPast: false };
  };

  const sortedCountdowns = [...countdowns].sort(
    (a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
  );

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <div className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Critical Deadlines & Timelines
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Countdowns & Milestones
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl font-sans">
            Real-time countdown clocks for university applications, exams, competitions, and project releases.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-xs py-2.5 px-5 self-start sm:self-auto gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Deadline</span>
        </button>
      </div>

      {/* Countdown Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sortedCountdowns.map((cd) => {
          const time = calculateTimeBreakdown(cd.targetDate);
          return (
            <motion.div
              key={cd.id}
              whileHover={{ y: -3 }}
              className="bento-card p-6 space-y-4 bg-white dark:bg-[#131A29] flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                {/* Meta Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-display font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.08] text-slate-800 dark:text-slate-200 uppercase">
                        {cd.category}
                      </span>
                      <span
                        className={`text-[10px] font-display font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          cd.priority === 'urgent'
                            ? 'bg-coral/15 text-coral-dark dark:text-coral border border-coral/30'
                            : cd.priority === 'high'
                            ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {cd.priority}
                      </span>
                    </div>
                    <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white mt-2">
                      {cd.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {cd.targetUrl && (
                      <a
                        href={cd.targetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-500 hover:text-iris transition-colors"
                        title="Open portal"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCountdown(cd.id, e)}
                      className="p-2 rounded-full text-slate-400 hover:text-coral hover:bg-coral/10 transition-colors"
                      title="Delete Deadline"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Live Countdown Clock Ticker (Image 4 Virage.ai Bento Ticker Style) */}
                <div className="grid grid-cols-4 gap-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] rounded-2xl p-3.5 text-center">
                  <div className="p-1">
                    <div className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white">
                      {time.days}
                    </div>
                    <div className="text-[10px] font-display font-bold text-slate-400 uppercase mt-0.5">Days</div>
                  </div>
                  <div className="p-1">
                    <div className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white">
                      {time.hours}
                    </div>
                    <div className="text-[10px] font-display font-bold text-slate-400 uppercase mt-0.5">Hours</div>
                  </div>
                  <div className="p-1">
                    <div className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white">
                      {time.minutes}
                    </div>
                    <div className="text-[10px] font-display font-bold text-slate-400 uppercase mt-0.5">Mins</div>
                  </div>
                  <div className="p-1">
                    <div className="text-2xl sm:text-3xl font-display font-black text-iris dark:text-lime">
                      {time.seconds}
                    </div>
                    <div className="text-[10px] font-display font-bold text-slate-400 uppercase mt-0.5">Secs</div>
                  </div>
                </div>

                {cd.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">{cd.description}</p>
                )}

                {/* Requirements Checklist */}
                {cd.checklist && cd.checklist.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-display font-bold text-slate-400 uppercase tracking-wider">
                      Action Checklist:
                    </div>
                    <div className="space-y-1.5">
                      {cd.checklist.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleToggleChecklist(cd.id, item.id)}
                          className="w-full text-left flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] text-xs transition-colors hover:border-slate-300"
                        >
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                              item.done ? 'bg-mint text-slate-950' : 'border border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {item.done && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span
                            className={`flex-1 font-sans ${
                              item.done ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200 font-medium'
                            }`}
                          >
                            {item.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Stamp */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-display">
                <span className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Target: {cd.targetDate.replace('T', ' ')}
                </span>
                <span className={time.isPast ? 'text-coral font-bold' : 'text-emerald-600 dark:text-mint font-bold'}>
                  {time.isPast ? 'Deadline Passed' : 'Active'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Countdown Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bento-card max-w-lg w-full p-6 space-y-4 bg-white dark:bg-[#131A29]"
            >
              <form onSubmit={handleCreateCountdown}>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
                  <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                    Add New Target Deadline
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3.5 pt-3">
                  <div>
                    <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Oxford MSc Computer Science Application"
                      className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Target Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
                      >
                        <option value="university">University Application</option>
                        <option value="exam">Exam / Certification</option>
                        <option value="competition">Competition / Hackathon</option>
                        <option value="project">Project Launch</option>
                        <option value="personal">Personal Milestone</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Priority
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
                      >
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Portal URL (Optional)
                      </label>
                      <input
                        type="text"
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Notes / Description
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Required documents, test scores, letters of reference..."
                      className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Checklist Items (One per line)
                    </label>
                    <textarea
                      rows={3}
                      value={checklistItems}
                      onChange={(e) => setChecklistItems(e.target.value)}
                      placeholder="Official transcripts&#10;Statement of Purpose draft&#10;Reference letters"
                      className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime resize-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-white/[0.06] mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-secondary text-xs py-2 px-4"
                  >
                    Close
                  </button>
                  <button type="submit" className="btn-primary text-xs py-2 px-5">
                    Save Deadline
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
