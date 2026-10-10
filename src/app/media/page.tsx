'use client';

import React, { useState, useEffect } from 'react';
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="text-xs font-mono text-muted uppercase tracking-wider">
            Intellectual & Cultural Archive
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
            Media, Books & Formula 1
          </h1>
          <p className="text-xs text-muted mt-1">
            Permanent repository for literature quotations, research papers, F1 telemetry logs, anime, movies, and music.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 text-xs font-mono overflow-x-auto">
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
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-elevated text-primary border border-border font-semibold'
                : 'text-muted hover:text-foreground hover:bg-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Media Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-surface border border-border rounded-lg p-5 space-y-4 hover:border-primary/40 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-elevated border border-border text-primary uppercase font-semibold">
                  {item.categoryId}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted">
                    {item.startedAt.split('T')[0]}
                  </span>
                  <button
                    onClick={(e) => handleDeleteItem(item.id, e)}
                    className="p-1 rounded text-muted hover:text-danger hover:bg-elevated transition-colors"
                    title="Delete media record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-base text-foreground">{item.title}</h3>

              {item.description && (
                <p className="text-xs text-muted leading-relaxed">{item.description}</p>
              )}

              {/* Book Quotation Card */}
              {item.bookQuote && (
                <div className="bg-elevated border-l-2 border-primary p-3 rounded-r text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <Quote className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="italic text-foreground leading-relaxed">
                      &quot;{item.bookQuote.quote}&quot;
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-muted pl-6">
                    — {item.bookQuote.author}, {item.bookQuote.bookTitle}{' '}
                    {item.bookQuote.pageNumber ? `(p. ${item.bookQuote.pageNumber})` : ''}
                  </div>
                </div>
              )}

              {/* Media Details */}
              {item.mediaDetails && (
                <div className="bg-elevated border border-border rounded p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      {item.mediaDetails.type === 'music' ? (
                        <Headphones className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <Film className="w-3.5 h-3.5 text-warning" />
                      )}
                      <span>{item.mediaDetails.title}</span>
                    </div>
                    {item.mediaDetails.rating && (
                      <span className="text-[10px] font-mono text-warning font-semibold">
                        {item.mediaDetails.rating} / 5 Stars
                      </span>
                    )}
                  </div>
                  {item.mediaDetails.authorOrArtist && (
                    <div className="text-[11px] text-muted font-mono">
                      By {item.mediaDetails.authorOrArtist}
                    </div>
                  )}
                  {item.mediaDetails.url && (
                    <a
                      href={item.mediaDetails.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-mono text-primary flex items-center gap-1 hover:underline pt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open Resource
                    </a>
                  )}
                </div>
              )}

              {/* Attached Photos / Screenshots */}
              {item.attachments && item.attachments.length > 0 && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {item.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="relative rounded overflow-hidden h-28 border border-border bg-black"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={att.url}
                        alt={att.caption || 'Media asset'}
                        className="w-full h-full object-cover"
                      />
                      {att.caption && (
                        <div className="absolute bottom-0 inset-x-0 bg-black/80 px-2 py-0.5 text-[9px] text-foreground truncate">
                          {att.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border">
              {item.tags.map((t) => (
                <span key={t} className="text-[10px] font-mono text-muted/70 bg-elevated px-2 py-0.5 rounded border border-border/60">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
