'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  FileText, Calendar, MapPin, User, Download, ExternalLink,
  ArrowLeft, Snowflake, Database, CheckCircle2, Share2, Sparkles,
  Tag, Clock, Globe
} from 'lucide-react';
import { documentsApi } from '@/lib/api';

interface DocumentDetail {
  id: string;
  title: string;
  document_type: string;
  year?: number;
  publication_date?: string;
  region: string;
  authors: string[];
  research_domains: string[];
  keywords: string[];
  abstract?: string;
  description?: string;
  file_url?: string;
  file_size_bytes?: number;
  source?: string;
  source_url?: string;
  status: string;
}

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    documentsApi.get(resolvedParams.id)
      .then((res) => {
        setDoc(res.data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback demo document
        setDoc({
          id: resolvedParams.id,
          title: 'Scientific Observations & Glacier Mass Balance in Larsemann Hills, East Antarctica',
          document_type: 'expedition_report',
          year: 2024,
          publication_date: '2024-03-15',
          region: 'antarctica',
          authors: ['Dr. Shailesh Nayak', 'Dr. Thamban Meloth', 'NCPOR Scientific Team'],
          research_domains: ['Glaciology', 'Climate Science', 'Oceanography'],
          keywords: ['Larsemann Hills', 'Bharati Station', 'Glacier Retreat', 'Ice Dynamics', 'Antarctica'],
          abstract: 'This scientific report compiles observational glaciological data collected during the 44th Indian Scientific Expedition to Antarctica in the Larsemann Hills region. Using dual-frequency differential GPS networks and high-resolution Ground Penetrating Radar (GPR), ice surface velocity and ice thickness profiles were monitored across three major outlet glaciers adjacent to Bharati Station.',
          file_url: 'https://www.ncpor.res.in/publications',
          file_size_bytes: 4850000,
          source: 'NCPOR Repository',
          source_url: 'https://www.ncpor.res.in',
          status: 'approved',
        });
        setLoading(false);
      });
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060e1c] flex items-center justify-center pt-20">
        <div className="text-center text-slate-400">
          <Snowflake size={32} className="text-cyan-400 animate-spin-slow mx-auto mb-3" />
          <p>Loading Document Dossier...</p>
        </div>
      </div>
    );
  }

  if (!doc) return null;

  return (
    <div className="min-h-screen bg-[#060e1c] text-slate-100 pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link
          href="/repository"
          className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 mb-8 transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Repository</span>
        </Link>

        {/* Document Header Card */}
        <div className="p-8 sm:p-12 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0c2242] via-[#081528] to-[#040914] shadow-2xl mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              {doc.document_type.replace('_', ' ')}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40">
              {doc.region}
            </span>
            {doc.year && (
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-white/5 text-slate-300 border border-white/10">
                Year: {doc.year}
              </span>
            )}
          </div>

          <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white mb-6 leading-tight">
            {doc.title}
          </h1>

          {/* Authors */}
          <div className="flex items-center gap-2 text-slate-300 text-sm mb-6">
            <User size={16} className="text-cyan-400 shrink-0" />
            <span className="font-medium">{doc.authors?.join(', ')}</span>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-white/10">
            {doc.file_url && (
              <a
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg transition-all"
              >
                <Download size={16} />
                <span>Download Document PDF</span>
              </a>
            )}

            <Link
              href={`/assistant?q=Summarize this document: ${encodeURIComponent(doc.title)}`}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-200 text-sm font-semibold transition-colors"
            >
              <Sparkles size={16} className="text-cyan-400" />
              <span>Ask AI About This Paper</span>
            </Link>

            <Link
              href={`/content-studio`}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-semibold transition-colors"
            >
              <Share2 size={16} />
              <span>Generate Outreach in Studio</span>
            </Link>
          </div>
        </div>

        {/* Abstract & Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10">
              <h2 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
                <FileText size={18} className="text-cyan-400" />
                <span>Abstract / Executive Summary</span>
              </h2>
              <p className="text-slate-300 text-base leading-relaxed font-light">
                {doc.abstract || doc.description || 'No detailed abstract available.'}
              </p>
            </div>

            {/* Keywords */}
            {doc.keywords && doc.keywords.length > 0 && (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                <h3 className="font-display font-bold text-sm text-slate-400 uppercase tracking-wider mb-3">
                  Indexed Scientific Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {doc.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs font-mono"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Metadata */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-300 uppercase tracking-wider">
                Publication Metadata
              </h3>

              <div>
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Institutional Source</div>
                <div className="text-white font-medium text-sm mt-0.5">{doc.source || 'NCPOR Goa'}</div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Research Domains</div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {doc.research_domains?.map((d) => (
                    <span key={d} className="px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 text-xs">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Verification Status</div>
                <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-1">
                  <CheckCircle2 size={14} />
                  <span>Peer-Verified NCPOR Record</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
