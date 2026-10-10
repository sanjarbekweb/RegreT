'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  FolderGit2,
  X,
  Maximize2,
  BookOpen,
  Film,
  Image as ImageIcon,
  Quote,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { storage, INITIAL_CATEGORIES } from '../../lib/storage';
import { Activity, CategoryId, Attachment } from '../../lib/types';

function TimelineContent() {
  const searchParams = useSearchParams();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<Activity | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<Attachment | null>(null);

  const loadActivities = () => {
    setActivities(storage.getActivities());
  };

  useEffect(() => {
    loadActivities();
    const handleUpdate = () => loadActivities();
    window.addEventListener('regret_data_updated', handleUpdate);
    return () => window.removeEventListener('regret_data_updated', handleUpdate);
  }, []);

  // Handle URL query parameters (id, q, category)
  useEffect(() => {
    const id = searchParams.get('id');
    const q = searchParams.get('q');
    const cat = searchParams.get('category');
    if (q) setSearchQuery(q);
    if (cat) setSelectedCategory(cat as any);
    if (id && activities.length > 0) {
      const found = activities.find((a) => a.id === id);
      if (found) {
        setSelectedRecord(found);
      }
    }
  }, [searchParams, activities]);

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Permanently remove this activity record?')) {
      storage.deleteActivity(id);
      loadActivities();
      if (selectedRecord?.id === id) {
        setSelectedRecord(null);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('regret_data_updated'));
      }
    }
  };

  // Filtered activities
  const filtered = useMemo(() => {
    return activities.filter((act) => {
      if (selectedCategory !== 'all' && act.categoryId !== selectedCategory) return false;
      if (selectedTag && !act.tags.includes(selectedTag)) return false;
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
    const sorted = [...filtered].sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
    sorted.forEach((act) => {
      const dateStr = act.startedAt.split('T')[0];
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(act);
    });
    return groups;
  }, [filtered]);

  // Unique tags for tag filter
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    activities.forEach((a) => a.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  }, [activities]);

  const formatDateHeader = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00Z');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const formatted = d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    if (dateStr === today) return `Today · ${formatted}`;
    if (dateStr === yesterday) return `Yesterday · ${formatted}`;
    return formatted;
  };

  const calculateDuration = (act: Activity) => {
    if (!act.endedAt) return '30m';
    const diff = (new Date(act.endedAt).getTime() - new Date(act.startedAt).getTime()) / (1000 * 60);
    const m = Math.max(1, Math.round(diff));
    const hours = Math.floor(m / 60);
    const mins = m % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1E293B]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
            Life Archive Stream
          </div>
          <h1 className="text-2xl font-sans font-semibold tracking-tight text-[#F0F6FC] mt-0.5">
            Life Timeline
          </h1>
          <p className="text-xs text-[#8B949E] mt-0.5">
            Chronological stream grouped by day. Select any entry to open its complete record.
          </p>
        </div>
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('regret_open_quick_capture', { detail: {} }));
            }
          }}
          className="btn-primary text-xs py-1.5 px-3 self-start sm:self-auto gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Activity</span>
        </button>
      </div>

      {/* Filter and Search Bar (Linear style) */}
      <div className="workspace-panel p-3.5 space-y-3 bg-[#111827] border border-[#1E293B]">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across title, notes, quotes, or tags..."
              className="w-full bg-[#090D12] border border-[#1E293B] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#F0F6FC] placeholder:text-[#64748B] focus:outline-none focus:border-[#388BFD]"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
          >
            <option value="all">All Categories</option>
            {INITIAL_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs">
            <span className="text-[10px] font-mono text-[#64748B] uppercase mr-1">Tags:</span>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#388BFD] text-white flex items-center gap-1"
              >
                <span>#{selectedTag}</span>
                <X className="w-2.5 h-2.5" />
              </button>
            )}
            {allTags.slice(0, 10).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  selectedTag === tag
                    ? 'bg-[#388BFD] text-white'
                    : 'bg-[#161F2E] text-[#8B949E] hover:text-[#F0F6FC] border border-[#1E293B]'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chronological Stream Grouped by Day */}
      <div className="space-y-6">
        {sortedDates.length === 0 ? (
          <div className="workspace-panel p-8 text-center bg-[#111827] border border-[#1E293B] text-xs text-[#8B949E]">
            No activity records match your criteria.
          </div>
        ) : (
          sortedDates.map((dateStr) => {
            const dayActivities = groupedByDate[dateStr];

            return (
              <div key={dateStr} className="space-y-2">
                {/* Day Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#388BFD]" />
                    <span className="text-xs font-semibold text-[#F0F6FC]">
                      {formatDateHeader(dateStr)}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#64748B]">
                    {dayActivities.length} {dayActivities.length === 1 ? 'entry' : 'entries'}
                  </span>
                </div>

                {/* Day Activities Panel */}
                <div className="workspace-panel divide-y divide-[#1E293B] bg-[#111827] border border-[#1E293B] overflow-hidden">
                  {dayActivities.map((act) => {
                    const time = act.startedAt.split('T')[1]?.slice(0, 5) || '12:00';
                    const duration = calculateDuration(act);
                    const hasPhotos = act.attachments && act.attachments.length > 0;

                    return (
                      <div
                        key={act.id}
                        onClick={() => setSelectedRecord(act)}
                        className="p-3.5 hover:bg-[#161F2E]/60 transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          {/* Time & Duration */}
                          <div className="pt-0.5 text-left sm:text-right shrink-0 min-w-[50px]">
                            <div className="text-xs font-mono font-medium text-[#F0F6FC]">
                              {time}
                            </div>
                            <div className="text-[10px] font-mono text-[#64748B]">
                              {duration}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-medium text-[#F0F6FC] group-hover:text-[#388BFD] transition-colors">
                                {act.title}
                              </span>
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#161F2E] text-[#8B949E] border border-[#1E293B]">
                                {act.categoryId}
                              </span>
                              {act.githubRepo && (
                                <span className="text-[9px] font-mono text-[#388BFD] bg-[#161F2E] px-1.5 py-0.2 rounded border border-[#232E3E] flex items-center gap-1">
                                  <FolderGit2 className="w-2.5 h-2.5" />
                                  {act.githubRepo}
                                </span>
                              )}
                            </div>

                            {act.description && (
                              <p className="text-[11px] text-[#8B949E] line-clamp-2 leading-relaxed">
                                {act.description}
                              </p>
                            )}

                            {/* Book Quote Preview */}
                            {act.bookQuote && (
                              <div className="italic text-[11px] text-[#8B949E] pl-2 border-l border-[#388BFD]/50 mt-1 line-clamp-1">
                                &quot;{act.bookQuote.quote}&quot; — {act.bookQuote.author}
                              </div>
                            )}

                            {/* Attached Photo Thumbnails */}
                            {hasPhotos && (
                              <div className="flex items-center gap-2 pt-1.5">
                                {act.attachments.map((att) => (
                                  <div
                                    key={att.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLightboxPhoto(att);
                                    }}
                                    className="relative w-12 h-12 rounded border border-[#1E293B] overflow-hidden bg-black group/img shrink-0"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={att.url}
                                      alt={att.caption || 'Thumbnail'}
                                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Chevron & Delete */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button
                            onClick={(e) => handleDelete(act.id, e)}
                            className="p-1 rounded text-[#484F58] hover:text-[#F85149] transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-[#484F58] group-hover:text-[#F0F6FC]" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Complete Record Modal (Prompt Specification) */}
      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-50 bg-[#090D12]/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="workspace-panel max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 bg-[#111827] border border-[#1E293B]"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#1E293B] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#161F2E] text-[#388BFD] border border-[#232E3E]">
                      {selectedRecord.categoryId}
                    </span>
                    <span className="text-xs font-mono text-[#8B949E]">
                      {selectedRecord.startedAt.replace('T', ' ').slice(0, 16)}
                      {selectedRecord.endedAt && ` – ${selectedRecord.endedAt.split('T')[1]?.slice(0, 5)}`}
                    </span>
                    <span className="text-[10px] font-mono text-[#64748B]">
                      ({calculateDuration(selectedRecord)})
                    </span>
                  </div>
                  <h2 className="text-base font-semibold text-[#F0F6FC] mt-1">
                    {selectedRecord.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-[#64748B] hover:text-[#F0F6FC] p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Notes & Description */}
              {selectedRecord.description && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider">
                    Notes & Record
                  </div>
                  <p className="text-xs text-[#F0F6FC] leading-relaxed whitespace-pre-wrap">
                    {selectedRecord.description}
                  </p>
                </div>
              )}

              {/* Book quote */}
              {selectedRecord.bookQuote && (
                <div className="p-3 rounded-md bg-[#0D1117] border border-[#1E293B] text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#388BFD]">
                    <Quote className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono uppercase">Literature Quote</span>
                  </div>
                  <blockquote className="italic text-[#F0F6FC]">
                    &quot;{selectedRecord.bookQuote.quote}&quot;
                  </blockquote>
                  <div className="text-[10px] text-[#8B949E]">
                    — {selectedRecord.bookQuote.author}, {selectedRecord.bookQuote.bookTitle}
                    {selectedRecord.bookQuote.pageNumber && ` (p. ${selectedRecord.bookQuote.pageNumber})`}
                  </div>
                </div>
              )}

              {/* Coding / GitHub integration */}
              {selectedRecord.githubRepo && (
                <div className="p-3 rounded-md bg-[#0D1117] border border-[#1E293B] text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[#388BFD]">
                    <FolderGit2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono uppercase">Repository Sync</span>
                  </div>
                  <div className="text-xs font-mono text-[#F0F6FC]">
                    {selectedRecord.githubRepo}
                  </div>
                  {selectedRecord.githubCommit && (
                    <div className="text-[11px] font-mono text-[#8B949E]">
                      Commit: {selectedRecord.githubCommit}
                    </div>
                  )}
                </div>
              )}

              {/* Photo Attachments with Apple Photos visual style */}
              {selectedRecord.attachments && selectedRecord.attachments.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider">
                      Attached Media ({selectedRecord.attachments.length})
                    </span>
                    <span className="text-[10px] text-[#8B949E]">Click photo for high-res view</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedRecord.attachments.map((att) => (
                      <div
                        key={att.id}
                        onClick={() => setLightboxPhoto(att)}
                        className="rounded-md border border-[#1E293B] overflow-hidden bg-black space-y-1 cursor-pointer group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={att.url}
                          alt={att.caption || 'Attachment'}
                          className="w-full h-44 object-cover group-hover:scale-102 transition-transform"
                        />
                        {att.caption && (
                          <div className="px-2.5 py-1 text-[10px] text-[#8B949E] bg-[#0D1117] border-t border-[#1E293B]">
                            {att.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags & Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#1E293B] text-[10px] font-mono text-[#64748B]">
                <div className="flex flex-wrap gap-1">
                  {selectedRecord.tags.map((t) => (
                    <span
                      key={t}
                      className="bg-[#0D1117] px-2 py-0.5 rounded border border-[#1E293B]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
                <span>Source: {selectedRecord.source}</span>
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-between">
                <button
                  onClick={() => handleDelete(selectedRecord.id)}
                  className="text-xs text-[#F85149] hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Record</span>
                </button>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox Photo Preview */}
      <AnimatePresence>
        {lightboxPhoto && (
          <div
            onClick={() => setLightboxPhoto(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
              <button
                onClick={() => setLightboxPhoto(null)}
                className="absolute top-2 right-2 text-white bg-black/60 p-2 rounded-full hover:bg-black"
              >
                <X className="w-5 h-5" />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxPhoto.url}
                alt={lightboxPhoto.caption || 'Preview'}
                className="max-h-[80vh] max-w-full object-contain rounded-md"
              />
              {lightboxPhoto.caption && (
                <div className="text-xs text-white/90 mt-3 text-center bg-black/60 px-4 py-1.5 rounded-full">
                  {lightboxPhoto.caption}
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TimelinePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[#8B949E] space-y-2">
          <p>Loading life archive stream...</p>
        </div>
      }
    >
      <TimelineContent />
    </Suspense>
  );
}

