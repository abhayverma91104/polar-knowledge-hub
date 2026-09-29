"""
AI service using Google Gemini - embeddings + RAG + content generation
"""
import time
from typing import Optional
import logging
logger = logging.getLogger(__name__)
from config import get_settings

settings = get_settings()

# Try to import Gemini (new google-genai package)
try:
    from google import genai as google_genai
    from google.genai import types as genai_types
    GEMINI_AVAILABLE = True
except ImportError:
    try:
        import google.generativeai as genai_legacy
        GEMINI_AVAILABLE = True
        google_genai = None
    except ImportError:
        GEMINI_AVAILABLE = False
        google_genai = None
        logger.warning("Gemini SDK not available - using demo mode")


class AIService:
    def __init__(self):
        self.use_real = settings.use_real_ai and GEMINI_AVAILABLE
        self.client = None
        self.model_name = "gemini-2.0-flash"
        self.embed_model = "text-embedding-004"
        if self.use_real and google_genai:
            try:
                self.client = google_genai.Client(api_key=settings.gemini_api_key)
                logger.info("Gemini AI (google-genai) initialized")
            except Exception as e:
                logger.warning(f"Could not init Gemini: {e}. Using demo mode.")
                self.use_real = False
        else:
            logger.info("Using demo AI mode")

    def get_embedding(self, text: str) -> list[float]:
        """Generate embedding vector for text"""
        if self.use_real and self.client:
            try:
                result = self.client.models.embed_content(
                    model=self.embed_model,
                    contents=text,
                )
                return result.embeddings[0].values
            except Exception as e:
                logger.error(f"Embedding error: {e}")
                return self._mock_embedding(text)
        return self._mock_embedding(text)

    def get_query_embedding(self, text: str) -> list[float]:
        """Generate embedding for search queries"""
        if self.use_real and self.client:
            try:
                result = self.client.models.embed_content(
                    model=self.embed_model,
                    contents=text,
                )
                return result.embeddings[0].values
            except Exception as e:
                logger.error(f"Query embedding error: {e}")
                return self._mock_embedding(text)
        return self._mock_embedding(text)

    def _mock_embedding(self, text: str) -> list[float]:
        """Deterministic mock embedding for demo mode"""
        import hashlib
        import struct
        hash_bytes = hashlib.sha256(text.encode()).digest()
        # Generate 768 floats from hash
        floats = []
        for i in range(0, 768):
            byte_idx = i % len(hash_bytes)
            floats.append((hash_bytes[byte_idx] / 255.0) * 2 - 1)
        return floats

    def answer_with_rag(
        self,
        question: str,
        context_chunks: list[dict],
        conversation_history: Optional[list] = None,
    ) -> dict:
        """Generate RAG-based answer with citations"""
        if not context_chunks:
            return {
                "answer": "I don't have specific information about this topic in the current knowledge repository. Please try a different query or explore the repository directly.",
                "sources": [],
                "model": "demo" if not self.use_real else "gemini-1.5-flash",
            }

        # Build context
        context_parts = []
        for i, chunk in enumerate(context_chunks[:8], 1):
            context_parts.append(
                f"[{i}] {chunk['document_title']} (Page {chunk.get('page_number', 'N/A')})\n{chunk['chunk_text'][:800]}"
            )
        context = "\n\n---\n\n".join(context_parts)

        prompt = f"""You are the Polar AI, an expert assistant for NCPOR (National Centre for Polar and Ocean Research), India.
Answer questions about Indian polar expeditions, Antarctic/Arctic research, and polar science.

Use ONLY the provided context from the NCPOR knowledge repository to answer. 
If the context doesn't contain sufficient information, say so clearly.
Always cite sources using [number] notation matching the provided context.
Be precise, scientific, and informative.

CONTEXT FROM NCPOR KNOWLEDGE REPOSITORY:
{context}

QUESTION: {question}

Provide a comprehensive answer with proper citations. Format: Answer text [1] [2] etc.
"""

        if self.use_real and self.client:
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                )
                answer = response.text
            except Exception as e:
                logger.error(f"Gemini RAG error: {e}")
                answer = self._demo_rag_answer(question, context_chunks)
        else:
            answer = self._demo_rag_answer(question, context_chunks)

        # Build source citations
        sources = []
        for i, chunk in enumerate(context_chunks[:8], 1):
            sources.append({
                "index": i,
                "document_id": chunk.get("document_id"),
                "document_title": chunk.get("document_title"),
                "page_number": chunk.get("page_number"),
                "source_url": chunk.get("source_url"),
                "chunk_text": chunk["chunk_text"][:200] + "...",
            })

        return {
            "answer": answer,
            "sources": sources,
            "model": "gemini-1.5-flash" if self.use_real else "demo",
        }

    def _demo_rag_answer(self, question: str, chunks: list[dict]) -> str:
        """Demo answer when AI is not available"""
        doc_titles = [c.get("document_title", "Unknown") for c in chunks[:3]]
        return f"""Based on the NCPOR knowledge repository, here is what I found regarding your question about "{question}":

The repository contains relevant information from documents including {', '.join(doc_titles[:2])} [1][2].

Indian polar research has made significant contributions to understanding the polar regions. The National Centre for Polar and Ocean Research (NCPOR) coordinates these efforts through systematic expeditions and multi-disciplinary research programs [1].

Key findings from the repository suggest ongoing research in oceanography, glaciology, atmospheric science, and marine biology across both Antarctic and Arctic regions [2][3].

*Note: This is a demo response. Connect Gemini API for full AI-powered answers.*"""

    def extract_document_metadata(self, text: str, filename: str = "") -> dict:
        """Extract structured metadata from document text"""
        prompt = f"""Extract metadata from this polar science document.
Return ONLY a JSON object with these fields:
{{
  "title": "document title",
  "authors": ["list of authors"],
  "year": 2024,
  "region": "antarctica|arctic|both|other",
  "expedition": "expedition name or null",
  "research_domains": ["list of domains from: Climate Science, Glaciology, Oceanography, Atmospheric Science, Biology, Geology, Environmental Science"],
  "keywords": ["list of keywords"],
  "abstract": "brief summary 100-150 words",
  "document_type": "expedition_report|research_paper|publication|technical_report|news|educational|other",
  "station": "research station name or null",
  "language": "en"
}}

Document filename: {filename}
Document text (first 2000 chars):
{text[:2000]}

Return only valid JSON, no markdown formatting."""

        if self.use_real and self.client:
            try:
                response = self.client.models.generate_content(model=self.model_name, contents=prompt)
                import json
                # Clean response
                text_resp = response.text.strip()
                if text_resp.startswith("```"):
                    text_resp = text_resp.split("```")[1]
                    if text_resp.startswith("json"):
                        text_resp = text_resp[4:]
                return json.loads(text_resp.strip())
            except Exception as e:
                logger.error(f"Metadata extraction error: {e}")
                return self._demo_metadata(filename)
        return self._demo_metadata(filename)

    def _demo_metadata(self, filename: str) -> dict:
        return {
            "title": filename.replace("_", " ").replace("-", " ").rsplit(".", 1)[0].title() if filename else "Polar Research Document",
            "authors": ["NCPOR Research Team"],
            "year": 2024,
            "region": "antarctica",
            "expedition": "44th Indian Antarctic Expedition",
            "research_domains": ["Oceanography", "Climate Science"],
            "keywords": ["Antarctica", "polar research", "NCPOR", "Indian expedition"],
            "abstract": "This document contains research findings from Indian polar expeditions conducted by NCPOR. It covers scientific observations and data collected during the expedition, contributing to our understanding of polar environments and climate systems.",
            "document_type": "expedition_report",
            "station": "Bharati",
            "language": "en",
        }

    def generate_content(
        self,
        content_type: str,
        source_text: str,
        source_title: str,
        context: dict = None,
    ) -> str:
        """Generate outreach content from source documents"""
        prompts = {
            "summary": f"""Write a concise scientific summary (150-200 words) of this NCPOR document.
Focus on key findings, methodology, and significance.

Source: {source_title}
Content: {source_text[:3000]}

Write in third person, professional scientific tone.""",

            "article": f"""Write a public-facing article (approximately 500 words) about this polar research.
Make it engaging but accurate. Include: introduction, key findings, significance, future implications.

Source: {source_title}
Content: {source_text[:3000]}

Write for an educated general audience.""",

            "student": f"""Explain this polar research in simple language for school students (Grade 8-10).
Use analogies, avoid jargon, make it exciting and educational.

Source: {source_title}
Content: {source_text[:2000]}

About 200-250 words.""",

            "linkedin": f"""Write a professional LinkedIn post about this polar research achievement.
2-3 paragraphs, include relevant hashtags, professional tone.

Source: {source_title}
Content: {source_text[:1500]}""",

            "twitter": f"""Write a compelling tweet thread (3-4 tweets) about this polar research.
Each tweet under 280 characters, informative, use relevant hashtags.

Source: {source_title}
Content: {source_text[:1000]}""",

            "instagram": f"""Write an Instagram caption for a polar research post.
Engaging, emotional, 150-200 words, 10-15 relevant hashtags.

Source: {source_title}
Content: {source_text[:1000]}""",

            "youtube": f"""Generate YouTube metadata for a video about this polar research:
Title (max 70 chars): 
Description (250-300 words with timestamps placeholder):
Tags (comma-separated, 15 tags):

Source: {source_title}
Content: {source_text[:2000]}""",

            "quiz": f"""Create 5 multiple-choice quiz questions about this polar research content.
Return as JSON array:
[{{
  "question": "question text",
  "options": ["A", "B", "C", "D"],
  "correct_index": 0,
  "explanation": "why this is correct"
}}]

Source: {source_title}
Content: {source_text[:2000]}

Return only valid JSON.""",
        }

        prompt = prompts.get(content_type, prompts["summary"])

        if self.use_real and self.client:
            try:
                response = self.client.models.generate_content(model=self.model_name, contents=prompt)
                return response.text
            except Exception as e:
                logger.error(f"Content generation error: {e}")
                return self._demo_content(content_type, source_title)
        return self._demo_content(content_type, source_title)

    def _demo_content(self, content_type: str, source_title: str) -> str:
        demos = {
            "summary": f"This document from NCPOR's {source_title} presents significant findings from Indian polar research. The study conducted systematic observations across key polar regions, yielding valuable insights into climate patterns, oceanic conditions, and ecosystem dynamics. The research contributes to global understanding of polar science and India's growing presence in polar research. [DEMO - Connect Gemini API for AI-generated content]",
            "article": f"# India's Polar Research: Breaking New Ground\n\nIndia's National Centre for Polar and Ocean Research (NCPOR) continues to push the boundaries of scientific understanding through its polar expeditions...\n\n[DEMO MODE - Real content generated with Gemini API]",
            "linkedin": f"🧊 Exciting news from India's polar research frontier! Our scientists at NCPOR have made remarkable discoveries... #PolarResearch #India #Science #NCPOR [DEMO]",
            "twitter": f"🧵 Thread: India's polar scientists are making history! 1/ {source_title} reveals fascinating insights about our polar regions... [DEMO]",
            "instagram": f"From the frozen frontiers of Antarctica to the Arctic ice sheets, India's polar scientists are uncovering the secrets of our planet 🧊❄️\n\n#PolarScience #India #NCPOR #Antarctica #Arctic [DEMO]",
            "youtube": f"Title: India's Polar Research: {source_title[:50]}\n\nDescription: Join NCPOR scientists as they explore the world's most remote research stations... [DEMO]",
            "quiz": '[{"question": "What does NCPOR stand for?", "options": ["National Centre for Polar and Ocean Research", "National Committee for Polar Operations Research", "National Corporation for Polar and Ocean Resources", "None of the above"], "correct_index": 0, "explanation": "NCPOR is India\'s premier institution for polar and ocean research under the Ministry of Earth Sciences."}, {"question": "Where is India\'s Bharati Research Station located?", "options": ["Arctic Ocean", "Antarctica", "Himalayas", "Indian Ocean"], "correct_index": 1, "explanation": "Bharati is India\'s research station located in Larsemann Hills, East Antarctica."}]',
        }
        return demos.get(content_type, demos["summary"])


# Singleton
_ai_service = None


def get_ai_service() -> AIService:
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService()
    return _ai_service
