'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quiz } from '../lib/types';
import { storage } from '../lib/storage';
import { CheckCircle2, XCircle, Award, ChevronRight, RotateCcw, Sparkles } from 'lucide-react';

interface QuizModalProps {
  quiz: Quiz;
  onClose: () => void;
  onComplete?: (score: number) => void;
}

export default function QuizModal({ quiz, onClose, onComplete }: QuizModalProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQ = quiz.questions[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (hasAnswered) return;
    setSelectedOption(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    setHasAnswered(true);
    if (selectedOption === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < quiz.questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      const finalScorePercent = Math.round(((score + (selectedOption === currentQ.correctIndex ? 1 : 0)) / quiz.questions.length) * 100);
      setQuizFinished(true);

      // Save high score to storage
      const docs = storage.getKnowledgeDocs();
      const updatedDocs = docs.map((doc) => {
        if (doc.id === quiz.lessonId) {
          const updatedQuizzes = doc.quizzes.map((q) => {
            if (q.id === quiz.id) {
              return {
                ...q,
                highestScore: Math.max(q.highestScore || 0, finalScorePercent),
                completedAt: new Date().toISOString(),
              };
            }
            return q;
          });
          return { ...doc, quizzes: updatedQuizzes };
        }
        return doc;
      });
      storage.saveKnowledgeDocs(updatedDocs);

      if (onComplete) onComplete(finalScorePercent);
    }
  };

  const restartQuiz = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bento-card max-w-lg w-full p-6 sm:p-7 space-y-5 bg-white dark:bg-[#131A29]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3.5">
          <div>
            <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">
              {quiz.title}
            </h3>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              Question {currentIdx + 1} of {quiz.questions.length}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-display font-bold px-2 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/[0.06]"
          >
            ✕ Exit
          </button>
        </div>

        {/* Content */}
        {!quizFinished ? (
          <div className="space-y-4">
            <div className="text-sm font-display font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQ.question}
            </div>

            <div className="space-y-2.5">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                let optionStyle = 'bg-slate-50 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.08] text-slate-800 dark:text-slate-200 hover:border-lime';

                if (hasAnswered) {
                  if (idx === currentQ.correctIndex) {
                    optionStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-bold';
                  } else if (isSelected) {
                    optionStyle = 'bg-coral/10 dark:bg-coral/20 border-coral text-coral-dark dark:text-coral';
                  } else {
                    optionStyle = 'bg-slate-50/50 dark:bg-white/[0.02] border-slate-200/40 dark:border-white/[0.04] text-slate-400';
                  }
                } else if (isSelected) {
                  optionStyle = 'bg-lime/20 dark:bg-lime/10 border-lime text-slate-950 dark:text-white font-bold ring-2 ring-lime/40';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={hasAnswered}
                    className={`w-full text-left p-3.5 rounded-2xl border text-xs transition-all flex items-start gap-3 font-display ${optionStyle}`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white dark:bg-white/[0.1] border border-slate-200 dark:border-white/[0.1] flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 font-sans">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation */}
            {hasAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3.5 rounded-2xl border text-xs ${
                  selectedOption === currentQ.correctIndex
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-200'
                    : 'bg-coral/10 dark:bg-coral/20 border-coral/30 text-coral-dark dark:text-coral'
                }`}
              >
                <div className="font-display font-bold mb-1 flex items-center gap-1.5">
                  {selectedOption === currentQ.correctIndex ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-coral" />
                  )}
                  <span>
                    {selectedOption === currentQ.correctIndex ? 'Correct Analysis!' : 'Incorrect'}
                  </span>
                </div>
                <div className="text-slate-700 dark:text-slate-300 font-sans">{currentQ.explanation}</div>
              </motion.div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-2.5 pt-2">
              {!hasAnswered ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={selectedOption === null}
                  className="btn-primary text-xs py-2 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verify Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="btn-iris text-xs py-2 px-5 gap-1.5"
                >
                  <span>{currentIdx + 1 < quiz.questions.length ? 'Next Question' : 'Complete Quiz'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Finished State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 py-4"
          >
            <div className="w-16 h-16 rounded-full bg-lime/20 border border-lime text-slate-950 mx-auto flex items-center justify-center shadow-sm">
              <Award className="w-8 h-8 text-slate-900 dark:text-lime" />
            </div>
            <div>
              <h4 className="font-display font-black text-xl text-slate-900 dark:text-white">
                Quiz Finished!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                You answered {score} out of {quiz.questions.length} questions correctly.
              </p>
              <div className="text-3xl font-display font-black text-iris dark:text-lime mt-2">
                {Math.round((score / quiz.questions.length) * 100)}%
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-3">
              <button
                onClick={restartQuiz}
                className="btn-secondary text-xs py-2 px-4 gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Quiz</span>
              </button>
              <button
                onClick={onClose}
                className="btn-primary text-xs py-2 px-5"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
