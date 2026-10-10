'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Plus,
  BookOpen,
  Award,
  Sparkles,
  ChevronRight,
  Layers,
  FileText,
  CheckCircle,
  HelpCircle,
  Trash2,
  Upload,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { KnowledgeDocument, Quiz, Flashcard } from '../../lib/types';
import { generateLearningMaterials } from '../../lib/ai-service';
import QuizModal from '../../components/QuizModal';
import FlashcardViewer from '../../components/FlashcardViewer';

export default function KnowledgeVaultPage() {
  const [docs, setDocs] = useState<KnowledgeDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // New Lesson State
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Active Quiz or Flashcard Mode
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeDeck, setActiveDeck] = useState<Flashcard[] | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cleanName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    if (!newTitle) setNewTitle(cleanName);

    const lowerName = file.name.toLowerCase();
    if (lowerName.includes('business')) setNewTopic('Business');
    else if (lowerName.includes('econ')) setNewTopic('Economics');
    else if (lowerName.includes('code') || lowerName.includes('cs') || lowerName.includes('tech')) setNewTopic('Computer Science');
    else if (lowerName.includes('math')) setNewTopic('Mathematics');
    else if (!newTopic) setNewTopic('General Study');

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setNewContent(content);
    };
    reader.readAsText(file);
  };

  const handleDeleteDoc = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Permanently remove this knowledge document and its generated quizzes?')) {
      storage.deleteKnowledgeDoc(id);
      const remaining = storage.getKnowledgeDocs();
      setDocs(remaining);
      setSelectedDoc(remaining.length > 0 ? remaining[0] : null);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('regret_data_updated'));
      }
    }
  };

  const loadDocs = useCallback(() => {
    const list = storage.getKnowledgeDocs();
    setDocs(list);
    setSelectedDoc((prev) => (prev && list.some((d) => d.id === prev.id) ? prev : (list.length > 0 ? list[0] : null)));
  }, []);

  useEffect(() => {
    loadDocs();
    const handleUpdate = () => loadDocs();
    window.addEventListener('regret_data_updated', handleUpdate);
    return () => window.removeEventListener('regret_data_updated', handleUpdate);
  }, [loadDocs]);

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsGenerating(true);
    const apiKey = storage.getApiKey();

    try {
      const generated = await generateLearningMaterials(newTopic || newTitle, newContent, apiKey);
      const docId = `doc-${Date.now()}`;

      // Convert generated flashcards to full Flashcard entities
      const flashcardEntities: Flashcard[] = generated.flashcards.map((f, i) => ({
        id: `fc-${Date.now()}-${i}`,
        topicId: docId,
        front: f.front,
        back: f.back,
        category: f.category || newTopic || 'Study',
        nextReviewAt: new Date().toISOString().split('T')[0],
        intervalDays: 1,
        easeFactor: 2.5,
        repetitions: 0,
      }));

      // Save flashcards into storage
      flashcardEntities.forEach((card) => storage.addFlashcard(card));

      const quizEntity: Quiz = {
        id: `quiz-${Date.now()}`,
        title: `${newTitle} — AI Assessment`,
        lessonId: docId,
        questions: generated.quizzes,
      };

      const newDoc: KnowledgeDocument = {
        id: docId,
        title: newTitle.trim(),
        topic: newTopic.trim() || 'General',
        categoryId: 'knowledge',
        sourceType: 'lesson',
        rawContent: newContent.trim(),
        aiSummary: generated.summary,
        keyTakeaways: generated.keyTakeaways,
        quizzes: [quizEntity],
        flashcardIds: flashcardEntities.map((c) => c.id),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      storage.addKnowledgeDoc(newDoc);
      loadDocs();
      setSelectedDoc(newDoc);
      setShowNewModal(false);
      setNewTitle('');
      setNewTopic('');
      setNewContent('');
    } catch (err) {
      console.error(err);
      alert('Error generating learning materials.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLaunchDeck = (doc: KnowledgeDocument) => {
    const allCards = storage.getFlashcards();
    const docCards = allCards.filter(
      (c) => c.topicId === doc.id || doc.flashcardIds.includes(c.id)
    );
    if (docCards.length === 0) {
      alert('No flashcards found for this topic.');
      return;
    }
    setActiveDeck(docCards);
  };

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <div className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Cognitive Repository & AI Tutor
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Knowledge Vault
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl font-sans">
            Ingest lectures, textbooks, business topics, and research papers. Generate AI quizzes and spaced repetition flashcards.
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="btn-primary text-xs py-2.5 px-5 self-start sm:self-auto gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Ingest New Lesson</span>
        </button>
      </div>

      {/* Main Bento Layout: List of documents on left, Selected Document details on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Lesson Directory */}
        <div className="space-y-3">
          <div className="text-xs font-display font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
            Synthesized Lessons ({docs.length})
          </div>

          <div className="space-y-2.5">
            {docs.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <motion.div
                  key={doc.id}
                  whileHover={{ y: -2 }}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-lime/15 dark:bg-lime/10 border-lime text-slate-950 dark:text-white shadow-sm ring-1 ring-lime/40'
                      : 'bg-white dark:bg-[#131A29] border-slate-200/80 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/[0.12] shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-display font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.08] text-slate-800 dark:text-slate-200">
                      {doc.topic}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {doc.createdAt.split('T')[0]}
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white mt-2 line-clamp-1">
                    {doc.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-2.5 text-[11px] font-display text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
                      <HelpCircle className="w-3.5 h-3.5" />
                      {doc.quizzes.length} Quizzes
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-iris">
                      <Layers className="w-3.5 h-3.5" />
                      {doc.flashcardIds.length} Cards
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Column (2 cols): Selected Lesson In-Depth Viewer */}
        <div className="lg:col-span-2 space-y-4">
          {selectedDoc ? (
            <div className="bento-card p-6 md:p-7 space-y-5 bg-white dark:bg-[#131A29]">
              {/* Document Header & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-display font-bold px-2.5 py-0.5 rounded-full bg-lime text-slate-950">
                      {selectedDoc.topic}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Source: {selectedDoc.sourceType}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 dark:text-white mt-2">
                    {selectedDoc.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLaunchDeck(selectedDoc)}
                    className="btn-secondary text-xs py-2 px-4 gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5 text-iris" />
                    <span>Practice Cards</span>
                  </button>
                  {selectedDoc.quizzes.length > 0 && (
                    <button
                      onClick={() => setActiveQuiz(selectedDoc.quizzes[0])}
                      className="btn-primary text-xs py-2 px-4 gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Take AI Quiz</span>
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDeleteDoc(selectedDoc.id, e)}
                    className="p-2 rounded-full text-slate-400 hover:text-coral hover:bg-coral/10 transition-colors"
                    title="Delete Lesson Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* AI Summary Box (Soft Lilac Bento Inset) */}
              {selectedDoc.aiSummary && (
                <div className="rounded-2xl p-4 bg-purple-50/70 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-800/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-display font-bold text-iris">
                    <Sparkles className="w-4 h-4 text-iris" />
                    <span>AI Executive Summary</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-purple-200 leading-relaxed font-sans">
                    {selectedDoc.aiSummary}
                  </p>
                </div>
              )}

              {/* Key Takeaways (Soft Mint Inset) */}
              {selectedDoc.keyTakeaways && selectedDoc.keyTakeaways.length > 0 && (
                <div className="space-y-2.5">
                  <div className="text-xs font-display font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    Key Conceptual Takeaways
                  </div>
                  <ul className="space-y-2">
                    {selectedDoc.keyTakeaways.map((point, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5 bg-emerald-50/60 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/30"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-mint shrink-0 mt-0.5" />
                        <span className="font-sans leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Attached Quizzes */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-display font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Synthesized Assessment Modules
                </div>
                {selectedDoc.quizzes.map((q) => (
                  <div
                    key={q.id}
                    className="rounded-2xl p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-display font-bold text-slate-900 dark:text-white">
                        {q.title}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {q.questions.length} questions
                        {q.highestScore !== undefined ? ` · High Score: ${q.highestScore}%` : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveQuiz(q)}
                      className="btn-iris text-xs py-1.5 px-4"
                    >
                      Start Quiz
                    </button>
                  </div>
                ))}
              </div>

              {/* Original Raw Material Accordion */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                <div className="text-xs font-display font-bold text-slate-400 uppercase tracking-wider">
                  Raw Ingested Text / Notes
                </div>
                <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] p-4 max-h-48 overflow-y-auto text-xs text-slate-600 dark:text-slate-400 font-mono whitespace-pre-wrap leading-relaxed">
                  {selectedDoc.rawContent}
                </div>
              </div>
            </div>
          ) : (
            <div className="bento-card p-12 text-center text-slate-400 text-xs bg-white dark:bg-[#131A29]">
              Select a lesson from the directory or create a new lesson to begin AI extraction.
            </div>
          )}
        </div>
      </div>

      {/* Ingest New Lesson Modal */}
      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bento-card max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto bg-white dark:bg-[#131A29]"
            >
              <form onSubmit={handleCreateDocument}>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
                  <div>
                    <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                      Ingest Knowledge & Lessons
                    </h3>
                    <div className="text-[11px] text-slate-400">
                      AI will analyze notes, generate summaries, questions, and flashcards.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3.5 pt-3">
                  <div>
                    <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Lesson Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Modern Business Strategy & Competitive Moats"
                      className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Topic / Discipline
                    </label>
                    <input
                      type="text"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      placeholder="e.g. Business, Computer Science, Economics, Biology"
                      className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-display font-bold text-slate-700 dark:text-slate-300">
                        Lesson Notes / Ingested Content *
                      </label>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-secondary text-[11px] py-1 px-3 flex items-center gap-1.5"
                      >
                        <Upload className="w-3 h-3 text-iris" />
                        <span>Upload File</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.md,.json,.csv,.pdf,text/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                    <textarea
                      required
                      rows={8}
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Upload study file or paste lecture transcript, business case notes, textbook excerpts..."
                      className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime font-mono leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-white/[0.06] mt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    className="btn-secondary text-xs py-2 px-4"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="btn-primary text-xs py-2 px-5 flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{isGenerating ? 'Synthesizing with AI...' : 'Generate Learning Pipeline'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quiz Modal */}
      {activeQuiz && (
        <QuizModal
          quiz={activeQuiz}
          onClose={() => {
            setActiveQuiz(null);
            loadDocs();
          }}
          onComplete={() => {
            loadDocs();
          }}
        />
      )}

      {/* Flashcard Viewer Modal */}
      {activeDeck && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <FlashcardViewer
            flashcards={activeDeck}
            onClose={() => setActiveDeck(null)}
          />
        </div>
      )}
    </div>
  );
}
