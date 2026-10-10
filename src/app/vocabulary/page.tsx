'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Volume2,
  CheckCircle,
  Clock,
  Sparkles,
  BookOpen,
  Filter,
  Trash2,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { VocabularyWord, Flashcard } from '../../lib/types';
import { isCardDue } from '../../lib/sr-algorithm';
import FlashcardViewer from '../../components/FlashcardViewer';

export default function VocabularyPage() {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState<'all' | 'learning' | 'reviewing' | 'mastered'>('all');

  // New Word Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newPhonetic, setNewPhonetic] = useState('');
  const [newPartOfSpeech, setNewPartOfSpeech] = useState('noun');
  const [newDefinition, setNewDefinition] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newSynonyms, setNewSynonyms] = useState('');

  // Active Review Session
  const [activeReviewCards, setActiveReviewCards] = useState<Flashcard[] | null>(null);

  const loadData = () => {
    setWords(storage.getVocabulary());
    setFlashcards(storage.getFlashcards());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('regret_data_updated', handleUpdate);
    return () => window.removeEventListener('regret_data_updated', handleUpdate);
  }, []);

  const handleDeleteWord = (id: string) => {
    if (confirm('Permanently remove this vocabulary word and its flashcard?')) {
      storage.deleteVocabularyWord(id);
      loadData();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('regret_data_updated'));
      }
    }
  };

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newDefinition.trim()) return;

    const wordId = `v-${Date.now()}`;
    const cardId = `fc-v-${Date.now()}`;

    // Create corresponding Flashcard with SM-2 defaults
    const card: Flashcard = {
      id: cardId,
      vocabularyId: wordId,
      front: `${newWord.trim()} (${newPartOfSpeech})`,
      back: `${newDefinition.trim()}\n\nExample: "${newExample.trim()}"`,
      category: 'Vocabulary',
      nextReviewAt: new Date().toISOString().split('T')[0],
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 0,
    };

    const wordItem: VocabularyWord = {
      id: wordId,
      word: newWord.trim(),
      phonetic: newPhonetic.trim() || undefined,
      partOfSpeech: newPartOfSpeech,
      definition: newDefinition.trim(),
      exampleSentence: newExample.trim(),
      synonyms: newSynonyms
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
      masteryLevel: 'learning',
      flashcardId: cardId,
      addedAt: new Date().toISOString(),
    };

    storage.addFlashcard(card);
    storage.addVocabularyWord(wordItem);

    loadData();
    setShowAddModal(false);
    setNewWord('');
    setNewPhonetic('');
    setNewDefinition('');
    setNewExample('');
    setNewSynonyms('');
  };

  // Filter words
  const filteredWords = words.filter((w) => {
    if (filterLevel !== 'all' && w.masteryLevel !== filterLevel) return false;
    if (search.trim().length > 0) {
      const q = search.toLowerCase();
      return (
        w.word.toLowerCase().includes(q) ||
        w.definition.toLowerCase().includes(q) ||
        w.exampleSentence.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate cards due today
  const vocabCards = flashcards.filter((c) => c.vocabularyId);
  const dueCards = vocabCards.filter((c) => isCardDue(c));

  const startReviewSession = (all: boolean = false) => {
    const deck = all ? vocabCards : dueCards;
    if (deck.length === 0) {
      alert('No cards due for review today. You can select "Review All Cards".');
      return;
    }
    setActiveReviewCards(deck);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="text-xs font-mono text-muted uppercase tracking-wider">
            Lexical Engine & Spaced Repetition
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
            Vocabulary Memorizer
          </h1>
          <p className="text-xs text-muted mt-1">
            SuperMemo SM-2 spaced repetition for rapid vocabulary acquisition and long-term retention.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => startReviewSession(false)}
            className="btn-primary text-xs py-2 px-4"
          >
            <Clock className="w-4 h-4" />
            <span>Review Due ({dueCards.length})</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-secondary text-xs py-2 px-4"
          >
            <Plus className="w-4 h-4" />
            <span>Add Word</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface border border-border rounded-lg p-3.5">
          <div className="text-[11px] font-mono text-muted">Total Words</div>
          <div className="text-xl font-bold font-mono text-foreground mt-1">{words.length}</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-3.5">
          <div className="text-[11px] font-mono text-muted">Due Today</div>
          <div className="text-xl font-bold font-mono text-warning mt-1">{dueCards.length}</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-3.5">
          <div className="text-[11px] font-mono text-muted">In Review</div>
          <div className="text-xl font-bold font-mono text-primary mt-1">
            {words.filter((w) => w.masteryLevel === 'reviewing').length}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-3.5">
          <div className="text-[11px] font-mono text-muted">Mastered</div>
          <div className="text-xl font-bold font-mono text-success mt-1">
            {words.filter((w) => w.masteryLevel === 'mastered').length}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-surface border border-border rounded-lg p-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vocabulary words or definitions..."
          className="flex-1 bg-elevated border border-border rounded px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
        />

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          {(['all', 'learning', 'reviewing', 'mastered'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-2.5 py-1 rounded capitalize transition-colors ${
                filterLevel === lvl
                  ? 'bg-primary text-white border border-primary'
                  : 'bg-elevated text-muted hover:text-foreground border border-border'
              }`}
            >
              {lvl}
            </button>
          ))}
          <button
            onClick={() => startReviewSession(true)}
            className="btn-secondary text-[11px] py-1 px-2.5 ml-2"
          >
            Review All
          </button>
        </div>
      </div>

      {/* Vocabulary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWords.map((word) => (
          <div
            key={word.id}
            className="bg-surface border border-border rounded-lg p-4 space-y-3 hover:border-primary/40 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-base text-foreground tracking-tight">
                    {word.word}
                  </h3>
                  {word.phonetic && (
                    <div className="text-xs font-mono text-muted">{word.phonetic}</div>
                  )}
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-elevated border border-border text-primary uppercase">
                  {word.partOfSpeech}
                </span>
              </div>

              <p className="text-xs text-foreground/90 leading-relaxed">{word.definition}</p>

              {word.exampleSentence && (
                <div className="bg-elevated border-l-2 border-primary/50 p-2 rounded-r text-[11px] text-muted italic">
                  "{word.exampleSentence}"
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] font-mono">
              <span
                className={`px-2 py-0.5 rounded border text-[10px] uppercase font-semibold ${
                  word.masteryLevel === 'mastered'
                    ? 'bg-success/20 border-success/40 text-success'
                    : word.masteryLevel === 'reviewing'
                    ? 'bg-primary/20 border-primary/40 text-primary'
                    : 'bg-warning/20 border-warning/40 text-warning'
                }`}
              >
                {word.masteryLevel}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-muted/70">
                  Added {word.addedAt.split('T')[0]}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteWord(word.id)}
                  className="p-1 rounded text-muted hover:text-danger hover:bg-elevated transition-colors"
                  title="Delete Word"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Word Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddWord}
            className="bg-surface border border-border rounded-lg max-w-lg w-full p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-semibold text-sm text-foreground">Add New Vocabulary Term</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-muted hover:text-foreground text-xs"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-muted mb-1">Word *</label>
                  <input
                    type="text"
                    required
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    placeholder="e.g. Ephemeral"
                    className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted mb-1">Part of Speech</label>
                  <select
                    value={newPartOfSpeech}
                    onChange={(e) => setNewPartOfSpeech(e.target.value)}
                    className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="noun">noun</option>
                    <option value="verb">verb</option>
                    <option value="adjective">adjective</option>
                    <option value="adverb">adverb</option>
                    <option value="idiom">idiom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1">
                  Phonetic (Optional)
                </label>
                <input
                  type="text"
                  value={newPhonetic}
                  onChange={(e) => setNewPhonetic(e.target.value)}
                  placeholder="/ɪˈfem.ər.əl/"
                  className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1">Definition *</label>
                <textarea
                  required
                  rows={2}
                  value={newDefinition}
                  onChange={(e) => setNewDefinition(e.target.value)}
                  placeholder="Lasting for a very short time; transitory; fleeting."
                  className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1">
                  Example Sentence
                </label>
                <textarea
                  rows={2}
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  placeholder="Fame in digital media is notoriously ephemeral."
                  className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1">
                  Synonyms (Comma separated)
                </label>
                <input
                  type="text"
                  value={newSynonyms}
                  onChange={(e) => setNewSynonyms(e.target.value)}
                  placeholder="transient, fleeting, momentary"
                  className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn-secondary text-xs"
              >
                Close
              </button>
              <button type="submit" className="btn-primary text-xs">
                Save Word & Flashcard
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Review Modal */}
      {activeReviewCards && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <FlashcardViewer
            flashcards={activeReviewCards}
            onClose={() => {
              setActiveReviewCards(null);
              loadData();
            }}
            onComplete={() => {
              loadData();
            }}
          />
        </div>
      )}
    </div>
  );
}
