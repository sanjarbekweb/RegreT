'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  Clock,
  BookOpen,
  Layers,
  FolderGit2,
  Hourglass,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { Activity, KnowledgeDocument, VocabularyWord, Project, Countdown } from '../../lib/types';

export default function UniversalSearchPage() {
  const [query, setQuery] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDocument[]>([]);
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);

  const loadData = React.useCallback(() => {
    setActivities(storage.getActivities());
    setKnowledgeDocs(storage.getKnowledgeDocs());
    setVocabulary(storage.getVocabulary());
    setProjects(storage.getProjects());
    setCountdowns(storage.getCountdowns());
  }, []);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('regret_data_updated', handleUpdate);
    return () => window.removeEventListener('regret_data_updated', handleUpdate);
  }, [loadData]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        activities: [],
        knowledgeDocs: [],
        vocabulary: [],
        projects: [],
        countdowns: [],
        total: 0,
      };
    }

    const matchedActivities = activities.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)) ||
        a.bookQuote?.quote.toLowerCase().includes(q)
    );

    const matchedKnowledge = knowledgeDocs.filter(
      (k) =>
        k.title.toLowerCase().includes(q) ||
        k.topic.toLowerCase().includes(q) ||
        k.rawContent.toLowerCase().includes(q) ||
        k.aiSummary?.toLowerCase().includes(q)
    );

    const matchedVocab = vocabulary.filter(
      (v) =>
        v.word.toLowerCase().includes(q) ||
        v.definition.toLowerCase().includes(q) ||
        v.synonyms.some((s) => s.toLowerCase().includes(q))
    );

    const matchedProjects = projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.techStack.some((t) => t.toLowerCase().includes(q)) ||
        p.githubRepo?.toLowerCase().includes(q)
    );

    const matchedCountdowns = countdowns.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.checklist?.some((item) => item.text.toLowerCase().includes(q))
    );

    const total =
      matchedActivities.length +
      matchedKnowledge.length +
      matchedVocab.length +
      matchedProjects.length +
      matchedCountdowns.length;

    return {
      activities: matchedActivities,
      knowledgeDocs: matchedKnowledge,
      vocabulary: matchedVocab,
      projects: matchedProjects,
      countdowns: matchedCountdowns,
      total,
    };
  }, [query, activities, knowledgeDocs, vocabulary, projects, countdowns]);

  return (
    <div className="space-y-7 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
        <div className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Unified Search Engine
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-slate-900 dark:text-white mt-1">
          Universal Search
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl font-sans">
          Search across activities, photos, quotes, lesson summaries, vocabulary, repositories, and deadlines.
        </p>
      </div>

      {/* Search Input Bar (Pill style) */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4.5 top-3.5" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by keyword, topic, tag, quote, or project..."
          className="w-full bento-card pl-12 pr-28 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime font-sans shadow-sm"
        />
        {query && (
          <div className="absolute right-4 top-3.5 text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-300">
            {results.total} found
          </div>
        )}
      </div>

      {/* Results View */}
      {query.trim().length === 0 ? (
        <div className="bento-card p-10 text-center space-y-4 bg-white dark:bg-[#131A29]">
          <Search className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="text-xs font-display font-bold text-slate-700 dark:text-slate-300">
            Type a query or select a quick track below
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {['business', 'coding', 'deep work', 'f1', 'oxford', 'strength'].map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="text-xs font-display font-bold px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 hover:bg-lime hover:text-slate-950 transition-all border border-slate-200/60 dark:border-white/[0.06]"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      ) : results.total === 0 ? (
        <div className="bento-card p-12 text-center text-xs text-slate-400 bg-white dark:bg-[#131A29]">
          No records match &quot;{query}&quot;. Try a different keyword or category.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Matched Activities */}
          {results.activities.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-display font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                <Clock className="w-4 h-4 text-lime" />
                <span>Activities ({results.activities.length})</span>
              </div>
              <div className="space-y-2">
                {results.activities.map((a) => (
                  <Link
                    key={a.id}
                    href="/timeline"
                    className="block bento-card p-4 hover:border-lime/60 transition-all bg-white dark:bg-[#131A29]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-sm text-slate-900 dark:text-white">{a.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {a.startedAt.split('T')[0]}
                      </span>
                    </div>
                    {a.description && (
                      <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-sans">{a.description}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Matched Knowledge */}
          {results.knowledgeDocs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-display font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-iris" />
                <span>Knowledge Lessons ({results.knowledgeDocs.length})</span>
              </div>
              <div className="space-y-2">
                {results.knowledgeDocs.map((k) => (
                  <Link
                    key={k.id}
                    href="/knowledge"
                    className="block bento-card p-4 hover:border-lime/60 transition-all bg-white dark:bg-[#131A29]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-sm text-slate-900 dark:text-white">{k.title}</span>
                      <span className="text-[10px] font-display font-bold text-iris px-2.5 py-0.5 rounded-full bg-iris/10">
                        {k.topic}
                      </span>
                    </div>
                    {k.aiSummary && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 font-sans">{k.aiSummary}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Matched Vocabulary */}
          {results.vocabulary.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-display font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Vocabulary Words ({results.vocabulary.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.vocabulary.map((v) => (
                  <Link
                    key={v.id}
                    href="/vocabulary"
                    className="block bento-card p-4 hover:border-lime/60 transition-all bg-white dark:bg-[#131A29]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-sm text-slate-900 dark:text-white">{v.word}</span>
                      <span className="text-[10px] font-display uppercase font-bold text-slate-400">{v.partOfSpeech}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-sans">{v.definition}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Matched Projects */}
          {results.projects.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-display font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                <FolderGit2 className="w-4 h-4 text-emerald-600 dark:text-mint" />
                <span>Developer Projects ({results.projects.length})</span>
              </div>
              <div className="space-y-2">
                {results.projects.map((p) => (
                  <Link
                    key={p.id}
                    href="/projects"
                    className="block bento-card p-4 hover:border-lime/60 transition-all bg-white dark:bg-[#131A29]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-sm text-slate-900 dark:text-white">{p.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{p.githubRepo}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-sans">{p.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Matched Countdowns */}
          {results.countdowns.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-display font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                <Hourglass className="w-4 h-4 text-coral" />
                <span>Deadlines & Milestones ({results.countdowns.length})</span>
              </div>
              <div className="space-y-2">
                {results.countdowns.map((c) => (
                  <Link
                    key={c.id}
                    href="/countdowns"
                    className="block bento-card p-4 hover:border-lime/60 transition-all bg-white dark:bg-[#131A29]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-sm text-slate-900 dark:text-white">{c.title}</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-coral/15 text-coral-dark dark:text-coral">
                        Target: {c.targetDate.replace('T', ' ')}
                      </span>
                    </div>
                    {c.description && (
                      <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-sans">{c.description}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
