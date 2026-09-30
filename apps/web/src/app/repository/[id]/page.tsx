'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  FileText, Calendar, MapPin, User, Download, ExternalLink,
  ArrowLeft, CheckCircle2, Share2, Tag, Globe, MessageSquare
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
      .catch((err) => {
        console.error('Failed to fetch document:', err);
        setLoading(false);
      });
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center" style={{ background: '#070f1e' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-mono text-sm">Retrieving scientific publication...</p>
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center" style={{ background: '#070f1e' }}>
        <div className="text-center max-w-md p-8 rounded-2xl border border-white/10" style={{ background: '#0a1628' }}>
          <h2 className="text-xl font-bold text-white mb-2">Record Not Found</h2>
          <p className="text-slate-400 text-sm mb-6">The requested scientific record could not be found in the repository.</p>
          <Link
            href="/repository"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white font-semibold text-sm hover:bg-sky-400 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Repository
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 text-slate-100" style={{ background: '#070f1e' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/repository" className="hover:text-white transition-colors">Repository</Link>
          <span>/</span>
          <span className="text-sky-400 font-mono uppercase">{doc.document_type}</span>
        </div>

        {/* Header Record Card */}
        <div className="p-8 rounded-2xl border border-white/10 mb-8" style={{ background: '#0a1628' }}>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-2.5 py-1 rounded-md bg-sky-500/20 text-sky-300 text-xs font-bold uppercase tracking-wider">
              {doc.document_type.replace('_', ' ')}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 text-xs font-semibold capitalize">
              {doc.region}
            </span>
            {doc.year && (
              <span className="px-2.5 py-1 rounded-md bg-white/10 text-slate-300 text-xs">
                {doc.year}
              </span>
            )}
          </div>

          <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white mb-5 leading-snug">
            {doc.title}
          </h1>

          {/* Authors */}
          {doc.authors && doc.authors.length > 0 && (
            <div className="flex items-center gap-2 text-slate-300 text-sm mb-6 flex-wrap">
              <User size={15} className="text-sky-400 shrink-0" />
              <span className="font-medium">{doc.authors.join(', ')}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
            {doc.file_url ? (
              <a
                href={doc.file_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white font-semibold text-sm hover:bg-sky-400 transition-colors"
              >
                <Download size={15} /> Download Document
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-slate-400 font-semibold text-sm cursor-not-allowed">
                <FileText size={15} /> PDF Ingestion Pending
              </span>
            )}

            <Link
              href={`/assistant?q=Summarize research paper: ${encodeURIComponent(doc.title)}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 font-semibold text-sm hover:bg-sky-500/20 transition-colors"
            >
              <MessageSquare size={15} /> Analyze with Polar AI
            </Link>

            <Link
              href="/content-studio"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 text-slate-300 font-semibold text-sm hover:bg-white/10 transition-colors"
            >
              Outreach Studio
            </Link>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Abstract & Metadata */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="p-6 sm:p-8 rounded-2xl border border-white/10" style={{ background: '#0a1628' }}>
              <h2 className="font-display font-bold text-lg text-white mb-4">
                Abstract & Executive Summary
              </h2>
              <div className="text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
                {doc.abstract ? (
                  <p>{doc.abstract}</p>
                ) : doc.description ? (
                  <p>{doc.description}</p>
                ) : (
                  <p className="text-slate-400 italic">No formal abstract provided for this technical record.</p>
                )}
              </div>
            </div>

            {/* Keywords */}
            {doc.keywords && doc.keywords.length > 0 && (
              <div className="p-6 rounded-2xl border border-white/10" style={{ background: '#0a1628' }}>
                <h3 className="font-display font-bold text-xs text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Tag size={13} className="text-sky-400" />
                  <span>Indexation Keywords</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {doc.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg border border-white/10 text-slate-300 text-xs"
                      style={{ background: '#070f1e' }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar Metadata */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="p-6 rounded-2xl border border-white/10" style={{ background: '#0a1628' }}>
              <h3 className="font-display font-bold text-sm text-white mb-4">
                Metadata Information
              </h3>

              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Record ID</span>
                  <span className="font-mono text-slate-200 truncate max-w-44">{doc.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Region</span>
                  <span className="capitalize text-slate-200">{doc.region}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Peer Reviewed / Status</span>
                  <span className="text-emerald-400 font-semibold uppercase">{doc.status || 'Archived'}</span>
                </div>
                {doc.source && (
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">Source Agency</span>
                    <span className="text-slate-200">{doc.source}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Research Domains */}
            {doc.research_domains && doc.research_domains.length > 0 && (
              <div className="p-6 rounded-2xl border border-white/10" style={{ background: '#0a1628' }}>
                <h3 className="font-display font-bold text-xs text-slate-400 uppercase tracking-wider mb-3">
                  Research Domains
                </h3>
                <div className="flex flex-wrap gap-2">
                  {doc.research_domains.map((dom) => (
                    <span
                      key={dom}
                      className="px-3 py-1 rounded-lg bg-sky-950/80 border border-sky-500/30 text-sky-300 text-xs font-semibold"
                    >
                      {dom}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
