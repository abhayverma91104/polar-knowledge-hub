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

  const handleDownloadDocument = () => {
    if (!doc) return;
    if (doc.file_url && (doc.file_url.startsWith('http://') || doc.file_url.startsWith('https://') || doc.file_url.startsWith('/'))) {
      const a = document.createElement('a');
      a.href = doc.file_url;
      a.download = `${doc.title.slice(0, 40).replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    const content = `# ${doc.title}
**National Centre for Polar and Ocean Research (NCPOR)**
*Ministry of Earth Sciences, Government of India*

---
- **Document ID**: ${doc.id}
- **Document Type**: ${doc.document_type ? doc.document_type.toUpperCase() : 'SCIENTIFIC REPORT'}
- **Year / Date**: ${doc.year || doc.publication_date || 'N/A'}
- **Region**: ${doc.region ? doc.region.toUpperCase() : 'POLAR REGION'}
- **Authors**: ${doc.authors && doc.authors.length > 0 ? doc.authors.join(', ') : 'NCPOR Scientific Division'}
- **Source**: ${doc.source || 'NCPOR Knowledge Repository'}
${doc.source_url ? `- **Source URL**: ${doc.source_url}` : ''}
- **Research Domains**: ${doc.research_domains?.join(', ') || 'Polar & Cryospheric Sciences'}
- **Keywords**: ${doc.keywords?.join(', ') || 'N/A'}

---

## Abstract & Executive Summary
${doc.abstract || doc.description || 'No formal abstract provided.'}

---

## Suggested Citation
${doc.authors && doc.authors.length > 0 ? doc.authors.join(', ') : 'NCPOR'} (${doc.year || '2024'}). "${doc.title}". *National Centre for Polar and Ocean Research Knowledge Repository*. Record ID: ${doc.id}.

---
*Downloaded from Polar Knowledge Hub · Government of India*
`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.title.slice(0, 40).replace(/[^a-zA-Z0-9_-]/g, '_')}_NCPOR.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-surface text-on-surface">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#006194] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-on-surface-variant font-mono text-sm">Retrieving scientific publication...</p>
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-surface text-on-surface">
        <div className="text-center max-w-md p-8 rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 bg-white dark:bg-[#0a1628] shadow-md">
          <h2 className="text-xl font-bold text-on-surface mb-2">Record Not Found</h2>
          <p className="text-on-surface-variant text-sm mb-6">The requested scientific record could not be found in the repository.</p>
          <Link
            href="/repository"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#006194] hover:bg-[#007bb9] text-white font-semibold text-sm transition-colors shadow-sm"
          >
            <ArrowLeft size={16} /> Back to Repository
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-surface text-on-surface transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-8">
          <Link href="/" className="hover:text-[#006194] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/repository" className="hover:text-[#006194] transition-colors">Repository</Link>
          <span>/</span>
          <span className="text-[#006194] dark:text-sky-400 font-mono uppercase">{doc.document_type}</span>
        </div>

        {/* Header Record Card */}
        <div className="p-6 sm:p-8 rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 bg-white dark:bg-[#0a1628] shadow-sm mb-8 transition-colors">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-2.5 py-1 rounded-md bg-[#cce5ff] text-[#004b73] dark:bg-sky-950 dark:text-sky-300 text-xs font-bold uppercase tracking-wider font-mono">
              {doc.document_type.replace('_', ' ')}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[#89f5e7]/40 text-[#005049] dark:bg-teal-950 dark:text-teal-300 text-xs font-semibold capitalize font-mono">
              {doc.region}
            </span>
            {doc.year && (
              <span className="px-2.5 py-1 rounded-md bg-[#ebf5ff] dark:bg-white/10 text-on-surface-variant text-xs font-mono">
                {doc.year}
              </span>
            )}
          </div>

          <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-on-surface mb-5 leading-snug">
            {doc.title}
          </h1>

          {/* Authors */}
          {doc.authors && doc.authors.length > 0 && (
            <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-6 flex-wrap">
              <User size={15} className="text-[#006194] dark:text-sky-400 shrink-0" />
              <span className="font-medium text-on-surface">{doc.authors.join(', ')}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#bfc7d2]/30 dark:border-white/10">
            <button
              onClick={handleDownloadDocument}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#006194] hover:bg-[#007bb9] text-white font-semibold text-sm transition-colors shadow-sm cursor-pointer"
            >
              <Download size={15} /> Download Document
            </button>

            <Link
              href={`/assistant?q=Summarize research paper: ${encodeURIComponent(doc.title)}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ebf5ff] dark:bg-sky-950/40 border border-[#006194]/30 text-[#006194] dark:text-sky-300 font-semibold text-sm hover:bg-[#d4ebff] dark:hover:bg-sky-900/40 transition-colors"
            >
              <MessageSquare size={15} /> Analyze with Polar AI
            </Link>

            <Link
              href="/content-studio"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#bfc7d2]/40 dark:border-white/15 text-on-surface hover:bg-[#ebf5ff] dark:hover:bg-white/10 font-semibold text-sm transition-colors"
            >
              Outreach Studio
            </Link>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Abstract & Metadata */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="p-6 sm:p-8 rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 bg-white dark:bg-[#0a1628] shadow-sm transition-colors">
              <h2 className="font-display font-bold text-lg text-on-surface mb-4">
                Abstract & Executive Summary
              </h2>
              <div className="text-on-surface-variant text-sm sm:text-base leading-relaxed space-y-4">
                {doc.abstract ? (
                  <p>{doc.abstract}</p>
                ) : doc.description ? (
                  <p>{doc.description}</p>
                ) : (
                  <p className="text-on-surface-variant/70 italic">No formal abstract provided for this technical record.</p>
                )}
              </div>
            </div>

            {/* Keywords */}
            {doc.keywords && doc.keywords.length > 0 && (
              <div className="p-6 rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 bg-white dark:bg-[#0a1628] shadow-sm transition-colors">
                <h3 className="font-display font-bold text-xs text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Tag size={13} className="text-[#006194] dark:text-sky-400" />
                  <span>Indexation Keywords</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {doc.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg border border-[#bfc7d2]/40 dark:border-white/10 bg-[#ebf5ff] dark:bg-[#0c1c30] text-on-surface text-xs font-mono"
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
            
            <div className="p-6 rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 bg-white dark:bg-[#0a1628] shadow-sm transition-colors">
              <h3 className="font-display font-bold text-sm text-on-surface mb-4">
                Metadata Information
              </h3>

              <div className="space-y-3.5 text-xs text-on-surface-variant">
                <div className="flex justify-between py-2 border-b border-[#bfc7d2]/20 dark:border-white/5">
                  <span className="text-on-surface-variant">Record ID</span>
                  <span className="font-mono text-on-surface truncate max-w-44">{doc.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#bfc7d2]/20 dark:border-white/5">
                  <span className="text-on-surface-variant">Region</span>
                  <span className="capitalize text-on-surface font-semibold">{doc.region}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#bfc7d2]/20 dark:border-white/5">
                  <span className="text-on-surface-variant">Peer Reviewed / Status</span>
                  <span className="text-[#00685f] dark:text-emerald-400 font-semibold uppercase">{doc.status || 'Archived'}</span>
                </div>
                {doc.source && (
                  <div className="flex justify-between py-2 border-b border-[#bfc7d2]/20 dark:border-white/5">
                    <span className="text-on-surface-variant">Source Agency</span>
                    <span className="text-on-surface">{doc.source}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Research Domains */}
            {doc.research_domains && doc.research_domains.length > 0 && (
              <div className="p-6 rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 bg-white dark:bg-[#0a1628] shadow-sm transition-colors">
                <h3 className="font-display font-bold text-xs text-on-surface-variant uppercase tracking-wider mb-3">
                  Research Domains
                </h3>
                <div className="flex flex-wrap gap-2">
                  {doc.research_domains.map((dom) => (
                    <span
                      key={dom}
                      className="px-3 py-1 rounded-lg bg-[#ebf5ff] dark:bg-sky-950/80 border border-[#006194]/30 dark:border-sky-500/30 text-[#006194] dark:text-sky-300 text-xs font-semibold"
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
