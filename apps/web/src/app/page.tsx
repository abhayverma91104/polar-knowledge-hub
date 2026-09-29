'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Search, MessageSquare, Database, FileText,
  Globe, Zap, BookOpen, Map, ChevronRight, Snowflake,
  Wind, FlaskConical, Satellite, Mountain, Users, Award,
  Sparkles, Compass, Shield, CheckCircle2, ArrowUpRight,
  TrendingUp, Radio
} from 'lucide-react';
import { statsApi, expeditionsApi } from '@/lib/api';

interface Stats {
  documents: number;
  datasets: number;
  images: number;
  videos: number;
  expeditions: number;
  stations: number;
}

interface Expedition {
  id: string;
  number: number;
  title: string;
  year: number;
  region: string;
  duration_days: number;
  research_domains: string[];
  chief_scientist: string;
  description: string;
  document_count?: number;
  dataset_count?: number;
  media_count?: number;
  stations?: Array<{ name: string }>;
}

const POLAR_GATEWAYS = [
  {
    title: 'Antarctica',
    badge: '14,000,000 km²',
    subtitle: 'Maitri (1989) & Bharati (2012)',
    description: 'Continuous Indian presence since 1981 in East Antarctica, focusing on paleoclimate, glaciology, and space weather.',
    href: '/explore?region=antarctica',
    icon: Mountain,
    color: 'from-sky-950/90 via-slate-900/80 to-transparent',
    accent: 'text-cyan-300',
    border: 'border-cyan-500/30',
    image: '/images/bharati-station.jpg',
    stat: '-89.2°C Min Temp',
  },
  {
    title: 'Arctic Realm',
    badge: '78°55′ N · Ny-Ålesund',
    subtitle: 'Himadri Station & IndARC Mooring',
    description: 'High Arctic research in Svalbard studying fjord dynamics, atmospheric teleconnections with the Indian Monsoon, and Arctic warming.',
    href: '/explore?region=arctic',
    icon: Wind,
    color: 'from-teal-950/90 via-slate-900/80 to-transparent',
    accent: 'text-teal-300',
    border: 'border-teal-500/30',
    image: '/images/himadri-arctic.jpg',
    stat: 'Midnight Sun (120 Days)',
  },
  {
    title: '44+ Expeditions',
    badge: 'Since 1981',
    subtitle: 'Scientific Odyssey & Ocean Voyages',
    description: 'Four decades of uninterrupted scientific expeditions across Antarctica, the Arctic Ocean, and the Southern Ocean.',
    href: '/expeditions',
    icon: Compass,
    color: 'from-blue-950/90 via-slate-900/80 to-transparent',
    accent: 'text-sky-300',
    border: 'border-sky-500/30',
    image: '/images/polar-hero-bg.jpg',
    stat: '2,500+ Polar Scientists',
  },
  {
    title: 'The Third Pole',
    badge: 'Himalayas · 4,000m',
    subtitle: 'Himansh Station, Spiti Valley',
    description: 'High-altitude research facility monitoring Himalayan glaciers, river discharge, and climate change in Himachal Pradesh.',
    href: '/explore',
    icon: FlaskConical,
    color: 'from-indigo-950/90 via-slate-900/80 to-transparent',
    accent: 'text-indigo-300',
    border: 'border-indigo-500/30',
    image: '/images/bharati-station.jpg',
    stat: 'Cryosphere Monitoring',
  },
];

const PLATFORM_PILLARS = [
  {
    icon: Database,
    title: 'Unified Polar Repository',
    description: 'Search thousands of verified expedition logs, peer-reviewed publications, open datasets, and technical reports with hybrid full-text & semantic vector retrieval.',
    href: '/repository',
    tag: 'Hybrid Search',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
  {
    icon: Sparkles,
    title: 'Grounded Polar AI Assistant',
    description: 'Ask deep scientific questions. Get real-time answers synthesized with Google Gemini, strictly grounded with clickable citations to NCPOR records.',
    href: '/assistant',
    tag: 'RAG Citations',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10 border-sky-500/20',
  },
  {
    icon: Map,
    title: 'Interactive Polar Map',
    description: 'High-definition dark CartoDB polar map showing Bharati, Maitri, Himadri, and Himansh with telemetry, active research disciplines, and connected records.',
    href: '/explore',
    tag: 'Live Explorer',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10 border-teal-500/20',
  },
  {
    icon: BookOpen,
    title: 'Polar Classroom & Quizzes',
    description: 'Educational modules on ice sheets, climate proxies, and ocean currents designed for schools, universities, and self-testing enthusiasts with instant scoring.',
    href: '/classroom',
    tag: 'Smart Education',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    icon: Zap,
    title: 'Outreach Content Studio',
    description: 'Transform complex technical expedition documents into public science articles, school explainers, LinkedIn digests, X threads, and YouTube metadata.',
    href: '/content-studio',
    tag: 'One-Click AI',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: Satellite,
    title: 'Continuous Ingestion Engine',
    description: 'Automated crawler pipeline parsing NCPOR portals, extracting text from PDFs with PyMuPDF, generating dense vector embeddings, and indexing in seconds.',
    href: '/admin/ingestion',
    tag: 'Automated ETL',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
  },
];

const DEMO_AI_QUESTIONS = [
  {
    q: 'What scientific work is done at Bharati Research Station?',
    a: 'Bharati Station (69°24′S, 76°11′E) in Larsemann Hills, East Antarctica conducts year-round research in atmospheric physics, ionospheric measurements, satellite telemetry for ISRO, and lake sediment coring for paleoclimate records.',
    citation: 'Bharati Environmental Impact Assessment & Station Operations Report (2012–2024)',
  },
  {
    q: 'What is the purpose of India\'s IndARC underwater mooring?',
    a: 'IndARC is India\'s multi-sensor underwater moored observatory deployed at 192m depth in Kongsfjorden, Svalbard. It records continuous year-round Arctic ocean temperature, salinity, and biogeochemical data to understand impacts on the Indian Monsoon.',
    citation: 'IndARC Arctic Mooring Observation Dataset & Ocean Dynamics Bulletin',
  },
  {
    q: 'What was achieved during the 44th Indian Antarctic Expedition?',
    a: 'The 44th IAE deployed 58 researchers to Maitri and Bharati, recovering 200m of ice cores, taking deep-water CTD profiles in Prydz Bay, and upgrading green energy infrastructure at both stations.',
    citation: '44th IAE Scientific Dossier & MoES Annual Review 2024-25',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    documents: 1200,
    datasets: 160,
    images: 4800,
    videos: 200,
    expeditions: 44,
    stations: 3,
  });
  const [featured, setFeatured] = useState<Expedition | null>(null);
  const [heroSearchQuery, setHeroSearchQuery] = useState('');
  const [selectedDemoQ, setSelectedDemoQ] = useState(0);

  useEffect(() => {
    statsApi.getStats().then((r) => setStats(r.data)).catch(() => {});
    expeditionsApi.getFeatured().then((r) => setFeatured(r.data)).catch(() => {});
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchQuery.trim()) {
      router.push(`/repository?q=${encodeURIComponent(heroSearchQuery.trim())}`);
    } else {
      router.push('/repository');
    }
  };

  return (
    <div className="min-h-screen bg-[#060e1c] text-slate-100 overflow-x-hidden">
      
      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-[94vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
        
        {/* Real High-Res Polar Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/polar-hero-bg.jpg"
            alt="Antarctica Polar Night & Indian Research Station"
            className="w-full h-full object-cover object-center scale-105"
          />
          {/* Deep Dark Overlay & Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060e1c] via-[#060e1c]/80 to-[#060e1c]/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#060e1c]/90 via-[#060e1c]/60 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/30 via-transparent to-transparent" />
        </div>

        {/* Floating Subtle Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            
            {/* NCPOR Institutional Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-semibold mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(14,165,233,0.25)]">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span>National Centre for Polar and Ocean Research</span>
              <span className="text-cyan-500">·</span>
              <span className="text-slate-300 font-medium">MoES, Govt. of India</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.08] mb-6">
              India&apos;s Polar
              <br />
              <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-teal-300 bg-clip-text text-transparent">
                Knowledge, Connected.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-300 text-base sm:text-lg lg:text-xl leading-relaxed mb-8 max-w-2xl font-light">
              Access 44+ polar expeditions, research stations (Bharati, Maitri, Himadri), 1,200+ scientific publications, open datasets, and educational media — powered by AI discovery.
            </p>

            {/* Embedded Live Search Box */}
            <form onSubmit={handleHeroSearch} className="mb-6">
              <div className="relative flex items-center max-w-2xl rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-[0_10px_35px_rgba(0,0,0,0.6)] backdrop-blur-xl p-2 transition-all focus-within:border-cyan-400 focus-within:shadow-[0_0_25px_rgba(14,165,233,0.4)]">
                <Search className="w-5 h-5 text-cyan-400 ml-3 shrink-0" />
                <input
                  type="text"
                  value={heroSearchQuery}
                  onChange={(e) => setHeroSearchQuery(e.target.value)}
                  placeholder="Search 44+ expeditions, Bharati/Maitri logs, ice core datasets, papers..."
                  className="w-full bg-transparent px-3 py-2.5 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-md transition-all hover:shadow-[0_0_20px_rgba(14,165,233,0.5)]"
                >
                  <span>Search</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>

            {/* Quick Filter Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
                Trending:
              </span>
              {[
                '44th Expedition',
                'Bharati Station',
                'Larsemann Hills',
                'Himadri Arctic',
                'IndARC Mooring',
                'Glaciology Data',
              ].map((tag) => (
                <Link
                  key={tag}
                  href={`/repository?q=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 rounded-full bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-xs font-medium text-slate-300 hover:text-cyan-200 transition-all"
                >
                  {tag}
                </Link>
              ))}
            </div>

            {/* Dual CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/explore"
                className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(14,165,233,0.4)] hover:shadow-[0_0_35px_rgba(14,165,233,0.7)] transition-all transform hover:-translate-y-0.5"
              >
                <Compass size={17} />
                <span>Explore Interactive Map</span>
              </Link>
              <Link
                href="/assistant"
                className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-cyan-400 rounded-xl font-bold text-sm backdrop-blur-md transition-all shadow-lg"
              >
                <Sparkles size={16} className="text-cyan-400" />
                <span>Launch Polar AI Assistant</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ─── POLAR GATEWAYS / FRONTIERS ─── */}
      <section className="relative z-20 -mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {POLAR_GATEWAYS.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="group relative h-80 rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-500/50 shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-end p-5"
              >
                {/* Background Image */}
                <img
                  src={card.image}
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Gradient Scrim */}
                <div className={`absolute inset-0 bg-gradient-to-t ${card.color}`} />
                <div className="absolute inset-0 bg-[#060e1c]/40 group-hover:bg-[#060e1c]/20 transition-colors" />

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 backdrop-blur-md">
                      {card.badge}
                    </span>
                    <Icon size={20} className={card.accent} />
                  </div>

                  <h3 className="font-display font-bold text-2xl text-white group-hover:text-cyan-200 transition-colors mb-1">
                    {card.title}
                  </h3>

                  <div className={`text-xs font-semibold mb-2 ${card.accent}`}>
                    {card.subtitle}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-3 font-light">
                    {card.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                    <span>{card.stat}</span>
                    <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── LIVE INSTITUTIONAL METRICS ─── */}
      <section className="py-12 border-y border-white/10 bg-[#071324]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            {[
              { label: 'Indian Expeditions', value: '44+', desc: 'Since 1981', icon: Compass },
              { label: 'Active Polar Stations', value: '3', desc: 'Maitri · Bharati · Himadri', icon: Mountain },
              { label: 'Scientific Papers', value: '1,200+', desc: 'Peer-reviewed records', icon: FileText },
              { label: 'Open Datasets', value: '160+', desc: 'Cryosphere & Ocean', icon: Database },
              { label: 'Expedition Media', value: '5,000+', desc: 'Field photos & videos', icon: Globe },
              { label: 'Third Pole Facility', value: 'Himansh', desc: '4,000m altitude', icon: FlaskConical },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-cyan-500/30 transition-all">
                  <Icon size={18} className="text-cyan-400 mx-auto mb-2 opacity-80" />
                  <div className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                    {item.value}
                  </div>
                  <div className="text-xs font-bold text-cyan-300 mt-1">{item.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FEATURED EXPEDITION DOSSIER ─── */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0a1b32] via-[#071324] to-[#040a14] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              
              {/* Left Column: Details */}
              <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-6">
                    <Award size={14} />
                    <span>Featured Indian Antarctic Expedition</span>
                  </div>

                  <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-4 leading-tight">
                    44th Indian Scientific Expedition to Antarctica (ISEA)
                  </h2>

                  <p className="text-slate-300 text-base leading-relaxed mb-8 font-light">
                    Commissioned in late 2024 by the Ministry of Earth Sciences, the 44th expedition deployed multidisciplinary teams to Bharati (Larsemann Hills) and Maitri (Schirmacher Oasis) to conduct deep ice coring, Southern Ocean biogeochemical surveys, and renewable microgrid commissioning.
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                    {[
                      { label: 'Year', val: '2024–25' },
                      { label: 'Region', val: 'East Antarctica' },
                      { label: 'Duration', val: '120 Days' },
                      { label: 'Team Size', val: '58 Scientists' },
                    ].map((st) => (
                      <div key={st.label} className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          {st.label}
                        </div>
                        <div className="font-bold text-base text-white mt-0.5">
                          {st.val}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Scientific Domains */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {[
                      'Glaciology & Ice Dynamics',
                      'Southern Ocean CTD',
                      'Benthic Marine Biology',
                      'Ionospheric Telemetry',
                      'Aerosol Chemistry',
                    ].map((dom) => (
                      <span
                        key={dom}
                        className="px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold"
                      >
                        {dom}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/10">
                  <Link
                    href="/expeditions"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg transition-all"
                  >
                    <span>View Expedition Records</span>
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/repository?q=44th+Antarctic+Expedition"
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-semibold text-sm transition-all"
                  >
                    <span>Download Expedition Reports</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Authentic Bharati Station Image */}
              <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-full">
                <img
                  src="/images/bharati-station.jpg"
                  alt="Bharati Antarctic Research Station in Larsemann Hills"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#071324] via-transparent to-transparent" />
                
                {/* Badge Overlay */}
                <div className="absolute bottom-6 right-6 p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-xl max-w-xs shadow-2xl">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
                    <Radio size={14} className="animate-pulse" />
                    <span>Bharati Research Station</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    Coordinates: 69°24′S, 76°11′E · Established 2012 by NCPOR
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ─── INTERACTIVE POLAR AI PREVIEW ─── */}
      <section className="py-20 bg-gradient-to-b from-[#060e1c] via-[#09182d] to-[#060e1c] border-y border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side text */}
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles size={14} />
                <span>RAG Scientific Intelligence</span>
              </div>

              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-5 leading-tight">
                Ask the Polar AI Anything About NCPOR Research
              </h2>

              <p className="text-slate-300 text-base leading-relaxed mb-8 font-light">
                Unlike generic models, Polar AI retrieves verified excerpts directly from NCPOR expedition logs, datasets, and peer-reviewed journals before synthesizing answers with Gemini 2.0.
              </p>

              <div className="space-y-3 mb-8">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Click a question to test live:
                </div>
                {DEMO_AI_QUESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedDemoQ(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                      selectedDemoQ === idx
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(14,165,233,0.2)]'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <span>{item.q}</span>
                    <ArrowRight size={14} className={selectedDemoQ === idx ? 'text-cyan-400' : 'opacity-40'} />
                  </button>
                ))}
              </div>

              <Link
                href="/assistant"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(14,165,233,0.35)] transition-all"
              >
                <Sparkles size={16} />
                <span>Open Full Polar AI Assistant</span>
              </Link>
            </div>

            {/* Right side live interactive simulation */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-cyan-500/30 bg-[#081324] shadow-2xl overflow-hidden backdrop-blur-2xl">
                
                {/* Chat Header */}
                <div className="px-5 py-4 border-b border-white/10 bg-slate-900/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_12px_rgba(14,165,233,0.5)]">
                      <Snowflake size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Polar Knowledge AI</span>
                        <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[9px] font-mono">
                          Gemini 2.0 Flash
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        NCPOR Vector RAG Pipeline Active
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-mono">Latency: 280ms</span>
                </div>

                {/* Chat Messages Body */}
                <div className="p-6 space-y-5">
                  {/* User query */}
                  <div className="flex items-start justify-end gap-3">
                    <div className="p-3.5 rounded-2xl rounded-tr-none bg-cyan-600 text-white text-xs sm:text-sm font-medium max-w-md shadow-md">
                      {DEMO_AI_QUESTIONS[selectedDemoQ].q}
                    </div>
                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-1">
                      U
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-xs font-bold text-cyan-300 shrink-0 mt-1">
                      <Sparkles size={14} />
                    </div>
                    <div className="flex-1 p-4 rounded-2xl rounded-tl-none bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-slate-200 leading-relaxed">
                      <p className="mb-3">{DEMO_AI_QUESTIONS[selectedDemoQ].a}</p>

                      {/* Clickable Citation Pill */}
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                          <CheckCircle2 size={13} className="text-cyan-400" />
                          <span>Grounded Source:</span>
                        </div>
                        <Link
                          href={`/repository?q=${encodeURIComponent(DEMO_AI_QUESTIONS[selectedDemoQ].citation)}`}
                          className="text-[11px] text-cyan-400 hover:text-cyan-200 underline font-mono truncate max-w-xs"
                        >
                          {DEMO_AI_QUESTIONS[selectedDemoQ].citation}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Input Bar */}
                <div className="p-4 border-t border-white/10 bg-slate-900/50 flex items-center gap-2">
                  <input
                    type="text"
                    disabled
                    placeholder="Type your own question in the Assistant..."
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-400 cursor-not-allowed"
                  />
                  <Link
                    href="/assistant"
                    className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shrink-0 transition-colors"
                  >
                    Open AI Chat
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── PLATFORM PILLARS ─── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Zap size={14} />
              <span>Full-Stack Capabilities</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-4">
              One Integrated Platform for India&apos;s Polar Science
            </h2>
            <p className="text-slate-300 text-base font-light">
              Built for researchers, educators, policymakers, and citizens. Designed to transform institutional data into real-world scientific impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLATFORM_PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <Link
                  key={p.title}
                  href={p.href}
                  className="group relative p-7 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-12 h-12 rounded-xl ${p.bg} border flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon size={22} className={p.color} />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/5 border border-white/10 text-slate-300">
                        {p.tag}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-xl text-white group-hover:text-cyan-300 transition-colors mb-2.5">
                      {p.title}
                    </h3>

                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-light">
                      {p.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-1.5 text-xs font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors">
                    <span>Explore Module</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── READY TO EXPLORE CTA ─── */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#060e1c] to-[#040810]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 mx-auto mb-6 shadow-[0_0_30px_rgba(14,165,233,0.5)]">
            <Snowflake size={28} className="animate-spin-slow" />
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white mb-6 tracking-tight">
            Ready to Explore the Frontiers of Polar Science?
          </h2>

          <p className="text-slate-300 text-base sm:text-lg mb-10 max-w-2xl mx-auto font-light">
            Search four decades of Indian polar expeditions, read station logs from Bharati and Himadri, or generate outreach stories with one click.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/repository"
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base shadow-[0_0_30px_rgba(14,165,233,0.4)] hover:shadow-[0_0_40px_rgba(14,165,233,0.7)] transition-all transform hover:-translate-y-0.5"
            >
              <Search size={18} />
              <span>Search Knowledge Repository</span>
            </Link>
            <Link
              href="/classroom"
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-base backdrop-blur-md transition-all"
            >
              <BookOpen size={18} />
              <span>Visit Polar Classroom</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
