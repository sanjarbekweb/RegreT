import { describe, it, expect } from 'vitest';
import { generateLearningMaterials } from '../lib/ai-service';
import { storage } from '../lib/storage';
import { Activity } from '../lib/types';

describe('AI Learning Generator Engine', () => {
  it('extracts summaries, key takeaways, quizzes, and flashcards from lesson notes', async () => {
    const topic = 'Corporate Finance & Moats';
    const notes = `Network Effects: Value increases as more participants join the network.
High Switching Costs: Users face friction and financial hurdles when migrating away.
Cost Leadership: Delivering comparable value at a structurally lower production cost.
LTV to CAC Ratio: Customer Lifetime Value must be at least three times higher than Acquisition Cost for sound solvency.`;

    const result = await generateLearningMaterials(topic, notes);

    expect(result.summary).toBeTruthy();
    expect(result.keyTakeaways.length).toBeGreaterThan(0);
    expect(result.quizzes.length).toBeGreaterThan(0);
    expect(result.flashcards.length).toBeGreaterThan(0);

    // Validate quiz structure
    const firstQuiz = result.quizzes[0];
    expect(firstQuiz.question).toBeTruthy();
    expect(firstQuiz.options.length).toBe(4);
    expect(firstQuiz.correctIndex).toBeGreaterThanOrEqual(0);
    expect(firstQuiz.correctIndex).toBeLessThan(4);
    expect(firstQuiz.explanation).toBeTruthy();

    // Validate flashcard structure
    const firstCard = result.flashcards[0];
    expect(firstCard.front).toBeTruthy();
    expect(firstCard.back).toBeTruthy();
  });
});

describe('Storage & Permanence Operations', () => {
  it('exports and verifies backup JSON integrity', () => {
    const backupJson = storage.exportAllData();
    expect(backupJson).toBeTruthy();

    const parsed = JSON.parse(backupJson);
    expect(parsed.version).toBe('1.0.0');
    expect(Array.isArray(parsed.activities)).toBe(true);
    expect(Array.isArray(parsed.habits)).toBe(true);
    expect(Array.isArray(parsed.flashcards)).toBe(true);
    expect(Array.isArray(parsed.vocabulary)).toBe(true);
    expect(Array.isArray(parsed.knowledgeDocs)).toBe(true);
  });

  it('correctly adds and retrieves an activity in storage', () => {
    const testActivity: Activity = {
      id: 'test-act-999',
      title: 'Morning Awakening Test',
      categoryId: 'personal',
      startedAt: '2026-10-10T06:00:00Z',
      tags: ['test', 'routine'],
      attachments: [],
      source: 'manual',
      createdAt: '2026-10-10T06:00:00Z',
      updatedAt: '2026-10-10T06:00:00Z',
    };

    storage.addActivity(testActivity);
    const retrieved = storage.getActivities();
    const found = retrieved.find((a) => a.id === 'test-act-999');

    expect(found).toBeDefined();
    expect(found?.title).toBe('Morning Awakening Test');

    // Clean up
    storage.deleteActivity('test-act-999');
    const afterDelete = storage.getActivities().find((a) => a.id === 'test-act-999');
    expect(afterDelete).toBeUndefined();
  });
});
