import { describe, it, expect } from 'vitest';
import { calculateNextReview, isCardDue } from '../lib/sr-algorithm';
import { Flashcard } from '../lib/types';

describe('SuperMemo SM-2 Spaced Repetition Algorithm', () => {
  const baseCard: Flashcard = {
    id: 'fc-test-1',
    front: 'Ephemeral',
    back: 'Lasting for a very short time.',
    category: 'Vocabulary',
    nextReviewAt: '2026-10-10',
    intervalDays: 1,
    easeFactor: 2.5,
    repetitions: 0,
  };

  it('correctly schedules first review on Good rating (grade 4)', () => {
    const fixedToday = new Date('2026-10-10T00:00:00Z');
    const result = calculateNextReview(baseCard, 4, fixedToday);

    expect(result.repetitions).toBe(1);
    expect(result.intervalDays).toBe(1);
    expect(result.nextReviewAt).toBe('2026-10-11');
  });

  it('correctly increments interval on subsequent successful reviews', () => {
    const fixedToday = new Date('2026-10-11T00:00:00Z');
    const step1 = calculateNextReview(baseCard, 4, fixedToday);
    const step2 = calculateNextReview(
      { intervalDays: step1.intervalDays, easeFactor: step1.easeFactor, repetitions: step1.repetitions },
      4,
      new Date('2026-10-12T00:00:00Z')
    );

    expect(step2.repetitions).toBe(2);
    expect(step2.intervalDays).toBe(6);
  });

  it('resets interval and repetitions on Again rating (grade 1)', () => {
    const seasonedCard = {
      intervalDays: 15,
      easeFactor: 2.5,
      repetitions: 4,
    };
    const result = calculateNextReview(seasonedCard, 1, new Date('2026-10-10T00:00:00Z'));

    expect(result.repetitions).toBe(0);
    expect(result.intervalDays).toBe(1);
    expect(result.easeFactor).toBeLessThan(2.5);
  });

  it('never allows ease factor to drop below 1.3', () => {
    let card = { intervalDays: 1, easeFactor: 1.35, repetitions: 0 };
    for (let i = 0; i < 5; i++) {
      const res = calculateNextReview(card, 1);
      card = { intervalDays: res.intervalDays, easeFactor: res.easeFactor, repetitions: res.repetitions };
    }
    expect(card.easeFactor).toBe(1.3);
  });

  it('detects when card is due', () => {
    const dueCard: Flashcard = { ...baseCard, nextReviewAt: '2026-10-09' };
    const futureCard: Flashcard = { ...baseCard, nextReviewAt: '2026-10-15' };

    expect(isCardDue(dueCard, '2026-10-10')).toBe(true);
    expect(isCardDue(futureCard, '2026-10-10')).toBe(false);
  });
});
