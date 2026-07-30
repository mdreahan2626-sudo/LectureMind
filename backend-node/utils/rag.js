const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Text Chunker: Splits text into overlapping sliding-window passages.
 * @param {string} text 
 * @param {number} maxWords 
 * @param {number} overlapWords 
 * @returns {Array<{id: number, text: string, wordCount: number}>}
 */
function chunkText(text, maxWords = 250, overlapWords = 40) {
  if (!text || typeof text !== 'string') return [];

  // Normalize whitespace
  const cleanText = text.replace(/\s+/g, ' ').trim();
  const words = cleanText.split(' ');

  if (words.length <= maxWords) {
    return [{ id: 1, text: cleanText, wordCount: words.length }];
  }

  const chunks = [];
  let start = 0;
  let chunkId = 1;

  while (start < words.length) {
    const end = Math.min(start + maxWords, words.length);
    const chunkWords = words.slice(start, end);
    const chunkString = chunkWords.join(' ');

    chunks.push({
      id: chunkId++,
      text: chunkString,
      wordCount: chunkWords.length
    });

    if (end >= words.length) break;
    start += (maxWords - overlapWords);
  }

  return chunks;
}

/**
 * Compute cosine similarity between two numerical vectors.
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Generate TF-IDF / n-gram frequency fallback vector when offline or missing key.
 */
function generateFallbackVector(text, vectorSize = 128) {
  const vec = new Array(vectorSize).fill(0);
  const clean = text.toLowerCase().replace(/[^a-z0-9 ]/g, '');
  const tokens = clean.split(' ').filter(Boolean);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    let hash = 0;
    for (let j = 0; j < token.length; j++) {
      hash = (hash << 5) - hash + token.charCodeAt(j);
      hash |= 0;
    }
    const idx = Math.abs(hash) % vectorSize;
    vec[idx] += 1;
  }

  // Normalize vector
  const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  return norm > 0 ? vec.map(val => val / norm) : vec;
}

/**
 * Get vector embedding for a snippet of text using Gemini API or fallback vectorizer.
 */
async function getEmbedding(text, aiClient) {
  if (aiClient) {
    try {
      const embeddingModel = aiClient.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await embeddingModel.embedContent(text);
      if (result && result.embedding && result.embedding.values) {
        return result.embedding.values;
      }
    } catch (err) {
      console.warn('[RAG Embedder] Gemini embedding failed, using fallback vectorizer:', err.message);
    }
  }
  return generateFallbackVector(text);
}

/**
 * Index a document string into chunks and compute embeddings.
 */
async function indexDocument(text, title = 'Lecture Document', aiClient = null) {
  const rawChunks = chunkText(text);
  const indexedChunks = [];

  for (const chunk of rawChunks) {
    const vector = await getEmbedding(chunk.text, aiClient);
    indexedChunks.push({
      id: chunk.id,
      title: title,
      text: chunk.text,
      wordCount: chunk.wordCount,
      embedding: vector
    });
  }

  return indexedChunks;
}

/**
 * Search top-k similar chunks for a user query.
 */
async function searchSimilarChunks(query, indexedChunks, topK = 3, aiClient = null) {
  if (!indexedChunks || indexedChunks.length === 0) {
    return [];
  }

  const queryVector = await getEmbedding(query, aiClient);
  
  const scoredChunks = indexedChunks.map(chunk => {
    const score = cosineSimilarity(queryVector, chunk.embedding);
    return {
      id: chunk.id,
      title: chunk.title,
      text: chunk.text,
      similarityScore: Math.round(score * 1000) / 1000,
      confidencePct: Math.min(100, Math.max(0, Math.round(score * 100)))
    };
  });

  // Sort descending by score
  scoredChunks.sort((a, b) => b.similarityScore - a.similarityScore);
  return scoredChunks.slice(0, topK);
}

/**
 * Build RAG Augmented Prompt for LLM with explicit chunk citations.
 */
function buildRAGPrompt(query, retrievedChunks) {
  const contextBlock = retrievedChunks.map((c, i) => 
    `--- [Chunk ${i + 1}] (Confidence: ${c.confidencePct}%)\n${c.text}`
  ).join('\n\n');

  return `You are a helpful Socratic AI study tutor equipped with Retrieval-Augmented Generation (RAG).
Answer the student's question using the retrieved lecture context chunks below.

Cite the specific chunks in your response using tags like [Chunk 1], [Chunk 2] when referencing information.
If the answer cannot be determined from the retrieved chunks, state clearly that it was not found in the lecture passages and offer a helpful general explanation.

RETRIEVED LECTURE CHUNKS:
${contextBlock}

STUDENT QUESTION:
${query}

STUDENT TUTOR RESPONSE:`;
}

module.exports = {
  chunkText,
  getEmbedding,
  cosineSimilarity,
  indexDocument,
  searchSimilarChunks,
  buildRAGPrompt
};
