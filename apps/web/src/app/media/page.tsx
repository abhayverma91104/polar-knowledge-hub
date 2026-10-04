'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Image as ImageIcon, Video, Filter, Download,
  ExternalLink, X, MapPin, Tag, Calendar, Globe, Play
} from 'lucide-react';
import { mediaApi } from '@/lib/api';

interface MediaItem {
  id: string;
  title: string;
  description?: string;
  media_type: 'image' | 'video';
  file_url: string;
  thumbnail_url?: string;
  tags?: string[];
  year?: number;
  region?: string;
  credit?: string;
}

const LOCAL_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'm1',
    title: 'Aurora Australis Over Maitri Station',
    description: 'Vibrant green and violet aurora dancing over the ice-free Schirmacher Oasis during polar night.',
    media_type: 'image',
    file_url: '/images/aurora-maitri.jpg',
    thumbnail_url: '/images/aurora-maitri.jpg',
    tags: ['Aurora', 'Maitri', 'Atmospheric Science', 'Polar Night'],
    year: 2024,
    region: 'antarctica',
    credit: 'NCPOR / 43rd IAE Expedition Team',
  },
  {
    id: 'm2',
    title: 'Deep Ice Core Paleoclimate Sampling',
    description: 'Cryosphere scientists extracting and cataloging continuous ice cores for paleo-atmospheric records.',
    media_type: 'image',
    file_url: '/images/ice-core-science.jpg',
    thumbnail_url: '/images/ice-core-science.jpg',
    tags: ['Ice Core', 'Glaciology', 'Paleoclimate', 'Cryosphere'],
    year: 2024,
    region: 'antarctica',
    credit: 'Ice Core Laboratory, NCPOR',
  },
  {
    id: 'm3',
    title: 'Adelie Penguin Breeding Colony',
    description: 'Coastal biological census and ecological population dynamics monitoring near Larsemann Hills.',
    media_type: 'image',
    file_url: '/images/penguin-colony.jpg',
    thumbnail_url: '/images/penguin-colony.jpg',
    tags: ['Wildlife', 'Adelie Penguins', 'Biodiversity', 'Ecosystems'],
    year: 2024,
    region: 'antarctica',
    credit: 'Marine & Polar Biology Division, NCPOR',
  },
  {
    id: 'm4',
    title: 'Southern Ocean CTD Profiling & Water Sampling',
    description: 'Deployment of Conductivity-Temperature-Depth rosette for deep water carbon sink measurement.',
    media_type: 'image',
    file_url: '/images/ocean-research.jpg',
    thumbnail_url: '/images/ocean-research.jpg',
    tags: ['Oceanography', 'Southern Ocean', 'Carbon Sink', 'CTD'],
    year: 2024,
    region: 'antarctica',
    credit: 'ORV Sagar Nidhi / NCPOR Oceanography',
  },
  {
    id: 'm5',
    title: 'Bharati Research Station at Larsemann Hills',
    description: 'Modern architectural and scientific complex situated on promontory overlooking Prydz Bay.',
    media_type: 'image',
    file_url: '/images/bharati-station.jpg',
    thumbnail_url: '/images/bharati-station.jpg',
    tags: ['Bharati', 'Station Architecture', 'Larsemann Hills'],
    year: 2023,
    region: 'antarctica',
    credit: 'NCPOR Logistics & Infrastructure',
  },
  {
    id: 'm6',
    title: 'Himadri Arctic Research Base, Ny-Ålesund',
    description: "India's permanent research laboratory in Svalbard surrounded by Arctic glacial moraines.",
    media_type: 'image',
    file_url: '/images/himadri-arctic.jpg',
    thumbnail_url: '/images/himadri-arctic.jpg',
    tags: ['Himadri', 'Arctic', 'Svalbard', 'Ny-Ålesund'],
    year: 2024,
    region: 'arctic',
    credit: 'NCPOR Arctic Research Group',
  },
  {
    id: 'm7',
    title: 'Ice-Class Expedition Research Vessel',
    description: 'Icebreaker ship navigating thick pack ice fields in the Southern Ocean carrying scientific personnel.',
    media_type: 'image',
    file_url: '/images/expedition-ship.jpg',
    thumbnail_url: '/images/expedition-ship.jpg',
    tags: ['Expedition Ship', 'Icebreaker', 'Southern Ocean', 'Logistics'],
    year: 2024,
    region: 'antarctica',
    credit: 'NCPOR Expedition Logistics',
  },
  {
    id: 'm8',
    title: 'Antarctic Continental Ice Sheet Landscape',
    description: 'Vast expanse of the polar plateau showcasing extreme topography and wind-carved sastrugi snow formations.',
    media_type: 'image',
    file_url: '/images/antarctica-landscape.jpg',
    thumbnail_url: '/images/antarctica-landscape.jpg',
    tags: ['Ice Sheet', 'Landscape', 'Plateau', 'Cryosphere'],
    year: 2023,
    region: 'antarctica',
    credit: 'NCPOR Glaciology Team',
  },
];

export default function MediaPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(LOCAL_MEDIA_ITEMS);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [activeModalItem, setActiveModalItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    mediaApi.list()
      .then((res) => {
        if (res.data?.items && res.data.items.length > 0) {
          // Merge API items with local curated items
          const apiItems = res.data.items.map((it: MediaItem) => ({
            ...it,
            thumbnail_url: it.thumbnail_url || it.file_url || '/images/bharati-station.jpg',
            file_url: it.file_url || '/images/bharati-station.jpg',
          }));
          setMediaItems([...apiItems, ...LOCAL_MEDIA_ITEMS]);
        }
      })
      .catch(() => {
        // Fallback to local items
        setMediaItems(LOCAL_MEDIA_ITEMS);
      });
  }, []);

  const filteredItems = mediaItems.filter((item) => {
    if (selectedRegion === 'all') return true;
    return item.region?.toLowerCase() === selectedRegion.toLowerCase();
  });

  return (
    <div className="min-h-screen pt-20 pb-20 bg-surface text-on-surface transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-b from-[#ebf5ff] to-surface dark:from-[#0a1628] dark:to-[#06111F] border border-[#bfc7d2]/40 dark:border-white/10 mb-8 mt-4 shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#dff0ff] dark:bg-white/10 text-[#00685f] dark:text-teal-300 text-xs font-mono font-bold uppercase tracking-wider mb-4 border border-[#bfc7d2]/40 dark:border-white/10">
            <ImageIcon size={14} />
            <span>NCPOR Documentary Archives · Field Media</span>
          </div>

          <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#001e2e] dark:text-white mb-3">
            Polar Media Archives
          </h1>
          <p className="text-[#3f4850] dark:text-slate-300 text-base leading-relaxed max-w-3xl">
            Official photographic and documentary records from Indian expeditions to Antarctica, the Arctic, and the Southern Ocean.
          </p>

          {/* Region Tabs */}
          <div className="flex items-center gap-2 mt-6 pt-6 border-t border-[#bfc7d2]/30 dark:border-white/10 overflow-x-auto pb-2">
            {[
              { id: 'all', label: 'All Media' },
              { id: 'antarctica', label: 'Antarctic Expeditions' },
              { id: 'arctic', label: 'Arctic & Svalbard' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedRegion(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold whitespace-nowrap transition-all border ${
                  selectedRegion === tab.id
                    ? 'bg-[#007bb9] text-white border-[#007bb9] shadow-sm'
                    : 'bg-white dark:bg-white/5 border-[#bfc7d2]/40 dark:border-white/10 text-[#3f4850] dark:text-slate-300 hover:border-[#006194]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id + idx}
              onClick={() => setActiveModalItem(item)}
              className="rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 bg-white dark:bg-[#0a1628] overflow-hidden cursor-pointer group transition-all hover:border-[#006194] shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[#ebf5ff] dark:bg-[#0c1c30]">
                <img
                  src={item.thumbnail_url || item.file_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/10 font-mono">
                  {item.region || 'Polar'}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-on-surface mb-2 group-hover:text-[#006194] dark:group-hover:text-sky-400 transition-colors">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-on-surface-variant text-xs line-clamp-2 mb-4 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#bfc7d2]/30 dark:border-white/10 flex items-center justify-between text-xs text-on-surface-variant font-mono">
                  <span>{item.year || 2024}</span>
                  <span className="text-[#006194] dark:text-sky-400 font-semibold group-hover:underline">View Photo →</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Lightbox */}
        {activeModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div
              className="relative max-w-4xl w-full rounded-2xl border border-[#bfc7d2]/40 dark:border-white/15 bg-white dark:bg-[#0a1628] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-4 px-6 border-b border-[#bfc7d2]/30 dark:border-white/10 flex items-center justify-between">
                <div className="text-sm font-bold text-on-surface truncate max-w-lg">
                  {activeModalItem.title}
                </div>
                <button
                  onClick={() => setActiveModalItem(null)}
                  className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-[#ebf5ff] dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Image */}
              <div className="relative aspect-video max-h-[58vh] overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={activeModalItem.file_url}
                  alt={activeModalItem.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Modal Footer Details */}
              <div className="p-6 overflow-y-auto">
                <p className="text-on-surface text-sm leading-relaxed mb-4">
                  {activeModalItem.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-on-surface-variant pt-3 border-t border-[#bfc7d2]/30 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    {activeModalItem.credit && (
                      <span><strong>Credit:</strong> {activeModalItem.credit}</span>
                    )}
                    <span><strong>Year:</strong> {activeModalItem.year || 2024}</span>
                  </div>

                  <a
                    href={activeModalItem.file_url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#006194] hover:bg-[#007bb9] text-white font-semibold text-xs transition-colors shadow-sm"
                  >
                    <Download size={13} /> Full Resolution
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
