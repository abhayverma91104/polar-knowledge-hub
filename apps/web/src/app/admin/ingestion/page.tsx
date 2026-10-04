'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Globe, Upload, Plus, Play, Clock, CheckCircle, XCircle,
  Loader2, AlertCircle, FileText, Activity, ChevronRight,
  Search, Eye, Trash2, RefreshCw, ExternalLink
} from 'lucide-react';
import { ingestionApi, sourcesApi } from '@/lib/api';

interface CrawlJob {
  id: string;
  start_url: string;
  status: string;
  pages_scanned: number;
  documents_discovered: number;
  new_resources: number;
  updated_resources: number;
  duplicates_found: number;
  errors_count: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  error_log: string[];
}

const CRAWL_CONFIGS = {
  max_depth: 2,
  max_pages: 100,
  follow_links: true,
  download_pdfs: true,
  download_images: false,
  delay_seconds: 2,
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'badge-warning',
  running: 'badge-cyan',
  completed: 'badge-success',
  failed: 'badge-danger',
  paused: 'badge-warning',
};

export default function IngestionPage() {
  const [crawlUrl, setCrawlUrl] = useState('https://www.ncpor.res.in');
  const [crawlConfig, setCrawlConfig] = useState(CRAWL_CONFIGS);
  const [crawling, setCrawling] = useState(false);
  const [currentJob, setCurrentJob] = useState<CrawlJob | null>(null);
  const [jobs, setJobs] = useState<CrawlJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'crawl' | 'jobs'>('crawl');
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  const [crawlLog, setCrawlLog] = useState<string[]>([]);

  useEffect(() => {
    loadJobs();
    return () => { if (pollInterval) clearInterval(pollInterval); };
  }, []);

  const loadJobs = async () => {
    try {
      const res = await ingestionApi.listJobs();
      setJobs(res.data);
      if (res.data && res.data.length > 0 && crawlLog.length === 0) {
        const latest = res.data[0];
        setCurrentJob(latest);
        const initialLogs = [
          `[Job: ${latest.id.slice(0, 8)}] Target: ${latest.start_url}`,
          `Status: ${latest.status.toUpperCase()} · Scanned: ${latest.pages_scanned} pages · Discovered: ${latest.documents_discovered} docs`,
        ];
        if (latest.status === 'completed') {
          initialLogs.push(`✅ Crawl completed successfully. ${latest.new_resources || 0} new resources indexed.`);
        } else if (latest.error_log && latest.error_log.length > 0) {
          latest.error_log.forEach((err: string) => initialLogs.push(`❌ ${err}`));
        }
        setCrawlLog(initialLogs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setJobsLoading(false);
    }
  };

  const stopCrawl = async () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
    setCrawling(false);
    if (currentJob?.id) {
      try {
        await ingestionApi.stopJob(currentJob.id);
        setCrawlLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ⏹️ Crawl job stopped by user.`]);
        loadJobs();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const startCrawl = async () => {
    if (!crawlUrl.trim()) return;
    setCrawling(true);
    setCrawlLog([`[${new Date().toLocaleTimeString()}] Starting crawl: ${crawlUrl}...`]);
    setCurrentJob(null);

    try {
      const res = await ingestionApi.startCrawl(crawlUrl, crawlConfig);
      const jobId = res.data.job_id;
      setCrawlLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Crawl job started: ${jobId}`]);

      let lastPages = -1;
      let lastDocs = -1;
      let lastNew = -1;
      let lastStatus = '';

      // Poll for progress
      const interval = setInterval(async () => {
        try {
          const jobRes = await ingestionApi.getJob(jobId);
          const job = jobRes.data;
          setCurrentJob(job);

          const pagesChanged = job.pages_scanned !== lastPages;
          const docsChanged = job.documents_discovered !== lastDocs;
          const newChanged = job.new_resources !== lastNew;
          const statusChanged = job.status !== lastStatus;

          if (pagesChanged || docsChanged || newChanged || statusChanged) {
            const timestamp = `[${new Date().toLocaleTimeString()}]`;
            const logEntries: string[] = [];

            if (newChanged && lastNew !== -1 && job.new_resources > lastNew) {
              const delta = job.new_resources - lastNew;
              logEntries.push(`${timestamp} 📥 Discovered & staged ${delta} new resource${delta > 1 ? 's' : ''} (Total: ${job.new_resources})`);
            } else if (docsChanged && lastDocs !== -1 && job.documents_discovered > lastDocs && !newChanged) {
              const delta = job.documents_discovered - lastDocs;
              logEntries.push(`${timestamp} ℹ️ Discovered ${delta} document link${delta > 1 ? 's' : ''}`);
            }

            if (pagesChanged && job.pages_scanned > 0) {
              logEntries.push(`${timestamp} 🌐 Scanned page ${job.pages_scanned} · ${job.documents_discovered} docs discovered · ${job.new_resources} staged for review`);
            }

            if (logEntries.length > 0) {
              setCrawlLog(prev => [...prev, ...logEntries]);
            }

            lastPages = job.pages_scanned;
            lastDocs = job.documents_discovered;
            lastNew = job.new_resources;
            lastStatus = job.status;
          }

          if (job.status === 'completed' || job.status === 'failed') {
            clearInterval(interval);
            setPollInterval(null);
            setCrawling(false);
            loadJobs();
            const emoji = job.status === 'completed' ? '✅' : '⚠️';
            setCrawlLog(prev => [
              ...prev,
              `[${new Date().toLocaleTimeString()}] ${emoji} Crawl ${job.status === 'completed' ? 'completed successfully' : 'ended (' + job.status + ')'}. ${job.pages_scanned} pages scanned, ${job.new_resources} new resources indexed for review.`
            ]);
          }
        } catch (e) {
          console.error(e);
        }
      }, 2000);
      setPollInterval(interval);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } }; message?: string };
      setCrawling(false);
      const msg = err.response?.data?.detail || err.message || 'Failed to start crawl';
      setCrawlLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ❌ Error: ${msg}`]);
    }
  };

  return (
    <div className="min-h-screen bg-polar-frost pt-16">
      <div className="py-12" style={{ background: '#0a1628' }}>
        <div className="max-w-screen-xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-2 text-polar-cyan text-sm font-semibold mb-2">
            <Globe size={14} />
            Admin · Ingestion Engine
          </div>
          <h1 className="font-display font-bold text-3xl text-white mb-2">
            Knowledge Ingestion
          </h1>
          <p className="text-white/60">
            Import and synchronize publicly available polar science resources from NCPOR.
          </p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit mb-8">
          {[
            { id: 'crawl', label: 'Crawl NCPOR Website', icon: Globe },
            { id: 'jobs', label: 'Job History', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'crawl' | 'jobs')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-polar-navy text-white shadow-sm'
                    : 'text-slate-500 hover:text-polar-navy'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'crawl' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Config Panel */}
            <div className="space-y-5">
              <div className="card p-6">
                <h2 className="font-display font-bold text-xl text-polar-navy mb-5 flex items-center gap-2">
                  <Globe size={18} className="text-polar-cyan" />
                  Crawl NCPOR Website
                </h2>

                <div className="mb-5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    NCPOR URL *
                  </label>
                  <input
                    type="url"
                    value={crawlUrl}
                    onChange={(e) => setCrawlUrl(e.target.value)}
                    placeholder="https://www.ncpor.res.in"
                    className="input w-full"
                    disabled={crawling}
                  />
                  <p className="text-xs text-slate-400 mt-1.5">
                    Only approved NCPOR domains are permitted (ncpor.res.in, ncaor.gov.in)
                  </p>
                </div>

                {/* Config */}
                <div className="space-y-3 mb-5">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Configuration</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Max Depth</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={crawlConfig.max_depth}
                        onChange={(e) => setCrawlConfig(c => ({ ...c, max_depth: +e.target.value }))}
                        className="input w-full text-sm py-2"
                        disabled={crawling}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Max Pages</label>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={crawlConfig.max_pages}
                        onChange={(e) => setCrawlConfig(c => ({ ...c, max_pages: +e.target.value }))}
                        className="input w-full text-sm py-2"
                        disabled={crawling}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {[
                      { key: 'download_pdfs', label: 'Download PDFs' },
                      { key: 'follow_links', label: 'Follow internal links' },
                      { key: 'download_images', label: 'Download images' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(crawlConfig as Record<string, unknown>)[key] as boolean}
                          onChange={(e) => setCrawlConfig(c => ({ ...c, [key]: e.target.checked }))}
                          className="accent-polar-cyan"
                          disabled={crawling}
                        />
                        <span className="text-sm text-slate-600">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Safety notice */}
                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 mb-5">
                  <AlertCircle size={13} className="mt-0.5 shrink-0" />
                  <span>The crawler respects robots.txt, uses rate limiting, and only accesses publicly available resources. It never bypasses authentication or access controls.</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={startCrawl}
                    disabled={crawling || !crawlUrl.trim()}
                    className="btn-primary flex-1 py-3.5 text-base justify-center disabled:opacity-50"
                  >
                    {crawling ? (
                      <><Loader2 size={18} className="animate-spin" /> Crawling...</>
                    ) : (
                      <><Play size={18} /> Start Crawl</>
                    )}
                  </button>
                  {crawling && (
                    <button
                      type="button"
                      onClick={stopCrawl}
                      className="btn-secondary py-3.5 px-4 text-rose-500 border-rose-300 hover:bg-rose-50 flex items-center gap-1.5 text-sm font-semibold"
                    >
                      <XCircle size={18} /> Stop
                    </button>
                  )}
                </div>
              </div>

              {/* Progress */}
              {currentJob && (
                <div className="card p-6">
                  <h3 className="font-display font-bold text-lg text-polar-navy mb-4 flex items-center gap-2">
                    <Activity size={16} className="text-polar-cyan" />
                    Crawl Progress
                    <span className={`badge ${STATUS_COLORS[currentJob.status] || 'badge-navy'} text-xs ml-auto`}>
                      {currentJob.status}
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Pages Scanned', value: currentJob.pages_scanned },
                      { label: 'Docs Discovered', value: currentJob.documents_discovered },
                      { label: 'New Resources', value: currentJob.new_resources },
                      { label: 'Duplicates', value: currentJob.duplicates_found },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-polar-frost border border-slate-200 rounded-xl p-3">
                        <div className="text-2xl font-display font-bold text-polar-navy">{value}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{label}</div>
                      </div>
                    ))}
                  </div>

                  {currentJob.status === 'completed' && (
                    <div className="mt-4 flex gap-2">
                      <Link href="/admin/review" className="btn-primary flex-1 justify-center">
                        <Eye size={14} />
                        Review Resources
                      </Link>
                      <Link href="/repository" className="btn-secondary flex-1 justify-center">
                        <Search size={14} />
                        Search Repository
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Log / Status Panel */}
            <div className="space-y-5">
              {/* Crawl Log */}
              <div className="card p-6">
                <h3 className="font-display font-bold text-lg text-polar-navy mb-3 flex items-center gap-2">
                  <FileText size={16} className="text-slate-400" />
                  Crawl Log
                </h3>
                <div
                  className="rounded-xl p-4 font-mono text-xs min-h-56 max-h-96 overflow-y-auto"
                  style={{
                    backgroundColor: '#f1f5f9',
                    border: '1.5px solid #cbd5e1',
                    color: '#000000',
                  }}
                >
                  {crawlLog.length === 0 ? (
                    <span style={{ color: '#64748b' }}>Ready to crawl. Enter URL and click Start Crawl.</span>
                  ) : (
                    crawlLog.map((line, i) => {
                      let textColor = '#000000';
                      let fontWeight = 500;
                      if (line.includes('✅')) {
                        textColor = '#047857';
                        fontWeight = 700;
                      } else if (line.includes('❌') || line.includes('Error') || line.includes('failed')) {
                        textColor = '#dc2626';
                        fontWeight = 700;
                      } else if (line.includes('Starting crawl') || line.includes('Crawl job started')) {
                        textColor = '#0369a1';
                        fontWeight = 600;
                      }

                      return (
                        <div
                          key={i}
                          className="mb-1.5 leading-relaxed font-mono text-xs"
                          style={{ color: textColor, fontWeight }}
                        >
                          {line}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Upload Documents */}
              <div className="card p-6">
                <h2 className="font-display font-bold text-xl text-polar-navy mb-3 flex items-center gap-2">
                  <Upload size={18} className="text-polar-cyan" />
                  Upload Documents
                </h2>
                <p className="text-slate-500 text-sm mb-4">
                  Upload PDF, DOCX, TXT, CSV, JSON, or XLSX files to add directly to the knowledge base.
                </p>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-polar-cyan/40 transition-colors">
                  <Upload size={28} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-500 mb-1">Drop files here</p>
                  <p className="text-xs text-slate-400 mb-4">PDF, DOCX, TXT, CSV, JSON, XLSX · Max 100MB</p>
                  <Link href="/repository" className="btn-secondary text-sm">
                    Upload in Repository
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-xl text-polar-navy">Crawl Job History</h2>
              <button onClick={loadJobs} className="btn-ghost border border-slate-200 text-sm">
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {jobsLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="card p-5 h-24 skeleton" />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="card p-16 text-center">
                <Activity size={40} className="text-slate-300 mx-auto mb-4" />
                <h3 className="font-display font-bold text-lg text-polar-navy mb-2">No crawl jobs yet</h3>
                <p className="text-slate-500">Start your first crawl from the Crawl tab.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="card p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`badge ${STATUS_COLORS[job.status] || 'badge-navy'} text-xs`}>
                            {job.status}
                          </span>
                          {job.status === 'running' && (
                            <Loader2 size={12} className="text-polar-cyan animate-spin" />
                          )}
                        </div>
                        <a
                          href={job.start_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-polar-navy font-semibold text-sm hover:text-polar-cyan transition-colors flex items-center gap-1"
                        >
                          {job.start_url} <ExternalLink size={11} />
                        </a>
                        <div className="text-xs text-slate-400 mt-1">
                          Started: {job.started_at ? new Date(job.started_at).toLocaleString() : new Date(job.created_at).toLocaleString()}
                          {job.completed_at && ` · Completed: ${new Date(job.completed_at).toLocaleString()}`}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {[
                        { label: 'Pages', value: job.pages_scanned },
                        { label: 'Found', value: job.documents_discovered },
                        { label: 'New', value: job.new_resources },
                        { label: 'Dupes', value: job.duplicates_found },
                        { label: 'Errors', value: job.errors_count },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-slate-50 rounded-lg p-2.5 text-center">
                          <div className="font-bold text-lg text-polar-navy">{value}</div>
                          <div className="text-xs text-slate-400">{label}</div>
                        </div>
                      ))}
                    </div>

                    {job.error_log && job.error_log.length > 0 && (
                      <details className="mt-3">
                        <summary className="text-xs text-red-500 cursor-pointer font-medium">
                          {job.error_log.length} error(s)
                        </summary>
                        <div className="mt-2 p-3 bg-red-50 rounded-lg text-xs text-red-600 space-y-1">
                          {job.error_log.slice(0, 5).map((e, i) => (
                            <div key={i}>{e}</div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
