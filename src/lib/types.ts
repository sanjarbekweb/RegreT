export type CategoryId =
  | 'personal'
  | 'health'
  | 'education'
  | 'coding'
  | 'reading'
  | 'knowledge'
  | 'social'
  | 'entertainment'
  | 'media'
  | 'goals';

export interface Category {
  id: CategoryId;
  name: string;
  color: string;
  description: string;
  icon: string;
}

export interface Attachment {
  id: string;
  url: string; // base64 data URL or permanent URL
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  caption?: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  title: string;
  categoryId: CategoryId;
  description?: string;
  startedAt: string; // ISO 8601 string
  endedAt?: string; // ISO 8601 string or undefined if instant/ongoing
  tags: string[];
  attachments: Attachment[];
  projectId?: string;
  source: 'manual' | 'timer' | 'integration' | 'import';
  githubRepo?: string;
  githubCommit?: string;
  vercelUrl?: string;
  bookQuote?: {
    bookTitle: string;
    author: string;
    quote: string;
    pageNumber?: number;
  };
  mediaDetails?: {
    type: 'f1' | 'anime' | 'movie' | 'music' | 'paper' | 'scientific_video';
    title: string;
    authorOrArtist?: string;
    rating?: number;
    url?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  name: string;
  categoryId: CategoryId;
  targetPerWeek: number; // e.g. 7
  icon: string;
  isArchived: boolean;
  createdAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  completedOn: string; // YYYY-MM-DD
  activityId?: string;
  note?: string;
}

export interface Flashcard {
  id: string;
  topicId?: string;
  vocabularyId?: string;
  front: string;
  back: string;
  category: string;
  nextReviewAt: string; // YYYY-MM-DD
  intervalDays: number;
  easeFactor: number; // default 2.5
  repetitions: number;
  lastReviewedAt?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  lessonId: string;
  questions: QuizQuestion[];
  highestScore?: number;
  completedAt?: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  topic: string;
  categoryId: CategoryId;
  sourceType: 'note' | 'pdf' | 'paper' | 'lesson';
  rawContent: string;
  aiSummary?: string;
  keyTakeaways: string[];
  quizzes: Quiz[];
  flashcardIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyWord {
  id: string;
  word: string;
  phonetic?: string;
  partOfSpeech: string;
  definition: string;
  exampleSentence: string;
  synonyms: string[];
  masteryLevel: 'learning' | 'reviewing' | 'mastered';
  flashcardId: string;
  addedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  githubRepo?: string;
  vercelUrl?: string;
  techStack: string[];
  screenshots: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Countdown {
  id: string;
  title: string;
  targetDate: string; // YYYY-MM-DDTHH:mm
  category: 'university' | 'exam' | 'competition' | 'project' | 'personal';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  description?: string;
  checklist?: { id: string; text: string; done: boolean }[];
  targetUrl?: string;
  createdAt: string;
}
