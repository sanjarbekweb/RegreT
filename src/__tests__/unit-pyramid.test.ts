import { describe, it, expect } from 'vitest';
import {
  calculateStreaks,
  getIntensityScale,
  getIntensityClass,
  extractPhotosFromActivities,
  groupItemsByDate,
  classifyDay,
  getArchiveStartDate,
} from '../lib/analytics';
import { calculateMasteryLevel, calculateNextReview, isCardDue } from '../lib/sr-algorithm';
import { Activity } from '../lib/types';

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

describe('Layer 1 Unit: Personal OS Monochromatic Intensity Scale (GitHub / Linear)', () => {
  it('maps level 0 for zero or negative counts to dark canvas tone #161B22', () => {
    const zero = getIntensityScale(0);
    expect(zero.level).toBe(0);
    expect(zero.colorHex).toBe('#161B22');
    expect(getIntensityClass(0)).toContain('bg-[#161B22]');

    const negative = getIntensityScale(-5);
    expect(negative.level).toBe(0);
    expect(negative.colorHex).toBe('#161B22');
  });

  it('maps level 1 for 1 activity to muted deep blue #0D3868', () => {
    const scale = getIntensityScale(1);
    expect(scale.level).toBe(1);
    expect(scale.colorHex).toBe('#0D3868');
    expect(getIntensityClass(1)).toContain('bg-[#0D3868]');
  });

  it('maps level 2 for 2 activities to intermediate blue #1A5699', () => {
    const scale = getIntensityScale(2);
    expect(scale.level).toBe(2);
    expect(scale.colorHex).toBe('#1A5699');
    expect(getIntensityClass(2)).toContain('bg-[#1A5699]');
  });

  it('maps level 3 for 3 activities to vibrant blue #2875D0', () => {
    const scale = getIntensityScale(3);
    expect(scale.level).toBe(3);
    expect(scale.colorHex).toBe('#2875D0');
    expect(getIntensityClass(3)).toContain('bg-[#2875D0]');
  });

  it('maps level 4 for 4+ activities to high-intensity light blue #58A6FF', () => {
    const four = getIntensityScale(4);
    expect(four.level).toBe(4);
    expect(four.colorHex).toBe('#58A6FF');
    expect(getIntensityClass(4)).toContain('bg-[#58A6FF]');

    const ten = getIntensityScale(10);
    expect(ten.level).toBe(4);
    expect(ten.colorHex).toBe('#58A6FF');
  });
});

describe('Layer 1 Unit: Apple Photos Media Extraction & Date Grouping', () => {
  const dummyActivities: Activity[] = [
    {
      id: 'act-1',
      title: 'Morning Run',
      categoryId: 'health',
      startedAt: '2026-10-10T08:00:00Z',
      tags: ['run'],
      attachments: [
        {
          id: 'att-1',
          url: 'data:image/jpeg;base64,sample1',
          originalName: 'run.jpg',
          mimeType: 'image/jpeg',
          sizeBytes: 1024,
          caption: 'Morning trail',
          createdAt: '2026-10-10T08:00:00Z',
        },
      ],
      source: 'manual',
      createdAt: '2026-10-10T08:00:00Z',
      updatedAt: '2026-10-10T08:00:00Z',
    },
    {
      id: 'act-2',
      title: 'Coding Session',
      categoryId: 'coding',
      startedAt: '2026-10-09T14:00:00Z',
      tags: ['code'],
      attachments: [], // No attachments
      source: 'manual',
      createdAt: '2026-10-09T14:00:00Z',
      updatedAt: '2026-10-09T14:00:00Z',
    },
    {
      id: 'act-3',
      title: 'Evening Sunset',
      categoryId: 'personal',
      startedAt: '2026-10-10T19:00:00Z',
      tags: ['photo'],
      attachments: [
        {
          id: 'att-2',
          url: 'data:image/jpeg;base64,sample2',
          originalName: 'sunset.jpg',
          mimeType: 'image/jpeg',
          sizeBytes: 2048,
          caption: 'Golden hour',
          createdAt: '2026-10-10T19:00:00Z',
        },
      ],
      source: 'manual',
      createdAt: '2026-10-10T19:00:00Z',
      updatedAt: '2026-10-10T19:00:00Z',
    },
  ];

  it('extracts all attached photos and sorts them descending by startedAt', () => {
    const photos = extractPhotosFromActivities(dummyActivities);
    expect(photos.length).toBe(2);
    // 2026-10-10T19:00:00Z should come before 2026-10-10T08:00:00Z
    expect(photos[0].attachment.id).toBe('att-2');
    expect(photos[1].attachment.id).toBe('att-1');
    expect(photos[0].dateStr).toBe('2026-10-10');
  });

  it('groups photo items cleanly by date for Apple Photos layout', () => {
    const photos = extractPhotosFromActivities(dummyActivities);
    const groups = groupItemsByDate(photos);

    expect(Object.keys(groups)).toEqual(['2026-10-10']);
    expect(groups['2026-10-10'].length).toBe(2);
    expect(groups['2026-10-10'][0].attachment.originalName).toBe('sunset.jpg');
    expect(groups['2026-10-10'][1].attachment.originalName).toBe('run.jpg');
  });

  it('returns empty list when activities contain no attachments', () => {
    const emptyActs: Activity[] = [
      {
        id: 'act-none',
        title: 'Only Text',
        categoryId: 'reading',
        startedAt: '2026-10-10T10:00:00Z',
        tags: [],
        attachments: [],
        source: 'manual',
        createdAt: '2026-10-10T10:00:00Z',
        updatedAt: '2026-10-10T10:00:00Z',
      },
    ];
    const photos = extractPhotosFromActivities(emptyActs);
    expect(photos).toEqual([]);
    expect(groupItemsByDate(photos)).toEqual({});
  });
});

describe('Layer 1 Unit: Calendar Day Classification & Distinction (classifyDay, getArchiveStartDate)', () => {
  const today = '2026-10-10';
  const archiveStart = '2026-08-01';

  it('classifies future dates as future with pointer-events-none style', () => {
    const res = classifyDay('2026-10-11', 0, today, archiveStart);
    expect(res.status).toBe('future');
    expect(res.intensityLevel).toBe(-1);
    expect(res.cssClass).toContain('opacity-0');
  });

  it('classifies active dates with count > 0 as active with correct intensity level', () => {
    const res1 = classifyDay('2026-10-10', 1, today, archiveStart);
    expect(res1.status).toBe('active');
    expect(res1.intensityLevel).toBe(1);
    expect(res1.cssClass).toContain('bg-[#0D3868]');

    const res4 = classifyDay('2026-10-09', 5, today, archiveStart);
    expect(res4.status).toBe('active');
    expect(res4.intensityLevel).toBe(4);
    expect(res4.cssClass).toContain('bg-[#58A6FF]');
  });

  it('clearly distinguishes missing data (pre-archive date) from an empty day', () => {
    // 2026-07-15 is before archiveStart (2026-08-01)
    const missing = classifyDay('2026-07-15', 0, today, archiveStart);
    expect(missing.status).toBe('missing');
    expect(missing.label).toBe('Missing data');
    expect(missing.cssClass).toContain('border-dashed');

    // 2026-09-10 is within the active archive period (>= 2026-08-01) with count 0
    const empty = classifyDay('2026-09-10', 0, today, archiveStart);
    expect(empty.status).toBe('empty');
    expect(empty.label).toContain('Empty day');
    expect(empty.cssClass).toContain('bg-[#161B22]');
  });

  it('handles edge case where archiveStartDate is not provided', () => {
    const res = classifyDay('2026-05-01', 0, today);
    expect(res.status).toBe('empty');
  });

  it('determines the earliest activity date as the archive start date', () => {
    const sampleActs: Activity[] = [
      {
        id: '1',
        title: 'Recent',
        categoryId: 'coding',
        startedAt: '2026-10-01T10:00:00Z',
        tags: [],
        attachments: [],
        source: 'manual',
        createdAt: '2026-10-01T10:00:00Z',
        updatedAt: '2026-10-01T10:00:00Z',
      },
      {
        id: '2',
        title: 'Oldest',
        categoryId: 'reading',
        startedAt: '2026-07-20T08:00:00Z',
        tags: [],
        attachments: [],
        source: 'manual',
        createdAt: '2026-07-20T08:00:00Z',
        updatedAt: '2026-07-20T08:00:00Z',
      },
      {
        id: '3',
        title: 'Middle',
        categoryId: 'health',
        startedAt: '2026-08-15T12:00:00Z',
        tags: [],
        attachments: [],
        source: 'manual',
        createdAt: '2026-08-15T12:00:00Z',
        updatedAt: '2026-08-15T12:00:00Z',
      },
    ];

    expect(getArchiveStartDate(sampleActs)).toBe('2026-07-20');
  });

  it('falls back to today date when activities array is empty', () => {
    const todayIso = new Date().toISOString().split('T')[0];
    expect(getArchiveStartDate([])).toBe(todayIso);
  });
});


