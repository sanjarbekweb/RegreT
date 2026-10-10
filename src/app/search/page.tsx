'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Clock,
  BookOpen,
  Layers,
  FolderGit2,
  Hourglass,
  ExternalLink,
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
      <div className="border-b border-border pb-3">
        <div className="text-xs font-mono text-muted uppercase tracking-wider">
          Unified Search Engine
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
          Universal Search
        </h1>
        <p className="text-xs text-muted mt-1">
          Search across activities, photos, quotes, lesson summaries, vocabulary, repositories, and deadlines.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-muted absolute left-4 top-3.5" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by keyword, topic, tag, quote, or project..."
          className="w-full bg-surface border border-border rounded-lg pl-12 pr-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary placeholder:text-muted/60"
        />
        {query && (
          <div className="absolute right-4 top-3.5 text-xs font-mono text-muted">
            {results.total} results found
          </div>
        )}
      </div>

      {/* Results View */}
      {query.trim().length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-10 text-center space-y-3">
          <Search className="w-8 h-8 text-muted/40 mx-auto" />
          <div className="text-xs font-medium text-foreground">
            Type a query to search your entire life records
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {['business', 'coding', 'deep work', 'f1', 'oxford', 'strength'].map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="text-xs font-mono px-2.5 py-1 rounded bg-elevated border border-border text-muted hover:text-foreground hover:border-primary transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      ) : results.total === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-10 text-center text-xs text-muted">
          No records match &quot;{query}&quot;. Try a different keyword or category.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Matched Activities */}
          {results.activities.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-primary uppercase">
                <Clock className="w-4 h-4" />
                <span>Activities ({results.activities.length})</span>
              </div>
              <div className="space-y-2">
                {results.activities.map((a) => (
                  <Link
                    key={a.id}
                    href="/timeline"
                    className="block bg-surface border border-border rounded-lg p-3.5 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-foreground">{a.title}</span>
                      <span className="text-[10px] font-mono text-muted">
                        {a.startedAt.split('T')[0]}
                      </span>
                    </div>
                    {a.description && (
                      <p className="text-xs text-muted line-clamp-1 mt-1">{a.description}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Matched Knowledge */}
          {results.knowledgeDocs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-primary uppercase">
                <BookOpen className="w-4 h-4" />
                <span>Knowledge Lessons ({results.knowledgeDocs.length})</span>
              </div>
              <div className="space-y-2">
                {results.knowledgeDocs.map((k) => (
                  <Link
                    key={k.id}
                    href="/knowledge"
                    className="block bg-surface border border-border rounded-lg p-3.5 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-foreground">{k.title}</span>
                      <span className="text-[10px] font-mono text-primary px-1.5 py-0.5 rounded bg-elevated border border-border">
                        {k.topic}
                      </span>
                    </div>
                    {k.aiSummary && (
                      <p className="text-xs text-muted line-clamp-2 mt-1">{k.aiSummary}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Matched Vocabulary */}
          {results.vocabulary.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-primary uppercase">
                <Layers className="w-4 h-4" />
                <span>Vocabulary Words ({results.vocabulary.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.vocabulary.map((v) => (
                  <Link
                    key={v.id}
                    href="/vocabulary"
                    className="block bg-surface border border-border rounded-lg p-3 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">{v.word}</span>
                      <span className="text-[10px] font-mono text-muted">{v.partOfSpeech}</span>
                    </div>
                    <p className="text-xs text-muted line-clamp-1 mt-1">{v.definition}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Matched Projects */}
          {results.projects.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-primary uppercase">
                <FolderGit2 className="w-4 h-4" />
                <span>Developer Projects ({results.projects.length})</span>
              </div>
              <div className="space-y-2">
                {results.projects.map((p) => (
                  <Link
                    key={p.id}
                    href="/projects"
                    className="block bg-surface border border-border rounded-lg p-3.5 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-foreground">{p.name}</span>
                      <span className="text-[10px] font-mono text-muted">{p.githubRepo}</span>
                    </div>
                    <p className="text-xs text-muted line-clamp-1 mt-1">{p.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Matched Countdowns */}
          {results.countdowns.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-primary uppercase">
                <Hourglass className="w-4 h-4" />
                <span>Deadlines & Milestones ({results.countdowns.length})</span>
              </div>
              <div className="space-y-2">
                {results.countdowns.map((c) => (
                  <Link
                    key={c.id}
                    href="/countdowns"
                    className="block bg-surface border border-border rounded-lg p-3.5 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-foreground">{c.title}</span>
                      <span className="text-[10px] font-mono text-warning">
                        Target: {c.targetDate.replace('T', ' ')}
                      </span>
                    </div>
                    {c.description && (
                      <p className="text-xs text-muted line-clamp-1 mt-1">{c.description}</p>
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
