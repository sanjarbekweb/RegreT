'use client';

import React, { useState } from 'react';
import { Quiz } from '../lib/types';
import { storage } from '../lib/storage';
import { CheckCircle2, XCircle, Award, ChevronRight, RotateCcw } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-lg max-w-lg w-full p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="font-semibold text-sm text-foreground">{quiz.title}</h3>
            <div className="text-xs text-muted font-mono">
              Question {currentIdx + 1} of {quiz.questions.length}
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-foreground text-xs font-mono">
            Exit
          </button>
        </div>

        {/* Content */}
        {!quizFinished ? (
          <div className="space-y-4">
            <div className="text-sm font-medium text-foreground leading-relaxed">
              {currentQ.question}
            </div>

            <div className="space-y-2">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                let optionStyle = 'bg-elevated border-border text-foreground hover:border-primary/50';

                if (hasAnswered) {
                  if (idx === currentQ.correctIndex) {
                    optionStyle = 'bg-success/20 border-success text-success';
                  } else if (isSelected) {
                    optionStyle = 'bg-danger/20 border-danger text-danger';
                  } else {
                    optionStyle = 'bg-elevated/40 border-border/40 text-muted';
                  }
                } else if (isSelected) {
                  optionStyle = 'bg-primary/20 border-primary text-foreground';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={hasAnswered}
                    className={`w-full text-left p-3 rounded border text-xs transition-all flex items-start gap-2.5 ${optionStyle}`}
                  >
                    <span className="w-5 h-5 rounded bg-surface border border-border/80 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation */}
            {hasAnswered && (
              <div
                className={`p-3 rounded border text-xs ${
                  selectedOption === currentQ.correctIndex
                    ? 'bg-success/10 border-success/30 text-success'
                    : 'bg-danger/10 border-danger/30 text-danger'
                }`}
              >
                <div className="font-semibold mb-1 flex items-center gap-1.5">
                  {selectedOption === currentQ.correctIndex ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-danger" />
                  )}
                  <span>
                    {selectedOption === currentQ.correctIndex ? 'Correct Analysis' : 'Incorrect'}
                  </span>
                </div>
                <div className="text-foreground/90">{currentQ.explanation}</div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              {!hasAnswered ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={selectedOption === null}
                  className="btn-primary text-xs disabled:opacity-50"
                >
                  Verify Answer
                </button>
              ) : (
                <button onClick={handleNext} className="btn-primary text-xs">
                  <span>{currentIdx + 1 < quiz.questions.length ? 'Next Question' : 'Finish Quiz'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 text-primary mx-auto flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-base text-foreground">Quiz Evaluation Completed</h4>
              <div className="text-2xl font-bold font-mono text-primary mt-1">
                {Math.round((score / quiz.questions.length) * 100)}%
              </div>
              <p className="text-xs text-muted mt-1">
                You answered {score} out of {quiz.questions.length} questions correctly.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={restartQuiz} className="btn-secondary text-xs">
                <RotateCcw className="w-3.5 h-3.5" />
                Retake
              </button>
              <button onClick={onClose} className="btn-primary text-xs">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
