const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Auth router
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

// User stats router
const userRouter = require('./routes/user');
app.use('/api/user', userRouter);

// Subjects explorer router
const subjectsRouter = require('./routes/subjects');
app.use('/api/subjects', subjectsRouter);

// Flashcards AI router
const flashcardsRouter = require('./routes/flashcards');
app.use('/api/flashcards', flashcardsRouter);

// Existing Mock Lecture endpoints
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', database: 'Prisma + Supabase Postgres' });
});

app.get('/api/lectures', (req, res) => {
  res.json(mockLecturesDb);
});

app.post('/api/lectures', (req, res) => {
  const { title, materialType, summary, flashcards, mindmap } = req.body;
  const newLec = {
    id: "mock-" + (mockLecturesDb.length + 1),
    title,
    materialType,
    summary,
    flashcards,
    mindmap,
    createdAt: new Date()
  };
  mockLecturesDb.unshift(newLec);
  res.status(201).json(newLec);
});

app.listen(PORT, () => {
  console.log(`Node Express Server running on port ${PORT}`);
});
