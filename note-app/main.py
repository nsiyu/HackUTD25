from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai_service import get_openai_edit, get_openai_process_lecture

app = FastAPI(
    title="NoteApp API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

class EditRequest(BaseModel):
    wholeLecture: str
    partToModify: str
    suggestion: str

class ProcessLectureRequest(BaseModel):
    noteId: str
    currentContent: str
    lectureContent: str

@app.post("/api/v1/lecture/edit")
async def edit_lecture(request: EditRequest):
    try:
        modified_text = await get_openai_edit(
            request.wholeLecture,
            request.partToModify,
            request.suggestion
        )
        return {"modifiedText": modified_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/lecture/process")
async def process_lecture(request: ProcessLectureRequest):
    try:
        processed_text = await get_openai_process_lecture(
            request.currentContent,
            request.lectureContent
        )
        return {"processedContent": processed_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Welcome to NoteApp API"}