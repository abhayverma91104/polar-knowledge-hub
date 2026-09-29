'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText, Database, Image, Video, Globe, Users,
  Clock, Activity, TrendingUp, RefreshCw, Search,
  Shield, ChevronRight, AlertCircle, CheckCircle, Loader2
} from 'lucide-react';
import { adminApi } from '@/lib/api';

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

const ADMIN_LINKS = [
  { href: '/admin/ingestion', label: 'Knowledge Ingestion', icon: Globe, description: 'Crawl NCPOR website, upload documents, manage sources', color: 'text-blue-500 bg-blue-50' },
  { href: '/admin/review', label: 'Content Review', icon: CheckCircle, description: 'Approve or reject ingested resources and AI content', color: 'text-green-500 bg-green-50' },
  { href: '/repository', label: 'Knowledge Repository', icon: Database, description: 'Browse and manage the knowledge base', color: 'text-purple-500 bg-purple-50' },
  { href: '/content-studio', label: 'Content Studio', icon: Activity, description: 'Generate and review AI outreach content', color: 'text-amber-500 bg-amber-50' },
];

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.getStats()
      .then(r => setStats(r.data))
      .catch(err => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Admin access required. Please log in with an admin account.');
        } else {
          setError('Failed to load admin stats. Is the API server running?');
        }
      })
      .finally(() => setLoading(false));
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
          <Link href="/login" className="btn-primary mx-auto">Sign in as Admin</Link>
          <p className="text-xs text-slate-400 mt-3">
            Demo credentials: admin@ncpor.res.in / PolarHub@2026
          </p>
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
    <div className="min-h-screen bg-polar-frost pt-16">
      {/* Header */}
      <div className="bg-polar-navy py-12">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-polar-cyan text-sm font-semibold mb-2">
                <Shield size={14} />
                Admin Dashboard
              </div>
              <h1 className="font-display font-bold text-3xl text-white">
                Platform Overview
              </h1>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/ingestion" className="btn-primary">
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
  );
}
