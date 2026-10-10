'use client';

import React, { useState } from 'react';
import { Flashcard } from '../lib/types';
import { calculateNextReview, calculateMasteryLevel, ReviewGrade } from '../lib/sr-algorithm';
import { storage } from '../lib/storage';
import { RotateCw, Check, AlertCircle, Sparkles, BookOpen } from 'lucide-react';

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
      <div className="bg-surface border border-border rounded-lg p-6 text-center space-y-4 max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-success/20 border border-success/40 text-success mx-auto flex items-center justify-center">
          <Check className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-base text-foreground">Review Session Complete</h3>
          <p className="text-xs text-muted mt-1">
            All pending spaced repetition flashcards for this deck have been scheduled.
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
    <div className="bg-surface border border-border rounded-lg p-5 max-w-xl w-full mx-auto space-y-4">
      {/* Deck Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono text-muted uppercase tracking-wider">
            {currentCard.category || 'Spaced Repetition'}
          </span>
        </div>
        <div className="text-xs font-mono text-muted">
          Card {currentIndex + 1} of {sessionCards.length}
        </div>
      </div>

      {/* Flip Card Stage */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="min-h-[220px] bg-elevated border border-border rounded-lg p-6 flex flex-col justify-between cursor-pointer hover:border-primary/50 transition-all select-none"
      >
        <div className="text-[10px] font-mono text-muted uppercase">
          {isFlipped ? 'Answer & Explanation' : 'Question / Term (Click to flip)'}
        </div>

        <div className="my-auto text-center py-4">
          <div className="text-base sm:text-lg font-medium text-foreground whitespace-pre-wrap">
            {isFlipped ? currentCard.back : currentCard.front}
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-muted font-mono">
          <RotateCw className="w-3 h-3" />
          <span>Tap to {isFlipped ? 'show front' : 'flip'}</span>
        </div>
      </div>

      {/* Grade Action Buttons */}
      {isFlipped ? (
        <div className="grid grid-cols-4 gap-2 pt-2">
          <button
            onClick={() => handleGrade(1)}
            className="flex flex-col items-center py-2 px-1 rounded bg-elevated border border-danger/40 hover:bg-danger/20 text-danger transition-colors"
          >
            <span className="text-xs font-semibold">Again</span>
            <span className="text-[10px] font-mono opacity-80">&lt; 1d</span>
          </button>
          <button
            onClick={() => handleGrade(3)}
            className="flex flex-col items-center py-2 px-1 rounded bg-elevated border border-warning/40 hover:bg-warning/20 text-warning transition-colors"
          >
            <span className="text-xs font-semibold">Hard</span>
            <span className="text-[10px] font-mono opacity-80">2d</span>
          </button>
          <button
            onClick={() => handleGrade(4)}
            className="flex flex-col items-center py-2 px-1 rounded bg-elevated border border-primary/40 hover:bg-primary/20 text-primary transition-colors"
          >
            <span className="text-xs font-semibold">Good</span>
            <span className="text-[10px] font-mono opacity-80">4d</span>
          </button>
          <button
            onClick={() => handleGrade(5)}
            className="flex flex-col items-center py-2 px-1 rounded bg-elevated border border-success/40 hover:bg-success/20 text-success transition-colors"
          >
            <span className="text-xs font-semibold">Easy</span>
            <span className="text-[10px] font-mono opacity-80">7d</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsFlipped(true)}
          className="w-full btn-secondary text-xs py-2.5"
        >
          Reveal Solution
        </button>
      )}

      {onClose && (
        <div className="flex justify-end pt-1">
          <button onClick={onClose} className="text-xs text-muted hover:text-foreground">
            Exit Deck
          </button>
        </div>
      )}
    </div>
  );
}
