import { describe, it, expect } from 'vitest';
import { calculateNextReview, isCardDue } from '../lib/sr-algorithm';
import { generateLearningMaterials } from '../lib/ai-service';
import { storage } from '../lib/storage';

describe('Edge Cases: Spaced Repetition Boundary Conditions', () => {
  it('handles month boundaries and leap year dates correctly', () => {
    const endOfFeb = new Date('2028-02-28T00:00:00Z');
    const card = { intervalDays: 1, easeFactor: 2.5, repetitions: 0 };
    const res = calculateNextReview(card, 4, endOfFeb);

    expect(res.nextReviewAt).toBe('2028-02-29');
  });

  it('handles year rollover correctly', () => {
    const dec31 = new Date('2026-12-31T00:00:00Z');
    const card = { intervalDays: 2, easeFactor: 2.5, repetitions: 1 };
    const res = calculateNextReview(card, 4, dec31);

    expect(res.nextReviewAt).toBe('2027-01-06');
  });

  it('caps ease factor growth appropriately', () => {
    let card = { intervalDays: 1, easeFactor: 2.5, repetitions: 0 };
    // Review 10 times with 'Easy' (grade 5)
    for (let i = 0; i < 10; i++) {
      const res = calculateNextReview(card, 5);
      card = { intervalDays: res.intervalDays, easeFactor: res.easeFactor, repetitions: res.repetitions };
    }
    expect(card.easeFactor).toBeGreaterThan(2.5);
    expect(card.intervalDays).toBeGreaterThan(30);
  });
});

describe('Edge Cases: AI Learning Engine with Sparse Inputs', () => {
  it('gracefully handles empty or very short topic input without throwing', async () => {
    const res = await generateLearningMaterials('', 'Tiny text.');
    expect(res.summary).toBeTruthy();
    expect(res.keyTakeaways.length).toBeGreaterThanOrEqual(1);
    expect(res.quizzes.length).toBeGreaterThanOrEqual(1);
    expect(res.flashcards.length).toBeGreaterThanOrEqual(1);
  });

  it('handles special characters and Unicode in content safely', async () => {
    const unicodeText = 'Euler’s formula states that e^{iπ} + 1 = 0. Schrödinger equation: iℏ∂ψ/∂t = Hψ.';
    const res = await generateLearningMaterials('Quantum Mechanics', unicodeText);
    expect(res.summary).toContain('Euler’s formula');
  });
});

describe('Edge Cases: Storage Corrupt Import Handling', () => {
  it('returns false and does not crash when invalid JSON is passed to import', () => {
    const corrupt = '{ invalid: json }';
    const result = storage.importAllData(corrupt);
    expect(result).toBe(false);
  });

  it('handles partial JSON payloads gracefully', () => {
    const partial = JSON.stringify({
      version: '1.0.0',
      activities: [
        {
          id: 'partial-1',
          title: 'Partial Activity',
          categoryId: 'personal',
          startedAt: '2026-10-10T10:00:00Z',
          tags: [],
          attachments: [],
          source: 'manual',
          createdAt: '2026-10-10T10:00:00Z',
          updatedAt: '2026-10-10T10:00:00Z',
        },
      ],
    });
    const result = storage.importAllData(partial);
    expect(result).toBe(true);
    const acts = storage.getActivities();
    expect(acts.find((a) => a.id === 'partial-1')).toBeDefined();
  });
});
