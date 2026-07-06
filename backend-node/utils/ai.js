const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
let aiClient = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenerativeAI(apiKey);
    console.log('[Gemini AI] Initialized GoogleGenerativeAI SDK successfully.');
  } catch (err) {
    console.error('[Gemini AI] Failed to initialize GoogleGenerativeAI:', err.message);
  }
} else {
  console.warn('[Gemini AI] GEMINI_API_KEY is not defined. Using local fallback engine.');
}

async function generateFlashcards(text, sourceType = 'text') {
  if (aiClient) {
    try {
      const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `
You are an expert AI learning assistant. Your task is to generate a list of high-quality, conceptual study flashcards based on the provided material content below.
The material source type is: "${sourceType}".

Generate between 5 to 8 flashcards. Each card must belong to one of these types:
1. "front_back": Standard Question (front) and Answer (back).
2. "cloze": A fill-in-the-blank sentence where the key term is replaced by double curly braces. Example: "The {{mitochondria}} is the powerhouse of the cell." with the back being "mitochondria".

For each card, provide:
- "front": The question or cloze sentence.
- "back": The answer.
- "type": "front_back" or "cloze".
- "hint": A subtle, helpful hint.
- "difficulty": "easy", "medium", or "hard".
- "tags": A single relevant subject tag.

Return ONLY a valid JSON array of objects. Do not include markdown formatting or "json" blocks.
Format:
[
  { "front": "...", "back": "...", "type": "...", "hint": "...", "difficulty": "...", "tags": "..." }
]

Material content:
${text}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let outputText = response.text().trim();
      
      // Clean markdown code blocks if the model returned them
      if (outputText.startsWith('```')) {
        outputText = outputText.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
      }

      const cards = JSON.parse(outputText);
      if (Array.isArray(cards)) {
        return cards;
      }
    } catch (err) {
      console.error('[Gemini AI] Generation error, falling back to local engine:', err.message);
    }
  }

  // Local fallback parser
  return generateLocalFallbackCards(text, sourceType);
}

function generateLocalFallbackCards(text, sourceType) {
  const cleanText = text.trim();
  const sentences = cleanText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
  
  const cards = [];
  
  // Custom mock rules based on keywords
  if (cleanText.toLowerCase().includes('schrödinger') || cleanText.toLowerCase().includes('quantum')) {
    cards.push({
      front: "What does the Schrödinger Equation describe?",
      back: "It describes the wave function of a quantum-mechanical system, which governs its probability density.",
      type: "front_back",
      hint: "Think wave mechanics.",
      difficulty: "hard",
      tags: "Physics"
    });
    cards.push({
      front: "The {{probability density}} is proportional to the square modulus of the wave function.",
      back: "probability density",
      type: "cloze",
      hint: "Born rule definition.",
      difficulty: "medium",
      tags: "Physics"
    });
  }

  if (cleanText.toLowerCase().includes('backpropagation') || cleanText.toLowerCase().includes('gradient') || cleanText.toLowerCase().includes('neural')) {
    cards.push({
      front: "In neural networks, what is the main rule used to calculate backpropagation gradients?",
      back: "The Chain Rule of Calculus.",
      type: "front_back",
      hint: "Derivative of nested functions.",
      difficulty: "medium",
      tags: "Deep Learning"
    });
    cards.push({
      front: "The {{gradient descent}} algorithm is used to iteratively update neural network weights to minimize loss.",
      back: "gradient descent",
      type: "cloze",
      hint: "Optimization method.",
      difficulty: "easy",
      tags: "Deep Learning"
    });
  }

  // Generic fallback cards generated from the text sentences
  if (sentences.length > 0) {
    const f1 = sentences[0];
    cards.push({
      front: `Explain this key concept: "${f1}"`,
      back: `This outlines the foundational concept from the study notes regarding ${sourceType}.`,
      type: "front_back",
      hint: "Refer to the text description.",
      difficulty: "medium",
      tags: sourceType.toUpperCase()
    });

    if (sentences.length > 1) {
      const f2 = sentences[1];
      const words = f2.split(' ');
      if (words.length > 4) {
        const targetWord = words[Math.floor(words.length / 2)].replace(/[^a-zA-Z]/g, '');
        const clozeSentence = f2.replace(targetWord, `{{${targetWord}}}`);
        cards.push({
          front: clozeSentence,
          back: targetWord,
          type: "cloze",
          hint: "Fills in the blank.",
          difficulty: "easy",
          tags: sourceType.toUpperCase()
        });
      }
    }
  }

  // Ensure we return at least 3 cards
  if (cards.length < 3) {
    cards.push({
      front: "What is the primary topic discussed in these notes?",
      back: cleanText.substring(0, 100) + "...",
      type: "front_back",
      hint: "Summary overview.",
      difficulty: "easy",
      tags: "General"
    });
  }

  return cards;
}

module.exports = {
  generateFlashcards
};
