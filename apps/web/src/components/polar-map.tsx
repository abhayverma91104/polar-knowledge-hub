'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface Station {
  id: string;
  name: string;
  region: string;
  latitude?: number;
  longitude?: number;
  research_areas?: string[];
  established_year?: number;
  code?: string;
  description?: string;
  document_count?: number;
  dataset_count?: number;
  media_count?: number;
}

interface Props {
  stations: Station[];
  onStationClick: (station: Station) => void;
  selectedStation: Station | null;
}

export default function PolarMapComponent({ stations, onStationClick, selectedStation }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map('polar-map', {
      center: [-30, 0],
      zoom: 2,
      minZoom: 1,
      maxZoom: 10,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current.clear();

    stations.forEach((station) => {
      if (!station.latitude || !station.longitude) return;

      const isAntarctic = station.region === 'antarctica';
      const color = isAntarctic ? '#38bdf8' : '#2dd4bf';
      const selectedColor = '#f59e0b';
      const isSelected = selectedStation?.id === station.id;

      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            width: ${isSelected ? '20px' : '16px'};
            height: ${isSelected ? '20px' : '16px'};
            background: ${isSelected ? selectedColor : color};
            border: 2.5px solid white;
            border-radius: 50%;
            box-shadow: 0 0 ${isSelected ? '16px' : '8px'} ${isSelected ? selectedColor : color};
            transition: all 0.2s;
          "></div>
        `,
        iconSize: [isSelected ? 20 : 16, isSelected ? 20 : 16],
        iconAnchor: [isSelected ? 10 : 8, isSelected ? 10 : 8],
      });

      const marker = L.marker([station.latitude, station.longitude], { icon })
        .addTo(map)
        .bindTooltip(`
          <div style="font-family: 'Inter', sans-serif; padding: 6px 8px;">
            <div style="font-weight: bold; font-size: 13px;">${station.name} Research Station</div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
              ${isAntarctic ? 'Antarctica' : 'Arctic'} · Est. ${station.established_year || 'N/A'}
            </div>
          </div>
        `, { className: 'polar-tooltip', direction: 'top' })
        .on('click', () => onStationClick(station));

      markersRef.current.set(station.id, marker);
    });
  }, [stations, selectedStation, onStationClick]);

  // Fly to selected station
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedStation?.latitude) return;
    map.flyTo([selectedStation.latitude, selectedStation.longitude!], 5, { duration: 1 });
  }, [selectedStation]);

  return (
    <>
      <style>{`
        .polar-tooltip {
          background: #0d1e36;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: white;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .polar-tooltip::before {
          border-top-color: #0d1e36;
        }
        .leaflet-control-zoom a {
          background: #0d1e36;
          border-color: rgba(255,255,255,0.1);
          color: white;
        }
        .leaflet-control-zoom a:hover {
          background: #112545;
        }
      `}</style>
      <div
        id="polar-map"
        className="w-full h-full rounded-2xl overflow-hidden"
      />
    </>
  );
}
