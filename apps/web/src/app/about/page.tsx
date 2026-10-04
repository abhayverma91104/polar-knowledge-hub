'use client';

import Link from 'next/link';
import {
  Globe, Award, MapPin, Calendar, ExternalLink,
  Shield, CheckCircle2, ArrowRight, Users, Compass, BookOpen
} from 'lucide-react';

const TIMELINE = [
  { year: 1981, title: '1st Indian Antarctic Expedition', desc: 'Landed on Antarctica on 9 January 1982 led by Dr. S.Z. Qasim, launching India into polar science.' },
  { year: 1983, title: 'Dakshin Gangotri Station', desc: "India's first permanent research base established in Antarctica in Queen Maud Land." },
  { year: 1989, title: 'Maitri Station Commissioned', desc: 'Second permanent Antarctic base constructed in the ice-free rocky Schirmacher Oasis.' },
  { year: 1998, title: 'Founding of NCPOR', desc: 'National Centre for Antarctic and Ocean Research established in Vasco da Gama, Goa as an autonomous R&D institution.' },
  { year: 2008, title: 'Himadri Arctic Station', desc: "India's first permanent Arctic station opened at Ny-Ålesund, Spitsbergen, Svalbard." },
  { year: 2012, title: 'Bharati Station Commissioned', desc: 'State-of-the-art third Antarctic base commissioned at Larsemann Hills, East Antarctica.' },
  { year: 2014, title: 'IndARC Observatory Deployed', desc: "India's first multi-sensor moored underwater observatory in Kongsfjorden, Arctic." },
  { year: 2016, title: 'Himansh High-Altitude Station', desc: 'Cryosphere research station established at 13,500 ft in Spiti, Himachal Pradesh.' },
  { year: 2024, title: '44th Indian Antarctic Expedition', desc: 'Deploying deep ice-core drilling and advanced climate-teleconnection sensors.' },
];

const DIVISIONS = [
  { title: 'Antarctic Science & Logistics', desc: 'Planning and execution of annual expeditions to Maitri and Bharati stations and ice core drilling operations.' },
  { title: 'Arctic Research Programme', desc: 'Long-term studies on sea ice melting, atmospheric aerosols, fjord ecology, and teleconnections with the Indian Monsoon.' },
  { title: 'Southern Ocean Biogeochemistry', desc: 'Multi-institutional cruises studying carbon dioxide flux, biological pump, and physical ocean dynamics.' },
  { title: 'Cryosphere & Glaciology', desc: 'Monitoring of benchmark glaciers in the Western Himalayas and Antarctic ice sheet mass balance.' },
  { title: 'Ocean Science & Seabed Mapping', desc: 'Hydrothermal vent exploration, deep-sea minerals, and continental shelf survey programmes.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20 pb-20 bg-surface text-on-surface transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-[#ebf5ff] to-surface dark:from-[#0a1628] dark:to-[#06111F] border border-[#bfc7d2]/40 dark:border-white/10 mb-10 mt-4 shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#dff0ff] dark:bg-white/10 text-[#00685f] dark:text-teal-300 font-mono text-xs font-bold uppercase tracking-wider mb-4 border border-[#bfc7d2]/40 dark:border-white/10">
            <Globe size={14} />
            <span>Ministry of Earth Sciences · Government of India</span>
          </div>

          <h1 className="font-display font-bold text-3xl sm:text-5xl text-[#001e2e] dark:text-white mb-4 leading-tight">
            National Centre for Polar and Ocean Research
          </h1>

          <p className="text-[#3f4850] dark:text-slate-300 text-base sm:text-lg leading-relaxed max-w-4xl font-normal mb-8">
            NCPOR is India&apos;s premier R&amp;D institution responsible for coordinating and implementing the nation&apos;s scientific research programmes in the polar regions (Antarctica and Arctic), the Himalayas, and the Southern Ocean.
          </p>

          <div className="flex flex-wrap gap-4 pt-6 border-t border-[#bfc7d2]/30 dark:border-white/10 text-xs text-[#3f4850] dark:text-slate-300 font-mono">
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-[#006194] dark:text-sky-400" />
              <span>Headland Sada, Vasco da Gama, Goa 403804</span>
            </div>
            <div className="flex items-center gap-2">
              <Award size={15} className="text-[#00685f] dark:text-teal-400" />
              <span>Autonomous Society under MoES</span>
            </div>
            <a
              href="https://www.ncpor.res.in"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[#006194] dark:text-sky-400 hover:underline font-semibold"
            >
              <span>Official Website</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Mandate & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="p-8 rounded-2xl bg-surface-container-lowest border border-[#bfc7d2]/40 dark:border-white/10 shadow-sm">
            <h2 className="font-display font-bold text-xl text-[#001e2e] dark:text-white mb-4 flex items-center gap-2">
              <Shield size={20} className="text-[#006194] dark:text-sky-400" />
              <span>Institutional Mandate</span>
            </h2>
            <ul className="space-y-3.5 text-sm text-[#3f4850] dark:text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#006194] dark:text-sky-400 shrink-0 mt-1" />
                <span>To serve as the nodal agency for planning, promotion, coordination, and execution of the Indian Polar Programme.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#006194] dark:text-sky-400 shrink-0 mt-1" />
                <span>Maintain and operate year-round research stations — Maitri &amp; Bharati in Antarctica, Himadri &amp; IndARC in the Arctic, and Himansh in the Himalayas.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#006194] dark:text-sky-400 shrink-0 mt-1" />
                <span>Foster polar education, open-science repositories, and public dissemination through the Polar Knowledge Hub.</span>
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl bg-surface-container-lowest border border-[#bfc7d2]/40 dark:border-white/10 shadow-sm">
            <h2 className="font-display font-bold text-xl text-[#001e2e] dark:text-white mb-4 flex items-center gap-2">
              <Compass size={20} className="text-[#00685f] dark:text-teal-400" />
              <span>Scientific Thrust Areas</span>
            </h2>
            <ul className="space-y-3.5 text-sm text-[#3f4850] dark:text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#00685f] dark:text-teal-400 shrink-0 mt-1" />
                <span><strong>Paleoclimatology:</strong> Extracting multi-century atmospheric proxies through deep ice core analysis.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#00685f] dark:text-teal-400 shrink-0 mt-1" />
                <span><strong>Monsoon Teleconnections:</strong> Investigating linkages between Arctic sea-ice retreats and Indian summer monsoon variability.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#00685f] dark:text-teal-400 shrink-0 mt-1" />
                <span><strong>Southern Ocean Dynamics:</strong> Assessing the role of the Southern Ocean as a global carbon sink.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Scientific Divisions */}
        <div className="mb-12">
          <h2 className="font-display font-bold text-2xl text-[#001e2e] dark:text-white mb-6">
            Research Divisions &amp; Operations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DIVISIONS.map((div, i) => (
              <div key={i} className="p-6 rounded-2xl bg-surface-container-lowest border border-[#bfc7d2]/40 dark:border-white/10 shadow-sm">
                <h3 className="font-display font-bold text-base text-[#001e2e] dark:text-white mb-2">{div.title}</h3>
                <p className="text-[#3f4850] dark:text-slate-400 text-xs leading-relaxed">{div.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone Timeline */}
        <div className="p-8 sm:p-10 rounded-2xl bg-surface-container-lowest border border-[#bfc7d2]/40 dark:border-white/10 mb-12 shadow-sm">
          <h2 className="font-display font-bold text-2xl text-[#001e2e] dark:text-white mb-8">
            Four Decades of Indian Polar Leadership
          </h2>

          <div className="space-y-6 relative before:absolute before:inset-0 before:left-3 sm:before:left-4 before:w-0.5 before:bg-[#bfc7d2]/30 dark:before:bg-white/10">
            {TIMELINE.map((item, idx) => (
              <div key={idx} className="relative flex items-start gap-4 sm:gap-6 pl-2 sm:pl-3">
                <div className="w-3.5 h-3.5 rounded-full bg-[#006194] dark:bg-sky-400 border-2 border-white dark:border-[#0a1628] shrink-0 mt-1 z-10" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[#006194] dark:text-sky-400">{item.year}</span>
                    <span className="text-[#707881] text-xs">·</span>
                    <h3 className="text-[#001e2e] dark:text-white font-bold text-sm">{item.title}</h3>
                  </div>
                  <p className="text-[#3f4850] dark:text-slate-300 text-xs leading-relaxed max-w-2xl">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Links to Hub */}
        <div className="p-8 rounded-2xl bg-surface-container-lowest border border-[#bfc7d2]/40 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <h3 className="font-display font-bold text-lg text-[#001e2e] dark:text-white mb-1">Explore the Knowledge Platform</h3>
            <p className="text-[#3f4850] dark:text-slate-400 text-xs">Access all research datasets, publications, and stations curated in this hub.</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/stations"
              className="px-4 py-2 bg-[#007bb9] hover:bg-[#006194] text-white font-semibold text-xs rounded-xl transition-colors shadow-xs"
            >
              Research Stations
            </Link>
            <Link
              href="/repository"
              className="px-4 py-2 border border-[#bfc7d2]/50 dark:border-white/15 bg-white dark:bg-white/5 text-[#001e2e] dark:text-slate-200 hover:bg-[#ebf5ff] dark:hover:bg-white/10 font-semibold text-xs rounded-xl transition-colors"
            >
              Data Repository
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
