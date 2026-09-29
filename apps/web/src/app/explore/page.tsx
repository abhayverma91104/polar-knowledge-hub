'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Layers, Info, ExternalLink, Globe, X } from 'lucide-react';
import Link from 'next/link';
import { stationsApi } from '@/lib/api';

// Dynamically import Map component (no SSR)
const PolarMapComponent = dynamic(() => import('@/components/polar-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <Globe size={40} className="text-slate-600 mx-auto mb-3" />
        <p className="text-slate-500">Loading map...</p>
      </div>
    </div>
  ),
});

import type { Station } from '@/components/polar-map';

export default function ExplorePage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [selected, setSelected] = useState<Station | null>(null);

  useEffect(() => {
    stationsApi.list().then(r => setStations(r.data)).catch(() => {
      // Fallback stations for demo
      setStations([
        {
          id: 'maitri',
          name: 'Maitri',
          code: 'MAITRI',
          region: 'antarctica',
          latitude: -70.7669,
          longitude: 11.7325,
          established_year: 1989,
          description: 'India\'s permanent research station in the Schirmacher Oasis, East Antarctica.',
          research_areas: ['Glaciology', 'Meteorology', 'Geology', 'Atmospheric Science'],
        },
        {
          id: 'bharati',
          name: 'Bharati',
          code: 'BHARATI',
          region: 'antarctica',
          latitude: -69.4069,
          longitude: 76.1831,
          established_year: 2012,
          description: 'India\'s newest research station at Larsemann Hills, East Antarctica.',
          research_areas: ['Oceanography', 'Geology', 'Atmospheric Science', 'Climate Research'],
        },
        {
          id: 'himadri',
          name: 'Himadri',
          code: 'HIMADRI',
          region: 'arctic',
          latitude: 78.9267,
          longitude: 11.9228,
          established_year: 2008,
          description: 'India\'s Arctic research station at Ny-Ålesund, Svalbard, Norway.',
          research_areas: ['Climate Change', 'Glaciology', 'Atmospheric Science', 'Biology'],
        },
      ]);
    });
  }, []);

  return (
    <div className="min-h-screen bg-polar-navy pt-16 flex flex-col">
      {/* Header */}
      <div className="bg-polar-navy border-b border-white/8 py-6">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-polar-cyan text-sm font-semibold mb-1">
              <MapPin size={14} />
              Interactive Map
            </div>
            <h1 className="font-display font-bold text-2xl text-white">Polar Research Stations</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/50">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-sky-400" />
              Antarctic
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-teal-400" />
              Arctic
            </div>
          </div>
        </div>
      </div>

      {/* Map + Panel */}
      <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 128px)' }}>
        {/* Map */}
        <div className="flex-1 relative p-4">
          <PolarMapComponent
            stations={stations}
            onStationClick={(st) => setSelected(st)}
            selectedStation={selected}
          />
        </div>

        {/* Station Info Panel */}
        {selected && (
          <div className="w-80 bg-polar-navy border-l border-white/8 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className={`badge text-xs mb-2 ${selected.region === 'antarctica' ? 'badge-cyan-dark' : 'badge-teal'}`}>
                    {selected.region === 'antarctica' ? 'Antarctica' : 'Arctic'}
                  </div>
                  <h2 className="font-display font-bold text-xl text-white">
                    {selected.name} Research Station
                  </h2>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-white/40 hover:text-white p-1"
                >
                  <X size={18} />
                </button>
              </div>

              {selected.description && (
                <p className="text-white/60 text-sm leading-relaxed mb-5">
                  {selected.description}
                </p>
              )}

              {/* Details */}
              <div className="space-y-3 mb-5">
                {selected.established_year && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/40">Established</span>
                    <span className="text-white font-semibold">{selected.established_year}</span>
                  </div>
                )}
                {selected.latitude && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/40">Coordinates</span>
                    <span className="text-white font-mono text-xs">
                      {selected.latitude.toFixed(4)}°, {selected.longitude?.toFixed(4)}°
                    </span>
                  </div>
                )}
              </div>

              {/* Research Areas */}
              {selected.research_areas && selected.research_areas.length > 0 && (
                <div className="mb-5">
                  <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">
                    Research Areas
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.research_areas.map(area => (
                      <span key={area} className="badge badge-cyan-dark text-xs">{area}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              {(selected.document_count !== undefined || selected.dataset_count !== undefined) && (
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    { label: 'Documents', value: selected.document_count || 0 },
                    { label: 'Datasets', value: selected.dataset_count || 0 },
                    { label: 'Media', value: selected.media_count || 0 },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
                      <div className="text-lg font-bold text-white">{value}</div>
                      <div className="text-xs text-white/40">{label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <Link
                  href={`/stations/${selected.id}`}
                  className="btn-primary w-full justify-center"
                >
                  Explore Station
                </Link>
                <Link
                  href={`/repository?station_id=${selected.id}`}
                  className="btn-secondary w-full justify-center text-polar-cyan-300 border-polar-cyan/30"
                >
                  View Research
                </Link>
                <Link
                  href={`/media?station_id=${selected.id}`}
                  className="btn-ghost w-full justify-center text-white/60 hover:text-white border border-white/10"
                >
                  View Media
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
