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

const DEFAULT_EXPEDITIONS: Expedition[] = [
  // Antarctic Expeditions
  {
    id: 'iae-44',
    number: 44,
    title: '44th Indian Antarctic Expedition',
    year: 2024,
    region: 'antarctica',
    duration_days: 136,
    research_domains: ['Oceanography', 'Climate Science', 'Glaciology', 'Atmospheric Science'],
    chief_scientist: 'Dr. Shailesh Nayak',
    description: "India's most comprehensive polar research mission to date, deploying advanced scientific instruments across Maitri and Bharati stations for Southern Ocean heat and ice sheet dynamics.",
  },
  {
    id: 'iae-43',
    number: 43,
    title: '43rd Indian Antarctic Expedition',
    year: 2023,
    region: 'antarctica',
    duration_days: 133,
    research_domains: ['Oceanography', 'Atmospheric Science', 'Biology', 'Geology'],
    chief_scientist: 'Dr. Rasik Ravindra',
    description: "Advances in understanding the Southern Ocean's role in global climate systems, Amery Ice Shelf dynamics, and biological productivity.",
  },
  {
    id: 'iae-1',
    number: 1,
    title: '1st Indian Antarctic Expedition',
    year: 1981,
    region: 'antarctica',
    duration_days: 112,
    research_domains: ['Geology', 'Meteorology', 'Glaciology'],
    chief_scientist: 'Dr. Syed Zahoor Qasim',
    description: "India's historic first foray into Antarctic research, establishing the foundation for India's polar science program and Dakshin Gangotri base.",
  },

  // Arctic Expeditions
  {
    id: 'arc-16',
    number: 16,
    title: '16th Indian Arctic Expedition (1st Arctic Winter Mission)',
    year: 2024,
    region: 'arctic',
    duration_days: 98,
    research_domains: ['Space Weather', 'Atmospheric Physics', 'Sea Ice Dynamics', 'Astronomy'],
    chief_scientist: 'Dr. K. P. Krishnan',
    description: "Historic breakthrough: India's first-ever winter scientific expedition to the Arctic. Operated out of Himadri throughout the harsh polar night (-30°C) for continuous winter measurements.",
  },
  {
    id: 'arc-15',
    number: 15,
    title: '15th Indian Arctic Expedition',
    year: 2023,
    region: 'arctic',
    duration_days: 96,
    research_domains: ['Glaciology', 'Atmospheric Chemistry', 'Marine Ecology'],
    chief_scientist: 'Dr. Archana Dayal',
    description: "Investigation into Svalbard glacier mass balance, fjord biogeochemistry, and teleconnections between Arctic warming and the Indian monsoon.",
  },
  {
    id: 'arc-8',
    number: 8,
    title: '8th Indian Arctic Expedition (IndARC Deployment)',
    year: 2014,
    region: 'arctic',
    duration_days: 47,
    research_domains: ['Physical Oceanography', 'Marine Geochemistry', 'Climate Teleconnections'],
    chief_scientist: 'Dr. K. P. Krishnan',
    description: "Deployed India's first multi-sensor moored underwater observatory (IndARC) at 192 m depth in Kongsfjorden to monitor Arctic oceanographic dynamics.",
  },
  {
    id: 'arc-2',
    number: 2,
    title: '2nd Indian Arctic Expedition (Himadri Commissioning)',
    year: 2008,
    region: 'arctic',
    duration_days: 59,
    research_domains: ['Atmospheric Physics', 'Glaciology', 'Marine Biology'],
    chief_scientist: 'Dr. Rasik Ravindra',
    description: "Formal commissioning of 'Himadri'—India's permanent Arctic research base at Ny-Ålesund, Svalbard, making India the 11th nation with a permanent Arctic station.",
  },
  {
    id: 'arc-1',
    number: 1,
    title: '1st Indian Arctic Expedition',
    year: 2007,
    region: 'arctic',
    duration_days: 34,
    research_domains: ['Atmospheric Science', 'Polar Biology', 'Glaciology'],
    chief_scientist: 'Dr. Rasik Ravindra',
    description: "India's maiden scientific expedition to the Arctic, initiating India's presence at Ny-Ålesund in Svalbard.",
  },
];

export default function ExpeditionsPage() {
  const [expeditions, setExpeditions] = useState<Expedition[]>(DEFAULT_EXPEDITIONS);
  const [loading, setLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState('');

  useEffect(() => {
    expeditionsApi.list(regionFilter || undefined)
      .then(r => {
        if (r.data && Array.isArray(r.data) && r.data.length > 0) {
          setExpeditions(r.data);
        } else {
          setExpeditions(
            regionFilter
              ? DEFAULT_EXPEDITIONS.filter(e => e.region === regionFilter)
              : DEFAULT_EXPEDITIONS
          );
        }
      })
      .catch(() => {
        setExpeditions(
          regionFilter
            ? DEFAULT_EXPEDITIONS.filter(e => e.region === regionFilter)
            : DEFAULT_EXPEDITIONS
        );
      })
      .finally(() => setLoading(false));
  }, [regionFilter]);

  const antarctic = expeditions.filter(e => e.region === 'antarctica');
  const arctic = expeditions.filter(e => e.region === 'arctic');

  return (
    <div className="min-h-screen bg-surface text-on-surface pt-20 transition-colors">
      {/* Header */}
      <div className="py-14 bg-gradient-to-b from-[#ebf5ff] to-surface dark:from-[#0a1628] dark:to-[#06111F] border-b border-[#bfc7d2]/40 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#dff0ff] dark:bg-white/10 text-[#00685f] dark:text-teal-300 font-mono text-xs font-semibold uppercase tracking-wider mb-4 border border-[#bfc7d2]/40 dark:border-white/10">
            <Globe size={13} />
            National Logistical Operations · MoES
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-[#001e2e] dark:text-white mb-3">
            Expeditions to the Poles
          </h1>
          <p className="text-[#3f4850] dark:text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
            India has conducted 44+ expeditions to Antarctica and 16+ to the Arctic. Explore the complete timeline of scientific discovery, vessels, and research domains.
          </p>

          {/* Region filter */}
          <div className="flex flex-wrap gap-2 mt-6">
            {REGIONS.map((r) => (
              <button
                key={r.value}
                onClick={() => setRegionFilter(r.value)}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
                  regionFilter === r.value
                    ? 'bg-[#007bb9] text-white border-[#007bb9] shadow-sm'
                    : 'bg-white dark:bg-white/10 border-[#bfc7d2]/50 dark:border-white/10 text-[#3f4850] dark:text-slate-300 hover:border-[#006194]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-[#ebf5ff] dark:bg-white/5 animate-pulse border border-[#bfc7d2]/30 dark:border-white/5" />
            ))}
          </div>
        ) : (
          <>
            {(regionFilter === '' || regionFilter === 'antarctica') && antarctic.length > 0 && (
              <div className="mb-14">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-7 bg-[#006194] dark:bg-sky-400 rounded-full" />
                  <h2 className="font-display font-bold text-2xl text-[#001e2e] dark:text-white">
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
                  <div className="w-1.5 h-7 bg-[#00685f] dark:bg-teal-400 rounded-full" />
                  <h2 className="font-display font-bold text-2xl text-[#001e2e] dark:text-white">
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
              <div className="p-16 text-center rounded-xl bg-surface-container-lowest border border-[#bfc7d2]/40 dark:border-white/10">
                <Globe size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="font-display font-bold text-xl text-[#001e2e] dark:text-white mb-2">No expeditions found</h3>
                <p className="text-[#707881] text-sm">Please verify the API connectivity or refresh the filters.</p>
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
      className="bg-surface-container-lowest rounded-xl border border-[#bfc7d2]/40 dark:border-white/10 hover:border-[#006194] transition-all shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden group"
    >
      {/* Color bar */}
      <div className={`h-1.5 ${isAntarctic ? 'bg-gradient-to-r from-sky-400 to-blue-500' : 'bg-gradient-to-r from-teal-400 to-cyan-500'}`} />

      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`badge text-xs ${isAntarctic ? 'badge-cyan' : 'badge-teal'}`}>
            {isAntarctic ? 'Antarctica' : 'Arctic'}
          </span>
          <span className="badge badge-navy text-xs">
            {isAntarctic ? `IAE-${expedition.number}` : `Arctic #${expedition.number}`}
          </span>
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
