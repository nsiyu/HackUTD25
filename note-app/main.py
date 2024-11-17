from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai_service import get_openai_edit, get_openai_process_lecture, get_openai_diagram
from dotenv import load_dotenv
import os
load_dotenv()

app = FastAPI(
    title="NoteApp API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://hack-utd-25.vercel.app",
        "https://hack-utd-25-git-main-nicolashuangs-projects.vercel.app",  # Preview deployments
        "https://hack-utd-25-*.vercel.app"  # All Vercel deployment URLs
    ],
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

class DiagramRequest(BaseModel):
    text: str

@app.post("/api/v1/lecture/edit")
async def edit_lecture(request: EditRequest):
    try:
        if not request.wholeLecture or not request.partToModify or not request.suggestion:
            raise HTTPException(status_code=400, detail="Missing required fields")
            
        modified_text = await get_openai_edit(
            request.wholeLecture,
            request.partToModify,
            request.suggestion
        )
        return {"modifiedText": modified_text}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error in edit_lecture: {str(e)}")  # Add logging
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

@app.post("/api/v1/diagram/generate")
async def generate_diagram(request: DiagramRequest):
    try:
        if not request.text:
            raise HTTPException(status_code=400, detail="Text is required")
            
        diagram = await get_openai_diagram(request.text)
        return {"diagram": diagram}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error in generate_diagram: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('PORT', 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)