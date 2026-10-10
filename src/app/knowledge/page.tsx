'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="text-xs font-mono text-muted uppercase tracking-wider">
            Cognitive Repository & AI Tutor
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
            Knowledge Vault
          </h1>
          <p className="text-xs text-muted mt-1">
            Ingest lectures, textbooks, business topics, and research papers. Generate AI quizzes and spaced repetition flashcards.
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="btn-primary text-xs py-2 px-4 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ingest New Lesson</span>
        </button>
      </div>

      {/* Main Layout: List of documents on left, Selected Document details on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Lesson Directory */}
        <div className="space-y-3">
          <div className="text-xs font-mono text-muted uppercase px-1">
            Synthesized Lessons ({docs.length})
          </div>

          <div className="space-y-2">
            {docs.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-elevated border-primary text-foreground'
                      : 'bg-surface border-border text-muted hover:border-border/80 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-primary">
                      {doc.topic}
                    </span>
                    <span className="text-[10px] font-mono text-muted">
                      {doc.createdAt.split('T')[0]}
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs text-foreground mt-2 line-clamp-1">
                    {doc.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-muted">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-warning" />
                      {doc.quizzes.length} Quizzes
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-primary" />
                      {doc.flashcardIds.length} Flashcards
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (2 cols): Selected Lesson In-Depth Viewer */}
        <div className="lg:col-span-2 space-y-4">
          {selectedDoc ? (
            <div className="bg-surface border border-border rounded-lg p-5 space-y-5">
              {/* Document Header & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-elevated border border-border text-primary font-medium">
                      {selectedDoc.topic}
                    </span>
                    <span className="text-xs font-mono text-muted">
                      Source: {selectedDoc.sourceType}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-foreground mt-1.5">{selectedDoc.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLaunchDeck(selectedDoc)}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    <span>Practice Cards</span>
                  </button>
                  {selectedDoc.quizzes.length > 0 && (
                    <button
                      onClick={() => setActiveQuiz(selectedDoc.quizzes[0])}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Take AI Quiz</span>
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDeleteDoc(selectedDoc.id, e)}
                    className="p-1.5 rounded bg-elevated border border-danger/40 text-danger hover:bg-danger/20 transition-colors"
                    title="Delete Lesson Document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* AI Summary Box */}
              {selectedDoc.aiSummary && (
                <div className="bg-elevated border border-border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary font-mono">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Executive Summary</span>
                  </div>
                  <p className="text-xs text-foreground/90 leading-relaxed">
                    {selectedDoc.aiSummary}
                  </p>
                </div>
              )}

              {/* Key Takeaways */}
              {selectedDoc.keyTakeaways && selectedDoc.keyTakeaways.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted uppercase font-mono">
                    Key Conceptual Takeaways
                  </div>
                  <ul className="space-y-1.5">
                    {selectedDoc.keyTakeaways.map((point, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-foreground flex items-start gap-2 bg-elevated/40 p-2 rounded border border-border/40"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Attached Quizzes */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold text-muted uppercase font-mono">
                  Synthesized Assessment Modules
                </div>
                {selectedDoc.quizzes.map((q) => (
                  <div
                    key={q.id}
                    className="bg-elevated border border-border rounded p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-foreground">{q.title}</div>
                      <div className="text-[11px] font-mono text-muted mt-0.5">
                        {q.questions.length} questions
                        {q.highestScore !== undefined ? ` · High Score: ${q.highestScore}%` : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveQuiz(q)}
                      className="btn-secondary text-xs py-1 px-3"
                    >
                      Start Quiz
                    </button>
                  </div>
                ))}
              </div>

              {/* Original Raw Material Accordion */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="text-xs font-semibold text-muted uppercase font-mono">
                  Raw Ingested Text / Notes
                </div>
                <div className="bg-elevated/50 border border-border rounded p-3 max-h-48 overflow-y-auto text-xs text-muted font-mono whitespace-pre-wrap">
                  {selectedDoc.rawContent}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-lg p-12 text-center text-muted text-xs">
              Select a lesson from the directory or create a new lesson to begin AI extraction.
            </div>
          )}
        </div>
      </div>

      {/* Ingest New Lesson Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateDocument}
            className="bg-surface border border-border rounded-lg max-w-xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-semibold text-sm text-foreground">Ingest Knowledge & Lessons</h3>
                <div className="text-[11px] text-muted">
                  AI will analyze your notes, generate summaries, questions, and flashcards.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-muted hover:text-foreground text-xs"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-muted mb-1">Lesson Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Modern Business Strategy & Competitive Moats"
                  className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1">
                  Topic / Discipline
                </label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g. Business, Computer Science, Economics, Biology"
                  className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono text-muted">
                    Lesson Notes / Ingested Content *
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1.5"
                  >
                    <Upload className="w-3 h-3 text-primary" />
                    <span>Upload Study File</span>
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
                  className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="btn-secondary text-xs"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isGenerating}
                className="btn-primary text-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGenerating ? 'Synthesizing with AI...' : 'Generate Learning Pipeline'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

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
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <FlashcardViewer
            flashcards={activeDeck}
            onClose={() => setActiveDeck(null)}
          />
        </div>
      )}
    </div>
  );
}
