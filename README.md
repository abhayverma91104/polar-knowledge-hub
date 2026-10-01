# 🧊 Polar Knowledge Hub

> **Integrated Polar Science Outreach, Knowledge Repository, and Media Dissemination Portal**  
> **Ministry:** Ministry of Earth Sciences (MoES), Government of India  
> **Nodal Institution:** National Centre for Polar and Ocean Research (NCPOR), Goa, India  
> **Mission Scope:** Antarctic Expeditions, Arctic Research, Southern Ocean Studies, and Himalayan Cryosphere  

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.115+-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js_16_(Turbopack)-black?logo=next.js)](https://nextjs.org)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini_2.0_Flash-4285F4?logo=google)](https://ai.google.dev)
[![Esri Maps](https://img.shields.io/badge/Cartography-Esri_High--Resolution-blue?logo=esri)](https://www.esri.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 Tagline
> **“Discover. Understand. Explore the Poles.”**

The **Polar Knowledge Hub** is an AI-powered scientific intelligence, public outreach, research discovery, and media dissemination portal. It centralizes institutional research from the **National Centre for Polar and Ocean Research (NCPOR)**, transforming over four decades of Indian polar expeditions across Antarctica, the Arctic, the Southern Ocean, and the Himalayan Cryosphere into an accessible, searchable, and interactive digital experience.

---

## 📚 Technical Documentation

Comprehensive architectural and operational guides are maintained in the [`docs/`](./docs) directory:

| Document | Focus & Coverage |
| :--- | :--- |
| 🏛️ [**System Architecture**](./docs/ARCHITECTURE.md) | Multi-tier architectural specifications, data models, RAG vector pipelines, and security governance. |
| 🔌 [**REST API Reference**](./docs/API_REFERENCE.md) | Complete OpenAPI/Swagger documentation, endpoint payloads, parameters, and response schemas. |
| 🚀 [**Deployment & Operations Guide**](./docs/DEPLOYMENT_GUIDE.md) | Step-by-step instructions for local execution, Docker Compose orchestration, and environment variables. |

---

## 🚀 Key Modules & Capabilities

### 1. 🔍 Scientific Knowledge Repository ([`/repository`](http://localhost:3000/repository))
* **Unified Discovery:** Cross-searches scientific publications, technical reports, expedition summaries, and open datasets.
* **Hybrid Search Engine:** Combines BM25 weighted keyword matching with dense vector embeddings (`text-embedding-004`) for high-precision retrieval.
* **Multi-Dimensional Filtering:** Filter research by:
  - **Scientific Disciplines:** Oceanography, Glaciology, Paleoclimatology, Atmospheric Science, Marine Biology, Polar Geology.
  - **Geographic Regions:** Antarctica, Arctic, Southern Ocean, Himalayas (Third Pole).
  - **Temporal Ranges:** 1981 to present.
* **Document Dossiers:** Full-text abstracts, author indexes, citation generation (BibTeX, APA), and direct source PDF downloads.

### 2. 🤖 Polar AI Assistant with Grounded Citations ([`/assistant`](http://localhost:3000/assistant))
* **Retrieval-Augmented Generation (RAG):** Powered by **Google Gemini 2.0 Flash**, synthesizing answers grounded strictly in indexed NCPOR records.
* **Verifiable Attribution:** Every generated statement includes bracketed citation tags (`[1]`, `[2]`) linked directly to source documents with page numbers and snippet excerpts.
* **Dynamic Key Detection:** Zero-downtime hot-reload of `GEMINI_API_KEY` from environment files without requiring a server reboot.
* **Intelligent Offline Fallback:** Gracefully switches to an internal multi-word weighted synthesis engine if external LLM credentials are not configured or rate-limited.
* **Live Health Telemetry:** Exposed via `/api/assistant/status` showing active model, SDK type, and connectivity state.

### 3. ✨ Automated Outreach & Content Studio ([`/content-studio`](http://localhost:3000/content-studio))
Transforms dense technical papers and expedition logs into **9 standardized outreach formats**:
1. **Executive Summaries:** 180–250 word briefs (Background, Key Findings, Strategic Implications) for policymakers and leadership.
2. **Popular Science Articles:** Engaging ~500-word feature articles with thematic subheadings for science magazines and digital media.
3. **Student Explanations:** Accessible Grade 8–10 educational explainers utilizing vivid real-world analogies (e.g., ice sheets as mirrors, ocean currents as conveyor belts).
4. **LinkedIn Dispatches:** Executive posts with key scientific takeaways, international collaboration highlights, and strategic hashtags.
5. **X / Twitter Threads:** 4-part numbered threads formatted strictly within character limits.
6. **Instagram Captions:** Storytelling captions capturing extreme polar field conditions with polar emojis and tags.
7. **YouTube Publishing Packages:** Optimized titles (<68 chars), descriptions with chapter timestamp placeholders, and 15 targeted search tags.
8. **Classroom Quizzes:** 5-question multiple-choice assessments with answer keys and detailed rationales formatted in structured JSON.
9. **Official Press Releases:** Formal Government of India / MoES media announcements with dateline, quote placeholders, and institutional boilerplates.

### 4. 🗺️ Interactive Geospatial Console & Polar Map ([`/explore`](http://localhost:3000/explore) & [`/stations`](http://localhost:3000/stations))
* **Zero-Watermark High-Resolution Cartography:** Powered by Esri Geographic Web Services:
  - **Dark Polar Canvas (Default):** High-contrast midnight-navy basemap tailored for polar visualization.
  - **Satellite Imagery:** Real satellite photography displaying actual polar ice sheets, glaciers, ice shelves, and sea ice.
  - **Terrain & Bathymetry:** Topographic elevations and ocean floor depth relief.
* **Quick Polar Fly-To Presets:** Instant camera navigation to:
  - ❄️ **Antarctica** (`[-71.5°, 45°]`, zoom 3) — Bharati, Maitri, and Dakshin Gangotri.
  - 🧊 **Arctic** (`[78.9°, 12°]`, zoom 4) — Himadri and IndARC in Svalbard.
  - 🏔️ **Himalayas** (`[32.4°, 77.6°]`, zoom 6) — Himansh in Spiti Valley.
  - 🌐 **Global Perspective** — High-latitude planetary view.
* **Comprehensive Research Facility Directory:**
  - **Bharati Station** (Larsemann Hills, East Antarctica — Active)
  - **Maitri Station** (Schirmacher Oasis, East Antarctica — Active)
  - **Dakshin Gangotri** (Ice Shelf, East Antarctica — Historic Heritage Base)
  - **Himadri Station** (Ny-Ålesund, Svalbard, Arctic — Active)
  - **IndARC Observatory** (Kongsfjorden Fjord, Arctic — Underwater Moored ADCP Profiler)
  - **Himansh Cryosphere Base** (Spiti Valley, Himachal Pradesh — 13,500 ft High Altitude)
* **Station Inspector Drawer:** Displays commission years, coordinates, research areas, specialized facilities, and shortcuts to ask Polar AI about specific stations.

### 5. 🎓 Polar Classroom & Educational Hub ([`/classroom`](http://localhost:3000/classroom))
* **Curriculum Modules:** Structured educational lessons covering:
  - *Polar Ice Sheets & Climate Teleconnections*
  - *Glacier Mass Balance & Cryospheric Change*
  - *Southern Ocean Circulation & Deep Water Formation*
  - *Atmospheric Ozone Layer Dynamics*
  - *History of Indian Polar Exploration*
* **Interactive Assessment:** Module knowledge check quizzes with immediate answer evaluation and explanations.
* **AI Concept Explainer:** Integrated endpoint (`POST /api/classroom/topics/{slug}/explain`) allowing learners to ask Polar AI to clarify complex polar concepts in simple language.

### 6. 📸 Polar Media Archives ([`/media`](http://localhost:3000/media))
* Curated photographic records of polar expeditions, auroral observations, wildlife populations (penguins, seals), ice core drilling operations, and polar research vessels (*ORV Sagar Kanya*, *Sagar Nidhi*).
* High-resolution lightbox modal with metadata, location tags, and related research links.

### 7. 🚢 Expeditions Timeline & Dossiers ([`/expeditions`](http://localhost:3000/expeditions))
* Chronological breakdown of Indian Scientific Expeditions to Antarctica (ISEA 1st to 44th), Arctic summer and winter expeditions, and Southern Ocean expeditions.
* Detailed expedition briefs covering objectives, voyage logs, team rosters, and participating national laboratories.

### 8. ⚙️ Web Crawler & Editorial Review Queue ([`/admin`](http://localhost:3000/admin))
* **Automated Web Crawler:** Background crawler designed for institutional domains (`ncpor.res.in`, `ncaor.gov.in`) with robots.txt compliance, polite rate limiting, and SHA-256 deduplication.
* **Progress Telemetry:** High-contrast, real-time scanning logs with error recovery.
* **Editorial Review Queue ([`/admin/review`](http://localhost:3000/admin/review)):** Human-in-the-loop review portal allowing curators to inspect, edit metadata, approve, or reject crawled resources before public ingestion.

---

## ⚡ Quickstart (Local Development)

### Prerequisites
- **Node.js** (v18+ recommended)
- **Python** (v3.10+)

### Start All Services (One Command)
Run the startup script from the project root:

```bash
chmod +x start.sh
./start.sh
```

This script automatically provisions the Python virtual environment, installs backend and frontend dependencies, initializes the local database, and launches both dev servers concurrently.

### Server Endpoints:
| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend Portal** | `http://localhost:3000` | Next.js 16 Web Application |
| **Backend API** | `http://localhost:8000` | FastAPI High-Performance REST Service |
| **Interactive API Docs** | `http://localhost:8000/docs` | Swagger / OpenAPI Documentation |
| **Alternative Docs** | `http://localhost:8000/redoc` | ReDoc API Documentation |
| **Admin Portal** | `http://localhost:3000/admin` | Ingestion & Editorial Dashboard |

---

## 🔑 Authentication & Environment Setup

1. **Local Credentials:** Initial administrative and editorial accounts are seeded automatically upon startup. For development login credentials, refer to your local `CREDENTIALS.md` file (kept private and excluded from Git).
2. **Google Gemini API Key (Optional):**
   - Add your API key to [`apps/api/.env`](./apps/api/.env):
     ```env
     GEMINI_API_KEY=AIzaSyYourKeyHere
     ```
   - If omitted, the platform operates seamlessly using its internal deterministic fallback synthesizer.

---

## 🏗️ Architecture & Tech Stack

```
Frontend:     Next.js 16 (Turbopack, App Router, React 19) + Tailwind CSS v4 + Lucide Icons + Leaflet
Backend:      FastAPI (Python 3.10+) + Uvicorn + Pydantic v2 + SQLAlchemy ORM
AI / RAG:     Google Gemini 2.0 Flash + text-embedding-004 + Deterministic Fallback Synthesizer
Cartography:  Esri World Canvas / Satellite / Topo Map Services
Database:     SQLite (Zero-config local) / PostgreSQL + pgvector (Production deployment)
Processing:   PyMuPDF (PDF Extraction) + BeautifulSoup4 + httpx (Async Crawler)
```

---

## 🏛️ Institutional Ownership

Maintained for the **National Centre for Polar and Ocean Research (NCPOR)**, an autonomous research institute under the **Ministry of Earth Sciences (MoES)**, Government of India.
