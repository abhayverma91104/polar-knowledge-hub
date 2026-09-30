"""
NCPOR Web Crawler with responsible access, deduplication, and metadata extraction
"""
import asyncio
import hashlib
import re
import time
from datetime import datetime
from typing import Optional, Callable
from urllib.parse import urljoin, urlparse, urlunparse
import httpx
from bs4 import BeautifulSoup
import logging
logger = logging.getLogger(__name__)
from config import get_settings

settings = get_settings()


def normalize_url(url: str) -> str:
    """Normalize URL for deduplication"""
    parsed = urlparse(url)
    # Remove fragments and common tracking params
    normalized = urlunparse((
        parsed.scheme,
        parsed.netloc.lower(),
        parsed.path.rstrip("/") or "/",
        parsed.params,
        parsed.query,  # Keep query for now
        "",  # Remove fragment
    ))
    return normalized


def compute_hash(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


class RobotsChecker:
    """Simple robots.txt checker"""
    def __init__(self):
        self._cache = {}

    async def can_fetch(self, url: str, client: httpx.AsyncClient) -> bool:
        parsed = urlparse(url)
        base = f"{parsed.scheme}://{parsed.netloc}"
        
        if base not in self._cache:
            try:
                robots_url = f"{base}/robots.txt"
                resp = await client.get(robots_url, timeout=5)
                self._cache[base] = resp.text if resp.status_code == 200 else ""
            except Exception:
                self._cache[base] = ""

        robots_text = self._cache[base]
        if not robots_text:
            return True

        # Simple parser - check for our user agent or *
        path = parsed.path
        disallowed = []
        current_agent_applies = False
        
        for line in robots_text.split("\n"):
            line = line.strip()
            if line.lower().startswith("user-agent:"):
                agent = line.split(":", 1)[1].strip()
                current_agent_applies = agent == "*" or "polarknowledge" in agent.lower()
            elif line.lower().startswith("disallow:") and current_agent_applies:
                rule = line.split(":", 1)[1].strip()
                if rule:
                    disallowed.append(rule)

        for rule in disallowed:
            if path.startswith(rule):
                return False
        return True


class NCPORCrawler:
    """
    Responsible web crawler for NCPOR public resources.
    Respects robots.txt, rate limits, and only processes public content.
    """

    ALLOWED_DOMAINS = ["ncpor.res.in", "ncaor.gov.in", "ncpor.gov.in"]
    
    CONTENT_TYPE_PATTERNS = {
        "publication": [r"publication", r"journal", r"paper", r"article", r"research"],
        "expedition_report": [r"expedition", r"antarct", r"arctic", r"polar"],
        "news": [r"news", r"press", r"announcement", r"event"],
        "dataset": [r"dataset", r"data", r"database"],
        "educational": [r"education", r"outreach", r"learn"],
    }

    PDF_EXTENSIONS = [".pdf", ".PDF"]
    IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
    VIDEO_EXTENSIONS = [".mp4", ".avi", ".mov", ".webm"]

    def __init__(self, progress_callback: Optional[Callable] = None):
        self.progress_callback = progress_callback
        self.robots = RobotsChecker()
        self.visited_urls = set()
        self.content_hashes = set()

    async def crawl(
        self,
        start_url: str,
        config: dict,
        job_id: str,
    ) -> dict:
        """
        Main crawl method. Returns crawl results.
        
        config keys:
          max_depth, max_pages, follow_links, download_pdfs,
          download_images, allowed_patterns, excluded_patterns
        """
        max_depth = config.get("max_depth", settings.crawler_max_depth)
        max_pages = config.get("max_pages", settings.crawler_max_pages)
        follow_links = config.get("follow_links", True)
        download_pdfs = config.get("download_pdfs", True)
        delay = config.get("delay_seconds", settings.crawler_delay_seconds)
        allowed_patterns = config.get("allowed_patterns", [])
        excluded_patterns = config.get("excluded_patterns", [])

        parsed_start = urlparse(start_url)
        start_domain = parsed_start.netloc

        # Security: validate domain is in allowed list
        allowed = settings.allowed_domains_list + self.ALLOWED_DOMAINS
        if not any(start_domain.endswith(d) for d in allowed):
            logger.warning(f"Domain {start_domain} not in allowed list")
            return {
                "error": f"Domain {start_domain} is not in the approved domain list. Only NCPOR domains are permitted.",
                "resources": [],
            }

        resources = []
        queue = [(start_url, 0)]  # (url, depth)
        pages_scanned = 0
        errors = []

        headers = {
            "User-Agent": settings.crawler_user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml,application/pdf;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }

        async with httpx.AsyncClient(
            headers=headers,
            follow_redirects=True,
            timeout=15.0,
            verify=True,
        ) as client:
            while queue and pages_scanned < max_pages:
                current_url, depth = queue.pop(0)
                norm_url = normalize_url(current_url)

                if norm_url in self.visited_urls:
                    continue
                self.visited_urls.add(norm_url)

                # Check robots.txt
                can_fetch = await self.robots.can_fetch(current_url, client)
                if not can_fetch:
                    logger.info(f"Robots.txt disallows: {current_url}")
                    continue

                # Check exclusion patterns
                if any(re.search(p, current_url, re.I) for p in excluded_patterns if p):
                    continue

                # Check allowed patterns
                if allowed_patterns and not any(re.search(p, current_url, re.I) for p in allowed_patterns if p):
                    continue

                try:
                    logger.info(f"Crawling [{depth}]: {current_url}")
                    await asyncio.sleep(delay)

                    resp = await client.get(current_url)
                    if resp.status_code != 200:
                        errors.append(f"HTTP {resp.status_code}: {current_url}")
                        continue

                    pages_scanned += 1
                    content_type_header = resp.headers.get("content-type", "")

                    if self.progress_callback:
                        await self.progress_callback({
                            "job_id": job_id,
                            "pages_scanned": pages_scanned,
                            "current_url": current_url,
                        })

                    # Handle PDF
                    if "pdf" in content_type_header or any(current_url.lower().endswith(e) for e in self.PDF_EXTENSIONS):
                        if download_pdfs:
                            resource = await self._process_pdf(current_url, resp.content)
                            if resource:
                                resources.append(resource)
                        continue

                    # Handle HTML page
                    if "html" in content_type_header or "text" in content_type_header:
                        try:
                            soup = BeautifulSoup(resp.text, "lxml")
                        except Exception:
                            soup = BeautifulSoup(resp.text, "html.parser")
                        
                        # Extract page resource
                        page_resource = self._extract_page_resource(current_url, soup, resp.text)
                        if page_resource:
                            resources.append(page_resource)

                        # Extract links for further crawling
                        if follow_links and depth < max_depth:
                            links = self._extract_links(current_url, soup, start_domain, download_pdfs)
                            for link in links:
                                norm_link = normalize_url(link)
                                if norm_link not in self.visited_urls:
                                    queue.append((link, depth + 1))

                except httpx.TimeoutException:
                    errors.append(f"Timeout: {current_url}")
                    logger.warning(f"Timeout crawling: {current_url}")
                except httpx.RequestError as e:
                    errors.append(f"Request error: {current_url}: {str(e)}")
                    logger.error(f"Request error on {current_url}: {e}")
                except Exception as e:
                    errors.append(f"Error: {current_url}: {str(e)}")
                    logger.error(f"Unexpected error crawling {current_url}: {e}")

        return {
            "pages_scanned": pages_scanned,
            "resources": resources,
            "errors": errors,
            "urls_visited": list(self.visited_urls),
        }

    def _extract_page_resource(self, url: str, soup: BeautifulSoup, raw_html: str) -> Optional[dict]:
        """Extract structured resource from an HTML page"""
        # Get title
        title = None
        if soup.title:
            title = soup.title.string
        if not title:
            h1 = soup.find("h1")
            if h1:
                title = h1.get_text(strip=True)
        if not title:
            title = urlparse(url).path.strip("/").replace("-", " ").replace("_", " ").title()

        # Get main text content
        # Remove navigation, scripts, styles
        for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
            tag.decompose()

        main_text = ""
        main = soup.find("main") or soup.find(id="main") or soup.find(class_="content") or soup.find("article")
        if main:
            main_text = main.get_text(separator=" ", strip=True)
        else:
            body = soup.find("body")
            if body:
                main_text = body.get_text(separator=" ", strip=True)

        # Clean text
        main_text = re.sub(r'\s+', ' ', main_text).strip()
        
        if len(main_text) < 100:
            return None  # Skip very short pages

        content_hash = compute_hash(main_text[:5000])
        
        # Check for duplicate content
        if content_hash in self.content_hashes:
            return None
        self.content_hashes.add(content_hash)

        # Detect resource type
        resource_type = self._detect_content_type(url, title or "", main_text)

        # Extract metadata
        meta = {}
        description_tag = soup.find("meta", attrs={"name": "description"})
        if description_tag:
            meta["description"] = description_tag.get("content", "")
        
        date_tag = soup.find("meta", attrs={"property": "article:published_time"})
        if date_tag:
            meta["publication_date"] = date_tag.get("content", "")

        # Extract links to PDFs on this page
        pdf_links = []
        for link in soup.find_all("a", href=True):
            href = link["href"]
            full_href = urljoin(url, href)
            if any(full_href.lower().endswith(e) for e in self.PDF_EXTENSIONS):
                pdf_links.append(full_href)

        return {
            "url": url,
            "title": title,
            "content_type": "text/html",
            "resource_type": resource_type,
            "raw_text": main_text[:10000],
            "content_hash": content_hash,
            "metadata": {
                **meta,
                "pdf_links": pdf_links[:10],
                "headings": [h.get_text(strip=True) for h in soup.find_all(["h1", "h2", "h3"])[:10]],
            },
            "discovered_at": datetime.utcnow().isoformat(),
        }

    async def _process_pdf(self, url: str, content: bytes) -> Optional[dict]:
        """Process a discovered PDF file"""
        content_hash = hashlib.sha256(content).hexdigest()
        
        if content_hash in self.content_hashes:
            return None
        self.content_hashes.add(content_hash)

        # Extract text from PDF using PyMuPDF
        raw_text = ""
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(stream=content, filetype="pdf")
            pages_text = []
            for page_num in range(min(doc.page_count, 20)):  # First 20 pages
                page = doc[page_num]
                pages_text.append(page.get_text())
            raw_text = "\n".join(pages_text)
            doc.close()
        except Exception as e:
            logger.warning(f"PyMuPDF error on {url}: {e}")
            raw_text = ""

        filename = urlparse(url).path.split("/")[-1]
        title = filename.replace("_", " ").replace("-", " ").rsplit(".", 1)[0].title()

        return {
            "url": url,
            "title": title,
            "content_type": "application/pdf",
            "resource_type": self._detect_content_type(url, title, raw_text),
            "raw_text": raw_text[:10000],
            "content_hash": content_hash,
            "metadata": {
                "filename": filename,
                "file_size": len(content),
            },
            "discovered_at": datetime.utcnow().isoformat(),
        }

    def _extract_links(
        self, base_url: str, soup: BeautifulSoup, start_domain: str, include_pdfs: bool
    ) -> list[str]:
        """Extract relevant links from page"""
        links = set()
        
        for link_tag in soup.find_all("a", href=True):
            href = link_tag["href"].strip()
            if not href or href.startswith("#") or href.startswith("mailto:") or href.startswith("tel:"):
                continue
            
            full_url = urljoin(base_url, href)
            parsed = urlparse(full_url)
            
            # Only follow same-domain links
            if not parsed.netloc.endswith(start_domain.split(".")[-2] + "." + start_domain.split(".")[-1]):
                continue
            
            # Include PDFs if configured
            path_lower = parsed.path.lower()
            if any(path_lower.endswith(e.lower()) for e in self.PDF_EXTENSIONS):
                if include_pdfs:
                    links.add(full_url)
                continue
            
            # Skip images, videos, etc.
            if any(path_lower.endswith(e) for e in self.IMAGE_EXTENSIONS + self.VIDEO_EXTENSIONS):
                continue
            
            links.add(full_url)

        return list(links)

    def _detect_content_type(self, url: str, title: str, text: str) -> str:
        """Detect content type from URL and content"""
        combined = f"{url} {title} {text[:500]}".lower()
        
        for content_type, patterns in self.CONTENT_TYPE_PATTERNS.items():
            if any(re.search(p, combined) for p in patterns):
                return content_type
        
        return "page"


class DocumentProcessor:
    """Process uploaded documents into chunks with embeddings"""

    def __init__(self, ai_service=None):
        self.ai_service = ai_service

    def process_pdf(self, content: bytes, filename: str) -> dict:
        """Extract text, metadata, and create chunks from PDF"""
        try:
            import fitz
            doc = fitz.open(stream=content, filetype="pdf")
            
            pages = []
            full_text = []
            
            for page_num in range(doc.page_count):
                page = doc[page_num]
                text = page.get_text()
                
                # Try OCR if text is sparse
                if len(text.strip()) < 50:
                    try:
                        pix = page.get_pixmap(dpi=150)
                        img_data = pix.tobytes("png")
                        text = self._ocr_image(img_data)
                    except Exception:
                        pass
                
                pages.append({"page": page_num + 1, "text": text})
                full_text.append(text)
            
            doc.close()
            combined_text = "\n".join(full_text)
            
            # Extract metadata
            metadata = {}
            if self.ai_service:
                metadata = self.ai_service.extract_document_metadata(combined_text, filename)

            # Create chunks
            chunks = self._create_chunks(pages)
            
            # Generate embeddings
            if self.ai_service:
                for chunk in chunks:
                    chunk["embedding"] = self.ai_service.get_embedding(chunk["text"])

            return {
                "full_text": combined_text,
                "pages": len(pages),
                "chunks": chunks,
                "metadata": metadata,
                "content_hash": compute_hash(combined_text),
            }
        except Exception as e:
            logger.error(f"PDF processing error: {e}")
            return {
                "full_text": "",
                "pages": 0,
                "chunks": [],
                "metadata": {},
                "error": str(e),
                "content_hash": compute_hash(filename),
            }

    def _ocr_image(self, img_data: bytes) -> str:
        """OCR an image (requires tesseract)"""
        try:
            import pytesseract
            from PIL import Image
            import io
            img = Image.open(io.BytesIO(img_data))
            return pytesseract.image_to_string(img)
        except Exception:
            return ""

    def _create_chunks(self, pages: list, chunk_size: int = 800, overlap: int = 150) -> list:
        """Split document into overlapping text chunks"""
        chunks = []
        chunk_idx = 0
        
        for page_data in pages:
            page_text = page_data["text"].strip()
            if not page_text:
                continue
            
            # Split into sentences roughly
            words = page_text.split()
            
            for i in range(0, len(words), chunk_size - overlap):
                chunk_words = words[i:i + chunk_size]
                if len(chunk_words) < 30:  # Skip tiny chunks
                    continue
                
                chunk_text = " ".join(chunk_words)
                chunks.append({
                    "index": chunk_idx,
                    "page_number": page_data["page"],
                    "text": chunk_text,
                    "embedding": None,  # Will be filled later
                })
                chunk_idx += 1
        
        return chunks

    def process_text(self, content: str, filename: str = "") -> dict:
        """Process plain text document"""
        chunks = self._create_chunks([{"page": 1, "text": content}])
        metadata = {}
        if self.ai_service:
            metadata = self.ai_service.extract_document_metadata(content, filename)
            for chunk in chunks:
                chunk["embedding"] = self.ai_service.get_embedding(chunk["text"])
        
        return {
            "full_text": content,
            "pages": 1,
            "chunks": chunks,
            "metadata": metadata,
            "content_hash": compute_hash(content),
        }
