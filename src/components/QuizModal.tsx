'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Quiz } from '../lib/types';
import { storage } from '../lib/storage';
import { CheckCircle2, XCircle, Award, ChevronRight, RotateCcw, X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-[#090D12]/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="workspace-panel max-w-lg w-full p-5 space-y-4 bg-[#111827] border border-[#1E293B]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
          <div>
            <h3 className="font-semibold text-sm text-[#F0F6FC]">
              {quiz.title}
            </h3>
            <div className="text-[10px] font-mono text-[#64748B] mt-0.5">
              Question {currentIdx + 1} of {quiz.questions.length}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#F0F6FC] p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {!quizFinished ? (
          <div className="space-y-4">
            <div className="text-xs font-medium text-[#F0F6FC] leading-relaxed">
              {currentQ.question}
            </div>

            <div className="space-y-2">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                let optionStyle = 'bg-[#0D1117] border-[#1E293B] text-[#F0F6FC] hover:border-[#388BFD]/40';

                if (hasAnswered) {
                  if (idx === currentQ.correctIndex) {
                    optionStyle = 'bg-[#238636]/15 border-[#238636] text-[#238636] font-medium';
                  } else if (isSelected) {
                    optionStyle = 'bg-[#F85149]/15 border-[#F85149] text-[#F85149]';
                  } else {
                    optionStyle = 'bg-[#0D1117]/50 border-[#1E293B]/50 text-[#64748B]';
                  }
                } else if (isSelected) {
                  optionStyle = 'bg-[#161F2E] border-[#388BFD] text-white ring-1 ring-[#388BFD]/50';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={hasAnswered}
                    className={`w-full text-left p-3 rounded-md border text-xs transition-colors flex items-start gap-2.5 ${optionStyle}`}
                  >
                    <span className="w-4 h-4 rounded bg-[#161F2E] border border-[#232E3E] flex items-center justify-center font-mono text-[9px] text-[#8B949E] shrink-0 mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation */}
            {hasAnswered && (
              <div
                className={`p-3 rounded-md border text-xs ${
                  selectedOption === currentQ.correctIndex
                    ? 'bg-[#238636]/10 border-[#238636]/30 text-[#238636]'
                    : 'bg-[#F85149]/10 border-[#F85149]/30 text-[#F85149]'
                }`}
              >
                <div className="font-medium mb-1 flex items-center gap-1.5">
                  {selectedOption === currentQ.correctIndex ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {selectedOption === currentQ.correctIndex ? 'Correct Analysis' : 'Incorrect'}
                  </span>
                </div>
                <div className="text-[#8B949E] leading-relaxed">{currentQ.explanation}</div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              {!hasAnswered ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={selectedOption === null}
                  className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verify Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="btn-primary text-xs py-1.5 px-3 gap-1.5"
                >
                  <span>{currentIdx + 1 < quiz.questions.length ? 'Next Question' : 'Complete Quiz'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Finished State */
          <div className="text-center space-y-3 py-3">
            <div className="w-12 h-12 rounded-full bg-[#161F2E] border border-[#232E3E] text-[#388BFD] mx-auto flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-base text-[#F0F6FC]">
                Assessment Complete
              </h4>
              <p className="text-xs text-[#8B949E] mt-0.5">
                You answered {score} out of {quiz.questions.length} questions correctly.
              </p>
              <div className="text-2xl font-mono font-semibold text-[#388BFD] mt-1.5">
                {Math.round((score / quiz.questions.length) * 100)}%
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={restartQuiz}
                className="btn-secondary text-xs py-1.5 px-3 gap-1.5"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retry Quiz</span>
              </button>
              <button
                onClick={onClose}
                className="btn-primary text-xs py-1.5 px-3"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
