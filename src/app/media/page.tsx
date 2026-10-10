'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Film,
  BookOpen,
  Headphones,
  Tv,
  Plus,
  Star,
  ExternalLink,
  Quote,
  Maximize2,
  Calendar,
  Trash2,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { Activity } from '../../lib/types';

export default function MediaCulturePage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'books' | 'f1' | 'anime' | 'music'>('all');

  const loadData = () => {
    setActivities(storage.getActivities());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('regret_data_updated', handleUpdate);
    return () => window.removeEventListener('regret_data_updated', handleUpdate);
  }, []);

  const handleDeleteItem = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Permanently remove this media record?')) {
      storage.deleteActivity(id);
      loadData();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('regret_data_updated'));
      }
    }
  };

  // Filter activities relevant to media, entertainment, reading, music, f1
  const mediaItems = activities.filter(
    (a) =>
      a.categoryId === 'reading' ||
      a.categoryId === 'entertainment' ||
      a.categoryId === 'media' ||
      a.bookQuote ||
      a.mediaDetails
  );

  const filtered = mediaItems.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'books') return item.categoryId === 'reading' || item.bookQuote;
    if (activeTab === 'f1') return item.mediaDetails?.type === 'f1' || item.tags.includes('f1');
    if (activeTab === 'anime')
      return (
        item.mediaDetails?.type === 'anime' ||
        item.mediaDetails?.type === 'movie' ||
        item.mediaDetails?.type === 'scientific_video'
      );
    if (activeTab === 'music')
      return item.categoryId === 'media' || item.mediaDetails?.type === 'music';
    return true;
  });

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <div className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Intellectual & Cultural Archive
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Media, Books & Formula 1
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl font-sans">
            Permanent repository for literature quotations, research papers, F1 telemetry logs, anime, movies, and music.
          </p>
        </div>
      </div>

      {/* Bento Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-display">
        {[
          { id: 'all', label: 'All Records' },
          { id: 'books', label: 'Books & Papers' },
          { id: 'f1', label: 'Formula 1' },
          { id: 'anime', label: 'Anime & Films' },
          { id: 'music', label: 'Music Tracks' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-full font-bold transition-all whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? 'bg-lime text-slate-950 shadow-sm border border-black/5'
                : 'bg-white dark:bg-[#131A29] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/70 dark:border-white/[0.06]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Media Bento Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -3 }}
            className="bento-card p-6 space-y-4 bg-white dark:bg-[#131A29] flex flex-col justify-between"
          >
            <div className="space-y-3.5">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-display font-bold px-2.5 py-0.5 rounded-full bg-lime text-slate-950 uppercase">
                  {item.categoryId}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">
                    {item.startedAt.split('T')[0]}
                  </span>
                  <button
                    onClick={(e) => handleDeleteItem(item.id, e)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-coral hover:bg-coral/10 transition-colors"
                    title="Delete media record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                {item.title}
              </h3>

              {item.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">{item.description}</p>
              )}

              {/* Book Quotation Card (Soft Lilac / Iris Inset) */}
              {item.bookQuote && (
                <div className="bg-purple-50 dark:bg-purple-950/20 border-l-4 border-iris p-3.5 rounded-r-2xl text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <Quote className="w-4 h-4 text-iris shrink-0 mt-0.5" />
                    <div className="italic text-purple-950 dark:text-purple-200 leading-relaxed font-serif">
                      &quot;{item.bookQuote.quote}&quot;
                    </div>
                  </div>
                  <div className="text-[11px] font-sans font-medium text-purple-700 dark:text-purple-400 pl-6">
                    — {item.bookQuote.author}, {item.bookQuote.bookTitle}{' '}
                    {item.bookQuote.pageNumber ? `(p. ${item.bookQuote.pageNumber})` : ''}
                  </div>
                </div>
              )}

              {/* Media Details */}
              {item.mediaDetails && (
                <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] p-3.5 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {item.mediaDetails.type === 'music' ? (
                        <Headphones className="w-4 h-4 text-iris" />
                      ) : (
                        <Film className="w-4 h-4 text-coral" />
                      )}
                      <span>{item.mediaDetails.title}</span>
                    </div>
                    {item.mediaDetails.rating && (
                      <span className="text-[11px] font-display font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                        ★ {item.mediaDetails.rating} / 5
                      </span>
                    )}
                  </div>
                  {item.mediaDetails.authorOrArtist && (
                    <div className="text-[11px] text-slate-500 font-sans">
                      By {item.mediaDetails.authorOrArtist}
                    </div>
                  )}
                  {item.mediaDetails.url && (
                    <a
                      href={item.mediaDetails.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-display font-bold text-iris flex items-center gap-1 hover:underline pt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open Resource
                    </a>
                  )}
                </div>
              )}

              {/* Attached Photos / Screenshots */}
              {item.attachments && item.attachments.length > 0 && (
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {item.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="relative rounded-2xl overflow-hidden h-32 border border-slate-200 dark:border-white/[0.08] bg-black group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={att.url}
                        alt={att.caption || 'Media asset'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {att.caption && (
                        <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 px-2.5 py-1 text-[10px] text-white truncate">
                          {att.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
              {item.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-slate-200/60 dark:border-white/[0.06]"
                >
                  #{t}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
