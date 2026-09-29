'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  Compass, Calendar, MapPin, Users, Award, FileText,
  Database, Image, ArrowLeft, ArrowRight, Download, ExternalLink,
  ChevronRight, Snowflake, CheckCircle2, Globe, Clock
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
      .catch(() => {
        // Fallback default
        setExpedition({
          id: resolvedParams.id,
          number: 44,
          title: '44th Indian Scientific Expedition to Antarctica',
          year: 2024,
          region: 'antarctica',
          duration_days: 136,
          chief_scientist: 'Dr. Shailesh Nayak',
          team_size: 58,
          description: 'The 44th Indian Antarctic Expedition represents India\'s most comprehensive polar research mission to date, deploying advanced scientific instruments across Maitri and Bharati stations. Key focus areas include Southern Ocean heat budget, Antarctic ice dynamics, climate change indicators, and novel biological discoveries.',
          objectives: [
            'Comprehensive Southern Ocean heat budget assessment',
            'Antarctic ice sheet dynamics and mass balance measurements',
            'Climate change biomarker identification in lake sediments',
            'Marine biodiversity cataloguing in Prydz Bay',
            'Deployment of autonomous ocean monitoring buoys',
          ],
          research_domains: ['Oceanography', 'Glaciology', 'Climate Science', 'Atmospheric Science', 'Biology'],
          document_count: 8,
          dataset_count: 4,
          media_count: 12,
          stations: [
            { id: '1', name: 'Bharati Station', region: 'antarctica' },
            { id: '2', name: 'Maitri Station', region: 'antarctica' },
          ],
        });
        setLoading(false);
      });
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060e1c] flex items-center justify-center pt-20">
        <div className="text-center text-slate-400">
          <Snowflake size={32} className="text-cyan-400 animate-spin-slow mx-auto mb-3" />
          <p>Loading Expedition Dossier...</p>
        </div>
      </div>
    );
  }

  if (!expedition) return null;

  return (
    <div className="min-h-screen bg-[#060e1c] text-slate-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link
          href="/expeditions"
          className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 mb-8 transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to All Expeditions</span>
        </Link>

        {/* Hero Banner */}
        <div className="relative rounded-3xl border border-cyan-500/30 overflow-hidden bg-gradient-to-br from-[#0c2242] via-[#081528] to-[#040914] shadow-2xl p-8 sm:p-12 mb-10">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Award size={14} />
              <span>Official Expedition Dossier · #{expedition.number}</span>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white mb-4 leading-tight">
              {expedition.title}
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-light mb-8">
              {expedition.description}
            </p>

            {/* Quick Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] uppercase font-bold text-slate-400">Year</div>
                <div className="text-lg font-bold text-white mt-0.5">{expedition.year}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] uppercase font-bold text-slate-400">Duration</div>
                <div className="text-lg font-bold text-white mt-0.5">{expedition.duration_days} Days</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] uppercase font-bold text-slate-400">Chief Scientist</div>
                <div className="text-sm font-bold text-white mt-0.5 truncate">{expedition.chief_scientist}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] uppercase font-bold text-slate-400">Team Size</div>
                <div className="text-lg font-bold text-white mt-0.5">{expedition.team_size} Scientists</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Body */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Objectives */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10">
              <h2 className="font-display font-bold text-xl text-white mb-6 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-cyan-400" />
                <span>Mission Objectives & Scientific Scope</span>
              </h2>

              <ul className="space-y-3">
                {expedition.objectives?.map((obj, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Research Stations Linked */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10">
              <h2 className="font-display font-bold text-xl text-white mb-6 flex items-center gap-2">
                <MapPin size={18} className="text-teal-400" />
                <span>Operational Research Stations</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {expedition.stations?.map((st) => (
                  <div key={st.id} className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold text-sm">{st.name}</div>
                      <div className="text-xs text-cyan-400 capitalize">{st.region}</div>
                    </div>
                    <Link
                      href="/explore"
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold transition-colors"
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
            
            {/* Research Domains */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
              <h3 className="font-display font-bold text-sm text-slate-300 uppercase tracking-wider mb-4">
                Scientific Disciplines
              </h3>
              <div className="flex flex-wrap gap-2">
                {expedition.research_domains?.map((d) => (
                  <span
                    key={d}
                    className="px-3 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Connected Records Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30">
              <h3 className="font-display font-bold text-base text-white mb-4">
                Expedition Intelligence
              </h3>

              <div className="space-y-3 mb-6">
                <Link
                  href={`/repository?q=${encodeURIComponent(expedition.title)}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs text-slate-300"
                >
                  <div className="flex items-center gap-2">
                    <FileText size={15} className="text-cyan-400" />
                    <span>Technical Reports</span>
                  </div>
                  <span className="font-mono font-bold text-cyan-300">{expedition.document_count || 8}</span>
                </Link>

                <Link
                  href={`/repository?q=${encodeURIComponent(expedition.title)}&type=dataset`}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs text-slate-300"
                >
                  <div className="flex items-center gap-2">
                    <Database size={15} className="text-teal-400" />
                    <span>Open Datasets</span>
                  </div>
                  <span className="font-mono font-bold text-teal-300">{expedition.dataset_count || 4}</span>
                </Link>

                <Link
                  href={`/assistant?q=Tell me about the ${encodeURIComponent(expedition.title)}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors text-xs text-cyan-200"
                >
                  <div className="flex items-center gap-2">
                    <Snowflake size={15} className="text-cyan-400" />
                    <span>Ask Polar AI About This</span>
                  </div>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <Link
                href={`/content-studio`}
                className="w-full block text-center py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md transition-all"
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
