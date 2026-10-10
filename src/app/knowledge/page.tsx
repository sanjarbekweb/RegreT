'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Layers,
  Award,
  Search,
  CheckCircle,
  HelpCircle,
  Trash2,
  Upload,
  X,
  FileText,
  Sparkles,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { KnowledgeDocument, Quiz, Flashcard } from '../../lib/types';
import { generateLearningMaterials } from '../../lib/ai-service';
import QuizModal from '../../components/QuizModal';
import FlashcardViewer from '../../components/FlashcardViewer';

export default function KnowledgeVaultPage() {
  const [docs, setDocs] = useState<KnowledgeDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const filteredDocs = docs.filter((d) => {
    if (searchQuery.trim().length === 0) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.topic.toLowerCase().includes(q) ||
      d.rawContent.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1E293B]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
            Obsidian Quiet Workspace
          </div>
          <h1 className="text-2xl font-sans font-semibold tracking-tight text-[#F0F6FC] mt-0.5">
            Knowledge Vault
          </h1>
          <p className="text-xs text-[#8B949E] mt-0.5">
            Quiet, text-focused workspace for research notes, books, ideas, saved resources, and conceptual links.
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="btn-primary text-xs py-1.5 px-3 self-start sm:self-auto gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Research Note</span>
        </button>
      </div>

      {/* Main Obsidian Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Quiet File Explorer */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vault notes..."
              className="w-full bg-[#090D12] border border-[#1E293B] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#F0F6FC] placeholder:text-[#64748B] focus:outline-none focus:border-[#388BFD]"
            />
          </div>

          <div className="workspace-panel divide-y divide-[#1E293B] bg-[#111827] border border-[#1E293B] overflow-hidden">
            {filteredDocs.length === 0 ? (
              <div className="p-4 text-xs text-[#64748B] text-center">
                No notes found.
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-3 cursor-pointer transition-colors text-left ${
                      isSelected
                        ? 'bg-[#161F2E] border-l-2 border-[#388BFD]'
                        : 'hover:bg-[#161F2E]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B]">
                      <span className="uppercase text-[#8B949E]">{doc.topic}</span>
                      <span>{doc.createdAt.split('T')[0]}</span>
                    </div>
                    <div className="text-xs font-medium text-[#F0F6FC] mt-1 line-clamp-1">
                      {doc.title}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-[#64748B]">
                      <span>{doc.quizzes.length} Quizzes</span>
                      <span>·</span>
                      <span>{doc.flashcardIds.length} Flashcards</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Columns: Quiet Obsidian Reading & Workspace Pane */}
        <div className="lg:col-span-2 space-y-4">
          {selectedDoc ? (
            <div className="workspace-panel p-6 space-y-5 bg-[#111827] border border-[#1E293B]">
              {/* Document Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#1E293B]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#161F2E] text-[#388BFD] border border-[#232E3E]">
                      {selectedDoc.topic}
                    </span>
                    <span className="text-[11px] font-mono text-[#64748B]">
                      Source: {selectedDoc.sourceType}
                    </span>
                    <span className="text-[11px] font-mono text-[#64748B]">
                      {selectedDoc.createdAt.split('T')[0]}
                    </span>
                  </div>
                  <h2 className="text-xl font-sans font-semibold text-[#F0F6FC] mt-1.5 tracking-tight">
                    {selectedDoc.title}
                  </h2>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleLaunchDeck(selectedDoc)}
                    className="btn-secondary text-xs py-1.5 px-2.5 gap-1.5"
                    title="Practice active flashcards"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#388BFD]" />
                    <span>Flashcards ({selectedDoc.flashcardIds.length})</span>
                  </button>
                  {selectedDoc.quizzes.length > 0 && (
                    <button
                      onClick={() => setActiveQuiz(selectedDoc.quizzes[0])}
                      className="btn-primary text-xs py-1.5 px-2.5 gap-1.5"
                      title="Launch AI quiz"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Take Quiz</span>
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDeleteDoc(selectedDoc.id, e)}
                    className="p-1.5 text-[#64748B] hover:text-[#F85149] rounded transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Obsidian-Style Quiet Callout: AI Summary */}
              {selectedDoc.aiSummary && (
                <div className="p-3.5 rounded-md bg-[#0D1117] border-l-2 border-[#388BFD] text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[#388BFD] font-mono text-[10px] uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Executive Synthesis</span>
                  </div>
                  <p className="text-[#8B949E] leading-relaxed">
                    {selectedDoc.aiSummary}
                  </p>
                </div>
              )}

              {/* Key Conceptual Takeaways */}
              {selectedDoc.keyTakeaways && selectedDoc.keyTakeaways.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
                    Key Concepts & Links
                  </div>
                  <ul className="space-y-1.5">
                    {selectedDoc.keyTakeaways.map((point, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-[#F0F6FC] flex items-start gap-2 p-2 rounded bg-[#0D1117] border border-[#1E293B]"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-[#238636] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quiet Text-focused Document Content */}
              <div className="space-y-2 pt-2 border-t border-[#1E293B]">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
                  Research Notes (Markdown Text)
                </div>
                <div className="p-4 rounded-md bg-[#090D12] border border-[#1E293B] text-xs text-[#F0F6FC] font-sans leading-relaxed whitespace-pre-wrap selection:bg-[#388BFD]/30">
                  {selectedDoc.rawContent}
                </div>
              </div>
            </div>
          ) : (
            <div className="workspace-panel p-12 text-center bg-[#111827] border border-[#1E293B] text-xs text-[#64748B]">
              Select a note from the file explorer or create a new research note.
            </div>
          )}
        </div>
      </div>

      {/* New Research Note Modal */}
      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 z-50 bg-[#090D12]/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="workspace-panel max-w-lg w-full p-5 space-y-4 bg-[#111827] border border-[#1E293B]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                <h3 className="text-xs font-semibold text-[#F0F6FC] uppercase tracking-wider">
                  Ingest Research Note to Vault
                </h3>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="text-[#64748B] hover:text-[#F0F6FC]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateDocument} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#8B949E] mb-1">
                    Note Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Distributed Systems & Raft Consensus"
                    className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8B949E] mb-1">
                    Domain / Topic
                  </label>
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="e.g. Computer Science, Business Strategy, Economics"
                    className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-[#8B949E]">
                      Raw Research Text / Lecture Notes
                    </label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] font-mono text-[#388BFD] hover:underline flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload text file</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.md,.json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  <textarea
                    rows={6}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Paste notes, lecture transcripts, book summaries, or paper notes here..."
                    className="w-full bg-[#090D12] border border-[#1E293B] rounded-md p-3 text-xs text-[#F0F6FC] font-sans leading-relaxed focus:outline-none focus:border-[#388BFD]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    {isGenerating ? 'Synthesizing...' : 'Save & Synthesize'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quiz Modal */}
      {activeQuiz && (
        <QuizModal quiz={activeQuiz} onClose={() => setActiveQuiz(null)} />
      )}

      {/* Flashcard Viewer */}
      {activeDeck && (
        <FlashcardViewer
          cards={activeDeck}
          onClose={() => setActiveDeck(null)}
          onComplete={() => {
            setActiveDeck(null);
            loadDocs();
          }}
        />
      )}
    </div>
  );
}
