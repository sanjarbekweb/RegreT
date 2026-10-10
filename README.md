# RegreT — Personal Life Operating System

> High-performance personal knowledge base, chronological life log, AI learning engine, consistency tracker, and developer studio.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide icons, SuperMemo SM-2 spaced repetition, and PostgreSQL / Supabase architecture.

---

## Visual Design Philosophy

- **Background:** `#090D12`
- **Sidebar:** `#0D131B`
- **Surface:** `#111923`
- **Elevated:** `#17212D`
- **Border:** `#263342`
- **Primary Blue:** `#3985F6`
- **Primary Text:** `#F1F5F9`
- **Muted Text:** `#94A3B8`
- **Success:** `#36B58A`
- **Zero Emojis, Zero Stickers, Zero Gradients, Zero Decorative Text.**
- Precision technical typography and clean SVG icons.

---

## Core Pillars & Modules

### 1. Life Timeline & Activity Logging (`/timeline`, `/capture`)
- Chronological stream of activities with photos, notes, timestamps, categories, and tags.
- Categories: **Personal** (wake up, routine), **Health** (workouts, sleep), **Education** (lessons, homework), **Coding** (projects, commits, deployments), **Reading** (books, quotes, papers), **Knowledge** (business, science), **Social** (meetings, friends), **Entertainment** (Formula 1, anime, films), **Media** (music tracks), **Goals** (applications, milestones).
- Multi-photo attachment support with captions and lightbox modal viewer.
- Live Session Timer: start, pause, resume, and save activities with duration metrics.
- Literature quotations with author, book title, and page number citations.

### 2. Consistency Tracker (`/calendar`)
- GitHub-style contribution calendar heatmap (16-24 weeks / 1 year) with activity density levels.
- Streak statistics: Current streak, Longest streak, Total active days, and category filters.
- 7-Day interactive habit adherence matrix for daily routine check-offs.

### 3. Knowledge Vault & AI Learning Engine (`/knowledge`)
- Ingest lesson notes, business topics, lectures, and research papers.
- AI engine generates:
  - Executive Summaries
  - Key Conceptual Takeaways
  - Multiple Choice Quizzes with instant grading and explanations
  - Spaced Repetition Flashcards scheduled into the deck.

### 4. Vocabulary Memorizer & Spaced Repetition (`/vocabulary`)
- SuperMemo SM-2 algorithm: `Again (<1d)`, `Hard (2d)`, `Good (4d)`, `Easy (7d)`.
- Tracks interval days, ease factors, repetitions, and due dates.
- Interactive flashcard review mode with flip-to-reveal answers.

### 5. Project Studio (`/projects`)
- Connect GitHub repositories, commits, and Vercel deployments.
- Attach UI screenshots, architecture documentation, and tech stacks.
- Automatically associate coding activities with projects.

### 6. Countdowns & Deadlines Hub (`/countdowns`)
- Live countdown tickers for university applications (Oxford, Stanford, MIT), exams (IELTS, SAT, GRE), and competitions.
- Action checklists (SOP, recommendation letters, transcripts).
- Priority ranking: Urgent, High, Medium, Low.

### 7. Universal Search (`/search`)
- Unified search indexing across activities, lessons, vocabulary, projects, and deadlines.

### 8. Permanent Storage & Backups (`/settings`)
- Local persistent storage with zero external data leakage.
- One-click JSON backup export and restore.
- Production PostgreSQL & Supabase SQL migration schema included in `supabase/migrations/`.

---

## Getting Started

### Prerequisites
- Node.js 18+ (tested on Node.js 24)
- npm or pnpm

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/sanjarbekweb/RegreT.git
cd RegreT

# Install dependencies
npm install

# Run automated test suite (Vitest)
npm test

# Build production bundle
npm run build

# Start local server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the application.