'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity, Radio, Wind, Compass, Users, Waves,
  Anchor, Mountain, FlaskConical, Wifi, Eye, RefreshCw,
  TrendingDown, ArrowUpRight, Zap, Thermometer, Gauge, AlertTriangle, ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, ReferenceLine
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
    <div className="w-full bg-white dark:bg-[#06111f] rounded-3xl border border-[#bfc7d2]/40 dark:border-white/10 p-6 sm:p-8 shadow-sm transition-colors text-on-surface">
      {/* ─── Header & Controls ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold tracking-wider uppercase border border-emerald-500/20 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Stream
            </span>
            <span className="text-[11px] font-mono text-on-surface-variant bg-[#ebf5ff] dark:bg-white/10 px-2 py-0.5 rounded uppercase tracking-wider">
              Simulated Scientific Telemetry
            </span>
            <span className="text-[11px] font-mono text-on-surface-variant">
              Refresh in <strong className="text-[#006194] dark:text-sky-400">{countdown}s</strong>
            </span>
          </div>

          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight">
            Live Polar Station Telemetry
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Near-real-time atmospheric and cryospheric sensor feeds from Indian Polar Observatories.
          </p>
        </div>

        {/* Top-Right Segmented Tabs */}
        <div className="flex items-center gap-2 self-start lg:self-center">
          <div className="bg-[#ebf5ff] dark:bg-white/10 p-1 rounded-xl flex items-center gap-1 border border-[#bfc7d2]/40 dark:border-white/10 shadow-inner">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-white dark:bg-[#0c1c30] text-[#006194] dark:text-white shadow-sm ring-1 ring-black/5'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/50 dark:hover:bg-white/10'
              }`}
            >
              Matrix
            </button>
            <button
              onClick={() => setActiveTab('thermal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'thermal'
                  ? 'bg-white dark:bg-[#0c1c30] text-[#006194] dark:text-white shadow-sm ring-1 ring-black/5'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/50 dark:hover:bg-white/10'
              }`}
            >
              24h Thermal Gradient
            </button>
            <button
              onClick={() => setActiveTab('katabatic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'katabatic'
                  ? 'bg-white dark:bg-[#0c1c30] text-[#006194] dark:text-white shadow-sm ring-1 ring-black/5'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/50 dark:hover:bg-white/10'
              }`}
            >
              Katabatic Curves
            </button>
          </div>

          <button
            onClick={fetchTelemetry}
            className={`p-2 rounded-xl bg-white dark:bg-[#0c1c30] border border-[#bfc7d2]/40 dark:border-white/10 text-on-surface-variant hover:text-[#006194] dark:hover:text-white transition-colors shadow-sm cursor-pointer ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Refresh Telemetry Now"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* VIEW MODE 1: MATRIX (Station Sensor Cards & Comprehensive Grid) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* 4 Station Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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
                  className={`bg-white dark:bg-[#0a1628] rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 p-5 shadow-sm hover:shadow-md hover:border-[#006194] transition-all flex flex-col justify-between group ${
                    onSelectStation ? 'cursor-pointer' : ''
                  }`}
                >
                  {/* Top Meta */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        ONLINE
                      </div>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider border font-mono ${regionStyle.bg} ${regionStyle.text} ${regionStyle.border}`}
                      >
                        {st.region}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-lg text-on-surface group-hover:text-[#006194] dark:group-hover:text-sky-400 transition-colors">
                      {st.name}
                    </h3>
                    <p className="text-[11px] text-on-surface-variant font-mono mt-0.5 line-clamp-1" title={st.location}>
                      {st.location}
                    </p>

                    {/* 2x2 Metric Grid */}
                    <div className="bg-[#ebf5ff]/60 dark:bg-white/5 rounded-xl p-3.5 my-3.5 border border-[#bfc7d2]/30 dark:border-white/5">
                      <div className="grid grid-cols-2 gap-3">
                        {st.metrics.map((m, idx) => (
                          <div key={idx} className={idx < 2 ? 'border-b border-[#bfc7d2]/30 dark:border-white/5 pb-2.5' : 'pt-0.5'}>
                            <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide font-mono">
                              {m.label}
                            </div>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <span
                                className={`font-mono font-bold leading-none ${
                                  m.is_primary && idx === 0
                                    ? 'text-2xl text-[#006194] dark:text-sky-400'
                                    : m.is_primary && idx === 1
                                    ? 'text-2xl text-on-surface'
                                    : 'text-sm font-semibold text-on-surface'
                                }`}
                              >
                                {m.value}
                              </span>
                              {m.sub && (
                                <span className="text-[10px] font-bold text-on-surface-variant uppercase font-mono">
                                  {m.sub}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 24h Synoptic Diurnal Curve SVG */}
                    <div className="flex flex-col gap-1 mb-3 bg-[#ebf5ff]/60 dark:bg-white/5 p-2 rounded-lg border border-[#bfc7d2]/30 dark:border-white/5">
                      <span className="font-mono text-[9px] text-[#707881] dark:text-slate-400 font-bold uppercase tracking-wider">
                        24H Diurnal Temperature Gradient
                      </span>
                      <div className="w-full h-9 flex items-center px-1">
                        <svg className="w-full h-8 text-[#006194] dark:text-sky-400" preserveAspectRatio="none" viewBox="0 0 200 40">
                          <path
                            d={
                              st.id === 'bharati'
                                ? 'M0,28 Q25,32 50,22 T100,16 T150,24 T200,10'
                                : st.id === 'maitri'
                                ? 'M0,15 Q35,5 75,20 T150,12 T200,22'
                                : st.id === 'himadri'
                                ? 'M0,22 Q50,30 100,10 T200,18'
                                : 'M0,35 Q60,10 120,25 T200,8'
                            }
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <path
                            d={
                              st.id === 'bharati'
                                ? 'M0,28 Q25,32 50,22 T100,16 T150,24 T200,10 L200,40 L0,40 Z'
                                : st.id === 'maitri'
                                ? 'M0,15 Q35,5 75,20 T150,12 T200,22 L200,40 L0,40 Z'
                                : st.id === 'himadri'
                                ? 'M0,22 Q50,30 100,10 T200,18 L200,40 L0,40 Z'
                                : 'M0,35 Q60,10 120,25 T200,8 L200,40 L0,40 Z'
                            }
                            fill="currentColor"
                            fillOpacity="0.15"
                          />
                        </svg>
                      </div>
                      <div className="flex justify-between font-mono text-[9px] text-[#707881] dark:text-slate-400">
                        <span>00:00 UTC</span>
                        <span className="font-semibold text-[#006194] dark:text-sky-300">
                          {st.id === 'bharati' ? '-18°C min' : st.id === 'maitri' ? 'Priyadarshini' : st.id === 'himadri' ? 'Kongsfjorden' : 'Bara Shigri'}
                        </span>
                        <span>23:59 UTC</span>
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

          {/* Matrix Comparative Sensor Table */}
          <div className="bg-white dark:bg-[#0a1628] rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 overflow-hidden shadow-sm transition-colors">
            <div className="px-5 py-4 border-b border-[#bfc7d2]/30 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge size={16} className="text-[#006194] dark:text-sky-400" />
                <h4 className="font-display font-bold text-sm text-on-surface">
                  Multi-Observatory Real-Time Sensor Telemetry Matrix
                </h4>
              </div>
              <span className="text-[11px] font-mono text-on-surface-variant">
                Synchronized at {timestamp_utc}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#ebf5ff]/60 dark:bg-white/5 text-on-surface-variant uppercase font-bold text-[10px] border-b border-[#bfc7d2]/30 dark:border-white/10 font-mono">
                  <tr>
                    <th className="py-3 px-4">Station / Location</th>
                    <th className="py-3 px-4">Region</th>
                    <th className="py-3 px-4">Ambient Temp</th>
                    <th className="py-3 px-4">Wind / Gust Vector</th>
                    <th className="py-3 px-4">Barometer</th>
                    <th className="py-3 px-4">Solar / Cryo Sensor</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#bfc7d2]/20 dark:border-white/5">
                  {stations.map((st) => (
                    <tr key={st.id} className="hover:bg-[#ebf5ff]/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-on-surface">
                        <div>{st.name}</div>
                        <div className="text-[10px] font-mono text-on-surface-variant font-normal">{st.location.split('·')[0]}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[10px] uppercase text-[#004b73] dark:text-sky-300 bg-[#cce5ff] dark:bg-sky-950 px-2 py-0.5 rounded border border-[#006194]/20 font-mono">
                          {st.region}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#006194] dark:text-sky-400 text-sm">
                        {st.surface_temp}°C
                      </td>
                      <td className="py-3.5 px-4 font-mono text-on-surface">
                        {st.wind_vector || st.katabatic_gust} <span className="text-[10px] text-on-surface-variant">{st.wind_dir}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-on-surface-variant">
                        {st.barometer ? `${st.barometer} hPa` : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-on-surface-variant font-mono">
                        {st.solar_rad ? `${st.solar_rad} W/m²` : st.fjord_salinity ? `Salinity ${st.fjord_salinity}` : st.snow_water_eq ? `SWE ${st.snow_water_eq}` : 'Active'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onSelectStation?.(st.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#006194]/10 hover:bg-[#006194]/20 text-[#006194] dark:text-sky-300 font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1 font-mono"
                        >
                          Inspect <ArrowUpRight size={11} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* VIEW MODE 2: 24h THERMAL GRADIENT (Diurnal Analysis & Curves) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'thermal' && (
        <div className="space-y-6">
          {/* Thermal Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0a1628] rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 p-4 shadow-sm transition-colors">
              <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 font-mono">Coldest Inland Base</div>
              <div className="text-xl font-extrabold text-[#0284c7] dark:text-sky-400 font-mono">Maitri Station</div>
              <div className="mt-2 text-xs text-on-surface-variant flex justify-between font-mono">
                <span>Mean: <strong className="text-on-surface">-18.4°C</strong></span>
                <span>Min: <strong className="text-on-surface">-21.2°C</strong></span>
                <span>Max: <strong className="text-on-surface">-15.8°C</strong></span>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0a1628] rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 p-4 shadow-sm transition-colors">
              <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 font-mono">Antarctic Coastal Base</div>
              <div className="text-xl font-extrabold text-[#0d9488] dark:text-teal-400 font-mono">Bharati Station</div>
              <div className="mt-2 text-xs text-on-surface-variant flex justify-between font-mono">
                <span>Mean: <strong className="text-on-surface">-12.1°C</strong></span>
                <span>Min: <strong className="text-on-surface">-15.1°C</strong></span>
                <span>Max: <strong className="text-on-surface">-9.2°C</strong></span>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0a1628] rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 p-4 shadow-sm transition-colors">
              <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 font-mono">High Arctic Fjord</div>
              <div className="text-xl font-extrabold text-[#0ea5e9] dark:text-sky-300 font-mono">Himadri Station</div>
              <div className="mt-2 text-xs text-on-surface-variant flex justify-between font-mono">
                <span>Mean: <strong className="text-on-surface">-4.8°C</strong></span>
                <span>Min: <strong className="text-on-surface">-6.5°C</strong></span>
                <span>Max: <strong className="text-on-surface">-3.1°C</strong></span>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0a1628] rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 p-4 shadow-sm transition-colors">
              <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 font-mono">Himalayan Cryosphere (4,080m)</div>
              <div className="text-xl font-extrabold text-[#6366f1] dark:text-indigo-400 font-mono">Himansh Obs.</div>
              <div className="mt-2 text-xs text-slate-600 flex justify-between font-mono">
                <span>Mean: <strong>-9.6°C</strong></span>
                <span>Min: <strong>-13.3°C</strong></span>
                <span>Max: <strong>-5.9°C</strong></span>
              </div>
            </div>
          </div>

          {/* Expanded Thermal Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Thermometer size={18} className="text-sky-600" />
                <div>
                  <h4 className="font-display font-bold text-base text-polar-navy">
                    24-Hour Synoptic Micro-Climate Thermal Gradient
                  </h4>
                  <p className="text-xs text-slate-400">
                    Continuous temperature trajectories (°C) showing synoptic diurnal swings and polar inversion bands.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs flex-wrap font-mono">
                <span className="flex items-center gap-1.5 text-sky-700 font-bold">
                  <span className="w-2.5 h-1 rounded-full bg-[#0284c7]" />
                  Maitri
                </span>
                <span className="flex items-center gap-1.5 text-teal-700 font-bold">
                  <span className="w-2.5 h-1 rounded-full bg-[#0d9488]" />
                  Bharati
                </span>
                <span className="flex items-center gap-1.5 text-cyan-700 font-bold">
                  <span className="w-2.5 h-1 rounded-full bg-[#0ea5e9]" />
                  Himadri
                </span>
                <span className="flex items-center gap-1.5 text-indigo-700 font-bold">
                  <span className="w-2.5 h-1 rounded-full bg-[#6366f1]" />
                  Himansh
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={synoptic_gradient} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} unit="°C" domain={[-24, 0]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a1628',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    labelStyle={{ fontWeight: 'bold', color: '#38bdf8' }}
                  />
                  <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '0°C Freeze', fill: '#ef4444', fontSize: 10 }} />
                  <Line type="monotone" dataKey="maitri_temp" name="Maitri Temp" stroke="#0284c7" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="bharati_temp" name="Bharati Temp" stroke="#0d9488" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="himadri_temp" name="Himadri Temp" stroke="#0ea5e9" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="himansh_temp" name="Himansh Temp" stroke="#6366f1" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* VIEW MODE 3: KATABATIC CURVES (Wind Velocity & Storm Dynamics) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'katabatic' && (
        <div className="space-y-6">
          {/* Wind & Katabatic Dynamics Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0a1628] rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 p-4 shadow-sm transition-colors">
              <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 font-mono">Peak Gust Observatory</div>
              <div className="text-xl font-extrabold text-[#0d9488] dark:text-teal-400 font-mono">Bharati (Larsemann)</div>
              <div className="mt-2 text-xs text-on-surface-variant font-mono">
                Current: <strong className="text-on-surface">38 km/h SE</strong> · Max: <strong className="text-on-surface">54 km/h</strong>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0a1628] rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 p-4 shadow-sm transition-colors">
              <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 font-mono">Continental Ice-Cap Draft</div>
              <div className="text-xl font-extrabold text-[#0284c7] dark:text-sky-400 font-mono">Maitri (Schirmacher)</div>
              <div className="mt-2 text-xs text-on-surface-variant font-mono">
                Current: <strong className="text-on-surface">24 km/h ENE</strong> · Max: <strong className="text-on-surface">36 km/h</strong>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0a1628] rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 p-4 shadow-sm transition-colors">
              <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 font-mono">Fjord Sea-Level Breeze</div>
              <div className="text-xl font-extrabold text-[#0ea5e9] dark:text-sky-300 font-mono">Himadri (Ny-Ålesund)</div>
              <div className="mt-2 text-xs text-on-surface-variant font-mono">
                Current: <strong className="text-on-surface">16 km/h NNW</strong> · Max: <strong className="text-on-surface">22 km/h</strong>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0a1628] rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 p-4 shadow-sm transition-colors">
              <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 font-mono">Himalayan Valley Gradient</div>
              <div className="text-xl font-extrabold text-[#6366f1] dark:text-indigo-400 font-mono">Himansh (Chandra Basin)</div>
              <div className="mt-2 text-xs text-on-surface-variant font-mono">
                Current: <strong className="text-on-surface">12 km/h W</strong> · Max: <strong className="text-on-surface">28 km/h</strong>
              </div>
            </div>
          </div>

          {/* Expanded Katabatic Wind Chart */}
          <div className="bg-white dark:bg-[#0a1628] rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 p-6 shadow-sm transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Wind size={18} className="text-[#0d9488] dark:text-teal-400" />
                <div>
                  <h4 className="font-display font-bold text-base text-on-surface">
                    24-Hour Polar Katabatic Wind & Storm Dynamics
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    High-density gravity-driven down-slope wind velocity tracking across polar ice sheets.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs flex-wrap font-mono">
                <span className="flex items-center gap-1.5 text-[#0d9488] dark:text-teal-400 font-bold">
                  <span className="w-2.5 h-1 rounded-full bg-[#0d9488]" />
                  Bharati Gusts
                </span>
                <span className="flex items-center gap-1.5 text-[#006194] dark:text-sky-400 font-bold">
                  <span className="w-2.5 h-1 rounded-full bg-[#0284c7]" />
                  Maitri Wind
                </span>
                <span className="flex items-center gap-1.5 text-cyan-700 font-bold">
                  <span className="w-2.5 h-1 rounded-full bg-[#0ea5e9]" />
                  Himadri Wind
                </span>
                <span className="flex items-center gap-1.5 text-indigo-700 font-bold">
                  <span className="w-2.5 h-1 rounded-full bg-[#6366f1]" />
                  Himansh Wind
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={synoptic_gradient} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} unit=" km/h" domain={[0, 60]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a1628',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    labelStyle={{ fontWeight: 'bold', color: '#38bdf8' }}
                  />
                  <Line type="monotone" dataKey="bharati_wind" name="Bharati Gust" stroke="#0d9488" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="maitri_wind" name="Maitri Wind" stroke="#0284c7" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="himadri_wind" name="Himadri Wind" stroke="#0ea5e9" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="himansh_wind" name="Himansh Wind" stroke="#6366f1" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
