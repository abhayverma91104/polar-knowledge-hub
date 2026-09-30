# 🧊 Polar Knowledge Hub

> **Integrated Polar Science Outreach, Knowledge Repository, and Media Dissemination Portal**  
> **Smart India Hackathon (SIH) 2026** · **Problem Statement ID: 26063**  
> **Ministry:** Ministry of Earth Sciences (MoES)  
> **Organization:** National Centre for Polar and Ocean Research (NCPOR), Goa, India  
> **Theme:** Smart Education · **Category:** Software

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.115+-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js_16_(Turbopack)-black?logo=next.js)](https://nextjs.org)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini_2.0_Flash-4285F4?logo=google)](https://ai.google.dev)
[![Leaflet](https://img.shields.io/badge/Map-Leaflet.js-199900?logo=leaflet)](https://leafletjs.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 Tagline
> **“Discover. Understand. Explore the Poles.”**

The **Polar Knowledge Hub** is an AI-powered scientific knowledge, education, research discovery, and media outreach platform that centralizes NCPOR's institutional intelligence and transforms decades of Indian polar expeditions into an accessible, searchable, and interactive digital experience.

---

## 📚 Complete Project Documentation

Detailed documentation is available in the [`docs/`](./docs) folder:

| Document | Description |
| :--- | :--- |
| 🏛️ [**System Architecture**](./docs/ARCHITECTURE.md) | Multi-tier architectural specifications, data models, RAG chunking pipeline, and security governance. |
| 🔌 [**REST API Reference**](./docs/API_REFERENCE.md) | Complete OpenAPI/Swagger documentation, endpoint payloads, parameters, and response schemas. |
| 🎯 [**SIH 26063 Compliance Matrix**](./docs/SIH_PROBLEM_STATEMENT.md) | Direct mapping of SIH Problem Statement 26063 requirements to our implemented solution. |
| 🚀 [**Deployment & Operations Guide**](./docs/DEPLOYMENT_GUIDE.md) | Step-by-step instructions for local execution, Docker Compose orchestration, and environment variables. |

---

## 🚀 Key Modules & Capabilities

### 1. 🔍 Unified Search & Discovery Engine ([`/repository`](http://localhost:3000/repository))
* **Hybrid Search:** Combines BM25 keyword matching with dense vector similarity search.
* **Multi-Domain Filters:** Filter by disciplines (Oceanography, Glaciology, Paleoclimatology, Biology), regions (Antarctica, Arctic, Southern Ocean, Himalayas), and year.
* **Document Dossiers:** Full-text abstracts, author indexes, citation generation, and direct PDF downloads.

### 2. 🤖 Polar AI Assistant with Grounded Citations ([`/assistant`](http://localhost:3000/assistant))
* **RAG Pipeline:** Powered by Google Gemini 2.0 Flash (`text-embedding-004`), answering questions strictly from indexed NCPOR records.
* **Transparent Attribution:** Each response includes verifiable citation cards citing exact document IDs, titles, and matched text snippets.
* **Fail-Safe Offline Mode:** Intelligently switches to an internal BM25 synthesis engine if an external LLM key is omitted or rate-limited.

### 3. ✨ Automated Outreach & Content Studio ([`/content-studio`](http://localhost:3000/content-studio))
* Converts technical papers and expedition logs into **6 distinct public engagement formats**:
  1. **Executive Summaries** (150 words for policymakers).
  2. **Popular Science Articles** (500 words for digital publications).
  3. **High School Student Explanations** (Relatable analogies for Grades 8–10).
  4. **Social Media Campaigns** (LinkedIn posts and Twitter/X threads with hashtags).
  5. **Official Press Releases** (MoES media release format).
  6. **Classroom Quizzes** (5-question MCQs with explanatory answer keys).

### 4. 🗺️ Interactive Polar Map & Stations Explorer ([`/explore`](http://localhost:3000/explore) & [`/stations`](http://localhost:3000/stations))
* **Interactive Cartography:** Dark-mode Leaflet map highlighting India's polar and cryospheric bases:
  * **Antarctica:** Bharati Station (69°24'S, 76°11'E) & Maitri Station (70°45'S, 11°44'E).
  * **Arctic:** Himadri Station (78°55'N, 11°56'E) & IndARC Underwater Mooring (Kongsfjorden).
  * **Himalayas (Third Pole):** Himansh High-Altitude Base (32°24'N, 77°36'E).
* **Live Details Drawer:** Real-time coordinates, operational status, scientific domains, and linked research publications.

### 5. 🎓 Polar Classroom & Educational Hub ([`/classroom`](http://localhost:3000/classroom))
* Structured learning modules on Polar Ice Sheets, Climate Proxies, Ocean Currents, and Antarctic Biodiversity.
* Interactive self-assessment quizzes with real-time scoring and instant explanations.

### 6. 📸 Polar Media Archives ([`/media`](http://localhost:3000/media))
* High-resolution photographic records covering auroras, wildlife colonies, deep ice-coring operations, and polar expedition vessels with interactive modal view.

### 7. ⚙️ Ingestion Engine & Admin Portal ([`/admin`](http://localhost:3000/admin))
* **Automated Web Crawler:** Scheduled scraping of official NCPOR web domains (`ncpor.res.in`, `ncaor.gov.in`) with robots.txt compliance and SHA-256 deduplication.
* **Editorial Review Queue ([`/admin/review`](http://localhost:3000/admin/review)):** Human-in-the-loop review interface allowing administrators to inspect, approve, or reject crawled resources.

---

## ⚡ Quickstart (One Command)

To start both the FastAPI backend and Next.js frontend concurrently:

```bash
chmod +x start.sh
./start.sh
```

### Server Endpoints:
| Service | URL | Notes |
| :--- | :--- | :--- |
| **Frontend Portal** | `http://localhost:3000` | Next.js 16 Web Application |
| **Backend API** | `http://localhost:8000` | FastAPI REST API |
| **API Documentation** | `http://localhost:8000/docs` | Interactive Swagger UI |
| **Admin Portal** | `http://localhost:3000/admin` | Ingestion & Editorial Dashboard |

### Default Credentials:
* **Admin Email:** `admin@ncpor.res.in`
* **Password:** `PolarHub@2026`
* **Editor Email:** `editor@ncpor.res.in` (Password: `PolarHub@2026`)

---

## 🏗️ Tech Stack

```
Frontend:     Next.js 16 (Turbopack, App Router, React 19) + Tailwind CSS v4 + Lucide Icons + Leaflet
Backend:      FastAPI (Python 3.10+) + Uvicorn + Pydantic v2 + SQLAlchemy ORM
AI / RAG:     Google Gemini 2.0 Flash + text-embedding-004 + BM25 Fallback Synthesizer
Database:     SQLite (Zero-config local) / PostgreSQL + pgvector (Production)
Processing:   PyMuPDF (PDF Extraction) + BeautifulSoup4 + httpx (Async Crawler)
```

---

## 📄 License & Attribution

Developed for the **Smart India Hackathon 2026** under Problem Statement **26063**.  
Maintained in collaboration with the **National Centre for Polar and Ocean Research (NCPOR)**, Ministry of Earth Sciences, Government of India.
