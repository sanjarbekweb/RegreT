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
  FolderGit2,
  BookOpen,
  Film,
  Check,
  X,
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
  const [categoryId, setCategoryId] = useState<CategoryId>('coding');
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
        const result = await compressImage(file, 1400, 0.82);
        const newAtt: Attachment = {
          id: `att-${Date.now()}-${i}`,
          url: result.dataUrl,
          mimeType: file.type || 'image/jpeg',
          originalName: file.name,
          caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          sizeBytes: result.sizeBytes,
          createdAt: new Date().toISOString(),
        };
        setAttachments((prev) => [...prev, newAtt]);
      } catch (err) {
        console.error('Image processing failed:', err);
      }
    }
  };

  const handleRemoveAttachment = (attId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attId));
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const now = new Date();
    let startedAt = now.toISOString();
    let endedAt: string | undefined = undefined;

    if (timerStartIso && timerSeconds > 0) {
      startedAt = timerStartIso;
      endedAt = now.toISOString();
    } else {
      endedAt = now.toISOString();
    }

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[#1E293B] pb-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
          Quick Capture Hub
        </div>
        <h1 className="text-2xl font-sans font-semibold tracking-tight text-[#F0F6FC] mt-0.5">
          Record Activity
        </h1>
        <p className="text-xs text-[#8B949E] mt-0.5">
          Effortless chronological logging with photo attachments and focus timer.
        </p>
      </div>

      <form onSubmit={handleSaveActivity} className="space-y-5">
        {/* Category Selector Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-[#8B949E] uppercase tracking-wider">
            Select Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {INITIAL_CATEGORIES.map((cat) => {
              const isSelected = categoryId === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`p-2.5 rounded-md border text-left transition-colors text-xs flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#161F2E] border-[#388BFD] text-[#F0F6FC] ring-1 ring-[#388BFD]/50'
                      : 'bg-[#111827] border-[#1E293B] text-[#8B949E] hover:text-[#F0F6FC] hover:border-[#334155]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium truncate">{cat.name}</span>
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: isSelected ? '#388BFD' : '#64748B' }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title & Notes Workspace Panel */}
        <div className="workspace-panel p-5 space-y-4 bg-[#111827] border border-[#1E293B]">
          <div>
            <label className="block text-xs font-medium text-[#8B949E] uppercase mb-1">
              Activity Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Built Linear dark foundation & Apple Photos archive"
              className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] placeholder:text-[#64748B] focus:outline-none focus:border-[#388BFD]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8B949E] uppercase mb-1">
              Notes & Reflections
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Document the exact details, metrics, key thoughts, or reflections..."
              className="w-full bg-[#090D12] border border-[#1E293B] rounded-md p-3 text-xs text-[#F0F6FC] placeholder:text-[#64748B] focus:outline-none focus:border-[#388BFD] resize-none leading-relaxed"
            />
          </div>

          {/* Tags & Project Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8B949E] uppercase mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="routine, discipline, focus"
                className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] placeholder:text-[#64748B] focus:outline-none focus:border-[#388BFD]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8B949E] uppercase mb-1">
                Attach to Project (Optional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
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
          <div className="workspace-panel p-5 space-y-3 bg-[#111827] border border-[#1E293B]">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1E293B] text-xs font-medium text-[#388BFD]">
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Developer Integration Context</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#8B949E] mb-1">
                  GitHub Repo
                </label>
                <input
                  type="text"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  placeholder="sanjarbekweb/regret-os"
                  className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8B949E] mb-1">
                  Commit Message / Hash
                </label>
                <input
                  type="text"
                  value={githubCommit}
                  onChange={(e) => setGithubCommit(e.target.value)}
                  placeholder="feat: add interactive contribution calendar"
                  className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8B949E] mb-1">
                Vercel Deployment URL
              </label>
              <input
                type="text"
                value={vercelUrl}
                onChange={(e) => setVercelUrl(e.target.value)}
                placeholder="https://regret-os.vercel.app"
                className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
              />
            </div>
          </div>
        )}

        {/* If Reading */}
        {categoryId === 'reading' && (
          <div className="workspace-panel p-5 space-y-3 bg-[#111827] border border-[#1E293B]">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1E293B] text-xs font-medium text-[#388BFD]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Book Quote & Literature Context</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#8B949E] mb-1">
                  Book / Paper Title
                </label>
                <input
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="Deep Work"
                  className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8B949E] mb-1">
                  Author
                </label>
                <input
                  type="text"
                  value={bookAuthor}
                  onChange={(e) => setBookAuthor(e.target.value)}
                  placeholder="Cal Newport"
                  className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8B949E] mb-1">
                Key Quotation / Excerpt
              </label>
              <textarea
                rows={2}
                value={bookQuote}
                onChange={(e) => setBookQuote(e.target.value)}
                placeholder="Paste verbatim quote from book or upload photo of the page below..."
                className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD] resize-none"
              />
            </div>
            <div className="w-32">
              <label className="block text-xs font-medium text-[#8B949E] mb-1">
                Page Number
              </label>
              <input
                type="number"
                value={bookPage}
                onChange={(e) => setBookPage(e.target.value)}
                placeholder="42"
                className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
              />
            </div>
          </div>
        )}

        {/* If Entertainment or Media */}
        {(categoryId === 'entertainment' || categoryId === 'media') && (
          <div className="workspace-panel p-5 space-y-3 bg-[#111827] border border-[#1E293B]">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1E293B] text-xs font-medium text-[#388BFD]">
              <Film className="w-3.5 h-3.5" />
              <span>Media & Entertainment Details</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#8B949E] mb-1">
                  Media Type
                </label>
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as any)}
                  className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
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
                <label className="block text-xs font-medium text-[#8B949E] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={mediaTitle}
                  onChange={(e) => setMediaTitle(e.target.value)}
                  placeholder="e.g. Monza Grand Prix 2026 or Interstellar Soundtrack"
                  className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Live Session Timer */}
        <div className="workspace-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111827] border border-[#1E293B]">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
              Focus Session Timer
            </div>
            <div className="text-2xl font-mono font-semibold text-[#F0F6FC] mt-0.5">
              {formatTimer(timerSeconds)}
            </div>
            <div className="text-[11px] text-[#8B949E]">
              {timerRunning ? 'Timer active and recording...' : 'Optional live duration logging'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!timerRunning ? (
              <button
                type="button"
                onClick={handleStartTimer}
                className="btn-secondary text-xs py-1.5 px-3 gap-1.5"
              >
                <Play className="w-3 h-3 text-[#238636]" />
                <span>Start Timer</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopTimer}
                className="btn-secondary text-xs py-1.5 px-3 gap-1.5"
              >
                <Pause className="w-3 h-3 text-[#D29922]" />
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
                className="text-xs text-[#F85149] hover:underline px-2"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Photos & Multi-Media Upload */}
        <div className="workspace-panel p-5 space-y-4 bg-[#111827] border border-[#1E293B]">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div>
              <div className="text-xs font-semibold text-[#F0F6FC]">
                Photo Archive Attachments
              </div>
              <div className="text-[11px] text-[#8B949E]">
                Photos attached to this activity will appear in your Apple Photos style Media Archive.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={startCamera}
                className="btn-primary text-xs py-1.5 px-3 gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Camera</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary text-xs py-1.5 px-3 gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
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
            <div className="p-3 rounded-md bg-[#D29922]/10 border border-[#D29922]/30 text-[#D29922] text-xs">
              {cameraError}
            </div>
          )}

          {/* Photo Preview Grid */}
          {attachments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {attachments.map((att) => (
                <div key={att.id} className="rounded-md border border-[#1E293B] p-2 space-y-2 bg-[#0D1117]">
                  <div className="relative rounded overflow-hidden h-36 bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={att.url}
                      alt={att.originalName}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="absolute top-2 right-2 p-1 rounded bg-[#090D12]/80 text-[#F85149] hover:bg-[#090D12]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={captions[att.id] || ''}
                    onChange={(e) => setCaptions({ ...captions, [att.id]: e.target.value })}
                    placeholder="Add caption for archive..."
                    className="w-full bg-[#090D12] border border-[#1E293B] rounded px-2.5 py-1 text-[11px] text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-[#1E293B] rounded-md p-6 text-center space-y-1.5">
              <Camera className="w-6 h-6 text-[#64748B] mx-auto" />
              <div className="text-xs font-medium text-[#8B949E]">
                No photos attached yet
              </div>
              <div className="text-[10px] text-[#64748B]">
                Snap proof from camera or upload screenshots
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary text-xs py-1.5 px-4 gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>Record Activity</span>
          </button>
        </div>
      </form>

      {/* Live Camera Snapshot Modal */}
      <AnimatePresence>
        {showCameraModal && (
          <div className="fixed inset-0 z-50 bg-[#090D12]/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="workspace-panel max-w-md w-full p-4 space-y-3 bg-[#111827] border border-[#1E293B]"
            >
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#388BFD]" />
                  <span className="text-xs font-medium text-[#F0F6FC]">
                    Camera Snapshot
                  </span>
                </div>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="text-[#64748B] hover:text-[#F0F6FC]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative rounded overflow-hidden aspect-video bg-black flex items-center justify-center border border-[#1E293B]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#64748B] font-mono">
                  Frame your shot
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="btn-secondary text-xs py-1 px-2.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={snapPhoto}
                    className="btn-primary text-xs py-1 px-3 gap-1"
                  >
                    <Camera className="w-3 h-3" />
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
