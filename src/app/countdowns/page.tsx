'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hourglass,
  Plus,
  ExternalLink,
  Trash2,
  Check,
  X,
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

  const calculateTimeBreakdown = (targetDateStr: string) => {
    const diff = new Date(targetDateStr).getTime() - now.getTime();
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds, isPast: false };
  };

  const sortedCountdowns = [...countdowns].sort(
    (a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1E293B]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
            Critical Deadlines & Timelines
          </div>
          <h1 className="text-2xl font-sans font-semibold tracking-tight text-[#F0F6FC] mt-0.5">
            Countdowns & Milestones
          </h1>
          <p className="text-xs text-[#8B949E] mt-0.5">
            Real-time countdown clocks for university applications, exams, competitions, and project releases.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-xs py-1.5 px-3 self-start sm:self-auto gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Deadline</span>
        </button>
      </div>

      {/* Countdown Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedCountdowns.map((cd) => {
          const time = calculateTimeBreakdown(cd.targetDate);
          return (
            <div
              key={cd.id}
              className="workspace-panel p-5 space-y-4 bg-[#111827] border border-[#1E293B] flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Meta Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#161F2E] text-[#8B949E] border border-[#1E293B]">
                        {cd.category}
                      </span>
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border ${
                          cd.priority === 'urgent'
                            ? 'bg-[#F85149]/10 text-[#F85149] border-[#F85149]/30'
                            : cd.priority === 'high'
                            ? 'bg-[#D29922]/10 text-[#D29922] border-[#D29922]/30'
                            : 'bg-[#161F2E] text-[#8B949E] border-[#1E293B]'
                        }`}
                      >
                        {cd.priority}
                      </span>
                    </div>
                    <h3 className="font-semibold text-base text-[#F0F6FC] mt-1.5">
                      {cd.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {cd.targetUrl && (
                      <a
                        href={cd.targetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded text-[#8B949E] hover:text-[#388BFD] transition-colors"
                        title="Open portal"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCountdown(cd.id, e)}
                      className="p-1 rounded text-[#484F58] hover:text-[#F85149] transition-colors"
                      title="Delete Deadline"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Linear-style Ticker Clock */}
                <div className="grid grid-cols-4 gap-2 bg-[#0D1117] border border-[#1E293B] rounded-md p-3 text-center">
                  <div>
                    <div className="text-xl sm:text-2xl font-mono font-semibold text-[#F0F6FC]">
                      {time.days}
                    </div>
                    <div className="text-[9px] font-mono uppercase text-[#64748B] mt-0.5">Days</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-mono font-semibold text-[#F0F6FC]">
                      {time.hours}
                    </div>
                    <div className="text-[9px] font-mono uppercase text-[#64748B] mt-0.5">Hours</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-mono font-semibold text-[#F0F6FC]">
                      {time.minutes}
                    </div>
                    <div className="text-[9px] font-mono uppercase text-[#64748B] mt-0.5">Mins</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-mono font-semibold text-[#388BFD]">
                      {time.seconds}
                    </div>
                    <div className="text-[9px] font-mono uppercase text-[#64748B] mt-0.5">Secs</div>
                  </div>
                </div>

                {cd.description && (
                  <p className="text-xs text-[#8B949E] leading-relaxed">
                    {cd.description}
                  </p>
                )}

                {/* Milestone Checklist */}
                {cd.checklist && cd.checklist.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-[#1E293B]">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
                      Milestone Action Items
                    </div>
                    <div className="space-y-1">
                      {cd.checklist.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleToggleChecklist(cd.id, item.id)}
                          className={`w-full flex items-center gap-2 p-1.5 rounded text-left text-xs transition-colors ${
                            item.done
                              ? 'text-[#64748B] line-through'
                              : 'text-[#F0F6FC] hover:bg-[#161F2E]/60'
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors shrink-0 ${
                              item.done
                                ? 'bg-[#238636] text-white'
                                : 'border border-[#334155]'
                            }`}
                          >
                            {item.done && <Check className="w-2.5 h-2.5 stroke-[2.5]" />}
                          </div>
                          <span className="truncate">{item.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#1E293B] text-[10px] font-mono text-[#64748B] flex items-center justify-between">
                <span>Target: {cd.targetDate.replace('T', ' ')}</span>
                <span>{time.isPast ? 'Passed' : 'Pending'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Countdown Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-[#090D12]/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="workspace-panel max-w-lg w-full p-5 space-y-4 bg-[#111827] border border-[#1E293B]"
            >
              <form onSubmit={handleCreateCountdown}>
                <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                  <h3 className="text-xs font-semibold text-[#F0F6FC] uppercase tracking-wider">
                    Add Critical Deadline
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="text-[#64748B] hover:text-[#F0F6FC]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 pt-3">
                  <div>
                    <label className="block text-xs font-medium text-[#8B949E] mb-1">
                      Deadline Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Oxford MSc Computer Science Application"
                      className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#8B949E] mb-1">
                        Target Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#8B949E] mb-1">
                        Priority Level
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                      >
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#8B949E] mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                      >
                        <option value="university">University</option>
                        <option value="exam">Exam</option>
                        <option value="competition">Competition</option>
                        <option value="project">Project</option>
                        <option value="personal">Personal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#8B949E] mb-1">
                        Portal / Web URL
                      </label>
                      <input
                        type="text"
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8B949E] mb-1">
                      Milestone Action Items (One per line)
                    </label>
                    <textarea
                      rows={3}
                      value={checklistItems}
                      onChange={(e) => setChecklistItems(e.target.value)}
                      placeholder="Submit transcript&#10;Request reference letters&#10;Record video prompt"
                      className="w-full bg-[#090D12] border border-[#1E293B] rounded-md p-2.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD] resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#1E293B] mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs py-1.5 px-3">
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
