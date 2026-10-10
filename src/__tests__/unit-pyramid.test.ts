import { describe, it, expect } from 'vitest';
import { calculateStreaks } from '../lib/analytics';
import { calculateMasteryLevel, calculateNextReview, isCardDue } from '../lib/sr-algorithm';

/**
 * Layer 1 — Unit Tests (Martin Fowler's Testing Pyramid)
 * Tests pure business logic and calculation rules in isolation.
 * No framework boot, no localStorage, no database, zero external dependencies.
 */

describe('Layer 1 Unit: Streak & Activity Analytics (calculateStreaks)', () => {
  it('returns zero stats for empty history', () => {
    const stats = calculateStreaks([]);
    expect(stats).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
    });
  });

  it('handles single day with no activity', () => {
    const stats = calculateStreaks([{ count: 0 }]);
    expect(stats).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
    });
  });

  it('handles single active day (today)', () => {
    const stats = calculateStreaks([{ count: 3 }]);
    expect(stats).toEqual({
      currentStreak: 1,
      longestStreak: 1,
      totalActiveDays: 1,
    });
  });

  it('preserves current streak when today is pending (count 0 but yesterday active)', () => {
    const days = [
      { count: 1 },
      { count: 2 },
      { count: 1 },
      { count: 0 }, // today pending
    ];
    const stats = calculateStreaks(days);
    expect(stats.currentStreak).toBe(3);
    expect(stats.longestStreak).toBe(3);
    expect(stats.totalActiveDays).toBe(3);
  });

  it('resets current streak to 0 if both today and yesterday had no activity', () => {
    const days = [
      { count: 2 },
      { count: 1 },
      { count: 0 }, // yesterday missed
      { count: 0 }, // today
    ];
    const stats = calculateStreaks(days);
    expect(stats.currentStreak).toBe(0);
    expect(stats.longestStreak).toBe(2);
    expect(stats.totalActiveDays).toBe(2);
  });

  it('correctly tracks longest streak across interrupted activity stretches', () => {
    const days = [
      { count: 1 },
      { count: 1 },
      { count: 1 },
      { count: 1 },
      { count: 1 }, // 5-day streak
      { count: 0 }, // gap
      { count: 2 },
      { count: 1 }, // 2-day streak ending today
    ];
    const stats = calculateStreaks(days);
    expect(stats.longestStreak).toBe(5);
    expect(stats.currentStreak).toBe(2);
    expect(stats.totalActiveDays).toBe(7);
  });

  it('supports raw number arrays and guarantees longestStreak >= currentStreak invariant', () => {
    const stats = calculateStreaks([1, 2, 3, 4]);
    expect(stats.currentStreak).toBe(4);
    expect(stats.longestStreak).toBe(4);
    expect(stats.totalActiveDays).toBe(4);
    expect(stats.longestStreak).toBeGreaterThanOrEqual(stats.currentStreak);
  });

  it('gracefully ignores negative or invalid counts', () => {
    const stats = calculateStreaks([-1, 0, 2]);
    expect(stats.totalActiveDays).toBe(1);
    expect(stats.currentStreak).toBe(1);
    expect(stats.longestStreak).toBe(1);
  });
});

describe('Layer 1 Unit: Vocabulary Mastery Progression (calculateMasteryLevel)', () => {
  it('resets any level back to learning on grade 1 (Again)', () => {
    expect(calculateMasteryLevel('mastered', 5, 30, 1)).toBe('learning');
    expect(calculateMasteryLevel('reviewing', 3, 10, 1)).toBe('learning');
    expect(calculateMasteryLevel('learning', 1, 1, 1)).toBe('learning');
  });

  it('maintains learning level when thresholds are not met', () => {
    expect(calculateMasteryLevel('learning', 0, 1, 4)).toBe('learning');
    expect(calculateMasteryLevel('learning', 1, 2, 4)).toBe('learning');
  });

  it('promotes from learning to reviewing when repetitions >= 2', () => {
    expect(calculateMasteryLevel('learning', 2, 3, 4)).toBe('reviewing');
  });

  it('promotes from learning to reviewing when intervalDays >= 4', () => {
    expect(calculateMasteryLevel('learning', 1, 4, 4)).toBe('reviewing');
  });

  it('promotes from reviewing to mastered when repetitions >= 4', () => {
    expect(calculateMasteryLevel('reviewing', 4, 15, 4)).toBe('mastered');
  });

  it('promotes from reviewing to mastered when intervalDays >= 21', () => {
    expect(calculateMasteryLevel('reviewing', 3, 21, 4)).toBe('mastered');
  });

  it('preserves mastered level on successful review', () => {
    expect(calculateMasteryLevel('mastered', 5, 40, 5)).toBe('mastered');
  });

  it('does NOT demote mastered level to reviewing when repetitions is in reviewing range (grade >= 3)', () => {
    // Regression check: mastered card with low repetitions should stay mastered unless failed with grade 1
    expect(calculateMasteryLevel('mastered', 2, 3, 4)).toBe('mastered');
    expect(calculateMasteryLevel('mastered', 3, 10, 3)).toBe('mastered');
    expect(calculateMasteryLevel('mastered', 1, 1, 5)).toBe('mastered');
  });
});

describe('Layer 1 Unit: SM-2 Spaced Repetition Logic & UTC Determinism', () => {
  it('advances repetitions and intervals according to SM-2 rules', () => {
    // Initial repetition: interval 1
    const r1 = calculateNextReview({ intervalDays: 1, easeFactor: 2.5, repetitions: 0 }, 4, new Date('2026-10-10T00:00:00Z'));
    expect(r1.repetitions).toBe(1);
    expect(r1.intervalDays).toBe(1);
    expect(r1.nextReviewAt).toBe('2026-10-11');

    // Second repetition with Good (grade 4): interval 6
    const r2 = calculateNextReview({ intervalDays: r1.intervalDays, easeFactor: r1.easeFactor, repetitions: r1.repetitions }, 4, new Date('2026-10-11T00:00:00Z'));
    expect(r2.repetitions).toBe(2);
    expect(r2.intervalDays).toBe(6);
    expect(r2.nextReviewAt).toBe('2026-10-17');

    // Second repetition with Hard (grade 3): interval 3
    const rHard = calculateNextReview({ intervalDays: 1, easeFactor: 2.5, repetitions: 1 }, 3, new Date('2026-10-11T00:00:00Z'));
    expect(rHard.repetitions).toBe(2);
    expect(rHard.intervalDays).toBe(3);
    expect(rHard.nextReviewAt).toBe('2026-10-14');
  });

  it('resets repetitions and interval on grade 1 (Again)', () => {
    const failed = calculateNextReview({ intervalDays: 30, easeFactor: 2.5, repetitions: 5 }, 1, new Date('2026-10-10T00:00:00Z'));
    expect(failed.repetitions).toBe(0);
    expect(failed.intervalDays).toBe(1);
    expect(failed.nextReviewAt).toBe('2026-10-11');
  });

  it('enforces ease factor floor of 1.3', () => {
    let card = { intervalDays: 1, easeFactor: 1.3, repetitions: 0 };
    const res = calculateNextReview(card, 1); // Grade 1 reduces ease factor
    expect(res.easeFactor).toBeGreaterThanOrEqual(1.3);
  });
});

describe('Layer 1 Unit: Spaced Repetition Due Date Boundary Checks', () => {
  const dummyCard = {
    id: 'fc-unit-1',
    front: 'Test',
    back: 'Test Back',
    category: 'General',
    nextReviewAt: '2026-10-15',
    intervalDays: 1,
    easeFactor: 2.5,
    repetitions: 1,
  };

  it('identifies cards due on exact reference date', () => {
    expect(isCardDue(dummyCard, '2026-10-15')).toBe(true);
  });

  it('identifies cards overdue (past reference date)', () => {
    expect(isCardDue(dummyCard, '2026-10-20')).toBe(true);
  });

  it('identifies cards not yet due (future review date)', () => {
    expect(isCardDue(dummyCard, '2026-10-10')).toBe(false);
  });
});
