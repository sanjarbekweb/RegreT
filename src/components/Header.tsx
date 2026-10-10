'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Play, Pause, Square, Clock } from 'lucide-react';
import { Activity, CategoryId } from '../lib/types';
import { storage } from '../lib/storage';

export default function Header() {
  const [currentDate, setCurrentDate] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerTitle, setTimerTitle] = useState<string>('Coding Session');
  const [showTimerModal, setShowTimerModal] = useState<boolean>(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinishTimer = () => {
    if (timerSeconds < 5) {
      setTimerRunning(false);
      setTimerSeconds(0);
      setShowTimerModal(false);
      return;
    }

    const now = new Date();
    const started = new Date(now.getTime() - timerSeconds * 1000);

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      title: timerTitle || 'Timed Focus Session',
      categoryId: 'coding',
      description: `Timed session completed. Total duration: ${formatTimer(timerSeconds)}.`,
      startedAt: started.toISOString(),
      endedAt: now.toISOString(),
      tags: ['timer', 'focus'],
      attachments: [],
      source: 'timer',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    storage.addActivity(newActivity);
    setTimerRunning(false);
    setTimerSeconds(0);
    setShowTimerModal(false);
    // Reload if on timeline or overview
    window.dispatchEvent(new Event('regret_data_updated'));
  };

  return (
    <header className="h-16 px-4 md:px-6 bg-surface/80 backdrop-blur-md border-b border-border flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div>
          <div className="text-xs font-mono text-muted">{currentDate}</div>
          <div className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
            <span>{currentTime}</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-success"></span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Active Timer Pill */}
        {timerSeconds > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-elevated border border-primary/40 rounded text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span className="text-primary font-bold">{formatTimer(timerSeconds)}</span>
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className="text-muted hover:text-foreground p-0.5"
              title={timerRunning ? 'Pause' : 'Resume'}
            >
              {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleFinishTimer}
              className="text-danger hover:text-danger/80 p-0.5"
              title="Stop and Save"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {timerSeconds === 0 && (
          <button
            onClick={() => setShowTimerModal(true)}
            className="hidden sm:inline-flex btn-secondary text-xs py-1.5 px-3"
          >
            <Play className="w-3.5 h-3.5 text-primary" />
            <span>Start Timer</span>
          </button>
        )}

        <Link
          href="/search"
          className="p-2 text-muted hover:text-foreground hover:bg-elevated rounded border border-border transition-colors"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </Link>

        <Link href="/capture" className="btn-primary text-xs py-1.5 px-3.5">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Quick Log</span>
        </Link>
      </div>

      {/* Start Timer Modal */}
      {showTimerModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-lg max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-semibold text-sm text-foreground">Launch Activity Timer</h3>
              <button
                onClick={() => setShowTimerModal(false)}
                className="text-muted hover:text-foreground text-xs"
              >
                Cancel
              </button>
            </div>
            <div>
              <label className="block text-xs font-mono text-muted mb-1">Session Title</label>
              <input
                type="text"
                value={timerTitle}
                onChange={(e) => setTimerTitle(e.target.value)}
                placeholder="e.g. Coding Personal OS, Gym Workout, Reading"
                className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setShowTimerModal(false)}
                className="btn-secondary text-xs py-1.5"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setTimerRunning(true);
                  setShowTimerModal(false);
                }}
                className="btn-primary text-xs py-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                Begin Tracking
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
