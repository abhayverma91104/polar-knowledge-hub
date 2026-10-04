'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  Calendar, MapPin, Award, FileText,
  Database, ArrowLeft, ArrowRight,
  CheckCircle2, Globe, Clock, MessageSquare, Satellite
} from 'lucide-react';
import { expeditionsApi } from '@/lib/api';

interface ExpeditionDetail {
  id: string;
  number: number;
  title: string;
  year: number;
  region: string;
  duration_days: number;
  start_date?: string;
  end_date?: string;
  chief_scientist: string;
  team_size: number;
  description: string;
  objectives: string[];
  research_domains: string[];
  document_count?: number;
  dataset_count?: number;
  media_count?: number;
  stations?: Array<{ id: string; name: string; region: string }>;
}

export default function ExpeditionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [expedition, setExpedition] = useState<ExpeditionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    expeditionsApi.get(resolvedParams.id)
      .then((res) => {
        setExpedition(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch expedition detail:', err);
        setLoading(false);
      });
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center" style={{ background: '#070f1e' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-mono text-sm">Loading expedition dossier...</p>
        </div>
      </div>
    );
  }

  if (!expedition) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center" style={{ background: '#070f1e' }}>
        <div className="text-center max-w-md p-8 rounded-2xl border border-white/10" style={{ background: '#0a1628' }}>
          <h2 className="text-xl font-bold text-white mb-2">Expedition Not Found</h2>
          <p className="text-slate-400 text-sm mb-6">The requested expedition dossier could not be located in the repository.</p>
          <Link
            href="/expeditions"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white font-semibold text-sm hover:bg-sky-400 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Expeditions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 text-slate-100" style={{ background: '#070f1e' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/expeditions" className="hover:text-white transition-colors">Expeditions</Link>
          <span>/</span>
          <span className="text-sky-400 font-mono">
            {expedition.region === 'arctic' ? `Arctic-${expedition.number}` : `IAE-${expedition.number}`}
          </span>
        </div>

        {/* Hero Banner */}
        <div className="p-8 sm:p-10 rounded-2xl border border-white/10 mb-8" style={{ background: '#0a1628' }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Award size={14} />
            <span>Official Expedition Dossier · {expedition.region === 'arctic' ? 'Arctic ' : ''}#{expedition.number}</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-4 leading-tight">
            {expedition.title}
          </h1>

          <p className="text-slate-300 text-base leading-relaxed mb-8 max-w-4xl">
            {expedition.description}
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-white/10" style={{ background: '#070f1e' }}>
              <div className="text-[11px] uppercase font-bold text-slate-400">Year</div>
              <div className="text-xl font-bold text-white mt-1">{expedition.year}</div>
            </div>
            <div className="p-4 rounded-xl border border-white/10" style={{ background: '#070f1e' }}>
              <div className="text-[11px] uppercase font-bold text-slate-400">Duration</div>
              <div className="text-xl font-bold text-white mt-1">{expedition.duration_days} Days</div>
            </div>
            <div className="p-4 rounded-xl border border-white/10" style={{ background: '#070f1e' }}>
              <div className="text-[11px] uppercase font-bold text-slate-400">Chief Scientist</div>
              <div className="text-sm font-bold text-white mt-1 truncate">{expedition.chief_scientist}</div>
            </div>
            <div className="p-4 rounded-xl border border-white/10" style={{ background: '#070f1e' }}>
              <div className="text-[11px] uppercase font-bold text-slate-400">Team Size</div>
              <div className="text-xl font-bold text-white mt-1">{expedition.team_size} Scientists</div>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Body */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Objectives */}
            <div className="p-6 sm:p-8 rounded-2xl border border-white/10" style={{ background: '#0a1628' }}>
              <h2 className="font-display font-bold text-lg text-white mb-5 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-sky-400" />
                <span>Mission Objectives & Scientific Scope</span>
              </h2>

              <ul className="space-y-3">
                {expedition.objectives?.map((obj, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stations */}
            <div className="p-6 sm:p-8 rounded-2xl border border-white/10" style={{ background: '#0a1628' }}>
              <h2 className="font-display font-bold text-lg text-white mb-5 flex items-center gap-2">
                <MapPin size={18} className="text-teal-400" />
                <span>Operational Research Stations</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {expedition.stations?.map((st) => (
                  <div key={st.id} className="p-4 rounded-xl border border-white/10 flex items-center justify-between" style={{ background: '#070f1e' }}>
                    <div>
                      <div className="text-white font-bold text-sm">{st.name}</div>
                      <div className="text-xs text-sky-400 capitalize">{st.region}</div>
                    </div>
                    <Link
                      href="/explore"
                      className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-semibold transition-colors"
                    >
                      View on Map
                    </Link>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Disciplines */}
            <div className="p-6 rounded-2xl border border-white/10" style={{ background: '#0a1628' }}>
              <h3 className="font-display font-bold text-xs text-slate-400 uppercase tracking-wider mb-4">
                Scientific Disciplines
              </h3>
              <div className="flex flex-wrap gap-2">
                {expedition.research_domains?.map((d) => (
                  <span
                    key={d}
                    className="px-3 py-1 rounded-lg bg-sky-950/80 border border-sky-500/30 text-sky-300 text-xs font-semibold"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Connected Records */}
            <div className="p-6 rounded-2xl border border-white/10" style={{ background: '#0a1628' }}>
              <h3 className="font-display font-bold text-sm text-white mb-4">
                Expedition Intelligence
              </h3>

              <div className="space-y-3 mb-6">
                <Link
                  href={`/repository?q=${encodeURIComponent(expedition.title)}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-white/10 hover:border-white/20 transition-colors text-xs text-slate-300"
                  style={{ background: '#070f1e' }}
                >
                  <div className="flex items-center gap-2">
                    <FileText size={15} className="text-sky-400" />
                    <span>Technical Reports</span>
                  </div>
                  <span className="font-mono font-bold text-sky-300">{expedition.document_count || 4}</span>
                </Link>

                <Link
                  href={`/repository?q=${encodeURIComponent(expedition.title)}&type=dataset`}
                  className="flex items-center justify-between p-3 rounded-xl border border-white/10 hover:border-white/20 transition-colors text-xs text-slate-300"
                  style={{ background: '#070f1e' }}
                >
                  <div className="flex items-center gap-2">
                    <Database size={15} className="text-teal-400" />
                    <span>Open Datasets</span>
                  </div>
                  <span className="font-mono font-bold text-teal-300">{expedition.dataset_count || 3}</span>
                </Link>

                <Link
                  href={`/assistant?q=Tell me about the ${encodeURIComponent(expedition.title)}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 hover:bg-sky-500/20 transition-colors text-xs text-sky-200"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare size={15} className="text-sky-400" />
                    <span>Ask Polar AI About This</span>
                  </div>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <Link
                href="/content-studio"
                className="w-full block text-center py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-colors"
              >
                Generate Outreach in Content Studio
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
