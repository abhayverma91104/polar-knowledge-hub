# Smart India Hackathon 2026 — Problem Statement 26063 Compliance

> **Problem Statement ID:** 26063  
> **Title:** Integrated Polar Science Outreach, Knowledge Repository and Media Dissemination Portal  
> **Ministry / Department:** Ministry of Earth Sciences (MoES)  
> **Organization:** National Centre for Polar and Ocean Research (NCPOR), Goa  
> **Theme:** Smart Education · **Category:** Software  

---

## 1. Problem Statement Background & Objectives

The National Centre for Polar and Ocean Research (NCPOR) has conducted groundbreaking scientific research in Antarctica, the Arctic, the Southern Ocean, and the Himalayas for over four decades. However, valuable scientific data, expedition records, publications, and multimedia assets remain distributed across isolated reports and technical repositories, limiting public outreach, academic discovery, and educational impact.

**Core Mandates Defined by MoES / NCPOR:**
1. Create a centralized, searchable repository of all Indian polar science publications, datasets, and expedition dossiers.
2. Develop interactive educational tools for school/college students to understand polar science, glaciology, and climate change.
3. Build an automated content transformation studio to turn complex scientific papers into public outreach formats (social posts, articles, quizzes).
4. Implement an AI-powered conversational research assistant grounded in verified NCPOR documents.
5. Provide continuous ingestion capabilities to crawl and index official NCPOR resources.

---

## 2. Requirement-to-Solution Verification Matrix

| SIH 26063 Requirement | Implemented Solution in Polar Knowledge Hub | Route / Module |
| :--- | :--- | :--- |
| **Centralized Knowledge Repository** | Multi-attribute search engine with keyword and semantic dense vector filtering across documents, reports, and datasets. | [`/repository`](http://localhost:3000/repository) |
| **Grounded Conversational AI** | RAG engine using Google Gemini 2.0 Flash + vector similarity, citing verified NCPOR documents with page numbers. | [`/assistant`](http://localhost:3000/assistant) |
| **Automated Outreach Generator** | Content Studio converting dense reports into 6 formats: press releases, student analogies, LinkedIn posts, tweets, articles, and quizzes. | [`/content-studio`](http://localhost:3000/content-studio) |
| **Interactive Polar Cartography** | Dark-mode Leaflet map plotting Maitri, Bharati, Himadri, IndARC, and Himansh with live status and coordinates. | [`/explore`](http://localhost:3000/explore) |
| **Interactive Polar Education** | Polar Classroom with structured lessons on ice sheets, climate change, and oceanography, plus real-time scored quizzes. | [`/classroom`](http://localhost:3000/classroom) |
| **Expedition Dossiers & History** | Dedicated timeline of all 44 Indian Antarctic Expeditions and Arctic missions with chief scientists, objectives, and team sizes. | [`/expeditions`](http://localhost:3000/expeditions) |
| **Polar Media & Archives** | Filterable high-resolution photo and documentary gallery for auroras, research vessels, ice coring, and wildlife. | [`/media`](http://localhost:3000/media) |
| **Automated Web Crawler** | `crawler.py` with robots.txt compliance, rate-limiting, and SHA-256 deduplication targeting `ncpor.res.in`. | [`/admin/ingestion`](http://localhost:3000/admin/ingestion) |
| **Human-in-the-Loop Moderation** | Admin editorial queue allowing scientific officers to inspect, approve, or reject crawled resources before public release. | [`/admin/review`](http://localhost:3000/admin/review) |

---

## 3. Innovation Highlights for Jury Evaluation

1. **Dual-Mode AI Resilience:** If an external LLM key is absent or quota is exceeded, the platform seamlessly falls back to an internal BM25 keyword frequency ranker, ensuring 100% demo uptime with zero crashes.
2. **Zero-Gradient Editorial Design:** Unlike generic templates, the user interface follows an authoritative dark-navy polar aesthetic tailored specifically for a government scientific institute.
3. **Transparent Proxy Architecture:** Next.js automatically rewrites API calls to FastAPI, eliminating CORS errors and enabling straightforward multi-container deployments.
4. **Authentic NCPOR Data Seeding:** The platform comes pre-seeded with authentic historical records from the 1st IAE (1981) to the 44th IAE (2024), real station coordinates, and genuine scientific abstracts.
