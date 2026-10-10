'use client';

import React, { useState, useEffect } from 'react';
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
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="text-xs font-mono text-muted uppercase tracking-wider">
            Critical Deadlines & Timelines
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
            Countdowns & Milestones
          </h1>
          <p className="text-xs text-muted mt-1">
            Real-time countdown clocks for university applications, exams, competitions, and project releases.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-xs py-2 px-4 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Deadline</span>
        </button>
      </div>

      {/* Countdown Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sortedCountdowns.map((cd) => {
          const time = calculateTimeBreakdown(cd.targetDate);
          return (
            <div
              key={cd.id}
              className="bg-surface border border-border rounded-lg p-5 space-y-4 hover:border-primary/40 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Meta Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-elevated border border-border text-primary uppercase font-semibold">
                        {cd.category}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${
                          cd.priority === 'urgent'
                            ? 'bg-danger/20 border-danger/40 text-danger'
                            : cd.priority === 'high'
                            ? 'bg-warning/20 border-warning/40 text-warning'
                            : 'bg-elevated border-border text-muted'
                        }`}
                      >
                        {cd.priority}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-foreground mt-2">{cd.title}</h3>
                  </div>

                  {cd.targetUrl && (
                    <a
                      href={cd.targetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded bg-elevated border border-border text-muted hover:text-primary transition-colors"
                      title="Open application portal"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Live Countdown Clock Ticker */}
                <div className="grid grid-cols-4 gap-2 bg-elevated border border-border rounded p-3 text-center">
                  <div>
                    <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">
                      {time.days}
                    </div>
                    <div className="text-[10px] font-mono text-muted uppercase">Days</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">
                      {time.hours}
                    </div>
                    <div className="text-[10px] font-mono text-muted uppercase">Hours</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">
                      {time.minutes}
                    </div>
                    <div className="text-[10px] font-mono text-muted uppercase">Mins</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold font-mono text-primary">
                      {time.seconds}
                    </div>
                    <div className="text-[10px] font-mono text-muted uppercase">Secs</div>
                  </div>
                </div>

                {cd.description && (
                  <p className="text-xs text-muted leading-relaxed">{cd.description}</p>
                )}

                {/* Requirements Checklist */}
                {cd.checklist && cd.checklist.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-mono text-muted uppercase">
                      Action Checklist:
                    </div>
                    <div className="space-y-1">
                      {cd.checklist.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleToggleChecklist(cd.id, item.id)}
                          className="w-full text-left flex items-center gap-2 p-1.5 rounded bg-elevated/60 hover:bg-elevated text-xs transition-colors"
                        >
                          {item.done ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-muted/60 shrink-0" />
                          )}
                          <span
                            className={`flex-1 ${
                              item.done ? 'line-through text-muted' : 'text-foreground'
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
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-mono text-muted">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted" />
                  Target: {cd.targetDate.replace('T', ' ')}
                </span>
                <span className={time.isPast ? 'text-danger font-semibold' : 'text-success'}>
                  {time.isPast ? 'Deadline Passed' : 'Active'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Countdown Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCountdown}
            className="bg-surface border border-border rounded-lg max-w-lg w-full p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-semibold text-sm text-foreground">Add New Target Deadline</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-muted hover:text-foreground text-xs"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-muted mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Oxford MSc Computer Science Application"
                  className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-muted mb-1">Target Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
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
                  <label className="block text-xs font-mono text-muted mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted mb-1">Portal URL (Optional)</label>
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Required documents, test scores, letters of reference..."
                  className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1">
                  Checklist Items (One per line)
                </label>
                <textarea
                  rows={3}
                  value={checklistItems}
                  onChange={(e) => setChecklistItems(e.target.value)}
                  placeholder="Official transcripts&#10;Statement of Purpose draft&#10;Reference letters"
                  className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary resize-none font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn-secondary text-xs"
              >
                Close
              </button>
              <button type="submit" className="btn-primary text-xs">
                Save Deadline
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
