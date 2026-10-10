'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Upload,
  Plus,
  Trash2,
  Clock,
  Play,
  Pause,
  Square,
  FolderGit2,
  ExternalLink,
  BookOpen,
  Film,
  Check,
  Video,
  X,
  Sparkles,
} from 'lucide-react';
import { INITIAL_CATEGORIES, INITIAL_PROJECTS, storage } from '../../lib/storage';
import { Activity, CategoryId, Attachment } from '../../lib/types';
import { compressImage } from '../../lib/image-compress';

export default function QuickCapturePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId>('wakeup');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [projectId, setProjectId] = useState('');
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraError, setCameraError] = useState('');

  // Coding specific
  const [githubRepo, setGithubRepo] = useState('');
  const [githubCommit, setGithubCommit] = useState('');
  const [vercelUrl, setVercelUrl] = useState('');

  // Reading specific
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookQuote, setBookQuote] = useState('');
  const [bookPage, setBookPage] = useState('');

  // Media / Entertainment specific
  const [mediaType, setMediaType] = useState<'f1' | 'anime' | 'movie' | 'music' | 'paper' | 'scientific_video'>('f1');
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaArtist, setMediaArtist] = useState('');
  const [mediaRating, setMediaRating] = useState('5');

  // Attachments
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [captions, setCaptions] = useState<{ [id: string]: string }>({});

  // Inline timer
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerStartIso, setTimerStartIso] = useState<string | null>(null);

  // Handle timer tick
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const handleStartTimer = () => {
    setTimerStartIso(new Date().toISOString());
    setTimerRunning(true);
  };

  const handleStopTimer = () => {
    setTimerRunning(false);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startCamera = async () => {
    setCameraError('');
    setShowCameraModal(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        streamRef.current = stream;
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        }, 50);
      } else {
        cameraInputRef.current?.click();
        setShowCameraModal(false);
      }
    } catch (err: any) {
      console.warn('Direct camera stream unavailable, opening native camera picker:', err);
      setCameraError('Camera stream unavailable. Opening camera picker...');
      setShowCameraModal(false);
      cameraInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCameraModal(false);
  };

  const snapPhoto = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    const now = new Date();
    const newAtt: Attachment = {
      id: `att-${Date.now()}`,
      url: dataUrl,
      mimeType: 'image/jpeg',
      originalName: `selfie-${now.toISOString().replace(/[:.]/g, '-')}.jpg`,
      caption: categoryId === 'wakeup' ? `Wake-Up Verification ${now.toLocaleTimeString()}` : 'Live Snapshot',
      sizeBytes: dataUrl.length,
      createdAt: now.toISOString(),
    };

    setAttachments((prev) => [...prev, newAtt]);
    stopCamera();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const compressed = await compressImage(file, 1280, 0.8);
        const newAtt: Attachment = {
          id: `att-${Date.now()}-${i}`,
          url: compressed.dataUrl,
          mimeType: file.type || 'image/jpeg',
          originalName: file.name,
          caption: '',
          sizeBytes: compressed.sizeBytes,
          createdAt: new Date().toISOString(),
        };
        setAttachments((prev) => [...prev, newAtt]);
      } catch (err) {
        console.error('Failed to compress image:', err);
      }
    }
  };

  const handleRemoveAttachment = (attId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attId));
    setCaptions((prev) => {
      const copy = { ...prev };
      delete copy[attId];
      return copy;
    });
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const now = new Date();
    const startedAt = timerStartIso || now.toISOString();
    const endedAt = timerSeconds > 0 ? now.toISOString() : undefined;

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    const updatedAttachments = attachments.map((att) => ({
      ...att,
      caption: captions[att.id] || att.caption,
    }));

    const activity: Activity = {
      id: `act-${Date.now()}`,
      title: title.trim(),
      categoryId,
      description: description.trim() || undefined,
      startedAt,
      endedAt,
      tags: parsedTags,
      attachments: updatedAttachments,
      projectId: projectId || undefined,
      source: timerSeconds > 0 ? 'timer' : 'manual',
      githubRepo: categoryId === 'coding' && githubRepo ? githubRepo.trim() : undefined,
      githubCommit: categoryId === 'coding' && githubCommit ? githubCommit.trim() : undefined,
      vercelUrl: categoryId === 'coding' && vercelUrl ? vercelUrl.trim() : undefined,
      bookQuote:
        categoryId === 'reading' && bookTitle
          ? {
              bookTitle: bookTitle.trim(),
              author: bookAuthor.trim(),
              quote: bookQuote.trim(),
              pageNumber: bookPage ? parseInt(bookPage, 10) : undefined,
            }
          : undefined,
      mediaDetails:
        (categoryId === 'entertainment' || categoryId === 'media') && mediaTitle
          ? {
              type: mediaType,
              title: mediaTitle.trim(),
              authorOrArtist: mediaArtist.trim() || undefined,
              rating: parseInt(mediaRating, 10) || 5,
            }
          : undefined,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    storage.addActivity(activity);
    window.dispatchEvent(new Event('regret_data_updated'));
    router.push('/timeline');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-7">
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
        <div className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Capture Hub
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-slate-900 dark:text-white mt-1">
          Record Life Activity
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl font-sans">
          Permanent chronological logging for morning routine, coding sessions, lessons, readings, and media.
        </p>
      </div>

      <form onSubmit={handleSaveActivity} className="space-y-6">
        {/* Category Selector Grid (Bento squircle pills) */}
        <div className="space-y-2.5">
          <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Select Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {INITIAL_CATEGORIES.map((cat) => {
              const isSelected = categoryId === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`p-3 rounded-2xl border text-left transition-all text-xs flex flex-col justify-between ${
                    isSelected
                      ? 'bg-lime text-slate-950 font-bold border-lime shadow-sm ring-2 ring-lime/40'
                      : 'bg-white dark:bg-[#131A29] border-slate-200/80 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-display font-bold">{cat.name}</span>
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: isSelected ? '#0F172A' : cat.color }}
                    />
                  </div>
                  <span className={`text-[10px] mt-1.5 line-clamp-1 ${isSelected ? 'text-slate-950/80 font-medium' : 'text-slate-400'}`}>
                    {cat.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title & Description Bento Card */}
        <div className="bento-card p-6 space-y-4 bg-white dark:bg-[#131A29]">
          <div>
            <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
              Activity Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                categoryId === 'personal'
                  ? 'e.g. Woke up at 06:15, Hydration protocol'
                  : categoryId === 'coding'
                  ? 'e.g. Built Personal OS timeline & database persistence'
                  : categoryId === 'reading'
                  ? 'e.g. Read Chapter 4 of Deep Work'
                  : categoryId === 'entertainment'
                  ? 'e.g. F1 Monza Grand Prix Qualifying'
                  : 'e.g. Completed Business strategy case homework'
              }
              className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
              Notes & Reflections
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Document the exact details, metrics, key thoughts, or reflections..."
              className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime resize-none font-sans leading-relaxed"
            />
          </div>

          {/* Tags & Project Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="routine, discipline, focus"
                className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
              />
            </div>
            <div>
              <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                Attach to Project (Optional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime font-display font-semibold"
              >
                <option value="">None / General Log</option>
                {INITIAL_PROJECTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Category Contexts */}
        {/* If Coding */}
        {categoryId === 'coding' && (
          <div className="bento-card p-6 space-y-4 bg-white dark:bg-[#131A29]">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-white/[0.06] text-xs font-display font-bold text-iris">
              <FolderGit2 className="w-4 h-4" />
              <span>Developer Integration Context</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                  GitHub Repo
                </label>
                <input
                  type="text"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  placeholder="sanjarbekweb/regret-os"
                  className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
                />
              </div>
              <div>
                <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Commit Message / Hash
                </label>
                <input
                  type="text"
                  value={githubCommit}
                  onChange={(e) => setGithubCommit(e.target.value)}
                  placeholder="feat: add interactive contribution calendar"
                  className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                Vercel Deployment URL
              </label>
              <input
                type="text"
                value={vercelUrl}
                onChange={(e) => setVercelUrl(e.target.value)}
                placeholder="https://regret-os.vercel.app"
                className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
              />
            </div>
          </div>
        )}

        {/* If Reading */}
        {categoryId === 'reading' && (
          <div className="bento-card p-6 space-y-4 bg-white dark:bg-[#131A29]">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-white/[0.06] text-xs font-display font-bold text-iris">
              <BookOpen className="w-4 h-4" />
              <span>Book Quote & Literature Context</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Book / Paper Title
                </label>
                <input
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="Deep Work"
                  className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
                />
              </div>
              <div>
                <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Author
                </label>
                <input
                  type="text"
                  value={bookAuthor}
                  onChange={(e) => setBookAuthor(e.target.value)}
                  placeholder="Cal Newport"
                  className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                Key Quotation / Excerpt
              </label>
              <textarea
                rows={2}
                value={bookQuote}
                onChange={(e) => setBookQuote(e.target.value)}
                placeholder="Paste verbatim quote from book or upload photo of the page below..."
                className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime resize-none"
              />
            </div>
            <div className="w-32">
              <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                Page Number
              </label>
              <input
                type="number"
                value={bookPage}
                onChange={(e) => setBookPage(e.target.value)}
                placeholder="42"
                className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
              />
            </div>
          </div>
        )}

        {/* If Entertainment or Media */}
        {(categoryId === 'entertainment' || categoryId === 'media') && (
          <div className="bento-card p-6 space-y-4 bg-white dark:bg-[#131A29]">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-white/[0.06] text-xs font-display font-bold text-coral">
              <Film className="w-4 h-4" />
              <span>Media & Entertainment Details</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Media Type
                </label>
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
                >
                  <option value="f1">Formula 1</option>
                  <option value="anime">Anime</option>
                  <option value="movie">Movie / Cinema</option>
                  <option value="scientific_video">Scientific Video</option>
                  <option value="music">Music Track</option>
                  <option value="paper">Research Paper</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={mediaTitle}
                  onChange={(e) => setMediaTitle(e.target.value)}
                  placeholder="e.g. Monza Grand Prix 2026 or Interstellar Soundtrack"
                  className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
                />
              </div>
            </div>
          </div>
        )}

        {/* Live Session Timer */}
        <div className="bento-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#131A29]">
          <div>
            <div className="text-xs font-display font-bold text-slate-400 uppercase tracking-wider">
              Session Duration
            </div>
            <div className="text-3xl font-display font-black text-slate-900 dark:text-white mt-1">
              {formatTimer(timerSeconds)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {timerRunning ? 'Session active and recording...' : 'Optional live duration logging'}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {!timerRunning ? (
              <button
                type="button"
                onClick={handleStartTimer}
                className="btn-secondary text-xs py-2 px-4 gap-2"
              >
                <Play className="w-3.5 h-3.5 text-emerald-600" />
                <span>Start Timer</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopTimer}
                className="btn-secondary text-xs py-2 px-4 gap-2"
              >
                <Pause className="w-3.5 h-3.5 text-amber-500" />
                <span>Pause</span>
              </button>
            )}
            {timerSeconds > 0 && (
              <button
                type="button"
                onClick={() => {
                  setTimerRunning(false);
                  setTimerSeconds(0);
                  setTimerStartIso(null);
                }}
                className="text-xs text-coral hover:underline px-2 font-display font-bold"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Photos & Multi-Media Upload */}
        <div className="bento-card p-6 space-y-4 bg-white dark:bg-[#131A29]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
            <div>
              <div className="text-xs font-display font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Permanent Proof & Visuals
              </div>
              <div className="text-[11px] text-slate-400">
                Selfies, coding screenshots, textbook pages, whiteboard sketches
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={startCamera}
                className="btn-primary text-xs py-1.5 px-3.5 gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Camera</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary text-xs py-1.5 px-3.5 gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-iris" />
                <span>Upload</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {cameraError && (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs">
              {cameraError}
            </div>
          )}

          {/* Photo Preview Grid */}
          {attachments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {attachments.map((att) => (
                <div key={att.id} className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-2.5 space-y-2 bg-slate-50 dark:bg-white/[0.02]">
                  <div className="relative rounded-xl overflow-hidden h-36 bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={att.url}
                      alt={att.originalName}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/80 text-coral hover:bg-slate-950"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={captions[att.id] || ''}
                    onChange={(e) => setCaptions({ ...captions, [att.id]: e.target.value })}
                    placeholder="Add caption (e.g. 06:15 selfie, terminal output)..."
                    className="w-full bg-white dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] rounded-lg px-2.5 py-1 text-[11px] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 text-center space-y-2.5">
              <Camera className="w-8 h-8 text-slate-300 mx-auto" />
              <div>
                <div className="text-xs font-display font-bold text-slate-700 dark:text-slate-300">
                  {categoryId === 'wakeup'
                    ? 'Take your wake-up selfie verification'
                    : 'Capture camera proof or upload screenshot'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Stored permanently in your life operating system
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary text-xs py-2.5 px-5"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary text-xs py-2.5 px-6 gap-2">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Save to Permanent Life OS</span>
          </button>
        </div>
      </form>

      {/* Live Camera Snapshot Modal */}
      <AnimatePresence>
        {showCameraModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bento-card max-w-md w-full p-5 space-y-4 bg-white dark:bg-[#131A29]"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-2.5">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-iris" />
                  <span className="text-xs font-display font-bold text-slate-900 dark:text-white">
                    {categoryId === 'wakeup' ? 'Wake-Up Selfie Verification' : 'Camera Snapshot'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden aspect-video bg-black flex items-center justify-center border border-slate-200 dark:border-white/[0.08]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400 font-mono">
                  {categoryId === 'wakeup' ? 'Verify wake-up timestamp' : 'Frame your capture'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={snapPhoto}
                    className="btn-primary text-xs py-1.5 px-4 gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Snap Photo</span>
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
