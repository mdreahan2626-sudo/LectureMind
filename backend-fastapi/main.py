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

@app.post("/api/chat")
async def chat_with_lecture(payload: ChatRequest):
    """
    Ask questions about the lecture material using context.
    """
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key is not configured on the server.")
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = (
            f"You are a helpful study buddy. Answer the student's question based strictly on the provided lecture context.\n"
            f"If the answer is not in the context, guide them using general knowledge but clearly state that it wasn't in the lecture.\n\n"
            f"Lecture Context:\n{payload.context}\n\n"
            f"Student Question: {payload.message}\n"
            f"Response:"
        )
        response = model.generate_content(prompt)
        return {"reply": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
