import { describe, it, expect } from 'vitest';
import { INITIAL_CATEGORIES, storage } from '../lib/storage';
import { Activity, KnowledgeDocument, Flashcard } from '../lib/types';

describe('Heatmap & Calendar Integrity', () => {
  it('includes all 11 core categories including reading, entertainment, media, and wakeup', () => {
    const categoryIds = INITIAL_CATEGORIES.map((c) => c.id);
    expect(categoryIds).toContain('wakeup');
    expect(categoryIds).toContain('reading');
    expect(categoryIds).toContain('entertainment');
    expect(categoryIds).toContain('media');
    expect(categoryIds).toContain('goals');
    expect(categoryIds).toContain('coding');
    expect(INITIAL_CATEGORIES.length).toBeGreaterThanOrEqual(11);
  });

  it('correctly maps week rows to Monday..Sunday alignment', () => {
    // Test that for any given reference day, the Monday calculation matches (day + 6) % 7
    const today = new Date('2026-10-10T00:00:00Z'); // Saturday (day 6)
    const todayDayOfWeek = (today.getUTCDay() + 6) % 7;
    expect(todayDayOfWeek).toBe(5); // Saturday is index 5 in 0-indexed Mon-Sun week

    const currentWeekMonday = new Date(today);
    currentWeekMonday.setUTCDate(today.getUTCDate() - todayDayOfWeek);
    expect(currentWeekMonday.getUTCDay()).toBe(1); // Monday is day 1

    const sundayOfCurrentWeek = new Date(currentWeekMonday);
    sundayOfCurrentWeek.setUTCDate(currentWeekMonday.getUTCDate() + 6);
    expect(sundayOfCurrentWeek.getUTCDay()).toBe(0); // Sunday is day 0
  });

  it('calculates streaks correctly without breaking if today is pending activity', () => {
    function calcStreak(counts: number[]): number {
      let currentStreak = 0;
      for (let i = counts.length - 1; i >= 0; i--) {
        if (counts[i] > 0) {
          currentStreak++;
        } else if (i === counts.length - 1) {
          continue; // Today pending
        } else {
          break;
        }
      }
      return currentStreak;
    }

    expect(calcStreak([1, 1, 1, 1])).toBe(4);
    expect(calcStreak([1, 1, 1, 0])).toBe(3);
    expect(calcStreak([1, 1, 0, 0])).toBe(0);
    expect(calcStreak([0, 0, 0, 0])).toBe(0);
  });
});

describe('Storage Cascade & Topic Linking Integrity', () => {
  it('cascades document deletion to flashcards referencing topicId even if not in flashcardIds list', () => {
    const docId = 'doc-topic-cascade-1';
    const orphanedCardId = 'fc-orphan-1';

    const doc: KnowledgeDocument = {
      id: docId,
      title: 'Distributed Consensus',
      topic: 'Computer Science',
      categoryId: 'knowledge',
      sourceType: 'lesson',
      rawContent: 'Raft consensus algorithm uses leader election and log replication.',
      quizzes: [],
      flashcardIds: [], // Empty list here to simulate unlisted or dynamically linked card
      createdAt: '2026-10-10T10:00:00Z',
      updatedAt: '2026-10-10T10:00:00Z',
    };

    const card: Flashcard = {
      id: orphanedCardId,
      topicId: docId,
      front: 'Raft Consensus',
      back: 'Leader-based replicated state machine protocol',
      category: 'Computer Science',
      nextReviewAt: '2026-10-10',
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 0,
    };

    storage.addKnowledgeDoc(doc);
    storage.addFlashcard(card);

    expect(storage.getKnowledgeDocs().find((d) => d.id === docId)).toBeDefined();
    expect(storage.getFlashcards().find((c) => c.id === orphanedCardId)).toBeDefined();

    // Delete doc
    storage.deleteKnowledgeDoc(docId);

    expect(storage.getKnowledgeDocs().find((d) => d.id === docId)).toBeUndefined();
    expect(storage.getFlashcards().find((c) => c.id === orphanedCardId)).toBeUndefined();
  });
});
