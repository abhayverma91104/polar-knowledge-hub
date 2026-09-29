'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, FileText, Database, Image, ArrowRight, Globe, Filter } from 'lucide-react';
import { expeditionsApi } from '@/lib/api';

interface Expedition {
  id: string;
  number: number;
  title: string;
  year: number;
  region: string;
  duration_days: number;
  research_domains: string[];
  chief_scientist?: string;
  description?: string;
  document_count?: number;
  dataset_count?: number;
  media_count?: number;
  participants?: number;
}

const REGIONS = [
  { value: '', label: 'All Regions' },
  { value: 'antarctica', label: 'Antarctica' },
  { value: 'arctic', label: 'Arctic' },
];

export default function ExpeditionsPage() {
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [loading, setLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState('');

  useEffect(() => {
    expeditionsApi.list(regionFilter || undefined)
      .then(r => setExpeditions(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [regionFilter]);

  const antarctic = expeditions.filter(e => e.region === 'antarctica');
  const arctic = expeditions.filter(e => e.region === 'arctic');

  return (
    <div className="min-h-screen bg-polar-frost pt-16">
      {/* Header */}
      <div className="bg-polar-navy py-16">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-8">
          <div className="section-label-dark section-label mb-4">
            <Globe size={12} />
            Indian Polar Expeditions
          </div>
          <h1 className="font-display font-bold text-4xl text-white mb-3">
            Expeditions to the Poles
          </h1>
          <p className="text-white/60 text-xl max-w-2xl">
            India has conducted 44+ expeditions to Antarctica and 16+ to the Arctic. Explore the full timeline of scientific discovery.
          </p>

          {/* Region filter */}
          <div className="flex gap-2 mt-6">
            {REGIONS.map((r) => (
              <button
                key={r.value}
                onClick={() => setRegionFilter(r.value)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                  regionFilter === r.value
                    ? 'bg-polar-cyan text-white border-polar-cyan'
                    : 'border-white/20 text-white/60 hover:text-white hover:border-white/40'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="card h-64 skeleton" />
            ))}
          </div>
        ) : (
          <>
            {(regionFilter === '' || regionFilter === 'antarctica') && antarctic.length > 0 && (
              <div className="mb-14">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-sky-400 rounded-full" />
                  <h2 className="font-display font-bold text-2xl text-polar-navy">
                    Antarctic Expeditions ({antarctic.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {antarctic.map((exp) => (
                    <ExpeditionCard key={exp.id} expedition={exp} />
                  ))}
                </div>
              </div>
            )}

            {(regionFilter === '' || regionFilter === 'arctic') && arctic.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-teal-400 rounded-full" />
                  <h2 className="font-display font-bold text-2xl text-polar-navy">
                    Arctic Expeditions ({arctic.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {arctic.map((exp) => (
                    <ExpeditionCard key={exp.id} expedition={exp} />
                  ))}
                </div>
              </div>
            )}

            {expeditions.length === 0 && (
              <div className="card p-16 text-center">
                <Globe size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="font-display font-bold text-xl text-polar-navy mb-2">No expeditions found</h3>
                <p className="text-slate-500">The API server may not be running. Start it with <code className="bg-slate-100 px-1 rounded">uvicorn apps.api.main:app</code></p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ExpeditionCard({ expedition }: { expedition: Expedition }) {
  const isAntarctic = expedition.region === 'antarctica';
  return (
    <Link
      href={`/expeditions/${expedition.id}`}
      className="card group overflow-hidden hover-lift"
    >
      {/* Color bar */}
      <div className={`h-1.5 ${isAntarctic ? 'bg-gradient-to-r from-sky-400 to-blue-500' : 'bg-gradient-to-r from-teal-400 to-cyan-500'}`} />

      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`badge text-xs ${isAntarctic ? 'badge-cyan' : 'badge-teal'}`}>
            {isAntarctic ? 'Antarctica' : 'Arctic'}
          </span>
          <span className="badge badge-navy text-xs">#{expedition.number}</span>
        </div>

        <h2 className="font-display font-bold text-lg text-polar-navy group-hover:text-polar-cyan transition-colors mb-2 line-clamp-2">
          {expedition.title}
        </h2>

        {expedition.description && (
          <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4">
            {expedition.description}
          </p>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-slate-400 mb-4">
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {expedition.year}
          </span>
          {expedition.duration_days && (
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {expedition.duration_days} days
            </span>
          )}
          {expedition.chief_scientist && (
            <span className="flex items-center gap-1">
              <Users size={11} />
              {expedition.chief_scientist}
            </span>
          )}
        </div>

        {/* Research domains */}
        {expedition.research_domains?.slice(0, 3).map((d) => (
          <span key={d} className="inline-block mr-1.5 mb-1.5 text-xs font-medium text-polar-cyan">
            {d}
          </span>
        ))}

        {/* Bottom stats */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-400">
          {expedition.document_count !== undefined && (
            <span className="flex items-center gap-1">
              <FileText size={11} />
              {expedition.document_count} docs
            </span>
          )}
          {expedition.dataset_count !== undefined && (
            <span className="flex items-center gap-1">
              <Database size={11} />
              {expedition.dataset_count} datasets
            </span>
          )}
          {expedition.media_count !== undefined && (
            <span className="flex items-center gap-1">
              <Image size={11} />
              {expedition.media_count} media
            </span>
          )}
          <span className="ml-auto flex items-center gap-1 text-polar-cyan font-semibold">
            View <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
