"""
PostgreSQL + pgvector database models using SQLAlchemy
"""
from datetime import datetime
from typing import Optional, List
from sqlalchemy import (
    create_engine, Column, String, Integer, Float, Boolean, DateTime,
    Text, ForeignKey, JSON, Enum as SQLEnum, Index, BigInteger
)
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from pgvector.sqlalchemy import Vector
import uuid
import enum

Base = declarative_base()


def generate_uuid():
    return str(uuid.uuid4())


# ─────────────────────────────────────────────
# Enums
# ─────────────────────────────────────────────

class UserRole(str, enum.Enum):
    PUBLIC = "public"
    RESEARCHER = "researcher"
    EDITOR = "editor"
    ADMIN = "admin"


class DocumentType(str, enum.Enum):
    EXPEDITION_REPORT = "expedition_report"
    RESEARCH_PAPER = "research_paper"
    PUBLICATION = "publication"
    TECHNICAL_REPORT = "technical_report"
    DATASET = "dataset"
    NEWS = "news"
    EDUCATIONAL = "educational"
    OTHER = "other"


class Region(str, enum.Enum):
    ANTARCTICA = "antarctica"
    ARCTIC = "arctic"
    BOTH = "both"
    OTHER = "other"


class ContentStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    PUBLISHED = "published"


class SourceType(str, enum.Enum):
    WEB_CRAWLER = "web_crawler"
    MANUAL_UPLOAD = "manual_upload"
    API = "api"
    DATASET_CONNECTOR = "dataset_connector"


class CrawlStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"


class MediaType(str, enum.Enum):
    IMAGE = "image"
    VIDEO = "video"
    INFOGRAPHIC = "infographic"


# ─────────────────────────────────────────────
# Core Models
# ─────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=True)  # Null for OAuth
    full_name = Column(String, nullable=True)
    role = Column(SQLEnum(UserRole), default=UserRole.PUBLIC, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)


class ResearchStation(Base):
    __tablename__ = "research_stations"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, index=True)
    code = Column(String, unique=True, nullable=True)  # e.g., HIMADRI, MAITRI
    region = Column(SQLEnum(Region), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    established_year = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    research_areas = Column(JSON, default=list)  # List of strings
    facilities = Column(JSON, default=list)
    image_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    source_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    expeditions = relationship("Expedition", secondary="expedition_stations", back_populates="stations")
    documents = relationship("Document", back_populates="station")
    media = relationship("Media", back_populates="station")


class Expedition(Base):
    __tablename__ = "expeditions"

    id = Column(String, primary_key=True, default=generate_uuid)
    number = Column(Integer, nullable=False, unique=True)
    title = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    region = Column(SQLEnum(Region), nullable=False)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    duration_days = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    objectives = Column(JSON, default=list)
    research_domains = Column(JSON, default=list)
    team_size = Column(Integer, nullable=True)
    chief_scientist = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    source_url = Column(String, nullable=True)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    stations = relationship("ResearchStation", secondary="expedition_stations", back_populates="expeditions")
    documents = relationship("Document", back_populates="expedition")
    media = relationship("Media", back_populates="expedition")


class ExpeditionStation(Base):
    __tablename__ = "expedition_stations"

    expedition_id = Column(String, ForeignKey("expeditions.id"), primary_key=True)
    station_id = Column(String, ForeignKey("research_stations.id"), primary_key=True)


class Source(Base):
    __tablename__ = "sources"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    source_type = Column(SQLEnum(SourceType), nullable=False)
    base_url = Column(String, nullable=True)
    description = Column(String, nullable=True)
    is_trusted = Column(Boolean, default=False)  # Auto-approve if trusted
    is_active = Column(Boolean, default=True)
    config = Column(JSON, default=dict)  # Crawler config, API keys, etc.
    last_synced_at = Column(DateTime, nullable=True)
    sync_frequency = Column(String, default="manual")  # manual/daily/weekly/monthly
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    crawl_jobs = relationship("CrawlJob", back_populates="source")


class CrawlJob(Base):
    __tablename__ = "crawl_jobs"

    id = Column(String, primary_key=True, default=generate_uuid)
    source_id = Column(String, ForeignKey("sources.id"), nullable=True)
    start_url = Column(String, nullable=False)
    status = Column(SQLEnum(CrawlStatus), default=CrawlStatus.PENDING)
    config = Column(JSON, default=dict)

    # Progress metrics
    pages_scanned = Column(Integer, default=0)
    documents_discovered = Column(Integer, default=0)
    new_resources = Column(Integer, default=0)
    updated_resources = Column(Integer, default=0)
    duplicates_found = Column(Integer, default=0)
    errors_count = Column(Integer, default=0)

    # Timing
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    source = relationship("Source", back_populates="crawl_jobs")
    resources = relationship("CrawlResource", back_populates="crawl_job")
    error_log = Column(JSON, default=list)  # List of error messages


class CrawlResource(Base):
    __tablename__ = "crawl_resources"

    id = Column(String, primary_key=True, default=generate_uuid)
    crawl_job_id = Column(String, ForeignKey("crawl_jobs.id"), nullable=False)
    url = Column(String, nullable=False)
    title = Column(String, nullable=True)
    content_type = Column(String, nullable=True)  # text/html, application/pdf, etc.
    resource_type = Column(String, nullable=True)  # publication, news, dataset, etc.
    status = Column(String, default="discovered")  # discovered, processed, approved, rejected
    content_hash = Column(String, nullable=True)
    raw_text = Column(Text, nullable=True)
    extracted_metadata = Column(JSON, default=dict)
    document_id = Column(String, ForeignKey("documents.id"), nullable=True)
    error_message = Column(String, nullable=True)
    discovered_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)

    crawl_job = relationship("CrawlJob", back_populates="resources")
    document = relationship("Document", foreign_keys=[document_id])


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    document_type = Column(SQLEnum(DocumentType), nullable=False)
    file_url = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    file_size_bytes = Column(BigInteger, nullable=True)

    # Provenance
    year = Column(Integer, nullable=True)
    publication_date = Column(DateTime, nullable=True)
    region = Column(SQLEnum(Region), nullable=True)
    authors = Column(JSON, default=list)
    research_domains = Column(JSON, default=list)
    keywords = Column(JSON, default=list)
    language = Column(String, default="en")
    abstract = Column(Text, nullable=True)

    # Source provenance
    source = Column(String, nullable=True)  # e.g., "NCPOR"
    source_url = Column(String, nullable=True)
    source_id = Column(String, ForeignKey("sources.id"), nullable=True)
    license = Column(String, nullable=True)
    content_hash = Column(String, nullable=True)

    # Relations
    expedition_id = Column(String, ForeignKey("expeditions.id"), nullable=True)
    station_id = Column(String, ForeignKey("research_stations.id"), nullable=True)

    # Status
    status = Column(SQLEnum(ContentStatus), default=ContentStatus.PENDING_REVIEW)
    is_demo = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_verified_at = Column(DateTime, nullable=True)

    # Relationships
    expedition = relationship("Expedition", back_populates="documents")
    station = relationship("ResearchStation", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String, primary_key=True, default=generate_uuid)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    page_number = Column(Integer, nullable=True)
    chunk_text = Column(Text, nullable=False)
    embedding = Column(Vector(768), nullable=True)  # Gemini text-embedding-004: 768 dims
    metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="chunks")

    __table_args__ = (
        Index("ix_doc_chunks_document_id", "document_id"),
    )


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    publisher = Column(String, nullable=True)
    year = Column(Integer, nullable=True)
    region = Column(SQLEnum(Region), nullable=True)
    research_domains = Column(JSON, default=list)
    variables = Column(JSON, default=list)
    units = Column(JSON, default=list)
    record_count = Column(Integer, nullable=True)
    file_url = Column(String, nullable=True)
    file_format = Column(String, nullable=True)
    file_size_bytes = Column(BigInteger, nullable=True)
    source = Column(String, nullable=True)
    source_url = Column(String, nullable=True)
    license = Column(String, nullable=True)
    expedition_id = Column(String, ForeignKey("expeditions.id"), nullable=True)
    station_id = Column(String, ForeignKey("research_stations.id"), nullable=True)
    status = Column(SQLEnum(ContentStatus), default=ContentStatus.APPROVED)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    expedition = relationship("Expedition")
    station = relationship("ResearchStation")


class Media(Base):
    __tablename__ = "media"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    media_type = Column(SQLEnum(MediaType), nullable=False)
    file_url = Column(String, nullable=False)
    thumbnail_url = Column(String, nullable=True)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    duration_seconds = Column(Float, nullable=True)  # For video
    file_size_bytes = Column(BigInteger, nullable=True)
    tags = Column(JSON, default=list)
    year = Column(Integer, nullable=True)
    region = Column(SQLEnum(Region), nullable=True)
    source = Column(String, nullable=True)
    source_url = Column(String, nullable=True)
    credit = Column(String, nullable=True)
    license = Column(String, nullable=True)
    expedition_id = Column(String, ForeignKey("expeditions.id"), nullable=True)
    station_id = Column(String, ForeignKey("research_stations.id"), nullable=True)
    status = Column(SQLEnum(ContentStatus), default=ContentStatus.APPROVED)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    expedition = relationship("Expedition", back_populates="media")
    station = relationship("ResearchStation", back_populates="media")


class Topic(Base):
    """Educational topics for Polar Classroom"""
    __tablename__ = "topics"

    id = Column(String, primary_key=True, default=generate_uuid)
    slug = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    subtitle = Column(String, nullable=True)
    category = Column(String, nullable=True)  # climate, glaciology, etc.
    content = Column(Text, nullable=True)  # Rich text/markdown
    hero_image_url = Column(String, nullable=True)
    reading_time_minutes = Column(Integer, nullable=True)
    order_index = Column(Integer, default=0)
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    quizzes = relationship("QuizQuestion", back_populates="topic")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(String, primary_key=True, default=generate_uuid)
    topic_id = Column(String, ForeignKey("topics.id"), nullable=False)
    question = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # List of 4 options
    correct_answer_index = Column(Integer, nullable=False)  # 0-3
    explanation = Column(Text, nullable=True)
    difficulty = Column(String, default="medium")
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    topic = relationship("Topic", back_populates="quizzes")


class GeneratedContent(Base):
    __tablename__ = "generated_content"

    id = Column(String, primary_key=True, default=generate_uuid)
    content_type = Column(String, nullable=False)  # summary, article, linkedin, quiz, etc.
    title = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    source_document_id = Column(String, ForeignKey("documents.id"), nullable=True)
    source_expedition_id = Column(String, ForeignKey("expeditions.id"), nullable=True)
    source_dataset_id = Column(String, ForeignKey("datasets.id"), nullable=True)
    source_description = Column(String, nullable=True)
    status = Column(SQLEnum(ContentStatus), default=ContentStatus.DRAFT)
    generated_by = Column(String, nullable=True)  # AI model used
    reviewed_by = Column(String, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    review_notes = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    source_document = relationship("Document")


class SearchLog(Base):
    __tablename__ = "search_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    query = Column(String, nullable=False)
    search_type = Column(String, default="keyword")  # keyword, semantic
    result_count = Column(Integer, default=0)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    session_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AIQueryLog(Base):
    __tablename__ = "ai_query_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=True)
    sources_used = Column(JSON, default=list)  # List of document IDs
    chunks_retrieved = Column(Integer, default=0)
    model_used = Column(String, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    session_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
