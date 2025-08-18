import os
import shutil
import uuid
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, Body
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List

from . import crud, services, models, schemas, llm_services
from .database import engine, get_db

# Create database tables on startup
models.Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load heavy NLP models on startup to avoid loading them per-request
    services.load_models_on_startup()
    yield
    # Code to run on shutdown can go here

app = FastAPI(
    title="Adobe Hackathon Finale - Document Intelligence API",
    lifespan=lifespan,
    description="API for document processing, local recommendations, and cloud-powered insights."
)

@app.post("/api/upload/", response_model=schemas.DocumentBase)
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    filepath = os.path.join("uploads", file.filename)
    if os.path.exists(filepath):
        raise HTTPException(status_code=409, detail=f"File '{file.filename}' already exists.")
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    db_doc = crud.create_document(db=db, filename=file.filename, filepath=filepath)
    # Run CPU-intensive parsing in a separate thread to not block the server
    sections_data = await services.process_new_document(filepath, db_doc.id)
    crud.create_sections(db=db, sections_data=sections_data)
    
    return schemas.DocumentBase.model_validate(db_doc)

@app.get("/api/documents/", response_model=List[schemas.DocumentBase])
async def get_all_documents(db: Session = Depends(get_db)):
    return crud.get_documents(db=db)

@app.get("/api/documents/{doc_id}", response_model=schemas.DocumentDetails)
async def get_document_details(doc_id: int, db: Session = Depends(get_db)):
    doc = crud.get_document(db=db, doc_id=doc_id)
    if not doc: raise HTTPException(status_code=404, detail="Document not found")
    return schemas.DocumentDetails.model_validate(doc)

@app.get("/api/pdf/{doc_id}")
async def get_pdf_file(doc_id: int, db: Session = Depends(get_db)):
    doc = crud.get_document(db=db, doc_id=doc_id)
    if not doc or not os.path.exists(doc.filepath):
        raise HTTPException(status_code=404, detail="PDF file not found.")
    return FileResponse(doc.filepath)

@app.post("/api/recommendations/", response_model=schemas.RecommendationResponse)
async def get_cpu_recommendations(doc_id: int = Body(...), db: Session = Depends(get_db)):
    target_section = crud.get_sections_by_doc_id(db, doc_id)
    if not target_section: raise HTTPException(status_code=404, detail="Document has no content to analyze.")
    # For simplicity, we use the first section of the document as the query context.
    query_text = target_section[0].content 
    other_sections = crud.get_all_sections_except(db, doc_id)
    related_content = await services.get_local_recommendations(query_text, other_sections)
    return schemas.RecommendationResponse(related_content=related_content)


@app.post("/api/llm-insights/", response_model=schemas.LLMInsightResponse)
async def get_llm_powered_insights(doc_id: int = Body(...), db: Session = Depends(get_db)):
    section = crud.get_sections_by_doc_id(db, doc_id)
    if not section: raise HTTPException(status_code=404, detail="Document has no content.")
    
    # Use I/O-bound LLM call in a separate thread
    insights = await llm_services.get_llm_insights(section[0].content[:4000])
    return insights

@app.post("/api/generate-podcast/")
async def generate_podcast_audio(doc_id: int = Body(...), db: Session = Depends(get_db)):
    section = crud.get_sections_by_doc_id(db, doc_id)
    if not section: raise HTTPException(status_code=404, detail="Document has no content.")
    
    insights = await llm_services.get_llm_insights(section[0].content[:2000])
    script = f"Welcome. Here is your audio brief for {section[0].heading}. The key takeaway is: {insights.get('key_insight', '')}. An interesting related fact is: {insights.get('did_you_know', '')}. However, one might ask: {insights.get('counterpoint', '')}"
    
    audio_filename = f"{uuid.uuid4()}.mp3"
    audio_filepath = os.path.join("audio_files", audio_filename)
    success = await llm_services.generate_audio(script, audio_filepath)
    
    if not success: raise HTTPException(status_code=500, detail="Failed to generate audio file.")
    return {"audio_url": f"/api/audio/{audio_filename}"}

@app.get("/api/audio/{filename}")
async def get_audio_file(filename: str):
    filepath = os.path.join("audio_files", filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Audio file not found.")
    return FileResponse(filepath, media_type="audio/mpeg")

@app.get("/api/health", response_model=schemas.HealthCheck)
async def health_check():
    return {"status": "ok"} 
