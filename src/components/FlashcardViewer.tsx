'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flashcard } from '../lib/types';
import { calculateNextReview, calculateMasteryLevel, ReviewGrade } from '../lib/sr-algorithm';
import { storage } from '../lib/storage';
import { RotateCw, Check, Sparkles, BookOpen, ArrowRight } from 'lucide-react';

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  onComplete?: () => void;
  onClose?: () => void;
}

export default function FlashcardViewer({
  flashcards,
  onComplete,
  onClose,
}: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCards, setSessionCards] = useState(flashcards);
  const [finished, setFinished] = useState(false);

  if (sessionCards.length === 0 || finished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bento-card p-7 text-center space-y-5 max-w-lg mx-auto bg-white dark:bg-[#131A29]"
      >
        <div className="w-14 h-14 rounded-full bg-lime/20 border border-lime/50 text-slate-950 mx-auto flex items-center justify-center shadow-sm">
          <Check className="w-7 h-7 text-slate-900 dark:text-lime stroke-[3]" />
        </div>
        <div>
          <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
            Review Session Complete!
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            All pending spaced repetition flashcards for this deck have been scheduled with SM-2.
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          {onClose && (
            <button onClick={onClose} className="btn-secondary text-xs">
              Back to Overview
            </button>
          )}
          <button
            onClick={() => {
              setSessionCards(flashcards);
              setCurrentIndex(0);
              setIsFlipped(false);
              setFinished(false);
            }}
            className="btn-primary text-xs"
          >
            Review Deck Again
          </button>
        </div>
      </motion.div>
    );
  }

  const currentCard = sessionCards[currentIndex];

  const handleGrade = (grade: ReviewGrade) => {
    const updatedMetrics = calculateNextReview(currentCard, grade);
    const updatedCard: Flashcard = {
      ...currentCard,
      ...updatedMetrics,
      lastReviewedAt: new Date().toISOString().split('T')[0],
    };

    // Save to persistent storage
    storage.updateFlashcard(updatedCard);

    // Update associated VocabularyWord mastery level if this flashcard represents vocabulary
    if (currentCard.vocabularyId || currentCard.category === 'Vocabulary') {
      const vocabList = storage.getVocabulary();
      const word = vocabList.find(
        (w) => w.id === currentCard.vocabularyId || w.flashcardId === currentCard.id
      );
      if (word) {
        const newLevel = calculateMasteryLevel(
          word.masteryLevel,
          updatedMetrics.repetitions,
          updatedMetrics.intervalDays,
          grade
        );
        if (newLevel !== word.masteryLevel) {
          storage.updateVocabularyWord({
            ...word,
            masteryLevel: newLevel,
          });
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('regret_data_updated'));
    }

    // Advance to next card
    if (currentIndex + 1 < sessionCards.length) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setFinished(true);
      if (onComplete) onComplete();
    }
  };

  return (
    <div className="bento-card p-6 md:p-7 max-w-xl w-full mx-auto space-y-5 bg-white dark:bg-[#131A29]">
      {/* Deck Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-iris/10 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-iris" />
          </div>
          <span className="text-xs font-display font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            {currentCard.category || 'Spaced Repetition'}
          </span>
        </div>
        <div className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-300">
          Card {currentIndex + 1} of {sessionCards.length}
        </div>
      </div>

      {/* Flip Card Stage */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        onClick={() => setIsFlipped(!isFlipped)}
        className="min-h-[240px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-7 flex flex-col justify-between cursor-pointer hover:border-lime/60 transition-all select-none shadow-sm"
      >
        <div className="flex items-center justify-between text-[11px] font-display font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <span>{isFlipped ? 'Answer & Explanation' : 'Question / Term'}</span>
          <span className="text-[10px] text-iris">Click to flip</span>
        </div>

        <div className="my-auto text-center py-6">
          <div className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-white whitespace-pre-wrap leading-relaxed">
            {isFlipped ? currentCard.back : currentCard.front}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-display font-medium">
          <RotateCw className="w-3.5 h-3.5 text-slate-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Tap to {isFlipped ? 'show prompt' : 'reveal solution'}</span>
        </div>
      </motion.div>

      {/* Grade Action Buttons */}
      {isFlipped ? (
        <div className="grid grid-cols-4 gap-2.5 pt-2">
          <button
            onClick={() => handleGrade(1)}
            className="flex flex-col items-center py-2.5 px-1.5 rounded-2xl bg-coral/10 hover:bg-coral/20 border border-coral/30 text-coral-dark dark:text-coral transition-colors font-display"
          >
            <span className="text-xs font-bold">Again</span>
            <span className="text-[10px] font-mono opacity-80">&lt; 1d</span>
          </button>
          <button
            onClick={() => handleGrade(3)}
            className="flex flex-col items-center py-2.5 px-1.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-400 transition-colors font-display"
          >
            <span className="text-xs font-bold">Hard</span>
            <span className="text-[10px] font-mono opacity-80">2d</span>
          </button>
          <button
            onClick={() => handleGrade(4)}
            className="flex flex-col items-center py-2.5 px-1.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 transition-colors font-display"
          >
            <span className="text-xs font-bold">Good</span>
            <span className="text-[10px] font-mono opacity-80">4d</span>
          </button>
          <button
            onClick={() => handleGrade(5)}
            className="flex flex-col items-center py-2.5 px-1.5 rounded-2xl bg-lime hover:bg-lime-hover text-slate-950 border border-black/5 transition-all font-display shadow-sm"
          >
            <span className="text-xs font-black">Easy</span>
            <span className="text-[10px] font-mono font-bold">7d</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsFlipped(true)}
          className="w-full btn-secondary text-xs py-3 rounded-full"
        >
          Reveal Solution
        </button>
      )}

      {onClose && (
        <div className="flex justify-end pt-1">
          <button onClick={onClose} className="text-xs font-display font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white">
            Exit Deck
          </button>
        </div>
      )}
    </div>
  );
}
