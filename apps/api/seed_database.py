"""
Seed script for Polar Knowledge Hub
Populates the database with realistic demo data for SIH 2026 demonstration
"""
import sys
import os
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Add apps/api to path so we can import backend modules
scripts_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(scripts_dir)
sys.path.insert(0, os.path.join(project_root, 'apps', 'api'))

from datetime import datetime, timedelta
from database import SessionLocal, init_db
from models import (
    User, UserRole, Document, DocumentType, DocumentChunk, Dataset,
    Media, MediaType, Expedition, ResearchStation, Topic, QuizQuestion,
    GeneratedContent, Source, SourceType, ContentStatus, Region,
    ExpeditionStation
)
from auth import hash_password
from ai_service import get_ai_service
# (logger already configured above)

def seed_all():
    logger.info("Starting database seed...")
    init_db()
    db = SessionLocal()

    try:
        # Seed in dependency order
        stations = seed_stations(db)
        expeditions = seed_expeditions(db, stations)
        seed_users(db)
        seed_sources(db)
        documents = seed_documents(db, expeditions, stations)
        seed_datasets(db, expeditions, stations)
        seed_media(db, expeditions, stations)
        seed_topics_and_quizzes(db)
        seed_generated_content(db, documents, expeditions)
        
        db.commit()
        logger.info("✅ Database seeded successfully!")
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


def seed_users(db):
    logger.info("Seeding users...")
    
    if db.query(User).filter(User.email == "admin@ncpor.res.in").first():
        logger.info("Users already seeded, skipping")
        return
    
    users = [
        User(
            email="admin@ncpor.res.in",
            hashed_password=hash_password("PolarHub@2026"),
            full_name="NCPOR Administrator",
            role=UserRole.ADMIN,
            is_active=True,
        ),
        User(
            email="editor@ncpor.res.in",
            hashed_password=hash_password("PolarHub@2026"),
            full_name="Science Editor",
            role=UserRole.EDITOR,
            is_active=True,
        ),
        User(
            email="researcher@ncpor.res.in",
            hashed_password=hash_password("PolarHub@2026"),
            full_name="Dr. Research Scientist",
            role=UserRole.RESEARCHER,
            is_active=True,
        ),
    ]
    for u in users:
        db.add(u)
    db.flush()
    logger.info(f"Seeded {len(users)} users")


def seed_stations(db):
    logger.info("Seeding research stations...")
    
    existing = db.query(ResearchStation).first()
    if existing:
        logger.info("Stations already seeded, skipping")
        return db.query(ResearchStation).all()
    
    stations_data = [
        {
            "name": "Maitri",
            "code": "MAITRI",
            "region": Region.ANTARCTICA,
            "latitude": -70.7669,
            "longitude": 11.7325,
            "established_year": 1989,
            "description": "Maitri is India's second permanent research station in Antarctica, located in the Schirmacher Oasis. It serves as the base for India's Antarctic expeditions and conducts year-round scientific research in glaciology, meteorology, and earth sciences.",
            "research_areas": ["Glaciology", "Meteorology", "Geology", "Earth Sciences", "Atmospheric Science", "Biology"],
            "facilities": ["Meteorological Observatory", "Glaciological Laboratory", "Geology Lab", "Medical Facility", "Communication Center", "Power Plant"],
            "is_active": True,
        },
        {
            "name": "Bharati",
            "code": "BHARATI",
            "region": Region.ANTARCTICA,
            "latitude": -69.4069,
            "longitude": 76.1831,
            "established_year": 2012,
            "description": "Bharati is India's third and newest research station, located at Larsemann Hills, East Antarctica. It is a state-of-the-art facility designed for modern polar science and can accommodate up to 47 scientists. It focuses on oceanography, geology, and atmospheric science.",
            "research_areas": ["Oceanography", "Geology", "Atmospheric Science", "Climate Research", "Marine Biology", "Glaciology"],
            "facilities": ["Oceanographic Laboratory", "Geological Survey Center", "Climate Monitoring Station", "Cafeteria", "Accommodation Modules", "Helipad", "Marine Lab"],
            "is_active": True,
        },
        {
            "name": "Himadri",
            "code": "HIMADRI",
            "region": Region.ARCTIC,
            "latitude": 78.9267,
            "longitude": 11.9228,
            "established_year": 2008,
            "description": "Himadri is India's Arctic research station located at Ny-Ålesund, Svalbard, Norway. It is India's first and only Arctic research base, established under the aegis of NCPOR for studying climate change, atmospheric science, and glaciology in the Arctic region.",
            "research_areas": ["Climate Change", "Glaciology", "Atmospheric Science", "Biology", "Marine Research", "Carbon Cycling"],
            "facilities": ["Climate Monitoring Equipment", "Atmospheric Lab", "Biology Lab", "Accommodation", "Communication Equipment"],
            "is_active": True,
        },
    ]
    
    stations = []
    for data in stations_data:
        station = ResearchStation(**data)
        db.add(station)
        stations.append(station)
    
    db.flush()
    logger.info(f"Seeded {len(stations)} research stations")
    return stations


def seed_expeditions(db, stations):
    logger.info("Seeding expeditions...")
    
    existing = db.query(Expedition).first()
    if existing:
        logger.info("Expeditions already seeded, skipping")
        return db.query(Expedition).all()
    
    expeditions_data = [
        {
            "number": 1,
            "title": "1st Indian Antarctic Expedition",
            "year": 1981,
            "region": Region.ANTARCTICA,
            "start_date": datetime(1981, 12, 9),
            "end_date": datetime(1982, 3, 31),
            "duration_days": 112,
            "description": "India's first foray into Antarctic research, establishing the foundation for India's polar science program. Led by Dr. Syed Zahoor Qasim, the expedition explored Dakshin Gangotri and established India's presence in Antarctica.",
            "objectives": ["Explore Antarctic territory", "Establish research base", "Conduct geological surveys", "Meteorological observations"],
            "research_domains": ["Geology", "Meteorology", "Glaciology"],
            "team_size": 21,
            "chief_scientist": "Dr. Syed Zahoor Qasim",
            "is_featured": False,
        },
        {
            "number": 40,
            "title": "40th Indian Antarctic Expedition",
            "year": 2020,
            "region": Region.ANTARCTICA,
            "start_date": datetime(2020, 11, 25),
            "end_date": datetime(2021, 4, 10),
            "duration_days": 136,
            "description": "The 40th Indian Antarctic Expedition conducted research on climate change indicators, glacial dynamics, and Southern Ocean studies, continuing India's long tradition of Antarctic scientific research.",
            "objectives": ["Monitor glacial retreat", "Southern Ocean oceanography", "Atmospheric sampling", "Biological surveys"],
            "research_domains": ["Climate Science", "Glaciology", "Oceanography", "Atmospheric Science"],
            "team_size": 43,
            "chief_scientist": "Dr. M. Ravichandran",
            "is_featured": False,
        },
        {
            "number": 42,
            "title": "42nd Indian Antarctic Expedition",
            "year": 2022,
            "region": Region.ANTARCTICA,
            "start_date": datetime(2022, 11, 20),
            "end_date": datetime(2023, 3, 25),
            "duration_days": 125,
            "description": "The 42nd Indian Antarctic Expedition focused on comprehensive climate monitoring, ocean heat content studies, and biodiversity assessment of Antarctic ecosystems. Advanced instruments were deployed at both Maitri and Bharati stations.",
            "objectives": ["Climate monitoring", "Ocean heat studies", "Biodiversity assessment", "Ice core sampling"],
            "research_domains": ["Climate Science", "Oceanography", "Biology", "Glaciology"],
            "team_size": 52,
            "chief_scientist": "Dr. Thamban Meloth",
            "is_featured": False,
        },
        {
            "number": 43,
            "title": "43rd Indian Antarctic Expedition",
            "year": 2023,
            "region": Region.ANTARCTICA,
            "start_date": datetime(2023, 11, 18),
            "end_date": datetime(2024, 3, 30),
            "duration_days": 133,
            "description": "The 43rd Indian Antarctic Expedition made significant advances in understanding the Indian Ocean's role in Antarctic climate systems, including comprehensive surveys of the Amery Ice Shelf and Southern Ocean biological productivity.",
            "objectives": ["Amery Ice Shelf survey", "Southern Ocean biology", "Atmospheric chemistry", "Geological mapping"],
            "research_domains": ["Oceanography", "Atmospheric Science", "Biology", "Geology"],
            "team_size": 51,
            "chief_scientist": "Dr. Rasik Ravindra",
            "is_featured": False,
        },
        {
            "number": 44,
            "title": "44th Indian Antarctic Expedition",
            "year": 2024,
            "region": Region.ANTARCTICA,
            "start_date": datetime(2024, 11, 15),
            "end_date": datetime(2025, 3, 31),
            "duration_days": 136,
            "description": "The 44th Indian Antarctic Expedition is India's most comprehensive polar research mission to date, deploying advanced scientific instruments across Maitri and Bharati stations. Key focus areas include Southern Ocean heat budget, Antarctic ice dynamics, climate change indicators, and novel biological discoveries in extreme polar environments.",
            "objectives": [
                "Comprehensive Southern Ocean heat budget assessment",
                "Antarctic ice sheet dynamics and mass balance",
                "Climate change biomarker identification",
                "Marine biodiversity cataloguing",
                "Atmospheric chemistry and ozone monitoring",
                "Geological survey of Larsemann Hills",
                "Deployment of autonomous ocean monitoring buoys",
            ],
            "research_domains": ["Oceanography", "Climate Science", "Glaciology", "Atmospheric Science", "Biology", "Geology"],
            "team_size": 58,
            "chief_scientist": "Dr. Shailesh Nayak",
            "is_featured": True,
        },
    ]
    
    maitri = next((s for s in stations if s.code == "MAITRI"), None)
    bharati = next((s for s in stations if s.code == "BHARATI"), None)
    
    expeditions = []
    for data in expeditions_data:
        exp = Expedition(**data)
        db.add(exp)
        db.flush()
        
        # Link stations to Antarctic expeditions
        if exp.region == Region.ANTARCTICA and maitri:
            link = ExpeditionStation(expedition_id=exp.id, station_id=maitri.id)
            db.add(link)
        if exp.region == Region.ANTARCTICA and bharati and exp.number >= 33:
            link2 = ExpeditionStation(expedition_id=exp.id, station_id=bharati.id)
            db.add(link2)
        
        expeditions.append(exp)
    
    db.flush()
    logger.info(f"Seeded {len(expeditions)} expeditions")
    return expeditions


def seed_sources(db):
    logger.info("Seeding sources...")
    
    existing = db.query(Source).first()
    if existing:
        return
    
    sources = [
        Source(
            name="NCPOR Website",
            source_type=SourceType.WEB_CRAWLER,
            base_url="https://www.ncpor.res.in",
            description="Official NCPOR website - publications, expeditions, news",
            is_trusted=True,
            sync_frequency="weekly",
            last_synced_at=datetime.utcnow(),
        ),
        Source(
            name="Manual Upload",
            source_type=SourceType.MANUAL_UPLOAD,
            description="Documents manually uploaded by researchers and admins",
            is_trusted=True,
            sync_frequency="manual",
        ),
        Source(
            name="India WRIS",
            source_type=SourceType.API,
            base_url="https://indiawris.gov.in",
            description="India Water Resources Information System datasets",
            is_trusted=False,
            sync_frequency="monthly",
        ),
    ]
    for s in sources:
        db.add(s)
    db.flush()
    logger.info(f"Seeded {len(sources)} sources")


def seed_documents(db, expeditions, stations):
    logger.info("Seeding documents...")
    
    existing = db.query(Document).first()
    if existing:
        logger.info("Documents already seeded, skipping")
        return db.query(Document).all()
    
    exp44 = next((e for e in expeditions if e.number == 44), expeditions[-1])
    exp43 = next((e for e in expeditions if e.number == 43), expeditions[-2] if len(expeditions) > 1 else expeditions[0])
    maitri = next((s for s in stations if s.code == "MAITRI"), None)
    bharati = next((s for s in stations if s.code == "BHARATI"), None)
    himadri = next((s for s in stations if s.code == "HIMADRI"), None)
    
    docs_data = [
        {
            "title": "44th Indian Antarctic Expedition: Comprehensive Scientific Report",
            "description": "Official scientific report of India's 44th Antarctic Expedition, covering all research activities, observations, and findings across oceanography, glaciology, atmospheric science, and biology.",
            "document_type": DocumentType.EXPEDITION_REPORT,
            "year": 2025,
            "region": Region.ANTARCTICA,
            "authors": ["Dr. Shailesh Nayak", "Dr. Thamban Meloth", "Dr. M. Ravichandran", "NCPOR Science Team"],
            "research_domains": ["Oceanography", "Glaciology", "Atmospheric Science", "Climate Science", "Biology"],
            "keywords": ["44th expedition", "Antarctica", "Southern Ocean", "ice sheet", "climate change", "NCPOR"],
            "abstract": "The 44th Indian Antarctic Expedition (2024-2025) represents a landmark achievement in India's polar research program. This comprehensive report documents research conducted at Maitri and Bharati stations, covering Southern Ocean heat budget assessments, Antarctic ice dynamics, climate biomarkers, marine biodiversity, and atmospheric chemistry. Key findings include novel observations of warm water intrusions beneath the ice shelf and unprecedented biodiversity records in extreme Antarctic environments.",
            "source": "NCPOR",
            "source_url": "https://www.ncpor.res.in/expeditions/44th",
            "expedition_id": exp44.id,
            "station_id": bharati.id if bharati else None,
            "status": ContentStatus.APPROVED,
            "last_verified_at": datetime.utcnow(),
        },
        {
            "title": "Antarctic Oceanographic Observations: Southern Ocean Heat Flux Study",
            "description": "A study of oceanographic characteristics and heat transport mechanisms in the Southern Ocean during the 44th Indian Antarctic Expedition, with implications for global climate models.",
            "document_type": DocumentType.RESEARCH_PAPER,
            "year": 2024,
            "region": Region.ANTARCTICA,
            "authors": ["Dr. M. Ravichandran", "Dr. Sudhir Rao", "T. Srinivasan"],
            "research_domains": ["Oceanography", "Climate Science"],
            "keywords": ["Southern Ocean", "heat flux", "oceanography", "climate", "WOCE", "Circumpolar Deep Water"],
            "abstract": "This paper presents detailed oceanographic observations collected during the 44th Indian Antarctic Expedition. We report on the heat content variability in the Southern Ocean, focusing on the intrusion of Circumpolar Deep Water onto the Antarctic continental shelf. Our measurements reveal a 15% increase in bottom water warming compared to the previous decade, with significant implications for ice shelf stability and global thermohaline circulation.",
            "source": "NCPOR",
            "source_url": "https://www.ncpor.res.in/publications/ocean-heat-flux",
            "expedition_id": exp44.id,
            "station_id": bharati.id if bharati else None,
            "status": ContentStatus.APPROVED,
            "last_verified_at": datetime.utcnow(),
        },
        {
            "title": "Glaciological Studies at Schirmacher Oasis: Mass Balance Assessment",
            "description": "Assessment of glacial mass balance and dynamics in the Schirmacher Oasis region of East Antarctica, providing insights into Antarctic ice sheet stability.",
            "document_type": DocumentType.RESEARCH_PAPER,
            "year": 2024,
            "region": Region.ANTARCTICA,
            "authors": ["Dr. Thamban Meloth", "Avinash Kumar", "Dr. Rasik Ravindra"],
            "research_domains": ["Glaciology", "Climate Science"],
            "keywords": ["Schirmacher Oasis", "mass balance", "glacier dynamics", "East Antarctica", "ice sheet"],
            "abstract": "We present a comprehensive assessment of the mass balance and dynamic behavior of glaciers in the Schirmacher Oasis, East Antarctica, based on field measurements conducted during the 43rd and 44th Indian Antarctic Expeditions. Our study reveals accelerating mass loss in the region, with surface elevation changes of -0.23 ± 0.05 m/year. Ground-penetrating radar surveys identified subglacial topography controlling ice flow patterns.",
            "source": "NCPOR",
            "source_url": "https://www.ncpor.res.in/publications/schirmacher-glaciology",
            "expedition_id": exp43.id,
            "station_id": maitri.id if maitri else None,
            "status": ContentStatus.APPROVED,
            "last_verified_at": datetime.utcnow(),
        },
        {
            "title": "Atmospheric Chemistry and Ozone Layer Studies Over Antarctica",
            "description": "Continuous monitoring of atmospheric chemistry, trace gases, and ozone layer dynamics above the Maitri and Bharati research stations.",
            "document_type": DocumentType.TECHNICAL_REPORT,
            "year": 2024,
            "region": Region.ANTARCTICA,
            "authors": ["Dr. C. T. Sabale", "Dr. Anoop Mahajan", "P. K. Bhor"],
            "research_domains": ["Atmospheric Science", "Climate Science"],
            "keywords": ["ozone", "atmospheric chemistry", "trace gases", "Antarctica", "UV radiation"],
            "abstract": "This technical report compiles atmospheric chemistry measurements from Maitri and Bharati stations during 2023-2024. The data encompasses ozone column measurements, aerosol optical depth, greenhouse gas concentrations, and UV irradiance. We document continued ozone hole recovery trends while reporting anomalous surface ozone depletion events linked to sea-salt aerosol chemistry during polar sunrise.",
            "source": "NCPOR",
            "expedition_id": exp44.id,
            "station_id": maitri.id if maitri else None,
            "status": ContentStatus.APPROVED,
            "last_verified_at": datetime.utcnow(),
        },
        {
            "title": "Marine Biodiversity of Prydz Bay: New Species Discoveries",
            "description": "Documentation of marine biodiversity in Prydz Bay during NCPOR expeditions, including discovery of new species and assessment of ecosystem health.",
            "document_type": DocumentType.PUBLICATION,
            "year": 2024,
            "region": Region.ANTARCTICA,
            "authors": ["Dr. Melena Kaur", "Dr. Pratima Pandey", "V. Singh"],
            "research_domains": ["Biology", "Oceanography"],
            "keywords": ["Prydz Bay", "marine biology", "biodiversity", "new species", "Antarctic ecosystem"],
            "abstract": "We present findings from comprehensive marine biodiversity surveys conducted in Prydz Bay during the 43rd and 44th Indian Antarctic Expeditions. Using ROV-based sampling and environmental DNA analysis, we identified 847 benthic species, including 12 potentially new to science. Notable discoveries include three new polychaete worm species and an unusual hydrothermal vent community. The data suggests a 7% reduction in species richness near the Amery Ice Shelf front compared to 2018 surveys.",
            "source": "NCPOR",
            "expedition_id": exp44.id,
            "station_id": bharati.id if bharati else None,
            "status": ContentStatus.APPROVED,
            "last_verified_at": datetime.utcnow(),
        },
        {
            "title": "Arctic Climate Change Indicators: Svalbard Long-Term Monitoring Report",
            "description": "Long-term monitoring of climate change indicators from India's Himadri station at Ny-Ålesund, Svalbard, covering atmospheric, glaciological, and biological parameters.",
            "document_type": DocumentType.TECHNICAL_REPORT,
            "year": 2024,
            "region": Region.ARCTIC,
            "authors": ["Dr. Anoop Kumar Attri", "Dr. Shiv Mohan", "M. K. Sharma"],
            "research_domains": ["Climate Science", "Glaciology", "Atmospheric Science"],
            "keywords": ["Arctic", "Svalbard", "climate change", "Himadri", "permafrost", "sea ice decline"],
            "abstract": "This report presents climate change indicators monitored at Himadri station (Ny-Ålesund) from 2018-2024. Key findings include continued Arctic amplification with temperature rise of 2.1°C above the 1980-2010 baseline, extensive sea ice decline in the Kongsfjorden system, accelerating permafrost thaw, and northward migration of subarctic vegetation species. Black carbon deposition from mid-latitude industrial sources remains a significant driver of accelerated glacial melt.",
            "source": "NCPOR",
            "station_id": himadri.id if himadri else None,
            "status": ContentStatus.APPROVED,
            "last_verified_at": datetime.utcnow(),
        },
        {
            "title": "India's Antarctic Research: Three Decades of Scientific Progress",
            "description": "A comprehensive review of India's three decades of Antarctic research, achievements, and future directions for the polar science program.",
            "document_type": DocumentType.PUBLICATION,
            "year": 2023,
            "region": Region.ANTARCTICA,
            "authors": ["Dr. Rasik Ravindra", "Dr. Syed Zahoor Qasim", "NCPOR Review Committee"],
            "research_domains": ["Climate Science", "Oceanography", "Glaciology", "Atmospheric Science", "Biology", "Geology"],
            "keywords": ["India", "Antarctica", "polar research", "history", "achievements", "NCPOR"],
            "abstract": "This review article chronicles India's remarkable journey in Antarctic scientific research from the first expedition in 1981 through the 44th expedition in 2024-25. Over four decades, India has built two permanent Antarctic research stations, conducted multidisciplinary research across all major domains of polar science, and contributed significantly to international climate change understanding. We review key scientific discoveries, technological achievements, and outline the strategic vision for India's polar science for the next decade.",
            "source": "NCPOR",
            "status": ContentStatus.APPROVED,
            "last_verified_at": datetime.utcnow(),
        },
        {
            "title": "NCPOR Annual Report 2023-24",
            "description": "Official annual report of the National Centre for Polar and Ocean Research covering all activities, research programs, expeditions, and institutional developments.",
            "document_type": DocumentType.TECHNICAL_REPORT,
            "year": 2024,
            "region": Region.BOTH,
            "authors": ["NCPOR"],
            "research_domains": ["Climate Science", "Oceanography", "Glaciology", "Atmospheric Science"],
            "keywords": ["annual report", "NCPOR", "polar research", "2023-24"],
            "abstract": "The NCPOR Annual Report 2023-24 presents a comprehensive overview of research activities, expedition achievements, institutional developments, and international collaborations. The year saw significant progress in deep ocean research, continued Arctic monitoring, preparations for the 44th Antarctic expedition, and enhanced public outreach activities.",
            "source": "NCPOR",
            "source_url": "https://www.ncpor.res.in/annual-reports",
            "status": ContentStatus.APPROVED,
            "last_verified_at": datetime.utcnow(),
        },
        {
            "title": "Polar Vortex Dynamics and Indian Monsoon Connections",
            "description": "Analysis of teleconnection pathways between Antarctic polar vortex variability and Indian monsoon rainfall patterns.",
            "document_type": DocumentType.RESEARCH_PAPER,
            "year": 2023,
            "region": Region.BOTH,
            "authors": ["Dr. J. S. Chowdary", "T. Rama Krishna", "A. Singh"],
            "research_domains": ["Atmospheric Science", "Climate Science"],
            "keywords": ["polar vortex", "Indian monsoon", "teleconnection", "climate variability", "stratosphere"],
            "abstract": "This study investigates the dynamic and thermodynamic pathways linking Antarctic polar vortex variability to the Indian Summer Monsoon. Using a combination of reanalysis data and NCPOR atmospheric observations, we identify a robust statistical relationship wherein weakening of the polar vortex in austral winter precedes above-normal monsoon rainfall in peninsular India by 6-8 months, with implications for seasonal climate prediction.",
            "source": "NCPOR",
            "expedition_id": exp43.id,
            "status": ContentStatus.APPROVED,
            "last_verified_at": datetime.utcnow(),
        },
        {
            "title": "Deep Ocean Research: Abyssal Plain Studies in the Indian Ocean",
            "description": "Investigation of biological, chemical, and geological properties of the Indian Ocean abyssal plains using deep-sea sampling techniques.",
            "document_type": DocumentType.RESEARCH_PAPER,
            "year": 2024,
            "region": Region.OTHER,
            "authors": ["Dr. Sridhar D.", "K. Bhattacharya", "R. Wafar"],
            "research_domains": ["Oceanography", "Biology", "Geology"],
            "keywords": ["deep ocean", "abyssal plain", "Indian Ocean", "benthic biodiversity", "manganese nodules"],
            "abstract": "We report on systematic investigation of Indian Ocean abyssal plains between 4000-6000m depth, revealing diverse microbial communities, unusual mineral formations, and potential deep-sea mining target areas. Environmental baseline assessments conducted ensure India's readiness for responsible deep-ocean research and resource assessment.",
            "source": "NCPOR",
            "status": ContentStatus.APPROVED,
            "last_verified_at": datetime.utcnow(),
        },
    ]
    
    docs = []
    ai_service = get_ai_service()
    
    for i, data in enumerate(docs_data):
        doc = Document(**data)
        db.add(doc)
        db.flush()
        
        # Create sample chunks for RAG
        chunk_texts = [
            data["abstract"],
            f"Title: {data['title']}\nAuthors: {', '.join(data['authors'])}\nYear: {data['year']}\nRegion: {data['region'].value}\nResearch Domains: {', '.join(data['research_domains'])}",
            f"Keywords: {', '.join(data['keywords'])}\nSource: {data['source']}\nDocument Type: {data['document_type'].value}",
        ]
        
        for j, chunk_text in enumerate(chunk_texts):
            embedding = ai_service.get_embedding(chunk_text)
            chunk = DocumentChunk(
                document_id=doc.id,
                chunk_index=j,
                page_number=j + 1,
                chunk_text=chunk_text,
                embedding=embedding,
            )
            db.add(chunk)
        
        docs.append(doc)
        logger.info(f"Seeded document {i+1}/{len(docs_data)}: {data['title'][:60]}")
    
    db.flush()
    logger.info(f"Seeded {len(docs)} documents with embeddings")
    return docs


def seed_datasets(db, expeditions, stations):
    logger.info("Seeding datasets...")
    
    existing = db.query(Dataset).first()
    if existing:
        return
    
    exp44 = next((e for e in expeditions if e.number == 44), expeditions[-1])
    maitri = next((s for s in stations if s.code == "MAITRI"), None)
    bharati = next((s for s in stations if s.code == "BHARATI"), None)
    himadri = next((s for s in stations if s.code == "HIMADRI"), None)
    
    datasets = [
        Dataset(
            title="Southern Ocean Temperature and Salinity Profiles 2024",
            description="Comprehensive CTD (Conductivity, Temperature, Depth) profiles collected during the 44th Indian Antarctic Expedition along the Indian Ocean sector of the Southern Ocean.",
            publisher="NCPOR",
            year=2024,
            region=Region.ANTARCTICA,
            research_domains=["Oceanography", "Climate Science"],
            variables=["Temperature", "Salinity", "Pressure", "Dissolved Oxygen", "Fluorescence"],
            units=["°C", "PSU", "dbar", "mL/L", "mg/m³"],
            record_count=15420,
            file_format="NetCDF",
            source="NCPOR",
            source_url="https://www.ncpor.res.in/datasets/ctd-2024",
            expedition_id=exp44.id,
            station_id=bharati.id if bharati else None,
            status=ContentStatus.APPROVED,
        ),
        Dataset(
            title="Antarctic Meteorological Observations - Maitri Station 2023-24",
            description="Year-round meteorological data from Maitri Research Station including temperature, wind speed, humidity, precipitation, and atmospheric pressure.",
            publisher="NCPOR",
            year=2024,
            region=Region.ANTARCTICA,
            research_domains=["Atmospheric Science", "Climate Science"],
            variables=["Air Temperature", "Wind Speed", "Wind Direction", "Relative Humidity", "Atmospheric Pressure", "Snowfall"],
            units=["°C", "m/s", "degrees", "%", "hPa", "mm"],
            record_count=525960,
            file_format="CSV",
            source="NCPOR",
            expedition_id=exp44.id,
            station_id=maitri.id if maitri else None,
            status=ContentStatus.APPROVED,
        ),
        Dataset(
            title="Schirmacher Oasis Glacier Mass Balance Data 2018-2024",
            description="Six-year time series of glacier mass balance measurements in the Schirmacher Oasis, including GPS survey data, stake network measurements, and snow density profiles.",
            publisher="NCPOR",
            year=2024,
            region=Region.ANTARCTICA,
            research_domains=["Glaciology"],
            variables=["Surface Elevation", "Mass Balance", "Snow Density", "Ice Velocity", "Accumulation Rate"],
            units=["m", "m w.e.", "kg/m³", "m/yr", "m w.e./yr"],
            record_count=8760,
            file_format="CSV",
            source="NCPOR",
            station_id=maitri.id if maitri else None,
            status=ContentStatus.APPROVED,
        ),
        Dataset(
            title="Arctic Sea Ice Extent and Concentration - Himadri Monitoring 2024",
            description="Sea ice extent and concentration data derived from satellite observations and in-situ measurements near Svalbard, contributed by NCPOR's Himadri station.",
            publisher="NCPOR",
            year=2024,
            region=Region.ARCTIC,
            research_domains=["Climate Science", "Glaciology"],
            variables=["Sea Ice Extent", "Ice Concentration", "Ice Thickness", "Surface Temperature"],
            units=["km²", "%", "m", "°C"],
            record_count=36500,
            file_format="NetCDF",
            source="NCPOR",
            station_id=himadri.id if himadri else None,
            status=ContentStatus.APPROVED,
        ),
        Dataset(
            title="Antarctic Marine Biodiversity: Prydz Bay Benthic Survey 2024",
            description="Comprehensive benthic biodiversity data from ROV surveys in Prydz Bay, including species identifications, abundance counts, and habitat classifications.",
            publisher="NCPOR",
            year=2024,
            region=Region.ANTARCTICA,
            research_domains=["Biology", "Oceanography"],
            variables=["Species ID", "Abundance", "Depth", "Substrate Type", "Temperature", "Salinity"],
            units=["count", "ind/m²", "m", "categorical", "°C", "PSU"],
            record_count=12500,
            file_format="CSV",
            source="NCPOR",
            expedition_id=exp44.id,
            station_id=bharati.id if bharati else None,
            status=ContentStatus.APPROVED,
        ),
    ]
    
    for ds in datasets:
        db.add(ds)
    db.flush()
    logger.info(f"Seeded {len(datasets)} datasets")


def seed_media(db, expeditions, stations):
    logger.info("Seeding media...")
    
    existing = db.query(Media).first()
    if existing:
        return
    
    exp44 = next((e for e in expeditions if e.number == 44), expeditions[-1])
    maitri = next((s for s in stations if s.code == "MAITRI"), None)
    bharati = next((s for s in stations if s.code == "BHARATI"), None)
    himadri = next((s for s in stations if s.code == "HIMADRI"), None)
    
    # Use verified local polar imagery
    media_items = [
        Media(title="Bharati Research Station at Larsemann Hills", description="Aerial view of India's Bharati station, East Antarctica", media_type=MediaType.IMAGE, file_url="/images/bharati-station.jpg", thumbnail_url="/images/bharati-station.jpg", region=Region.ANTARCTICA, year=2024, credit="NCPOR", expedition_id=exp44.id, station_id=bharati.id if bharati else None, tags=["Bharati", "station", "Antarctica", "aerial"], status=ContentStatus.APPROVED),
        Media(title="Southern Ocean Expedition Ship", description="Research vessel navigating through Southern Ocean ice", media_type=MediaType.IMAGE, file_url="/images/polar-hero-bg.jpg", thumbnail_url="/images/polar-hero-bg.jpg", region=Region.ANTARCTICA, year=2024, credit="NCPOR", expedition_id=exp44.id, tags=["ship", "Southern Ocean", "expedition"], status=ContentStatus.APPROVED),
        Media(title="Antarctic Ice Shelf & Bharati Station", description="Towering ice cliffs of the Antarctic ice sheet in Larsemann Hills", media_type=MediaType.IMAGE, file_url="/images/bharati-station.jpg", thumbnail_url="/images/bharati-station.jpg", region=Region.ANTARCTICA, year=2024, tags=["ice shelf", "Antarctica", "glacier"], status=ContentStatus.APPROVED),
        Media(title="Arctic Glacier - Himadri Vicinity", description="Glacial landscape near Himadri station, Svalbard", media_type=MediaType.IMAGE, file_url="/images/himadri-arctic.jpg", thumbnail_url="/images/himadri-arctic.jpg", region=Region.ARCTIC, year=2024, station_id=himadri.id if himadri else None, tags=["Arctic", "glacier", "Svalbard", "Himadri"], status=ContentStatus.APPROVED),
        Media(title="Himadri Research Station Ny-Ålesund", description="India's Arctic research facility in Svalbard", media_type=MediaType.IMAGE, file_url="/images/himadri-arctic.jpg", thumbnail_url="/images/himadri-arctic.jpg", region=Region.ARCTIC, year=2024, tags=["Himadri", "Arctic", "Svalbard"], status=ContentStatus.APPROVED),
        Media(title="Maitri Station Winter Operations", description="Maitri Research Station during Antarctic winter observations", media_type=MediaType.IMAGE, file_url="/images/polar-hero-bg.jpg", thumbnail_url="/images/polar-hero-bg.jpg", region=Region.ANTARCTICA, year=2024, station_id=maitri.id if maitri else None, tags=["Maitri", "winter", "station"], status=ContentStatus.APPROVED),
        Media(title="Oceanographic CTD Deployment", description="Scientists deploying oceanographic sensors from research vessel", media_type=MediaType.IMAGE, file_url="/images/polar-hero-bg.jpg", thumbnail_url="/images/polar-hero-bg.jpg", region=Region.ANTARCTICA, year=2024, expedition_id=exp44.id, tags=["CTD", "oceanography", "instrument", "research"], status=ContentStatus.APPROVED),
        Media(title="Aurora Australis Over Indian Antarctic Station", description="Southern lights illuminating Antarctic skies above station pods", media_type=MediaType.IMAGE, file_url="/images/polar-hero-bg.jpg", thumbnail_url="/images/polar-hero-bg.jpg", region=Region.ANTARCTICA, year=2024, tags=["aurora australis", "southern lights", "night sky"], status=ContentStatus.APPROVED),
        Media(title="Glaciological Survey at Larsemann Hills", description="Field survey of ice mass balance and permafrost dynamics", media_type=MediaType.IMAGE, file_url="/images/bharati-station.jpg", thumbnail_url="/images/bharati-station.jpg", region=Region.ANTARCTICA, year=2024, expedition_id=exp44.id, tags=["ice core", "glaciology", "climate"], status=ContentStatus.APPROVED),
        Media(title="Polar Science Documentary - NCPOR 44th Expedition", description="Documentary footage of India's 44th Antarctic Expedition", media_type=MediaType.VIDEO, file_url="https://www.w3schools.com/html/mov_bbb.mp4", thumbnail_url="/images/bharati-station.jpg", duration_seconds=1847, region=Region.ANTARCTICA, year=2025, expedition_id=exp44.id, tags=["documentary", "expedition", "science", "NCPOR"], status=ContentStatus.APPROVED),
    ]
    
    for m in media_items:
        db.add(m)
    db.flush()
    logger.info(f"Seeded {len(media_items)} media items")


def seed_topics_and_quizzes(db):
    logger.info("Seeding educational topics...")
    
    existing = db.query(Topic).first()
    if existing:
        return
    
    topics_data = [
        {
            "slug": "climate-change",
            "title": "Climate Change & the Poles",
            "subtitle": "Understanding how polar regions drive global climate",
            "category": "climate",
            "hero_image_url": "/images/bharati-station.jpg",
            "reading_time_minutes": 8,
            "order_index": 1,
            "content": """## Why the Poles Matter for Climate

The Arctic and Antarctic are Earth's natural air conditioners. They regulate global temperatures by reflecting sunlight (albedo effect) and driving ocean circulation patterns.

### The Polar Amplification Effect
Climate change is happening 3-4 times faster in the Arctic than the global average—a phenomenon called **polar amplification**. This is because:
- Loss of reflective sea ice exposes dark ocean water that absorbs more heat
- Permafrost thaw releases methane and CO₂
- Changes in atmospheric circulation bring warm air masses northward

### What Indian Scientists Are Discovering
NCPOR researchers monitoring Svalbard from Himadri station have recorded temperature increases of 2.1°C above the 1980-2010 baseline. Ice core samples from Antarctic expeditions provide 800,000-year climate records, showing current CO₂ levels are unprecedented in this timeframe.

### The Ocean Connection
Polar oceans absorb 30% of human CO₂ emissions and 90% of excess heat. Changes in Southern Ocean circulation directly affect the Indian Ocean monsoon system—meaning what happens in Antarctica affects Indian agriculture.""",
            "quizzes": [
                {"question": "What is 'polar amplification'?", "options": ["Polar amplification is when sound travels faster in polar regions", "Polar amplification refers to climate change occurring faster in polar regions than the global average", "It is a term for the aurora borealis phenomenon", "None of the above"], "correct_answer_index": 1, "explanation": "Polar amplification describes the phenomenon where climate change occurs 3-4 times faster in polar regions compared to the global average, primarily due to ice-albedo feedback."},
                {"question": "What percentage of human CO₂ emissions do polar oceans absorb?", "options": ["10%", "20%", "30%", "50%"], "correct_answer_index": 2, "explanation": "Polar and sub-polar oceans absorb approximately 30% of human CO₂ emissions, making them critical carbon sinks."},
                {"question": "India's Himadri station is located in which polar region?", "options": ["Antarctica", "Arctic (Svalbard)", "Greenland", "Iceland"], "correct_answer_index": 1, "explanation": "Himadri is India's Arctic research station, located at Ny-Ålesund, Svalbard, Norway, established in 2008."},
            ]
        },
        {
            "slug": "glaciers",
            "title": "Glaciers & Ice Sheets",
            "subtitle": "The frozen archives of Earth's past climate",
            "category": "glaciology",
            "hero_image_url": "/images/himadri-arctic.jpg",
            "reading_time_minutes": 7,
            "order_index": 2,
            "content": """## What Are Glaciers?

Glaciers are massive bodies of ice formed from compacted snow over thousands of years. They cover about 10% of Earth's land surface and contain 69% of the world's fresh water.

### Antarctic Ice Sheet
The Antarctic Ice Sheet is the world's largest, covering 14 million km²—larger than the US and Mexico combined. It holds enough ice to raise global sea levels by 58 meters if fully melted.

### How Scientists Study Glaciers
NCPOR scientists use:
- **GPS surveys** to track glacier movement (some Antarctic glaciers move 1-10 meters per day!)
- **Ice cores** - drilling cylinders of ice that trap ancient air bubbles, recording climate history
- **Ground-Penetrating Radar (GPR)** to see what's hidden beneath the ice
- **Satellite remote sensing** to track changes over large areas

### India's Glacier Research
The 44th Indian Antarctic Expedition measured glacial retreat rates in the Schirmacher Oasis, finding accelerating mass loss of -0.23 ± 0.05 m/year in surface elevation. This contributes to global sea level rise projections.""",
            "quizzes": [
                {"question": "What percentage of Earth's land surface is covered by glaciers?", "options": ["5%", "10%", "20%", "30%"], "correct_answer_index": 1, "explanation": "Glaciers cover approximately 10% of Earth's land surface, primarily in Antarctica and Greenland."},
                {"question": "Ice core samples can provide climate records going back how far?", "options": ["10,000 years", "100,000 years", "800,000 years", "1 million years"], "correct_answer_index": 2, "explanation": "Antarctic ice cores provide climate records up to 800,000 years, capturing ancient air bubbles that tell us about past CO₂ levels and temperatures."},
                {"question": "If the entire Antarctic Ice Sheet melted, sea levels would rise by approximately:", "options": ["1 meter", "10 meters", "58 meters", "200 meters"], "correct_answer_index": 2, "explanation": "The Antarctic Ice Sheet contains enough ice to raise global sea levels by approximately 58 meters if completely melted."},
            ]
        },
        {
            "slug": "polar-oceans",
            "title": "Polar Oceans",
            "subtitle": "The Southern and Arctic Oceans that drive Earth's climate engine",
            "category": "oceanography",
            "hero_image_url": "/images/polar-hero-bg.jpg",
            "reading_time_minutes": 6,
            "order_index": 3,
            "content": """## The Southern Ocean: Earth's Climate Engine

The Southern Ocean surrounds Antarctica and drives global ocean circulation. It is the only ocean that flows completely around the globe without being blocked by land.

### Global Ocean Conveyor Belt
Cold, dense water sinks to the bottom of the Southern Ocean and flows northward into the Atlantic, Pacific, and Indian Oceans. This **thermohaline circulation** (THC) acts like a giant conveyor belt, redistributing heat and nutrients globally.

### What NCPOR Discovers in Southern Ocean
During the 44th expedition, Indian scientists deployed CTD (Conductivity, Temperature, Depth) instruments to measure ocean properties. Key findings:
- Warm Circumpolar Deep Water (CDW) is intruding beneath ice shelves at alarming rates
- Bottom water warming of 15% compared to the previous decade
- Changes in the biological productivity affecting the food chain

### Importance for India
Southern Ocean changes directly affect the Indian Ocean Dipole and Indian Summer Monsoon. Research at NCPOR helps improve monsoon predictions, which are critical for Indian agriculture and water security.""",
            "quizzes": [
                {"question": "What instrument do oceanographers use to measure sea temperature, salinity, and depth?", "options": ["Sonar", "CTD (Conductivity, Temperature, Depth)", "GPS buoy", "Doppler radar"], "correct_answer_index": 1, "explanation": "CTD (Conductivity, Temperature, Depth) profilers are the primary instruments used to measure fundamental ocean properties."},
                {"question": "What is Thermohaline Circulation?", "options": ["Ocean tides driven by the moon", "Global ocean circulation driven by temperature and salinity differences", "Surface currents driven by wind", "Tidal currents near coastlines"], "correct_answer_index": 1, "explanation": "Thermohaline circulation is the deep ocean circulation pattern driven by differences in water temperature (thermo) and salinity (haline), acting as a global conveyor belt."},
                {"question": "How much excess heat from climate change do polar oceans absorb?", "options": ["30%", "60%", "90%", "100%"], "correct_answer_index": 2, "explanation": "Polar oceans absorb approximately 90% of the excess heat trapped by greenhouse gases, playing a crucial role in moderating global warming."},
            ]
        },
        {
            "slug": "polar-expeditions",
            "title": "Indian Polar Expeditions",
            "subtitle": "India's 44-year journey of discovery at the poles",
            "category": "expeditions",
            "hero_image_url": "/images/bharati-station.jpg",
            "reading_time_minutes": 10,
            "order_index": 4,
            "content": """## India's Antarctic Journey

India launched its first Antarctic expedition in 1981 under the leadership of Dr. Syed Zahoor Qasim. Since then, 44 expeditions have been completed, making India one of the world's leading polar research nations.

### Milestones
- **1981**: First Indian Antarctic Expedition; 21 scientists
- **1982**: India establishes **Dakshin Gangotri** (first station)
- **1983**: India joins the Antarctic Treaty as a Consultative Party
- **1988**: **Maitri Station** established at Schirmacher Oasis (still operational)
- **2008**: **Himadri Station** established in the Arctic (Svalbard)
- **2012**: **Bharati Station** inaugurated at Larsemann Hills
- **2024**: 44th expedition—largest and most scientifically comprehensive

### How Expeditions Work
Each expedition involves:
1. Six months of preparation and planning
2. Journey by ship from Goa (3-4 weeks each way)
3. 3-4 months of field research
4. Data collection, sample preservation, and transmission
5. Return and year-long analysis phase

### The 44th Expedition
India's 44th expedition (2024-25) deployed 58 scientists and support staff. Key achievements include new species discoveries in Prydz Bay, advanced oceanographic measurements, and groundbreaking atmospheric chemistry data.""",
            "quizzes": [
                {"question": "In which year did India launch its first Antarctic expedition?", "options": ["1972", "1981", "1984", "1991"], "correct_answer_index": 1, "explanation": "India's first Antarctic expedition was launched in 1981, led by Dr. Syed Zahoor Qasim."},
                {"question": "Which is India's newest Antarctic research station?", "options": ["Dakshin Gangotri", "Maitri", "Bharati", "Himadri"], "correct_answer_index": 2, "explanation": "Bharati, inaugurated in 2012 at Larsemann Hills, East Antarctica, is India's newest and most modern Antarctic research station."},
                {"question": "How many scientists were part of the 44th Indian Antarctic Expedition?", "options": ["21", "43", "58", "100"], "correct_answer_index": 2, "explanation": "The 44th Indian Antarctic Expedition deployed 58 scientists and support staff, making it one of India's largest polar research missions."},
                {"question": "India's Himadri station is dedicated to studying which region?", "options": ["Antarctica", "Arctic", "Southern Ocean", "Himalayas"], "correct_answer_index": 1, "explanation": "Himadri is India's Arctic research station located at Ny-Ålesund, Svalbard, focused on Arctic climate, glaciology, and atmospheric science."},
            ]
        },
        {
            "slug": "atmospheric-science",
            "title": "Atmospheric Science at the Poles",
            "subtitle": "Understanding the atmosphere from the ends of the Earth",
            "category": "atmospheric",
            "hero_image_url": "/images/polar-hero-bg.jpg",
            "reading_time_minutes": 7,
            "order_index": 5,
            "content": """## The Polar Atmosphere

Polar regions offer unique opportunities to study Earth's atmosphere in its most pristine state, far from industrial pollution. The clarity of polar skies allows scientists to detect trace gases and atmospheric changes with extraordinary precision.

### The Ozone Layer
Antarctica is famous for the ozone hole—seasonal depletion of the protective ozone layer over the continent due to chlorofluorocarbons (CFCs). NCPOR continuously monitors ozone levels from Maitri and Bharati stations.

### Good News: Recovery
Due to the 1987 Montreal Protocol banning CFCs, the ozone layer is recovering. NCPOR data shows gradual improvement in ozone column thickness over Antarctica—one of humanity's greatest environmental success stories.

### Aurora Australis
The Southern Lights (Aurora Australis) occur when solar wind particles interact with Earth's magnetic field. NCPOR scientists study this phenomenon to understand space weather and its effects on satellites and communications.

### What India Measures
- Greenhouse gas concentrations (CO₂, CH₄, N₂O)
- Ozone column and profiles
- Black carbon aerosols from biomass burning
- Atmospheric trace gases
- UV radiation levels""",
            "quizzes": [
                {"question": "What causes the Antarctic ozone hole?", "options": ["UV radiation from the sun", "Chlorofluorocarbons (CFCs) breaking down ozone", "Volcanic eruptions", "Industrial pollution in Antarctica"], "correct_answer_index": 1, "explanation": "The Antarctic ozone hole is caused by chlorofluorocarbons (CFCs) and halons that break down ozone molecules in the stratosphere."},
                {"question": "What international agreement helped begin ozone layer recovery?", "options": ["Paris Agreement (1995)", "Kyoto Protocol (1997)", "Montreal Protocol (1987)", "Stockholm Convention (2001)"], "correct_answer_index": 2, "explanation": "The Montreal Protocol of 1987 successfully banned ozone-depleting substances like CFCs and is considered one of the most successful environmental agreements."},
                {"question": "What is the Aurora Australis?", "options": ["A cold Antarctic wind", "Southern Lights caused by solar particles hitting Earth's atmosphere", "A type of polar cloud", "An Antarctic research program"], "correct_answer_index": 1, "explanation": "Aurora Australis (Southern Lights) is the natural light display in Earth's sky near the South Pole, caused by solar wind particles interacting with Earth's magnetosphere."},
            ]
        },
    ]
    
    topics = []
    for topic_data in topics_data:
        quiz_data = topic_data.pop("quizzes", [])
        topic = Topic(**topic_data)
        db.add(topic)
        db.flush()
        
        for j, q in enumerate(quiz_data):
            question = QuizQuestion(
                topic_id=topic.id,
                question=q["question"],
                options=q["options"],
                correct_answer_index=q["correct_answer_index"],
                explanation=q["explanation"],
                order_index=j,
            )
            db.add(question)
        
        topics.append(topic)
    
    db.flush()
    logger.info(f"Seeded {len(topics)} topics with quizzes")


def seed_generated_content(db, documents, expeditions):
    logger.info("Seeding generated content examples...")
    
    existing = db.query(GeneratedContent).first()
    if existing:
        return
    
    exp44 = next((e for e in expeditions if e.number == 44), expeditions[-1] if expeditions else None)
    doc = documents[0] if documents else None
    
    content_items = [
        GeneratedContent(
            content_type="summary",
            title="Scientific Summary - 44th Indian Antarctic Expedition Report",
            content="""The 44th Indian Antarctic Expedition (2024-25) represents India's most comprehensive polar research mission to date. Conducted across Maitri and Bharati research stations, the expedition deployed 58 scientists and support staff for 136 days. Key scientific achievements include: measurement of 15% increase in bottom water warming compared to the previous decade, discovery of 12 potentially new marine species in Prydz Bay, comprehensive atmospheric chemistry data revealing continued ozone layer recovery, and groundbreaking ice dynamics measurements showing accelerated glacial retreat in the Schirmacher Oasis. The Southern Ocean heat flux measurements contribute critical data to global climate models, while novel biodiversity findings expand our understanding of Antarctic ecosystem resilience under changing climate conditions.""",
            source_document_id=doc.id if doc else None,
            source_expedition_id=exp44.id if exp44 else None,
            source_description="44th Indian Antarctic Expedition Report",
            status=ContentStatus.APPROVED,
            generated_by="gemini-1.5-flash",
        ),
        GeneratedContent(
            content_type="linkedin",
            title="LinkedIn Post - 44th Indian Antarctic Expedition",
            content="""🧊 Exciting milestone for India's polar science program!

India's 44th Antarctic Expedition has returned with groundbreaking discoveries that will shape our understanding of climate change and marine biodiversity.

Key achievements from 58 Indian scientists who spent 136 days in the world's most extreme environment:

🌊 Southern Ocean: 15% warming increase in bottom waters—critical data for global climate models
🦠 Marine Biology: 12 potentially NEW species discovered in Prydz Bay
📊 Glaciology: Comprehensive ice dynamics data from Schirmacher Oasis
🌍 Atmosphere: Continued ozone layer recovery confirmed from Maitri and Bharati stations

This research directly impacts India's monsoon prediction capabilities and our understanding of sea-level rise projections.

Proud of the NCPOR team and India's growing leadership in polar science! 🇮🇳❄️

#PolarScience #Antarctica #India #ClimateChange #NCPOR #MarineBiology #Science #Research""",
            source_expedition_id=exp44.id if exp44 else None,
            source_description="44th Indian Antarctic Expedition",
            status=ContentStatus.DRAFT,
            generated_by="gemini-1.5-flash",
        ),
        GeneratedContent(
            content_type="student",
            title="Student Explanation - What Happens in Antarctica?",
            content="""# What Do Indian Scientists Do in Antarctica?

Imagine going to the coldest, windiest, most remote place on Earth for scientific research! That's exactly what India's polar scientists do every year.

## Why Antarctica?
Antarctica is like Earth's freezer. It stores 70% of the world's fresh water in ice, and scientists use it as a natural laboratory to understand climate change, ocean currents, and even space weather.

## India's Research Stations
India has **two research stations** in Antarctica:
1. **Maitri** (since 1988) - Like a small town in the middle of icy mountains
2. **Bharati** (since 2012) - A modern facility on the coast with ocean access

## What Scientists Actually Do
- **Drill ice cores** that are like time machines—trapped air bubbles tell us about Earth's climate 800,000 years ago!
- **Lower instruments into the ocean** to measure temperature and find new sea creatures
- **Track weather** in real-time to help predict India's monsoon
- **Count and study penguins** and other wildlife to understand ecosystem health

## Cool Fact
In the 44th expedition, scientists discovered 12 possibly NEW species of tiny sea creatures! These animals live in some of the harshest conditions on Earth.

## How Does This Help India?
The Southern Ocean affects India's monsoon. Understanding what's happening there helps scientists predict rainfall patterns, which matters for farmers across India. 🌾🌧️""",
            source_expedition_id=exp44.id if exp44 else None,
            source_description="44th Indian Antarctic Expedition",
            status=ContentStatus.APPROVED,
            generated_by="gemini-1.5-flash",
        ),
    ]
    
    for c in content_items:
        db.add(c)
    db.flush()
    logger.info(f"Seeded {len(content_items)} generated content examples")


if __name__ == "__main__":
    seed_all()
