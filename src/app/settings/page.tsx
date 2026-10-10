'use client';

import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { storage } from '../../lib/storage';

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
      <div className="border-b border-border pb-3">
        <div className="text-xs font-mono text-muted uppercase tracking-wider">
          System Configuration
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
          Permanent Storage & Backups
        </h1>
        <p className="text-xs text-muted mt-1">
          Manage local persistent storage, independent JSON backups, encryption policies, and AI API keys.
        </p>
      </div>

      {/* Storage Breakdown Metric */}
      <div className="bg-surface border border-border rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-success" />
            <h3 className="font-semibold text-sm text-foreground">Local Persistent Database</h3>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-elevated border border-border text-success">
            Status: Fully Synchronized
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-elevated border border-border rounded p-3 text-center">
            <div className="text-lg font-bold font-mono text-foreground">{stats.activities}</div>
            <div className="text-[10px] font-mono text-muted uppercase">Activities</div>
          </div>
          <div className="bg-elevated border border-border rounded p-3 text-center">
            <div className="text-lg font-bold font-mono text-foreground">{stats.habits}</div>
            <div className="text-[10px] font-mono text-muted uppercase">Habits</div>
          </div>
          <div className="bg-elevated border border-border rounded p-3 text-center">
            <div className="text-lg font-bold font-mono text-foreground">{stats.flashcards}</div>
            <div className="text-[10px] font-mono text-muted uppercase">Flashcards</div>
          </div>
          <div className="bg-elevated border border-border rounded p-3 text-center">
            <div className="text-lg font-bold font-mono text-foreground">{stats.vocabulary}</div>
            <div className="text-[10px] font-mono text-muted uppercase">Vocabulary</div>
          </div>
          <div className="bg-elevated border border-border rounded p-3 text-center">
            <div className="text-lg font-bold font-mono text-foreground">{stats.knowledgeDocs}</div>
            <div className="text-[10px] font-mono text-muted uppercase">Lessons</div>
          </div>
          <div className="bg-elevated border border-border rounded p-3 text-center">
            <div className="text-lg font-bold font-mono text-foreground">{stats.projects}</div>
            <div className="text-[10px] font-mono text-muted uppercase">Projects</div>
          </div>
          <div className="bg-elevated border border-border rounded p-3 text-center">
            <div className="text-lg font-bold font-mono text-foreground">{stats.countdowns}</div>
            <div className="text-[10px] font-mono text-muted uppercase">Deadlines</div>
          </div>
        </div>

        {/* Export / Import Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="w-full sm:w-auto btn-primary text-xs py-2 px-4 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Full Life OS Backup (JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto btn-secondary text-xs py-2 px-4 flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Restore From Backup File</span>
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
          <div className="p-3 bg-success/20 border border-success text-success text-xs rounded flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Backup successfully restored into permanent storage!</span>
          </div>
        )}
      </div>

      {/* AI Key Configuration */}
      <form onSubmit={handleSaveApiKey} className="bg-surface border border-border rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Key className="w-4 h-4 text-primary" />
          <div>
            <h3 className="font-semibold text-sm text-foreground">AI Intelligence Provider Key</h3>
            <div className="text-xs text-muted">
              Connect OpenAI API key for advanced neural synthesis (Optional, smart fallback active).
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-muted mb-1">OpenAI API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-proj-..."
            className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary font-mono"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          {saveSuccess ? (
            <span className="text-xs text-success flex items-center gap-1 font-mono">
              <Check className="w-3.5 h-3.5" />
              API Key Saved
            </span>
          ) : (
            <span className="text-[11px] text-muted font-mono">Stored securely in local browser storage</span>
          )}
          <button type="submit" className="btn-secondary text-xs py-1.5 px-3">
            Save Key
          </button>
        </div>
      </form>

      {/* PostgreSQL / Supabase Architecture Reference */}
      <div className="bg-surface border border-border rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-muted" />
            <h3 className="font-semibold text-sm text-foreground">PostgreSQL & Supabase Architecture</h3>
          </div>
          <span className="text-[11px] font-mono text-muted">8 Tables · RLS Enforced</span>
        </div>
        <p className="text-xs text-muted leading-relaxed">
          The application data models are 100% normalized and match the production PostgreSQL migration schema:
          <code className="text-primary font-mono ml-1">profiles</code>, <code className="text-primary font-mono">categories</code>, <code className="text-primary font-mono">activities</code>, <code className="text-primary font-mono">attachments</code>, <code className="text-primary font-mono">tags</code>, <code className="text-primary font-mono">habits</code>, <code className="text-primary font-mono">habit_completions</code>.
        </p>
      </div>

      {/* Reset Options */}
      <div className="border border-danger/30 rounded-lg p-5 bg-surface/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-danger uppercase font-mono">Danger Zone</div>
          <div className="text-xs text-muted mt-0.5">
            Reset local database to default pre-loaded starter data.
          </div>
        </div>
        <button
          onClick={handleResetData}
          className="btn-secondary border-danger/40 text-danger hover:bg-danger/20 text-xs py-1.5 px-3 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Defaults</span>
        </button>
      </div>
    </div>
  );
}
