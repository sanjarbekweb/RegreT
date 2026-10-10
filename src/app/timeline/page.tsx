'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <div className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Chronological Life Record
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Activity Timeline
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl font-sans">
            Browse your daily routines, coding sprints, study sessions, workouts, and media logs.
          </p>
        </div>
        <Link href="/capture" className="btn-primary text-xs py-2.5 px-5 self-start sm:self-auto gap-2">
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Entry</span>
        </Link>
      </div>

      {/* Filter and Search Bar (Bento style) */}
      <div className="bento-card p-5 space-y-3.5 bg-white dark:bg-[#131A29]">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across title, notes, quotes, or tags..."
              className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-full pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime font-sans"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-full px-4 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-lime font-display font-semibold"
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
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 text-xs">
            <span className="text-[11px] font-display font-bold text-slate-400 mr-1">Filter Tags:</span>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime text-slate-950 text-xs font-display font-bold shadow-sm"
              >
                <span>#{selectedTag}</span>
                <X className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            )}
            {allTags.slice(0, 10).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`px-3 py-1 rounded-full font-mono text-[11px] transition-all font-medium ${
                  selectedTag === tag
                    ? 'bg-lime text-slate-950 font-bold border border-black/5'
                    : 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
        <div className="bento-card p-12 text-center text-slate-400 text-xs space-y-3 bg-white dark:bg-[#131A29]">
          <Clock className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-display font-bold text-slate-700 dark:text-slate-300">
            No activity records found matching the current filters.
          </p>
          <Link href="/capture" className="btn-secondary text-xs mt-2 inline-flex">
            Create an Activity
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByDate).map(([dateStr, items]) => (
            <div key={dateStr} className="space-y-4">
              {/* Date Header Stamp */}
              <div className="flex items-center gap-3">
                <div className="h-px bg-slate-200 dark:bg-white/[0.08] flex-1" />
                <div className="flex items-center gap-2 bg-white dark:bg-[#131A29] border border-slate-200/80 dark:border-white/[0.08] px-4 py-1.5 rounded-full text-xs font-display text-slate-900 dark:text-white font-bold shadow-sm">
                  <Calendar className="w-3.5 h-3.5 text-iris" />
                  <span>{formatDateHeader(dateStr)}</span>
                  <span className="text-[11px] text-slate-400 font-mono font-normal">
                    ({items.length} records)
                  </span>
                </div>
                <div className="h-px bg-slate-200 dark:bg-white/[0.08] flex-1" />
              </div>

              {/* Day's Activities List */}
              <div className="space-y-4">
                {items.map((act) => (
                  <motion.div
                    key={act.id}
                    whileHover={{ y: -2 }}
                    className="bento-card p-5 sm:p-6 space-y-3.5 bg-white dark:bg-[#131A29]"
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-display font-bold px-2.5 py-0.5 rounded-full bg-lime text-slate-950">
                            {act.categoryId}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {act.startedAt.split('T')[1]?.slice(0, 5)}
                            {act.endedAt ? ` - ${act.endedAt.split('T')[1]?.slice(0, 5)}` : ''}
                          </span>
                          {act.source === 'timer' && (
                            <span className="text-[10px] font-display font-semibold px-2 py-0.5 rounded-full bg-iris/10 text-iris border border-iris/20">
                              Timed
                            </span>
                          )}
                        </div>
                        <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white mt-1.5">
                          {act.title}
                        </h3>
                      </div>

                      <button
                        onClick={() => handleDelete(act.id)}
                        className="p-1.5 rounded-full text-slate-400 hover:text-coral hover:bg-coral/10 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Description */}
                    {act.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                        {act.description}
                      </p>
                    )}

                    {/* Book Quote if any */}
                    {act.bookQuote && (
                      <div className="bg-purple-50 dark:bg-purple-950/20 border-l-4 border-iris p-3.5 rounded-r-2xl text-xs space-y-1">
                        <div className="italic text-purple-950 dark:text-purple-200 font-serif">
                          &quot;{act.bookQuote.quote}&quot;
                        </div>
                        <div className="text-[11px] text-purple-700 dark:text-purple-400 font-sans font-medium flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-iris" />
                          <span>
                            — {act.bookQuote.author}, {act.bookQuote.bookTitle}{' '}
                            {act.bookQuote.pageNumber ? `(p. ${act.bookQuote.pageNumber})` : ''}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Media details if any */}
                    {act.mediaDetails && (
                      <div className="rounded-2xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-800/30 p-3.5 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Film className="w-4 h-4 text-coral" />
                          <span className="font-display font-bold text-slate-900 dark:text-white">
                            {act.mediaDetails.title}
                          </span>
                          {act.mediaDetails.authorOrArtist && (
                            <span className="text-slate-500 text-[11px]">
                              by {act.mediaDetails.authorOrArtist}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-display font-bold px-2.5 py-0.5 rounded-full bg-white dark:bg-white/[0.08] text-coral-dark dark:text-coral border border-coral/20">
                          Rating: {act.mediaDetails.rating}/5
                        </span>
                      </div>
                    )}

                    {/* Photo Attachments */}
                    {act.attachments && act.attachments.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
                        {act.attachments.map((att) => (
                          <div
                            key={att.id}
                            onClick={() => setPreviewPhoto(att)}
                            className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.08] bg-black group cursor-pointer"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={att.url}
                              alt={att.caption || 'Activity media'}
                              className="w-full h-32 object-cover object-center group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                              <Maximize2 className="w-3 h-3" />
                            </div>
                            {att.caption && (
                              <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 px-2.5 py-1 text-[10px] text-white truncate">
                                {att.caption}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer Tags & Integrations */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                      {act.githubRepo && (
                        <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5 bg-slate-100 dark:bg-white/[0.06] px-2.5 py-0.5 rounded-full border border-slate-200/60 dark:border-white/[0.08]">
                          <FolderGit2 className="w-3 h-3 text-iris" />
                          {act.githubRepo}
                        </span>
                      )}
                      {act.githubCommit && (
                        <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.06] px-2.5 py-0.5 rounded-full border border-slate-200/60 dark:border-white/[0.08]">
                          {act.githubCommit}
                        </span>
                      )}
                      {act.vercelUrl && (
                        <a
                          href={act.vercelUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-mono text-iris flex items-center gap-1.5 bg-slate-100 dark:bg-white/[0.06] px-2.5 py-0.5 rounded-full border border-slate-200/60 dark:border-white/[0.08] hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Vercel
                        </a>
                      )}
                      {act.tags.map((t) => (
                        <button
                          key={t}
                          onClick={() => setSelectedTag(t)}
                          className="text-[10px] font-mono text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        >
                          #{t}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Lightbox Modal */}
      <AnimatePresence>
        {previewPhoto && (
          <div
            onClick={() => setPreviewPhoto(null)}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bento-card max-w-3xl w-full overflow-hidden p-3 space-y-2 cursor-default bg-white dark:bg-[#131A29]"
            >
              <div className="flex justify-between items-center px-2 py-1">
                <span className="text-xs font-mono text-slate-400">{previewPhoto.originalName}</span>
                <button
                  onClick={() => setPreviewPhoto(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="relative bg-black rounded-2xl max-h-[75vh] flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewPhoto.url}
                  alt="Enlarged preview"
                  className="max-h-[75vh] w-auto object-contain"
                />
              </div>
              {previewPhoto.caption && (
                <div className="p-3 text-xs text-slate-900 dark:text-white font-medium">
                  {previewPhoto.caption}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
