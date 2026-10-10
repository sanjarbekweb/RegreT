import {
  Activity,
  Category,
  Countdown,
  Flashcard,
  Habit,
  HabitCompletion,
  KnowledgeDocument,
  Project,
  VocabularyWord,
} from './types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'personal',
    name: 'Personal',
    color: '#64748B',
    description: 'Wake up, daily routines, thoughts, reflections',
    icon: 'Sun',
  },
  {
    id: 'health',
    name: 'Health',
    color: '#36B58A',
    description: 'Workouts, running, gym, sleep, nutrition',
    icon: 'Activity',
  },
  {
    id: 'education',
    name: 'Education',
    color: '#3985F6',
    description: 'School, university lectures, homework, assignments',
    icon: 'GraduationCap',
  },
  {
    id: 'coding',
    name: 'Coding',
    color: '#8B5CF6',
    description: 'Software development, commits, deployments, websites',
    icon: 'Code2',
  },
  {
    id: 'reading',
    name: 'Reading',
    color: '#EC4899',
    description: 'Books, quotes, research papers, articles',
    icon: 'BookOpen',
  },
  {
    id: 'knowledge',
    name: 'Knowledge',
    color: '#06B6D4',
    description: 'Business, finance, economics, science, mathematics',
    icon: 'Brain',
  },
  {
    id: 'social',
    name: 'Social',
    color: '#F97316',
    description: 'Friends, networking, meetups, conversations',
    icon: 'Users',
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    color: '#EAB308',
    description: 'Formula 1, anime, cinema, scientific videos',
    icon: 'Tv',
  },
  {
    id: 'media',
    name: 'Media',
    color: '#14B8A6',
    description: 'Music tracks, podcasts, recordings',
    icon: 'Headphones',
  },
  {
    id: 'goals',
    name: 'Goals',
    color: '#EF4444',
    description: 'University applications, exams, milestones, competitions',
    icon: 'Target',
  },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'RegreT Personal OS',
    description: 'High-performance life operating system with timeline, knowledge vault, and habit tracking.',
    status: 'active',
    githubRepo: 'sanjarbekweb/regret-os',
    vercelUrl: 'https://regret-os.vercel.app',
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL'],
    screenshots: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    ],
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-10T16:30:00Z',
  },
  {
    id: 'proj-2',
    name: 'Autonomous Trading Bot',
    description: 'Algorithmic backtesting framework and risk mitigation engine written in Rust and Python.',
    status: 'active',
    githubRepo: 'sanjarbekweb/trading-engine',
    vercelUrl: '',
    techStack: ['Rust', 'Python', 'WebSockets', 'Postgres'],
    screenshots: [
      'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
    ],
    createdAt: '2026-09-15T12:00:00Z',
    updatedAt: '2026-10-08T18:00:00Z',
  },
];

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'h-1',
    name: 'Morning Wake Up (06:30)',
    categoryId: 'personal',
    targetPerWeek: 7,
    icon: 'Sun',
    isArchived: false,
    createdAt: '2026-08-01T00:00:00Z',
  },
  {
    id: 'h-2',
    name: 'Physical Workout / Running',
    categoryId: 'health',
    targetPerWeek: 5,
    icon: 'Dumbbell',
    isArchived: false,
    createdAt: '2026-08-01T00:00:00Z',
  },
  {
    id: 'h-3',
    name: 'Daily Coding Session',
    categoryId: 'coding',
    targetPerWeek: 6,
    icon: 'Code2',
    isArchived: false,
    createdAt: '2026-08-01T00:00:00Z',
  },
  {
    id: 'h-4',
    name: 'Read Non-Fiction / Research Paper',
    categoryId: 'reading',
    targetPerWeek: 7,
    icon: 'BookOpen',
    isArchived: false,
    createdAt: '2026-08-01T00:00:00Z',
  },
  {
    id: 'h-5',
    name: 'Vocabulary & Flashcards Review',
    categoryId: 'education',
    targetPerWeek: 7,
    icon: 'Layers',
    isArchived: false,
    createdAt: '2026-08-01T00:00:00Z',
  },
];

export const INITIAL_COUNTDOWNS: Countdown[] = [
  {
    id: 'cd-1',
    title: 'Oxford University MSc Advanced Computer Science Deadline',
    targetDate: '2027-01-15T23:59',
    category: 'university',
    priority: 'urgent',
    description: 'Submit transcripts, statement of purpose, 3 reference letters, and research portfolio.',
    checklist: [
      { id: 'c1', text: 'Refine Statement of Purpose draft', done: true },
      { id: 'c2', text: 'Request academic recommendation letters', done: true },
      { id: 'c3', text: 'Upload official translated transcripts', done: false },
      { id: 'c4', text: 'Final proofread of research writing sample', done: false },
    ],
    targetUrl: 'https://ox.ac.uk/admissions/graduate/courses/msc-advanced-computer-science',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'cd-2',
    title: 'Stanford University Knight-Hennessy Scholars Program',
    targetDate: '2026-12-08T18:00',
    category: 'university',
    priority: 'urgent',
    description: 'Full graduate scholarship application and leadership video submission.',
    checklist: [
      { id: 's1', text: 'Complete online application form', done: true },
      { id: 's2', text: 'Draft 2 core leadership essays', done: false },
      { id: 's3', text: 'Record 2-minute video prompt', done: false },
    ],
    targetUrl: 'https://knight-hennessy.stanford.edu',
    createdAt: '2026-09-10T11:00:00Z',
  },
  {
    id: 'cd-3',
    title: 'IELTS Academic Examination',
    targetDate: '2026-11-20T09:00',
    category: 'exam',
    priority: 'high',
    description: 'Target Band Score: 8.5+. Daily listening and reading mock practices scheduled.',
    checklist: [
      { id: 'i1', text: 'Cambridge Practice Tests 15-18 completed', done: true },
      { id: 'i2', text: 'Review Task 1 academic writing structures', done: false },
      { id: 'i3', text: 'Speaking partner practice sessions', done: true },
    ],
    createdAt: '2026-09-15T09:30:00Z',
  },
  {
    id: 'cd-4',
    title: 'Global Hackathon & AI Showcase',
    targetDate: '2026-11-05T12:00',
    category: 'competition',
    priority: 'medium',
    description: 'Demonstrating personal life OS and automated local knowledge retrieval pipeline.',
    checklist: [
      { id: 'g1', text: 'Prepare presentation slides', done: false },
      { id: 'g2', text: 'Vercel live deployment verification', done: true },
    ],
    createdAt: '2026-10-02T14:00:00Z',
  },
];

export const INITIAL_VOCABULARY: VocabularyWord[] = [
  {
    id: 'v-1',
    word: 'Ephemeral',
    phonetic: '/ɪˈfem.ər.əl/',
    partOfSpeech: 'adjective',
    definition: 'Lasting for a very short time; transitory; fleeting.',
    exampleSentence: 'Fame in the digital media ecosystem is notoriously ephemeral.',
    synonyms: ['transient', 'fleeting', 'momentary', 'fugitive'],
    masteryLevel: 'reviewing',
    flashcardId: 'fc-v1',
    addedAt: '2026-10-02T08:00:00Z',
  },
  {
    id: 'v-2',
    word: 'Ubiquitous',
    phonetic: '/juːˈbɪk.wɪ.təs/',
    partOfSpeech: 'adjective',
    definition: 'Present, appearing, or found everywhere at the same time.',
    exampleSentence: 'Smartphones have become ubiquitous across all demographics of modern society.',
    synonyms: ['omnipresent', 'pervasive', 'universal', 'prevalent'],
    masteryLevel: 'mastered',
    flashcardId: 'fc-v2',
    addedAt: '2026-10-03T11:00:00Z',
  },
  {
    id: 'v-3',
    word: 'Idempotent',
    phonetic: '/ˌaɪ.dəmˈpoʊ.tənt/',
    partOfSpeech: 'adjective',
    definition: 'Denoting an operation which can be applied multiple times without changing the result beyond the initial application.',
    exampleSentence: 'HTTP PUT and DELETE methods are designed to be idempotent in REST architecture.',
    synonyms: ['invariant', 'deterministic'],
    masteryLevel: 'mastered',
    flashcardId: 'fc-v3',
    addedAt: '2026-10-04T15:00:00Z',
  },
  {
    id: 'v-4',
    word: 'Pragmatism',
    phonetic: '/ˈpræɡ.mə.tɪ.zəm/',
    partOfSpeech: 'noun',
    definition: 'An approach that assesses the truth of meaning of theories or beliefs in terms of the success of their practical application.',
    exampleSentence: 'In engineering trade-offs, aggressive pragmatism beats theoretical elegance every time.',
    synonyms: ['practicality', 'realism', 'utility'],
    masteryLevel: 'learning',
    flashcardId: 'fc-v4',
    addedAt: '2026-10-08T09:00:00Z',
  },
  {
    id: 'v-5',
    word: 'Sycophant',
    phonetic: '/ˈsɪk.ə.fænt/',
    partOfSpeech: 'noun',
    definition: 'A person who acts obsequiously toward someone important in order to gain advantage.',
    exampleSentence: 'The founder avoided surrounding himself with sycophants who refused to challenge assumptions.',
    synonyms: ['flatterer', 'toady', 'yes-man'],
    masteryLevel: 'learning',
    flashcardId: 'fc-v5',
    addedAt: '2026-10-09T14:00:00Z',
  },
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-v1',
    vocabularyId: 'v-1',
    front: 'Ephemeral',
    back: 'Lasting for a very short time; transitory; fleeting.\n\nExample: Fame in digital media is notoriously ephemeral.',
    category: 'Vocabulary',
    nextReviewAt: '2026-10-11',
    intervalDays: 2,
    easeFactor: 2.5,
    repetitions: 1,
  },
  {
    id: 'fc-v2',
    vocabularyId: 'v-2',
    front: 'Ubiquitous',
    back: 'Present, appearing, or found everywhere simultaneously.\n\nExample: Smartphones have become ubiquitous.',
    category: 'Vocabulary',
    nextReviewAt: '2026-10-18',
    intervalDays: 8,
    easeFactor: 2.6,
    repetitions: 3,
  },
  {
    id: 'fc-v3',
    vocabularyId: 'v-3',
    front: 'Idempotent (Computer Science)',
    back: 'An operation that can be executed multiple times without altering the state beyond the first invocation (e.g. GET, PUT, DELETE).',
    category: 'Computer Science',
    nextReviewAt: '2026-10-19',
    intervalDays: 9,
    easeFactor: 2.7,
    repetitions: 4,
  },
  {
    id: 'fc-v4',
    vocabularyId: 'v-4',
    front: 'Pragmatism',
    back: 'Assessing theories and ideas strictly based on the success of their practical real-world application.',
    category: 'Philosophy & Strategy',
    nextReviewAt: '2026-10-10',
    intervalDays: 1,
    easeFactor: 2.4,
    repetitions: 0,
  },
  {
    id: 'fc-v5',
    vocabularyId: 'v-5',
    front: 'Sycophant',
    back: 'A servile self-seeking flatterer who agrees with everything an authority figure says to win favor.',
    category: 'Vocabulary',
    nextReviewAt: '2026-10-10',
    intervalDays: 1,
    easeFactor: 2.5,
    repetitions: 0,
  },
  {
    id: 'fc-k1',
    topicId: 'doc-1',
    front: 'What constitutes a Moat in microeconomics?',
    back: 'A sustainable competitive advantage that protects a company from competitors, such as network effects, switching costs, cost advantages, or intangible assets (patents/brand).',
    category: 'Business Strategy',
    nextReviewAt: '2026-10-12',
    intervalDays: 3,
    easeFactor: 2.5,
    repetitions: 1,
  },
  {
    id: 'fc-k2',
    topicId: 'doc-1',
    front: 'Unit Economics: LTV to CAC Ratio baseline',
    back: 'A healthy SaaS or business unit economics standard generally targets an LTV:CAC ratio >= 3:1, with payback period under 12 months.',
    category: 'Business Strategy',
    nextReviewAt: '2026-10-14',
    intervalDays: 4,
    easeFactor: 2.5,
    repetitions: 2,
  },
];

export const INITIAL_KNOWLEDGE_DOCS: KnowledgeDocument[] = [
  {
    id: 'doc-1',
    title: 'Modern Business Strategy & Market Moats',
    topic: 'Business & Microeconomics',
    categoryId: 'knowledge',
    sourceType: 'lesson',
    rawContent: `Business Strategy and Competitive Dynamics:
1. Economic Moats: Warren Buffett popularized the concept of an economic moat—the competitive advantage that one company has over other companies in the same industry. Moats protect profit margins and prevent commoditization.
2. The Four Primary Moat Types:
- Network Effects: Every additional user increases the platform value for all other users (e.g., GitHub, WhatsApp).
- High Switching Costs: Migrating away from the platform causes operational friction, data loss, or high training overhead.
- Cost Advantages: Scale, proprietary distribution, or structural operational efficiency allow lower price-points.
- Intangible Assets: Patents, regulatory approvals, and brand equity.
3. Unit Economics:
Customer Acquisition Cost (CAC) must be systematically lower than Customer Lifetime Value (LTV). A standard benchmark for healthy growth is LTV:CAC >= 3.0 with payback period <= 12 months.`,
    aiSummary:
      'A structured breakdown of economic moats and unit economics. Explores network effects, switching costs, scalable cost advantages, and the golden ratio of LTV:CAC for sustainable long-term enterprise value.',
    keyTakeaways: [
      'Moats preserve pricing power and prevent margin compression in competitive sectors.',
      'Network effects and high switching costs generate the stickiest retention loops.',
      'Healthy unit economics mandate an LTV:CAC ratio of at least 3:1.',
    ],
    quizzes: [
      {
        id: 'quiz-1',
        title: 'Business Moats & Unit Economics Check',
        lessonId: 'doc-1',
        highestScore: 100,
        questions: [
          {
            id: 'q1',
            question: 'Which moat mechanism gains utility as more participants adopt the platform?',
            options: ['Network Effects', 'Patent Monopolies', 'High Switching Costs', 'Cost Leadership'],
            correctIndex: 0,
            explanation: 'Network effects inherently mean value compounds as user count increases.',
          },
          {
            id: 'q2',
            question: 'What is the generally accepted target ratio for LTV to CAC in healthy software businesses?',
            options: ['1:1', '2:1', 'At least 3:1', '10:1 or higher only'],
            correctIndex: 2,
            explanation: 'An LTV:CAC ratio of at least 3:1 provides sufficient buffer for operating expenses and churn.',
          },
        ],
      },
    ],
    flashcardIds: ['fc-k1', 'fc-k2'],
    createdAt: '2026-10-08T10:00:00Z',
    updatedAt: '2026-10-08T10:30:00Z',
  },
  {
    id: 'doc-2',
    title: 'Attention Is All You Need — Transformer Architecture Deep Dive',
    topic: 'Computer Science & AI',
    categoryId: 'reading',
    sourceType: 'paper',
    rawContent: `Vaswani et al. (2017) introduced the Transformer architecture, replacing recurrent and convolutional layers entirely with multi-head self-attention mechanisms.
Core innovations:
- Scaled Dot-Product Attention: Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) * V
- Multi-Head Attention: Allows the model to jointly attend to information from different representation subspaces at different positions.
- Positional Encoding: Injects order information using sinusoidal frequencies or learned embeddings since attention itself is permutation-invariant.
- Residual Connections & Layer Normalization: Stabilize gradient flow across deep feedforward sublayers.`,
    aiSummary:
      'Comprehensive study notes on the landmark 2017 Transformer paper. Focuses on the mathematical derivation of scaled dot-product attention, multi-head projection subspaces, and positional encoding techniques.',
    keyTakeaways: [
      'Eliminates sequential recurrence in favor of parallelized attention matrices.',
      'Scaled dot-product attention scales query-key products by 1/sqrt(d_k) to prevent vanishing softmax gradients.',
      'Positional encodings provide order awareness without recurrent memory cells.',
    ],
    quizzes: [
      {
        id: 'quiz-2',
        title: 'Transformer Architecture Mechanics',
        lessonId: 'doc-2',
        questions: [
          {
            id: 'tq1',
            question: 'Why is the dot-product of Query and Key scaled by 1/sqrt(d_k)?',
            options: [
              'To prevent large magnitude dot-products from pushing softmax into regions with extremely small gradients.',
              'To speed up GPU matrix multiplication operations.',
              'To convert floats into normalized integers.',
              'To enforce sparsity across attention masks.',
            ],
            correctIndex: 0,
            explanation: 'For large values of d_k, dot products grow large, pushing the softmax function into regions with tiny gradients.',
          },
        ],
      },
    ],
    flashcardIds: [],
    createdAt: '2026-10-09T16:00:00Z',
    updatedAt: '2026-10-09T16:45:00Z',
  },
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    title: 'Morning Awakening & Protocol',
    categoryId: 'personal',
    description: 'Woke up at 06:15 without snoozing alarm. Cold hydration (500ml water + electrolytes), 10 minutes light exposure, ready for high focus morning block.',
    startedAt: '2026-10-10T06:15:00Z',
    endedAt: '2026-10-10T06:30:00Z',
    tags: ['routine', 'morning', 'discipline'],
    attachments: [
      {
        id: 'att-1',
        url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80',
        originalName: 'morning_wake.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 245000,
        caption: '06:15 wake-up check and sunrise ambient',
        createdAt: '2026-10-10T06:16:00Z',
      },
    ],
    source: 'manual',
    createdAt: '2026-10-10T06:30:00Z',
    updatedAt: '2026-10-10T06:30:00Z',
  },
  {
    id: 'act-2',
    title: 'Compound Strength Training & Mobility',
    categoryId: 'health',
    description: 'Deadlifts (5x5 @ 140kg), weighted pullups (+20kg 4x6), overhead press (4x8), followed by 15 minutes thoracic spine mobility.',
    startedAt: '2026-10-10T07:00:00Z',
    endedAt: '2026-10-10T08:15:00Z',
    tags: ['gym', 'strength', 'deadlifts'],
    attachments: [
      {
        id: 'att-2',
        url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
        originalName: 'gym_session.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 312000,
        caption: 'Deadlift top set verified and logged',
        createdAt: '2026-10-10T08:10:00Z',
      },
    ],
    source: 'timer',
    createdAt: '2026-10-10T08:15:00Z',
    updatedAt: '2026-10-10T08:15:00Z',
  },
  {
    id: 'act-3',
    title: 'University Business Lesson & Case Analysis',
    categoryId: 'education',
    description: 'Attended corporate finance and strategic moats lecture. Submitted case study on distribution lock-in and switching cost dynamics. Uploaded notes to knowledge engine for AI quiz synthesis.',
    startedAt: '2026-10-10T09:30:00Z',
    endedAt: '2026-10-10T11:45:00Z',
    tags: ['university', 'business', 'case-study', 'finance'],
    attachments: [
      {
        id: 'att-3',
        url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
        originalName: 'lecture_notes.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 420000,
        caption: 'Whiteboard notes on sustainable enterprise moats',
        createdAt: '2026-10-10T11:40:00Z',
      },
    ],
    source: 'manual',
    createdAt: '2026-10-10T11:50:00Z',
    updatedAt: '2026-10-10T11:50:00Z',
  },
  {
    id: 'act-4',
    title: 'Personal Life OS Architecture & GitHub Sync',
    categoryId: 'coding',
    description: 'Engineered contribution calendar, timeline filters, and local data persistence. Linked repository to GitHub and configured Vercel deployment pipeline.',
    startedAt: '2026-10-10T13:30:00Z',
    endedAt: '2026-10-10T16:15:00Z',
    tags: ['react', 'nextjs', 'typescript', 'personal-os', 'architecture'],
    projectId: 'proj-1',
    githubRepo: 'sanjarbekweb/regret-os',
    githubCommit: 'd0b6da2 - Personal Life OS initial architecture',
    vercelUrl: 'https://regret-os.vercel.app',
    attachments: [
      {
        id: 'att-4',
        url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        originalName: 'code_ide.png',
        mimeType: 'image/png',
        sizeBytes: 520000,
        caption: 'Next.js App Router and TypeScript data models implementation',
        createdAt: '2026-10-10T16:10:00Z',
      },
    ],
    source: 'manual',
    createdAt: '2026-10-10T16:15:00Z',
    updatedAt: '2026-10-10T16:15:00Z',
  },
  {
    id: 'act-5',
    title: 'Reading "Deep Work" by Cal Newport',
    categoryId: 'reading',
    description: 'Analyzed Chapter 3: The Law of the Vital Few. Re-evaluating time allocation and social media fragmentation.',
    startedAt: '2026-10-10T17:00:00Z',
    endedAt: '2026-10-10T18:00:00Z',
    tags: ['books', 'cal-newport', 'focus', 'deep-work'],
    bookQuote: {
      bookTitle: 'Deep Work: Rules for Focused Success in a Distracted World',
      author: 'Cal Newport',
      quote: 'If you do not produce, you will not thrive—no matter how skilled or how talented you are.',
      pageNumber: 32,
    },
    attachments: [
      {
        id: 'att-5',
        url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
        originalName: 'book_quote.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 380000,
        caption: 'Highlighted quote from Chapter 3',
        createdAt: '2026-10-10T17:55:00Z',
      },
    ],
    source: 'manual',
    createdAt: '2026-10-10T18:00:00Z',
    updatedAt: '2026-10-10T18:00:00Z',
  },
  {
    id: 'act-6',
    title: 'F1 Italian Grand Prix Monza Telemetry Breakdown',
    categoryId: 'entertainment',
    description: 'Examined high-speed aerodynamic balance, low downforce wing configurations, and tire thermal degradation across stints.',
    startedAt: '2026-10-10T19:00:00Z',
    endedAt: '2026-10-10T20:15:00Z',
    tags: ['f1', 'monza', 'telemetry', 'ferrari', 'motorsport'],
    mediaDetails: {
      type: 'f1',
      title: 'Monza Grand Prix Telemetry & Stint Analysis',
      authorOrArtist: 'Formula 1 Technical Analysis',
      rating: 5,
      url: 'https://formula1.com',
    },
    attachments: [
      {
        id: 'att-6',
        url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
        originalName: 'f1_telemetry.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 460000,
        caption: 'Telemetry speed trap data through Curva Grande and Parabolica',
        createdAt: '2026-10-10T20:10:00Z',
      },
    ],
    source: 'manual',
    createdAt: '2026-10-10T20:15:00Z',
    updatedAt: '2026-10-10T20:15:00Z',
  },
  {
    id: 'act-7',
    title: 'Evening Coffee & Discussion with Friends',
    categoryId: 'social',
    description: 'Met with university peers to debate startup thesis, computer science research trajectories, and 2027 grad school options.',
    startedAt: '2026-10-10T20:30:00Z',
    endedAt: '2026-10-10T22:00:00Z',
    tags: ['friends', 'networking', 'coffee', 'discussions'],
    attachments: [],
    source: 'manual',
    createdAt: '2026-10-10T22:05:00Z',
    updatedAt: '2026-10-10T22:05:00Z',
  },
  {
    id: 'act-8',
    title: 'Hans Zimmer — Interstellar Live Soundtrack Session',
    categoryId: 'media',
    description: 'Listening session to "Cornfield Chase" and "No Time for Caution" while reviewing vocabulary flashcards.',
    startedAt: '2026-10-10T22:15:00Z',
    endedAt: '2026-10-10T22:45:00Z',
    tags: ['music', 'hans-zimmer', 'soundtrack', 'focus'],
    mediaDetails: {
      type: 'music',
      title: 'Interstellar Original Motion Picture Soundtrack',
      authorOrArtist: 'Hans Zimmer',
      rating: 5,
      url: 'https://open.spotify.com/album/4vjR6wz6g90K',
    },
    attachments: [],
    source: 'manual',
    createdAt: '2026-10-10T22:45:00Z',
    updatedAt: '2026-10-10T22:45:00Z',
  },
];

export function generatePastHabitCompletions(): HabitCompletion[] {
  const completions: HabitCompletion[] = [];
  const today = new Date('2026-10-10');

  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const dayOfWeek = d.getDay();
    const seed = (i * 17 + dayOfWeek * 31) % 100;

    if (seed > 15) {
      completions.push({
        id: `hc-${i}-1`,
        habitId: 'h-1',
        completedOn: dateStr,
      });
    }

    if (dayOfWeek !== 0 && seed > 35) {
      completions.push({
        id: `hc-${i}-2`,
        habitId: 'h-2',
        completedOn: dateStr,
      });
    }

    if (seed > 20) {
      completions.push({
        id: `hc-${i}-3`,
        habitId: 'h-3',
        completedOn: dateStr,
      });
    }

    if (seed > 30) {
      completions.push({
        id: `hc-${i}-4`,
        habitId: 'h-4',
        completedOn: dateStr,
      });
    }

    if (seed > 25) {
      completions.push({
        id: `hc-${i}-5`,
        habitId: 'h-5',
        completedOn: dateStr,
      });
    }
  }

  return completions;
}

export function generatePastActivities(): Activity[] {
  const past: Activity[] = [...INITIAL_ACTIVITIES];
  const today = new Date('2026-10-10');

  const categories: Array<Activity['categoryId']> = [
    'personal',
    'health',
    'education',
    'coding',
    'reading',
    'knowledge',
    'social',
    'entertainment',
  ];

  for (let i = 1; i <= 60; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const numActivities = ((i * 7 + 3) % 4) + 1;

    for (let k = 0; k < numActivities; k++) {
      const cat = categories[(i + k) % categories.length];
      const hour = 8 + k * 3;
      const started = `${dateStr}T${hour < 10 ? '0' + hour : hour}:00:00Z`;
      const ended = `${dateStr}T${hour + 1 < 10 ? '0' + (hour + 1) : hour + 1}:15:00Z`;

      past.push({
        id: `hist-${i}-${k}`,
        title: `${cat.charAt(0).toUpperCase() + cat.slice(1)} Session - Day -${i}`,
        categoryId: cat,
        description: `Routine activity record logged for ${cat} on ${dateStr}. Complete focus and metrics documented.`,
        startedAt: started,
        endedAt: ended,
        tags: [cat, 'archive'],
        attachments: [],
        source: 'manual',
        createdAt: started,
        updatedAt: started,
      });
    }
  }

  return past;
}

const STORAGE_KEYS = {
  ACTIVITIES: 'regret_activities_v1',
  HABITS: 'regret_habits_v1',
  HABIT_COMPLETIONS: 'regret_completions_v1',
  FLASHCARDS: 'regret_flashcards_v1',
  VOCABULARY: 'regret_vocabulary_v1',
  KNOWLEDGE_DOCS: 'regret_knowledge_v1',
  PROJECTS: 'regret_projects_v1',
  COUNTDOWNS: 'regret_countdowns_v1',
  OPENAI_API_KEY: 'regret_openai_key_v1',
};

class StorageService {
  private memActivities: Activity[] | null = null;
  private memHabits: Habit[] | null = null;
  private memCompletions: HabitCompletion[] | null = null;
  private memFlashcards: Flashcard[] | null = null;
  private memVocabulary: VocabularyWord[] | null = null;
  private memKnowledge: KnowledgeDocument[] | null = null;
  private memProjects: Project[] | null = null;
  private memCountdowns: Countdown[] | null = null;
  private memApiKey: string = '';

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  getActivities(): Activity[] {
    if (!this.isBrowser()) {
      if (!this.memActivities) {
        this.memActivities = [...INITIAL_ACTIVITIES];
      }
      return [...this.memActivities];
    }
    const item = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (!item) {
      const initial = generatePastActivities();
      this.saveActivities(initial);
      return initial;
    }
    try {
      return JSON.parse(item);
    } catch {
      return [...INITIAL_ACTIVITIES];
    }
  }

  saveActivities(activities: Activity[]): void {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    } else {
      this.memActivities = [...activities];
    }
  }

  addActivity(activity: Activity): void {
    const list = this.getActivities();
    list.unshift(activity);
    this.saveActivities(list);
  }

  deleteActivity(id: string): void {
    const list = this.getActivities().filter(a => a.id !== id);
    this.saveActivities(list);
  }

  updateActivity(activity: Activity): void {
    const list = this.getActivities().map(a => (a.id === activity.id ? activity : a));
    this.saveActivities(list);
  }

  getHabits(): Habit[] {
    if (!this.isBrowser()) {
      if (!this.memHabits) this.memHabits = [...INITIAL_HABITS];
      return [...this.memHabits];
    }
    const item = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (!item) {
      this.saveHabits(INITIAL_HABITS);
      return [...INITIAL_HABITS];
    }
    try {
      return JSON.parse(item);
    } catch {
      return [...INITIAL_HABITS];
    }
  }

  saveHabits(habits: Habit[]): void {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    } else {
      this.memHabits = [...habits];
    }
  }

  getHabitCompletions(): HabitCompletion[] {
    if (!this.isBrowser()) {
      if (!this.memCompletions) this.memCompletions = generatePastHabitCompletions();
      return [...this.memCompletions];
    }
    const item = localStorage.getItem(STORAGE_KEYS.HABIT_COMPLETIONS);
    if (!item) {
      const initial = generatePastHabitCompletions();
      this.saveHabitCompletions(initial);
      return initial;
    }
    try {
      return JSON.parse(item);
    } catch {
      return generatePastHabitCompletions();
    }
  }

  saveHabitCompletions(completions: HabitCompletion[]): void {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.HABIT_COMPLETIONS, JSON.stringify(completions));
    } else {
      this.memCompletions = [...completions];
    }
  }

  toggleHabitCompletion(habitId: string, date: string): boolean {
    const completions = this.getHabitCompletions();
    const existingIdx = completions.findIndex(c => c.habitId === habitId && c.completedOn === date);
    if (existingIdx >= 0) {
      completions.splice(existingIdx, 1);
      this.saveHabitCompletions(completions);
      return false;
    } else {
      completions.push({
        id: `hc-${Date.now()}`,
        habitId,
        completedOn: date,
      });
      this.saveHabitCompletions(completions);
      return true;
    }
  }

  getFlashcards(): Flashcard[] {
    if (!this.isBrowser()) {
      if (!this.memFlashcards) this.memFlashcards = [...INITIAL_FLASHCARDS];
      return [...this.memFlashcards];
    }
    const item = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
    if (!item) {
      this.saveFlashcards(INITIAL_FLASHCARDS);
      return [...INITIAL_FLASHCARDS];
    }
    try {
      return JSON.parse(item);
    } catch {
      return [...INITIAL_FLASHCARDS];
    }
  }

  saveFlashcards(flashcards: Flashcard[]): void {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(flashcards));
    } else {
      this.memFlashcards = [...flashcards];
    }
  }

  addFlashcard(card: Flashcard): void {
    const list = this.getFlashcards();
    list.unshift(card);
    this.saveFlashcards(list);
  }

  updateFlashcard(card: Flashcard): void {
    const list = this.getFlashcards().map(c => (c.id === card.id ? card : c));
    this.saveFlashcards(list);
  }

  getVocabulary(): VocabularyWord[] {
    if (!this.isBrowser()) {
      if (!this.memVocabulary) this.memVocabulary = [...INITIAL_VOCABULARY];
      return [...this.memVocabulary];
    }
    const item = localStorage.getItem(STORAGE_KEYS.VOCABULARY);
    if (!item) {
      this.saveVocabulary(INITIAL_VOCABULARY);
      return [...INITIAL_VOCABULARY];
    }
    try {
      return JSON.parse(item);
    } catch {
      return [...INITIAL_VOCABULARY];
    }
  }

  saveVocabulary(words: VocabularyWord[]): void {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.VOCABULARY, JSON.stringify(words));
    } else {
      this.memVocabulary = [...words];
    }
  }

  addVocabularyWord(word: VocabularyWord): void {
    const list = this.getVocabulary();
    list.unshift(word);
    this.saveVocabulary(list);
  }

  getKnowledgeDocs(): KnowledgeDocument[] {
    if (!this.isBrowser()) {
      if (!this.memKnowledge) this.memKnowledge = [...INITIAL_KNOWLEDGE_DOCS];
      return [...this.memKnowledge];
    }
    const item = localStorage.getItem(STORAGE_KEYS.KNOWLEDGE_DOCS);
    if (!item) {
      this.saveKnowledgeDocs(INITIAL_KNOWLEDGE_DOCS);
      return [...INITIAL_KNOWLEDGE_DOCS];
    }
    try {
      return JSON.parse(item);
    } catch {
      return [...INITIAL_KNOWLEDGE_DOCS];
    }
  }

  saveKnowledgeDocs(docs: KnowledgeDocument[]): void {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_DOCS, JSON.stringify(docs));
    } else {
      this.memKnowledge = [...docs];
    }
  }

  addKnowledgeDoc(doc: KnowledgeDocument): void {
    const list = this.getKnowledgeDocs();
    list.unshift(doc);
    this.saveKnowledgeDocs(list);
  }

  getProjects(): Project[] {
    if (!this.isBrowser()) {
      if (!this.memProjects) this.memProjects = [...INITIAL_PROJECTS];
      return [...this.memProjects];
    }
    const item = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!item) {
      this.saveProjects(INITIAL_PROJECTS);
      return [...INITIAL_PROJECTS];
    }
    try {
      return JSON.parse(item);
    } catch {
      return [...INITIAL_PROJECTS];
    }
  }

  saveProjects(projects: Project[]): void {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } else {
      this.memProjects = [...projects];
    }
  }

  addProject(project: Project): void {
    const list = this.getProjects();
    list.unshift(project);
    this.saveProjects(list);
  }

  getCountdowns(): Countdown[] {
    if (!this.isBrowser()) {
      if (!this.memCountdowns) this.memCountdowns = [...INITIAL_COUNTDOWNS];
      return [...this.memCountdowns];
    }
    const item = localStorage.getItem(STORAGE_KEYS.COUNTDOWNS);
    if (!item) {
      this.saveCountdowns(INITIAL_COUNTDOWNS);
      return [...INITIAL_COUNTDOWNS];
    }
    try {
      return JSON.parse(item);
    } catch {
      return [...INITIAL_COUNTDOWNS];
    }
  }

  saveCountdowns(countdowns: Countdown[]): void {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.COUNTDOWNS, JSON.stringify(countdowns));
    } else {
      this.memCountdowns = [...countdowns];
    }
  }

  addCountdown(countdown: Countdown): void {
    const list = this.getCountdowns();
    list.push(countdown);
    this.saveCountdowns(list);
  }

  toggleCountdownChecklist(countdownId: string, checklistId: string): void {
    const list = this.getCountdowns().map(cd => {
      if (cd.id === countdownId && cd.checklist) {
        return {
          ...cd,
          checklist: cd.checklist.map(item =>
            item.id === checklistId ? { ...item, done: !item.done } : item
          ),
        };
      }
      return cd;
    });
    this.saveCountdowns(list);
  }

  getApiKey(): string {
    if (!this.isBrowser()) return this.memApiKey;
    return localStorage.getItem(STORAGE_KEYS.OPENAI_API_KEY) || this.memApiKey;
  }

  saveApiKey(key: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.OPENAI_API_KEY, key);
    } else {
      this.memApiKey = key;
    }
  }

  // Backup & Permanent Export to JSON
  exportAllData(): string {
    const exportBundle = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      activities: this.getActivities(),
      habits: this.getHabits(),
      habitCompletions: this.getHabitCompletions(),
      flashcards: this.getFlashcards(),
      vocabulary: this.getVocabulary(),
      knowledgeDocs: this.getKnowledgeDocs(),
      projects: this.getProjects(),
      countdowns: this.getCountdowns(),
    };
    return JSON.stringify(exportBundle, null, 2);
  }

  importAllData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.activities) this.saveActivities(data.activities);
      if (data.habits) this.saveHabits(data.habits);
      if (data.habitCompletions) this.saveHabitCompletions(data.habitCompletions);
      if (data.flashcards) this.saveFlashcards(data.flashcards);
      if (data.vocabulary) this.saveVocabulary(data.vocabulary);
      if (data.knowledgeDocs) this.saveKnowledgeDocs(data.knowledgeDocs);
      if (data.projects) this.saveProjects(data.projects);
      if (data.countdowns) this.saveCountdowns(data.countdowns);
      return true;
    } catch (e) {
      console.error('Failed to import backup data:', e);
      return false;
    }
  }

  resetToDefault(): void {
    if (this.isBrowser()) {
      localStorage.clear();
    }
    this.memActivities = null;
    this.memHabits = null;
    this.memCompletions = null;
    this.memFlashcards = null;
    this.memVocabulary = null;
    this.memKnowledge = null;
    this.memProjects = null;
    this.memCountdowns = null;
    this.saveActivities(generatePastActivities());
    this.saveHabits(INITIAL_HABITS);
    this.saveHabitCompletions(generatePastHabitCompletions());
    this.saveFlashcards(INITIAL_FLASHCARDS);
    this.saveVocabulary(INITIAL_VOCABULARY);
    this.saveKnowledgeDocs(INITIAL_KNOWLEDGE_DOCS);
    this.saveProjects(INITIAL_PROJECTS);
    this.saveCountdowns(INITIAL_COUNTDOWNS);
  }
}

export const storage = new StorageService();
