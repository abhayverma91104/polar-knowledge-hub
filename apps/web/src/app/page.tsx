'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Search, MessageSquare, Database, FileText,
  Globe, Zap, BookOpen, Map, Play, ChevronRight, Snowflake,
  Wind, Waves, FlaskConical, Satellite, Mountain, Users, Award
} from 'lucide-react';
import { statsApi, expeditionsApi } from '@/lib/api';
import { PolarTelemetry } from '@/components/polar-telemetry';

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
    image: '/images/antarctica-landscape.jpg',
  },
  {
    title: 'Arctic',
    subtitle: "India's Himadri Station, Svalbard",
    description: 'Established in 2008, Himadri monitors climate change, glaciology, and atmospheric science in the High Arctic.',
    href: '/explore?region=arctic',
    icon: Wind,
    image: '/images/himadri-arctic.jpg',
  },
  {
    title: 'Polar Expeditions',
    subtitle: '44 expeditions since 1981',
    description: "Explore the complete timeline of India's polar expeditions, their objectives, achievements, and scientific findings.",
    href: '/expeditions',
    icon: Globe,
    image: '/images/expedition-ship.jpg',
  },
  {
    title: 'Research Stations',
    subtitle: 'Maitri · Bharati · Himadri',
    description: 'Three world-class research stations at the poles conducting year-round multi-disciplinary science.',
    href: '/stations',
    icon: FlaskConical,
    image: '/images/bharati-station.jpg',
  },
];

const FEATURES = [
  {
    icon: Database,
    title: 'Knowledge Repository',
    description: 'Thousands of expedition reports, publications, datasets, and research papers — all searchable and connected.',
    href: '/repository',
    accent: '#0ea5e9',
    bg: 'rgba(14,165,233,0.08)',
  },
  {
    icon: MessageSquare,
    title: 'Polar AI Assistant',
    description: 'Ask questions about Indian polar research. Get cited answers grounded in the NCPOR knowledge base.',
    href: '/assistant',
    accent: '#0d9488',
    bg: 'rgba(13,148,136,0.08)',
  },
  {
    icon: Map,
    title: 'Interactive Polar Map',
    description: 'Explore research stations, expedition routes, and scientific observation points on an interactive map.',
    href: '/explore',
    accent: '#6366f1',
    bg: 'rgba(99,102,241,0.08)',
  },
  {
    icon: BookOpen,
    title: 'Polar Classroom',
    description: 'Educational content, topic guides, and quizzes on glaciology, oceanography, and polar science.',
    href: '/classroom',
    accent: '#7c3aed',
    bg: 'rgba(124,58,237,0.08)',
  },
  {
    icon: Satellite,
    title: 'Automated Ingestion',
    description: 'Continuous import of NCPOR public resources through our web crawler and document processing pipeline.',
    href: '/admin/ingestion',
    accent: '#d97706',
    bg: 'rgba(217,119,6,0.08)',
  },
  {
    icon: Zap,
    title: 'Content Studio',
    description: 'Transform research papers into public articles, social posts, student explanations, and educational quizzes.',
    href: '/content-studio',
    accent: '#e11d48',
    bg: 'rgba(225,29,72,0.08)',
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
      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', marginTop: '0.25rem', fontWeight: 500 }}>{label}</div>
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
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: '#060e1c' }}>
        {/* Background photo — low opacity overlay via solid dark bg */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <img
            src="/images/polar-hero-bg.jpg"
            alt="Antarctica"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.32 }}
          />
          {/* Solid dark overlays — no gradients */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,14,28,0.40)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'rgba(6,14,28,0.65)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '180px', background: 'rgba(6,14,28,0.80)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '1280px', margin: '0 auto', padding: '6rem 2rem 4rem', width: '100%' }}>
          <div style={{ maxWidth: '700px' }}>
            {/* Institution label */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 14px',
              background: 'rgba(14,165,233,0.12)',
              border: '1px solid rgba(14,165,233,0.2)',
              borderRadius: '100px',
              color: '#7dd3fc',
              fontSize: '0.78rem', fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              marginBottom: '2rem'
            }}>
              <Snowflake size={12} />
              National Centre for Polar and Ocean Research
            </div>

            {/* Headline — flat white, no gradient text */}
            <h1 className="text-shadow" style={{
              fontFamily: 'Outfit, Inter, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(2.8rem, 6vw, 5rem)',
              lineHeight: 1.06,
              color: '#fff',
              marginBottom: '1.5rem',
              letterSpacing: '-0.02em'
            }}>
              India&apos;s Polar<br />
              <span style={{ color: '#38bdf8' }}>Knowledge,</span><br />
              Connected.
            </h1>

            <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '560px' }}>
              Explore expeditions, scientific discoveries, datasets, publications and
              stories from the Arctic and Antarctic — all in one intelligent platform.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <Link
                href="/repository"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  padding: '12px 24px',
                  background: '#0ea5e9',
                  color: '#fff',
                  borderRadius: '10px',
                  fontWeight: 700, fontSize: '0.95rem',
                  transition: 'background 0.18s, box-shadow 0.18s, transform 0.18s',
                  boxShadow: '0 4px 16px rgba(14,165,233,0.3)'
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0284c7'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#0ea5e9'; }}
              >
                <Database size={17} />
                Explore Polar Knowledge
              </Link>
              <Link
                href="/assistant"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  padding: '12px 24px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1.5px solid rgba(255,255,255,0.18)',
                  color: '#fff',
                  borderRadius: '10px',
                  fontWeight: 700, fontSize: '0.95rem',
                  transition: 'background 0.18s'
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.13)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
              >
                <MessageSquare size={17} />
                Ask the Polar AI
              </Link>
            </div>

            {/* Quick links */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['44th Expedition', 'Bharati Station', 'Climate Data', 'Antarctic Map'].map(label => (
                <Link
                  key={label}
                  href={`/repository?q=${encodeURIComponent(label)}`}
                  style={{
                    padding: '6px 14px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.6)',
                    borderRadius: '100px', fontSize: '0.8rem',
                    transition: 'background 0.18s, color 0.18s'
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background='rgba(255,255,255,0.12)'; el.style.color='#fff'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background='rgba(255,255,255,0.06)'; el.style.color='rgba(255,255,255,0.6)'; }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.25)' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Scroll</div>
          <div style={{ width: '18px', height: '30px', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '9px', display: 'flex', justifyContent: 'center', paddingTop: '6px' }}>
            <div style={{ width: '3px', height: '6px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', animation: 'bounce 1.5s infinite' }} />
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section id="stats-section" style={{ background: '#0a1628', padding: '4rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
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

      {/* ─── LIVE POLAR TELEMETRY ─── */}
      <section style={{ padding: '3.5rem 0', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
          <PolarTelemetry />
        </div>
      </section>

      {/* ─── EXPLORE CARDS ─── */}
      <section style={{ padding: '5rem 0', background: '#f4f8fb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ marginBottom: '3rem' }}>
            <div className="section-label" style={{ marginBottom: '1rem' }}>
              <Globe size={12} /> Explore
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '2.25rem', color: '#0a1628', marginBottom: '0.75rem' }}>
              Discover the Polar World
            </h2>
            <p style={{ color: '#475569', fontSize: '1.05rem', maxWidth: '560px' }}>
              From the frozen Antarctic continent to the Arctic archipelago — explore India&apos;s scientific presence at both poles.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {EXPLORE_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  style={{ display: 'block', position: 'relative', overflow: 'hidden', borderRadius: '16px', aspectRatio: '3/4' }}
                  className="hover-lift group"
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                  />
                  {/* Solid dark overlay at bottom — no gradient */}
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,14,28,0.52)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', background: 'rgba(6,14,28,0.78)' }} />
                  <div style={{ position: 'absolute', inset: 0, padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <Icon size={22} style={{ color: '#38bdf8', marginBottom: '10px' }} />
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7dd3fc', marginBottom: '6px' }}>
                      {card.subtitle}
                    </div>
                    <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.15rem', color: '#fff', marginBottom: '6px' }}>
                      {card.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', fontWeight: 500, marginTop: '4px' }}>
                      Explore <ArrowRight size={13} />
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
        <section style={{ padding: '5rem 0', background: '#fff' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
            <div style={{ background: '#0a1628', borderRadius: '20px', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              {/* Content */}
              <div style={{ padding: '3.5rem' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '4px 12px',
                  background: 'rgba(251,191,36,0.15)',
                  borderRadius: '100px',
                  color: '#fbbf24', fontSize: '0.7rem', fontWeight: 700,
                  letterSpacing: '0.07em', textTransform: 'uppercase',
                  marginBottom: '1.5rem'
                }}>
                  <Award size={11} /> Featured Expedition
                </div>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.9rem', color: '#fff', marginBottom: '1rem', lineHeight: 1.25 }}>
                  {featured.title}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                  {featured.description?.slice(0, 260)}...
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '2rem' }}>
                  {[
                    { label: 'Year', value: featured.year },
                    { label: 'Region', value: featured.region === 'antarctica' ? 'Antarctica' : 'Arctic' },
                    { label: 'Duration', value: `${featured.duration_days} days` },
                    { label: 'Documents', value: `${featured.document_count || 0}+` },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px 16px' }}>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{label}</div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '2rem' }}>
                  {featured.research_domains?.slice(0, 4).map((domain) => (
                    <span key={domain} className="badge badge-cyan-dark">{domain}</span>
                  ))}
                </div>

                <Link
                  href={`/expeditions`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '11px 22px',
                    background: '#0ea5e9', color: '#fff',
                    borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem',
                    transition: 'background 0.18s'
                  }}
                >
                  Explore Expedition <ArrowRight size={15} />
                </Link>
              </div>

              {/* Image panel */}
              <div style={{ position: 'relative' }}>
                <img
                  src="/images/bharati-station.jpg"
                  alt="Antarctic expedition"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {/* Solid left-edge dark panel */}
                <div style={{ position: 'absolute', inset: '0', left: 0, width: '80px', background: '#0a1628' }} />
                {/* Floating badge */}
                <div style={{
                  position: 'absolute', bottom: '2rem', right: '2rem',
                  background: 'rgba(10,22,40,0.88)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '14px', padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                  <Users size={17} style={{ color: '#0ea5e9' }} />
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>Team size</div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>58 Scientists</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── FEATURES ─── */}
      <section style={{ padding: '5rem 0', background: '#f4f8fb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="section-label" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
              <Zap size={12} /> Platform Features
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '2.25rem', color: '#0a1628', marginBottom: '0.75rem' }}>
              One Platform, Complete Polar Science
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto' }}>
              From automated data ingestion to AI-powered research discovery and public outreach.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <Link
                  key={f.title}
                  href={f.href}
                  className="card"
                  style={{ padding: '1.75rem', display: 'block', textDecoration: 'none' }}
                >
                  <div style={{
                    width: '44px', height: '44px',
                    background: f.bg,
                    borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1rem'
                  }}>
                    <Icon size={21} style={{ color: f.accent }} />
                  </div>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#0a1628', marginBottom: '0.5rem' }}>
                    {f.title}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.65 }}>{f.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0ea5e9', fontSize: '0.82rem', fontWeight: 600, marginTop: '1rem' }}>
                    Learn more <ChevronRight size={13} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── AI TEASER ─── */}
      <section style={{ padding: '5rem 0', background: '#0a1628', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle radial highlight — no gradient, just a soft circle */}
        <div style={{ position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '500px', background: 'rgba(14,165,233,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div className="section-label section-label-dark" style={{ marginBottom: 0 }}>
                  <MessageSquare size={12} /> Polar AI
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#34d399', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.25)', padding: '3px 10px', borderRadius: '9999px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }} className="animate-pulse" />
                  Powered by Google Gemini
                </div>
              </div>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '2.1rem', color: '#fff', marginBottom: '1.25rem', lineHeight: 1.25 }}>
                Ask Anything About Indian Polar Research
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                Our RAG-powered AI assistant searches thousands of NCPOR documents, expedition reports, and scientific publications to give you precise, cited answers.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2rem' }}>
                {[
                  'What research was conducted during the 44th Indian Antarctic Expedition?',
                  'What is the purpose of Bharati Research Station?',
                  'Which expeditions studied Antarctic oceanography?',
                ].map((q) => (
                  <Link
                    key={q}
                    href={`/assistant?q=${encodeURIComponent(q)}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '13px 16px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem',
                      transition: 'background 0.18s, border-color 0.18s'
                    }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background='rgba(255,255,255,0.08)'; el.style.borderColor='rgba(14,165,233,0.3)'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background='rgba(255,255,255,0.04)'; el.style.borderColor='rgba(255,255,255,0.08)'; }}
                  >
                    <MessageSquare size={13} style={{ color: '#0ea5e9', flexShrink: 0 }} />
                    {q}
                    <ArrowRight size={13} style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                  </Link>
                ))}
              </div>
              <Link
                href="/assistant"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 22px',
                  background: '#0ea5e9', color: '#fff',
                  borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem',
                  transition: 'background 0.18s'
                }}
              >
                <MessageSquare size={17} />
                Open Polar AI
              </Link>
            </div>

            {/* Chat preview */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px', padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ width: '32px', height: '32px', background: '#0ea5e9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Snowflake size={15} style={{ color: '#fff' }} />
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem' }}>Polar AI</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#4ade80' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} className="animate-pulse" />
                    Online · Powered by Google Gemini
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="chat-message-user" style={{ fontSize: '0.85rem', marginLeft: 'auto' }}>
                  What climate datasets are available from the 44th expedition?
                </div>
                <div className="chat-message-ai" style={{ fontSize: '0.85rem' }}>
                  <p style={{ color: '#374151' }}>Based on the NCPOR knowledge repository, the 44th Indian Antarctic Expedition (2024-25) produced several key datasets <span style={{ color: '#0ea5e9', fontWeight: 700 }}>[1]</span>:</p>
                  <ul style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', color: '#4b5563' }}>
                    <li>• <strong>Southern Ocean CTD Profiles</strong> — 15,420 records of temperature, salinity, depth</li>
                    <li>• <strong>Maitri Meteorological Data</strong> — Hourly atmospheric observations</li>
                    <li>• <strong>Prydz Bay Biodiversity Survey</strong> — 12,500 benthic species records</li>
                  </ul>
                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>Sources</div>
                    <div style={{ fontSize: '0.72rem', color: '#0ea5e9', cursor: 'pointer' }}>[1] 44th Expedition Report — Page 42</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', display: 'flex', gap: '8px' }}>
                <div className="input input-dark" style={{ fontSize: '0.85rem', padding: '10px 14px', flex: 1 }}>Ask about polar research...</div>
                <button style={{ padding: '10px 16px', background: '#0ea5e9', color: '#fff', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                  Ask
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CLASSROOM TEASER ─── */}
      <section style={{ padding: '5rem 0', background: '#fff' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '3rem' }}>
            <div>
              <div className="section-label" style={{ marginBottom: '1rem' }}>
                <BookOpen size={12} /> Polar Classroom
              </div>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '2.25rem', color: '#0a1628' }}>
                Learn the Science of the Poles
              </h2>
            </div>
            <Link href="/classroom" className="btn-secondary" style={{ flexShrink: 0 }}>
              All Topics <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {[
              { title: 'Climate Change', icon: '🌡️', bg: '#fef2f2', border: '#fde8e8', href: '/classroom/climate-change' },
              { title: 'Glaciers & Ice',  icon: '🏔️', bg: '#f0f9ff', border: '#e0f2fe', href: '/classroom/glaciers' },
              { title: 'Polar Oceans',    icon: '🌊', bg: '#f0fdfa', border: '#d0faf4', href: '/classroom/polar-oceans' },
              { title: 'Indian Expeditions', icon: '🚢', bg: '#fffbeb', border: '#fde68a', href: '/classroom/polar-expeditions' },
            ].map((topic) => (
              <Link
                key={topic.title}
                href={topic.href}
                className="card"
                style={{ padding: '1.5rem', background: topic.bg, borderColor: topic.border, display: 'block' }}
              >
                <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>{topic.icon}</div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#0a1628', marginBottom: '0.75rem' }}>
                  {topic.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0ea5e9', fontSize: '0.8rem', fontWeight: 600 }}>
                  Learn <ChevronRight size={13} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MEDIA GALLERY ─── */}
      <section style={{ padding: '5rem 0', background: '#f4f8fb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="section-label" style={{ marginBottom: '1rem' }}>
                <Play size={12} /> Media Gallery
              </div>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '2.25rem', color: '#0a1628' }}>
                From the Field
              </h2>
            </div>
            <Link href="/media" className="btn-secondary">View All <ArrowRight size={14} /></Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {[
              '/images/aurora-maitri.jpg',
              '/images/ice-core-science.jpg',
              '/images/penguin-colony.jpg',
              '/images/ocean-research.jpg',
            ].map((img, i) => (
              <Link
                key={i}
                href="/media"
                style={{ display: 'block', position: 'relative', aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden' }}
              >
                <img
                  src={img}
                  alt={`Polar image ${i + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.07)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,22,40,0)', transition: 'background 0.3s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(10,22,40,0.35)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(10,22,40,0)'; }}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ padding: '5rem 0', background: '#0a1628' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '2.25rem', color: '#fff', marginBottom: '1.25rem' }}>
            Ready to Explore India&apos;s Polar Legacy?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
            Search across decades of Indian polar science. Ask questions. Discover insights. Generate outreach content.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/repository"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '14px 28px',
                background: '#0ea5e9', color: '#fff',
                borderRadius: '10px', fontWeight: 700, fontSize: '1rem',
                transition: 'background 0.18s'
              }}
            >
              <Search size={18} /> Search the Repository
            </Link>
            <Link
              href="/assistant"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '14px 28px',
                background: 'rgba(255,255,255,0.07)',
                border: '1.5px solid rgba(255,255,255,0.15)',
                color: '#fff',
                borderRadius: '10px', fontWeight: 700, fontSize: '1rem',
                transition: 'background 0.18s'
              }}
            >
              <MessageSquare size={18} /> Ask Polar AI
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
