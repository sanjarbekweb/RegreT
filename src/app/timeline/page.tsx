'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Clock,
  Search,
  Filter,
  Plus,
  Trash2,
  ExternalLink,
  FolderGit2,
  Calendar,
  X,
  Maximize2,
  BookOpen,
  Film,
} from 'lucide-react';
import { storage, INITIAL_CATEGORIES } from '../../lib/storage';
import { Activity, CategoryId, Attachment } from '../../lib/types';

export default function TimelinePage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<Attachment | null>(null);

  const loadActivities = () => {
    setActivities(storage.getActivities());
  };

  useEffect(() => {
    loadActivities();
    const handleUpdate = () => loadActivities();
    window.addEventListener('regret_data_updated', handleUpdate);
    return () => window.removeEventListener('regret_data_updated', handleUpdate);
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Permanently remove this activity record?')) {
      storage.deleteActivity(id);
      loadActivities();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('regret_data_updated'));
      }
    }
  };

  // Filtered and grouped activities
  const filtered = useMemo(() => {
    return activities.filter((act) => {
      // Category filter
      if (selectedCategory !== 'all' && act.categoryId !== selectedCategory) return false;
      // Tag filter
      if (selectedTag && !act.tags.includes(selectedTag)) return false;
      // Search query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const inTitle = act.title.toLowerCase().includes(q);
        const inDesc = act.description?.toLowerCase().includes(q);
        const inTags = act.tags.some((t) => t.toLowerCase().includes(q));
        const inQuote = act.bookQuote?.quote.toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inTags && !inQuote) return false;
      }
      return true;
    });
  }, [activities, selectedCategory, selectedTag, searchQuery]);

  // Group by Date YYYY-MM-DD
  const groupedByDate = useMemo(() => {
    const groups: { [dateStr: string]: Activity[] } = {};
    filtered.forEach((act) => {
      const dateStr = act.startedAt.split('T')[0];
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(act);
    });
    return groups;
  }, [filtered]);

  // Unique tags for tag cloud
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    activities.forEach((a) => a.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  }, [activities]);

  const formatDateHeader = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="text-xs font-mono text-muted uppercase tracking-wider">
            Chronological Life Record
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
            Activity Timeline
          </h1>
          <p className="text-xs text-muted mt-1">
            Browse your daily routines, coding sprints, study sessions, workouts, and media logs.
          </p>
        </div>
        <Link href="/capture" className="btn-primary text-xs py-2 px-4 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>New Entry</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across title, notes, quotes, or tags..."
              className="w-full bg-elevated border border-border rounded pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
          >
            <option value="all">All Categories</option>
            {INITIAL_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tag Cloud Filter */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 text-xs">
            <span className="text-[11px] font-mono text-muted mr-1">Tags:</span>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary text-white text-[11px] font-mono"
              >
                <span>#{selectedTag}</span>
                <X className="w-3 h-3" />
              </button>
            )}
            {allTags.slice(0, 10).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`px-2 py-0.5 rounded font-mono text-[11px] transition-colors ${
                  selectedTag === tag
                    ? 'bg-primary text-white border border-primary'
                    : 'bg-elevated text-muted hover:text-foreground border border-border'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Timeline Stream by Date */}
      {Object.keys(groupedByDate).length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-12 text-center text-muted text-xs space-y-2">
          <Clock className="w-8 h-8 text-muted/40 mx-auto" />
          <p>No activity records found matching the current filters.</p>
          <Link href="/capture" className="btn-secondary text-xs mt-2 inline-flex">
            Create an Activity
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByDate).map(([dateStr, items]) => (
            <div key={dateStr} className="space-y-3">
              {/* Date Header Stamp */}
              <div className="flex items-center gap-3">
                <div className="h-px bg-border flex-1" />
                <div className="flex items-center gap-2 bg-elevated border border-border px-3 py-1 rounded-full text-xs font-mono text-foreground font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>{formatDateHeader(dateStr)}</span>
                  <span className="text-[11px] text-muted">({items.length} records)</span>
                </div>
                <div className="h-px bg-border flex-1" />
              </div>

              {/* Day's Activities List */}
              <div className="space-y-3">
                {items.map((act) => (
                  <div
                    key={act.id}
                    className="bg-surface border border-border rounded-lg p-4 sm:p-5 space-y-3 hover:border-primary/40 transition-colors"
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-elevated border border-border text-primary font-medium">
                            {act.categoryId}
                          </span>
                          <span className="text-xs font-mono text-muted">
                            {act.startedAt.split('T')[1]?.slice(0, 5)}
                            {act.endedAt ? ` - ${act.endedAt.split('T')[1]?.slice(0, 5)}` : ''}
                          </span>
                          {act.source === 'timer' && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-elevated border border-border text-muted">
                              Timed
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm sm:text-base text-foreground mt-1.5">
                          {act.title}
                        </h3>
                      </div>

                      <button
                        onClick={() => handleDelete(act.id)}
                        className="p-1.5 rounded text-muted/60 hover:text-danger hover:bg-elevated transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Description */}
                    {act.description && (
                      <p className="text-xs text-muted leading-relaxed whitespace-pre-line">
                        {act.description}
                      </p>
                    )}

                    {/* Book Quote if any */}
                    {act.bookQuote && (
                      <div className="bg-elevated border-l-2 border-primary p-3 rounded-r text-xs space-y-1">
                        <div className="italic text-foreground">&quot;{act.bookQuote.quote}&quot;</div>
                        <div className="text-[11px] font-mono text-muted flex items-center gap-1.5">
                          <BookOpen className="w-3 h-3 text-primary" />
                          <span>
                            — {act.bookQuote.author}, {act.bookQuote.bookTitle}{' '}
                            {act.bookQuote.pageNumber ? `(p. ${act.bookQuote.pageNumber})` : ''}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Media details if any */}
                    {act.mediaDetails && (
                      <div className="bg-elevated border border-border rounded p-3 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Film className="w-4 h-4 text-warning" />
                          <span className="font-medium text-foreground">
                            {act.mediaDetails.title}
                          </span>
                          {act.mediaDetails.authorOrArtist && (
                            <span className="text-muted text-[11px]">
                              by {act.mediaDetails.authorOrArtist}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-warning">
                          Rating: {act.mediaDetails.rating}/5
                        </span>
                      </div>
                    )}

                    {/* Photo Attachments */}
                    {act.attachments && act.attachments.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                        {act.attachments.map((att) => (
                          <div
                            key={att.id}
                            onClick={() => setPreviewPhoto(att)}
                            className="relative rounded overflow-hidden border border-border bg-black group cursor-pointer"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={att.url}
                              alt={att.caption || 'Activity media'}
                              className="w-full h-32 object-cover object-center group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute top-2 right-2 p-1 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                              <Maximize2 className="w-3 h-3" />
                            </div>
                            {att.caption && (
                              <div className="absolute bottom-0 inset-x-0 bg-black/80 px-2 py-1 text-[10px] text-foreground truncate">
                                {att.caption}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer Tags & Integrations */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40">
                      {act.githubRepo && (
                        <span className="text-[11px] font-mono text-muted flex items-center gap-1 bg-elevated px-2 py-0.5 rounded border border-border">
                          <FolderGit2 className="w-3 h-3 text-primary" />
                          {act.githubRepo}
                        </span>
                      )}
                      {act.githubCommit && (
                        <span className="text-[11px] font-mono text-muted bg-elevated px-2 py-0.5 rounded border border-border">
                          {act.githubCommit}
                        </span>
                      )}
                      {act.vercelUrl && (
                        <a
                          href={act.vercelUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-mono text-primary flex items-center gap-1 bg-elevated px-2 py-0.5 rounded border border-border hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Vercel
                        </a>
                      )}
                      {act.tags.map((t) => (
                        <button
                          key={t}
                          onClick={() => setSelectedTag(t)}
                          className="text-[10px] font-mono text-muted hover:text-primary"
                        >
                          #{t}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Lightbox Modal */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface border border-border rounded-lg max-w-3xl w-full overflow-hidden p-2 space-y-2 cursor-default"
          >
            <div className="flex justify-between items-center px-2 py-1">
              <span className="text-xs font-mono text-muted">{previewPhoto.originalName}</span>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="text-muted hover:text-foreground p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative bg-black rounded max-h-[75vh] flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewPhoto.url}
                alt="Enlarged preview"
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
            {previewPhoto.caption && (
              <div className="p-2 text-xs text-foreground font-medium">
                {previewPhoto.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
