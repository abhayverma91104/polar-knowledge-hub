"""
Scraper script for NCPOR website media images.
Extracts public expedition photos, station banners, and documentary imagery from ncpor.res.in
and inserts them into the Media table.
"""
import ssl
import urllib.request
from urllib.parse import urljoin
from bs4 import BeautifulSoup
import logging
from datetime import datetime

from database import SessionLocal
from models import Media, MediaType, Region, ContentStatus

logger = logging.getLogger(__name__)

TARGET_PAGES = [
    ("https://ncpor.res.in/antarcticas", Region.ANTARCTICA, "Indian Antarctic Research Expeditions"),
    ("https://ncpor.res.in/arctics", Region.ARCTIC, "Indian Arctic Research Operations in Svalbard"),
    ("https://ncpor.res.in/pages/display/270-southern-ocean", Region.OTHER, "Southern Ocean Expeditions & Paleoclimate"),
    ("https://ncpor.res.in/pages/display/268-himalaya", Region.OTHER, "Third Pole Glaciology & Himansh Station"),
    ("https://ncpor.res.in/", Region.OTHER, "NCPOR Sovereign Research Highlights"),
]

def scrape_ncpor_images(db=None):
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    added_count = 0
    scraped_items = []

    for page_url, region, default_desc in TARGET_PAGES:
        try:
            req = urllib.request.Request(page_url, headers=headers)
            with urllib.request.urlopen(req, timeout=12, context=ctx) as resp:
                html = resp.read().decode("utf-8", errors="ignore")
                soup = BeautifulSoup(html, "html.parser")
                img_tags = soup.find_all("img")

                for img in img_tags:
                    src = img.get("src")
                    if not src:
                        continue
                    # Ignore site chrome icons / logos
                    src_lower = src.lower()
                    if any(x in src_lower for x in ["logo", "normal.gif", "yellow.gif", "decrease.gif", "increase.gif", "right-logo"]):
                        continue

                    # Only keep photographic content
                    if not any(ext in src_lower for ext in [".jpg", ".jpeg", ".png"]):
                        continue

                    full_url = urljoin("https://ncpor.res.in/", src)
                    alt_text = (img.get("alt") or "").strip()
                    title_text = (img.get("title") or "").strip()

                    # Deduce title
                    if alt_text and len(alt_text) > 3:
                        title = alt_text
                    elif title_text and len(title_text) > 3:
                        title = title_text
                    else:
                        filename = full_url.split("/")[-1].split(".")[0].replace("_", " ").replace("-", " ")
                        title = f"{region.value.capitalize()} Expedition Record: {filename}"

                    # Check if already in database
                    existing = db.query(Media).filter(Media.file_url == full_url).first()
                    if existing:
                        continue

                    media_item = Media(
                        title=title.title()[:120],
                        description=f"{default_desc} · Scraped from official NCPOR repository ({page_url})",
                        media_type=MediaType.IMAGE,
                        file_url=full_url,
                        thumbnail_url=full_url,
                        region=region,
                        source="NCPOR Official Portal",
                        source_url=page_url,
                        credit="National Centre for Polar and Ocean Research (Govt. of India)",
                        license="Open Access Government Research Data",
                        status=ContentStatus.APPROVED,
                        year=2024,
                        tags=[region.value.capitalize(), "NCPOR Archive", "Official Photography"],
                        created_at=datetime.utcnow()
                    )
                    db.add(media_item)
                    added_count += 1
                    scraped_items.append({
                        "title": media_item.title,
                        "url": full_url,
                        "region": region.value
                    })

        except Exception as e:
            logger.error(f"Error scraping {page_url}: {e}")

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error saving scraped media: {e}")
    finally:
        if close_db:
            db.close()

    return {
        "status": "success",
        "added_count": added_count,
        "scraped_media": scraped_items
    }

if __name__ == "__main__":
    result = scrape_ncpor_images()
    print(f"Scraped and added {result['added_count']} images from NCPOR website!")
    for item in result["scraped_media"][:10]:
        print(f"- [{item['region']}] {item['title']}: {item['url']}")
