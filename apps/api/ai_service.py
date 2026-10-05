"""
AI service using Google Gemini - embeddings + grounded RAG + metadata extraction + outreach generation
Supports modern google-genai and legacy google-generativeai with dynamic API key detection and zero-config demo fallback.
"""
import os
import re
import json
import time
import logging
from typing import Optional, Any
from pathlib import Path

from config import get_settings, reload_settings

logger = logging.getLogger(__name__)

# SDK Availability detection
try:
    from google import genai as google_genai
    from google.genai import types as genai_types
    GEMINI_MODERN_AVAILABLE = True
except ImportError:
    google_genai = None
    genai_types = None
    GEMINI_MODERN_AVAILABLE = False

if not GEMINI_MODERN_AVAILABLE:
    try:
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            import google.generativeai as genai_legacy
        GEMINI_LEGACY_AVAILABLE = True
    except ImportError:
        genai_legacy = None
        GEMINI_LEGACY_AVAILABLE = False
else:
    genai_legacy = None
    GEMINI_LEGACY_AVAILABLE = False


class _ModelProxy:
    """Compatibility proxy for code accessing ai_service.model.model_name"""
    def __init__(self, name: str):
        self.model_name = name

    def __str__(self):
        return self.model_name


class AIService:
    def __init__(self):
        self.candidate_models = [
            "gemini-flash-lite-latest",
            "gemini-3.5-flash-lite",
            "gemini-flash-latest",
            "gemini-3.8-flash",
        ]
        self.model_name = self.candidate_models[0]
        self.candidate_embed_models = [
            "text-embedding-004",
            "gemini-embedding-001",
            "gemini-embedding-2",
        ]
        self.embed_model = self.candidate_embed_models[0]
        self.client = None
        self.legacy_model = None
        self.sdk_type = "none"
        self.use_real = False
        self._last_key_checked: Optional[str] = None
        
        # Initial check
        self._ensure_client()

    @property
    def model(self) -> _ModelProxy:
        return _ModelProxy(self.model_name if self.use_real else "demo")

    def _get_active_api_key(self) -> Optional[str]:
        """Dynamically detect API key from Settings, os.environ, or .env files"""
        # 1. Check current cached settings
        settings = get_settings()
        if settings.gemini_api_key and settings.gemini_api_key.strip():
            return settings.gemini_api_key.strip()
        
        # 2. Check os.environ
        env_key = os.environ.get("GEMINI_API_KEY", "").strip()
        if env_key:
            return env_key
            
        # 3. Check if .env file on disk has GEMINI_API_KEY (hot reload without restart)
        base_dir = Path(__file__).resolve().parent
        for candidate in [base_dir / ".env", Path(".env"), base_dir.parent.parent / ".env"]:
            if candidate.exists():
                try:
                    with open(candidate, "r", encoding="utf-8") as f:
                        for line in f:
                            clean = line.strip()
                            if clean.startswith("GEMINI_API_KEY="):
                                val = clean.split("=", 1)[1].strip().strip('"').strip("'")
                                if val:
                                    reload_settings()
                                    return val
                                else:
                                    # Explicitly empty
                                    reload_settings()
                                    return None
                except Exception:
                    pass
        return None

    def _ensure_client(self) -> bool:
        """Ensure client is initialized if API key is present"""
        settings = get_settings()
        if settings.demo_mode:
            self.use_real = False
            self.client = None
            self.legacy_model = None
            self.sdk_type = "none"
            self._last_key_checked = None
            return False

        key = self._get_active_api_key()
        if not key:
            self.use_real = False
            self.client = None
            self.legacy_model = None
            self.sdk_type = "none"
            self._last_key_checked = None
            return False

        # If already configured with same key, return True
        if self.use_real and key == self._last_key_checked and (self.client or self.legacy_model):
            return True

        self._last_key_checked = key

        # 1. Try modern google-genai
        if GEMINI_MODERN_AVAILABLE and google_genai:
            try:
                self.client = google_genai.Client(api_key=key)
                self.sdk_type = "google-genai"
                self.use_real = True
                logger.info("✓ Google Gemini (google-genai) client initialized with gemini-2.0-flash")
                return True
            except Exception as e:
                logger.warning(f"Failed to init google-genai client: {e}")

        # 2. Try legacy google-generativeai
        if GEMINI_LEGACY_AVAILABLE and genai_legacy:
            try:
                genai_legacy.configure(api_key=key)
                self.legacy_model = genai_legacy.GenerativeModel(self.model_name)
                self.sdk_type = "google-generativeai"
                self.use_real = True
                logger.info("✓ Google Gemini (google-generativeai legacy) client initialized")
                return True
            except Exception as e:
                logger.warning(f"Failed to init legacy genai model: {e}")

        self.use_real = False
        return False

    def get_status(self) -> dict:
        """Return operational status of Gemini AI service"""
        has_key = bool(self._get_active_api_key())
        is_ready = self._ensure_client()
        active = is_ready and has_key
        return {
            "ai_active": active,
            "has_key": has_key,
            "status": "connected" if active else "demo_mode",
            "sdk_type": self.sdk_type,
            "model": self.model_name if active else "demo",
            "embed_model": self.embed_model if active else "mock-sha256",
            "provider": "Google Gemini" if active else "Demo Synthesizer",
        }

    # ─────────────────────────────────────────────────────
    # Embeddings
    # ─────────────────────────────────────────────────────

    def get_embedding(self, text: str) -> list[float]:
        """Generate embedding vector for document chunk"""
        clean_text = (text or "").strip()[:3000]
        if not clean_text:
            return self._mock_embedding("empty")

        if self._ensure_client():
            # 1. Modern SDK
            if self.sdk_type == "google-genai" and self.client:
                for em in self.candidate_embed_models:
                    try:
                        res = self.client.models.embed_content(
                            model=em,
                            contents=clean_text,
                        )
                        if hasattr(res, "embeddings") and res.embeddings:
                            self.embed_model = em
                            vec = list(res.embeddings[0].values)
                            if len(vec) > 768:
                                vec = vec[:768]
                            elif len(vec) < 768:
                                vec = vec + [0.0] * (768 - len(vec))
                            return vec
                    except Exception as e:
                        logger.warning(f"google-genai embed with {em} error: {e}")

            # 2. Legacy SDK
            if self.sdk_type == "google-generativeai" and genai_legacy:
                for em in self.candidate_embed_models:
                    try:
                        res = genai_legacy.embed_content(
                            model=f"models/{em}",
                            content=clean_text,
                        )
                        if "embedding" in res:
                            self.embed_model = em
                            vec = list(res["embedding"])
                            if len(vec) > 768:
                                vec = vec[:768]
                            elif len(vec) < 768:
                                vec = vec + [0.0] * (768 - len(vec))
                            return vec
                    except Exception as e:
                        logger.warning(f"legacy genai embed with {em} error: {e}")

        return self._mock_embedding(clean_text)

    def get_query_embedding(self, text: str) -> list[float]:
        """Generate embedding vector for user search query"""
        return self.get_embedding(text)

    def _mock_embedding(self, text: str) -> list[float]:
        """Deterministic 768-dim float vector for zero-config fallback"""
        import hashlib
        h = hashlib.sha256(text.encode("utf-8", errors="ignore")).digest()
        floats = []
        for i in range(768):
            b = h[i % len(h)]
            floats.append(round((b / 255.0) * 2 - 1, 4))
        return floats

    # ─────────────────────────────────────────────────────
    # Grounded RAG Q&A
    # ─────────────────────────────────────────────────────

    def answer_with_rag(
        self,
        question: str,
        context_chunks: list[dict],
        conversation_history: Optional[list] = None,
    ) -> dict:
        """Generate grounded scientific answer with citations based on NCPOR context"""
        has_real_ai = self._ensure_client()

        # Build context prompt
        context_parts = []
        for i, chunk in enumerate(context_chunks[:8], 1):
            title = chunk.get("document_title", "NCPOR Document")
            page = chunk.get("page_number", "N/A")
            url = chunk.get("source_url", "")
            year = chunk.get("year", "")
            header = f"[{i}] {title}"
            if year:
                header += f" ({year})"
            if page and page != "N/A":
                header += f" - Page {page}"
            if url:
                header += f" <{url}>"
            
            snippet = chunk.get("chunk_text", "").strip()[:900]
            context_parts.append(f"{header}\n{snippet}")

        context_str = "\n\n---\n\n".join(context_parts) if context_parts else "No specific document context retrieved."

        system_instruction = (
            "You are Polar AI, the specialized scientific intelligence assistant for NCPOR "
            "(National Centre for Polar and Ocean Research), Ministry of Earth Sciences, Government of India.\n\n"
            "YOUR PURPOSE:\n"
            "Help researchers, educators, students, and citizens understand India's polar expeditions "
            "(Antarctica, Arctic, Southern Ocean, Himalayas), research stations (Bharati, Maitri, Himadri, IndARC, Himansh), "
            "and scientific discoveries (glaciology, oceanography, climate science, meteorology, biology).\n\n"
            "STRICT GROUNDING & CITATION RULES:\n"
            "1. Ground your answer thoroughly in the provided NCPOR context.\n"
            "2. Cite your sources using bracketed numbers [1], [2] corresponding to the provided context chunks.\n"
            "3. If the context contains sufficient facts, synthesize a detailed, structured, and informative answer.\n"
            "4. If the context does not fully cover the query, state what is verified by NCPOR records and politely note what remains open for further observation.\n"
            "5. Use clear, engaging scientific Markdown with headings, bullet points, and bold terms where helpful."
        )

        user_prompt = f"""CONTEXT FROM NCPOR KNOWLEDGE REPOSITORY:
{context_str}

USER QUESTION:
{question}

Provide a comprehensive, authoritative, and well-cited response."""

        answer = ""
        model_used = self.model_name if has_real_ai else "demo"

        if has_real_ai:
            # Try modern google-genai
            if self.sdk_type == "google-genai" and self.client:
                for try_model in self.candidate_models:
                    try:
                        config = None
                        if genai_types:
                            config = genai_types.GenerateContentConfig(
                                system_instruction=system_instruction,
                                temperature=0.25,
                            )
                        
                        resp = self.client.models.generate_content(
                            model=try_model,
                            contents=user_prompt,
                            config=config,
                        )
                        if resp and resp.text:
                            answer = resp.text.strip()
                            model_used = try_model
                            self.model_name = try_model
                            break
                    except Exception as e:
                        logger.warning(f"Gemini {try_model} generation error: {e}")

            # Try legacy SDK if modern didn't succeed
            if not answer and self.sdk_type == "google-generativeai":
                for try_model in self.candidate_models:
                    try:
                        model = genai_legacy.GenerativeModel(
                            try_model,
                            system_instruction=system_instruction,
                        )
                        resp = model.generate_content(user_prompt)
                        if resp and resp.text:
                            answer = resp.text.strip()
                            model_used = try_model
                            self.model_name = try_model
                            break
                    except Exception as e:
                        logger.warning(f"Legacy Gemini {try_model} error: {e}")

        # Fallback to intelligent demo synthesis if real AI is unavailable or failed
        if not answer:
            answer = self._demo_rag_answer(question, context_chunks)
            model_used = "demo"

        # Format sources for UI
        sources = []
        for i, chunk in enumerate(context_chunks[:8], 1):
            sources.append({
                "index": i,
                "document_id": chunk.get("document_id"),
                "document_title": chunk.get("document_title", "NCPOR Publication"),
                "page_number": chunk.get("page_number"),
                "source_url": chunk.get("source_url"),
                "year": chunk.get("year"),
                "chunk_text": chunk.get("chunk_text", "")[:220] + "...",
            })

        return {
            "answer": answer,
            "sources": sources,
            "model": model_used,
            "status": "ai_generated" if model_used != "demo" else "demo_mode",
        }

    def _demo_rag_answer(self, question: str, chunks: list[dict]) -> str:
        """Intelligent structured demo response when API key is not configured"""
        doc_titles = [c.get("document_title", "NCPOR Research") for c in chunks[:3]]
        titles_cited = ", ".join([f'"{t}" [{i+1}]' for i, t in enumerate(doc_titles)]) if doc_titles else "NCPOR Scientific Records [1]"
        
        return f"""### NCPOR Scientific Findings on: {question}

Based on records in the National Centre for Polar and Ocean Research (NCPOR) Knowledge Repository, including {titles_cited}:

#### 1. Core Polar Operations & Research Context
India conducts systematic multidisciplinary scientific expeditions under the Ministry of Earth Sciences (MoES) [1]. Research activities are concentrated across:
- **Antarctica:** Long-term observations at **Bharati** (Larsemann Hills) and **Maitri** (Schirmacher Oasis), investigating atmospheric chemistry, ice sheet mass balance, and subglacial lake dynamics [1][2].
- **Arctic:** Continuous environmental monitoring at **Himadri** (Ny-Ålesund, Svalbard) and the underwater moored observatory **IndARC** in the Kongsfjorden [2].
- **Himalayas (Cryosphere):** Glacier dynamics and hydrometeorology centered at the **Himansh** high-altitude research station in Spiti Valley [1][3].
- **Southern Ocean:** Biogeochemical fluxes and oceanographic transects between India and Antarctica [2].

#### 2. Key Insights Relevant to Your Inquiry
NCPOR expedition reports and peer-reviewed datasets confirm rigorous environmental monitoring, sediment core sampling, and satellite remote sensing calibration across both polar regimes [1][2].

*(Note: Add your Google Gemini API key to `apps/api/.env` to unlock live, generative multi-document reasoning.)*"""

    # ─────────────────────────────────────────────────────
    # Document Metadata Extraction
    # ─────────────────────────────────────────────────────

    def extract_document_metadata(self, text: str, filename: str = "") -> dict:
        """Extract structured scientific metadata (JSON) from document text"""
        has_real_ai = self._ensure_client()
        sample_text = (text or "").strip()[:4000]

        prompt = f"""You are a scientific librarian for NCPOR. Extract structured metadata from this polar science document.
Document filename/hint: {filename}

DOCUMENT TEXT:
{sample_text}

Return a valid JSON object with EXACTLY these keys:
{{
  "title": "Clean, informative document title",
  "authors": ["Author 1", "Author 2"],
  "year": 2024,
  "region": "antarctica" | "arctic" | "himalayas" | "southern_ocean" | "other",
  "expedition": "Specific Indian expedition name if mentioned, or null",
  "research_domains": ["Climate Science", "Glaciology", "Oceanography", "Atmospheric Science", "Biology", "Geology", "Environmental Science"],
  "keywords": ["5 to 10 specific scientific keywords"],
  "abstract": "Comprehensive 100-200 word summary of findings, methodology, and significance",
  "document_type": "expedition_report" | "research_paper" | "publication" | "technical_report" | "policy_document" | "educational" | "other",
  "station": "Bharati" | "Maitri" | "Himadri" | "IndARC" | "Himansh" | null,
  "language": "en"
}}

Respond ONLY with the JSON object. No explanation."""

        if has_real_ai:
            raw_json = ""
            if self.sdk_type == "google-genai" and self.client:
                for try_model in self.candidate_models:
                    try:
                        config = None
                        if genai_types:
                            config = genai_types.GenerateContentConfig(
                                temperature=0.1,
                                response_mime_type="application/json",
                            )
                        resp = self.client.models.generate_content(
                            model=try_model,
                            contents=prompt,
                            config=config,
                        )
                        if resp and resp.text:
                            raw_json = resp.text.strip()
                            self.model_name = try_model
                            break
                    except Exception as e:
                        logger.warning(f"google-genai metadata extraction with {try_model} error: {e}")

            if not raw_json and self.sdk_type == "google-generativeai":
                for try_model in self.candidate_models:
                    try:
                        model = genai_legacy.GenerativeModel(try_model)
                        resp = model.generate_content(prompt)
                        if resp and resp.text:
                            raw_json = resp.text.strip()
                            self.model_name = try_model
                            break
                    except Exception as e:
                        logger.warning(f"legacy genai metadata extraction with {try_model} error: {e}")

            if raw_json:
                try:
                    clean = raw_json
                    if clean.startswith("```"):
                        clean = re.sub(r"^```(?:json)?\s*", "", clean)
                        clean = re.sub(r"\s*```$", "", clean)
                    parsed = json.loads(clean.strip())
                    if isinstance(parsed, dict) and "title" in parsed:
                        return parsed
                except Exception as e:
                    logger.error(f"JSON decode error in metadata extraction: {e}")

        return self._heuristic_metadata(filename, sample_text)

    def _heuristic_metadata(self, filename: str, text: str) -> dict:
        """Heuristic metadata extractor when AI is not configured"""
        title = filename.replace("_", " ").replace("-", " ").rsplit(".", 1)[0].title() if filename else "Polar Research Record"
        if not filename and text:
            first_line = text.split("\n", 1)[0].strip()
            if 10 < len(first_line) < 120:
                title = first_line

        # Detect region
        text_lower = text.lower()
        region = "other"
        if "antarct" in text_lower or "bharati" in text_lower or "maitri" in text_lower:
            region = "antarctica"
        elif "arctic" in text_lower or "svalbard" in text_lower or "himadri" in text_lower:
            region = "arctic"
        elif "himalay" in text_lower or "himansh" in text_lower or "spiti" in text_lower:
            region = "himalayas"
        elif "southern ocean" in text_lower:
            region = "southern_ocean"

        # Detect domains
        domains = []
        if any(w in text_lower for w in ["climate", "temperature", "greenhouse", "warming"]):
            domains.append("Climate Science")
        if any(w in text_lower for w in ["ice", "glacier", "snow", "shelf", "calving"]):
            domains.append("Glaciology")
        if any(w in text_lower for w in ["ocean", "current", "salinity", "sea", "marine"]):
            domains.append("Oceanography")
        if any(w in text_lower for w in ["atmosphere", "aerosol", "ozone", "wind", "radiation"]):
            domains.append("Atmospheric Science")
        if any(w in text_lower for w in ["bacteria", "flora", "fauna", "penguin", "moss", "lichen", "species"]):
            domains.append("Biology")
        if not domains:
            domains = ["Climate Science", "Environmental Science"]

        return {
            "title": title,
            "authors": ["NCPOR Scientific Expedition Team"],
            "year": 2024,
            "region": region,
            "expedition": "Indian Scientific Polar Expedition",
            "research_domains": domains,
            "keywords": ["NCPOR", "Polar Research", region.title(), "MoES", "India"],
            "abstract": (
                f"Scientific documentation and observations from NCPOR regarding {region.title()} polar studies. "
                "Covers field measurements, environmental sensors, and experimental data collected under Indian polar programs."
            ),
            "document_type": "expedition_report",
            "station": "Bharati" if region == "antarctica" else ("Himadri" if region == "arctic" else None),
            "language": "en",
        }

    # ─────────────────────────────────────────────────────
    # Outreach & Content Studio Generation
    # ─────────────────────────────────────────────────────

    def generate_content(
        self,
        content_type: str,
        source_text: str,
        source_title: str,
        context: dict = None,
        language: str = "english",
    ) -> str:
        """Generate high-impact scientific outreach content for various audiences"""
        has_real_ai = self._ensure_client()
        sample_text = (source_text or "").strip()[:4000]

        prompts = {
            "summary": f"""You are a senior scientific editor at NCPOR (Ministry of Earth Sciences, India).
Write a professional Scientific Executive Summary (180-250 words) of this polar research record.

Structure your summary into:
- **Background & Objective**: Why this study or expedition was conducted.
- **Key Scientific Findings**: Concrete data, measurements, or phenomena observed.
- **Strategic Implications**: What this means for global climate models, ocean circulation, or Indian polar science.

SOURCE TITLE: {source_title}
SOURCE MATERIAL:
{sample_text}

Tone: Authoritative, precise, third-person scientific prose.""",

            "article": f"""You are a science journalist writing for a national publication on Indian scientific breakthroughs.
Write an engaging, accessible feature article (~500 words) about this polar research achievement by NCPOR.

Guidelines:
- Create a compelling headline (H1) and clear thematic subheadings (H2).
- Highlight India's scientific leadership at research stations (Bharati, Maitri, Himadri, Himansh, or Southern Ocean).
- Explain technical concepts (albedo, thermohaline circulation, ice cores, or polar ecology) with clarity.
- Conclude with why this polar research directly matters to India's climate, monsoons, and the global environment.

SOURCE TITLE: {source_title}
SOURCE MATERIAL:
{sample_text}""",

            "student": f"""You are an enthusiastic polar science educator teaching students aged 13-16 (Grades 8-10).
Explain this polar research in simple, captivating language (220-280 words).

Guidelines:
- Use at least two vivid real-world analogies (e.g. comparing ice sheets to reflective mirrors, ocean currents to conveyor belts, or ice cores to time-travel diaries).
- Avoid heavy jargon; explain necessary terms immediately.
- Include a 'Did You Know?' fun fact about Indian polar stations.
- Inspiring and educational tone.

SOURCE TITLE: {source_title}
SOURCE MATERIAL:
{sample_text}""",

            "linkedin": f"""Write an impactful LinkedIn post for NCPOR / Ministry of Earth Sciences highlighting this scientific achievement.

Requirements:
- Strong hook in the first two lines highlighting Indian polar research excellence.
- 3 structured bullet points with key discoveries or operational milestones.
- Mention our dedicated scientists, logistics support, and international scientific cooperation.
- Strategic hashtags: #PolarResearch #NCPOR #MoES #Antarctica #Arctic #IndiaInScience #ClimateAction #IndianExpedition
- 150-220 words, professional executive tone.

SOURCE TITLE: {source_title}
SOURCE MATERIAL:
{sample_text}""",

            "twitter": f"""Write an engaging 4-part X / Twitter thread about this polar research finding.

Requirements:
- Tweet 1: Hook + big discovery announcement (with 🧵).
- Tweet 2: Key data/findings & how Indian scientists carried out the work.
- Tweet 3: Why it matters for climate change, oceans, or monsoons.
- Tweet 4: Summary takeaway + link to NCPOR knowledge base + hashtags (#PolarScience #NCPOR #India).
- Keep each tweet strictly under 270 characters. Number them 1/4, 2/4, 3/4, 4/4.

SOURCE TITLE: {source_title}
SOURCE MATERIAL:
{sample_text}""",

            "instagram": f"""Create an Instagram caption for NCPOR's public outreach post.

Requirements:
- Catchy opening line with polar emojis (❄️🧊🐧🚢).
- Storytelling caption (120-180 words) conveying the harsh polar conditions and the passion of Indian researchers.
- 'Swipe to see field data' call-to-action.
- 12-15 relevant hashtags separated by dots.

SOURCE TITLE: {source_title}
SOURCE MATERIAL:
{sample_text}""",

            "youtube": f"""Generate a complete YouTube video publishing metadata package for this polar research document:

Format:
**Title**: (Max 68 characters, compelling and SEO-optimized)
**Description**: (200-250 words explaining the expedition/research, includes chapter timestamp placeholders like 00:00 Intro, 01:45 The Journey, etc.)
**Tags**: (15 comma-separated targeted keywords for YouTube search)

SOURCE TITLE: {source_title}
SOURCE MATERIAL:
{sample_text}""",

            "quiz": f"""Create 5 multiple-choice quiz questions based on this polar science content for educational assessment.

Return ONLY a valid JSON array of 5 questions with this exact structure:
[
  {{
    "question": "Clear, specific question about the polar research?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_index": 0,
    "explanation": "Detailed explanation citing the evidence from the research."
  }}
]

SOURCE TITLE: {source_title}
SOURCE MATERIAL:
{sample_text}

Respond only with the JSON array, no extra text.""",

            "press_release": f"""Write an official Government of India / NCPOR Press Release.

Requirements:
- Headline in ALL CAPS
- Dateline: NEW DELHI / GOA — [Current Date]
- Executive opening summarizing the MoES scientific initiative
- Quotes placeholder from NCPOR Director or Chief Scientist
- Scientific background and societal impact
- About NCPOR boilerplate paragraph at the bottom

SOURCE TITLE: {source_title}
SOURCE MATERIAL:
{sample_text}""",
        }

        prompt = prompts.get(content_type, prompts["summary"])
        if language and language.lower() not in ["english", "en"]:
            lang_labels = {
                "hindi": "Hindi (हिंदी)",
                "bengali": "Bengali (বাংলা)",
                "tamil": "Tamil (தமிழ்)",
            }
            lang_str = lang_labels.get(language.lower(), language)
            prompt += f"\n\nCRITICAL MULTILINGUAL REQUIREMENT: Write the entire response strictly in {lang_str} script with fluent, high-level scientific and official prose appropriate for Government of India science communication."

        if has_real_ai:
            result_text = ""
            # Modern SDK
            if self.sdk_type == "google-genai" and self.client:
                for try_model in self.candidate_models:
                    try:
                        config = None
                        if content_type == "quiz" and genai_types:
                            config = genai_types.GenerateContentConfig(
                                temperature=0.2,
                                response_mime_type="application/json",
                            )
                        resp = self.client.models.generate_content(
                            model=try_model,
                            contents=prompt,
                            config=config,
                        )
                        if resp and resp.text:
                            result_text = resp.text.strip()
                            self.model_name = try_model
                            break
                    except Exception as e:
                        logger.warning(f"Content generation error with {try_model}: {e}")

            # Legacy SDK
            if not result_text and self.sdk_type == "google-generativeai":
                for try_model in self.candidate_models:
                    try:
                        model = genai_legacy.GenerativeModel(try_model)
                        resp = model.generate_content(prompt)
                        if resp and resp.text:
                            result_text = resp.text.strip()
                            self.model_name = try_model
                            break
                    except Exception as e:
                        logger.warning(f"Legacy content generation error with {try_model}: {e}")

            if result_text:
                return result_text

        # Demo fallback
        return self._demo_content(content_type, source_title, language=language)

    def _demo_content(self, content_type: str, source_title: str, language: str = "english") -> str:
        lang = (language or "english").lower()
        if lang == "hindi":
            hindi_demos = {
                "summary": (
                    f"### वैज्ञानिक कार्यकारी सारांश: {source_title}\n\n"
                    "**पृष्ठभूमि एवं उद्देश्य**: यह वैज्ञानिक अध्ययन राष्ट्रीय ध्रुवीय एवं महासागर अनुसंधान केंद्र (एनसीपीओआर), पृथ्वी विज्ञान मंत्रालय के अंतर्गत आयोजित किया गया है। इसका उद्देश्य ध्रुवीय हिमनद परिवर्तन, वायुमंडलीय अंतःक्रियाओं और महासागरीय परिसंचरण का गहन विश्लेषण करना है।\n\n"
                    "**प्रमुख वैज्ञानिक निष्कर्ष**: भारती एवं हिमाद्रि अनुसंधान केंद्रों पर जुटाए गए आंकड़ों से पुष्टि होती है कि ध्रुवीय बर्फ की स्थिति और समुद्री जल-प्रवाह में मौसमी बदलाव तेजी से हो रहे हैं।\n\n"
                    "**रणनीतिक महत्व**: यह शोध भारतीय मानसून के पूर्वानुमान मॉडल को अधिक सटीक बनाने और वैश्विक समुद्र स्तर वृद्धि के अनुमानों में महत्वपूर्ण योगदान देता है।"
                ),
                "article": (
                    f"# ध्रुवीय विज्ञान की नई सीमाएं: {source_title}\n\n"
                    "अंटार्कटिका की बर्फीली हवाओं से लेकर आर्कटिक के स्वालबार्ड तक, भारतीय वैज्ञानिक पृथ्वी के रहस्य सुलझा रहे हैं।\n\n"
                    "## अनुसंधान उत्कृष्टता\n"
                    "एनसीपीओआर के मैत्री, भारती और हिमाद्रि स्टेशनों ने ध्रुवीय विज्ञान में भारत का परचम लहराया है।\n\n"
                    "## भारतीय मानसून पर प्रभाव\n"
                    "ध्रुवों पर होने वाले परिवर्तन सीधे तौर पर भारतीय ग्रीष्मकालीन मानसून को प्रभावित करते हैं।"
                ),
                "student": (
                    f"### भारतीय वैज्ञानिक ध्रुवों का अध्ययन कैसे करते हैं? 🧊\n\n"
                    f"क्या आप जानते हैं कि वैज्ञानिक पृथ्वी के सबसे ठंडे स्थानों पर कैसे जीवित रहते हैं? **{source_title}** में भारतीय वैज्ञानिकों ने अंटार्कटिका में शोध किया!\n\n"
                    "ध्रुवीय बर्फ पृथ्वी के बड़े दर्पण की तरह काम करती है: यह सूरज की रोशनी को वापस अंतरिक्ष में परावर्तित करती है।\n\n"
                    "⭐ **क्या आप जानते हैं?** अंटार्कटिका में भारत का भारती स्टेशन 200 किमी/घंटा की तूफानी हवाओं को भी सहन कर सकता है!"
                ),
            }
            if content_type in hindi_demos:
                return hindi_demos[content_type]

        if lang == "bengali":
            bengali_demos = {
                "summary": (
                    f"### বৈজ্ঞানিক কার্যনির্বাহী সারসংক্ষেপ: {source_title}\n\n"
                    "**প্রেক্ষাপট ও উদ্দেশ্য**: ভারত সরকারের ভূ-বিজ্ঞান মন্ত্রকের অধীন জাতীয় মেরু ও মহাসাগর গবেষণা কেন্দ্র (এনসিপিওআর) দ্বারা এই বৈজ্ঞানিক নথি প্রস্তুত করা হয়েছে। মেরু অঞ্চলের বরফ গলন এবং জলবায়ু পরিবর্তনের সুনির্দিষ্ট প্রভাব বিশ্লেষণ করাই এর লক্ষ্য।\n\n"
                    "**প্রধান বৈজ্ঞানিক পর্যবেক্ষণ**: ভারতীয় গবেষণা কেন্দ্রসমূহ (ভারতী, মৈত্রী ও হিমাদ্রি) থেকে সংগৃহীত তথ্য প্রমাণ করে যে মহাসাগরীয় তাপ পরিবহন ও বায়ুমণ্ডলীয় পরিবর্তন ঘনিষ্ঠভাবে সম্পর্কিত।\n\n"
                    "**কৌশলগত তাৎপর্য**: এই তথ্য আন্তর্জাতিক জলবায়ু মডেল এবং ভারতীয় বর্ষার দীর্ঘমেয়াদী পূর্বাভাস উন্নত করতে সরাসরি অবদান রাখে।"
                ),
                "student": (
                    f"### কীভাবে ভারতীয় বিজ্ঞানীরা মেরু অঞ্চল গবেষণা করেন! 🧊\n\n"
                    f"তুমি কি জানো পৃথিবীর সবচেয়ে ঠান্ডা স্থানে কীভাবে গবেষণা হয়? **{source_title}** গবেষণায় ভারতীয় বিজ্ঞানীরা অ্যান্টার্কটিকা ও আর্কটিক সফর করেছেন!\n\n"
                    "মেরু বরফ হলো পৃথিবীর বিশাল ফ্রিজার এবং টাইমহোল! প্রতিটি বরফের স্তরে লুকিয়ে আছে প্রাচীন বায়ুমণ্ডলের ইতিহাস।\n\n"
                    "⭐ **তুমি কি জানতে?** অ্যান্টার্কটিকায় ভারতের ভারতী স্টেশন সম্পূর্ণ পরিবেশবান্ধব উপাদানে নির্মিত!"
                ),
            }
            if content_type in bengali_demos:
                return bengali_demos[content_type]

        if lang == "tamil":
            tamil_demos = {
                "summary": (
                    f"### முதன்மை அறிவியல் சுருக்கம்: {source_title}\n\n"
                    "**பின்னணி மற்றும் நோக்கம்**: இந்திய அரசின் புவி அறிவியல் அமைச்சகத்தின் கீழ் இயங்கும் தேசிய துருவ மற்றும் பெருங்கடல் ஆராய்ச்சி மையம் (என்சிபிஓஆர்) இந்த ஆய்வை மேற்கொண்டுள்ளது.\n\n"
                    "**முக்கிய அறிவியல் கண்டுபிடிப்புகள்**: பாரதி மற்றும் ஹிமாத்ரி நிலையங்களிலிருந்து பெறப்பட்ட தரவுகள், துருவ பனி அடுக்கு மாற்றங்கள் உலகளாவிய கடல் மட்ட உயர்வு மற்றும் இந்திய தென்மேற்கு பருவமழையுடன் கொண்டுள்ள நேரடி தொடர்பை வெளிப்படுத்துகின்றன.\n\n"
                    "**முக்கியத்துவம்**: இக்கண்டுபிடிப்புகள் இந்திய வானிலை முன்னறிவிப்பு மாதிரிகளை மேலும் துல்லியமாக்குகின்றன."
                ),
            }
            if content_type in tamil_demos:
                return tamil_demos[content_type]
        demos = {
            "summary": (
                f"### Executive Scientific Summary: {source_title}\n\n"
                "**Background & Objective**: This scientific record documents ongoing polar research conducted under the auspices "
                "of the National Centre for Polar and Ocean Research (NCPOR), Ministry of Earth Sciences, Government of India. "
                "The study aims to investigate cryospheric changes, atmospheric interactions, and oceanic circulation patterns.\n\n"
                "**Key Scientific Findings**: Systematic field observations and data collection confirm significant seasonal dynamics "
                "in polar ice sheet stability and marine ecosystem parameters. Measurements taken across Indian research stations "
                "provide essential baseline data for regional and global environmental assessments.\n\n"
                "**Strategic Implications**: These findings enhance predictive models for global sea-level rise and the Indian monsoon teleconnections, "
                "reinforcing India's commitment to high-latitude scientific stewardship under the Antarctic Treaty System."
            ),
            "article": (
                f"# Exploring the Frozen Frontiers: {source_title}\n\n"
                "From the biting winds of the Larsemann Hills in East Antarctica to the serene fjords of Svalbard in the Arctic, "
                "Indian scientists at the National Centre for Polar and Ocean Research (NCPOR) are deciphering the complex mechanisms "
                "governing our planet's climate.\n\n"
                "## A Legacy of Polar Excellence\n"
                "India's presence at Bharati and Maitri stations in Antarctica, along with the Himadri station in the Arctic, "
                "has transformed our understanding of polar teleconnections. Recent scientific expeditions have yielded high-resolution "
                "ice core records and atmospheric soundings that shed light on millennia of climatic history.\n\n"
                "## Global Impact on Monsoons and Oceans\n"
                "Polar phenomena are not isolated; changes in polar ice sheets directly modulate equatorial weather and the Indian monsoon. "
                "Through sustained observation and multidisciplinary research, NCPOR continues to place India at the forefront of polar science."
            ),
            "student": (
                f"### How Indian Scientists Study the Poles! 🧊\n\n"
                f"Have you ever wondered how scientists study Earth's coldest places? In **{source_title}**, Indian researchers "
                "from NCPOR traveled thousands of kilometers to Antarctica and the Arctic!\n\n"
                "Think of polar ice like Earth's giant refrigerator mirror: it bounces sunlight back into space, keeping the planet cool. "
                "When scientists drill deep ice cores, it is like opening a time capsule! Every layer of trapped air bubbles tells us what the atmosphere "
                "was like hundreds of thousands of years ago.\n\n"
                "⭐ **Did You Know?** India's Bharati station in Antarctica is built on stilts and made of recycled shipping containers designed "
                "to withstand wind speeds of up to 200 km/h!"
            ),
            "linkedin": (
                f"🧊 Advancing Global Cryospheric Science: Insights from {source_title}\n\n"
                "Proud to highlight groundbreaking polar research spearheaded by the National Centre for Polar and Ocean Research (NCPOR), "
                "Ministry of Earth Sciences, Government of India.\n\n"
                "Key Scientific Takeaways:\n"
                "• Continuous multi-season environmental monitoring at Indian research stations (Bharati, Maitri, Himadri).\n"
                "• High-precision data collection contributing to international IPCC climate projections.\n"
                "• Interdisciplinary collaboration bridging atmospheric science, glaciology, and marine biology.\n\n"
                "Kudos to our expedition members and scientific teams continuing India's proud legacy at both poles!\n\n"
                "#PolarResearch #NCPOR #MoES #Antarctica #Arctic #ClimateScience #IndiaInScience"
            ),
            "twitter": (
                f"🧵 1/4 India's polar scientists continue to break new ground! Here is what you need to know about {source_title[:40]}... 👇\n\n"
                f"2/4 ❄️ Working in extreme sub-zero conditions, researchers from NCPOR collected critical data tracking cryospheric change, oceanic currents, and atmospheric chemistry.\n\n"
                "3/4 🌊 Why does this matter? Polar ice melting directly drives sea-level changes and teleconnects with the Indian monsoon systems that feed millions.\n\n"
                "4/4 🇮🇳 Learn more about India's polar expeditions and explore our open scientific repository at NCPOR. #PolarScience #NCPOR #Antarctica"
            ),
            "instagram": (
                f"On the edge of the world: {source_title} ❄️🐧\n\n"
                "In temperatures dropping below -40°C and winds roaring across the ice sheet, Indian scientists at Bharati and Maitri "
                "stations brave the extreme elements every single day to uncover the secrets of Earth's climate.\n\n"
                "Swipe left to see field data and polar research in action! ➡️📸\n\n"
                ".\n.\n.\n"
                "#NCPOR #PolarResearch #Antarctica #Arctic #IndiaInAntarctica #BharatiStation #ScienceEverywhere #Glaciology"
            ),
            "youtube": (
                f"**Title**: Exploring India's Polar Research: {source_title[:45]} | NCPOR\n\n"
                "**Description**: Join Indian scientists as they explore the polar frontiers of Antarctica and the Arctic! "
                "In this video, we examine the scientific observations and groundbreaking discoveries made by NCPOR teams.\n\n"
                "Timestamps:\n"
                "00:00 - Introduction to the Expedition\n"
                "01:30 - Life at Bharati & Maitri Stations\n"
                "03:45 - Scientific Discoveries & Ice Cores\n"
                "06:15 - Climate Impact on India\n"
                "08:00 - Conclusion\n\n"
                "**Tags**: NCPOR, Indian Polar Research, Antarctica, Arctic, Bharati Station, Maitri Station, Glaciology, MoES, Indian Scientists, Climate Change"
            ),
            "quiz": (
                '[\n'
                '  {\n'
                '    "question": "What is the primary nodal agency for Indian polar and ocean research under MoES?",\n'
                '    "options": ["NCPOR (National Centre for Polar and Ocean Research)", "ISRO", "DRDO", "CSIR-NIO"],\n'
                '    "correct_index": 0,\n'
                '    "explanation": "NCPOR (formerly NCAOR), located in Goa, is the premier autonomous institution under the Ministry of Earth Sciences responsible for Indian polar expeditions."\n'
                '  },\n'
                '  {\n'
                '    "question": "Where is India\'s research station Bharati located?",\n'
                '    "options": ["Schirmacher Oasis", "Larsemann Hills, East Antarctica", "Ny-Ålesund, Svalbard", "Spiti Valley"],\n'
                '    "correct_index": 1,\n'
                '    "explanation": "Bharati, commissioned in 2012, is located in the Larsemann Hills of East Antarctica, while Maitri is in Schirmacher Oasis."\n'
                '  },\n'
                '  {\n'
                '    "question": "What is the name of India\'s permanent research base in the Arctic?",\n'
                '    "options": ["IndARC", "Himansh", "Himadri", "Dakshin Gangotri"],\n'
                '    "correct_index": 2,\n'
                '    "explanation": "Himadri was inaugurated in 2008 at Ny-Ålesund, Svalbard, Norway, serving as India\'s first Arctic research station."\n'
                '  }\n'
                ']'
            ),
            "press_release": (
                f"PRESS RELEASE: NCPOR ANNOUNCES KEY RESEARCH FINDINGS IN {source_title.upper()}\n\n"
                "NEW DELHI / GOA — National Centre for Polar and Ocean Research (NCPOR), an autonomous institute under the Ministry of Earth Sciences, "
                f"Government of India, has released new scientific insights regarding {source_title}.\n\n"
                "The findings, obtained through multidisciplinary field investigations across Indian polar stations, demonstrate significant scientific advances "
                "in monitoring high-latitude atmospheric-oceanic linkages.\n\n"
                "\"Our polar research programs reflect India's expanding role in global cryospheric stewardship,\" stated the scientific lead at NCPOR. "
                "\"These observations provide critical inputs for understanding global climatic shifts and sea-level variability.\"\n\n"
                "About NCPOR: The National Centre for Polar and Ocean Research is India's premier R&D institution for Antarctic, Arctic, Southern Ocean, "
                "and Himalayan cryospheric operations."
            ),
        }
        return demos.get(content_type, demos["summary"])

    # ─────────────────────────────────────────────────────
    # Classroom & Educational Topic Explainer
    # ─────────────────────────────────────────────────────

    def explain_concept(self, concept: str, audience_level: str = "high_school") -> str:
        """Explain a polar science concept for learners"""
        has_real_ai = self._ensure_client()
        prompt = f"""Explain this polar science concept for a {audience_level} audience:
Concept: {concept}

Include:
1. Clear, intuitive definition
2. Real-world analogy
3. Why Indian researchers at NCPOR study it (Bharati, Maitri, Himadri, or Himansh)
4. Key scientific importance for Earth's climate

Keep it engaging and under 300 words."""

        if has_real_ai:
            if self.sdk_type == "google-genai" and self.client:
                for try_model in self.candidate_models:
                    try:
                        resp = self.client.models.generate_content(
                            model=try_model,
                            contents=prompt,
                        )
                        if resp and resp.text:
                            self.model_name = try_model
                            return resp.text.strip()
                    except Exception as e:
                        logger.warning(f"explain_concept error with {try_model}: {e}")

            if self.sdk_type == "google-generativeai":
                for try_model in self.candidate_models:
                    try:
                        model = genai_legacy.GenerativeModel(try_model)
                        resp = model.generate_content(prompt)
                        if resp and resp.text:
                            self.model_name = try_model
                            return resp.text.strip()
                    except Exception as e:
                        logger.warning(f"explain_concept legacy error with {try_model}: {e}")

        return (
            f"### Understanding {concept} in Polar Science\n\n"
            f"**{concept}** is a fundamental phenomenon studied by NCPOR scientists at India's research stations in Antarctica and the Arctic. "
            "In polar environments, delicate balances between ice, ocean currents, and solar radiation dictate global weather patterns. "
            "Continuous measurements by Indian researchers help scientists around the world track environmental change."
        )

    def generate_topic_quiz(self, topic_title: str, topic_description: str, count: int = 5) -> list[dict]:
        """Generate structured quiz questions for classroom topics"""
        has_real_ai = self._ensure_client()
        prompt = f"""Create {count} multiple-choice quiz questions about this polar science topic:
Topic: {topic_title}
Description: {topic_description}

Return ONLY a JSON array formatted as:
[
  {{
    "question": "Question text?",
    "options": ["A", "B", "C", "D"],
    "correct_index": 0,
    "explanation": "Why this answer is scientifically correct."
  }}
]"""

        if has_real_ai:
            if self.sdk_type == "google-genai" and self.client:
                for try_model in self.candidate_models:
                    try:
                        config = None
                        if genai_types:
                            config = genai_types.GenerateContentConfig(
                                temperature=0.2,
                                response_mime_type="application/json",
                            )
                        resp = self.client.models.generate_content(
                            model=try_model,
                            contents=prompt,
                            config=config,
                        )
                        if resp and resp.text:
                            clean = resp.text.strip()
                            if clean.startswith("```"):
                                clean = re.sub(r"^```(?:json)?\s*", "", clean)
                                clean = re.sub(r"\s*```$", "", clean)
                            self.model_name = try_model
                            return json.loads(clean.strip())
                    except Exception as e:
                        logger.warning(f"generate_topic_quiz error with {try_model}: {e}")

            if self.sdk_type == "google-generativeai":
                for try_model in self.candidate_models:
                    try:
                        model = genai_legacy.GenerativeModel(try_model)
                        resp = model.generate_content(prompt)
                        if resp and resp.text:
                            clean = resp.text.strip()
                            if clean.startswith("```"):
                                clean = re.sub(r"^```(?:json)?\s*", "", clean)
                                clean = re.sub(r"\s*```$", "", clean)
                            self.model_name = try_model
                            return json.loads(clean.strip())
                    except Exception as e:
                        logger.warning(f"generate_topic_quiz legacy error with {try_model}: {e}")

        return [
            {
                "question": f"What is a primary research focus concerning {topic_title} at NCPOR?",
                "options": [
                    "Long-term environmental and climate monitoring",
                    "Commercial mineral mining",
                    "Tourist resort construction",
                    "Deep-space rocket launches",
                ],
                "correct_index": 0,
                "explanation": f"NCPOR focuses on systematic, peaceful scientific research and environmental monitoring related to {topic_title}.",
            }
        ]


# Singleton
_ai_service: Optional[AIService] = None


def get_ai_service() -> AIService:
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService()
    return _ai_service
