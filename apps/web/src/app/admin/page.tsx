'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText, Database, Image, Video, Globe, Users,
  Clock, Activity, TrendingUp, RefreshCw, Search,
  Shield, ChevronRight, AlertCircle, CheckCircle, Loader2,
  Cpu, Sparkles
} from 'lucide-react';
import { adminApi, assistantApi } from '@/lib/api';

interface AdminStats {
  total_documents: number;
  pending_review: number;
  total_datasets: number;
  total_media: number;
  total_expeditions: number;
  total_users: number;
  pending_content: number;
  total_crawl_jobs: number;
  recent_queries: Array<{ query: string; created_at: string }>;
}

interface AIStatus {
  ai_active: boolean;
  has_key: boolean;
  status: string;
  model?: string;
  embed_model?: string;
  provider?: string;
}

const ADMIN_LINKS = [
  { href: '/admin/ingestion', label: 'Knowledge Ingestion', icon: Globe, description: 'Crawl NCPOR website, upload documents, manage sources', color: 'text-blue-500 bg-blue-50' },
  { href: '/admin/review', label: 'Content Review', icon: CheckCircle, description: 'Approve or reject ingested resources and AI content', color: 'text-green-500 bg-green-50' },
  { href: '/repository', label: 'Knowledge Repository', icon: Database, description: 'Browse and manage the knowledge base', color: 'text-purple-500 bg-purple-50' },
  { href: '/content-studio', label: 'Content Studio', icon: Activity, description: 'Generate and review AI outreach content', color: 'text-amber-500 bg-amber-50' },
];

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.allSettled([
      adminApi.getStats(),
      assistantApi.status(),
    ]).then(([statsRes, aiRes]) => {
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data);
      } else {
        const err = statsRes.reason as { response?: { status?: number } };
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Admin or Editor access required. Please log in with an authorized account.');
        } else {
          setError('Failed to load admin stats. Is the API server running?');
        }
      }

      if (aiRes.status === 'fulfilled') {
        setAiStatus(aiRes.value.data);
      } else {
        setAiStatus({ ai_active: false, has_key: false, status: 'disconnected', provider: 'Google Gemini' });
      }
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-polar-frost pt-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-polar-cyan animate-spin" />
          <p className="text-slate-500">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-polar-frost pt-16 flex items-center justify-center">
        <div className="card p-10 max-w-md text-center">
          <Shield size={40} className="text-slate-300 mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl text-polar-navy mb-2">Access Restricted</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <Link href="/login" className="btn-primary mx-auto">Sign in</Link>
        </div>
      </div>
    );
  }

  const STAT_CARDS = [
    { label: 'Total Documents', value: stats?.total_documents || 0, icon: FileText, color: 'text-blue-500 bg-blue-50', sub: `${stats?.pending_review || 0} pending review`, href: '/repository' },
    { label: 'Datasets', value: stats?.total_datasets || 0, icon: Database, color: 'text-purple-500 bg-purple-50', sub: 'All datasets', href: '/repository?type=dataset' },
    { label: 'Media Assets', value: stats?.total_media || 0, icon: Image, color: 'text-rose-500 bg-rose-50', sub: 'Images & videos', href: '/media' },
    { label: 'Expeditions', value: stats?.total_expeditions || 0, icon: Globe, color: 'text-teal-500 bg-teal-50', sub: 'Documented', href: '/expeditions' },
    { label: 'Users', value: stats?.total_users || 0, icon: Users, color: 'text-amber-500 bg-amber-50', sub: 'Registered accounts', href: '#' },
    { label: 'Crawl Jobs', value: stats?.total_crawl_jobs || 0, icon: Activity, color: 'text-indigo-500 bg-indigo-50', sub: 'Ingestion jobs', href: '/admin/ingestion' },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface pt-16 transition-colors">
      {/* Header */}
      <div className="py-12 bg-white dark:bg-[#0a1628] border-b border-[#bfc7d2]/40 dark:border-white/10 transition-colors">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#006194] dark:text-sky-400 text-sm font-semibold mb-2 font-mono">
                <Shield size={14} />
                Admin Dashboard
              </div>
              <h1 className="font-display font-bold text-3xl text-on-surface">
                Platform Overview
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {aiStatus?.has_key ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/25 px-3 py-2 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Gemini AI Live ({aiStatus.model || 'gemini-flash-lite'})
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-500/25 px-3 py-2 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Gemini API Key Required
                </div>
              )}
              <Link href="/admin/ingestion" className="inline-flex items-center gap-2 px-4 py-2 bg-[#006194] hover:bg-[#007bb9] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors">
                <Globe size={16} />
                Knowledge Ingestion
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 lg:px-8 py-10">
        {/* Alerts */}
        {stats && stats.pending_review > 0 && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
            <AlertCircle size={18} className="text-amber-500 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold text-amber-800">{stats.pending_review} documents</span>
              <span className="text-amber-700"> awaiting review</span>
            </div>
            <Link href="/admin/review" className="btn-secondary text-amber-600 border-amber-300 text-sm">
              Review Now <ChevronRight size={14} />
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
          {STAT_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.label} href={card.href} className="card p-5 hover-lift">
                <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
                  <Icon size={20} />
                </div>
                <div className="font-display font-bold text-2xl text-polar-navy mb-0.5">
                  {card.value.toLocaleString()}
                </div>
                <div className="font-semibold text-sm text-slate-600 mb-0.5">{card.label}</div>
                <div className="text-xs text-slate-400">{card.sub}</div>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Admin Actions */}
          <div className="lg:col-span-2">
            <h2 className="font-display font-bold text-xl text-polar-navy mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ADMIN_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="card p-6 group hover-lift flex flex-col"
                  >
                    <div className={`w-10 h-10 rounded-xl ${link.color} flex items-center justify-center mb-4`}>
                      <Icon size={20} />
                    </div>
                    <h3 className="font-display font-bold text-lg text-polar-navy mb-1 group-hover:text-polar-cyan transition-colors">
                      {link.label}
                    </h3>
                    <p className="text-slate-500 text-sm">{link.description}</p>
                    <div className="mt-3 flex items-center gap-1 text-polar-cyan text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Open <ChevronRight size={14} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Column: AI Engine Status & Recent Searches */}
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-bold text-xl text-polar-navy mb-4 flex items-center justify-between">
                <span>AI & Retrieval Engine</span>
                <span className="text-xs font-normal text-slate-400">Google Gemini</span>
              </h2>
              <div className="card p-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-polar-navy flex items-center justify-center text-polar-cyan">
                      <Cpu size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-polar-navy">Gemini AI Pipeline</div>
                      <div className="text-xs text-slate-400">RAG & Synthesis Engine</div>
                    </div>
                  </div>
                  {aiStatus?.has_key ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Key Required
                    </span>
                  )}
                </div>

                <div className="space-y-2.5 pt-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Generation Model:</span>
                    <span className="font-mono text-polar-navy font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
                      {aiStatus?.model || (aiStatus?.has_key ? 'gemini-flash-lite-latest' : 'demo-mock')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Embedding Model:</span>
                    <span className="font-mono text-polar-navy font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
                      {aiStatus?.embed_model || (aiStatus?.has_key ? 'gemini-embedding-001' : '384-dim mock')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Provider & Protocol:</span>
                    <span className="text-slate-700 font-medium">
                      Google GenAI SDK (v1)
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href="/assistant"
                    className="text-xs font-semibold text-polar-cyan hover:underline flex items-center gap-1"
                  >
                    <Sparkles size={12} /> Test Polar Assistant
                  </Link>
                  <Link
                    href="/content-studio"
                    className="text-xs text-slate-500 hover:text-polar-navy"
                  >
                    Open Content Studio →
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Queries */}
            <div>
              <h2 className="font-display font-bold text-xl text-polar-navy mb-4">Recent Searches</h2>
              <div className="card divide-y divide-slate-100">
                {stats?.recent_queries && stats.recent_queries.length > 0 ? (
                  stats.recent_queries.map((q, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3">
                      <Search size={13} className="text-slate-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-slate-700 font-medium truncate">{q.query}</div>
                        <div className="text-xs text-slate-400">
                          {new Date(q.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-slate-400 text-sm">
                    No searches yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
