'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Plus,
  Clock,
  Trash2,
  X,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { VocabularyWord, Flashcard } from '../../lib/types';
import { isCardDue } from '../../lib/sr-algorithm';
import FlashcardViewer from '../../components/FlashcardViewer';
import AnimatedCounter from '../../components/AnimatedCounter';

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
    setNewPartOfSpeech('noun');
    setNewDefinition('');
    setNewExample('');
    setNewSynonyms('');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('regret_data_updated'));
    }
  };

  // Filtered list
  const filteredWords = words.filter((w) => {
    if (filterLevel !== 'all' && w.masteryLevel !== filterLevel) return false;
    if (search.trim().length > 0) {
      const q = search.toLowerCase();
      return (
        w.word.toLowerCase().includes(q) ||
        w.definition.toLowerCase().includes(q) ||
        w.phonetic?.toLowerCase().includes(q) ||
        w.synonyms.some((s) => s.toLowerCase().includes(q))
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1E293B]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
            Lexical Engine & Spaced Repetition
          </div>
          <h1 className="text-2xl font-sans font-semibold tracking-tight text-[#F0F6FC] mt-0.5">
            Vocabulary Vault
          </h1>
          <p className="text-xs text-[#8B949E] mt-0.5">
            SuperMemo SM-2 spaced repetition for permanent retention of technical and domain lexicons.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => startReviewSession(false)}
            className="btn-primary text-xs py-1.5 px-3 gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Review Due ({dueCards.length})</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-secondary text-xs py-1.5 px-3 gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[#388BFD]" />
            <span>Add Term</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (Linear-style restrained panels) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="workspace-panel p-3.5 bg-[#111827] border border-[#1E293B]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
            Total Terms
          </div>
          <div className="text-2xl font-mono font-semibold text-[#F0F6FC] mt-1">
            <AnimatedCounter value={words.length} />
          </div>
        </div>

        <div className="workspace-panel p-3.5 bg-[#111827] border border-[#1E293B]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
            Due Today
          </div>
          <div className="text-2xl font-mono font-semibold text-[#388BFD] mt-1">
            <AnimatedCounter value={dueCards.length} />
          </div>
        </div>

        <div className="workspace-panel p-3.5 bg-[#111827] border border-[#1E293B]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
            In Review
          </div>
          <div className="text-2xl font-mono font-semibold text-[#8B949E] mt-1">
            <AnimatedCounter value={words.filter((w) => w.masteryLevel === 'reviewing').length} />
          </div>
        </div>

        <div className="workspace-panel p-3.5 bg-[#111827] border border-[#1E293B]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
            Mastered
          </div>
          <div className="text-2xl font-mono font-semibold text-[#238636] mt-1">
            <AnimatedCounter value={words.filter((w) => w.masteryLevel === 'mastered').length} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="workspace-panel p-3 bg-[#111827] border border-[#1E293B] flex flex-col sm:flex-row gap-2.5 items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vocabulary words, phonetics, or definitions..."
          className="w-full sm:flex-1 bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] placeholder:text-[#64748B] focus:outline-none focus:border-[#388BFD]"
        />

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto text-xs">
          {(['all', 'learning', 'reviewing', 'mastered'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-2.5 py-1 rounded-md capitalize text-xs font-medium transition-colors shrink-0 ${
                filterLevel === lvl
                  ? 'bg-[#161F2E] text-[#F0F6FC] border border-[#388BFD]/40'
                  : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161F2E]/60 border border-transparent'
              }`}
            >
              {lvl}
            </button>
          ))}
          <button
            onClick={() => startReviewSession(true)}
            className="btn-secondary text-[11px] py-1 px-2.5 ml-1 shrink-0"
          >
            Review All
          </button>
        </div>
      </div>

      {/* Vocabulary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredWords.map((word) => (
          <div
            key={word.id}
            className="workspace-panel p-4 space-y-3 bg-[#111827] border border-[#1E293B] flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-base text-[#F0F6FC] tracking-tight">
                    {word.word}
                  </h3>
                  {word.phonetic && (
                    <div className="text-[11px] font-mono text-[#64748B] mt-0.5">{word.phonetic}</div>
                  )}
                </div>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#161F2E] text-[#8B949E] border border-[#1E293B]">
                  {word.partOfSpeech}
                </span>
              </div>

              <p className="text-xs text-[#8B949E] leading-relaxed">
                {word.definition}
              </p>

              {word.exampleSentence && (
                <div className="bg-[#0D1117] border-l-2 border-[#388BFD] p-2.5 rounded-r text-xs text-[#F0F6FC] italic">
                  &quot;{word.exampleSentence}&quot;
                </div>
              )}
            </div>

            <div className="pt-2.5 border-t border-[#1E293B] flex items-center justify-between text-xs">
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-mono border ${
                  word.masteryLevel === 'mastered'
                    ? 'bg-[#238636]/10 text-[#238636] border-[#238636]/30'
                    : word.masteryLevel === 'reviewing'
                    ? 'bg-[#388BFD]/10 text-[#388BFD] border-[#388BFD]/30'
                    : 'bg-[#D29922]/10 text-[#D29922] border-[#D29922]/30'
                }`}
              >
                {word.masteryLevel}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#64748B] font-mono">
                  {word.addedAt.split('T')[0]}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteWord(word.id)}
                  className="p-1 rounded text-[#484F58] hover:text-[#F85149] transition-colors"
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
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-[#090D12]/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="workspace-panel max-w-lg w-full p-5 space-y-4 bg-[#111827] border border-[#1E293B]"
            >
              <form onSubmit={handleAddWord}>
                <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                  <h3 className="text-xs font-semibold text-[#F0F6FC] uppercase tracking-wider">
                    Add Vocabulary Term
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="text-[#64748B] hover:text-[#F0F6FC]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 pt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#8B949E] mb-1">
                        Word *
                      </label>
                      <input
                        type="text"
                        required
                        value={newWord}
                        onChange={(e) => setNewWord(e.target.value)}
                        placeholder="e.g. Ephemeral"
                        className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#8B949E] mb-1">
                        Phonetic
                      </label>
                      <input
                        type="text"
                        value={newPhonetic}
                        onChange={(e) => setNewPhonetic(e.target.value)}
                        placeholder="/ɪˈfem.ər.əl/"
                        className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8B949E] mb-1">
                      Part of Speech
                    </label>
                    <select
                      value={newPartOfSpeech}
                      onChange={(e) => setNewPartOfSpeech(e.target.value)}
                      className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                    >
                      <option value="noun">Noun</option>
                      <option value="adjective">Adjective</option>
                      <option value="verb">Verb</option>
                      <option value="adverb">Adverb</option>
                      <option value="concept">Concept</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8B949E] mb-1">
                      Definition *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={newDefinition}
                      onChange={(e) => setNewDefinition(e.target.value)}
                      placeholder="Concise definition..."
                      className="w-full bg-[#090D12] border border-[#1E293B] rounded-md p-2.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8B949E] mb-1">
                      Example Sentence
                    </label>
                    <input
                      type="text"
                      value={newExample}
                      onChange={(e) => setNewExample(e.target.value)}
                      placeholder="Example sentence demonstrating real-world usage"
                      className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8B949E] mb-1">
                      Synonyms (comma separated)
                    </label>
                    <input
                      type="text"
                      value={newSynonyms}
                      onChange={(e) => setNewSynonyms(e.target.value)}
                      placeholder="transitory, fleeting, evanescent"
                      className="w-full bg-[#090D12] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary text-xs py-1.5 px-3">
                      Add to Vault
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Flashcard Active Review Session */}
      {activeReviewCards && (
        <FlashcardViewer
          cards={activeReviewCards}
          onClose={() => setActiveReviewCards(null)}
          onComplete={() => {
            setActiveReviewCards(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
