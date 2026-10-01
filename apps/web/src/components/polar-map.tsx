'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, Globe, Compass, Mountain, Eye, Sparkles } from 'lucide-react';

export interface Station {
  id: string;
  name: string;
  region: string;
  latitude?: number;
  longitude?: number;
  research_areas?: string[];
  facilities?: string[];
  established_year?: number;
  code?: string;
  description?: string;
  document_count?: number;
  dataset_count?: number;
  media_count?: number;
  is_active?: boolean;
}

interface Props {
  stations: Station[];
  onStationClick: (station: Station) => void;
  selectedStation: Station | null;
  activeLayer?: 'dark' | 'satellite' | 'topo';
  onLayerChange?: (layer: 'dark' | 'satellite' | 'topo') => void;
}

const BASEMAP_TILES = {
  dark: {
    name: 'Dark Canvas',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16,
  },
  satellite: {
    name: 'Satellite View',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
    maxZoom: 18,
  },
  topo: {
    name: 'Terrain & Oceans',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, USGS, FAO, NPS, NRCAN, GeoBase',
    maxZoom: 18,
  },
};

export default function PolarMapComponent({
  stations,
  onStationClick,
  selectedStation,
  activeLayer = 'dark',
  onLayerChange,
}: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [currentLayer, setCurrentLayer] = useState<'dark' | 'satellite' | 'topo'>(activeLayer);

  // Initialize Map
  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map('polar-map', {
      center: [-25, 30],
      zoom: 2,
      minZoom: 1.5,
      maxZoom: 14,
      zoomControl: false,
      worldCopyJump: true,
    });

    // Custom positioned zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial tile layer (Esri Dark Canvas - completely free & zero API key watermarks!)
    const initialConfig = BASEMAP_TILES[currentLayer];
    const tile = L.tileLayer(initialConfig.url, {
      attribution: initialConfig.attribution,
      maxZoom: initialConfig.maxZoom,
    }).addTo(map);

    tileLayerRef.current = tile;
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle Layer Switching
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const cfg = BASEMAP_TILES[currentLayer];
    const tile = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
    }).addTo(map);

    tileLayerRef.current = tile;
  }, [currentLayer]);

  // Synchronize internal state if parent passed controlled prop
  useEffect(() => {
    if (activeLayer && activeLayer !== currentLayer) {
      setCurrentLayer(activeLayer);
    }
  }, [activeLayer]);

  const handleSetLayer = (layer: 'dark' | 'satellite' | 'topo') => {
    setCurrentLayer(layer);
    if (onLayerChange) onLayerChange(layer);
  };

  // Render Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    stations.forEach((station) => {
      if (station.latitude === undefined || station.longitude === undefined) return;

      const isAntarctic = station.region?.toLowerCase() === 'antarctica';
      const isArctic = station.region?.toLowerCase() === 'arctic';
      const isHimalayas = station.code === 'HIMANSH' || station.name.toLowerCase().includes('himansh');
      const isSelected = selectedStation?.id === station.id;

      // Color scheme
      let baseColor = '#38bdf8'; // Electric Ice Blue (Antarctica)
      if (isArctic) baseColor = '#2dd4bf'; // Polar Mint (Arctic)
      if (isHimalayas) baseColor = '#c084fc'; // Cryosphere Purple (Himalayas)
      if (station.code === 'INDARC') baseColor = '#60a5fa'; // Oceanic Deep Blue

      const activeColor = isSelected ? '#f59e0b' : baseColor;

      const markerHtml = `
        <div class="polar-station-marker group" style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <!-- Animated pulse halo -->
          <div style="
            position: absolute;
            width: ${isSelected ? '32px' : '24px'};
            height: ${isSelected ? '32px' : '24px'};
            border-radius: 50%;
            background: ${activeColor};
            opacity: 0.35;
            animation: polar-pulse 2s infinite ease-out;
          "></div>
          
          <!-- Core marker -->
          <div style="
            position: relative;
            width: ${isSelected ? '20px' : '16px'};
            height: ${isSelected ? '20px' : '16px'};
            border-radius: 50%;
            background: ${activeColor};
            border: 2.5px solid #ffffff;
            box-shadow: 0 0 14px ${activeColor}, 0 4px 10px rgba(0,0,0,0.5);
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          "></div>

          <!-- Pin icon indicator for selected station -->
          ${
            isSelected
              ? `<div style="
                  position: absolute;
                  bottom: -6px;
                  width: 0; 
                  height: 0; 
                  border-left: 5px solid transparent;
                  border-right: 5px solid transparent;
                  border-top: 6px solid #f59e0b;
                "></div>`
              : ''
          }
        </div>
      `;

      const icon = L.divIcon({
        className: 'polar-div-icon',
        html: markerHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([station.latitude, station.longitude], {
        icon,
        title: station.name,
        zIndexOffset: isSelected ? 1000 : 100,
      })
        .addTo(map)
        .bindTooltip(
          `
          <div style="font-family: inherit; padding: 6px 10px; min-width: 140px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <span style="font-weight: 700; font-size: 13px; color: #ffffff;">${station.name}</span>
              <span style="font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.15); color: ${activeColor};">
                ${station.code || 'NCPOR'}
              </span>
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 3px;">
              ${station.region ? station.region.toUpperCase() : 'POLAR'} · Est. ${station.established_year || 'Active'}
            </div>
            <div style="font-size: 10px; color: #38bdf8; margin-top: 4px; font-weight: 500;">
              Click to view station profile →
            </div>
          </div>
        `,
          {
            className: 'polar-custom-tooltip',
            direction: 'top',
            offset: [0, -12],
          }
        )
        .on('click', () => {
          onStationClick(station);
        });

      markersRef.current.set(station.id, marker);
    });
  }, [stations, selectedStation, onStationClick]);

  // Fly to selected station
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedStation?.latitude || selectedStation?.longitude === undefined) return;

    map.flyTo([selectedStation.latitude, selectedStation.longitude], 6, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [selectedStation]);

  // Viewport Presets
  const flyToRegion = (coords: [number, number], zoom: number) => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo(coords, zoom, { duration: 1.4 });
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      <style>{`
        @keyframes polar-pulse {
          0% { transform: scale(0.8); opacity: 0.6; }
          70% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .polar-div-icon {
          background: transparent !important;
          border: none !important;
        }
        .polar-custom-tooltip {
          background: #0a1628 !important;
          border: 1px solid rgba(56, 189, 248, 0.3) !important;
          border-radius: 10px !important;
          color: white !important;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6) !important;
        }
        .polar-custom-tooltip .leaflet-tooltip-pane {
          z-index: 1000;
        }
        .polar-custom-tooltip::before {
          border-top-color: #0a1628 !important;
        }
        .leaflet-control-zoom a {
          background: #0a1628 !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
          color: white !important;
          border-radius: 8px !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
          margin-bottom: 4px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
        }
        .leaflet-control-zoom a:hover {
          background: #0ea5e9 !important;
          color: white !important;
        }
        .leaflet-container {
          background: #040914 !important;
          font-family: inherit;
        }
      `}</style>

      {/* Floating Basemap Selector */}
      <div className="absolute top-4 right-4 z-[500] flex items-center bg-slate-900/90 backdrop-blur-md border border-white/10 p-1 rounded-xl shadow-xl">
        <button
          onClick={() => handleSetLayer('dark')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentLayer === 'dark'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
          title="Sleek high-contrast dark polar canvas"
        >
          <Layers size={13} />
          <span>Dark Canvas</span>
        </button>

        <button
          onClick={() => handleSetLayer('satellite')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentLayer === 'satellite'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
          title="Real satellite photography showing ice sheets & glaciers"
        >
          <Globe size={13} />
          <span>Satellite</span>
        </button>

        <button
          onClick={() => handleSetLayer('topo')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentLayer === 'topo'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
          title="Topographic elevation & bathymetric relief"
        >
          <Mountain size={13} />
          <span>Terrain</span>
        </button>
      </div>

      {/* Quick Polar Fly-To Presets Toolbar */}
      <div className="absolute top-4 left-4 z-[500] flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-white/10 p-1.5 rounded-xl shadow-xl">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1">
          <Compass size={12} className="text-sky-400" /> Jump to:
        </span>

        <button
          onClick={() => flyToRegion([-71.5, 45], 3)}
          className="px-2.5 py-1 text-xs rounded-lg font-medium text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 transition-all flex items-center gap-1"
        >
          <span>❄️</span> Antarctica
        </button>

        <button
          onClick={() => flyToRegion([78.9, 12], 4)}
          className="px-2.5 py-1 text-xs rounded-lg font-medium text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 transition-all flex items-center gap-1"
        >
          <span>🧊</span> Arctic
        </button>

        <button
          onClick={() => flyToRegion([32.4, 77.6], 6)}
          className="px-2.5 py-1 text-xs rounded-lg font-medium text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-all flex items-center gap-1"
        >
          <span>🏔️</span> Himalayas
        </button>

        <button
          onClick={() => flyToRegion([-25, 30], 2)}
          className="px-2.5 py-1 text-xs rounded-lg font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all"
        >
          🌐 Global
        </button>
      </div>

      {/* Bottom Left Legend */}
      <div className="absolute bottom-4 left-4 z-[500] bg-slate-900/90 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded-xl shadow-xl flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]"></span>
          <span className="text-slate-300">Antarctica</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_8px_#2dd4bf]"></span>
          <span className="text-slate-300">Arctic</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]"></span>
          <span className="text-slate-300">Himalayas Cryosphere</span>
        </div>
      </div>

      {/* Main Map Container */}
      <div id="polar-map" className="w-full h-full" />
    </div>
  );
}
