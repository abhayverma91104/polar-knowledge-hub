'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield, CheckCircle2, XCircle, ArrowLeft, RefreshCw,
  FileText, ExternalLink, AlertTriangle, Eye
} from 'lucide-react';
import { ingestionApi } from '@/lib/api';

interface PendingResource {
  id: string;
  title: string;
  document_type?: string;
  source_url?: string;
  abstract?: string;
  created_at?: string;
  year?: number;
}

export default function AdminReviewPage() {
  const [resources, setResources] = useState<PendingResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await ingestionApi.getPendingResources();
      setResources(res.data?.items || res.data || []);
    } catch {
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessingId(id);
    setMessage(null);
    try {
      await ingestionApi.approveResource(id, action);
      setMessage({
        type: 'success',
        text: `Resource successfully ${action === 'approve' ? 'approved and published' : 'rejected'}.`
      });
      setResources(prev => prev.filter(r => r.id !== id));
    } catch {
      setMessage({ type: 'error', text: `Failed to ${action} resource. Please try again.` });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 text-slate-100" style={{ background: '#070f1e' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
          <span>/</span>
          <span className="text-sky-400">Review Queue</span>
        </div>

        {/* Header */}
        <div className="p-8 rounded-2xl border border-white/10 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ background: '#0a1628' }}>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Shield size={14} />
              <span>Editorial Moderation</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
              Ingested Resource Review Queue
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Verify crawler-ingested scientific documents and reports before publishing them to the public repository.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 text-slate-300 hover:bg-white/10 text-xs font-semibold transition-colors"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <Link
              href="/admin/ingestion"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold transition-colors"
            >
              Crawler Dashboard
            </Link>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl mb-6 text-xs flex items-center gap-2 border ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="p-16 text-center rounded-2xl border border-white/10" style={{ background: '#0a1628' }}>
            <div className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-xs font-mono">Loading pending resources...</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="p-16 text-center rounded-2xl border border-white/10" style={{ background: '#0a1628' }}>
            <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-3" />
            <h3 className="font-display font-bold text-lg text-white mb-1">Queue is Clear!</h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto mb-6">
              All crawled documents have been reviewed and either approved or archived.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold transition-colors"
            >
              <ArrowLeft size={14} /> Back to Admin Overview
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {resources.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                style={{ background: '#0a1628' }}
              >
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold uppercase tracking-wider">
                      {item.document_type || 'Document'}
                    </span>
                    {item.year && (
                      <span className="text-slate-400 text-xs">Year: {item.year}</span>
                    )}
                  </div>

                  <h3 className="font-display font-bold text-base text-white">
                    {item.title}
                  </h3>

                  {item.abstract && (
                    <p className="text-slate-300 text-xs leading-relaxed line-clamp-2">
                      {item.abstract}
                    </p>
                  )}

                  {item.source_url && (
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:underline"
                    >
                      <ExternalLink size={11} /> Source: {item.source_url}
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                  <button
                    disabled={processingId === item.id}
                    onClick={() => handleAction(item.id, 'approve')}
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} /> Approve
                  </button>

                  <button
                    disabled={processingId === item.id}
                    onClick={() => handleAction(item.id, 'reject')}
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600/20 border border-rose-500/30 hover:bg-rose-600/30 text-rose-300 font-semibold text-xs transition-colors disabled:opacity-50"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
