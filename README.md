# 🧊 PolarSetu (ध्रुवसेतु)

> **Integrated Polar Science Outreach, Sovereign Knowledge Repository, and Media Dissemination Portal**  
> **Smart India Hackathon (SIH) 2026** · **Problem Statement ID: 26063**  
> **Ministry:** Ministry of Earth Sciences (MoES), Government of India  
> **Nodal Institution:** National Centre for Polar and Ocean Research (NCPOR), Goa, India  
> **Mission Scope:** Antarctic Expeditions, Arctic Research, Southern Ocean Studies, and Himalayan Cryosphere  

[![SIH 2026](https://img.shields.io/badge/SIH_2026-Problem_26063-orange?style=flat-square)](https://sih.gov.in)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.115+-009688?logo=fastapi&style=flat-square)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js_16_(Turbopack)-black?logo=next.js&style=flat-square)](https://nextjs.org)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini_2.0_Flash-4285F4?logo=google&style=flat-square)](https://ai.google.dev)
[![Multilingual](https://img.shields.io/badge/Languages-EN%20%7C%20HI%20%7C%20BN%20%7C%20TA-blue?style=flat-square)](http://localhost:3000/content-studio)
[![Theme](https://img.shields.io/badge/Theme-Light%20%2F%20Dark%20(GIGW%203.0)-purple?style=flat-square)](http://localhost:3000)

---

# 🔐 ADMIN LOGIN CREDENTIALS

# 📧 Email: `admin@ncpor.res.in`
# 🔑 Password: `PolarHub@2026`
# 🚪 Login Page: [http://localhost:3000/login](http://localhost:3000/login)
# 🌐 Admin Dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

> [!IMPORTANT]
> **Log in at `/login` with the credentials above to unlock the Admin Ingestion, Web Crawler, and Outreach Studio review controls.**

---

## 🌟 Tagline
> **“Discover. Understand. Explore the Poles.”**

**PolarSetu** is an AI-powered scientific intelligence, public outreach, research discovery, and media dissemination portal. It centralizes institutional research from the **National Centre for Polar and Ocean Research (NCPOR)**, transforming over four decades of Indian polar expeditions across Antarctica, the Arctic, the Southern Ocean, and the Himalayan Cryosphere into an accessible, searchable, and interactive digital experience.

---

## 📚 Technical Documentation

Comprehensive architectural and operational guides are maintained in the [`docs/`](./docs) directory:

| Document | Focus & Coverage |
| :--- | :--- |
| 🏛️ [**System Architecture**](./docs/ARCHITECTURE.md) | Multi-tier architectural specifications, data models, RAG vector pipelines, and security governance. |
| 🔌 [**REST API Reference**](./docs/API_REFERENCE.md) | Complete OpenAPI/Swagger documentation, endpoint payloads, parameters, and response schemas. |
| 🚀 [**Deployment & Operations Guide**](./docs/DEPLOYMENT_GUIDE.md) | Step-by-step instructions for local execution, Docker Compose orchestration, and environment variables. |
| ☁️ [**Railway Deployment Guide**](./docs/RAILWAY_DEPLOYMENT_GUIDE.md) | Cloud provisioning with automatic PostgreSQL and continuous deployment. |
| 📋 [**SIH 26063 Compliance Matrix**](./docs/SIH_PROBLEM_STATEMENT.md) | Mapping of SIH Problem Statement 26063 requirements to implemented modules. |

---

## 🚀 Key Modules & Capabilities

### 1. 🔍 Scientific Knowledge Repository ([`/repository`](http://localhost:3000/repository))
* **Unified Discovery:** Cross-searches scientific publications, technical reports, expedition summaries, and open datasets.
* **Hybrid Search Engine:** Combines BM25 weighted keyword matching with dense vector embeddings (`text-embedding-004`) for high-precision retrieval.
* **Multi-Dimensional Filtering:** Filter research by:
  - **Scientific Disciplines:** Glaciology, Atmospheric Sciences, Oceanography, Biology, Cryosphere, Geology, Climate Change.
  - **Geographic Regions:** Antarctica, Arctic, Southern Ocean, Himalayas (Third Pole).
  - **Temporal Ranges:** 1981 to present.
* **Document Dossiers & Direct Download:** Full-text abstracts, author indexes, citation generation (BibTeX, APA), verified external DOI links, and **one-click direct document downloads** via `/api/documents/{id}/download`.

### 2. 🤖 Grounded Conversational Polar AI Assistant ([`/assistant`](http://localhost:3000/assistant))
* **Retrieval-Augmented Generation (RAG):** Powered by **Google Gemini 2.0 Flash**, synthesizing answers grounded strictly in indexed NCPOR records.
* **Verifiable Attribution:** Every generated statement includes bracketed citation tags (`[1]`, `[2]`) linked directly to source documents with author names, publication year, and snippet excerpts.
* **Dynamic Key Detection:** Zero-downtime hot-reload of `GEMINI_API_KEY` from environment files without requiring a server reboot.
* **Intelligent Offline Fallback:** Gracefully switches to an internal multi-word weighted synthesis engine if external LLM credentials are not configured or rate-limited.
* **Live Health Telemetry:** Exposed via `/api/assistant/status` showing active model, SDK type, and connectivity state.

### 3. ✨ Outreach Studio & Multilingual AI Translator ([`/content-studio`](http://localhost:3000/content-studio))
Transforms dense technical papers and expedition dossiers into **8 standardized outreach formats** with **native multilingual translation**:
* **Supported Outreach Formats:**
  1. **Scientific Summary:** 180–250 word executive briefing (Background, Key Findings, Strategic Implications) for policymakers and researchers.
  2. **Public Feature Article:** Engaging ~500-word feature article with thematic subheadings for science magazines and digital media.
  3. **Student Explanation:** Accessible Grade 8–10 educational explainer utilizing vivid real-world analogies (ice sheets as mirrors, ocean currents as conveyor belts) and 'Did You Know?' polar facts.
  4. **LinkedIn Post:** Executive social post with key scientific takeaways, international collaboration highlights, and strategic hashtags.
  5. **X / Twitter Thread:** 4-part numbered thread strictly formatted under 270 characters per tweet.
  6. **Instagram Caption:** Visual storytelling caption capturing extreme polar field conditions with polar emojis and hashtag bank.
  7. **YouTube Metadata Package:** SEO-optimized title (<68 chars), description with chapter timestamp placeholders, and 15 targeted search tags.
  8. **Classroom Quizzes:** 5-question multiple-choice assessment with 4 options, answer keys, and detailed scientific rationales.
* **Multilingual Translation Engine:** Real-time synthesis and translation across **English**, **Hindi (हिंदी)**, **Bengali (বাংলা)**, and **Tamil (தமிழ்)** scripts.
* **Human-in-the-Loop Governance:** Integrated review workflow allowing officers to **Approve & Save to Database**, **Reject & Flag**, or **One-Click Copy** to clipboard with clear review notices.


### 4. 📡 Live Polar Station Telemetry & Synoptic Dynamics ([Landing Page](http://localhost:3000) & [`/explore`](http://localhost:3000/explore))
* **Near-Real-Time Atmospheric & Cryospheric Feeds:** Simulated scientific telemetry streams updated on a 30-second live cycle across India's permanent polar bases:
  - **Maitri Station (Antarctica):** $-18.4^\circ\text{C}$ surface temp, $24\text{ km/h ENE}$ wind vector, $312\text{ W/m}^2$ solar radiation, $984.2\text{ hPa}$ barometer, *23 Wintering Personnel*, *Lake Priyadarshini Monitoring*.
  - **Bharati Station (Antarctica):** $-12.1^\circ\text{C}$ surface temp, $38\text{ km/h SE}$ katabatic gust, $418\text{ W/m}^2$ solar radiation, $991.5\text{ hPa}$ barometer, *Polarimetric Radar*, *250 Mbps High-Speed SatCom*.
  - **Himadri Station (Arctic, Svalbard):** $-4.8^\circ\text{C}$ surface temp, $16\text{ km/h NNW}$ wind, $0.082\,\tau$ Aerosol Optical Depth, $34.8\text{ PSU}$ fjord salinity, *Kongsfjorden Lab*, *IndARC Mooring Linked*.
  - **Himansh Observatory (Himalayas, 4,080m):** $-9.6^\circ\text{C}$ altitude temp, $12\text{ km/h W}$ wind, $420\text{ mm}$ Snow Water Equivalent (SWE), $-1.24\text{ m/a}$ Glacier Drift rate, *Bara Shigri Cryosphere*, *Datalogger VHF*.
* **Three Dedicated Analytical View Modes:**
  1. **Matrix:** 4-observatory sensor grid paired with an interactive comparative telemetry data table.
  2. **24h Thermal Gradient:** Multi-station diurnal temperature analysis with freeze references, min/max statistics, and micro-climate insights.
  3. **Katabatic Curves:** High-velocity down-slope gravity wind tracking and gust dynamics ($km/h$).
* **Geospatial Map Synchronization:** Clicking any station in the telemetry dashboard flies the interactive Leaflet map to the station's exact coordinates and opens its inspector.

### 5. 🗺️ Interactive Geospatial Console & Polar Map ([`/explore`](http://localhost:3000/explore) & [`/stations`](http://localhost:3000/stations))
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

### 6. 🎓 Polar Classroom & Educational Hub ([`/classroom`](http://localhost:3000/classroom))
* **Curriculum Modules:** Structured educational lessons covering:
  - *Polar Ice Sheets & Climate Teleconnections*
  - *Glacier Mass Balance & Cryospheric Change*
  - *Southern Ocean Circulation & Deep Water Formation*
  - *Atmospheric Ozone Layer Dynamics*
  - *History of Indian Polar Exploration*
* **Interactive Assessment:** Module knowledge check quizzes with immediate answer evaluation and explanations.
* **AI Concept Explainer:** Integrated endpoint (`POST /api/classroom/topics/{slug}/explain`) allowing learners to ask Polar AI to clarify complex polar concepts in simple language.

### 7. 📸 Polar Media Archives ([`/media`](http://localhost:3000/media))
* Curated photographic records of polar expeditions, auroral observations, wildlife populations (penguins, seals), ice core drilling operations, and polar research vessels (*ORV Sagar Kanya*, *Sagar Nidhi*).
* High-resolution lightbox modal with metadata, location tags, and related research links.

### 8. 🚢 Expeditions Timeline & Dossiers ([`/expeditions`](http://localhost:3000/expeditions))
* Chronological breakdown of Indian Scientific Expeditions to Antarctica (ISEA 1st to 44th), Arctic summer and winter expeditions, and Southern Ocean expeditions.
* Detailed expedition briefs covering objectives, voyage logs, team rosters, and participating national laboratories.

### 9. ⚙️ Web Ingestion & Editorial Governance ([`/admin`](http://localhost:3000/admin))
* **Ingestion & Web Crawler ([`/admin/ingestion`](http://localhost:3000/admin/ingestion)):** Background crawler designed for institutional domains (`ncpor.res.in`, `ncaor.gov.in`) with robots.txt compliance, polite rate limiting, SHA-256 deduplication, and direct drag-and-drop document & dataset file ingestion.
* **Progress Telemetry:** High-contrast, real-time scanning logs with error recovery and job tracking.
* **Editorial Review Queue ([`/admin/review`](http://localhost:3000/admin/review)):** Human-in-the-loop review portal allowing curators to inspect, edit metadata, approve, or reject crawled resources before public ingestion.

### 10. 🏛️ NCPOR Institutional Heritage & History ([`/about`](http://localhost:3000/about))
* **Historical Exploration Timeline:** Interactive chronology mapping India's polar milestones from the 1st Indian Antarctic Expedition (1981) led by Dr. S.Z. Qasim, Dakshin Gangotri (1983), Maitri (1989), NCPOR founding (1998), Himadri (2008), Bharati (2012), IndARC (2014), Himansh (2016), up to the 44th ISEA (2024).
* **Research Divisions Directory:** In-depth breakdown of institutional programs across Antarctic Logistics, Arctic Research, Southern Ocean Biogeochemistry, Cryosphere & Glaciology, and Seabed Mapping.

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
| Service / Page | URL | Description |
| :--- | :--- | :--- |
| **Frontend Portal** | `http://localhost:3000` | Landing Page with Live Polar Station Telemetry |
| **Login Portal** | `http://localhost:3000/login` | Authentication for Admin, Editor & Researcher accounts |
| **Admin Dashboard** | `http://localhost:3000/admin` | Ingestion, AI Telemetry & Administrative Overview |
| **Crawler & Ingestion** | `http://localhost:3000/admin/ingestion` | Web Crawler Manager & File Drag-and-Drop Ingestion |
| **Editorial Review Queue** | `http://localhost:3000/admin/review` | Human-in-the-Loop Content & Resource Verification |
| **Outreach Studio** | `http://localhost:3000/content-studio` | AI Multi-Format Dissemination & Translation Engine |
| **Conversational AI** | `http://localhost:3000/assistant` | Grounded RAG Assistant with Source Citations |
| **Knowledge Repository** | `http://localhost:3000/repository` | Scientific Papers, Reports & Dataset Browser |
| **Geospatial & Telemetry** | `http://localhost:3000/explore` | Interactive Polar Map & Station Observatories |
| **Polar Classroom** | `http://localhost:3000/classroom` | Curriculum Modules, Concept Explainer & Quizzes |
| **Expeditions Timeline** | `http://localhost:3000/expeditions` | 44+ ISEA, Arctic & Southern Ocean Expeditions |
| **Media Archives** | `http://localhost:3000/media` | Curated Polar Photography & Lightbox Viewer |
| **About NCPOR** | `http://localhost:3000/about` | History, Timeline, Mandate & Research Divisions |
| **Backend REST API** | `http://localhost:8000` | FastAPI High-Performance Backend Service |
| **Interactive API Docs** | `http://localhost:8000/docs` | Swagger / OpenAPI Documentation & Sandbox |
| **Alternative Docs** | `http://localhost:8000/redoc` | ReDoc API Reference |

<details>
<summary><b>🛠️ Alternative: Manual Run (Separate Terminals)</b></summary>

If you prefer launching the backend and frontend separately:

**Terminal 1 — Backend (FastAPI):**
```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python seed_database.py
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend (Next.js):**
```bash
cd apps/web
npm install
npm run dev
```
</details>

### 🚀 Cloud Deployment (Railway)
To deploy the platform to the cloud with automatic PostgreSQL provisioning and continuous deployment, follow our step-by-step [Railway Deployment Guide](docs/RAILWAY_DEPLOYMENT_GUIDE.md).

---

## 🔑 Authentication & Environment Setup

1. **Demo & Administrative Accounts:**
   | Role | Email | Password | Access Level |
   | :--- | :--- | :--- | :--- |
   | **👑 Admin** | `admin@ncpor.res.in` | `PolarHub@2026` | Full Ingestion, Web Scraping, User Management |
   | **✍️ Editor** | `editor@ncpor.res.in` | `PolarHub@2026` | Content Studio, Dissemination Review |
   | **🔬 Researcher** | `researcher@ncpor.res.in` | `PolarHub@2026` | Document Upload, Query Analytics |

2. **Google Gemini API Key (Optional):**
   - Add your API key to [`apps/api/.env`](./apps/api/.env):
     ```env
     GEMINI_API_KEY=AIzaSyYourKeyHere
     ```
   - If omitted, the platform operates seamlessly using its internal deterministic fallback synthesizer.

3. **Frontend API URL Configuration (Optional):**
   - Stored in `apps/web/.env.local`:
     ```env
     NEXT_PUBLIC_API_URL=http://localhost:8000
     ```

---

## 🏗️ Architecture & Tech Stack

```
Frontend:     Next.js 16 (Turbopack, App Router, React 19) + Tailwind CSS v4 + Recharts + Lucide Icons + Leaflet
Backend:      FastAPI (Python 3.10+) + Uvicorn + Pydantic v2 + SQLAlchemy ORM
AI / RAG:     Google Gemini (gemini-flash-lite-latest + gemini-embedding-001) + RAG Citations
Cartography:  Esri World Canvas / Satellite / Topo Map Services
Database:     SQLite (Zero-config local) / PostgreSQL + pgvector (Production deployment)
Processing:   PyMuPDF (PDF Extraction) + BeautifulSoup4 + httpx (Async Crawler)
```

---

## 🏛️ Institutional Ownership

Maintained for the **National Centre for Polar and Ocean Research (NCPOR)**, an autonomous research institute under the **Ministry of Earth Sciences (MoES)**, Government of India.
