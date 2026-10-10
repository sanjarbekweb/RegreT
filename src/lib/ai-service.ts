import { Flashcard, QuizQuestion } from './types';

export interface AIGeneratedContent {
  summary: string;
  keyTakeaways: string[];
  quizzes: QuizQuestion[];
  flashcards: { front: string; back: string; category: string }[];
}

/**
 * Intelligent Learning Content Engine
 * Extracts key points, generates interactive quizzes, and produces spaced repetition flashcards.
 * Can be executed locally or connected to an LLM provider.
 */
export async function generateLearningMaterials(
  topic: string,
  content: string,
  apiKey?: string
): Promise<AIGeneratedContent> {
  if (apiKey && apiKey.trim().length > 0) {
    try {
      return await callLLMApi(topic, content, apiKey);
    } catch (err) {
      console.warn('LLM API call failed, falling back to local semantic generator:', err);
    }
  }

  return generateLocalSmartContent(topic, content);
}

function generateLocalSmartContent(topic: string, content: string): AIGeneratedContent {
  const cleanContent = content.trim();
  const sentences = cleanContent
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 15);

  const paragraphs = cleanContent
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 20);

  // 1. Generate Summary
  const topSentences = sentences.slice(0, Math.min(4, sentences.length));
  const summary =
    topSentences.length > 0
      ? topSentences.join(' ')
      : `Comprehensive study guide and analysis for ${topic}. This module breaks down core definitions, strategic concepts, and practical applications.`;

  // 2. Generate Key Takeaways
  const keyTakeaways: string[] = [];
  if (paragraphs.length >= 2) {
    paragraphs.slice(0, 5).forEach(p => {
      const firstSentence = p.split('.')[0];
      if (firstSentence && firstSentence.length > 15) {
        keyTakeaways.push(firstSentence.trim());
      }
    });
  } else if (sentences.length >= 3) {
    sentences.slice(0, 4).forEach(s => keyTakeaways.push(s));
  } else {
    keyTakeaways.push(
      `Core fundamentals and principles governing ${topic}.`,
      `Critical terminology, relationships, and operational strategies.`,
      `Practical real-world application, edge-cases, and evaluation criteria.`
    );
  }

  // 3. Generate Quizzes
  const quizzes: QuizQuestion[] = [];
  // Analyze key terms or sentences
  const termMatches = cleanContent.match(/([A-Z][a-zA-Z\s]{2,25}):\s*([^.\n]+)/g) || [];

  if (termMatches.length >= 2) {
    termMatches.slice(0, 4).forEach((match, idx) => {
      const parts = match.split(/:\s*/);
      const term = parts[0].trim();
      const def = parts[1].trim();

      quizzes.push({
        id: `q-${Date.now()}-${idx}`,
        question: `In the context of ${topic}, what is the primary definition of "${term}"?`,
        options: [
          def,
          `An auxiliary framework unrelated to ${term} standard workflows.`,
          `A legacy methodology superseded by decentralized mechanisms.`,
          `A redundant constraint that occurs during edge failure states.`,
        ],
        correctIndex: 0,
        explanation: `${term} is explicitly defined as: ${def}.`,
      });
    });
  }

  // Fallback / standard questions if termMatches was sparse
  if (quizzes.length < 3) {
    quizzes.push(
      {
        id: `q-${Date.now()}-1`,
        question: `What represents the foundational objective of ${topic}?`,
        options: [
          `To systematize core processes, mitigate risks, and maximize operational throughput.`,
          `To minimize documentation and eliminate quantitative metrics entirely.`,
          `To decouple execution from verification protocols.`,
          `To replace deterministic logic with unvalidated heuristics.`,
        ],
        correctIndex: 0,
        explanation: `The foundational objective of ${topic} focuses on systematic execution, risk mitigation, and continuous verification.`,
      },
      {
        id: `q-${Date.now()}-2`,
        question: `When analyzing key principles within ${topic}, which practice ensures the highest consistency?`,
        options: [
          `Ad-hoc intervention without structured timeline tracking.`,
          `Standardized review cycles, spaced repetition, and objective logging.`,
          `Disregarding baseline feedback and prior session outcomes.`,
          `Relying purely on passive observation without active testing.`,
        ],
        correctIndex: 1,
        explanation: `Systematic review cycles, spaced repetition, and objective activity logging guarantee sustained retention and consistency.`,
      },
      {
        id: `q-${Date.now()}-3`,
        question: `How should complex problem domains in ${topic} be systematically decomposed?`,
        options: [
          `By isolating first principles, mapping dependencies, and iteratively validating each component.`,
          `By attempting complete end-to-end deployment without modular boundaries.`,
          `By skipping intermediate proofs and focusing only on output cosmetics.`,
          `By ignoring edge-cases and error paths.`,
        ],
        correctIndex: 0,
        explanation: `Decomposing into first principles and validating modular dependencies prevents cascading failures.`,
      }
    );
  }

  // 4. Generate Spaced Repetition Flashcards
  const flashcards: { front: string; back: string; category: string }[] = [];

  if (termMatches.length > 0) {
    termMatches.forEach(match => {
      const parts = match.split(/:\s*/);
      flashcards.push({
        front: parts[0].trim(),
        back: parts[1].trim(),
        category: topic,
      });
    });
  }

  if (flashcards.length < 4) {
    // Generate from sentences or key concepts
    flashcards.push(
      {
        front: `Core Thesis of ${topic}`,
        back: summary.slice(0, 180),
        category: topic,
      },
      {
        front: `Key Takeaway #1 (${topic})`,
        back: keyTakeaways[0] || `Fundamental operational mechanism of ${topic}.`,
        category: topic,
      },
      {
        front: `Primary Verification Metric (${topic})`,
        back: `Quantitative feedback loops and empirical consistency over time.`,
        category: topic,
      },
      {
        front: `Practical Rule of Thumb (${topic})`,
        back: `Break down goals into atomic daily units and track every milestone.`,
        category: topic,
      }
    );
  }

  return {
    summary,
    keyTakeaways,
    quizzes,
    flashcards,
  };
}

async function callLLMApi(topic: string, content: string, apiKey: string): Promise<AIGeneratedContent> {
  const prompt = `You are an expert AI tutor and personal learning coach.
Topic: ${topic}
Content:
${content}

Generate structured study materials in valid JSON format with keys:
- "summary": A clear 2-3 paragraph summary of the lesson.
- "keyTakeaways": Array of 3-5 concise bullet points.
- "quizzes": Array of 3-4 objects with { "id": string, "question": string, "options": string[4], "correctIndex": number (0-3), "explanation": string }
- "flashcards": Array of 4-6 objects with { "front": string, "back": string, "category": string }

Respond with raw JSON only.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API returned status ${res.status}`);
  }

  const data = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  return {
    summary: parsed.summary || '',
    keyTakeaways: parsed.keyTakeaways || [],
    quizzes: parsed.quizzes || [],
    flashcards: parsed.flashcards || [],
  };
}
