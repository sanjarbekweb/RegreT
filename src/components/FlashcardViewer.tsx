'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flashcard } from '../lib/types';
import { calculateNextReview, calculateMasteryLevel, ReviewGrade } from '../lib/sr-algorithm';
import { storage } from '../lib/storage';
import { RotateCw, Check, BookOpen, X } from 'lucide-react';

interface FlashcardViewerProps {
  cards?: Flashcard[];
  flashcards?: Flashcard[];
  onComplete?: () => void;
  onClose?: () => void;
}

export default function FlashcardViewer({
  cards,
  flashcards,
  onComplete,
  onClose,
}: FlashcardViewerProps) {
  const activeList = cards || flashcards || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCards, setSessionCards] = useState(activeList);
  const [finished, setFinished] = useState(false);

  if (sessionCards.length === 0 || finished) {
    return (
      <div className="workspace-panel p-6 text-center space-y-4 max-w-lg mx-auto bg-[#111827] border border-[#1E293B]">
        <div className="w-12 h-12 rounded-full bg-[#161F2E] border border-[#232E3E] text-[#238636] mx-auto flex items-center justify-center">
          <Check className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <h3 className="font-semibold text-base text-[#F0F6FC]">
            Review Session Complete
          </h3>
          <p className="text-xs text-[#8B949E] mt-0.5">
            All pending spaced repetition flashcards for this deck have been scheduled with SM-2.
          </p>
        </div>
        <div className="flex justify-center gap-2 pt-2">
          {onClose && (
            <button onClick={onClose} className="btn-secondary text-xs py-1.5 px-3">
              Exit
            </button>
          )}
          <button
            onClick={() => {
              setSessionCards(activeList);
              setCurrentIndex(0);
              setIsFlipped(false);
              setFinished(false);
            }}
            className="btn-primary text-xs py-1.5 px-3"
          >
            Review Again
          </button>
        </div>
      </div>
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
    <div className="workspace-panel p-5 max-w-xl w-full mx-auto space-y-4 bg-[#111827] border border-[#1E293B]">
      {/* Deck Header */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#161F2E] border border-[#232E3E] flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-[#388BFD]" />
          </div>
          <span className="text-xs font-medium text-[#F0F6FC] uppercase tracking-wider">
            {currentCard.category || 'Spaced Repetition'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161F2E] text-[#8B949E] border border-[#1E293B]">
            {currentIndex + 1} / {sessionCards.length}
          </span>
          {onClose && (
            <button onClick={onClose} className="text-[#64748B] hover:text-[#F0F6FC] p-1">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Flip Card Stage */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="min-h-[220px] bg-[#0D1117] border border-[#1E293B] hover:border-[#388BFD]/40 rounded-md p-6 flex flex-col justify-between cursor-pointer transition-colors select-none"
      >
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
          <span>{isFlipped ? 'Solution / Definition' : 'Prompt / Front'}</span>
          <span className="text-[#388BFD]">Click to flip</span>
        </div>

        <div className="my-auto text-center py-4">
          <div className="text-base sm:text-lg font-medium text-[#F0F6FC] whitespace-pre-wrap leading-relaxed">
            {isFlipped ? currentCard.back : currentCard.front}
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#64748B]">
          <RotateCw className="w-3 h-3 text-[#64748B]" />
          <span>Click to {isFlipped ? 'view prompt' : 'reveal solution'}</span>
        </div>
      </div>

      {/* Grade Action Buttons */}
      {isFlipped ? (
        <div className="grid grid-cols-4 gap-2 pt-1">
          <button
            onClick={() => handleGrade(1)}
            className="flex flex-col items-center py-2 px-1 rounded-md bg-[#F85149]/10 hover:bg-[#F85149]/20 border border-[#F85149]/30 text-[#F85149] transition-colors"
          >
            <span className="text-xs font-medium">Again</span>
            <span className="text-[9px] font-mono opacity-80">&lt; 1d</span>
          </button>
          <button
            onClick={() => handleGrade(3)}
            className="flex flex-col items-center py-2 px-1 rounded-md bg-[#D29922]/10 hover:bg-[#D29922]/20 border border-[#D29922]/30 text-[#D29922] transition-colors"
          >
            <span className="text-xs font-medium">Hard</span>
            <span className="text-[9px] font-mono opacity-80">2d</span>
          </button>
          <button
            onClick={() => handleGrade(4)}
            className="flex flex-col items-center py-2 px-1 rounded-md bg-[#388BFD]/10 hover:bg-[#388BFD]/20 border border-[#388BFD]/30 text-[#388BFD] transition-colors"
          >
            <span className="text-xs font-medium">Good</span>
            <span className="text-[9px] font-mono opacity-80">4d</span>
          </button>
          <button
            onClick={() => handleGrade(5)}
            className="flex flex-col items-center py-2 px-1 rounded-md bg-[#238636]/15 hover:bg-[#238636]/25 border border-[#238636]/30 text-[#238636] transition-colors"
          >
            <span className="text-xs font-medium">Easy</span>
            <span className="text-[9px] font-mono opacity-80">7d</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsFlipped(true)}
          className="w-full btn-secondary text-xs py-2"
        >
          Reveal Solution
        </button>
      )}
    </div>
  );
}
