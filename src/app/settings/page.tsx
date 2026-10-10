'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Download,
  Upload,
  Database,
  Key,
  RotateCcw,
  Check,
  Shield,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import AnimatedCounter from '../../components/AnimatedCounter';

export default function SettingsBackupPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [apiKey, setApiKey] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [stats, setStats] = useState({
    activities: 0,
    habits: 0,
    flashcards: 0,
    vocabulary: 0,
    knowledgeDocs: 0,
    projects: 0,
    countdowns: 0,
  });

  const loadStats = () => {
    setStats({
      activities: storage.getActivities().length,
      habits: storage.getHabits().length,
      flashcards: storage.getFlashcards().length,
      vocabulary: storage.getVocabulary().length,
      knowledgeDocs: storage.getKnowledgeDocs().length,
      projects: storage.getProjects().length,
      countdowns: storage.getCountdowns().length,
    });
    setApiKey(storage.getApiKey());
  };

  useEffect(() => {
    loadStats();
    const handleUpdate = () => loadStats();
    window.addEventListener('regret_data_updated', handleUpdate);
    return () => window.removeEventListener('regret_data_updated', handleUpdate);
  }, []);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveApiKey(apiKey);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExportData = () => {
    const jsonStr = storage.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `regret-life-os-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storage.importAllData(content);
      if (success) {
        setImportSuccess(true);
        loadStats();
        window.dispatchEvent(new Event('regret_data_updated'));
        setTimeout(() => setImportSuccess(false), 3000);
      } else {
        alert('Invalid backup file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('Reset all data to default initial state? Any custom entries will be replaced.')) {
      storage.resetToDefault();
      loadStats();
      window.dispatchEvent(new Event('regret_data_updated'));
    }
  };

  return (
    <div className="space-y-7 max-w-3xl mx-auto">
      {/* Top Header */}
      <div className="border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
        <div className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          System Configuration
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-slate-900 dark:text-white mt-1">
          Permanent Storage & Backups
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl font-sans">
          Manage local persistent storage, independent JSON backups, encryption policies, and AI API keys.
        </p>
      </div>

      {/* Storage Breakdown Metric Bento Card */}
      <div className="bento-card p-6 space-y-5 bg-white dark:bg-[#131A29]">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
              <Database className="w-4 h-4 text-emerald-600 dark:text-mint" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                Local Persistent Database
              </h3>
              <div className="text-[11px] text-slate-400 font-sans">Zero server telemetry</div>
            </div>
          </div>
          <span className="text-[10px] font-display font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
            Fully Synchronized
          </span>
        </div>

        {/* 7 Stat Squircle Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] p-3 text-center">
            <div className="text-lg font-display font-black text-slate-900 dark:text-white">
              <AnimatedCounter value={stats.activities} />
            </div>
            <div className="text-[10px] font-display font-bold text-slate-400 uppercase mt-0.5">Logs</div>
          </div>
          <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] p-3 text-center">
            <div className="text-lg font-display font-black text-slate-900 dark:text-white">
              <AnimatedCounter value={stats.habits} />
            </div>
            <div className="text-[10px] font-display font-bold text-slate-400 uppercase mt-0.5">Habits</div>
          </div>
          <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] p-3 text-center">
            <div className="text-lg font-display font-black text-iris dark:text-purple-300">
              <AnimatedCounter value={stats.flashcards} />
            </div>
            <div className="text-[10px] font-display font-bold text-slate-400 uppercase mt-0.5">Cards</div>
          </div>
          <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] p-3 text-center">
            <div className="text-lg font-display font-black text-slate-900 dark:text-white">
              <AnimatedCounter value={stats.vocabulary} />
            </div>
            <div className="text-[10px] font-display font-bold text-slate-400 uppercase mt-0.5">Vocab</div>
          </div>
          <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] p-3 text-center">
            <div className="text-lg font-display font-black text-slate-900 dark:text-white">
              <AnimatedCounter value={stats.knowledgeDocs} />
            </div>
            <div className="text-[10px] font-display font-bold text-slate-400 uppercase mt-0.5">Lessons</div>
          </div>
          <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] p-3 text-center">
            <div className="text-lg font-display font-black text-emerald-600 dark:text-mint">
              <AnimatedCounter value={stats.projects} />
            </div>
            <div className="text-[10px] font-display font-bold text-slate-400 uppercase mt-0.5">Repos</div>
          </div>
          <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] p-3 text-center">
            <div className="text-lg font-display font-black text-coral">
              <AnimatedCounter value={stats.countdowns} />
            </div>
            <div className="text-[10px] font-display font-bold text-slate-400 uppercase mt-0.5">Goals</div>
          </div>
        </div>

        {/* Export / Import Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="w-full sm:w-auto btn-primary text-xs py-2.5 px-5 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Export Full Backup (JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto btn-secondary text-xs py-2.5 px-5 flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4 text-iris" />
            <span>Restore From File</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>

        {importSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-200 text-xs rounded-2xl flex items-center gap-2 font-display font-bold"
          >
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Backup successfully restored into permanent storage!</span>
          </motion.div>
        )}
      </div>

      {/* AI Key Configuration */}
      <form onSubmit={handleSaveApiKey} className="bento-card p-6 space-y-4 bg-white dark:bg-[#131A29]">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/[0.06] pb-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center">
            <Key className="w-4 h-4 text-iris" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">
              AI Intelligence Provider Key
            </h3>
            <div className="text-xs text-slate-400 font-sans">
              Connect OpenAI API key for advanced neural synthesis (Optional, smart offline fallback active).
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            OpenAI API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-proj-..."
            className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime font-mono"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          {saveSuccess ? (
            <span className="text-xs text-emerald-600 dark:text-mint flex items-center gap-1 font-display font-bold">
              <Check className="w-4 h-4" />
              API Key Saved
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 font-sans">Stored securely in local browser storage</span>
          )}
          <button type="submit" className="btn-secondary text-xs py-2 px-4">
            Save Key
          </button>
        </div>
      </form>

      {/* PostgreSQL / Supabase Architecture Reference */}
      <div className="bento-card p-6 space-y-3 bg-white dark:bg-[#131A29]">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
          <div className="flex items-center gap-2.5">
            <FileCode className="w-4 h-4 text-slate-400" />
            <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white">
              PostgreSQL & Supabase Architecture
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">8 Tables · RLS Enforced</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed font-sans">
          The application data models are 100% normalized and match the production PostgreSQL migration schema:
          <code className="text-iris font-mono font-bold ml-1">profiles</code>, <code className="text-iris font-mono font-bold">categories</code>, <code className="text-iris font-mono font-bold">activities</code>, <code className="text-iris font-mono font-bold">attachments</code>, <code className="text-iris font-mono font-bold">tags</code>, <code className="text-iris font-mono font-bold">habits</code>, <code className="text-iris font-mono font-bold">habit_completions</code>.
        </p>
      </div>

      {/* Reset Options */}
      <div className="bento-card border border-coral/30 p-6 bg-orange-50/30 dark:bg-orange-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-display font-bold text-coral uppercase tracking-wider">Danger Zone</div>
          <div className="text-xs text-slate-500 mt-0.5 font-sans">
            Reset local database to default pre-loaded starter data.
          </div>
        </div>
        <button
          onClick={handleResetData}
          className="btn-secondary border-coral/40 text-coral hover:bg-coral/10 text-xs py-2 px-4 shrink-0 font-display font-bold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Defaults</span>
        </button>
      </div>
    </div>
  );
}
