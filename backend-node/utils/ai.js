const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.8-flash'
];

let geminiClient = null;
if (GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenerativeAI(GEMINI_API_KEY);
  } catch (err) {
    console.warn('[AI Engine] Failed initializing GoogleGenerativeAI client:', err.message);
  }
}

/**
 * Google Gemini LLM Caller
 * Uses gemini-3.5-flash-lite primarily and cycles through Gemini fallback models if needed.
 */
async function callLLM(prompt, systemInstruction = "You are EduAssist, an advanced, accurate, and structured academic AI tutor.") {
  if (!geminiClient) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  let lastErr = null;
  for (const modelName of [...new Set(GEMINI_MODELS)]) {
    try {
      const model = geminiClient.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text && text.trim().length > 0) {
        return text.trim();
      }
    } catch (err) {
      lastErr = err;
      console.warn(`[Gemini Engine] ${modelName} call failed (${err.message.slice(0, 80)}). Trying next...`);
    }
  }

  throw new Error(`Google Gemini request failed: ${lastErr ? lastErr.message : 'No response generated'}`);
}

/**
 * Generate Spaced Repetition Flashcards from text
 */
async function generateFlashcards(text, sourceType = 'text') {
  const prompt = `You are an expert curriculum designer. Based on the following study material, generate 5 to 10 spaced-repetition flashcards.
Text:
${text.slice(0, 10000)}

Requirements:
- Test core definitions, problem-solving formulas, and examination edge cases.
- Use a mix of "front_back" question/answer and "cloze" fill-in-the-blank style with {{blank}}.
- Assign realistic difficulty: "easy", "medium", or "hard".
- Reply ONLY with a valid JSON array matching this format:
[
  {
    "front": "Question prompt or cloze sentence with {{blank}}",
    "back": "Direct concise answer",
    "type": "front_back",
    "hint": "Helpful cognitive memory cue",
    "difficulty": "medium",
    "tags": "CoreConcept"
  }
]`;

  try {
    const raw = await callLLM(prompt, "You are a flashcard generator. Reply ONLY with a valid JSON array.");
    let cleaned = raw.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    }
    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']');
    if (start !== -1 && end !== -1 && end > start) {
      cleaned = cleaned.substring(start, end + 1);
    }
    const cards = JSON.parse(cleaned);
    if (Array.isArray(cards) && cards.length > 0) {
      return cards;
    }
  } catch (err) {
    console.warn('[AI Flashcards] Parsing error:', err.message);
  }

  // Dynamic sentence-based fallback if parsing fails
  return generateDynamicCards(text, sourceType);
}

/**
 * Generate Structured Notes, Key Points, Formula Sheet & Mind Map
 */
async function generateStructuredNotes(text, title = "Lecture Notes", detailLevel = "DETAILED") {
  const prompt = `You are an elite academic professor. Analyze this study material and produce comprehensive revision materials.
Title: "${title}"
Detail Level: ${detailLevel}
Material:
${text.slice(0, 12000)}

Return ONLY a valid JSON object matching this schema:
{
  "summary": "Concise 3-4 sentence academic executive summary",
  "keyPoints": [
    "Key takeaway 1 with specific definitions",
    "Key takeaway 2 with operational mechanics",
    "Key takeaway 3 with problem-solving approach"
  ],
  "contentMarkdown": "# ${title}\\n\\n## 1. Overview\\nDetailed content here with KaTeX math like $E = mc^2$ or $\\\\frac{d}{dx}f(x)$ where relevant...\\n\\n## 2. Core Principles\\nDetailed breakdown with comparison tables where useful...\\n\\n## 3. Examination Focus Points\\nKey things to remember.",
  "formulas": [
    { "name": "Formula Name", "equation": "$$\\\\text{Formula}$$", "description": "When to apply" }
  ],
  "mindmap": {
    "label": "${title}",
    "children": [
      {
        "label": "Foundation",
        "children": ["Concept 1", "Concept 2"]
      },
      {
        "label": "Methodology",
        "children": ["Step A", "Step B"]
      },
      {
        "label": "Diagnostics & Applications",
        "children": ["Use Case 1", "Evaluation"]
      }
    ]
  }
}`;

  try {
    const raw = await callLLM(prompt, "You are an academic textbook author and knowledge graph architect. Reply ONLY with a valid JSON object.");
    let cleaned = raw.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    }
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      cleaned = cleaned.substring(start, end + 1);
    }
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn('[AI Notes] Parsing error:', err.message);
    return {
      summary: `Synthesized lecture material for ${title}.`,
      keyPoints: [
        `Core theoretical foundations and primary definitions for ${title}.`,
        `Analytical problem-solving methodologies and computational derivations.`,
        `Key examination checkpoints and diagnostic applications.`
      ],
      contentMarkdown: `# ${title}\n\n## Summary\nComprehensive synthesized notes for ${title}.\n\n## Key Takeaways\n- Master fundamental definitions and axioms.\n- Practice relevant step-by-step problem sets.`,
      formulas: [],
      mindmap: {
        label: title,
        children: [
          { label: "Core Principles", children: ["Foundations", "Definitions"] },
          { label: "Methodology", children: ["Mechanics", "Problem Solving"] },
          { label: "Review", children: ["Practice Questions", "Diagnostics"] }
        ]
      }
    };
  }
}

/**
 * Generate Timed Exam Questions (MCQ, Short Answer, Coding)
 */
async function generateQuizQuestions(text, options = {}) {
  const { title = "Academic Assessment", count = 5, difficulty = "medium" } = options;
  const prompt = `Based on the following material, generate ${count} examination questions suitable for a timed test.
Title: "${title}"
Target Difficulty: ${difficulty}
Material:
${text.slice(0, 10000)}

Requirements:
- Generate high-quality questions (multiple-choice or short-answer).
- Provide 4 distinct choices for MCQs, with clear correct answers and rigorous explanations.
- Reply ONLY with a valid JSON array:
[
  {
    "id": "q1",
    "type": "MCQ",
    "prompt": "Clear, precise question prompt",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Detailed step-by-step reasoning why Option A is correct and why other choices are misconceptions.",
    "difficulty": "${difficulty}"
  }
]`;

  try {
    const raw = await callLLM(prompt, "You are a strict academic examiner. Reply ONLY with a valid JSON array.");
    let cleaned = raw.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    }
    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']');
    if (start !== -1 && end !== -1 && end > start) {
      cleaned = cleaned.substring(start, end + 1);
    }
    const questions = JSON.parse(cleaned);
    if (Array.isArray(questions) && questions.length > 0) {
      return questions;
    }
  } catch (err) {
    console.warn('[AI Quiz] Parsing error:', err.message);
  }

  // Fallback questions based on material
  return [
    {
      id: "q1",
      type: "MCQ",
      prompt: `Which of the following best characterizes the primary objective of ${title}?`,
      options: [
        `Understanding fundamental axioms and structural properties of ${title}.`,
        "Memorizing disconnected historical trivia.",
        "Ignoring boundary constraints and test conditions.",
        "None of the above."
      ],
      correctAnswer: `Understanding fundamental axioms and structural properties of ${title}.`,
      explanation: `The uploaded study material focuses directly on establishing foundational mechanics and core definitions for ${title}.`,
      difficulty: "medium"
    }
  ];
}

/**
 * Conversational Academic Tutor with specialized Pedagogical Modes
 */
async function generateTutorResponse(messages, mode = "EXPLAIN") {
  const modeInstructions = {
    EXPLAIN: "Explain complex concepts clearly using intuitive analogies, real-world examples, and step-by-step breakdowns. Format equations in KaTeX ($...$).",
    EXAM_PREP: "Act as an exam coach. Highlight high-yield points, common exam pitfalls, marking scheme criteria, and expected test questions.",
    SOCRATIC: "Do NOT reveal answers directly. Guide the student by asking thought-provoking follow-up questions that challenge their logic and test their understanding step by step.",
    PROBLEM_SOLVING: "Break down the problem systematically: 1) Given values, 2) Governing formula, 3) Step-by-step calculation, 4) Final verification.",
    INTERVIEW_PREP: "Act as a technical or academic interviewer. Evaluate the student's answer, score it for rigor, and ask deep follow-up questions."
  };

  const systemPrompt = `You are EduAssist, an elite academic assistant.
Mode: ${mode}
Pedagogical Rule: ${modeInstructions[mode] || modeInstructions.EXPLAIN}
Always respond with clarity, mathematical accuracy, and high academic rigor. Format formulas using KaTeX ($inline$ or $$display$$).`;

  const conversationText = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
  const prompt = `${conversationText}\n\nASSISTANT:`;

  return await callLLM(prompt, systemPrompt);
}

/**
 * Dynamic fallback cards for any user content
 */
function generateDynamicCards(text, sourceType) {
  const clean = text.trim();
  const sentences = clean.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
  const cards = [];

  for (let i = 0; i < Math.min(sentences.length, 5); i++) {
    const s = sentences[i];
    const words = s.split(/\s+/).filter(w => w.length > 4);
    if (words.length > 3) {
      const target = words[Math.floor(words.length / 2)].replace(/[^a-zA-Z0-9]/g, '');
      const cloze = s.replace(new RegExp(`\\b${target}\\b`, 'i'), `{{${target}}}`);
      cards.push({
        front: cloze,
        back: target,
        type: "cloze",
        hint: `Key term in ${sourceType}`,
        difficulty: i % 2 === 0 ? "medium" : "easy",
        tags: sourceType
      });
    } else {
      cards.push({
        front: `What is the significance of: "${s.slice(0, 100)}..."?`,
        back: s,
        type: "front_back",
        hint: "Review core notes",
        difficulty: "medium",
        tags: sourceType
      });
    }
  }

  return cards.length > 0 ? cards : [
    {
      front: `What is the primary topic discussed in these ${sourceType} notes?`,
      back: clean.slice(0, 200),
      type: "front_back",
      hint: "Central focus",
      difficulty: "easy",
      tags: sourceType
    }
  ];
}

module.exports = {
  callLLM,
  generateFlashcards,
  generateStructuredNotes,
  generateQuizQuestions,
  generateTutorResponse
};
