'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search, Filter, FileText, Database, Image, Video,
  Download, ExternalLink, ChevronRight, X, SlidersHorizontal,
  BookOpen, Newspaper, Calendar, MapPin, User, Tag
} from 'lucide-react';
import { searchApi, documentsApi } from '@/lib/api';

const DOCUMENT_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'expedition_report', label: 'Expedition Reports' },
  { value: 'research_paper', label: 'Research Papers' },
  { value: 'publication', label: 'Publications' },
  { value: 'technical_report', label: 'Technical Reports' },
  { value: 'dataset', label: 'Datasets' },
  { value: 'news', label: 'News' },
  { value: 'educational', label: 'Educational' },
];

const REGIONS = [
  { value: '', label: 'All Regions' },
  { value: 'antarctica', label: 'Antarctica' },
  { value: 'arctic', label: 'Arctic' },
  { value: 'both', label: 'Both' },
];

const DOMAINS = [
  'Climate Science', 'Glaciology', 'Oceanography',
  'Atmospheric Science', 'Biology', 'Geology', 'Environmental Science',
];

const SEARCH_TYPES = [
  { value: 'hybrid', label: 'Smart Search' },
  { value: 'semantic', label: 'Semantic' },
  { value: 'keyword', label: 'Keyword' },
];

function DocTypeIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    expedition_report: <BookOpen size={14} />,
    research_paper: <FileText size={14} />,
    publication: <FileText size={14} />,
    technical_report: <FileText size={14} />,
    dataset: <Database size={14} />,
    news: <Newspaper size={14} />,
    image: <Image size={14} />,
    video: <Video size={14} />,
  };
  return <span className="text-polar-cyan">{icons[type] || <FileText size={14} />}</span>;
}

function DocTypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    expedition_report: 'Expedition Report',
    research_paper: 'Research Paper',
    publication: 'Publication',
    technical_report: 'Technical Report',
    dataset: 'Dataset',
    news: 'News',
    educational: 'Educational',
    other: 'Document',
  };
  return (
    <span className="badge badge-cyan text-xs">
      {labels[type] || type}
    </span>
  );
}

interface Document {
  id: string;
  title: string;
  document_type: string;
  year?: number;
  region?: string;
  research_domains: string[];
  keywords: string[];
  abstract?: string;
  source?: string;
  source_url?: string;
  file_url?: string;
  similarity?: number;
}

interface SearchResult {
  total: number;
  results: Document[];
  latency_ms: number;
  search_type: string;
}

function RepositoryContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState('hybrid');
  const [filters, setFilters] = useState({
    document_type: '',
    region: '',
    research_domain: '',
    year: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const doSearch = useCallback(async (q: string, p = 1, currentFilters = filters) => {
    if (!q.trim() && !currentFilters.document_type && !currentFilters.region && !currentFilters.research_domain) {
      // Show all documents
      setLoading(true);
      try {
        const res = await documentsApi.list({
          page: p,
          page_size: 20,
          document_type: currentFilters.document_type || undefined,
          region: currentFilters.region || undefined,
        });
        setResults({
          total: res.data.total,
          results: res.data.items,
          latency_ms: 0,
          search_type: 'browse',
        });
      } catch (e) {
        console.error('List documents error:', e);
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const res = await searchApi.search(
        q || '',
        searchType,
        {
          document_type: currentFilters.document_type || undefined,
          region: currentFilters.region || undefined,
        },
        p
      );
      setResults(res.data);
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setLoading(false);
    }
  }, [filters, searchType]);

  useEffect(() => {
    doSearch(query, 1, filters);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    doSearch(query, 1, filters);
  };

  const clearFilters = () => {
    const empty = { document_type: '', region: '', research_domain: '', year: '' };
    setFilters(empty);
    setPage(1);
    doSearch(query, 1, empty);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-polar-frost pt-16">
      {/* Header */}
      <div className="py-16" style={{ background: '#0a1628' }}>
        <div className="max-w-screen-xl mx-auto px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold uppercase tracking-wider mb-4 border border-sky-500/30">
            <Database size={13} />
            <span>Knowledge Repository</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-3">
            Polar Knowledge Repository
          </h1>
          <p className="text-slate-300 text-base sm:text-lg mb-8 max-w-2xl font-light">
            Search across decades of Indian polar science publications, datasets, and expedition records.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search reports, publications, datasets, expeditions..."
                className="w-full pl-12 pr-4 py-3.5 text-sm sm:text-base rounded-xl border text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                style={{ background: '#070f1e', borderColor: 'rgba(255,255,255,0.15)' }}
              />
            </div>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="py-3.5 px-3 sm:w-40 text-sm rounded-xl border text-white focus:outline-none focus:border-sky-500"
              style={{ background: '#070f1e', borderColor: 'rgba(255,255,255,0.15)' }}
            >
              {SEARCH_TYPES.map((t) => (
                <option key={t.value} value={t.value} style={{ background: '#0a1628', color: '#fff' }}>{t.label}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-6 py-3.5 text-sm font-semibold rounded-xl bg-sky-500 hover:bg-sky-400 text-white transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="card p-5 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-polar-navy">Filters</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-polar-cyan hover:text-sky-700 font-medium"
                  >
                    Clear all ({activeFilterCount})
                  </button>
                )}
              </div>

              <div className="space-y-5">
                {/* Content Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Content Type
                  </label>
                  <div className="space-y-1">
                    {DOCUMENT_TYPES.map((type) => (
                      <label key={type.value} className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
                        <input
                          type="radio"
                          name="doc_type"
                          value={type.value}
                          checked={filters.document_type === type.value}
                          onChange={(e) => {
                            const updated = { ...filters, document_type: e.target.value };
                            setFilters(updated);
                            setPage(1);
                            doSearch(query, 1, updated);
                          }}
                          className="accent-polar-cyan"
                        />
                        <span className="text-sm text-slate-600 group-hover:text-polar-navy transition-colors">
                          {type.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Region */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Region
                  </label>
                  <div className="space-y-1">
                    {REGIONS.map((region) => (
                      <label key={region.value} className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
                        <input
                          type="radio"
                          name="region"
                          value={region.value}
                          checked={filters.region === region.value}
                          onChange={(e) => {
                            const updated = { ...filters, region: e.target.value };
                            setFilters(updated);
                            setPage(1);
                            doSearch(query, 1, updated);
                          }}
                          className="accent-polar-cyan"
                        />
                        <span className="text-sm text-slate-600 group-hover:text-polar-navy transition-colors">
                          {region.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Research Domain */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Research Domain
                  </label>
                  <div className="space-y-1">
                    {DOMAINS.map((domain) => (
                      <label key={domain} className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.research_domain === domain}
                          onChange={(e) => {
                            const updated = { ...filters, research_domain: e.target.checked ? domain : '' };
                            setFilters(updated);
                            setPage(1);
                            doSearch(query, 1, updated);
                          }}
                          className="accent-polar-cyan"
                        />
                        <span className="text-sm text-slate-600 group-hover:text-polar-navy transition-colors">
                          {domain}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-5">
              <div className="text-sm text-slate-500">
                {loading ? (
                  <div className="w-40 h-4 skeleton" />
                ) : results ? (
                  <span>
                    <strong className="text-polar-navy">{results.total.toLocaleString()}</strong> results
                    {query && <> for &ldquo;<strong className="text-polar-cyan">{query}</strong>&rdquo;</>}
                    {results.latency_ms > 0 && (
                      <span className="text-slate-400"> · {results.latency_ms}ms</span>
                    )}
                  </span>
                ) : null}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden btn-ghost border border-slate-200 text-sm"
              >
                <SlidersHorizontal size={14} />
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="card p-6">
                    <div className="flex gap-3 mb-3">
                      <div className="w-16 h-5 skeleton" />
                      <div className="w-24 h-5 skeleton" />
                    </div>
                    <div className="w-3/4 h-5 skeleton mb-2" />
                    <div className="w-full h-4 skeleton mb-1" />
                    <div className="w-2/3 h-4 skeleton" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && results && results.results.length === 0 && (
              <div className="card p-16 text-center">
                <Search size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="font-display font-bold text-xl text-polar-navy mb-2">No results found</h3>
                <p className="text-slate-500">
                  No documents found for your selected filters.
                  {query && <> Try a different search term or remove filters.</>}
                </p>
                <button onClick={clearFilters} className="btn-primary mt-5 mx-auto">
                  Clear Filters
                </button>
              </div>
            )}

            {/* Results list */}
            {!loading && results && results.results.length > 0 && (
              <div className="space-y-4">
                {results.results.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/repository/${doc.id}`}
                    className="card p-6 block group hover:border-polar-cyan/20"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <DocTypeBadge type={doc.document_type} />
                      {doc.year && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Calendar size={11} />
                          {doc.year}
                        </span>
                      )}
                      {doc.region && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <MapPin size={11} />
                          {doc.region.charAt(0).toUpperCase() + doc.region.slice(1)}
                        </span>
                      )}
                      {doc.similarity && doc.similarity > 0.5 && (
                        <span className="badge badge-success text-xs">
                          {Math.round(doc.similarity * 100)}% match
                        </span>
                      )}
                    </div>

                    <h2 className="font-display font-bold text-lg text-polar-navy group-hover:text-polar-cyan transition-colors mb-2 line-clamp-2">
                      {doc.title}
                    </h2>

                    {doc.abstract && (
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-3">
                        {doc.abstract}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                      {doc.research_domains?.slice(0, 3).map((d) => (
                        <span key={d} className="text-xs text-polar-cyan font-medium">
                          {d}
                        </span>
                      ))}
                      {doc.source && (
                        <span className="text-xs text-slate-400">
                          Source: {doc.source}
                        </span>
                      )}

                      <div className="ml-auto flex items-center gap-2">
                        {doc.file_url && (
                          <span className="flex items-center gap-1 text-xs text-slate-400 hover:text-polar-cyan transition-colors">
                            <Download size={12} />
                            Download
                          </span>
                        )}
                        {doc.source_url && (
                          <span className="flex items-center gap-1 text-xs text-slate-400 hover:text-polar-cyan transition-colors">
                            <ExternalLink size={12} />
                            Original
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-polar-cyan font-semibold group-hover:gap-2 transition-all">
                          View <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Pagination */}
                {results.total > 20 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    {page > 1 && (
                      <button
                        onClick={() => { setPage(p => p - 1); doSearch(query, page - 1); }}
                        className="btn-ghost border border-slate-200 text-sm px-4"
                      >
                        Previous
                      </button>
                    )}
                    <span className="text-sm text-slate-500">
                      Page {page} of {Math.ceil(results.total / 20)}
                    </span>
                    {page * 20 < results.total && (
                      <button
                        onClick={() => { setPage(p => p + 1); doSearch(query, page + 1); }}
                        className="btn-ghost border border-slate-200 text-sm px-4"
                      >
                        Next
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Initial state - no search yet */}
            {!loading && !results && (
              <div className="text-center py-16">
                <Database size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="font-display font-bold text-xl text-polar-navy mb-2">
                  Search the Repository
                </h3>
                <p className="text-slate-500">
                  Enter a search term above or browse all documents.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function RepositoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <p className="text-slate-500">Loading Polar Knowledge Repository...</p>
        </div>
      }
    >
      <RepositoryContent />
    </Suspense>
  );
}
