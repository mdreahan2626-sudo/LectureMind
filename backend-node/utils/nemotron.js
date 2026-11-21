const pdfParse = require('pdf-parse');

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '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';
const NVIDIA_BACKUP_API_KEY = process.env.NVIDIA_BACKUP_API_KEY || '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';
const NVIDIA_MODEL = process.env.NVIDIA_NEMOTRON_MODEL || 'nvidia/nemotron-3.5-bolt-e4b';
const NVIDIA_BASE_URL = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';

/**
 * Call NVIDIA Nemotron API with fallback to backup key
 */
async function callNemotron(prompt, systemInstruction = '', maxTokens = 2048) {
  const messages = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  const keysToTry = [NVIDIA_API_KEY, NVIDIA_BACKUP_API_KEY].filter(Boolean);
  let lastError = null;

  for (const key of keysToTry) {
    try {
      const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: NVIDIA_MODEL,
          messages,
          temperature: 0.2,
          max_tokens: maxTokens
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`NVIDIA API responded with ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        return content.trim();
      }
    } catch (err) {
      console.warn(`[Nemotron] Call failed with key ...${key.slice(-6)}:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All Nemotron API calls failed');
}

/**
 * Clean and extract JSON from LLM response
 */
function extractJSON(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
  }
  // Try locating first '{' or '[' and last '}' or ']'
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned);
}

/**
 * Extract raw text from PDF buffer
 */
async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (err) {
    console.error('[Nemotron Parser] Failed to parse PDF buffer:', err.message);
    throw new Error('Could not extract text from the uploaded PDF document.');
  }
}

/**
 * Comprehensive parser: Extracts Important Points, Mind Map, Mains Questions & Flashcards
 */
async function parseStudyMaterial(rawText, title = 'Uploaded Document') {
  const truncatedText = rawText.slice(0, 15000); // Fit safely in context

  const systemInstruction = `You are Nemotron-3.5 Study Architect, an elite academic AI specialized in syllabus distillation, cognitive mind maps, and exam preparation.
Always reply with ONLY a single, strictly valid JSON object. Do not include markdown code block backticks, do not include preamble or conversational text.`;

  const prompt = `Analyze this lecture/study document:
Title: "${title}"
Content:
"""
${truncatedText}
"""

Extract and produce the following structured JSON output:
{
  "title": "${title}",
  "summary": "Clear, concise 2-3 paragraph overview of the material.",
  "keyPoints": [
    "Crucial takeaway / formula / fact 1",
    "Crucial takeaway / formula / fact 2",
    "Crucial takeaway / formula / fact 3",
    "Crucial takeaway / formula / fact 4",
    "Crucial takeaway / formula / fact 5"
  ],
  "mindmap": {
    "label": "Central Subject / Concept",
    "children": [
      {
        "label": "Core Branch 1",
        "children": ["Subtopic 1A", "Subtopic 1B", "Subtopic 1C"]
      },
      {
        "label": "Core Branch 2",
        "children": ["Subtopic 2A", "Subtopic 2B"]
      },
      {
        "label": "Core Branch 3",
        "children": ["Subtopic 3A", "Subtopic 3B", "Subtopic 3C"]
      }
    ]
  },
  "mainsQuestions": [
    {
      "question": "Comprehensive analytical/descriptive question suitable for exams",
      "type": "Descriptive (10 Marks)",
      "difficulty": "Moderate",
      "keyEvaluationPoints": ["Point 1 that must be mentioned", "Point 2 that must be mentioned"],
      "modelAnswer": "Structured, high-scoring model answer with clear reasoning."
    },
    {
      "question": "Critical comparison or mechanism question",
      "type": "Analytical (15 Marks)",
      "difficulty": "Advanced",
      "keyEvaluationPoints": ["Point 1", "Point 2", "Point 3"],
      "modelAnswer": "Structured model answer covering comparison and real-world implications."
    },
    {
      "question": "Short conceptual explanation question",
      "type": "Short Answer (5 Marks)",
      "difficulty": "Direct",
      "keyEvaluationPoints": ["Core definition", "Formula/Example"],
      "modelAnswer": "Concise, precise explanation."
    }
  ],
  "flashcards": [
    {
      "front": "Clear question testing a key definition or principle",
      "back": "Precise answer",
      "hint": "Helpful mnemonic or concept clue",
      "difficulty": "medium",
      "tags": "Core"
    },
    {
      "front": "Fill in the blank: The {{key term}} governs...",
      "back": "key term",
      "hint": "Definition clue",
      "difficulty": "easy",
      "tags": "Terminology"
    },
    {
      "front": "What is the primary role of...",
      "back": "Detailed concise explanation",
      "hint": "Function clue",
      "difficulty": "medium",
      "tags": "Mechanism"
    },
    {
      "front": "How does ... differ from ...?",
      "back": "Distinct contrast",
      "hint": "Comparison clue",
      "difficulty": "hard",
      "tags": "Analysis"
    }
  ]
}

Ensure the mindmap has a clear central label and 3-5 branches each with 2-4 subtopics.
Return ONLY the raw JSON.`;

  try {
    const rawResult = await callNemotron(prompt, systemInstruction, 3000);
    const parsed = extractJSON(rawResult);
    return parsed;
  } catch (err) {
    console.error('[Nemotron Parse Error]:', err.message);
    // Fallback if formatting was malformed
    return {
      title,
      summary: `Processed ${title}. Key structural content parsed from text.`,
      keyPoints: [
        "Core theoretical concepts and foundations.",
        "Primary definitions and governing mathematical or physical equations.",
        "Key practical and diagnostic applications."
      ],
      mindmap: {
        label: title,
        children: [
          { label: "Overview", children: ["Introduction", "Core Definitions"] },
          { label: "Mechanisms", children: ["Principles", "Formulas"] },
          { label: "Applications", children: ["Examples", "Case Studies"] }
        ]
      },
      mainsQuestions: [
        {
          question: `Explain the fundamental concepts underlying ${title} and assess their significance.`,
          type: "Descriptive (10 Marks)",
          difficulty: "Moderate",
          keyEvaluationPoints: ["Definition of core ideas", "Practical context"],
          modelAnswer: `This topic centers on the systematic understanding of ${title}, covering key theoretical frameworks and problem-solving methodologies.`
        }
      ],
      flashcards: [
        {
          front: `What is the central focus of ${title}?`,
          back: `The fundamental study and principles covered in the document.`,
          hint: "Core topic",
          difficulty: "easy",
          tags: "Overview"
        }
      ]
    };
  }
}

module.exports = {
  callNemotron,
  extractTextFromPDF,
  parseStudyMaterial
};
