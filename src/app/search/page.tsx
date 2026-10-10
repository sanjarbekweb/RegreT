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
  ChevronRight,
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="border-b border-[#1E293B] pb-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
          Command Palette & Search
        </div>
        <h1 className="text-2xl font-sans font-semibold tracking-tight text-[#F0F6FC] mt-0.5">
          Universal Search
        </h1>
        <p className="text-xs text-[#8B949E] mt-0.5">
          Search across activities, photos, literature quotes, research notes, vocabulary, repositories, and deadlines.
        </p>
      </div>

      {/* Search Input Bar (Linear Command Palette style) */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by keyword, topic, tag, quote, or project..."
          className="w-full workspace-panel pl-10 pr-24 py-2.5 text-xs text-[#F0F6FC] placeholder:text-[#64748B] focus:outline-none focus:border-[#388BFD] bg-[#111827] border border-[#1E293B]"
        />
        {query && (
          <div className="absolute right-3 top-2.5 text-[10px] font-mono px-2 py-0.5 rounded bg-[#161F2E] text-[#8B949E] border border-[#1E293B]">
            {results.total} {results.total === 1 ? 'result' : 'results'}
          </div>
        )}
      </div>

      {/* Results View */}
      {query.trim().length === 0 ? (
        <div className="workspace-panel p-8 text-center space-y-3 bg-[#111827] border border-[#1E293B]">
          <Search className="w-6 h-6 text-[#64748B] mx-auto" />
          <div className="text-xs font-medium text-[#8B949E]">
            Type a query or select a quick topic filter below
          </div>
          <div className="flex flex-wrap justify-center gap-1.5 pt-1">
            {['business', 'coding', 'deep work', 'f1', 'oxford', 'strength'].map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="text-xs font-mono px-2.5 py-1 rounded bg-[#0D1117] text-[#8B949E] hover:text-[#F0F6FC] hover:border-[#388BFD]/40 transition-colors border border-[#1E293B]"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      ) : results.total === 0 ? (
        <div className="workspace-panel p-8 text-center text-xs text-[#64748B] bg-[#111827] border border-[#1E293B]">
          No records match &quot;{query}&quot;. Try a different keyword or category.
        </div>
      ) : (
        <div className="space-y-5">
          {/* Matched Activities */}
          {results.activities.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-[#F0F6FC] uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-[#388BFD]" />
                <span>Activities ({results.activities.length})</span>
              </div>
              <div className="workspace-panel divide-y divide-[#1E293B] bg-[#111827] border border-[#1E293B] overflow-hidden">
                {results.activities.map((a) => (
                  <Link
                    key={a.id}
                    href="/timeline"
                    className="p-3 block hover:bg-[#161F2E]/60 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-xs text-[#F0F6FC]">{a.title}</span>
                      <span className="text-[10px] font-mono text-[#64748B]">
                        {a.startedAt.split('T')[0]}
                      </span>
                    </div>
                    {a.description && (
                      <p className="text-[11px] text-[#8B949E] line-clamp-1 mt-0.5">{a.description}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Matched Knowledge */}
          {results.knowledgeDocs.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-[#F0F6FC] uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-[#388BFD]" />
                <span>Knowledge Vault ({results.knowledgeDocs.length})</span>
              </div>
              <div className="workspace-panel divide-y divide-[#1E293B] bg-[#111827] border border-[#1E293B] overflow-hidden">
                {results.knowledgeDocs.map((k) => (
                  <Link
                    key={k.id}
                    href="/knowledge"
                    className="p-3 block hover:bg-[#161F2E]/60 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-xs text-[#F0F6FC]">{k.title}</span>
                      <span className="text-[9px] font-mono text-[#388BFD] px-1.5 py-0.2 rounded bg-[#161F2E] border border-[#232E3E]">
                        {k.topic}
                      </span>
                    </div>
                    {k.aiSummary && (
                      <p className="text-[11px] text-[#8B949E] line-clamp-1 mt-0.5">{k.aiSummary}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Matched Vocabulary */}
          {results.vocabulary.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-[#F0F6FC] uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-[#388BFD]" />
                <span>Vocabulary Words ({results.vocabulary.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {results.vocabulary.map((v) => (
                  <Link
                    key={v.id}
                    href="/vocabulary"
                    className="workspace-panel p-3 hover:border-[#388BFD]/40 transition-colors bg-[#111827] border border-[#1E293B]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-xs text-[#F0F6FC]">{v.word}</span>
                      <span className="text-[9px] font-mono uppercase text-[#64748B]">{v.partOfSpeech}</span>
                    </div>
                    <p className="text-[11px] text-[#8B949E] line-clamp-1 mt-0.5">{v.definition}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Matched Projects */}
          {results.projects.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-[#F0F6FC] uppercase tracking-wider">
                <FolderGit2 className="w-3.5 h-3.5 text-[#388BFD]" />
                <span>Projects ({results.projects.length})</span>
              </div>
              <div className="workspace-panel divide-y divide-[#1E293B] bg-[#111827] border border-[#1E293B] overflow-hidden">
                {results.projects.map((p) => (
                  <Link
                    key={p.id}
                    href="/projects"
                    className="p-3 block hover:bg-[#161F2E]/60 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-xs text-[#F0F6FC]">{p.name}</span>
                      <span className="text-[10px] font-mono text-[#64748B]">{p.githubRepo}</span>
                    </div>
                    <p className="text-[11px] text-[#8B949E] line-clamp-1 mt-0.5">{p.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Matched Countdowns */}
          {results.countdowns.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-[#F0F6FC] uppercase tracking-wider">
                <Hourglass className="w-3.5 h-3.5 text-[#388BFD]" />
                <span>Deadlines & Milestones ({results.countdowns.length})</span>
              </div>
              <div className="workspace-panel divide-y divide-[#1E293B] bg-[#111827] border border-[#1E293B] overflow-hidden">
                {results.countdowns.map((c) => (
                  <Link
                    key={c.id}
                    href="/countdowns"
                    className="p-3 block hover:bg-[#161F2E]/60 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-xs text-[#F0F6FC]">{c.title}</span>
                      <span className="text-[10px] font-mono text-[#388BFD]">
                        {c.targetDate.replace('T', ' ')}
                      </span>
                    </div>
                    {c.description && (
                      <p className="text-[11px] text-[#8B949E] line-clamp-1 mt-0.5">{c.description}</p>
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
