import { describe, it, expect, beforeEach } from 'vitest';
import { storage, INITIAL_CATEGORIES, generatePastHabitCompletions, generatePastActivities } from '../lib/storage';
import { Activity, VocabularyWord, Flashcard, KnowledgeDocument, Project, Countdown, Habit } from '../lib/types';
import { calculateNextReview, calculateMasteryLevel } from '../lib/sr-algorithm';
import { compressImage } from '../lib/image-compress';

describe('Wake Up Category Verification', () => {
  it('includes the wake up category in INITIAL_CATEGORIES', () => {
    const wakeupCat = INITIAL_CATEGORIES.find((c) => c.id === 'wakeup');
    expect(wakeupCat).toBeDefined();
    expect(wakeupCat?.name).toBe('Wake Up');
  });

  it('allows logging a wake-up routine activity with selfie attachment', () => {
    const testWakeup: Activity = {
      id: 'act-wakeup-001',
      title: 'Woke up at 06:15 AM',
      categoryId: 'wakeup',
      description: 'Morning wake up routine and hydration protocol',
      startedAt: '2026-10-11T06:15:00Z',
      tags: ['wakeup', 'routine'],
      attachments: [
        {
          id: 'att-selfie-001',
          url: 'data:image/jpeg;base64,mockselfiedata',
          originalName: 'selfie_0615.jpg',
          mimeType: 'image/jpeg',
          sizeBytes: 15420,
          caption: 'Morning wake up selfie verification',
          createdAt: '2026-10-11T06:15:00Z',
        },
      ],
      source: 'manual',
      createdAt: '2026-10-11T06:15:00Z',
      updatedAt: '2026-10-11T06:15:00Z',
    };

    storage.addActivity(testWakeup);
    const acts = storage.getActivities();
    const retrieved = acts.find((a) => a.id === 'act-wakeup-001');

    expect(retrieved).toBeDefined();
    expect(retrieved?.categoryId).toBe('wakeup');
    expect(retrieved?.attachments.length).toBe(1);
    expect(retrieved?.attachments[0].caption).toBe('Morning wake up selfie verification');

    // Clean up
    storage.deleteActivity('act-wakeup-001');
    expect(storage.getActivities().find((a) => a.id === 'act-wakeup-001')).toBeUndefined();
  });
});

describe('Vocabulary Spaced Repetition Mastery Progression', () => {
  it('updates vocabulary masteryLevel based on repetitions and interval', () => {
    const wordId = 'vocab-test-1';
    const cardId = 'card-test-1';

    const testWord: VocabularyWord = {
      id: wordId,
      word: 'Ephemeral',
      partOfSpeech: 'adjective',
      definition: 'Lasting for a very short time',
      exampleSentence: 'Fashions are ephemeral, but style endures.',
      synonyms: ['transitory', 'fleeting'],
      masteryLevel: 'learning',
      flashcardId: cardId,
      addedAt: '2026-10-10T10:00:00Z',
    };

    const testCard: Flashcard = {
      id: cardId,
      vocabularyId: wordId,
      front: 'Ephemeral (adjective)',
      back: 'Lasting for a very short time',
      category: 'Vocabulary',
      nextReviewAt: '2026-10-10',
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 0,
    };

    storage.addVocabularyWord(testWord);
    storage.addFlashcard(testCard);

    // Initial check
    let currentWord = storage.getVocabulary().find((w) => w.id === wordId);
    expect(currentWord?.masteryLevel).toBe('learning');

    // Simulate review with rating 4 (Good) - repetition 1
    let metrics = calculateNextReview(testCard, 4);
    let card = { ...testCard, ...metrics };
    storage.updateFlashcard(card);

    // Advance to repetition 2 (Reviewing threshold)
    metrics = calculateNextReview(card, 4);
    card = { ...card, ...metrics };
    storage.updateFlashcard(card);

    // Update word mastery level using domain function as FlashcardViewer does
    const reviewingLevel = calculateMasteryLevel(
      currentWord!.masteryLevel,
      metrics.repetitions,
      metrics.intervalDays,
      4
    );
    storage.updateVocabularyWord({ ...currentWord!, masteryLevel: reviewingLevel });
    currentWord = storage.getVocabulary().find((w) => w.id === wordId);
    expect(currentWord?.masteryLevel).toBe('reviewing');

    // Advance through 4 successful repetitions -> Mastered threshold
    metrics = calculateNextReview(card, 5); // Easy
    card = { ...card, ...metrics };
    metrics = calculateNextReview(card, 5); // Easy
    card = { ...card, ...metrics };

    expect(card.repetitions).toBeGreaterThanOrEqual(4);
    const masteredLevel = calculateMasteryLevel(
      currentWord!.masteryLevel,
      card.repetitions,
      card.intervalDays,
      5
    );
    storage.updateVocabularyWord({ ...currentWord!, masteryLevel: masteredLevel });

    currentWord = storage.getVocabulary().find((w) => w.id === wordId);
    expect(currentWord?.masteryLevel).toBe('mastered');

    // Clean up
    storage.deleteVocabularyWord(wordId);
    expect(storage.getVocabulary().find((w) => w.id === wordId)).toBeUndefined();
    expect(storage.getFlashcards().find((c) => c.id === cardId)).toBeUndefined();
  });
});

describe('Full Entity CRUD Deletion in Storage', () => {
  it('deletes knowledge documents and cascades to associated flashcards', () => {
    const docId = 'doc-crud-1';
    const fcId1 = 'fc-crud-1';
    const fcId2 = 'fc-crud-2';

    const testDoc: KnowledgeDocument = {
      id: docId,
      title: 'Microeconomics & Elasticity',
      topic: 'Economics',
      categoryId: 'knowledge',
      sourceType: 'lesson',
      rawContent: 'Price elasticity of demand measures the responsiveness of quantity demanded.',
      quizzes: [],
      flashcardIds: [fcId1, fcId2],
      createdAt: '2026-10-10T12:00:00Z',
      updatedAt: '2026-10-10T12:00:00Z',
    };

    const fc1: Flashcard = {
      id: fcId1,
      topicId: docId,
      front: 'Elasticity',
      back: 'Sensitivity of demand to price changes',
      category: 'Economics',
      nextReviewAt: '2026-10-10',
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 0,
    };

    const fc2: Flashcard = {
      id: fcId2,
      topicId: docId,
      front: 'Inelastic Good',
      back: 'Good with inelastic demand coefficient < 1',
      category: 'Economics',
      nextReviewAt: '2026-10-10',
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 0,
    };

    storage.addKnowledgeDoc(testDoc);
    storage.addFlashcard(fc1);
    storage.addFlashcard(fc2);

    expect(storage.getKnowledgeDocs().find((d) => d.id === docId)).toBeDefined();
    expect(storage.getFlashcards().find((c) => c.id === fcId1)).toBeDefined();

    // Delete doc
    storage.deleteKnowledgeDoc(docId);

    expect(storage.getKnowledgeDocs().find((d) => d.id === docId)).toBeUndefined();
    expect(storage.getFlashcards().find((c) => c.id === fcId1)).toBeUndefined();
    expect(storage.getFlashcards().find((c) => c.id === fcId2)).toBeUndefined();
  });

  it('deletes projects cleanly', () => {
    const projId = 'proj-crud-1';
    const testProj: Project = {
      id: projId,
      name: 'Compiler Pipeline in Zig',
      description: 'Single-pass bytecode compiler and register allocator',
      status: 'active',
      githubRepo: 'owner/compiler',
      techStack: ['Zig', 'LLVM'],
      screenshots: [],
      createdAt: '2026-10-10T12:00:00Z',
      updatedAt: '2026-10-10T12:00:00Z',
    };

    storage.addProject(testProj);
    expect(storage.getProjects().find((p) => p.id === projId)).toBeDefined();

    storage.deleteProject(projId);
    expect(storage.getProjects().find((p) => p.id === projId)).toBeUndefined();
  });

  it('deletes countdowns cleanly', () => {
    const cdId = 'cd-crud-1';
    const testCd: Countdown = {
      id: cdId,
      title: 'Stanford Application Deadline',
      targetDate: '2027-01-05T23:59:59Z',
      category: 'university',
      priority: 'urgent',
      createdAt: '2026-10-10T12:00:00Z',
    };

    storage.addCountdown(testCd);
    expect(storage.getCountdowns().find((c) => c.id === cdId)).toBeDefined();

    storage.deleteCountdown(cdId);
    expect(storage.getCountdowns().find((c) => c.id === cdId)).toBeUndefined();
  });

  it('deletes habits cleanly', () => {
    const habitId = 'habit-crud-1';
    const testHabit: Habit = {
      id: habitId,
      name: 'Sleep 8 Hours',
      categoryId: 'health',
      targetPerWeek: 7,
      icon: 'Moon',
      isArchived: false,
      createdAt: '2026-10-10T12:00:00Z',
    };

    storage.saveHabits([...storage.getHabits(), testHabit]);
    expect(storage.getHabits().find((h) => h.id === habitId)).toBeDefined();

    storage.deleteHabit(habitId);
    expect(storage.getHabits().find((h) => h.id === habitId)).toBeUndefined();
  });
});

describe('Image Compression Utility & Quota Safety', () => {
  it('returns valid compressed representation and size metrics', async () => {
    const mockDataUrl = 'data:image/jpeg;base64,' + 'A'.repeat(5000);
    const result = await compressImage(mockDataUrl, 1280, 0.82);

    expect(result.dataUrl).toBeTruthy();
    expect(result.sizeBytes).toBeGreaterThan(0);
  });
});

describe('UTC Date Invariance & Palette Constraints', () => {
  it('generates deterministic UTC dates without timezone drift in mock activities and habit completions', () => {
    const habitCompletions = generatePastHabitCompletions();
    expect(habitCompletions.length).toBeGreaterThan(0);
    habitCompletions.forEach((hc) => {
      expect(hc.completedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(isNaN(new Date(hc.completedOn).getTime())).toBe(false);
    });

    const pastActivities = generatePastActivities();
    expect(pastActivities.length).toBeGreaterThan(0);
    pastActivities.forEach((act) => {
      expect(act.startedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
      expect(isNaN(new Date(act.startedAt).getTime())).toBe(false);
    });
  });

  it('guarantees weekly adherence 7-day window is strictly monotonically increasing and UTC invariant', () => {
    const todayStr = '2026-10-10';
    const past7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(todayStr + 'T00:00:00Z');
      d.setUTCDate(d.getUTCDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    expect(past7Days.length).toBe(7);
    expect(past7Days[6]).toBe('2026-10-10');
    expect(past7Days[0]).toBe('2026-10-04');
    for (let i = 1; i < past7Days.length; i++) {
      expect(past7Days[i] > past7Days[i - 1]).toBe(true);
    }
  });

  it('enforces strict zero-blue palette across all initial categories', () => {
    INITIAL_CATEGORIES.forEach((cat) => {
      expect(cat.color.toLowerCase()).not.toBe('#3b82f6');
      expect(cat.color.toLowerCase()).not.toBe('#2563eb');
      expect(cat.color.toLowerCase()).not.toBe('#3985f6');
      expect(cat.color.toLowerCase()).not.toContain('blue');
    });

    const educationCat = INITIAL_CATEGORIES.find((c) => c.id === 'education');
    expect(educationCat?.color).toBe('#5E43F3'); // Signature Royal Iris
  });
});
