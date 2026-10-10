'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  RotateCw,
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
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <div className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Lexical Engine & Spaced Repetition
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Vocabulary Vault
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl font-sans">
            SuperMemo SM-2 spaced repetition for permanent retention of domain terminology and advanced lexicons.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => startReviewSession(false)}
            className="btn-primary text-xs py-2.5 px-5 gap-2"
          >
            <Clock className="w-4 h-4 stroke-[2.5]" />
            <span>Review Due ({dueCards.length})</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-secondary text-xs py-2.5 px-5 gap-2"
          >
            <Plus className="w-4 h-4 text-iris" />
            <span>Add Word</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (Tinted Squircle Bento Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Words - Lilac */}
        <div className="rounded-[24px] p-4 bg-purple-50/70 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-800/30">
          <div className="text-[11px] font-display font-bold uppercase tracking-wider text-purple-800 dark:text-purple-400">
            Total Terms
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-purple-950 dark:text-purple-100 mt-1.5">
            <AnimatedCounter value={words.length} />
          </div>
        </div>

        {/* Due Today - Coral */}
        <div className="rounded-[24px] p-4 bg-orange-50/70 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-800/30">
          <div className="text-[11px] font-display font-bold uppercase tracking-wider text-orange-800 dark:text-orange-400">
            Due Today
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-orange-950 dark:text-orange-100 mt-1.5">
            <AnimatedCounter value={dueCards.length} />
          </div>
        </div>

        {/* In Review - Royal Iris */}
        <div className="rounded-[24px] p-4 bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-800/30">
          <div className="text-[11px] font-display font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-400">
            In Review
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-indigo-950 dark:text-indigo-100 mt-1.5">
            <AnimatedCounter value={words.filter((w) => w.masteryLevel === 'reviewing').length} />
          </div>
        </div>

        {/* Mastered - Mint */}
        <div className="rounded-[24px] p-4 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/30">
          <div className="text-[11px] font-display font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
            Mastered
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-emerald-950 dark:text-emerald-100 mt-1.5">
            <AnimatedCounter value={words.filter((w) => w.masteryLevel === 'mastered').length} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar (Bento style) */}
      <div className="bento-card p-3.5 bg-white dark:bg-[#131A29] flex flex-col sm:flex-row gap-3 items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vocabulary words, phonetics, or definitions..."
          className="w-full sm:flex-1 bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-full px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
        />

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-display">
          {(['all', 'learning', 'reviewing', 'mastered'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3.5 py-1.5 rounded-full capitalize font-bold transition-all shrink-0 ${
                filterLevel === lvl
                  ? 'bg-lime text-slate-950 shadow-sm border border-black/5'
                  : 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
          <button
            onClick={() => startReviewSession(true)}
            className="btn-secondary text-[11px] py-1.5 px-3 ml-1 shrink-0"
          >
            Review All
          </button>
        </div>
      </div>

      {/* Vocabulary Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredWords.map((word) => (
          <motion.div
            key={word.id}
            whileHover={{ y: -3 }}
            className="bento-card p-5 space-y-3.5 bg-white dark:bg-[#131A29] flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                    {word.word}
                  </h3>
                  {word.phonetic && (
                    <div className="text-xs font-mono text-slate-400 mt-0.5">{word.phonetic}</div>
                  )}
                </div>
                <span className="text-[10px] font-display font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-300 uppercase">
                  {word.partOfSpeech}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                {word.definition}
              </p>

              {word.exampleSentence && (
                <div className="bg-purple-50 dark:bg-purple-950/20 border-l-3 border-iris p-2.5 rounded-r-xl text-xs text-purple-900 dark:text-purple-300 italic font-serif">
                  &quot;{word.exampleSentence}&quot;
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-display">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                  word.masteryLevel === 'mastered'
                    ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                    : word.masteryLevel === 'reviewing'
                    ? 'bg-iris/10 text-iris'
                    : 'bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300'
                }`}
              >
                {word.masteryLevel}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">
                  {word.addedAt.split('T')[0]}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteWord(word.id)}
                  className="p-1 rounded-full text-slate-400 hover:text-coral hover:bg-coral/10 transition-colors"
                  title="Delete Word"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Word Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bento-card max-w-lg w-full p-6 space-y-4 bg-white dark:bg-[#131A29]"
            >
              <form onSubmit={handleAddWord}>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
                  <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                    Add New Vocabulary Term
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3.5 pt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Word *
                      </label>
                      <input
                        type="text"
                        required
                        value={newWord}
                        onChange={(e) => setNewWord(e.target.value)}
                        placeholder="e.g. Ephemeral"
                        className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Part of Speech
                      </label>
                      <select
                        value={newPartOfSpeech}
                        onChange={(e) => setNewPartOfSpeech(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
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
                    <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Phonetic (Optional)
                    </label>
                    <input
                      type="text"
                      value={newPhonetic}
                      onChange={(e) => setNewPhonetic(e.target.value)}
                      placeholder="/ɪˈfem.ər.əl/"
                      className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Definition *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={newDefinition}
                      onChange={(e) => setNewDefinition(e.target.value)}
                      placeholder="Lasting for a very short time; transitory; fleeting."
                      className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Example Sentence
                    </label>
                    <textarea
                      rows={2}
                      value={newExample}
                      onChange={(e) => setNewExample(e.target.value)}
                      placeholder="Fame in digital media is notoriously ephemeral."
                      className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-display font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Synonyms (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={newSynonyms}
                      onChange={(e) => setNewSynonyms(e.target.value)}
                      placeholder="transient, fleeting, momentary"
                      className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-white/[0.06] mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-secondary text-xs py-2 px-4"
                  >
                    Close
                  </button>
                  <button type="submit" className="btn-primary text-xs py-2 px-5">
                    Save Term & Flashcard
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      {activeReviewCards && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
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
