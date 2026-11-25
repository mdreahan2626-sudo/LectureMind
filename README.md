# LectureMind AI (EduAssist)

> An intelligent, full-stack AI-powered academic study workspace designed to transform lecture PDFs and class notes into structured summaries, cognitive mind maps, SM-2 spaced repetition flashcards, timed mock exams, and interactive Socratic tutoring.

---

## Core Features & Modules

1. **Lectures & Folder Manager**
   - Drag-and-drop ingestion for lecture PDFs, markdown notes, and study documents.
   - Hierarchical Course -> Chapter -> Topic -> Material organization synced with database persistence and offline local caching.
   - Automatic text extraction via `pdf-parse` (v1 & v2 compatible) and instant AI distillation.

2. **Agentic Revision & Mind Hub**
   - **Summary-Wise Revision:** Executive summaries, structured key takeaways, and Mains-style exam questions with model answers.
   - **Cognitive Mind Map Visualizer:** Interactive concept trees automatically generated from uploaded materials.
   - **Gemini Agentic Revision Coach:** On-demand pedagogical modes:
     - *Conceptual Drill* (tests deep understanding, not rote memorization)
     - *Common Exam Mistakes* (highlights frequent pitfalls)
     - *Memory Mnemonics* (3-step mental models for fast recall)
     - *Evaluate Answer* (scores student responses out of 10 with missed-point feedback)
   - **Quick Drill & Full Q&A Study Sheet:** Interactive flip cards with automatic Gemini short-answer generation (`POST /api/ai/answer-card`) and a complete side-by-side Q&A study list.

3. **Timed Exam Simulator**
   - Generates timed multiple-choice and short-answer assessments from uploaded lecture material.
   - Automated grading, score tracking, and detailed answer explanations.

4. **Voice Socratic Tutor**
   - Interactive conversational & voice-enabled tutor supporting guided Socratic questioning and step-by-step concept clarification.

5. **Study Metrics & Progress Analytics**
   - Tracks daily study hours, weekly goals, consistency streaks, and topic mastery breakdowns.

---

## System Architecture

```
+-------------------------------------------------------------------+
|                     Frontend (React + Vite)                       |
|  - Tailwind CSS, Framer Motion, Lucide Icons, KaTeX               |
|  - Dashboard, SubjectExplorer, FlashcardHub, ExamSimulator,       |
|    VoiceTutor, AnalyticsPanel, InteractiveSandbox                 |
+---------------------------------+---------------------------------+
                                  | REST / JSON / Multipart FormData
                                  v
+-------------------------------------------------------------------+
|           Backend API Gateway & In-Process Service Mesh           |
|                  (Node.js + Express on Port 5001)                 |
|                                                                   |
|  +---------------+  +---------------+  +-----------------------+  |
|  | Auth Service  |  | User Service  |  |   Subjects Service    |  |
|  | JWT & Bcrypt  |  | Stats & Goals |  | Course/Chapter/Topic  |  |
|  +---------------+  +---------------+  +-----------------------+  |
|                                                                   |
|  +-------------------------------+  +--------------------------+  |
|  |      Flashcards Service       |  |       AI Service         |  |
|  |  SM-2 Scheduling & Deck CRUD  |  |  PDF Parse, RAG, Tutor,  |  |
|  |                               |  |  Quiz, MindMap, Coach    |  |
|  +-------------------------------+  +------------+-------------+  |
+--------------------------------------------------+----------------+
                    |                              |
                    v                              v
+-----------------------------------+   +---------------------------+
|     Database Layer (Prisma ORM)   |   |    Google Gemini Engine   |
|  - SQLite (Local) / PostgreSQL    |   |  - Primary:               |
|  - Users, Courses, Documents,     |   |    gemini-3.5-flash-lite  |
|    Chunks, Notes, Flashcards,     |   |  - Fallbacks:             |
|    Quizzes, Sessions, Goals       |   |    gemini-flash-lite-     |
+-----------------------------------+   |    latest, gemini-3.8-    |
                                        |    flash                  |
                                        +---------------------------+
```

### Architectural Highlights
- **Unified In-Process Service Mesh (`backend-node/server.js`):** Modular microservices (`auth`, `user`, `subjects`, `flashcards`, `ai`) can run mounted in-process on a single Express gateway (eliminating local proxy latency and multipart streaming bottlenecks) or independently on separate ports (`5011`–`5015`).
- **Resilient Google Gemini Integration (`backend-node/utils/ai.js`):** Uses `gemini-3.5-flash-lite` as the primary model for low-latency structured JSON extraction, with automatic failover across `gemini-flash-lite-latest` and `gemini-3.8-flash`.
- **Optional FastAPI Microservice (`backend-fastapi/`):** Companion Python FastAPI service for extended ML/RAG workflows.

---

## Database Schema Overview (`backend-node/prisma/schema.prisma`)

- **Identity & Preferences:** `User` (JWT auth, study metrics, theme, study pace, target exam)
- **Academic Hierarchy:** `Subject` -> `Chapter` -> `Topic` -> `Material`, plus `Concept` (mastery tracking)
- **Document Intelligence:** `Document` & `DocumentChunk` (chunked text, page numbers, token counts, embeddings)
- **Study Assets:** `Note` (markdown, key points, mindmap JSON, formula sheets), `FlashcardSet` & `Flashcard` (SM-2 `interval`, `repetition`, `easeFactor`, `dueDate`)
- **Assessments & Coaching:** `Quiz`, `QuizSubmission`, `ChatSession`, `ChatMessage`, `StudySession`, `LearningGoal`

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Lucide React
- **Backend:** Node.js, Express.js, Multer, `pdf-parse`, JWT (`jsonwebtoken`), `bcryptjs`
- **Database & ORM:** Prisma ORM (SQLite for local dev, PostgreSQL/Supabase for production)
- **AI Engine:** Google Gemini API (`@google/generative-ai`, `gemini-3.5-flash-lite`)

---

## API Endpoints

| Domain | Method & Route | Description |
| :--- | :--- | :--- |
| **Health** | `GET /api/health` | Gateway & service mesh health check |
| **Auth** | `POST /api/auth/signup`, `POST /api/auth/login` | Account registration & JWT authentication |
| **User** | `GET /api/user/stats`, `PUT /api/user/stats` | Study hours & weekly goal tracking |
| **Subjects** | `GET /api/subjects`, `POST /api/subjects` | Course, chapter, topic & material tree |
| **Flashcards** | `GET /api/flashcards`, `POST /api/flashcards/generate` | SM-2 decks & AI flashcard generation |
| **AI Parser** | `POST /api/nemotron/upload-pdf`, `POST /api/nemotron/parse-text` | PDF/text extraction into summary, mind map, mains Q&A & flashcards |
| **AI Coach** | `POST /api/nemotron/revision-coach` | Drill, mistakes, mnemonic & answer evaluation |
| **Short Answer** | `POST /api/ai/answer-card` | Direct concise Gemini answer for flashcard backs |
| **Quizzes & Tutor** | `POST /api/ai/quiz/generate`, `POST /api/ai/chat` | Exam generation & RAG-grounded Socratic chat |

---

## Local Development Setup

### 1. Backend
```bash
cd backend-node
npm install
npx prisma db push
# Configure .env with DATABASE_URL, JWT_SECRET, GEMINI_API_KEY, GEMINI_MODEL="gemini-3.5-flash-lite"
node server.js
```
The API runs at `http://127.0.0.1:5001`.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
The web app runs at `http://localhost:5173`.

---

## Deployment (Vercel + Backend)

- **Frontend:** Deployed on **Vercel** (`frontend/` root directory with Vite preset and SPA rewrites in `frontend/vercel.json`). Set `VITE_API_URL` in Vercel environment variables to point to your live backend URL.
- **Backend:** Deploy `backend-node/` to Render, Railway, or Vercel with `DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`, and `GEMINI_MODEL=gemini-3.5-flash-lite`.
