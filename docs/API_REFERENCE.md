# Polar Knowledge Hub — REST API Reference

> **Base URL (Local API):** `http://localhost:8000`  
> **Base URL (Proxied via Next.js):** `http://localhost:3000/api`  
> **Interactive Swagger UI:** `http://localhost:8000/docs`  
> **OpenAPI JSON Specification:** `http://localhost:8000/openapi.json`

---

## 1. Authentication (`/api/auth`)

### 1.1 Login & Obtain JWT Token
* **Endpoint:** `POST /api/auth/login`
* **Request Body:**
  ```json
  {
    "email": "admin@ncpor.res.in",
    "password": "PolarHub@2026"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "token_type": "bearer",
    "user": {
      "id": "e4a29a1b-...",
      "email": "admin@ncpor.res.in",
      "full_name": "NCPOR Administrator",
      "role": "admin"
    }
  }
  ```

### 1.2 Register New User
* **Endpoint:** `POST /api/auth/register`
* **Request Body:**
  ```json
  {
    "email": "scientist@ncpor.res.in",
    "password": "SecurePassword123",
    "full_name": "Dr. A. Sharma"
  }
  ```

### 1.3 Get Current User Profile
* **Endpoint:** `GET /api/auth/me`
* **Headers:** `Authorization: Bearer <token>`

---

## 2. Platform Statistics (`/api/stats`)

### 2.1 Get Summary Metrics
* **Endpoint:** `GET /api/stats`
* **Response (200 OK):**
  ```json
  {
    "documents": 12,
    "datasets": 6,
    "images": 18,
    "videos": 4,
    "expeditions": 44,
    "stations": 5
  }
  ```

---

## 3. Documents & Research Repository (`/api/documents`)

### 3.1 List & Filter Documents
* **Endpoint:** `GET /api/documents`
* **Query Parameters:**
  * `page` (int, default: 1)
  * `page_size` (int, default: 20)
  * `document_type` (string, optional: `expedition_report`, `publication`, `dataset`, `policy_document`)
  * `region` (string, optional: `antarctica`, `arctic`, `southern_ocean`, `himalayas`)
* **Response (200 OK):**
  ```json
  {
    "total": 12,
    "page": 1,
    "page_size": 20,
    "items": [
      {
        "id": "2b55748a-4cd8-4ee6-b0ff-3176a9014967",
        "title": "Deep Ocean Research: Abyssal Plain Studies in the Indian Ocean",
        "document_type": "publication",
        "year": 2024,
        "region": "antarctica",
        "authors": ["Dr. K. S. Rao", "Dr. V. M. Patil"],
        "research_domains": ["Oceanography", "Marine Geophysics"],
        "file_url": "https://www.ncpor.res.in/publications/deep-ocean.pdf",
        "status": "approved"
      }
    ]
  }
  ```

### 3.2 Retrieve Document by ID
* **Endpoint:** `GET /api/documents/{id}`
* **Response (200 OK):** Full metadata including abstract, full chunk previews, keywords, and file size.

---

## 4. Search Engine (`/api/search`)

### 4.1 Hybrid / Vector Search
* **Endpoint:** `POST /api/search`
* **Request Body:**
  ```json
  {
    "query": "Southern Ocean carbon sink glaciology",
    "search_type": "hybrid",
    "filters": {
      "region": "antarctica"
    },
    "page": 1,
    "page_size": 20
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "total": 5,
    "results": [...],
    "latency_ms": 42.8,
    "search_type": "hybrid"
  }
  ```

---

## 5. Polar AI Assistant (`/api/assistant`)

### 5.1 Query with RAG Grounding
* **Endpoint:** `POST /api/assistant/query`
* **Request Body:**
  ```json
  {
    "question": "What scientific instruments were deployed during the 44th Antarctic Expedition?",
    "session_id": "session-1234"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "answer": "During the 44th Indian Antarctic Expedition, researchers deployed deep ice-core drilling rigs...",
    "sources": [
      {
        "title": "44th IAE Preliminary Scientific Report",
        "doc_id": "efe52b84-...",
        "page_number": 14,
        "snippet": "Ice-core drilling operations conducted at Larsemann Hills..."
      }
    ],
    "model_used": "gemini-2.0-flash"
  }
  ```

---

## 6. Expeditions (`/api/expeditions`)

### 6.1 List Expeditions
* **Endpoint:** `GET /api/expeditions`
* **Query Parameters:** `region` (`antarctica`, `arctic`, `southern_ocean`)

### 6.2 Get Featured Expedition
* **Endpoint:** `GET /api/expeditions/featured`
* **Response (200 OK):** Full record for the current flagship mission (e.g. 44th IAE).

### 6.3 Get Expedition Dossier
* **Endpoint:** `GET /api/expeditions/{id}`

---

## 7. Research Stations (`/api/stations`)

### 7.1 List All Polar Stations
* **Endpoint:** `GET /api/stations`
* **Returns:** Maitri, Bharati, Himadri, IndARC, and Himansh records with geographic coordinates and research areas.

---

## 8. Content Studio (`/api/content`)

### 8.1 Generate Outreach Formats
* **Endpoint:** `POST /api/content/generate`
* **Request Body:**
  ```json
  {
    "content_type": "press_release",
    "source_document_id": "2b55748a-...",
    "source_expedition_id": "efe52b84-..."
  }
  ```
* **Supported `content_type` options:**
  * `summary` (Executive 150 words)
  * `article` (500-word popular science article)
  * `student_explain` (Simplified classroom analogy)
  * `social_post` (Twitter/X & LinkedIn threads)
  * `press_release` (Official media release format)
  * `quiz` (5-question MCQ module)

---

## 9. Crawler & Ingestion Management (`/api/ingestion`)

### 9.1 Launch Scrape Job
* **Endpoint:** `POST /api/ingestion/crawl`
* **Headers:** `Authorization: Bearer <admin_token>`
* **Request Body:**
  ```json
  {
    "url": "https://www.ncpor.res.in",
    "config": {
      "max_pages": 25,
      "max_depth": 2
    }
  }
  ```

### 9.2 List Pending Ingested Resources
* **Endpoint:** `GET /api/ingestion/resources/pending`

### 9.3 Approve / Reject Crawled Resource
* **Endpoint:** `POST /api/ingestion/resources/{doc_id}/approve?action=approve`
