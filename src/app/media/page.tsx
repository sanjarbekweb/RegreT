'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  BookOpen,
  Film,
  Search,
  Calendar,
  ExternalLink,
  Quote,
  Clock,
  ArrowRight,
  X,
  Trash2,
  Maximize2,
  FolderGit2,
} from 'lucide-react';
import { storage, INITIAL_CATEGORIES } from '../../lib/storage';
import { Activity, Attachment, CategoryId } from '../../lib/types';
import {
  ActivityPhotoItem,
  extractPhotosFromActivities,
  groupItemsByDate,
} from '../../lib/analytics';

type PhotoItem = ActivityPhotoItem;

export default function MediaArchivePage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<'photos' | 'quotes' | 'media_logs'>('photos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [selectedPhotoItem, setSelectedPhotoItem] = useState<PhotoItem | null>(null);

  const loadData = () => {
    setActivities(storage.getActivities());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('regret_data_updated', handleUpdate);
    return () => window.removeEventListener('regret_data_updated', handleUpdate);
  }, []);

  // Extract all photos attached to activities
  const allPhotos = useMemo<PhotoItem[]>(() => {
    return extractPhotosFromActivities(activities);
  }, [activities]);

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    return allPhotos.filter((item) => {
      if (selectedCategory !== 'all' && item.activity.categoryId !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const inCaption = item.attachment.caption?.toLowerCase().includes(q);
        const inActTitle = item.activity.title.toLowerCase().includes(q);
        const inActDesc = item.activity.description?.toLowerCase().includes(q);
        const inTags = item.activity.tags.some((t) => t.toLowerCase().includes(q));
        if (!inCaption && !inActTitle && !inActDesc && !inTags) return false;
      }
      return true;
    });
  }, [allPhotos, selectedCategory, searchQuery]);

  // Group photos by date (Apple Photos logic)
  const photosByDate = useMemo(() => {
    return groupItemsByDate(filteredPhotos);
  }, [filteredPhotos]);

  const sortedPhotoDates = Object.keys(photosByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // Books / Quotes
  const quoteItems = useMemo(() => {
    return activities.filter((a) => a.bookQuote);
  }, [activities]);

  // Media logs (F1, music, cinema, scientific videos)
  const mediaLogItems = useMemo(() => {
    return activities.filter((a) => a.mediaDetails);
  }, [activities]);

  const formatDateHeader = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00Z');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1E293B]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
            Apple Photos Visual Logic
          </div>
          <h1 className="text-2xl font-sans font-semibold tracking-tight text-[#F0F6FC] mt-0.5">
            Media Archive
          </h1>
          <p className="text-xs text-[#8B949E] mt-0.5">
            Image-first personal life archive. Every photo is permanently attached to the activity where it happened.
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 p-0.5 rounded-md bg-[#111827] border border-[#1E293B] text-xs">
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'photos'
                ? 'bg-[#161F2E] text-[#F0F6FC] border border-[#232E3E]'
                : 'text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#388BFD]" />
            <span>Photo Library ({allPhotos.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'quotes'
                ? 'bg-[#161F2E] text-[#F0F6FC] border border-[#232E3E]'
                : 'text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            <Quote className="w-3.5 h-3.5 text-[#8B949E]" />
            <span>Quotes ({quoteItems.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('media_logs')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'media_logs'
                ? 'bg-[#161F2E] text-[#F0F6FC] border border-[#232E3E]'
                : 'text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-[#8B949E]" />
            <span>F1 & Logs ({mediaLogItems.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="workspace-panel p-3.5 space-y-3 bg-[#111827] border border-[#1E293B]">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search photos by caption, title, or activity notes..."
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
      </div>

      {/* Primary Apple Photos View: Image-first Grid Grouped by Date */}
      {activeTab === 'photos' && (
        <div className="space-y-7">
          {sortedPhotoDates.length === 0 ? (
            <div className="workspace-panel p-8 text-center bg-[#111827] border border-[#1E293B] text-xs text-[#8B949E] space-y-2">
              <p>No photos attached to activities match your filter.</p>
              <Link href="/capture" className="inline-flex btn-primary text-xs py-1.5 px-3">
                Take or Attach a Photo
              </Link>
            </div>
          ) : (
            sortedPhotoDates.map((dateStr) => {
              const items = photosByDate[dateStr];

              return (
                <div key={dateStr} className="space-y-2.5">
                  {/* Date Header (Apple Photos style) */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#388BFD]" />
                      <span className="text-xs font-semibold text-[#F0F6FC]">
                        {formatDateHeader(dateStr)}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#64748B]">
                      {items.length} {items.length === 1 ? 'photo' : 'photos'}
                    </span>
                  </div>

                  {/* Photos Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                    {items.map((item) => (
                      <div
                        key={item.attachment.id}
                        onClick={() => setSelectedPhotoItem(item)}
                        className="group relative aspect-square rounded-md overflow-hidden bg-[#090D12] border border-[#1E293B] cursor-pointer"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.attachment.url}
                          alt={item.attachment.caption || item.activity.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />

                        {/* Subtle bottom gradient on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#090D12]/90 via-[#090D12]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                          <span className="text-[10px] font-mono text-[#388BFD] uppercase">
                            {item.activity.categoryId}
                          </span>
                          <span className="text-xs font-medium text-white line-clamp-1">
                            {item.attachment.caption || item.activity.title}
                          </span>
                          <span className="text-[9px] font-mono text-[#8B949E]">
                            {item.activity.startedAt.split('T')[1]?.slice(0, 5)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Secondary Tab: Quotes */}
      {activeTab === 'quotes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quoteItems.map((act) => (
            <div
              key={act.id}
              className="workspace-panel p-4 space-y-2 bg-[#111827] border border-[#1E293B]"
            >
              <div className="flex items-center justify-between text-xs text-[#8B949E]">
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#161F2E] text-[#388BFD] border border-[#232E3E]">
                  Reading
                </span>
                <span className="font-mono text-[10px]">{act.startedAt.split('T')[0]}</span>
              </div>

              {act.bookQuote && (
                <div className="space-y-1.5 pt-1">
                  <blockquote className="italic text-xs text-[#F0F6FC] leading-relaxed">
                    &quot;{act.bookQuote.quote}&quot;
                  </blockquote>
                  <div className="text-[11px] text-[#8B949E]">
                    — {act.bookQuote.author}, <span className="text-[#F0F6FC]">{act.bookQuote.bookTitle}</span>
                    {act.bookQuote.pageNumber && ` (p. ${act.bookQuote.pageNumber})`}
                  </div>
                </div>
              )}

              {act.description && (
                <p className="text-[11px] text-[#64748B] pt-1 border-t border-[#1E293B]">
                  {act.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Secondary Tab: Media & Telemetry Logs */}
      {activeTab === 'media_logs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {mediaLogItems.map((act) => (
            <div
              key={act.id}
              className="workspace-panel p-4 space-y-2.5 bg-[#111827] border border-[#1E293B]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#161F2E] text-[#388BFD] border border-[#232E3E]">
                  {act.mediaDetails?.type || act.categoryId}
                </span>
                <span className="text-[10px] font-mono text-[#8B949E]">
                  {act.startedAt.split('T')[0]}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-[#F0F6FC]">
                  {act.mediaDetails?.title || act.title}
                </h3>
                {act.mediaDetails?.authorOrArtist && (
                  <p className="text-[11px] text-[#8B949E]">
                    {act.mediaDetails.authorOrArtist}
                  </p>
                )}
              </div>

              {act.description && (
                <p className="text-[11px] text-[#8B949E] leading-relaxed">
                  {act.description}
                </p>
              )}

              {act.mediaDetails?.url && (
                <a
                  href={act.mediaDetails.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#388BFD] hover:underline flex items-center gap-1 pt-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open Resource</span>
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Apple Photos Detail View Modal */}
      <AnimatePresence>
        {selectedPhotoItem && (
          <div className="fixed inset-0 z-50 bg-[#090D12]/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="workspace-panel max-w-3xl w-full max-h-[92vh] overflow-y-auto bg-[#111827] border border-[#1E293B] rounded-lg overflow-hidden flex flex-col md:flex-row"
            >
              {/* Photo Display (Left/Top) */}
              <div className="md:w-3/5 bg-black flex items-center justify-center p-2 relative min-h-[300px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedPhotoItem.attachment.url}
                  alt={selectedPhotoItem.attachment.caption || 'Detail'}
                  className="max-h-[70vh] w-auto max-w-full object-contain"
                />
              </div>

              {/* Activity Context Panel (Right/Bottom) */}
              <div className="md:w-2/5 p-5 flex flex-col justify-between space-y-4 border-t md:border-t-0 md:border-l border-[#1E293B]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#161F2E] text-[#388BFD] border border-[#232E3E]">
                      {selectedPhotoItem.activity.categoryId}
                    </span>
                    <button
                      onClick={() => setSelectedPhotoItem(null)}
                      className="text-[#64748B] hover:text-[#F0F6FC] p-1 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Photo Caption */}
                  {selectedPhotoItem.attachment.caption && (
                    <div>
                      <div className="text-[10px] font-mono text-[#64748B] uppercase">Caption</div>
                      <p className="text-xs font-medium text-[#F0F6FC] mt-0.5">
                        {selectedPhotoItem.attachment.caption}
                      </p>
                    </div>
                  )}

                  {/* Attached Activity Card */}
                  <div className="p-3 rounded-md bg-[#0D1117] border border-[#1E293B] space-y-1.5">
                    <div className="text-[10px] font-mono text-[#64748B] uppercase">
                      Attached Activity Record
                    </div>
                    <div className="text-xs font-semibold text-[#F0F6FC]">
                      {selectedPhotoItem.activity.title}
                    </div>
                    <div className="text-[11px] font-mono text-[#8B949E] flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-[#388BFD]" />
                      <span>{selectedPhotoItem.activity.startedAt.replace('T', ' ').slice(0, 16)}</span>
                    </div>
                    {selectedPhotoItem.activity.description && (
                      <p className="text-[11px] text-[#8B949E] line-clamp-3 leading-relaxed mt-1">
                        {selectedPhotoItem.activity.description}
                      </p>
                    )}
                  </div>

                  {/* Photo File Metadata */}
                  <div className="space-y-1 text-[10px] font-mono text-[#64748B]">
                    <div>File: {selectedPhotoItem.attachment.originalName}</div>
                    <div>Recorded: {selectedPhotoItem.dateStr}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href={`/timeline?id=${selectedPhotoItem.activity.id}`}
                    className="w-full btn-primary text-xs py-1.5 px-3 justify-center gap-1.5"
                  >
                    <span>View in Life Timeline</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                  <button
                    onClick={() => setSelectedPhotoItem(null)}
                    className="w-full btn-secondary text-xs py-1.5 px-3"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
