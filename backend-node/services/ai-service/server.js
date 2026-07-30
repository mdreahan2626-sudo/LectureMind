const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const prisma = require('../../prisma');
const auth = require('../../middleware/auth');
const { generateFlashcards } = require('../../utils/ai');
const rag = require('../../utils/rag');

const app = express();
const PORT = process.env.AI_PORT || 5015;

app.use(cors());
app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenerativeAI(apiKey);
    console.log('[AI Service] Gemini client initialized.');
  } catch (err) {
    console.error('[AI Service] Failed to initialize Gemini:', err.message);
  }
}

// LangGraph Concept implementation
class StateGraph {
  constructor() {
    this.nodes = {};
    this.edges = [];
    this.entryPoint = null;
  }

  addNode(name, fn) {
    this.nodes[name] = fn;
    return this;
  }

  addEdge(fromNode, toNode) {
    this.edges.push({ from: fromNode, to: toNode });
    return this;
  }

  setEntryPoint(name) {
    this.entryPoint = name;
    return this;
  }

  async compileAndRun(initialState) {
    let state = { ...initialState };
    let currentNode = this.entryPoint;

    console.log(`[LangGraph] Executing StateGraph flow starting at node: "${currentNode}"`);
    while (currentNode) {
      if (!this.nodes[currentNode]) {
        throw new Error(`Node "${currentNode}" does not exist in StateGraph`);
      }
      try {
        const update = await this.nodes[currentNode](state);
        state = { ...state, ...update };
      } catch (err) {
        console.error(`[LangGraph] Error in node "${currentNode}":`, err.message);
        state.errors = state.errors || [];
        state.errors.push({ node: currentNode, error: err.message });
      }

      const nextEdge = this.edges.find(e => e.from === currentNode);
      currentNode = nextEdge ? nextEdge.to : null;
    }
    console.log('[LangGraph] Workflow completed.');
    return state;
  }
}

// In-memory mock lectures database for quick demonstration fallback
const mockLecturesDb = [
  {
    id: "mock-1",
    title: "Introduction to Artificial Neural Networks",
    materialType: "audio",
    summary: "This lecture provides an introduction to Artificial Neural Networks (ANNs). It details the inspiration from biological neurons, starting from McCulloch-Pitts neurons to modern multi-layer perceptrons. It discusses forward propagation, activation functions like ReLU and Sigmoid, and the backpropagation algorithm used to optimize network weights.",
    flashcards: [
      { front: "What is an Activation Function?", back: "A mathematical function applied to a neuron's output to introduce non-linearity, allowing the model to learn complex patterns." },
      { front: "What does Backpropagation do?", back: "It calculates the gradient of the loss function with respect to the weights of the network, working backwards from output to input." },
      { front: "Why is ReLU preferred over Sigmoid in hidden layers?", back: "ReLU helps mitigate the vanishing gradient problem, allowing deeper networks to train faster." }
    ],
    mindmap: {
      label: "Neural Networks",
      children: [
        {
          label: "Architecture",
          children: ["Input Layer", "Hidden Layers", "Output Layer"]
        },
        {
          label: "Training",
          children: ["Loss Function", "Optimizer", "Backpropagation"]
        },
        {
          label: "Activations",
          children: ["ReLU", "Sigmoid", "Softmax"]
        }
      ]
    },
    createdAt: new Date()
  }
];

// Define StateGraph Nodes
const intakeNode = async (state) => {
  console.log('[Node: Intake] Validating lecture intake contents.');
  if (!state.title || !state.text) {
    throw new Error('Title and Text are required contents.');
  }
  return { status: 'intake_completed' };
};

const summaryNode = async (state) => {
  console.log('[Node: Summary] Processing raw notes for structured summary.');
  if (!aiClient) {
    return {
      summary: `Fallback Summary: This lecture note covers "${state.title}" in detail, focusing on fundamental parameters, key concepts, and actionable insights.`
    };
  }
  
  try {
    const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are a professional educational assistant. Summarize the following lecture text clearly in active voice, emphasizing key concepts and study takeaways:
    
    Lecture Title: ${state.title}
    Text Content:
    ${state.text}`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return { summary: text };
  } catch (err) {
    console.error('[SummaryNode] Gemini failure:', err.message);
    return { summary: 'Unable to generate summary due to API service error.' };
  }
};

const flashcardNode = async (state) => {
  console.log('[Node: Flashcards] Generating study flashcards.');
  try {
    const cards = await generateFlashcards(state.text, state.materialType || 'text');
    return { flashcards: cards };
  } catch (err) {
    console.error('[FlashcardNode] error:', err.message);
    return { flashcards: [] };
  }
};

const mindmapNode = async (state) => {
  console.log('[Node: Mindmap] Generating visual connection hierarchy tree.');
  if (!aiClient) {
    return {
      mindmap: {
        label: state.title,
        children: [
          { label: "Core Topics", children: ["Overview", "Foundations"] },
          { label: "Applications", children: ["Case Studies"] }
        ]
      }
    };
  }

  try {
    const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Create a hierarchical mindmap structure representing the key branches in the following lecture text.
    Return ONLY a valid JSON object matching the format:
    {
      "label": "Main Topic",
      "children": [
        { "label": "Sub Branch 1", "children": ["Leaf Node 1A", "Leaf Node 1B"] },
        { "label": "Sub Branch 2", "children": ["Leaf Node 2A"] }
      ]
    }
    Do not wrap the response in markdown tags.
    
    Lecture text:
    ${state.text}`;

    const result = await model.generateContent(prompt);
    let outputText = result.response.text().trim();
    if (outputText.startsWith('```')) {
      outputText = outputText.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
    }
    const mindmap = JSON.parse(outputText);
    return { mindmap };
  } catch (err) {
    console.error('[MindmapNode] failure:', err.message);
    return {
      mindmap: {
        label: state.title,
        children: [{ label: "Error generating mindmap tree" }]
      }
    };
  }
};

const saveNode = async (state) => {
  console.log('[Node: Save] Saving lecture item.');
  const newLec = {
    id: "mock-" + (mockLecturesDb.length + 1),
    title: state.title,
    materialType: state.materialType || "text",
    summary: state.summary,
    flashcards: state.flashcards,
    mindmap: state.mindmap,
    createdAt: new Date()
  };
  mockLecturesDb.unshift(newLec);
  return { savedLecture: newLec };
};

// Compile LangGraph Pipeline
const lectureProcessingGraph = new StateGraph()
  .addNode('intake', intakeNode)
  .addNode('summary', summaryNode)
  .addNode('flashcards', flashcardNode)
  .addNode('mindmap', mindmapNode)
  .addNode('save', saveNode)
  .setEntryPoint('intake')
  .addEdge('intake', 'summary')
  .addEdge('summary', 'flashcards')
  .addEdge('flashcards', 'mindmap')
  .addEdge('mindmap', 'save');


// AI Endpoints

// 1. Generate Flashcards directly
app.post('/api/flashcards/generate', auth, async (req, res) => {
  const { title, text, sourceType } = req.body;
  if (!title || !text) {
    return res.status(400).json({ error: 'Title and content text are required to generate flashcards.' });
  }

  try {
    const generatedCards = await generateFlashcards(text, sourceType || 'text');
    
    const newSet = await prisma.flashcardSet.create({
      data: {
        title,
        userId: req.userId,
        cards: {
          create: generatedCards.map(c => ({
            front: c.front,
            back: c.back,
            type: c.type || 'front_back',
            hint: c.hint || null,
            difficulty: c.difficulty || 'medium',
            tags: c.tags || ''
          }))
        }
      },
      include: {
        cards: true
      }
    });

    res.status(201).json({
      success: true,
      set: newSet
    });
  } catch (error) {
    console.error('Direct flashcard generation failed:', error);
    res.status(500).json({ error: 'Server error during AI flashcard generation.' });
  }
});

// 2. GET Lectures list
app.get('/api/lectures', (req, res) => {
  res.json(mockLecturesDb);
});

// 3. POST Lectures processing (runs the LangGraph flow!)
app.post('/api/lectures', async (req, res) => {
  const { title, materialType, text } = req.body;
  if (!title || !text) {
    return res.status(400).json({ error: 'Title and lecture text are required.' });
  }

  try {
    const finalState = await lectureProcessingGraph.compileAndRun({
      title,
      text,
      materialType
    });
    
    if (finalState.errors && finalState.errors.length > 0) {
      console.warn('[LangGraph] Processing warning: Nodes encountered errors:', finalState.errors);
    }

    res.status(201).json(finalState.savedLecture);
  } catch (error) {
    console.error('LangGraph pipeline failed:', error);
    res.status(500).json({ error: 'Server error running LangGraph lecture processing pipeline.' });
  }
});

// 4. RAG Indexing Endpoint (Chunk & Embed lecture material)
app.post('/api/rag/index', async (req, res) => {
  const { text, title } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Lecture content text is required for RAG indexing.' });
  }

  try {
    const indexedChunks = await rag.indexDocument(text, title || 'Lecture Notes', aiClient);
    res.json({
      success: true,
      message: `Document successfully split into ${indexedChunks.length} chunks and embedded into vector space.`,
      chunkCount: indexedChunks.length,
      chunks: indexedChunks.map(c => ({
        id: c.id,
        title: c.title,
        wordCount: c.wordCount,
        snippet: c.text.substring(0, 100) + '...',
        embeddingDimensions: c.embedding.length
      }))
    });
  } catch (error) {
    console.error('RAG Index error:', error);
    res.status(500).json({ error: 'Failed to chunk and embed lecture document.' });
  }
});

// 5. RAG Semantic Search Query Endpoint
app.post('/api/rag/query', async (req, res) => {
  const { query, text, topK } = req.body;
  if (!query || !text) {
    return res.status(400).json({ error: 'Both query and document text are required.' });
  }

  try {
    const indexedChunks = await rag.indexDocument(text, 'Lecture Notes', aiClient);
    const topMatchChunks = await rag.searchSimilarChunks(query, indexedChunks, topK || 3, aiClient);
    res.json({
      success: true,
      query: query,
      retrievedCount: topMatchChunks.length,
      chunks: topMatchChunks
    });
  } catch (error) {
    console.error('RAG Query error:', error);
    res.status(500).json({ error: 'Failed to search similar chunks.' });
  }
});

// 6. RAG-Augmented Chat with lecture
app.post('/api/chat', async (req, res) => {
  const { message, context, topK } = req.body;
  if (!message || !context) {
    return res.status(400).json({ error: 'Message and lecture context are required.' });
  }

  try {
    // 1. RAG Chunking and Indexing
    const indexedChunks = await rag.indexDocument(context, 'Lecture Context', aiClient);
    
    // 2. RAG Semantic Search Retrieval
    const retrievedChunks = await rag.searchSimilarChunks(message, indexedChunks, topK || 3, aiClient);

    // 3. Fallback check for AI client
    if (!aiClient) {
      const topContextSnippet = retrievedChunks.length > 0 ? retrievedChunks[0].text : context.substring(0, 200);
      return res.json({
        reply: `[RAG Sandbox Mode]\nBased on retrieved passage chunk [Chunk 1] (Confidence: ${retrievedChunks[0]?.confidencePct || 85}%):\n"${topContextSnippet.substring(0, 150)}..."\n\nHow can I help you explore this topic further?`,
        rag: {
          enabled: true,
          mode: 'sandbox_vectorizer',
          retrievedCount: retrievedChunks.length,
          retrievedChunks: retrievedChunks
        }
      });
    }

    // 4. RAG Prompt Synthesis & LLM Call
    const ragPrompt = rag.buildRAGPrompt(message, retrievedChunks);
    const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(ragPrompt);
    const replyText = result.response.text();

    res.json({
      reply: replyText,
      rag: {
        enabled: true,
        mode: 'gemini_vector_embedding',
        retrievedCount: retrievedChunks.length,
        retrievedChunks: retrievedChunks
      }
    });
  } catch (error) {
    console.error('RAG Chat error:', error);
    res.status(500).json({ error: 'Server error during RAG chat response.' });
  }
});

// 5. Summarize Text (Utility)
app.post('/api/summarize-text', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text content is required.' });
  }

  if (!aiClient) {
    return res.json({ summary: 'AI summarization engine is offline. Please check key config.' });
  }

  try {
    const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Summarize the following text clearly in a structured format:
    ${text}`;
    const result = await model.generateContent(prompt);
    res.json({ summary: result.response.text() });
  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({ error: 'Server error during summarization.' });
  }
});

// 6. Generate Timed Quiz
app.post('/api/ai/quiz/generate', auth, async (req, res) => {
  const { title, text, questionCount = 5, timeLimit = 15 } = req.body;
  if (!title || !text) {
    return res.status(400).json({ error: 'Title and content text are required to generate an exam quiz.' });
  }

  try {
    let questions = [];
    if (aiClient) {
      const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are an expert academic test generator. Generate a structured quiz of ${questionCount} questions based on the text content below.
      Include a mix of Multiple Choice (type: 'mcq') and Short Answer (type: 'short') questions.
      
      Return ONLY a valid JSON array of objects. Format:
      [
        {
          "id": "q1",
          "type": "mcq",
          "question": "Question text...",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option A",
          "explanation": "Detailed explanation why Option A is correct..."
        },
        {
          "id": "q2",
          "type": "short",
          "question": "Short question text...",
          "correctAnswer": "Key concept definition...",
          "explanation": "Explanation..."
        }
      ]
      
      Content:
      ${text}`;

      const result = await model.generateContent(prompt);
      let outputText = result.response.text().trim();
      if (outputText.startsWith('```')) {
        outputText = outputText.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
      }
      questions = JSON.parse(outputText);
    } else {
      questions = [
        {
          id: "q1",
          type: "mcq",
          question: `What is the primary thesis described in "${title}"?`,
          options: ["Core foundational concept", "Unrelated secondary theory", "Experimental outlier", "Non-applicable baseline"],
          correctAnswer: "Core foundational concept",
          explanation: "The text establishes the core conceptual framework as its primary foundation."
        },
        {
          id: "q2",
          type: "short",
          question: `Define the principal methodology discussed in the notes.`,
          correctAnswer: "Structured analysis and iterative evaluation.",
          explanation: "Methodology relies on structured analysis and active synthesis."
        }
      ];
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        timeLimit: parseInt(timeLimit) || 15,
        questions: JSON.stringify(questions),
        userId: req.userId
      }
    });

    res.status(201).json({
      success: true,
      quiz: {
        ...quiz,
        questions: JSON.parse(quiz.questions)
      }
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ error: 'Server error during exam quiz generation.' });
  }
});

// 7. Submit Quiz Answers & Calculate AI Diagnostics
app.post('/api/ai/quiz/submit', auth, async (req, res) => {
  const { quizId, userAnswers } = req.body;
  if (!quizId || !userAnswers) {
    return res.status(400).json({ error: 'Quiz ID and user answers are required.' });
  }

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId }
    });

    if (!quiz || quiz.userId !== req.userId) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    const questions = JSON.parse(quiz.questions);
    let score = 0;
    const feedbackList = [];

    questions.forEach(q => {
      const studentAns = (userAnswers[q.id] || '').trim();
      const isCorrect = studentAns.toLowerCase() === q.correctAnswer.trim().toLowerCase();
      if (isCorrect) score += 1;

      feedbackList.push({
        questionId: q.id,
        question: q.question,
        userAnswer: studentAns,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation || 'Refer to lecture notes for full context.'
      });
    });

    const submission = await prisma.quizSubmission.create({
      data: {
        quizId,
        userId: req.userId,
        score,
        total: questions.length,
        answers: JSON.stringify(userAnswers),
        feedback: JSON.stringify(feedbackList)
      }
    });

    res.json({
      success: true,
      submission: {
        ...submission,
        feedback: JSON.parse(submission.feedback)
      }
    });
  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({ error: 'Server error evaluating exam submission.' });
  }
});

// 8. Get User Quizzes
app.get('/api/ai/quiz/my-quizzes', auth, async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: { userId: req.userId },
      include: {
        submissions: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = quizzes.map(q => ({
      ...q,
      questions: JSON.parse(q.questions)
    }));

    res.json({ success: true, quizzes: formatted });
  } catch (error) {
    console.error('Fetch quizzes error:', error);
    res.status(500).json({ error: 'Server error fetching quizzes.' });
  }
});

app.listen(PORT, () => {
  console.log(`[AI Service] Running on port ${PORT}`);
});
