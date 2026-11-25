const { callLLM } = require('./ai');

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
 * Extract raw text from PDF buffer (Supports both pdf-parse v1 and v2)
 */
async function extractTextFromPDF(buffer) {
  try {
    const pdfModule = require('pdf-parse');
    if (typeof pdfModule === 'function') {
      const data = await pdfModule(buffer);
      return data.text || '';
    } else if (pdfModule && pdfModule.PDFParse) {
      const parser = new pdfModule.PDFParse({ data: buffer });
      const res = await parser.getText();
      return res.text || '';
    }
    return '';
  } catch (err) {
    console.error('[PDF Parser] Failed to parse PDF buffer:', err.message);
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
    const rawResult = await callLLM(prompt, systemInstruction);
    const parsed = extractJSON(rawResult);
    return parsed;
  } catch (err) {
    console.error('[Study Material Parse Error]:', err.message);
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
  extractTextFromPDF,
  parseStudyMaterial
};
