'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Upload,
  Database,
  Key,
  RotateCcw,
  Check,
  Shield,
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
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Top Header */}
      <div className="border-b border-[#1E293B] pb-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
          System Configuration
        </div>
        <h1 className="text-2xl font-sans font-semibold tracking-tight text-[#F0F6FC] mt-0.5">
          Permanent Storage & Backups
        </h1>
        <p className="text-xs text-[#8B949E] mt-0.5">
          Manage local persistent storage, independent JSON backups, encryption policies, and AI API keys.
        </p>
      </div>

      {/* Storage Breakdown Metric Panel */}
      <div className="workspace-panel p-5 space-y-4 bg-[#111827] border border-[#1E293B]">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#161F2E] border border-[#232E3E] text-[#238636] flex items-center justify-center">
              <Database className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#F0F6FC]">
                Local Persistent Database
              </h3>
              <div className="text-[11px] text-[#64748B]">Zero telemetry · Offline-first encrypted storage</div>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#161F2E] text-[#238636] border border-[#238636]/30">
            Synchronized
          </span>
        </div>

        {/* 7 Stat Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          <div className="rounded-md bg-[#0D1117] border border-[#1E293B] p-2.5 text-center">
            <div className="text-base font-mono font-semibold text-[#F0F6FC]">
              <AnimatedCounter value={stats.activities} />
            </div>
            <div className="text-[9px] font-mono text-[#64748B] uppercase mt-0.5">Logs</div>
          </div>
          <div className="rounded-md bg-[#0D1117] border border-[#1E293B] p-2.5 text-center">
            <div className="text-base font-mono font-semibold text-[#F0F6FC]">
              <AnimatedCounter value={stats.habits} />
            </div>
            <div className="text-[9px] font-mono text-[#64748B] uppercase mt-0.5">Habits</div>
          </div>
          <div className="rounded-md bg-[#0D1117] border border-[#1E293B] p-2.5 text-center">
            <div className="text-base font-mono font-semibold text-[#388BFD]">
              <AnimatedCounter value={stats.flashcards} />
            </div>
            <div className="text-[9px] font-mono text-[#64748B] uppercase mt-0.5">Cards</div>
          </div>
          <div className="rounded-md bg-[#0D1117] border border-[#1E293B] p-2.5 text-center">
            <div className="text-base font-mono font-semibold text-[#F0F6FC]">
              <AnimatedCounter value={stats.vocabulary} />
            </div>
            <div className="text-[9px] font-mono text-[#64748B] uppercase mt-0.5">Vocab</div>
          </div>
          <div className="rounded-md bg-[#0D1117] border border-[#1E293B] p-2.5 text-center">
            <div className="text-base font-mono font-semibold text-[#F0F6FC]">
              <AnimatedCounter value={stats.knowledgeDocs} />
            </div>
            <div className="text-[9px] font-mono text-[#64748B] uppercase mt-0.5">Notes</div>
          </div>
          <div className="rounded-md bg-[#0D1117] border border-[#1E293B] p-2.5 text-center">
            <div className="text-base font-mono font-semibold text-[#238636]">
              <AnimatedCounter value={stats.projects} />
            </div>
            <div className="text-[9px] font-mono text-[#64748B] uppercase mt-0.5">Repos</div>
          </div>
          <div className="rounded-md bg-[#0D1117] border border-[#1E293B] p-2.5 text-center">
            <div className="text-base font-mono font-semibold text-[#F85149]">
              <AnimatedCounter value={stats.countdowns} />
            </div>
            <div className="text-[9px] font-mono text-[#64748B] uppercase mt-0.5">Goals</div>
          </div>
        </div>

        {/* Export / Import Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            onClick={handleExportData}
            className="w-full sm:w-auto btn-primary text-xs py-1.5 px-3 flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Full Backup (JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto btn-secondary text-xs py-1.5 px-3 flex items-center justify-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-[#388BFD]" />
            <span>Restore From Backup</span>
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
          <div className="p-2.5 bg-[#238636]/10 border border-[#238636]/30 text-[#238636] text-xs rounded-md flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Backup successfully restored into permanent storage!</span>
          </div>
        )}
      </div>

      {/* AI Key Configuration */}
      <form onSubmit={handleSaveApiKey} className="workspace-panel p-5 space-y-3.5 bg-[#111827] border border-[#1E293B]">
        <div className="flex items-center gap-2.5 border-b border-[#1E293B] pb-3">
          <div className="w-7 h-7 rounded-md bg-[#161F2E] border border-[#232E3E] text-[#388BFD] flex items-center justify-center">
            <Key className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[#F0F6FC]">
              AI Intelligence Provider Key
            </h3>
            <div className="text-xs text-[#8B949E]">
              Connect OpenAI API key for advanced neural synthesis (Optional, offline fallback active).
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#8B949E] mb-1">
            OpenAI API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-proj-..."
            className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD] font-mono"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          {saveSuccess ? (
            <span className="text-xs text-[#238636] flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Key saved securely</span>
            </span>
          ) : (
            <span className="text-[10px] text-[#64748B]">Stored only in your browser storage</span>
          )}
          <button type="submit" className="btn-primary text-xs py-1.5 px-3">
            Save Key
          </button>
        </div>
      </form>

      {/* Danger Zone: Factory Reset */}
      <div className="workspace-panel p-5 space-y-3 bg-[#111827] border border-[#1E293B]">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-[#F85149]">
              Reset to Factory Seed Data
            </h4>
            <p className="text-xs text-[#8B949E] mt-0.5">
              Replaces existing entries with clean initial demonstration dataset.
            </p>
          </div>
          <button
            onClick={handleResetData}
            className="btn-secondary text-xs py-1.5 px-3 text-[#F85149] hover:bg-[#F85149]/10 hover:border-[#F85149]/30 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
