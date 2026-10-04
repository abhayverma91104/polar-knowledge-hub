'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity, Radio, Wind, Compass, Users, Waves,
  Anchor, Mountain, FlaskConical, Wifi, Eye, RefreshCw,
  TrendingDown, ArrowUpRight, Zap
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid
} from 'recharts';
import { stationsApi } from '@/lib/api';

export interface TelemetryMetric {
  label: string;
  value: string;
  sub?: string;
  is_primary?: boolean;
}

export interface TelemetryBadge {
  type: string;
  text: string;
}

export interface StationTelemetry {
  id: string;
  name: string;
  location: string;
  region: string;
  status: string;
  surface_temp: number;
  temp_unit: string;
  wind_vector?: string;
  katabatic_gust?: string;
  wind_dir: string;
  solar_rad?: number;
  solar_unit?: string;
  barometer?: number;
  barometer_unit?: string;
  aerosol_od?: string;
  fjord_salinity?: string;
  snow_water_eq?: string;
  glacier_drift?: string;
  metrics: TelemetryMetric[];
  badges: TelemetryBadge[];
}

export interface SynopticHour {
  hour: string;
  maitri_temp: number;
  bharati_temp: number;
  himadri_temp: number;
  himansh_temp: number;
  maitri_wind: number;
  bharati_wind: number;
  himadri_wind: number;
  himansh_wind: number;
}

interface PolarTelemetryProps {
  onSelectStation?: (stationId: string) => void;
  showExploreLink?: boolean;
  compact?: boolean;
}

const REGION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  ANTARCTICA: { bg: 'bg-sky-500/10', text: 'text-sky-600', border: 'border-sky-500/30' },
  ARCTIC: { bg: 'bg-cyan-500/10', text: 'text-cyan-700', border: 'border-cyan-500/30' },
  HIMALAYA: { bg: 'bg-teal-500/10', text: 'text-teal-700', border: 'border-teal-500/30' },
};

function renderBadgeIcon(type: string) {
  switch (type) {
    case 'users':
      return <Users size={12} className="text-slate-500 shrink-0" />;
    case 'water':
      return <Waves size={12} className="text-sky-500 shrink-0" />;
    case 'radar':
      return <Radio size={12} className="text-indigo-500 shrink-0" />;
    case 'signal':
      return <Wifi size={12} className="text-emerald-500 shrink-0" />;
    case 'flask':
      return <FlaskConical size={12} className="text-cyan-600 shrink-0" />;
    case 'anchor':
      return <Anchor size={12} className="text-blue-600 shrink-0" />;
    case 'mountain':
      return <Mountain size={12} className="text-stone-600 shrink-0" />;
    case 'activity':
      return <Activity size={12} className="text-amber-500 shrink-0" />;
    default:
      return <Radio size={12} className="text-slate-500 shrink-0" />;
  }
}

export function PolarTelemetry({
  onSelectStation,
  showExploreLink = true,
  compact = false,
}: PolarTelemetryProps) {
  const [activeTab, setActiveTab] = useState<'matrix' | 'thermal' | 'katabatic'>('matrix');
  const [telemetryData, setTelemetryData] = useState<{
    stations: StationTelemetry[];
    synoptic_gradient: SynopticHour[];
    timestamp_utc: string;
  } | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fetchTelemetry = async () => {
    try {
      setIsRefreshing(true);
      const res = await stationsApi.telemetry();
      setTelemetryData(res.data);
      setCountdown(30);
    } catch (err) {
      console.error('Failed to load telemetry, using fallback model:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchTelemetry();
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchTelemetry();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted || !telemetryData) {
    return (
      <div className="w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm animate-pulse">
        <div className="h-8 w-64 bg-slate-100 rounded-lg mb-4" />
        <div className="h-4 w-96 bg-slate-100 rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-50 rounded-2xl border border-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  const { stations, synoptic_gradient, timestamp_utc } = telemetryData;

  return (
    <div className="w-full bg-[#f8fafc] rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
      {/* ─── Header & Controls ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[11px] font-bold tracking-wider uppercase border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Stream
            </span>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
              Simulated Scientific Telemetry
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Refresh in <strong className="text-sky-600">{countdown}s</strong>
            </span>
          </div>

          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-polar-navy tracking-tight">
            Live Polar Station Telemetry
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Near-real-time atmospheric and cryospheric sensor feeds from Indian Polar Observatories.
          </p>
        </div>

        {/* Top-Right Segmented Tabs */}
        <div className="flex items-center gap-2 self-start lg:self-center">
          <div className="bg-slate-200/70 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'matrix'
                  ? 'bg-white text-polar-navy shadow-sm'
                  : 'text-slate-600 hover:text-polar-navy'
              }`}
            >
              Matrix
            </button>
            <button
              onClick={() => setActiveTab('thermal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'thermal'
                  ? 'bg-white text-polar-navy shadow-sm'
                  : 'text-slate-600 hover:text-polar-navy'
              }`}
            >
              24h Thermal Gradient
            </button>
            <button
              onClick={() => setActiveTab('katabatic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'katabatic'
                  ? 'bg-white text-polar-navy shadow-sm'
                  : 'text-slate-600 hover:text-polar-navy'
              }`}
            >
              Katabatic Curves
            </button>
          </div>

          <button
            onClick={fetchTelemetry}
            className={`p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-sky-600 transition-colors shadow-sm ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Refresh Telemetry Now"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* ─── 4 Station Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {stations.map((st) => {
          const regionStyle = REGION_COLORS[st.region] || {
            bg: 'bg-slate-100',
            text: 'text-slate-600',
            border: 'border-slate-200',
          };

          return (
            <div
              key={st.id}
              onClick={() => onSelectStation?.(st.id)}
              className={`bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between group ${
                onSelectStation ? 'cursor-pointer' : ''
              }`}
            >
              {/* Top Meta */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    ONLINE
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider border ${regionStyle.bg} ${regionStyle.text} ${regionStyle.border}`}
                  >
                    {st.region}
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg text-polar-navy group-hover:text-sky-600 transition-colors">
                  {st.name}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5 line-clamp-1" title={st.location}>
                  {st.location}
                </p>

                {/* 2x2 Metric Grid */}
                <div className="bg-[#f0f7fc]/70 rounded-xl p-3.5 my-3.5 border border-sky-100/60">
                  <div className="grid grid-cols-2 gap-3">
                    {st.metrics.map((m, idx) => (
                      <div key={idx} className={idx < 2 ? 'border-b border-sky-100/60 pb-2.5' : 'pt-0.5'}>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                          {m.label}
                        </div>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span
                            className={`font-mono font-bold leading-none ${
                              m.is_primary && idx === 0
                                ? 'text-2xl text-sky-600'
                                : m.is_primary && idx === 1
                                ? 'text-2xl text-slate-800'
                                : 'text-sm font-semibold text-slate-700'
                            }`}
                          >
                            {m.value}
                          </span>
                          {m.sub && (
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              {m.sub}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Station Specialized Sensor Badges */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                {st.badges.map((b, bIdx) => (
                  <div key={bIdx} className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                    {renderBadgeIcon(b.type)}
                    <span className="truncate">{b.text}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Synoptic Chart Panel ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-600">
              <Activity size={15} />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm sm:text-base text-polar-navy">
                {activeTab === 'katabatic'
                  ? '24-Hour Polar Katabatic Wind & Gust Dynamics'
                  : '24-Hour Synoptic Micro-Climate Gradient'}
              </h4>
              <p className="text-[11px] text-slate-400">
                {activeTab === 'katabatic'
                  ? 'Continuous wind velocity tracking across Antarctic, Arctic and Himalayan stations'
                  : 'Multi-observatory temperature curves calibrated across synoptic diurnal cycle'}
              </p>
            </div>
          </div>

          {/* Series Legends */}
          <div className="flex items-center gap-3 text-xs flex-wrap font-mono">
            <span className="flex items-center gap-1.5 text-sky-700 font-bold">
              <span className="w-2.5 h-1 rounded-full bg-[#0284c7]" />
              Maitri ({stations[0]?.surface_temp}°C)
            </span>
            <span className="flex items-center gap-1.5 text-teal-700 font-bold">
              <span className="w-2.5 h-1 rounded-full bg-[#0d9488]" />
              Bharati ({stations[1]?.surface_temp}°C)
            </span>
            <span className="flex items-center gap-1.5 text-cyan-700 font-bold">
              <span className="w-2.5 h-1 rounded-full bg-[#0ea5e9]" />
              Himadri ({stations[2]?.surface_temp}°C)
            </span>
            <span className="flex items-center gap-1.5 text-indigo-700 font-bold">
              <span className="w-2.5 h-1 rounded-full bg-[#6366f1]" />
              Himansh ({stations[3]?.surface_temp}°C)
            </span>
          </div>
        </div>

        {/* Dynamic Chart Container */}
        <div className="h-52 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={synoptic_gradient}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="hour"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                unit={activeTab === 'katabatic' ? 'km/h' : '°C'}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a1628',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                }}
                labelStyle={{ fontWeight: 'bold', color: '#38bdf8', marginBottom: '4px' }}
              />
              {activeTab === 'katabatic' ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="maitri_wind"
                    name="Maitri Wind"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="bharati_wind"
                    name="Bharati Gust"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="himadri_wind"
                    name="Himadri Wind"
                    stroke="#0ea5e9"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="himansh_wind"
                    name="Himansh Wind"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </>
              ) : (
                <>
                  <Line
                    type="monotone"
                    dataKey="maitri_temp"
                    name="Maitri Temp"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="bharati_temp"
                    name="Bharati Temp"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="himadri_temp"
                    name="Himadri Temp"
                    stroke="#0ea5e9"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="himansh_temp"
                    name="Himansh Temp"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Footer meta */}
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
          <span>UTC 00:00 – 23:59 SYNOP CYCLE</span>
          {showExploreLink && (
            <Link
              href="/explore"
              className="text-sky-600 hover:text-sky-700 font-sans font-bold flex items-center gap-1 transition-colors"
            >
              Open Interactive Geospatial Map <ArrowUpRight size={12} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
