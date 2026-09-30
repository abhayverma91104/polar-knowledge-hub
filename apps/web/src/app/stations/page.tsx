'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin, Calendar, Compass, Globe, ExternalLink,
  Search, Shield, CheckCircle2, ArrowRight, MessageSquare
} from 'lucide-react';
import { stationsApi } from '@/lib/api';

interface Station {
  id: string;
  name: string;
  code: string;
  region: string;
  latitude: number;
  longitude: number;
  established_year: number;
  description: string;
  research_areas: string[];
  image_url?: string;
  is_active: boolean;
  document_count?: number;
  dataset_count?: number;
  media_count?: number;
}

const FALLBACK_STATIONS: Station[] = [
  {
    id: 'bharati',
    name: 'Bharati',
    code: 'BHARATI',
    region: 'antarctica',
    latitude: -69.4069,
    longitude: 76.1831,
    established_year: 2012,
    description: "Bharati is India's third and newest permanent research station in Antarctica, commissioned in 2012 at Larsemann Hills, East Antarctica. It is an energy-efficient, state-of-the-art facility designed for year-round multidisciplinary research.",
    research_areas: ['Oceanography', 'Geology', 'Atmospheric Science', 'Climate Research', 'Marine Biology', 'Glaciology'],
    is_active: true,
  },
  {
    id: 'maitri',
    name: 'Maitri',
    code: 'MAITRI',
    region: 'antarctica',
    latitude: -70.7669,
    longitude: 11.7325,
    established_year: 1989,
    description: "Maitri is India's second permanent research station in Antarctica, situated in the ice-free Schirmacher Oasis. It serves as a continuous base for long-term geological, meteorological, and paleoclimate studies.",
    research_areas: ['Glaciology', 'Meteorology', 'Geology', 'Earth Sciences', 'Atmospheric Science', 'Biology'],
    is_active: true,
  },
  {
    id: 'himadri',
    name: 'Himadri',
    code: 'HIMADRI',
    region: 'arctic',
    latitude: 78.9272,
    longitude: 11.9281,
    established_year: 2008,
    description: "Himadri is India's first research station in the Arctic, established in 2008 at the international research base in Ny-Ålesund, Spitsbergen, Svalbard. Research focuses on atmospheric aerosols, fjord dynamics, and Arctic microbial ecology.",
    research_areas: ['Atmospheric Chemistry', 'Arctic Glaciology', 'Marine Biology', 'Space Weather', 'Permafrost Dynamics'],
    is_active: true,
  },
  {
    id: 'indarc',
    name: 'IndARC',
    code: 'INDARC',
    region: 'arctic',
    latitude: 79.0,
    longitude: 12.0,
    established_year: 2014,
    description: "IndARC is India's first multi-sensor moored underwater observatory deployed in Kongsfjorden, Svalbard. It records continuous year-round oceanic data on water temperature, salinity, currents, and Arctic climate teleconnections.",
    research_areas: ['Ocean Currents', 'Salinity & Temperature Profiling', 'Climate Teleconnections', 'Marine Biogeochemistry'],
    is_active: true,
  },
  {
    id: 'himansh',
    name: 'Himansh',
    code: 'HIMANSH',
    region: 'himalayas',
    latitude: 32.4042,
    longitude: 77.6133,
    established_year: 2016,
    description: "Himansh is India's high-altitude research station situated at 13,500 ft (4,080 m) in the Chandra basin, Spiti Valley, Himachal Pradesh. It monitors Himalayan cryosphere dynamics, glacier mass balance, and meltwater discharge.",
    research_areas: ['Cryosphere Dynamics', 'Glacier Mass Balance', 'Hydrological Modeling', 'High-Altitude Meteorology'],
    is_active: true,
  },
];

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    stationsApi.list()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setStations(res.data);
        } else {
          setStations(FALLBACK_STATIONS);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load stations:', err);
        setStations(FALLBACK_STATIONS);
        setLoading(false);
      });
  }, []);

  const filteredStations = stations.filter((station) => {
    const matchesRegion = selectedRegion === 'all' || station.region.toLowerCase() === selectedRegion.toLowerCase();
    const matchesSearch =
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.research_areas?.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRegion && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-24 pb-20 text-slate-100" style={{ background: '#070f1e' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Banner */}
        <div className="p-8 sm:p-10 rounded-2xl border border-white/10 mb-8" style={{ background: '#0a1628' }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Globe size={14} />
            <span>National Centre for Polar and Ocean Research</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-3">
            Indian Polar & Cryospheric Stations
          </h1>
          <p className="text-slate-300 text-base leading-relaxed max-w-3xl">
            Explore India&apos;s network of permanent year-round scientific observation stations across Antarctica, the Arctic, and the Himalayas.
          </p>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-white/10">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold transition-colors"
            >
              <Compass size={14} /> Open Interactive Map
            </Link>
            <Link
              href="/expeditions"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 text-slate-300 hover:bg-white/10 text-xs font-semibold transition-colors"
            >
              Expedition Timelines
            </Link>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center mb-8">
          {/* Region Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {[
              { id: 'all', label: 'All Stations' },
              { id: 'antarctica', label: 'Antarctica (Maitri & Bharati)' },
              { id: 'arctic', label: 'Arctic (Himadri & IndARC)' },
              { id: 'himalayas', label: 'Himalayas (Himansh)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedRegion(tab.id)}
                className="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border"
                style={{
                  background: selectedRegion === tab.id ? '#0ea5e9' : 'rgba(255,255,255,0.03)',
                  borderColor: selectedRegion === tab.id ? '#0ea5e9' : 'rgba(255,255,255,0.1)',
                  color: selectedRegion === tab.id ? '#ffffff' : '#94a3b8',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search station or discipline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
              style={{ background: '#0a1628' }}
            />
          </div>
        </div>

        {/* Stations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredStations.map((station) => (
            <div
              key={station.id}
              className="p-6 sm:p-7 rounded-2xl border border-white/10 flex flex-col justify-between"
              style={{ background: '#0a1628' }}
            >
              <div>
                {/* Station Top Bar */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold uppercase tracking-wider">
                        {station.region}
                      </span>
                      {station.is_active && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Active Base
                        </span>
                      )}
                    </div>
                    <h2 className="font-display font-bold text-2xl text-white">
                      {station.name}
                    </h2>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Established</span>
                    <span className="text-sm font-bold text-slate-200">{station.established_year}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  {station.description}
                </p>

                {/* Geographic Position */}
                <div className="p-3 rounded-xl border border-white/10 mb-5 flex items-center justify-between text-xs" style={{ background: '#070f1e' }}>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin size={14} className="text-sky-400 shrink-0" />
                    <span>Coordinates</span>
                  </div>
                  <span className="font-mono text-slate-200 font-semibold">
                    {Math.abs(station.latitude).toFixed(2)}°{station.latitude >= 0 ? 'N' : 'S'}, {Math.abs(station.longitude).toFixed(2)}°{station.longitude >= 0 ? 'E' : 'W'}
                  </span>
                </div>

                {/* Research Areas */}
                <div className="mb-6">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Scientific Domains</span>
                  <div className="flex flex-wrap gap-1.5">
                    {station.research_areas?.map((area) => (
                      <span
                        key={area}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium border border-white/10 text-slate-300"
                        style={{ background: '#070f1e' }}
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Station Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <Link
                  href={`/explore?station=${station.code.toLowerCase()}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                >
                  <Compass size={13} /> View on Globe
                </Link>

                <Link
                  href={`/repository?q=${encodeURIComponent(station.name)}`}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Publications <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
