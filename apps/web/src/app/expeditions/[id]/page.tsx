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
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-surface text-on-surface">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#006194] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-on-surface-variant font-mono text-sm">Loading expedition dossier...</p>
        </div>
      </div>
    );
  }

  if (!expedition) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-surface text-on-surface">
        <div className="text-center max-w-md p-8 rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 bg-white dark:bg-[#0a1628] shadow-md">
          <h2 className="text-xl font-bold text-on-surface mb-2">Expedition Not Found</h2>
          <p className="text-on-surface-variant text-sm mb-6">The requested expedition dossier could not be located in the repository.</p>
          <Link
            href="/expeditions"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#006194] hover:bg-[#007bb9] text-white font-semibold text-sm transition-colors shadow-sm"
          >
            <ArrowLeft size={16} /> Back to Expeditions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-surface text-on-surface transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-8">
          <Link href="/" className="hover:text-[#006194] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/expeditions" className="hover:text-[#006194] transition-colors">Expeditions</Link>
          <span>/</span>
          <span className="text-[#006194] dark:text-sky-400 font-mono">
            {expedition.region === 'arctic' ? `Arctic-${expedition.number}` : `IAE-${expedition.number}`}
          </span>
        </div>

        {/* Hero Banner */}
        <div className="p-8 sm:p-10 rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 bg-white dark:bg-[#0a1628] shadow-sm mb-8 transition-colors">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#cce5ff] dark:bg-sky-950/60 border border-[#006194]/30 dark:border-sky-500/40 text-[#004b73] dark:text-sky-300 text-xs font-bold uppercase tracking-wider mb-4 font-mono">
            <Award size={14} />
            <span>Official Expedition Dossier · {expedition.region === 'arctic' ? 'Arctic ' : ''}#{expedition.number}</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-on-surface mb-4 leading-tight">
            {expedition.title}
          </h1>

          <p className="text-on-surface-variant text-base leading-relaxed mb-8 max-w-4xl">
            {expedition.description}
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-[#bfc7d2]/30 dark:border-white/10 bg-[#ebf5ff] dark:bg-[#0c1c30]">
              <div className="text-[11px] uppercase font-bold text-on-surface-variant font-mono">Year</div>
              <div className="text-xl font-bold text-[#006194] dark:text-sky-300 font-mono mt-1">{expedition.year}</div>
            </div>
            <div className="p-4 rounded-xl border border-[#bfc7d2]/30 dark:border-white/10 bg-[#ebf5ff] dark:bg-[#0c1c30]">
              <div className="text-[11px] uppercase font-bold text-on-surface-variant font-mono">Duration</div>
              <div className="text-xl font-bold text-on-surface font-mono mt-1">{expedition.duration_days} Days</div>
            </div>
            <div className="p-4 rounded-xl border border-[#bfc7d2]/30 dark:border-white/10 bg-[#ebf5ff] dark:bg-[#0c1c30]">
              <div className="text-[11px] uppercase font-bold text-on-surface-variant font-mono">Chief Scientist</div>
              <div className="text-sm font-bold text-on-surface mt-1 truncate">{expedition.chief_scientist}</div>
            </div>
            <div className="p-4 rounded-xl border border-[#bfc7d2]/30 dark:border-white/10 bg-[#ebf5ff] dark:bg-[#0c1c30]">
              <div className="text-[11px] uppercase font-bold text-on-surface-variant font-mono">Team Size</div>
              <div className="text-xl font-bold text-[#00685f] dark:text-teal-400 font-mono mt-1">{expedition.team_size} Scientists</div>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Body */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Objectives */}
            <div className="p-6 sm:p-8 rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 bg-white dark:bg-[#0a1628] shadow-sm transition-colors">
              <h2 className="font-display font-bold text-lg text-on-surface mb-5 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[#006194] dark:text-sky-400" />
                <span>Mission Objectives & Scientific Scope</span>
              </h2>

              <ul className="space-y-3">
                {expedition.objectives?.map((obj, i) => (
                  <li key={i} className="flex items-start gap-3 text-on-surface-variant text-sm leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-[#cce5ff] text-[#004b73] dark:bg-sky-950 dark:text-sky-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
                      {i + 1}
                    </span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stations */}
            <div className="p-6 sm:p-8 rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 bg-white dark:bg-[#0a1628] shadow-sm transition-colors">
              <h2 className="font-display font-bold text-lg text-on-surface mb-5 flex items-center gap-2">
                <MapPin size={18} className="text-[#00685f] dark:text-teal-400" />
                <span>Operational Research Stations</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {expedition.stations?.map((st) => (
                  <div key={st.id} className="p-4 rounded-xl border border-[#bfc7d2]/30 dark:border-white/10 bg-[#ebf5ff] dark:bg-[#0c1c30] flex items-center justify-between">
                    <div>
                      <div className="text-on-surface font-bold text-sm">{st.name}</div>
                      <div className="text-xs text-[#006194] dark:text-sky-400 capitalize font-mono">{st.region}</div>
                    </div>
                    <Link
                      href="/explore"
                      className="px-3 py-1.5 rounded-lg bg-[#006194]/10 hover:bg-[#006194]/20 text-[#006194] dark:text-sky-300 text-xs font-semibold transition-colors"
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
            <div className="p-6 rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 bg-white dark:bg-[#0a1628] shadow-sm transition-colors">
              <h3 className="font-display font-bold text-xs text-on-surface-variant uppercase tracking-wider mb-4">
                Scientific Disciplines
              </h3>
              <div className="flex flex-wrap gap-2">
                {expedition.research_domains?.map((d) => (
                  <span
                    key={d}
                    className="px-3 py-1 rounded-lg bg-[#ebf5ff] dark:bg-sky-950/80 border border-[#006194]/30 dark:border-sky-500/30 text-[#006194] dark:text-sky-300 text-xs font-semibold"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Connected Records */}
            <div className="p-6 rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 bg-white dark:bg-[#0a1628] shadow-sm transition-colors">
              <h3 className="font-display font-bold text-sm text-on-surface mb-4">
                Expedition Intelligence
              </h3>

              <div className="space-y-3 mb-6">
                <Link
                  href={`/repository?q=${encodeURIComponent(expedition.title)}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#bfc7d2]/30 dark:border-white/10 bg-[#ebf5ff] dark:bg-[#0c1c30] hover:border-[#006194] transition-colors text-xs text-on-surface-variant"
                >
                  <div className="flex items-center gap-2">
                    <FileText size={15} className="text-[#006194] dark:text-sky-400" />
                    <span className="text-on-surface">Technical Reports</span>
                  </div>
                  <span className="font-mono font-bold text-[#006194] dark:text-sky-300">{expedition.document_count || 4}</span>
                </Link>

                <Link
                  href={`/repository?q=${encodeURIComponent(expedition.title)}&type=dataset`}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#bfc7d2]/30 dark:border-white/10 bg-[#ebf5ff] dark:bg-[#0c1c30] hover:border-[#00685f] transition-colors text-xs text-on-surface-variant"
                >
                  <div className="flex items-center gap-2">
                    <Database size={15} className="text-[#00685f] dark:text-teal-400" />
                    <span className="text-on-surface">Open Datasets</span>
                  </div>
                  <span className="font-mono font-bold text-[#00685f] dark:text-teal-300">{expedition.dataset_count || 3}</span>
                </Link>

                <Link
                  href={`/assistant?q=Tell me about the ${encodeURIComponent(expedition.title)}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#ebf5ff] dark:bg-sky-950/40 border border-[#006194]/30 hover:bg-[#d4ebff] dark:hover:bg-sky-900/40 transition-colors text-xs text-[#006194] dark:text-sky-200"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare size={15} className="text-[#006194] dark:text-sky-400" />
                    <span>Ask Polar AI About This</span>
                  </div>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <Link
                href="/content-studio"
                className="w-full block text-center py-2.5 rounded-xl bg-[#006194] hover:bg-[#007bb9] text-white font-bold text-xs transition-colors shadow-sm"
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
