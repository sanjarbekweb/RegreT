import { Flashcard } from './types';

export type ReviewGrade = 1 | 3 | 4 | 5; // 1: Again, 3: Hard, 4: Good, 5: Easy

export interface ReviewResult {
  nextReviewAt: string; // YYYY-MM-DD
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
}

/**
 * SuperMemo SM-2 Spaced Repetition Algorithm
 */
export function calculateNextReview(
  card: Pick<Flashcard, 'intervalDays' | 'easeFactor' | 'repetitions'>,
  grade: ReviewGrade,
  currentDate: Date = new Date()
): ReviewResult {
  let { repetitions, easeFactor, intervalDays } = card;

  // Grade >= 3 means correct response
  if (grade >= 3) {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = grade === 3 ? 3 : 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
      if (grade === 3) {
        intervalDays = Math.max(1, Math.round(intervalDays * 0.8));
      } else if (grade === 5) {
        intervalDays = Math.round(intervalDays * 1.3);
      }
    }
    repetitions += 1;
  } else {
    // Incorrect / Again -> reset repetitions and start with 1 day
    repetitions = 0;
    intervalDays = 1;
  }

  // Update ease factor: EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  const nextDate = new Date(currentDate);
  nextDate.setDate(nextDate.getDate() + intervalDays);
  const nextReviewAt = nextDate.toISOString().split('T')[0];

  return {
    nextReviewAt,
    intervalDays,
    easeFactor: Number(easeFactor.toFixed(2)),
    repetitions,
  };
}

export function isCardDue(card: Flashcard, referenceDate: string = new Date().toISOString().split('T')[0]): boolean {
  return card.nextReviewAt <= referenceDate;
}
