'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { INITIAL_CATEGORIES, INITIAL_PROJECTS, storage } from '../../lib/storage';
import { Activity, CategoryId, Attachment } from '../../lib/types';

export default function QuickCapturePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId>('personal');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [projectId, setProjectId] = useState('');

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

  // Handle file / photo upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        const newAtt: Attachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          url: dataUrl,
          originalName: file.name,
          mimeType: file.type || 'image/jpeg',
          sizeBytes: file.size,
          createdAt: new Date().toISOString(),
        };
        setAttachments((prev) => [...prev, newAtt]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-3">
        <div className="text-xs font-mono text-muted uppercase tracking-wider">Capture Hub</div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1">
          Record Life Activity
        </h1>
        <p className="text-xs text-muted mt-1">
          Permanent chronological logging for morning routine, coding sessions, lessons, readings, and media.
        </p>
      </div>

      <form onSubmit={handleSaveActivity} className="space-y-5">
        {/* Category Selector Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-mono text-muted uppercase">Select Category</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {INITIAL_CATEGORIES.map((cat) => {
              const isSelected = categoryId === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`p-2.5 rounded border text-left transition-all text-xs flex flex-col justify-between ${
                    isSelected
                      ? 'bg-elevated border-primary text-foreground ring-1 ring-primary'
                      : 'bg-surface border-border text-muted hover:border-border/80 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{cat.name}</span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  </div>
                  <span className="text-[10px] text-muted/70 mt-1 line-clamp-1">{cat.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title & Description */}
        <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-xs font-mono text-muted uppercase mb-1">
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
              className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-muted uppercase mb-1">
              Notes & Comments
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Document the exact details, metrics, key thoughts, or reflections..."
              className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Tags & Project Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-muted uppercase mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="routine, discipline, focus"
                className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted uppercase mb-1">
                Attach to Project (Optional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
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
          <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-border text-xs font-semibold text-primary font-mono">
              <FolderGit2 className="w-4 h-4" />
              <span>Developer Integration Context</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-muted mb-1">GitHub Repo</label>
                <input
                  type="text"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  placeholder="sanjarbekweb/regret-os"
                  className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-muted mb-1">Commit Message / Hash</label>
                <input
                  type="text"
                  value={githubCommit}
                  onChange={(e) => setGithubCommit(e.target.value)}
                  placeholder="feat: add interactive contribution calendar"
                  className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono text-muted mb-1">Vercel Deployment URL</label>
              <input
                type="text"
                value={vercelUrl}
                onChange={(e) => setVercelUrl(e.target.value)}
                placeholder="https://regret-os.vercel.app"
                className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {/* If Reading */}
        {categoryId === 'reading' && (
          <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-border text-xs font-semibold text-primary font-mono">
              <BookOpen className="w-4 h-4" />
              <span>Book Quote & Literature Context</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-muted mb-1">Book / Paper Title</label>
                <input
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="Deep Work"
                  className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-muted mb-1">Author</label>
                <input
                  type="text"
                  value={bookAuthor}
                  onChange={(e) => setBookAuthor(e.target.value)}
                  placeholder="Cal Newport"
                  className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono text-muted mb-1">Key Quotation / Excerpt</label>
              <textarea
                rows={2}
                value={bookQuote}
                onChange={(e) => setBookQuote(e.target.value)}
                placeholder="Paste verbatim quote from book or upload photo of the page below..."
                className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary resize-none"
              />
            </div>
            <div className="w-32">
              <label className="block text-xs font-mono text-muted mb-1">Page Number</label>
              <input
                type="number"
                value={bookPage}
                onChange={(e) => setBookPage(e.target.value)}
                placeholder="42"
                className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {/* If Entertainment or Media */}
        {(categoryId === 'entertainment' || categoryId === 'media') && (
          <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-border text-xs font-semibold text-primary font-mono">
              <Film className="w-4 h-4" />
              <span>Media & Entertainment Details</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-mono text-muted mb-1">Media Type</label>
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as any)}
                  className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
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
                <label className="block text-xs font-mono text-muted mb-1">Title</label>
                <input
                  type="text"
                  value={mediaTitle}
                  onChange={(e) => setMediaTitle(e.target.value)}
                  placeholder="e.g. Monza Grand Prix 2026 or Interstellar Soundtrack"
                  className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* Live Session Timer */}
        <div className="bg-surface border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-muted uppercase">Session Timer</div>
            <div className="text-2xl font-bold font-mono text-primary mt-1">
              {formatTimer(timerSeconds)}
            </div>
            <div className="text-[11px] text-muted">
              {timerRunning ? 'Session active and recording...' : 'Optional live duration logging'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!timerRunning ? (
              <button
                type="button"
                onClick={handleStartTimer}
                className="btn-secondary text-xs"
              >
                <Play className="w-3.5 h-3.5 text-success" />
                <span>Start Session</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopTimer}
                className="btn-secondary text-xs"
              >
                <Pause className="w-3.5 h-3.5 text-warning" />
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
                className="text-xs text-danger hover:underline px-2"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Photos & Multi-Media Upload */}
        <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div>
              <div className="text-xs font-mono text-muted uppercase">Permanent Photos & Proof</div>
              <div className="text-[11px] text-muted">
                Selfies, coding screenshots, textbook pages, whiteboard sketches
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              <Upload className="w-3.5 h-3.5 text-primary" />
              <span>Add Images</span>
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

          {/* Photo Preview Grid */}
          {attachments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {attachments.map((att) => (
                <div key={att.id} className="bg-elevated border border-border rounded p-2 space-y-2">
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
                      className="absolute top-2 right-2 p-1.5 rounded bg-black/70 text-danger hover:bg-black"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={captions[att.id] || ''}
                    onChange={(e) => setCaptions({ ...captions, [att.id]: e.target.value })}
                    placeholder="Add caption (e.g. 06:15 selfie, terminal output)..."
                    className="w-full bg-surface border border-border rounded px-2.5 py-1 text-[11px] text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-6 text-center cursor-pointer transition-colors"
            >
              <Camera className="w-8 h-8 text-muted mx-auto mb-2" />
              <div className="text-xs font-medium text-foreground">
                Drop photos here or click to browse
              </div>
              <div className="text-[11px] text-muted mt-1">
                Waking up selfie, screen capture, workout proof, or book quotes
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary text-xs py-2 px-4"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary text-xs py-2 px-5">
            <Check className="w-4 h-4" />
            <span>Save to Permanent Life OS</span>
          </button>
        </div>
      </form>
    </div>
  );
}
