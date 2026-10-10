'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Camera,
  Upload,
  Plus,
  Clock,
  FolderGit2,
  BookOpen,
  Image as ImageIcon,
  Check,
  ExternalLink,
} from 'lucide-react';
import { storage, INITIAL_CATEGORIES } from '../lib/storage';
import { Activity, Attachment, CategoryId } from '../lib/types';
import { compressImage } from '../lib/image-compress';

interface QuickCaptureEventDetail {
  dateStr?: string;
  defaultCategory?: CategoryId;
}

export default function GlobalQuickCaptureModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryId>('coding');
  const [dateStr, setDateStr] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [bookQuote, setBookQuote] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<QuickCaptureEventDetail>;
      if (customEvent.detail?.dateStr) {
        setDateStr(customEvent.detail.dateStr);
      } else {
        setDateStr(new Date().toISOString().split('T')[0]);
      }
      if (customEvent.detail?.defaultCategory) {
        setCategory(customEvent.detail.defaultCategory);
      }
      setIsOpen(true);
    };

    window.addEventListener('regret_open_quick_capture', handleOpen);
    return () => window.removeEventListener('regret_open_quick_capture', handleOpen);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newAtts: Attachment[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressed = await compressImage(file, 1280, 0.82);
        newAtts.push({
          id: `att-qc-${Date.now()}-${i}`,
          url: compressed.dataUrl,
          originalName: file.name,
          mimeType: file.type || 'image/jpeg',
          sizeBytes: compressed.sizeBytes,
          caption: title ? `Recorded with ${title}` : 'Activity capture',
          createdAt: new Date().toISOString(),
        });
      }
      setAttachments((prev) => [...prev, ...newAtts]);
    } catch (err) {
      console.error('Failed to process image capture:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    const now = new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    const startHour = now.getHours();
    const startMin = now.getMinutes();

    const startDate = new Date(Date.UTC(year, month - 1, day, startHour, startMin, 0));
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    if (!tags.includes(category)) tags.push(category);

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      title: title.trim(),
      categoryId: category,
      description: description.trim() || undefined,
      startedAt: startDate.toISOString(),
      endedAt: endDate.toISOString(),
      tags,
      attachments,
      source: 'manual',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      githubRepo: githubRepo.trim() ? githubRepo.trim() : undefined,
      bookQuote:
        bookQuote.trim() && bookAuthor.trim()
          ? {
              quote: bookQuote.trim(),
              author: bookAuthor.trim(),
              bookTitle: title.trim(),
            }
          : undefined,
    };

    storage.addActivity(newActivity);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('regret_data_updated'));
    }

    // Reset and close
    setTitle('');
    setDescription('');
    setTagsInput('');
    setGithubRepo('');
    setBookQuote('');
    setBookAuthor('');
    setAttachments([]);
    setDurationMinutes(45);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const DURATION_PRESETS = [15, 30, 45, 60, 90, 120];

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#090D12]/80 backdrop-blur-sm flex items-center justify-center p-4 select-none"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            className="workspace-panel max-w-lg w-full max-h-[92vh] overflow-y-auto bg-[#111827] border border-[#1E293B] shadow-2xl rounded-lg p-5 space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#161F2E] border border-[#232E3E] text-[#388BFD] flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[#F0F6FC] uppercase tracking-wider font-sans">
                    Quick Capture Activity
                  </h3>
                  <span className="text-[10px] text-[#64748B] font-mono">
                    Record what happened · Available from every screen
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#64748B] hover:text-[#F0F6FC] p-1 rounded transition-colors"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              {/* Title */}
              <div>
                <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
                  What did you do? <span className="text-[#388BFD]">*</span>
                </label>
                <input
                  ref={titleInputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Deep coding sprint, Read Chapter 4, 5km tempo run"
                  className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-2 text-xs text-[#F0F6FC] placeholder:text-[#64748B] focus:outline-none focus:border-[#388BFD] focus:ring-1 focus:ring-[#388BFD]"
                  required
                />
              </div>

              {/* Category Picker */}
              <div>
                <label className="block text-[11px] font-medium text-[#8B949E] mb-1.5">
                  Category Track
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {INITIAL_CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`px-2 py-1.5 rounded-md text-[11px] font-medium transition-all text-left truncate flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#161F2E] text-[#F0F6FC] border border-[#388BFD]'
                            : 'bg-[#090D12] text-[#8B949E] hover:text-[#F0F6FC] border border-[#1E293B]'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-[#388BFD] shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date & Duration Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
                    Recorded Date
                  </label>
                  <input
                    type="date"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
                    Duration ({durationMinutes}m)
                  </label>
                  <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                    {DURATION_PRESETS.map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setDurationMinutes(mins)}
                        className={`px-2 py-1 rounded text-[10px] font-mono shrink-0 transition-colors ${
                          durationMinutes === mins
                            ? 'bg-[#388BFD] text-white'
                            : 'bg-[#090D12] text-[#8B949E] hover:text-[#F0F6FC] border border-[#1E293B]'
                        }`}
                      >
                        {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes / Description */}
              <div>
                <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
                  Notes / Observations (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key accomplishments, thoughts, or reflections..."
                  rows={2}
                  className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] placeholder:text-[#64748B] focus:outline-none focus:border-[#388BFD] resize-none"
                />
              </div>

              {/* Category-Specific Fields */}
              {category === 'coding' && (
                <div>
                  <label className="block text-[11px] font-medium text-[#8B949E] mb-1 flex items-center gap-1">
                    <FolderGit2 className="w-3 h-3 text-[#388BFD]" />
                    <span>GitHub Repository (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    placeholder="e.g. username/repo"
                    className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] placeholder:text-[#64748B] focus:outline-none focus:border-[#388BFD]"
                  />
                </div>
              )}

              {category === 'reading' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
                      Author
                    </label>
                    <input
                      type="text"
                      value={bookAuthor}
                      onChange={(e) => setBookAuthor(e.target.value)}
                      placeholder="e.g. Cal Newport"
                      className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-2.5 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
                      Key Excerpt / Quote
                    </label>
                    <input
                      type="text"
                      value={bookQuote}
                      onChange={(e) => setBookQuote(e.target.value)}
                      placeholder="Notable passage..."
                      className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-2.5 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                    />
                  </div>
                </div>
              )}

              {/* Photo Proof / Image Attachment */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-medium text-[#8B949E] flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-[#388BFD]" />
                    <span>Attach Life Photos (Apple Photos archive)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="text-[10px] font-mono text-[#388BFD] hover:underline flex items-center gap-1"
                  >
                    <Upload className="w-2.5 h-2.5" />
                    <span>Upload Image</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {attachments.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto p-1.5 bg-[#090D12] border border-[#1E293B] rounded-md">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="relative w-14 h-14 rounded border border-[#1E293B] overflow-hidden bg-black shrink-0 group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={att.url}
                          alt={att.caption || 'Thumbnail'}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-red-600 text-white rounded p-0.5"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-[#1E293B]">
                <Link
                  href="/capture"
                  onClick={() => setIsOpen(false)}
                  className="text-[11px] text-[#64748B] hover:text-[#388BFD] transition-colors flex items-center gap-1"
                >
                  <span>Open Full Capture Studio</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-xs py-1.5 px-3 gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Record</span>
                    <kbd className="hidden sm:inline text-[9px] font-mono opacity-60">⌘↵</kbd>
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
