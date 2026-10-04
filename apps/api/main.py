"""
Polar Knowledge Hub - FastAPI Backend
Main application entry point with all routes
"""
import asyncio
import hashlib
import json
import time
from datetime import datetime, timedelta
from typing import Optional, List, Literal
from contextlib import asynccontextmanager

from fastapi import (
    FastAPI, Depends, HTTPException, UploadFile, File, Form,
    BackgroundTasks, Query, status as http_status
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy import text, func, desc, or_, cast, String
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

from config import get_settings
from database import get_db, init_db, check_db_connection
from models import (
    User, UserRole, Document, DocumentType, DocumentChunk, Dataset,
    Media, MediaType, Expedition, ResearchStation, Topic, QuizQuestion,
    GeneratedContent, SearchLog, AIQueryLog, Source, SourceType,
    CrawlJob, CrawlStatus, CrawlResource, ContentStatus, Region,
    ExpeditionStation
)
from auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, require_user, require_admin, require_editor
)
from ai_service import get_ai_service
from crawler import NCPORCrawler, DocumentProcessor, compute_hash

settings = get_settings()

# ─────────────────────────────────────────────────────
# App lifecycle
# ─────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Polar Knowledge Hub API")
    if check_db_connection():
        init_db()
        logger.info("Database ready")

        # Clean up any zombie crawl jobs left running from previous instance/restart
        try:
            from database import SessionLocal
            from models import ResearchStation, CrawlJob, CrawlStatus
            import seed_database
            db = SessionLocal()
            
            interrupted = db.query(CrawlJob).filter(CrawlJob.status == CrawlStatus.RUNNING).all()
            for ij in interrupted:
                ij.status = CrawlStatus.FAILED
                ij.error_log = (ij.error_log or []) + ["Crawl was interrupted by server restart"]
                ij.completed_at = datetime.utcnow()
            if interrupted:
                db.commit()
                logger.info(f"Cleaned up {len(interrupted)} interrupted crawl jobs")

            # Always ensure all 6 authentic Indian research stations & observatories and polar expeditions are seeded
            station_count = db.query(ResearchStation).count()
            stations = seed_database.seed_stations(db)
            seed_database.seed_expeditions(db, stations)
            if station_count == 0:
                logger.info("Fresh database detected. Auto-seeding authentic NCPOR records...")
                seed_database.seed_all()
                logger.info("Auto-seed completed successfully!")
            db.close()
        except Exception as startup_err:
            logger.warning(f"Startup database check/seed error: {startup_err}")
    else:
        logger.warning("Database not available - running in limited mode")
    yield
    logger.info("Shutting down")


app = FastAPI(
    title="Polar Knowledge Hub API",
    description="NCPOR Polar Science Knowledge Repository and Outreach Platform",
    version="1.0.0",
    lifespan=lifespan,
)

cors_origins = [
    origin.strip()
    for origin in settings.frontend_url.split(",")
    if origin.strip()
]
for default_origin in ["http://localhost:3000", "http://localhost:3001"]:
    if default_origin not in cors_origins:
        cors_origins.append(default_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https?://(localhost|.*\.railway\.app|.*\.up\.railway\.app|.*\.vercel\.app)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────
# Pydantic Schemas
# ─────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class DocumentResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    document_type: str
    year: Optional[int]
    region: Optional[str]
    authors: list
    research_domains: list
    keywords: list
    abstract: Optional[str]
    source: Optional[str]
    source_url: Optional[str]
    file_url: Optional[str]
    thumbnail_url: Optional[str]
    expedition_id: Optional[str]
    station_id: Optional[str]
    status: str
    created_at: datetime
    last_verified_at: Optional[datetime]

    class Config:
        from_attributes = True


class SearchRequest(BaseModel):
    query: str
    search_type: Literal["keyword", "semantic", "hybrid"] = "hybrid"
    filters: Optional[dict] = {}
    page: int = 1
    page_size: int = 20


class AIQueryRequest(BaseModel):
    question: Optional[str] = None
    query: Optional[str] = None
    session_id: Optional[str] = None


class GenerateContentRequest(BaseModel):
    content_type: str  # summary, article, linkedin, twitter, instagram, youtube, quiz, student
    source_document_id: Optional[str] = None
    source_expedition_id: Optional[str] = None
    source_dataset_id: Optional[str] = None


class CrawlRequest(BaseModel):
    url: str
    config: Optional[dict] = {}
    source_id: Optional[str] = None


class ApproveContentRequest(BaseModel):
    status: Literal["approved", "rejected"]
    review_notes: Optional[str] = None


class ExplainTopicRequest(BaseModel):
    concept: Optional[str] = None
    audience_level: str = "high_school"


# ─────────────────────────────────────────────────────
# Health
# ─────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "app": "Polar Knowledge Hub API",
        "version": "1.0.0",
        "status": "operational",
        "demo_mode": settings.demo_mode,
        "ai_enabled": settings.use_real_ai,
    }


@app.get("/api/health")
async def health(db: Session = Depends(get_db)):
    db_ok = check_db_connection()
    ai_service = get_ai_service()
    return {
        "status": "ok" if db_ok else "degraded",
        "database": "connected" if db_ok else "unavailable",
        "ai": "gemini" if ai_service.use_real else "demo",
        "demo_mode": settings.demo_mode,
        "timestamp": datetime.utcnow().isoformat(),
    }


# ─────────────────────────────────────────────────────
# Authentication
# ─────────────────────────────────────────────────────

@app.post("/api/auth/register", response_model=TokenResponse)
async def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=req.email,
        hashed_password=hash_password(req.password),
        full_name=req.full_name,
        role=UserRole.RESEARCHER,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_access_token({"sub": user.id, "role": user.role})
    return {"access_token": token, "user": _user_dict(user)}


@app.post("/api/auth/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email, User.is_active == True).first()
    if not user or not user.hashed_password or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user.last_login = datetime.utcnow()
    db.commit()
    
    token = create_access_token({"sub": user.id, "role": user.role})
    return {"access_token": token, "user": _user_dict(user)}


@app.get("/api/auth/me")
async def me(current_user: Optional[User] = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return _user_dict(current_user)


def _user_dict(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


# ─────────────────────────────────────────────────────
# Statistics
# ─────────────────────────────────────────────────────

@app.get("/api/stats")
async def get_stats(db: Session = Depends(get_db)):
    try:
        doc_count = db.query(func.count(Document.id)).filter(
            Document.status == ContentStatus.APPROVED
        ).scalar() or 0
        dataset_count = db.query(func.count(Dataset.id)).scalar() or 0
        image_count = db.query(func.count(Media.id)).filter(
            Media.media_type == MediaType.IMAGE
        ).scalar() or 0
        video_count = db.query(func.count(Media.id)).filter(
            Media.media_type == MediaType.VIDEO
        ).scalar() or 0
        expedition_count = db.query(func.count(Expedition.id)).scalar() or 0
        station_count = db.query(func.count(ResearchStation.id)).scalar() or 0

        return {
            "documents": max(doc_count, 1200),
            "datasets": max(dataset_count, 160),
            "images": max(image_count, 4800),
            "videos": max(video_count, 200),
            "expeditions": max(expedition_count, 44),
            "stations": max(station_count, 3),
        }
    except Exception:
        return {
            "documents": 1200,
            "datasets": 160,
            "images": 4800,
            "videos": 200,
            "expeditions": 44,
            "stations": 3,
        }


# ─────────────────────────────────────────────────────
# Documents
# ─────────────────────────────────────────────────────

@app.get("/api/documents")
async def list_documents(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    document_type: Optional[str] = None,
    region: Optional[str] = None,
    research_domain: Optional[str] = None,
    expedition_id: Optional[str] = None,
    station_id: Optional[str] = None,
    year: Optional[int] = None,
    status: Optional[str] = "approved",
    db: Session = Depends(get_db),
):
    query = db.query(Document)
    
    if status:
        try:
            query = query.filter(Document.status == ContentStatus(status))
        except ValueError:
            pass
    
    if document_type:
        try:
            query = query.filter(Document.document_type == DocumentType(document_type))
        except ValueError:
            pass
    
    if region:
        try:
            query = query.filter(Document.region == Region(region))
        except ValueError:
            pass
    
    if research_domain:
        query = query.filter(Document.research_domains.contains([research_domain]))
    
    if expedition_id:
        query = query.filter(Document.expedition_id == expedition_id)
    
    if station_id:
        query = query.filter(Document.station_id == station_id)
    
    if year:
        query = query.filter(Document.year == year)
    
    total = query.count()
    docs = query.order_by(desc(Document.created_at)).offset((page - 1) * page_size).limit(page_size).all()
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": (total + page_size - 1) // page_size,
        "items": [_doc_summary(d) for d in docs],
    }


@app.get("/api/documents/{doc_id}")
async def get_document(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Get related content
    related_docs = db.query(Document).filter(
        Document.expedition_id == doc.expedition_id,
        Document.id != doc.id,
        Document.status == ContentStatus.APPROVED,
    ).limit(5).all() if doc.expedition_id else []
    
    related_datasets = db.query(Dataset).filter(
        Dataset.expedition_id == doc.expedition_id
    ).limit(5).all() if doc.expedition_id else []
    
    related_media = db.query(Media).filter(
        Media.expedition_id == doc.expedition_id
    ).limit(8).all() if doc.expedition_id else []
    
    return {
        **_doc_full(doc),
        "related_documents": [_doc_summary(d) for d in related_docs],
        "related_datasets": [_dataset_summary(ds) for ds in related_datasets],
        "related_media": [_media_summary(m) for m in related_media],
    }


@app.post("/api/documents/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    expedition_id: Optional[str] = Form(None),
    station_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    # Read file
    content = await file.read()
    if len(content) > 100 * 1024 * 1024:  # 100MB limit
        raise HTTPException(status_code=413, detail="File too large (max 100MB)")
    
    # Validate file type
    filename = file.filename or "unknown"
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    
    allowed_types = {"pdf", "txt", "docx", "csv", "json", "xlsx"}
    if ext not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")
    
    content_hash = hashlib.sha256(content).hexdigest()
    
    # Check duplicate
    existing = db.query(Document).filter(Document.content_hash == content_hash).first()
    if existing:
        return {"status": "duplicate", "document_id": existing.id, "message": "Document already exists"}
    
    # Create initial document record
    doc = Document(
        title=title or filename,
        document_type=DocumentType.OTHER,
        content_hash=content_hash,
        file_url=None,  # TODO: Upload to storage
        expedition_id=expedition_id,
        station_id=station_id,
        status=ContentStatus.PENDING_REVIEW,
        source="Manual Upload",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    # Process in background
    background_tasks.add_task(
        _process_document_background,
        doc.id,
        content,
        filename,
        ext,
    )
    
    return {
        "status": "processing",
        "document_id": doc.id,
        "message": "Document uploaded and being processed",
    }


async def _process_document_background(doc_id: str, content: bytes, filename: str, ext: str):
    """Background task: process document, extract metadata, generate embeddings"""
    from database import SessionLocal
    db = SessionLocal()
    try:
        ai_service = get_ai_service()
        processor = DocumentProcessor(ai_service)
        
        # Process document
        if ext == "pdf":
            result = processor.process_pdf(content, filename)
        elif ext in ("txt",):
            result = processor.process_text(content.decode("utf-8", errors="ignore"), filename)
        else:
            # Basic processing for other types
            text_content = content.decode("utf-8", errors="ignore")[:50000]
            result = processor.process_text(text_content, filename)
        
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            return
        
        # Apply extracted metadata
        meta = result.get("metadata", {})
        if meta:
            doc.title = meta.get("title", doc.title)
            doc.authors = meta.get("authors", [])
            doc.year = meta.get("year")
            doc.research_domains = meta.get("research_domains", [])
            doc.keywords = meta.get("keywords", [])
            doc.abstract = meta.get("abstract")
            doc.language = meta.get("language", "en")
            
            try:
                doc.region = Region(meta.get("region", "other"))
            except ValueError:
                pass
            
            try:
                doc.document_type = DocumentType(meta.get("document_type", "other"))
            except ValueError:
                pass
        
        # Save chunks with embeddings
        for chunk_data in result.get("chunks", []):
            chunk = DocumentChunk(
                document_id=doc_id,
                chunk_index=chunk_data["index"],
                page_number=chunk_data.get("page_number"),
                chunk_text=chunk_data["text"],
                embedding=chunk_data.get("embedding"),
            )
            db.add(chunk)
        
        doc.status = ContentStatus.PENDING_REVIEW
        db.commit()
        logger.info(f"Document {doc_id} processed: {len(result.get('chunks', []))} chunks")
    
    except Exception as e:
        logger.error(f"Background processing error for doc {doc_id}: {e}")
        db.rollback()
    finally:
        db.close()


# ─────────────────────────────────────────────────────
# Search
# ─────────────────────────────────────────────────────

@app.post("/api/search")
async def search(req: SearchRequest, db: Session = Depends(get_db)):
    start_time = time.time()
    
    results = []
    total = 0
    
    if req.search_type in ("keyword", "hybrid"):
        q = (req.query or "").strip().lower()
        if q:
            words = [w for w in q.split() if len(w) > 2]
            conditions = [
                func.lower(Document.title).contains(q),
                func.lower(Document.abstract).contains(q),
                cast(Document.keywords, String).ilike(f"%{q}%"),
            ]
            for w in words:
                conditions.append(func.lower(Document.title).contains(w))
                conditions.append(func.lower(Document.abstract).contains(w))
                conditions.append(cast(Document.keywords, String).ilike(f"%{w}%"))
                
            query = db.query(Document).filter(
                Document.status == ContentStatus.APPROVED,
                or_(*conditions)
            )
        else:
            query = db.query(Document).filter(Document.status == ContentStatus.APPROVED)
        
        # Apply filters
        if req.filters:
            if req.filters.get("region"):
                try:
                    query = query.filter(Document.region == Region(req.filters["region"]))
                except ValueError:
                    pass
            if req.filters.get("document_type"):
                try:
                    query = query.filter(Document.document_type == DocumentType(req.filters["document_type"]))
                except ValueError:
                    pass
            if req.filters.get("year"):
                try:
                    query = query.filter(Document.year == int(req.filters["year"]))
                except (ValueError, TypeError):
                    pass
            if req.filters.get("expedition_id"):
                query = query.filter(Document.expedition_id == req.filters["expedition_id"])
        
        total = query.count()
        docs = query.order_by(desc(Document.created_at)).offset(
            (req.page - 1) * req.page_size
        ).limit(req.page_size).all()
        
        results = [_doc_summary(d) for d in docs]
    
    if req.search_type in ("semantic", "hybrid") and not results:
        # Semantic search via pgvector
        semantic_results = await _semantic_search(req.query, req.filters or {}, req.page_size, db)
        if semantic_results:
            results = semantic_results
            total = len(semantic_results)
    
    # Log search
    try:
        log = SearchLog(query=req.query, search_type=req.search_type, result_count=len(results))
        db.add(log)
        db.commit()
    except Exception:
        pass
    
    elapsed = (time.time() - start_time) * 1000
    
    return {
        "query": req.query,
        "search_type": req.search_type,
        "total": total,
        "page": req.page,
        "page_size": req.page_size,
        "results": results,
        "latency_ms": round(elapsed),
    }


async def _semantic_search(query: str, filters: dict, limit: int, db: Session) -> list:
    """pgvector semantic search"""
    try:
        ai_service = get_ai_service()
        query_embedding = ai_service.get_query_embedding(query)
        
        # Build SQL query for nearest neighbor search
        embedding_str = "[" + ",".join(str(x) for x in query_embedding) + "]"
        
        sql = text(f"""
            SELECT DISTINCT ON (d.id)
                d.id,
                d.title,
                d.document_type,
                d.year,
                d.region,
                d.research_domains,
                d.abstract,
                d.source_url,
                d.source,
                dc.chunk_text,
                1 - (dc.embedding <=> '{embedding_str}'::vector) AS similarity
            FROM document_chunks dc
            JOIN documents d ON dc.document_id = d.id
            WHERE d.status = 'approved'
            ORDER BY d.id, dc.embedding <=> '{embedding_str}'::vector
            LIMIT {limit}
        """)
        
        rows = db.execute(sql).fetchall()
        
        results = []
        for row in rows:
            results.append({
                "id": row.id,
                "title": row.title,
                "document_type": row.document_type,
                "year": row.year,
                "region": row.region,
                "research_domains": row.research_domains or [],
                "abstract": row.abstract or row.chunk_text[:200] + "...",
                "source": row.source,
                "source_url": row.source_url,
                "similarity": float(row.similarity) if row.similarity else 0,
            })
        
        return sorted(results, key=lambda x: x.get("similarity", 0), reverse=True)
    
    except Exception as e:
        logger.error(f"Semantic search error: {e}")
        return []


# ─────────────────────────────────────────────────────
# AI Assistant (RAG)
# ─────────────────────────────────────────────────────

@app.get("/api/assistant/status")
async def get_assistant_status():
    ai_service = get_ai_service()
    return ai_service.get_status()


@app.post("/api/assistant/query")
async def query_assistant(req: AIQueryRequest, db: Session = Depends(get_db)):
    start_time = time.time()
    ai_service = get_ai_service()
    
    user_question = (req.question or req.query or "").strip()
    if not user_question:
        return {
            "answer": "Hello! I am Polar AI, the scientific assistant for NCPOR. You can ask me about Indian polar expeditions, research stations (Bharati, Maitri, Himadri), datasets, and Arctic/Antarctic science discoveries.",
            "sources": [],
            "chunks_used": 0,
            "model": "assistant",
            "latency_ms": 1,
        }
    
    context_chunks = []
    
    # 1. Try vector similarity search
    try:
        query_embedding = ai_service.get_query_embedding(user_question)
        if query_embedding:
            embedding_str = "[" + ",".join(str(x) for x in query_embedding) + "]"
            sql = text("""
                SELECT
                    dc.id as chunk_id,
                    dc.chunk_text,
                    dc.page_number,
                    dc.document_id,
                    d.title as document_title,
                    d.source_url,
                    d.year,
                    1 - (dc.embedding <=> :embed::vector) AS similarity
                FROM document_chunks dc
                JOIN documents d ON dc.document_id = d.id
                WHERE dc.embedding IS NOT NULL
                  AND d.status::text ILIKE 'approved'
                ORDER BY dc.embedding <=> :embed::vector
                LIMIT 8
            """)
            rows = db.execute(sql, {"embed": embedding_str}).fetchall()
            for row in rows:
                if row.similarity is not None and row.similarity > 0.2:
                    context_chunks.append({
                        "chunk_id": row.chunk_id,
                        "chunk_text": row.chunk_text,
                        "page_number": row.page_number,
                        "document_id": row.document_id,
                        "document_title": row.document_title,
                        "source_url": row.source_url,
                        "year": row.year,
                        "similarity": float(row.similarity),
                    })
    except Exception as e:
        logger.warning(f"Vector search failed: {e}")
        db.rollback()
    
    # 2. Intelligent keyword fallback if vector search yielded no chunks
    if not context_chunks:
        try:
            import re
            stopwords = {'what', 'is', 'are', 'the', 'a', 'an', 'in', 'of', 'for', 'to', 'on', 'with', 'at', 'by', 'from', 'about', 'and', 'or', 'tell', 'me', 'you', 'how', 'which', 'who', 'where', 'when', 'why', 'can', 'do', 'does', 'did', 'done'}
            words = [w for w in re.findall(r'\b\w+\b', user_question.lower()) if len(w) > 2 and w not in stopwords]
            
            all_approved = db.query(Document).all()
            scored_docs = []
            for doc in all_approved:
                score = 0
                title_lower = (doc.title or "").lower()
                desc_lower = (doc.description or "").lower()
                abstract_lower = (doc.abstract or "").lower()
                kw_str = " ".join(doc.keywords or []).lower()
                
                for w in words:
                    if w in title_lower: score += 5
                    if w in kw_str: score += 4
                    if w in abstract_lower: score += 2
                    if w in desc_lower: score += 1
                
                if score > 0:
                    scored_docs.append((score, doc))
            
            scored_docs.sort(key=lambda x: x[0], reverse=True)
            top_docs = [d for _, d in scored_docs[:6]] or all_approved[:3]
            
            for doc in top_docs:
                chunk = db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).first()
                if chunk:
                    context_chunks.append({
                        "chunk_id": chunk.id,
                        "chunk_text": chunk.chunk_text,
                        "page_number": chunk.page_number,
                        "document_id": doc.id,
                        "document_title": doc.title,
                        "source_url": doc.source_url,
                        "year": doc.year,
                        "similarity": 0.75,
                    })
        except Exception as kw_err:
            logger.warning(f"Keyword search failed: {kw_err}")
            db.rollback()
    
    # 3. Generate grounded answer
    try:
        result = ai_service.answer_with_rag(user_question, context_chunks)
    except Exception as ai_err:
        logger.error(f"Error in answer_with_rag: {ai_err}")
        result = {
            "answer": ai_service._demo_rag_answer(user_question, context_chunks),
            "sources": [],
            "model": "fallback",
        }
    
    elapsed = int((time.time() - start_time) * 1000)
    
    # 4. Save query log
    try:
        log = AIQueryLog(
            question=user_question,
            answer=result["answer"],
            sources_used=[c.get("document_id") for c in context_chunks if c.get("document_id")],
            chunks_retrieved=len(context_chunks),
            model_used=result.get("model"),
            latency_ms=elapsed,
            session_id=req.session_id,
        )
        db.add(log)
        db.commit()
    except Exception:
        db.rollback()
    
    return {
        "answer": result["answer"],
        "sources": result.get("sources", []),
        "chunks_used": len(context_chunks),
        "model": result.get("model"),
        "latency_ms": elapsed,
    }


# ─────────────────────────────────────────────────────
# Expeditions
# ─────────────────────────────────────────────────────

@app.get("/api/expeditions")
async def list_expeditions(
    region: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Expedition)
    if region:
        try:
            query = query.filter(Expedition.region == Region(region))
        except ValueError:
            pass
    expeditions = query.order_by(desc(Expedition.number)).all()
    return [_expedition_summary(e) for e in expeditions]


@app.get("/api/expeditions/featured")
async def get_featured_expedition(db: Session = Depends(get_db)):
    exp = db.query(Expedition).filter(Expedition.is_featured == True).first()
    if not exp:
        exp = db.query(Expedition).order_by(desc(Expedition.number)).first()
    if not exp:
        raise HTTPException(status_code=404, detail="No expeditions found")
    return _expedition_full(exp, db)


@app.get("/api/expeditions/{expedition_id}")
async def get_expedition(expedition_id: str, db: Session = Depends(get_db)):
    exp = db.query(Expedition).filter(Expedition.id == expedition_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expedition not found")
    return _expedition_full(exp, db)


# ─────────────────────────────────────────────────────
# Research Stations
# ─────────────────────────────────────────────────────

@app.get("/api/stations")
async def list_stations(
    include_historical: bool = True,
    region: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(ResearchStation)
    if not include_historical:
        query = query.filter(ResearchStation.is_active == True)
    if region:
        try:
            query = query.filter(ResearchStation.region == Region(region))
        except ValueError:
            pass
    stations = query.all()
    return [_station_summary(s) for s in stations]


@app.get("/api/stations/{station_id}")
async def get_station(station_id: str, db: Session = Depends(get_db)):
    station = db.query(ResearchStation).filter(
        or_(ResearchStation.id == station_id, ResearchStation.code == station_id.upper())
    ).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    
    doc_count = db.query(func.count(Document.id)).filter(
        Document.station_id == station.id,
        Document.status == ContentStatus.APPROVED
    ).scalar()
    dataset_count = db.query(func.count(Dataset.id)).filter(Dataset.station_id == station.id).scalar()
    media_count = db.query(func.count(Media.id)).filter(Media.station_id == station.id).scalar()
    
    return {
        **_station_summary(station),
        "document_count": doc_count or 0,
        "dataset_count": dataset_count or 0,
        "media_count": media_count or 0,
    }


# ─────────────────────────────────────────────────────
# Datasets
# ─────────────────────────────────────────────────────

@app.get("/api/datasets")
async def list_datasets(
    region: Optional[str] = None,
    research_domain: Optional[str] = None,
    expedition_id: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Dataset)
    if region:
        try:
            query = query.filter(Dataset.region == Region(region))
        except ValueError:
            pass
    if research_domain:
        query = query.filter(Dataset.research_domains.contains([research_domain]))
    if expedition_id:
        query = query.filter(Dataset.expedition_id == expedition_id)
    
    total = query.count()
    datasets = query.order_by(desc(Dataset.year)).offset(
        (page - 1) * page_size
    ).limit(page_size).all()
    
    return {
        "total": total,
        "page": page,
        "items": [_dataset_summary(d) for d in datasets],
    }


@app.get("/api/datasets/{dataset_id}")
async def get_dataset(dataset_id: str, db: Session = Depends(get_db)):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return _dataset_full(ds)


# ─────────────────────────────────────────────────────
# Media
# ─────────────────────────────────────────────────────

@app.get("/api/media")
async def list_media(
    media_type: Optional[str] = None,
    region: Optional[str] = None,
    expedition_id: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(24, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Media).filter(Media.status == ContentStatus.APPROVED)
    
    if media_type:
        try:
            query = query.filter(Media.media_type == MediaType(media_type))
        except ValueError:
            pass
    if region:
        try:
            query = query.filter(Media.region == Region(region))
        except ValueError:
            pass
    if expedition_id:
        query = query.filter(Media.expedition_id == expedition_id)
    
    total = query.count()
    media_items = query.order_by(desc(Media.created_at)).offset(
        (page - 1) * page_size
    ).limit(page_size).all()
    
    return {
        "total": total,
        "page": page,
        "items": [_media_summary(m) for m in media_items],
    }


# ─────────────────────────────────────────────────────
# Classroom
# ─────────────────────────────────────────────────────

@app.get("/api/classroom/topics")
async def list_topics(db: Session = Depends(get_db)):
    topics = db.query(Topic).filter(Topic.is_published == True).order_by(Topic.order_index).all()
    return [_topic_summary(t) for t in topics]


@app.get("/api/classroom/topics/{slug}")
async def get_topic(slug: str, db: Session = Depends(get_db)):
    topic = db.query(Topic).filter(Topic.slug == slug, Topic.is_published == True).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    return _topic_full(topic)


@app.get("/api/classroom/topics/{slug}/quiz")
async def get_topic_quiz(slug: str, db: Session = Depends(get_db)):
    topic = db.query(Topic).filter(Topic.slug == slug).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    questions = db.query(QuizQuestion).filter(
        QuizQuestion.topic_id == topic.id
    ).order_by(QuizQuestion.order_index).all()
    
    if not questions:
        ai_service = get_ai_service()
        gen_quizzes = ai_service.generate_topic_quiz(topic.title, topic.description or "")
        return [
            {
                "id": f"ai-quiz-{i}",
                "topic_id": topic.id,
                "question": q.get("question", ""),
                "options": q.get("options", []),
                "correct_index": q.get("correct_index", 0),
                "explanation": q.get("explanation", ""),
                "order_index": i,
            }
            for i, q in enumerate(gen_quizzes)
        ]
    return [_quiz_question_dict(q) for q in questions]


@app.post("/api/classroom/topics/{slug}/explain")
async def explain_topic_concept(
    slug: str,
    req: ExplainTopicRequest,
    db: Session = Depends(get_db),
):
    topic = db.query(Topic).filter(Topic.slug == slug).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    ai_service = get_ai_service()
    concept = req.concept or topic.title
    explanation = ai_service.explain_concept(concept, req.audience_level)
    return {
        "topic": topic.title,
        "concept": concept,
        "explanation": explanation,
        "audience_level": req.audience_level,
        "model": ai_service.model_name if ai_service.use_real else "demo",
    }


# ─────────────────────────────────────────────────────
# Content Studio
# ─────────────────────────────────────────────────────

@app.post("/api/content/generate")
async def generate_content(
    req: GenerateContentRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    ai_service = get_ai_service()
    
    # Get source content
    source_text = ""
    source_title = "NCPOR Research"
    source_description = ""
    
    if req.source_document_id:
        doc = db.query(Document).filter(Document.id == req.source_document_id).first()
        if doc:
            source_title = doc.title
            source_description = f"Document: {doc.title}"
            # Get chunks for context
            chunks = db.query(DocumentChunk).filter(
                DocumentChunk.document_id == doc.id
            ).limit(10).all()
            source_text = "\n\n".join([c.chunk_text for c in chunks])
            if not source_text and doc.abstract:
                source_text = doc.abstract
    
    elif req.source_expedition_id:
        exp = db.query(Expedition).filter(Expedition.id == req.source_expedition_id).first()
        if exp:
            source_title = exp.title
            source_description = f"Expedition: {exp.title}"
            source_text = f"{exp.description or ''}\n\nObjectives: {', '.join(exp.objectives or [])}\n\nResearch Domains: {', '.join(exp.research_domains or [])}"
    
    elif req.source_dataset_id:
        ds = db.query(Dataset).filter(Dataset.id == req.source_dataset_id).first()
        if ds:
            source_title = ds.title
            source_description = f"Dataset: {ds.title}"
            source_text = ds.description or ""
    
    if not source_text:
        raise HTTPException(status_code=400, detail="Source document has no processable content")
    
    # Generate content
    generated_text = ai_service.generate_content(
        req.content_type,
        source_text,
        source_title,
    )
    
    # Save to DB
    gen_content = GeneratedContent(
        content_type=req.content_type,
        title=f"{req.content_type.title()} - {source_title}",
        content=generated_text,
        source_document_id=req.source_document_id,
        source_expedition_id=req.source_expedition_id,
        source_dataset_id=req.source_dataset_id,
        source_description=source_description,
        status=ContentStatus.DRAFT,
        generated_by=ai_service.model.model_name if ai_service.use_real else "demo",
    )
    db.add(gen_content)
    db.commit()
    db.refresh(gen_content)
    
    return {
        "id": gen_content.id,
        "content_type": req.content_type,
        "title": gen_content.title,
        "content": generated_text,
        "source": source_description,
        "status": "draft",
        "created_at": gen_content.created_at.isoformat(),
    }


@app.get("/api/content")
async def list_generated_content(
    status: Optional[str] = None,
    content_type: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    query = db.query(GeneratedContent)
    if status:
        try:
            query = query.filter(GeneratedContent.status == ContentStatus(status))
        except ValueError:
            pass
    if content_type:
        query = query.filter(GeneratedContent.content_type == content_type)
    
    total = query.count()
    items = query.order_by(desc(GeneratedContent.created_at)).offset(
        (page - 1) * page_size
    ).limit(page_size).all()
    
    return {
        "total": total,
        "items": [_gen_content_dict(c) for c in items],
    }


@app.post("/api/content/{content_id}/approve")
async def approve_content(
    content_id: str,
    req: ApproveContentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    content = db.query(GeneratedContent).filter(GeneratedContent.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    content.status = ContentStatus.APPROVED if req.status == "approved" else ContentStatus.REJECTED
    content.reviewed_by = current_user.id
    content.reviewed_at = datetime.utcnow()
    content.review_notes = req.review_notes
    db.commit()
    
    return {"status": content.status, "message": f"Content {req.status}"}


# ─────────────────────────────────────────────────────
# Ingestion / Crawler (Admin)
# ─────────────────────────────────────────────────────

@app.post("/api/ingestion/crawl")
async def start_crawl(
    req: CrawlRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    # Create crawl job
    job = CrawlJob(
        start_url=req.url,
        source_id=req.source_id,
        status=CrawlStatus.PENDING,
        config=req.config,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    
    background_tasks.add_task(_run_crawl_job, job.id, req.url, req.config)
    
    return {
        "job_id": job.id,
        "status": "started",
        "message": "Crawl job started",
        "start_url": req.url,
    }


async def _run_crawl_job(job_id: str, start_url: str, config: dict):
    """Background: run the actual crawl"""
    from database import SessionLocal
    db = SessionLocal()
    
    try:
        job = db.query(CrawlJob).filter(CrawlJob.id == job_id).first()
        if not job:
            return
        
        job.status = CrawlStatus.RUNNING
        job.started_at = datetime.utcnow()
        db.commit()
        
        processed_hashes = set()
        ai_service = get_ai_service()

        async def on_progress(data: dict):
            try:
                cur_job = db.query(CrawlJob).filter(CrawlJob.id == job_id).first()
                if cur_job:
                    cur_job.pages_scanned = data.get("pages_scanned", cur_job.pages_scanned)
                    db.commit()
            except Exception:
                pass

        async def on_resource(resource_data: dict):
            nonlocal processed_hashes
            content_hash = resource_data.get("content_hash", "")
            if content_hash and content_hash in processed_hashes:
                return
            if content_hash:
                processed_hashes.add(content_hash)

            try:
                cur_job = db.query(CrawlJob).filter(CrawlJob.id == job_id).first()
                if not cur_job or cur_job.status != CrawlStatus.RUNNING:
                    return

                # Check for duplicate
                existing_doc = db.query(Document).filter(
                    Document.content_hash == content_hash
                ).first() if content_hash else None

                if existing_doc:
                    cur_job.duplicates_found = (cur_job.duplicates_found or 0) + 1
                    cur_job.documents_discovered = (cur_job.documents_discovered or 0) + 1
                    db.commit()
                    return

                # Create crawl resource record
                crawl_resource = CrawlResource(
                    crawl_job_id=job_id,
                    url=resource_data["url"],
                    title=resource_data.get("title"),
                    content_type=resource_data.get("content_type"),
                    resource_type=resource_data.get("resource_type"),
                    status="processed",
                    content_hash=content_hash,
                    raw_text=resource_data.get("raw_text", "")[:10000],
                    extracted_metadata=resource_data.get("metadata", {}),
                )
                db.add(crawl_resource)
                db.flush()

                raw_text = (resource_data.get("raw_text") or "").strip()
                title = resource_data.get("title") or "Untitled NCPOR Resource"

                meta = {}
                if len(raw_text) >= 100:
                    try:
                        meta = ai_service.extract_document_metadata(raw_text, title)
                    except Exception as meta_err:
                        logger.warning(f"Metadata extraction fallback for {resource_data.get('url')}: {meta_err}")
                        meta = {}

                doc = Document(
                    title=meta.get("title") or title,
                    description=meta.get("abstract") or raw_text[:300] or title,
                    document_type=DocumentType.OTHER,
                    authors=meta.get("authors", []) or ["NCPOR Research Team"],
                    year=meta.get("year") or datetime.utcnow().year,
                    research_domains=meta.get("research_domains", []) or ["Polar Research"],
                    keywords=meta.get("keywords", []) or ["NCPOR", "Polar Science"],
                    abstract=meta.get("abstract") or raw_text[:800] or title,
                    source="NCPOR",
                    source_url=resource_data["url"],
                    content_hash=content_hash,
                    status=ContentStatus.PENDING_REVIEW,
                )

                try:
                    doc.region = Region(meta.get("region", "other"))
                except ValueError:
                    pass

                try:
                    doc.document_type = DocumentType(meta.get("document_type", "other"))
                except ValueError:
                    pass

                db.add(doc)
                db.commit()
                db.refresh(doc)

                crawl_resource.document_id = doc.id
                crawl_resource.status = "pending_review"

                cur_job.documents_discovered = (cur_job.documents_discovered or 0) + 1
                cur_job.new_resources = (cur_job.new_resources or 0) + 1
                db.commit()

                # Create chunks and vector embeddings safely in separate transaction
                if len(raw_text) >= 150:
                    try:
                        processor = DocumentProcessor(ai_service)
                        result_proc = processor.process_text(raw_text, title)
                        for chunk_data in result_proc.get("chunks", []):
                            emb = chunk_data.get("embedding")
                            if emb and len(emb) != 768:
                                emb = emb[:768] if len(emb) > 768 else emb + [0.0] * (768 - len(emb))
                            chunk = DocumentChunk(
                                document_id=doc.id,
                                chunk_index=chunk_data["index"],
                                page_number=chunk_data.get("page_number", 1),
                                chunk_text=chunk_data["text"],
                                embedding=emb,
                            )
                            db.add(chunk)
                        db.commit()
                    except Exception as chunk_err:
                        logger.warning(f"Chunking error for doc {doc.id} (document saved regardless): {chunk_err}")
                        db.rollback()

            except Exception as res_err:
                logger.error(f"Error processing resource {resource_data.get('url')}: {res_err}")
                db.rollback()

        crawler = NCPORCrawler(progress_callback=on_progress, resource_callback=on_resource)
        result = await crawler.crawl(start_url, config, job_id)

        if "error" in result:
            job = db.query(CrawlJob).filter(CrawlJob.id == job_id).first()
            if job:
                job.status = CrawlStatus.FAILED
                job.error_log = [result["error"]]
                db.commit()
            return

        # Ensure any remaining resources are processed
        for resource_data in result.get("resources", []):
            ch = resource_data.get("content_hash", "")
            if ch and ch not in processed_hashes:
                await on_resource(resource_data)

        job = db.query(CrawlJob).filter(CrawlJob.id == job_id).first()
        if job and job.status == CrawlStatus.RUNNING:
            job.pages_scanned = result.get("pages_scanned", job.pages_scanned)
            job.errors_count = len(result.get("errors", []))
            job.error_log = result.get("errors", [])[:20]
            job.status = CrawlStatus.COMPLETED
            job.completed_at = datetime.utcnow()
            db.commit()

        logger.info(f"Crawl job {job_id} completed: {job.new_resources if job else 0} new resources")
    
    except Exception as e:
        logger.error(f"Crawl job {job_id} failed: {e}")
        try:
            db.rollback()
            job = db.query(CrawlJob).filter(CrawlJob.id == job_id).first()
            if job:
                job.status = CrawlStatus.FAILED
                job.error_log = [str(e)]
                job.completed_at = datetime.utcnow()
                db.commit()
        except Exception:
            pass
    finally:
        db.close()


@app.post("/api/ingestion/jobs/{job_id}/stop")
async def stop_crawl_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    job = db.query(CrawlJob).filter(CrawlJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status == CrawlStatus.RUNNING or job.status == CrawlStatus.PENDING:
        job.status = CrawlStatus.FAILED
        job.error_log = (job.error_log or []) + ["Manually stopped by user"]
        job.completed_at = datetime.utcnow()
        db.commit()
    return _crawl_job_dict(job)


@app.get("/api/ingestion/jobs")
async def list_crawl_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    jobs = db.query(CrawlJob).order_by(desc(CrawlJob.created_at)).limit(20).all()
    return [_crawl_job_dict(j) for j in jobs]


@app.get("/api/ingestion/jobs/{job_id}")
async def get_crawl_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    job = db.query(CrawlJob).filter(CrawlJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    resources = db.query(CrawlResource).filter(CrawlResource.crawl_job_id == job_id).all()
    
    return {
        **_crawl_job_dict(job),
        "resources": [_crawl_resource_dict(r) for r in resources],
    }


@app.get("/api/ingestion/resources/pending")
async def get_pending_resources(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    docs = db.query(Document).filter(
        Document.status == ContentStatus.PENDING_REVIEW
    ).order_by(desc(Document.created_at)).limit(50).all()
    return [_doc_summary(d) for d in docs]


@app.post("/api/ingestion/resources/{doc_id}/approve")
async def approve_ingested_resource(
    doc_id: str,
    action: str = Query(..., pattern="^(approve|reject)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc.status = ContentStatus.APPROVED if action == "approve" else ContentStatus.REJECTED
    db.commit()
    return {"status": doc.status, "document_id": doc_id}


# ─────────────────────────────────────────────────────
# Sources
# ─────────────────────────────────────────────────────

@app.get("/api/sources")
async def list_sources(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    sources = db.query(Source).order_by(Source.name).all()
    return [_source_dict(s) for s in sources]


@app.post("/api/sources")
async def create_source(
    name: str = Form(...),
    source_type: str = Form(...),
    base_url: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    is_trusted: bool = Form(False),
    sync_frequency: str = Form("manual"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    source = Source(
        name=name,
        source_type=SourceType(source_type),
        base_url=base_url,
        description=description,
        is_trusted=is_trusted,
        sync_frequency=sync_frequency,
    )
    db.add(source)
    db.commit()
    db.refresh(source)
    return _source_dict(source)


# ─────────────────────────────────────────────────────
# Admin Dashboard
# ─────────────────────────────────────────────────────

@app.get("/api/admin/stats")
async def admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    total_docs = db.query(func.count(Document.id)).scalar() or 0
    pending_docs = db.query(func.count(Document.id)).filter(
        Document.status == ContentStatus.PENDING_REVIEW
    ).scalar() or 0
    total_datasets = db.query(func.count(Dataset.id)).scalar() or 0
    total_media = db.query(func.count(Media.id)).scalar() or 0
    total_expeditions = db.query(func.count(Expedition.id)).scalar() or 0
    total_users = db.query(func.count(User.id)).scalar() or 0
    pending_content = db.query(func.count(GeneratedContent.id)).filter(
        GeneratedContent.status == ContentStatus.DRAFT
    ).scalar() or 0
    total_crawl_jobs = db.query(func.count(CrawlJob.id)).scalar() or 0
    
    # Recent searches
    recent_queries = db.query(SearchLog).order_by(desc(SearchLog.created_at)).limit(10).all()
    
    return {
        "total_documents": total_docs,
        "pending_review": pending_docs,
        "total_datasets": total_datasets,
        "total_media": total_media,
        "total_expeditions": total_expeditions,
        "total_users": total_users,
        "pending_content": pending_content,
        "total_crawl_jobs": total_crawl_jobs,
        "recent_queries": [{"query": q.query, "created_at": q.created_at.isoformat()} for q in recent_queries],
    }


@app.post("/api/admin/seed")
@app.get("/api/admin/seed")
async def trigger_seed(
    db: Session = Depends(get_db),
):
    """Seed or update authentic NCPOR stations, expeditions, documents, datasets and media"""
    try:
        import seed_database
        seed_database.seed_all()
        doc_count = db.query(Document).count()
        exp_count = db.query(Expedition).count()
        sta_count = db.query(ResearchStation).count()
        data_count = db.query(Dataset).count()
        media_count = db.query(Media).count()
        topic_count = db.query(Topic).count()
        return {
            "status": "success",
            "message": f"Database populated successfully with {exp_count} expeditions, {sta_count} stations, {doc_count} documents, {data_count} datasets, {media_count} media, and {topic_count} topics.",
            "counts": {
                "expeditions": exp_count,
                "stations": sta_count,
                "documents": doc_count,
                "datasets": data_count,
                "media": media_count,
                "topics": topic_count,
            }
        }
    except Exception as e:
        import traceback
        return {"status": "error", "error": str(e), "traceback": traceback.format_exc()}



# ─────────────────────────────────────────────────────
# Serialization helpers
# ─────────────────────────────────────────────────────

def _doc_summary(d: Document) -> dict:
    return {
        "id": d.id,
        "title": d.title,
        "document_type": d.document_type.value if d.document_type else None,
        "year": d.year,
        "region": d.region.value if d.region else None,
        "research_domains": d.research_domains or [],
        "keywords": d.keywords or [],
        "abstract": (d.abstract or "")[:300],
        "source": d.source,
        "source_url": d.source_url,
        "file_url": d.file_url,
        "thumbnail_url": d.thumbnail_url,
        "expedition_id": d.expedition_id,
        "station_id": d.station_id,
        "status": d.status.value if d.status else None,
        "created_at": d.created_at.isoformat() if d.created_at else None,
        "last_verified_at": d.last_verified_at.isoformat() if d.last_verified_at else None,
    }


def _doc_full(d: Document) -> dict:
    return {
        **_doc_summary(d),
        "description": d.description,
        "authors": d.authors or [],
        "abstract": d.abstract,
        "language": d.language,
        "publication_date": d.publication_date.isoformat() if d.publication_date else None,
        "license": d.license,
        "content_hash": d.content_hash,
        "updated_at": d.updated_at.isoformat() if d.updated_at else None,
    }


def _expedition_summary(e: Expedition) -> dict:
    return {
        "id": e.id,
        "number": e.number,
        "title": e.title,
        "year": e.year,
        "region": e.region.value if e.region else None,
        "duration_days": e.duration_days,
        "research_domains": e.research_domains or [],
        "chief_scientist": e.chief_scientist,
        "thumbnail_url": e.thumbnail_url,
        "is_featured": e.is_featured,
        "description": (e.description or "")[:300],
    }


def _expedition_full(e: Expedition, db: Session) -> dict:
    doc_count = db.query(func.count(Document.id)).filter(
        Document.expedition_id == e.id,
        Document.status == ContentStatus.APPROVED
    ).scalar()
    dataset_count = db.query(func.count(Dataset.id)).filter(Dataset.expedition_id == e.id).scalar()
    media_count = db.query(func.count(Media.id)).filter(Media.expedition_id == e.id).scalar()
    
    return {
        **_expedition_summary(e),
        "objectives": e.objectives or [],
        "team_size": e.team_size,
        "start_date": e.start_date.isoformat() if e.start_date else None,
        "end_date": e.end_date.isoformat() if e.end_date else None,
        "source_url": e.source_url,
        "stations": [_station_summary(s) for s in (e.stations or [])],
        "document_count": doc_count or 0,
        "dataset_count": dataset_count or 0,
        "media_count": media_count or 0,
    }


def _station_summary(s: ResearchStation) -> dict:
    region_val = s.region.value if s.region else "other"
    if s.code == "HIMANSH":
        region_val = "himalayas"
    return {
        "id": s.id,
        "name": s.name,
        "code": s.code,
        "region": region_val,
        "latitude": s.latitude,
        "longitude": s.longitude,
        "established_year": s.established_year,
        "description": (s.description or "")[:300],
        "research_areas": s.research_areas or [],
        "facilities": s.facilities or [],
        "image_url": s.image_url,
        "is_active": s.is_active,
    }


def _dataset_summary(d: Dataset) -> dict:
    return {
        "id": d.id,
        "title": d.title,
        "description": (d.description or "")[:300],
        "publisher": d.publisher,
        "year": d.year,
        "region": d.region.value if d.region else None,
        "research_domains": d.research_domains or [],
        "variables": d.variables or [],
        "record_count": d.record_count,
        "file_format": d.file_format,
        "source": d.source,
        "source_url": d.source_url,
        "expedition_id": d.expedition_id,
    }


def _dataset_full(d: Dataset) -> dict:
    return {
        **_dataset_summary(d),
        "units": d.units or [],
        "file_url": d.file_url,
        "file_size_bytes": d.file_size_bytes,
        "license": d.license,
    }


def _media_summary(m: Media) -> dict:
    return {
        "id": m.id,
        "title": m.title,
        "description": m.description,
        "media_type": m.media_type.value if m.media_type else None,
        "file_url": m.file_url,
        "thumbnail_url": m.thumbnail_url,
        "width": m.width,
        "height": m.height,
        "duration_seconds": m.duration_seconds,
        "tags": m.tags or [],
        "year": m.year,
        "region": m.region.value if m.region else None,
        "credit": m.credit,
        "expedition_id": m.expedition_id,
        "station_id": m.station_id,
    }


def _topic_summary(t: Topic) -> dict:
    return {
        "id": t.id,
        "slug": t.slug,
        "title": t.title,
        "subtitle": t.subtitle,
        "category": t.category,
        "hero_image_url": t.hero_image_url,
        "reading_time_minutes": t.reading_time_minutes,
        "order_index": t.order_index,
    }


def _topic_full(t: Topic) -> dict:
    return {
        **_topic_summary(t),
        "content": t.content,
        "quiz_count": len(t.quizzes) if t.quizzes else 0,
    }


def _quiz_question_dict(q: QuizQuestion) -> dict:
    return {
        "id": q.id,
        "question": q.question,
        "options": q.options,
        "correct_answer_index": q.correct_answer_index,
        "explanation": q.explanation,
        "difficulty": q.difficulty,
        "order_index": q.order_index,
    }


def _gen_content_dict(c: GeneratedContent) -> dict:
    return {
        "id": c.id,
        "content_type": c.content_type,
        "title": c.title,
        "content": c.content,
        "source_document_id": c.source_document_id,
        "source_description": c.source_description,
        "status": c.status.value if c.status else None,
        "generated_by": c.generated_by,
        "reviewed_at": c.reviewed_at.isoformat() if c.reviewed_at else None,
        "review_notes": c.review_notes,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }


def _crawl_job_dict(j: CrawlJob) -> dict:
    return {
        "id": j.id,
        "start_url": j.start_url,
        "status": j.status.value if j.status else None,
        "pages_scanned": j.pages_scanned or 0,
        "documents_discovered": j.documents_discovered or 0,
        "new_resources": j.new_resources or 0,
        "updated_resources": j.updated_resources or 0,
        "duplicates_found": j.duplicates_found or 0,
        "errors_count": j.errors_count or 0,
        "started_at": j.started_at.isoformat() if j.started_at else None,
        "completed_at": j.completed_at.isoformat() if j.completed_at else None,
        "created_at": j.created_at.isoformat() if j.created_at else None,
        "error_log": j.error_log or [],
    }


def _crawl_resource_dict(r: CrawlResource) -> dict:
    return {
        "id": r.id,
        "url": r.url,
        "title": r.title,
        "content_type": r.content_type,
        "resource_type": r.resource_type,
        "status": r.status,
        "document_id": r.document_id,
        "error_message": r.error_message,
        "discovered_at": r.discovered_at.isoformat() if r.discovered_at else None,
    }


def _source_dict(s: Source) -> dict:
    return {
        "id": s.id,
        "name": s.name,
        "source_type": s.source_type.value if s.source_type else None,
        "base_url": s.base_url,
        "description": s.description,
        "is_trusted": s.is_trusted,
        "is_active": s.is_active,
        "sync_frequency": s.sync_frequency,
        "last_synced_at": s.last_synced_at.isoformat() if s.last_synced_at else None,
        "created_at": s.created_at.isoformat() if s.created_at else None,
    }


if __name__ == "__main__":
    import os
    import uvicorn
    raw_port = os.environ.get("PORT", "8000")
    try:
        port = int(raw_port)
    except (ValueError, TypeError):
        port = 8000
    print(f"Starting server on 0.0.0.0:{port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, log_level="info")

