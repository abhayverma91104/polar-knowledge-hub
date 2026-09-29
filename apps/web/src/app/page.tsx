'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Search, MessageSquare, Database, FileText,
  Globe, Zap, BookOpen, Map, Play, ChevronRight, Snowflake,
  Wind, Waves, FlaskConical, Satellite, Mountain, Users, Award
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

const EXPLORE_CARDS = [
  {
    title: 'Antarctica',
    subtitle: '14 million km² of frozen wilderness',
    description: 'India has been conducting research in Antarctica since 1981, with two active stations — Maitri and Bharati.',
    href: '/explore?region=antarctica',
    icon: Mountain,
    color: 'from-sky-900/80 to-polar-navy/90',
    accent: 'text-sky-300',
    image: 'https://images.unsplash.com/photo-1574263012399-2db17a17eb37?w=800&q=80',
  },
  {
    title: 'Arctic',
    subtitle: 'India\'s Himadri Station, Svalbard',
    description: 'Established in 2008, Himadri monitors climate change, glaciology, and atmospheric science in the High Arctic.',
    href: '/explore?region=arctic',
    icon: Wind,
    color: 'from-teal-900/80 to-polar-navy/90',
    accent: 'text-teal-300',
    image: 'https://images.unsplash.com/photo-1513553404607-988bf2703777?w=800&q=80',
  },
  {
    title: 'Indian Polar Expeditions',
    subtitle: '44 expeditions since 1981',
    description: 'Explore the complete timeline of India\'s polar expeditions, their objectives, achievements, and scientific findings.',
    href: '/expeditions',
    icon: Globe,
    color: 'from-indigo-900/80 to-polar-navy/90',
    accent: 'text-indigo-300',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
  },
  {
    title: 'Research Stations',
    subtitle: 'Maitri · Bharati · Himadri',
    description: 'Three world-class research stations at the poles conducting year-round multi-disciplinary science.',
    href: '/stations',
    icon: FlaskConical,
    color: 'from-cyan-900/80 to-polar-navy/90',
    accent: 'text-cyan-300',
    image: 'https://images.unsplash.com/photo-1551582045-6ec9c11d8697?w=800&q=80',
  },
];

const FEATURES = [
  {
    icon: Database,
    title: 'Knowledge Repository',
    description: 'Thousands of expedition reports, publications, datasets, and research papers — all searchable and connected.',
    href: '/repository',
    color: 'text-polar-cyan',
    bg: 'bg-polar-cyan/10',
  },
  {
    icon: MessageSquare,
    title: 'Polar AI Assistant',
    description: 'Ask questions about Indian polar research. Get cited answers grounded in the NCPOR knowledge base.',
    href: '/assistant',
    color: 'text-teal-400',
    bg: 'bg-teal-400/10',
  },
  {
    icon: Map,
    title: 'Interactive Polar Map',
    description: 'Explore research stations, expedition routes, and scientific observation points on an interactive map.',
    href: '/explore',
    color: 'text-indigo-400',
    bg: 'bg-indigo-400/10',
  },
  {
    icon: BookOpen,
    title: 'Polar Classroom',
    description: 'Educational content, topic guides, and quizzes on glaciology, oceanography, and polar science.',
    href: '/classroom',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
  {
    icon: Satellite,
    title: 'Automated Ingestion',
    description: 'Continuous import of NCPOR public resources through our web crawler and document processing pipeline.',
    href: '/admin/ingestion',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
  {
    icon: Zap,
    title: 'Content Studio',
    description: 'Transform research papers into public articles, social posts, student explanations, and educational quizzes.',
    href: '/content-studio',
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
  },
];

function StatCounter({ value, label }: { value: number; label: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) return;
    const duration = 1800;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="text-center">
      <div className="stat-number">{count.toLocaleString()}+</div>
      <div className="text-white/50 text-sm mt-1 font-medium">{label}</div>
    </div>
  );
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({
    documents: 1200,
    datasets: 160,
    images: 4800,
    videos: 200,
    expeditions: 44,
    stations: 3,
  });
  const [featured, setFeatured] = useState<Expedition | null>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    statsApi.getStats().then(r => setStats(r.data)).catch(() => {});
    expeditionsApi.getFeatured().then(r => setFeatured(r.data)).catch(() => {});

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    const el = document.getElementById('stats-section');
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-polar-midnight">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1551582045-6ec9c11d8697?w=2000&q=85"
            alt="Antarctica"
            className="w-full h-full object-cover object-center opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-polar-midnight/60 via-polar-midnight/50 to-polar-midnight" />
          <div className="absolute inset-0 aurora-bg" />
        </div>

        {/* Floating elements */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-polar-cyan/5 blur-3xl animate-drift" />
        <div className="absolute bottom-1/3 left-1/5 w-48 h-48 rounded-full bg-teal-400/5 blur-3xl animate-drift" style={{ animationDelay: '-7s' }} />

        <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-8 pt-24 pb-16">
          <div className="max-w-3xl">
            {/* Label */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-polar-cyan/15 border border-polar-cyan/25 rounded-full text-polar-cyan-300 text-sm font-semibold mb-8">
              <Snowflake size={14} className="animate-pulse-slow" />
              National Centre for Polar and Ocean Research
            </div>

            {/* Headline */}
            <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.05] mb-6 text-shadow">
              India&apos;s Polar
              <br />
              <span className="bg-gradient-to-r from-polar-cyan via-sky-400 to-teal-300 bg-clip-text text-transparent">
                Knowledge,
              </span>
              <br />
              Connected.
            </h1>

            <p className="text-white/70 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl">
              Explore expeditions, scientific discoveries, datasets, publications and stories from the Arctic and Antarctic — all in one intelligent platform.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/repository"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-polar-cyan hover:bg-sky-500 text-white rounded-xl font-bold text-base transition-all shadow-lg hover:shadow-glow-cyan hover:-translate-y-0.5"
              >
                <Database size={18} />
                Explore Polar Knowledge
              </Link>
              <Link
                href="/assistant"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl font-bold text-base transition-all backdrop-blur-sm"
              >
                <MessageSquare size={18} />
                Ask the Polar AI
              </Link>
            </div>

            {/* Quick links */}
            <div className="flex flex-wrap gap-3 mt-8">
              {['44th Expedition', 'Bharati Station', 'Climate Data', 'Antarctic Map'].map(label => (
                <Link
                  key={label}
                  href={`/repository?q=${encodeURIComponent(label)}`}
                  className="px-3 py-1.5 bg-white/8 hover:bg-white/14 border border-white/12 text-white/70 hover:text-white rounded-full text-sm transition-all"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <div className="text-xs font-medium tracking-widest uppercase">Scroll to explore</div>
          <div className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-white/30 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section id="stats-section" className="bg-polar-navy py-16 border-y border-white/5">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
            {statsVisible && (
              <>
                <StatCounter value={stats.expeditions} label="Indian Polar Expeditions" />
                <StatCounter value={stats.documents} label="Scientific Documents" />
                <StatCounter value={stats.datasets} label="Research Datasets" />
                <StatCounter value={stats.images} label="Media Assets" />
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── EXPLORE CARDS ─── */}
      <section className="py-20 bg-polar-frost">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-8">
          <div className="mb-12">
            <div className="section-label mb-4">
              <Globe size={12} />
              Explore
            </div>
            <h2 className="font-display font-bold text-4xl text-polar-navy mb-4">
              Discover the Polar World
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl">
              From the frozen Antarctic continent to the Arctic archipelago — explore India&apos;s scientific presence at both poles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {EXPLORE_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group relative overflow-hidden rounded-2xl aspect-[3/4] hover-lift block"
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${card.color}`} />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <Icon size={24} className={`mb-3 ${card.accent}`} />
                    <div className={`text-xs font-bold uppercase tracking-widest mb-1.5 ${card.accent}`}>
                      {card.subtitle}
                    </div>
                    <h3 className="text-white font-display font-bold text-xl mb-2">{card.title}</h3>
                    <p className="text-white/60 text-sm leading-snug hidden group-hover:block">
                      {card.description}
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-white/60 group-hover:text-white text-sm font-medium transition-colors">
                      Explore
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FEATURED EXPEDITION ─── */}
      {featured && (
        <section className="py-20 bg-white">
          <div className="max-w-screen-xl mx-auto px-6 lg:px-8">
            <div className="bg-polar-navy rounded-3xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Content */}
                <div className="p-10 lg:p-14">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 rounded-full text-amber-300 text-xs font-bold uppercase tracking-widest mb-6">
                    <Award size={12} />
                    Featured Expedition
                  </div>
                  <h2 className="font-display font-bold text-3xl lg:text-4xl text-white mb-4 leading-tight">
                    {featured.title}
                  </h2>
                  <p className="text-white/60 text-base leading-relaxed mb-8">
                    {featured.description?.slice(0, 280)}...
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {[
                      { label: 'Year', value: featured.year },
                      { label: 'Region', value: featured.region === 'antarctica' ? 'Antarctica' : 'Arctic' },
                      { label: 'Duration', value: `${featured.duration_days} days` },
                      { label: 'Documents', value: `${featured.document_count || 0}+` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-white/5 rounded-xl p-4">
                        <div className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1">{label}</div>
                        <div className="text-white font-bold text-lg">{value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {featured.research_domains?.slice(0, 4).map((domain) => (
                      <span key={domain} className="badge-cyan-dark badge text-xs">
                        {domain}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/expeditions/${featured.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-polar-cyan text-white rounded-xl font-bold transition-all hover:bg-sky-500 hover:shadow-glow-cyan"
                  >
                    Explore Expedition
                    <ArrowRight size={16} />
                  </Link>
                </div>

                {/* Image */}
                <div className="relative hidden lg:block">
                  <img
                    src="https://images.unsplash.com/photo-1574263012399-2db17a17eb37?w=800&q=80"
                    alt="Antarctic expedition"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-polar-navy/60 to-transparent" />

                  {/* Floating stats */}
                  <div className="absolute bottom-8 right-8 bg-polar-navy/80 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-3 text-white">
                      <Users size={18} className="text-polar-cyan" />
                      <div>
                        <div className="text-xs text-white/50">Team size</div>
                        <div className="font-bold">58 Scientists</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── FEATURES ─── */}
      <section className="py-20 bg-polar-frost">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="section-label mb-4 mx-auto w-fit">
              <Zap size={12} />
              Platform Features
            </div>
            <h2 className="font-display font-bold text-4xl text-polar-navy mb-4">
              One Platform, Complete Polar Science
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              From automated data ingestion to AI-powered research discovery and public outreach.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <Link
                  key={f.title}
                  href={f.href}
                  className="card p-7 group hover:border-polar-cyan/20"
                >
                  <div className={`w-11 h-11 ${f.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={22} className={f.color} />
                  </div>
                  <h3 className="font-display font-bold text-xl text-polar-navy mb-2">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-polar-cyan text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ChevronRight size={14} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── AI TEASER ─── */}
      <section className="py-20 bg-polar-navy relative overflow-hidden">
        <div className="absolute inset-0 aurora-bg" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-polar-cyan/5 blur-3xl" />

        <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="section-label-dark section-label mb-6">
                <MessageSquare size={12} />
                Polar AI
              </div>
              <h2 className="font-display font-bold text-4xl text-white mb-5 leading-tight">
                Ask Anything About Indian Polar Research
              </h2>
              <p className="text-white/60 text-lg leading-relaxed mb-8">
                Our RAG-powered AI assistant searches thousands of NCPOR documents, expedition reports, and scientific publications to give you precise, cited answers.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  'What research was conducted during the 44th Indian Antarctic Expedition?',
                  'What is the purpose of Bharati Research Station?',
                  'Which expeditions studied Antarctic oceanography?',
                ].map((q) => (
                  <Link
                    key={q}
                    href={`/assistant?q=${encodeURIComponent(q)}`}
                    className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-polar-cyan/30 rounded-xl text-white/70 hover:text-white text-sm transition-all group"
                  >
                    <MessageSquare size={14} className="text-polar-cyan shrink-0" />
                    {q}
                    <ArrowRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </Link>
                ))}
              </div>
              <Link
                href="/assistant"
                className="inline-flex items-center gap-2 px-6 py-3 bg-polar-cyan text-white rounded-xl font-bold hover:bg-sky-500 transition-all shadow-lg hover:shadow-glow-cyan"
              >
                <MessageSquare size={18} />
                Open Polar AI
              </Link>
            </div>

            {/* Chat preview */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/8">
                <div className="w-8 h-8 bg-polar-cyan rounded-lg flex items-center justify-center">
                  <Snowflake size={16} className="text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Polar AI</div>
                  <div className="flex items-center gap-1.5 text-xs text-green-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Online · RAG enabled
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="chat-message-user text-sm ml-auto">
                  What climate datasets are available from the 44th expedition?
                </div>
                <div className="chat-message-ai text-sm">
                  <p className="text-slate-700">Based on the NCPOR knowledge repository, the 44th Indian Antarctic Expedition (2024-25) produced several key datasets <span className="text-polar-cyan font-bold">[1]</span>:</p>
                  <ul className="mt-2 space-y-1 text-slate-600">
                    <li>• <strong>Southern Ocean CTD Profiles</strong> — 15,420 records of temperature, salinity, depth</li>
                    <li>• <strong>Maitri Meteorological Data</strong> — Hourly atmospheric observations</li>
                    <li>• <strong>Prydz Bay Biodiversity Survey</strong> — 12,500 benthic species records</li>
                  </ul>
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-xs text-slate-400 font-medium">Sources</div>
                    <div className="text-xs text-polar-cyan mt-1 hover:underline cursor-pointer">
                      [1] 44th Expedition Report — Page 42
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <div className="flex-1 input input-dark text-sm py-2.5">Ask about polar research...</div>
                <button className="px-4 py-2.5 bg-polar-cyan text-white rounded-lg text-sm font-semibold hover:bg-sky-500 transition-colors">
                  Ask
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CLASSROOM TEASER ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-12">
            <div>
              <div className="section-label mb-4">
                <BookOpen size={12} />
                Polar Classroom
              </div>
              <h2 className="font-display font-bold text-4xl text-polar-navy">
                Learn the Science of the Poles
              </h2>
            </div>
            <Link
              href="/classroom"
              className="btn-secondary shrink-0"
            >
              All Topics <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: 'Climate Change', icon: '🌡️', color: 'bg-rose-50 border-rose-100', href: '/classroom/climate-change' },
              { title: 'Glaciers & Ice', icon: '🏔️', color: 'bg-sky-50 border-sky-100', href: '/classroom/glaciers' },
              { title: 'Polar Oceans', icon: '🌊', color: 'bg-teal-50 border-teal-100', href: '/classroom/polar-oceans' },
              { title: 'Indian Expeditions', icon: '🚢', color: 'bg-amber-50 border-amber-100', href: '/classroom/polar-expeditions' },
            ].map((topic) => (
              <Link
                key={topic.title}
                href={topic.href}
                className={`card p-6 border ${topic.color} group hover-lift`}
              >
                <div className="text-4xl mb-4">{topic.icon}</div>
                <h3 className="font-display font-bold text-xl text-polar-navy mb-1">{topic.title}</h3>
                <div className="flex items-center gap-1 text-polar-cyan text-sm font-semibold mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn <ChevronRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LATEST MEDIA ─── */}
      <section className="py-20 bg-polar-frost">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-8">
          <div className="flex items-start justify-between mb-10">
            <div>
              <div className="section-label mb-4">
                <Play size={12} />
                Media Gallery
              </div>
              <h2 className="font-display font-bold text-4xl text-polar-navy">
                From the Field
              </h2>
            </div>
            <Link href="/media" className="btn-secondary">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              'https://images.unsplash.com/photo-1551909679-f1d9f3268571?w=500&q=80',
              'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=500&q=80',
              'https://images.unsplash.com/photo-1563207153-f403bf289096?w=500&q=80',
              'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&q=80',
            ].map((img, i) => (
              <Link
                key={i}
                href="/media"
                className="group relative aspect-square rounded-xl overflow-hidden"
              >
                <img
                  src={img}
                  alt={`Polar image ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-polar-navy/0 group-hover:bg-polar-navy/40 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 bg-polar-navy">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-display font-bold text-4xl text-white mb-5">
            Ready to Explore India&apos;s Polar Legacy?
          </h2>
          <p className="text-white/60 text-xl mb-10 max-w-2xl mx-auto">
            Search across decades of Indian polar science. Ask questions. Discover insights. Generate outreach content.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/repository"
              className="inline-flex items-center gap-2 px-8 py-4 bg-polar-cyan text-white rounded-xl font-bold text-lg hover:bg-sky-500 transition-all shadow-lg hover:shadow-glow-cyan"
            >
              <Search size={20} />
              Search the Repository
            </Link>
            <Link
              href="/assistant"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/15 transition-all"
            >
              <MessageSquare size={20} />
              Ask Polar AI
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
