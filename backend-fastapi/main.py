import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="LectureMind AI Server",
    description="FastAPI service for transcribing, parsing, and summarizing lecture materials with Gemini AI",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    print("Gemini API configured successfully.")
else:
    print("WARNING: GEMINI_API_KEY env variable not set. Gemini endpoints will fail.")

# Pydantic schemas
class ChatRequest(BaseModel):
    message: str
    context: str

class TextSummaryRequest(BaseModel):
    text: str
    detail_level: Optional[str] = "medium"

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "LectureMind AI FastAPI Server",
        "gemini_ready": GEMINI_API_KEY is not None
    }

@app.post("/api/summarize-text")
async def summarize_text(payload: TextSummaryRequest):
    """
    Summarize raw text using Gemini 1.5 Flash.
    """
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key is not configured on the server.")
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = (
            f"You are an expert academic assistant. Summarize the following lecture content. "
            f"Provide a structured summary containing key takeaways, detailed explanations of core concepts, "
            f"and follow-up action items. \n\n"
            f"Lecture content:\n{payload.text}"
        )
        response = model.generate_content(prompt)
        return {"summary": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/process-file")
async def process_file(
    file: UploadFile = File(...),
    material_type: str = Form(...) # 'audio', 'video', 'pdf'
):
    """
    Upload and process a lecture file.
    In a real implementation, you would:
    1. Save/stream the file.
    2. Extract audio if video, run speech-to-text (Whisper or Gemini direct audio parsing).
    3. Parse text if PDF.
    4. Call Gemini to create: Summary, Flashcards, Mind Map nodes, and Quiz.
    """
    if not GEMINI_API_KEY:
        return {
            "success": True,
            "message": "Demo mode: API key not set. Returning simulated data.",
            "fileName": file.filename,
            "materialType": material_type,
            "summary": "This is a demo summary of your uploaded lecture. Please configure GEMINI_API_KEY to enable full live processing.",
            "flashcards": [
                {"front": "What is the primary topic of this lecture?", "back": "The uploaded material covers academic lecture components."},
                {"front": "How do you enable live AI processing?", "back": "Add your GEMINI_API_KEY to the FastAPI environment variables."}
            ]
        }
    
    # Placeholder for actual file upload processing
    # For PDFs and Audio, you can upload directly using the Gemini File API or parse locally
    try:
        # Simple placeholder for file integration
        contents = await file.read()
        return {
            "success": True,
            "fileName": file.filename,
            "fileSize": len(contents),
            "materialType": material_type,
            "message": "File received. Integrate your transcription/parsing script here."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# RAG Helper Functions for Python FastAPI
import math
import re

def chunk_text_py(text: str, max_words: int = 250, overlap_words: int = 40):
    clean_text = re.sub(r'\s+', ' ', text).strip()
    words = clean_text.split(' ')
    if len(words) <= max_words:
        return [{"id": 1, "text": clean_text, "wordCount": len(words)}]
    
    chunks = []
    start = 0
    chunk_id = 1
    while start < len(words):
        end = min(start + max_words, len(words))
        chunk_words = words[start:end]
        chunks.append({
            "id": chunk_id,
            "text": " ".join(chunk_words),
            "wordCount": len(chunk_words)
        })
        chunk_id += 1
        if end >= len(words):
            break
        start += (max_words - overlap_words)
    return chunks

def cosine_similarity_py(vec_a, vec_b):
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)

def fallback_vector_py(text: str, size: int = 128):
    vec = [0.0] * size
    tokens = re.findall(r'\b[a-z0-9]+\b', text.lower())
    for t in tokens:
        idx = abs(hash(t)) % size
        vec[idx] += 1.0
    norm = math.sqrt(sum(v * v for v in vec))
    return [v / norm for v in vec] if norm > 0 else vec

def get_embedding_py(text: str):
    if GEMINI_API_KEY:
        try:
            res = genai.embed_content(model="models/text-embedding-004", content=text)
            if "embedding" in res and res["embedding"]:
                return res["embedding"]
        except Exception as e:
            print(f"[FastAPI RAG Embedder] Warning: Gemini embedding failed, using fallback: {e}")
    return fallback_vector_py(text)

class RAGQueryRequest(BaseModel):
    query: str
    text: str
    top_k: Optional[int] = 3

@app.post("/api/rag/query")
async def rag_query(payload: RAGQueryRequest):
    chunks = chunk_text_py(payload.text)
    query_vec = get_embedding_py(payload.query)
    scored = []
    for c in chunks:
        c_vec = get_embedding_py(c["text"])
        score = cosine_similarity_py(query_vec, c_vec)
        scored.append({
            "id": c["id"],
            "text": c["text"],
            "similarityScore": round(score, 3),
            "confidencePct": min(100, max(0, int(score * 100)))
        })
    scored.sort(key=lambda x: x["similarityScore"], reverse=True)
    return {"query": payload.query, "retrievedCount": len(scored[:payload.top_k]), "chunks": scored[:payload.top_k]}

@app.post("/api/chat")
async def chat_with_lecture(payload: ChatRequest):
    """
    RAG-Augmented question answering over lecture context.
    """
    try:
        # 1. RAG Chunking
        chunks = chunk_text_py(payload.context)
        query_vec = get_embedding_py(payload.message)
        
        # 2. Vector Retrieval
        scored = []
        for c in chunks:
            c_vec = get_embedding_py(c["text"])
            score = cosine_similarity_py(query_vec, c_vec)
            scored.append({
                "id": c["id"],
                "text": c["text"],
                "similarityScore": round(score, 3),
                "confidencePct": min(100, max(0, int(score * 100)))
            })
        scored.sort(key=lambda x: x["similarityScore"], reverse=True)
        retrieved = scored[:3]

        if not GEMINI_API_KEY:
            top_snippet = retrieved[0]["text"] if retrieved else payload.context[:200]
            return {
                "reply": f"[RAG Sandbox Mode]\nBased on retrieved passage [Chunk 1] (Confidence: {retrieved[0]['confidencePct'] if retrieved else 85}%):\n\"{top_snippet[:150]}...\"\n\nHow can I assist you further?",
                "rag": {"enabled": True, "mode": "sandbox_vectorizer", "retrievedChunks": retrieved}
            }

        # 3. RAG Augmented Prompt Synthesis
        context_block = "\n\n".join([f"--- [Chunk {i+1}] (Confidence: {c['confidencePct']}%)\n{c['text']}" for i, c in enumerate(retrieved)])
        rag_prompt = (
            f"You are a helpful Socratic AI study tutor equipped with Retrieval-Augmented Generation (RAG).\n"
            f"Answer the student's question strictly using the retrieved context chunks below.\n"
            f"Cite specific chunks using [Chunk 1], [Chunk 2] in your answer.\n\n"
            f"RETRIEVED LECTURE CHUNKS:\n{context_block}\n\n"
            f"STUDENT QUESTION: {payload.message}\n"
            f"STUDENT TUTOR RESPONSE:"
        )

        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(rag_prompt)
        return {
            "reply": response.text,
            "rag": {
                "enabled": True,
                "mode": "gemini_vector_embedding",
                "retrievedCount": len(retrieved),
                "retrievedChunks": retrieved
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
