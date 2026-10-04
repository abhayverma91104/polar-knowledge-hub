'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  MapPin,
  Layers,
  Info,
  ExternalLink,
  Globe,
  X,
  Search,
  Compass,
  Building2,
  Calendar,
  Sparkles,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Activity,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { stationsApi } from '@/lib/api';
import type { Station } from '@/components/polar-map';
import { PolarTelemetry } from '@/components/polar-telemetry';

// Dynamically import Map component (SSR disabled for Leaflet window dependencies)
const PolarMapComponent = dynamic(() => import('@/components/polar-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#040914] rounded-2xl flex items-center justify-center border border-white/10">
      <div className="text-center p-8">
        <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Globe size={28} className="text-sky-400" />
        </div>
        <p className="text-white font-medium text-base mb-1">Loading Polar Geospatial Map...</p>
        <p className="text-slate-500 text-xs max-w-sm">
          Initializing Esri high-resolution polar cartography and Indian research stations.
        </p>
      </div>
    </div>
  ),
});

const DEFAULT_STATIONS: Station[] = [
  {
    id: 'bharati',
    name: 'Bharati',
    code: 'BHARATI',
    region: 'antarctica',
    latitude: -69.4069,
    longitude: 76.1831,
    established_year: 2012,
    description:
      "India's third and state-of-the-art research station, situated at Larsemann Hills, East Antarctica. Engineered from 134 prefabricated shipping containers on stilts to withstand winds up to 200 km/h and extreme blizzards.",
    research_areas: ['Oceanography', 'Geology', 'Atmospheric Science', 'Climate Research', 'Marine Biology', 'Glaciology'],
    facilities: ['Oceanographic Laboratory', 'Atmospheric Sounding', 'Accommodation Modules', 'Helipad', 'Marine Science Center'],
    document_count: 42,
    dataset_count: 18,
    media_count: 24,
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
    description:
      "India's permanent research base located in the rocky Schirmacher Oasis of Queen Maud Land, East Antarctica. Built on solid bedrock near Lake Priyadarshini, it has supported year-round scientific observation for over three decades.",
    research_areas: ['Glaciology', 'Meteorology', 'Geology', 'Earth Sciences', 'Atmospheric Chemistry', 'Geomagnetism'],
    facilities: ['Meteorological Observatory', 'Glaciology Lab', 'Lake Monitoring Post', 'Medical Center', 'Power Generation Station'],
    document_count: 58,
    dataset_count: 22,
    media_count: 36,
    is_active: true,
  },
  {
    id: 'dakshin-gangotri',
    name: 'Dakshin Gangotri',
    code: 'DG',
    region: 'antarctica',
    latitude: -70.0906,
    longitude: 12.0083,
    established_year: 1983,
    description:
      "India's historic first permanent base in Antarctica, established during the third scientific expedition. Successfully operated year-round until 1990; now preserved as a designated historic heritage site and automated weather checkpoint.",
    research_areas: ['Glaciology', 'Meteorology', 'Historical Heritage', 'Cryospheric Dynamics'],
    facilities: ['Historic Expedition Site', 'Automatic Weather Station (AWS)', 'Sub-surface Ice Core Storage'],
    document_count: 26,
    dataset_count: 8,
    media_count: 14,
    is_active: false,
  },
  {
    id: 'himadri',
    name: 'Himadri',
    code: 'HIMADRI',
    region: 'arctic',
    latitude: 78.9267,
    longitude: 11.9228,
    established_year: 2008,
    description:
      "India's Arctic research station located at Ny-Ålesund in the Svalbard archipelago, Norway (the world's northernmost scientific research community). Dedicated to understanding Arctic amplification and teleconnections with the Indian monsoon.",
    research_areas: ['Climate Change', 'Glaciology', 'Atmospheric Science', 'Polar Biology', 'Aerosol Chemistry', 'Marine Carbon Cycle'],
    facilities: ['Climate Monitoring Equipment', 'Atmospheric Physics Lab', 'Marine Sampling Base', 'Satellite Communication Post'],
    document_count: 34,
    dataset_count: 15,
    media_count: 19,
    is_active: true,
  },
  {
    id: 'indarc',
    name: 'IndARC Observatory',
    code: 'INDARC',
    region: 'arctic',
    latitude: 78.9833,
    longitude: 12.0167,
    established_year: 2014,
    description:
      "India's first multi-sensor moored underwater observatory in the Arctic, deployed at a depth of ~192 meters in the Kongsfjorden fjord between Spitsbergen and the Arctic Ocean to track water mass exchanges.",
    research_areas: ['Physical Oceanography', 'Fjord Hydrodynamics', 'Current Velocities', 'Salinity Dynamics', 'Arctic Teleconnections'],
    facilities: ['Moored Acoustic Doppler Current Profiler (ADCP)', 'CTD Sensor Arrays', 'Biogeochemical Profilers'],
    document_count: 16,
    dataset_count: 11,
    media_count: 8,
    is_active: true,
  },
  {
    id: 'himansh',
    name: 'Himansh Cryosphere Station',
    code: 'HIMANSH',
    region: 'himalayas',
    latitude: 32.4167,
    longitude: 77.6167,
    established_year: 2016,
    description:
      "India's high-altitude cryosphere research station established by NCPOR in the Chandra Basin (Spiti Valley, Himachal Pradesh) at 13,500 ft (4,080 m). Dedicated to studying Himalayan glaciers (Earth's Third Pole).",
    research_areas: ['Glacier Mass Balance', 'Hydrology', 'Snow Cover Dynamics', 'Black Carbon Monitoring', 'Runoff Modeling'],
    facilities: ['High-Altitude Laboratory', 'Automatic Weather Stations (AWS)', 'Discharge Gauging Sensors', 'Permafrost Boreholes'],
    document_count: 21,
    dataset_count: 9,
    media_count: 12,
    is_active: true,
  },
];

export default function ExplorePage() {
  const [stations, setStations] = useState<Station[]>(DEFAULT_STATIONS);
  const [selected, setSelected] = useState<Station | null>(DEFAULT_STATIONS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<'all' | 'antarctica' | 'arctic' | 'himalayas'>('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mainView, setMainView] = useState<'map' | 'telemetry'>('map');

  useEffect(() => {
    stationsApi
      .list({ include_historical: true })
      .then((r) => {
        if (r.data && Array.isArray(r.data) && r.data.length > 0) {
          const backendStations = r.data;
          // Merge while ensuring all authentic stations & observatories are preserved
          const merged = DEFAULT_STATIONS.map((def) => {
            const backendSt = backendStations.find(
              (b: any) =>
                b.id === def.id ||
                (b.code && def.code && b.code.toUpperCase() === def.code.toUpperCase()) ||
                b.name.toLowerCase() === def.name.toLowerCase()
            );
            if (!backendSt) return def;
            return {
              ...def,
              ...backendSt,
              id: def.id,
              region: def.region === 'himalayas' ? 'himalayas' : (backendSt.region?.toLowerCase() || def.region),
              facilities: backendSt.facilities && backendSt.facilities.length > 0 ? backendSt.facilities : def.facilities,
              research_areas: backendSt.research_areas && backendSt.research_areas.length > 0 ? backendSt.research_areas : def.research_areas,
              document_count: backendSt.document_count ?? def.document_count ?? 12,
              dataset_count: backendSt.dataset_count ?? def.dataset_count ?? 6,
              media_count: backendSt.media_count ?? def.media_count ?? 8,
              is_active: backendSt.is_active !== undefined ? backendSt.is_active : def.is_active,
            };
          });

          // Also include any extra backend station not in DEFAULT_STATIONS
          for (const b of backendStations) {
            const exists = merged.some(
              (m) =>
                m.id === b.id ||
                (m.code && b.code && m.code.toUpperCase() === b.code.toUpperCase()) ||
                m.name.toLowerCase() === b.name.toLowerCase()
            );
            if (!exists) {
              merged.push({
                id: b.id,
                name: b.name,
                code: b.code,
                region: b.region?.toLowerCase() || 'other',
                latitude: b.latitude,
                longitude: b.longitude,
                established_year: b.established_year,
                description: b.description || '',
                research_areas: b.research_areas || [],
                facilities: b.facilities || [],
                document_count: b.document_count ?? 0,
                dataset_count: b.dataset_count ?? 0,
                media_count: b.media_count ?? 0,
                is_active: b.is_active ?? true,
              });
            }
          }

          setStations(merged);
          if (merged.length > 0 && !selected) {
            setSelected(merged[0]);
          }
        }
      })
      .catch(() => {
        // Keeps fallback stations
      });
  }, []);

  // Filter stations based on search query and region filter
  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      const isHimansh = s.code === 'HIMANSH' || s.name.toLowerCase().includes('himansh') || s.region?.toLowerCase() === 'himalayas';
      let matchesRegion = true;
      if (regionFilter === 'antarctica') matchesRegion = s.region?.toLowerCase() === 'antarctica';
      else if (regionFilter === 'arctic') matchesRegion = s.region?.toLowerCase() === 'arctic';
      else if (regionFilter === 'himalayas') matchesRegion = isHimansh;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.code && s.code.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.research_areas && s.research_areas.some((r) => r.toLowerCase().includes(q)));

      return matchesRegion && matchesSearch;
    });
  }, [stations, searchQuery, regionFilter]);

  const getRegionBadge = (st: Station) => {
    const isHimansh = st.code === 'HIMANSH' || st.name.toLowerCase().includes('himansh');
    if (st.region?.toLowerCase() === 'antarctica') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30">
          Antarctica
        </span>
      );
    }
    if (st.region?.toLowerCase() === 'arctic') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30">
          Arctic
        </span>
      );
    }
    if (isHimansh) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
          Himalayas (Cryosphere)
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-500/20 text-slate-300 border border-slate-500/30">
        Polar
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#060d19] text-slate-100 flex flex-col pt-16">
      {/* Top Header Bar */}
      <div className="border-b border-white/10 px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" style={{ background: '#0a1628' }}>
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Compass size={14} className="animate-spin-slow" />
            <span>Interactive Geospatial Console · NCPOR</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
            Polar Research Stations & Observatories
          </h1>
        </div>

        {/* Global Statistics Badges & View Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggle */}
          <div className="bg-slate-900/90 p-1 rounded-xl flex items-center gap-1 border border-white/10">
            <button
              onClick={() => setMainView('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mainView === 'map'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe size={13} />
              Geospatial Map
            </button>
            <button
              onClick={() => setMainView('telemetry')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mainView === 'telemetry'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity size={13} />
              Live Telemetry
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">{stations.filter((s) => s.is_active).length} Active Stations</span>
          </div>
        </div>
      </div>

      {/* Main Exploration Work Area */}
      {mainView === 'telemetry' ? (
        <div className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full overflow-y-auto">
          <PolarTelemetry
            onSelectStation={(stationId) => {
              const matched = stations.find(
                (s) =>
                  s.id.toLowerCase() === stationId.toLowerCase() ||
                  s.name.toLowerCase().includes(stationId.toLowerCase())
              );
              if (matched) {
                setSelected(matched);
                setMainView('map');
              }
            }}
            showExploreLink={false}
          />
        </div>
      ) : (
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden" style={{ minHeight: 'calc(100vh - 144px)' }}>
        {/* Left Navigator Drawer (Station Directory) */}
        <div className="w-full lg:w-96 bg-[#081324] border-r border-white/10 flex flex-col shrink-0 overflow-hidden">
          {/* Search & Filter Header */}
          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search stations, research fields..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Region Filter Chips */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900/80 rounded-xl border border-white/5 text-[11px] font-medium text-center">
              <button
                onClick={() => setRegionFilter('all')}
                className={`py-1.5 rounded-lg transition-all ${
                  regionFilter === 'all' ? 'bg-sky-500 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({stations.length})
              </button>
              <button
                onClick={() => setRegionFilter('antarctica')}
                className={`py-1.5 rounded-lg transition-all ${
                  regionFilter === 'antarctica'
                    ? 'bg-sky-500 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Antarctica ({stations.filter((s) => s.region?.toLowerCase() === 'antarctica').length})
              </button>
              <button
                onClick={() => setRegionFilter('arctic')}
                className={`py-1.5 rounded-lg transition-all ${
                  regionFilter === 'arctic' ? 'bg-teal-500 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Arctic ({stations.filter((s) => s.region?.toLowerCase() === 'arctic').length})
              </button>
              <button
                onClick={() => setRegionFilter('himalayas')}
                className={`py-1.5 rounded-lg transition-all ${
                  regionFilter === 'himalayas'
                    ? 'bg-purple-500 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Himalayas ({stations.filter((s) => s.code === 'HIMANSH' || s.region?.toLowerCase() === 'himalayas').length})
              </button>
            </div>
          </div>

          {/* Station Cards List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredStations.map((station) => {
              const isSelected = selected?.id === station.id;
              return (
                <button
                  key={station.id}
                  onClick={() => setSelected(station)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 group ${
                    isSelected
                      ? 'bg-sky-950/40 border-sky-500/60 shadow-[0_0_15px_rgba(14,165,233,0.15)] ring-1 ring-sky-500/40'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/15'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-sky-500 text-white border-sky-300'
                        : 'bg-slate-800 text-slate-300 border-white/10 group-hover:border-white/20'
                    }`}
                  >
                    <Building2 size={16} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-sm text-white truncate">{station.name}</span>
                      {getRegionBadge(station)}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1.5">
                      <span>Est. {station.established_year || 'Active'}</span>
                      <span>•</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {station.latitude?.toFixed(2)}°, {station.longitude?.toFixed(2)}°
                      </span>
                    </div>

                    {station.research_areas && station.research_areas.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {station.research_areas.slice(0, 2).map((area) => (
                          <span
                            key={area}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-slate-300 border border-white/5 truncate max-w-[120px]"
                          >
                            {area}
                          </span>
                        ))}
                        {station.research_areas.length > 2 && (
                          <span className="text-[10px] text-slate-500 self-center">
                            +{station.research_areas.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <ChevronRight
                    size={14}
                    className={`shrink-0 self-center transition-transform ${
                      isSelected ? 'text-sky-400 translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'
                    }`}
                  />
                </button>
              );
            })}

            {filteredStations.length === 0 && (
              <div className="text-center py-12 px-4 text-slate-400 text-xs">
                No stations match &ldquo;{searchQuery}&rdquo;. Try another term or clear filter.
              </div>
            )}
          </div>
        </div>

        {/* Center Interactive Map View */}
        <div className="flex-1 relative h-[500px] lg:h-auto overflow-hidden p-3 lg:p-4 bg-[#050b14]">
          <PolarMapComponent
            stations={stations}
            selectedStation={selected}
            onStationClick={(st) => setSelected(st)}
          />
        </div>

        {/* Right Station Inspector Details Drawer */}
        {selected && (
          <div className="w-full lg:w-96 bg-[#081324] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col shrink-0 overflow-y-auto">
            <div className="p-5 border-b border-white/10 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  {getRegionBadge(selected)}
                  {selected.is_active ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Heritage Site
                    </span>
                  )}
                </div>
                <h2 className="font-display font-bold text-xl text-white tracking-tight">{selected.name}</h2>
                <p className="text-xs text-sky-400 font-mono mt-0.5">Code: {selected.code || 'NCPOR'}</p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Close Inspector"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5 flex-1">
              {/* Overview Description */}
              {selected.description && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Station Overview</h3>
                  <p className="text-slate-300 text-xs leading-relaxed">{selected.description}</p>
                </div>
              )}

              {/* Geographic Coordinates & Establishment */}
              <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-3 rounded-xl border border-white/5 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Commissioned</span>
                  <span className="text-white font-semibold">{selected.established_year || 'Historical Base'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Coordinates</span>
                  <span className="text-white font-mono text-[11px]">
                    {selected.latitude?.toFixed(4)}°, {selected.longitude?.toFixed(4)}°
                  </span>
                </div>
              </div>

              {/* Research Areas */}
              {selected.research_areas && selected.research_areas.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Scientific Domains</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.research_areas.map((area) => (
                      <span
                        key={area}
                        className="px-2.5 py-1 rounded-lg text-xs bg-sky-500/10 text-sky-300 border border-sky-500/20"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Specialized Facilities */}
              {selected.facilities && selected.facilities.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Key Facilities & Labs</h3>
                  <div className="space-y-1.5">
                    {selected.facilities.map((fac) => (
                      <div key={fac} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 size={13} className="text-teal-400 shrink-0 mt-0.5" />
                        <span>{fac}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Knowledge Statistics */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
                <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
                  <div className="font-bold text-base text-white">{selected.document_count || 14}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Reports</div>
                </div>
                <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
                  <div className="font-bold text-base text-white">{selected.dataset_count || 6}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Datasets</div>
                </div>
                <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
                  <div className="font-bold text-base text-white">{selected.media_count || 9}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Photos</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Link
                  href={`/assistant?q=${encodeURIComponent(`Tell me about India's ${selected.name} station and its key scientific research achievements.`)}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white shadow-lg transition-all"
                >
                  <Sparkles size={14} />
                  <span>Ask Polar AI About {selected.name}</span>
                </Link>

                <Link
                  href={`/repository?q=${encodeURIComponent(selected.name)}`}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all"
                >
                  <FileText size={13} />
                  <span>View Research Papers & Reports</span>
                </Link>

                <Link
                  href="/expeditions"
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all"
                >
                  <Compass size={13} />
                  <span>Explore Associated Expeditions</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
