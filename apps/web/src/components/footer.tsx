import Link from 'next/link';
import { ExternalLink, Radio, MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-[#ebf5ff] dark:bg-[#0a1628] border-t border-[#bfc7d2]/40 dark:border-white/10 pt-12 pb-8 text-[#001e2e] dark:text-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Emergency SatCom Hotline */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#006194] flex items-center justify-center text-white shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-base font-bold uppercase tracking-tight text-[#001e2e] dark:text-white">
                  Polar Knowledge Hub
                </span>
                <span className="font-mono text-[11px] text-[#41617e] dark:text-sky-300">
                  National Centre for Polar and Ocean Research
                </span>
              </div>
            </div>

            <p className="text-[13px] text-[#3f4850] dark:text-slate-300 leading-relaxed pr-4">
              The sovereign multi-nodal digital repository and scientific portal for India&apos;s national polar endeavors spanning the Cryosphere, Polar Oceans, Antarctic & Arctic research stations.
            </p>

            <div className="flex items-center gap-2.5 font-mono text-[11px] text-[#00685f] dark:text-teal-300 bg-[#dff0ff] dark:bg-white/5 border border-[#bfc7d2]/40 dark:border-white/10 px-3.5 py-2 rounded-lg">
              <Radio className="w-4 h-4 text-[#00685f] dark:text-teal-400 animate-pulse shrink-0" />
              <span>Emergency Polar SatCom Hotline: IndARC / Bharati Base +870-772-234-890</span>
            </div>

            <div className="flex flex-col gap-1 text-[12px] text-[#707881] dark:text-slate-400 pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-[#006194]" />
                <span>Headland Sada, Vasco-da-Gama, Goa 403804, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 shrink-0 text-[#006194]" />
                <span>+91-832-2525505 / +91-832-2525600</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0 text-[#006194]" />
                <span>director@ncpor.res.in · polar-hub@ncpor.gov.in</span>
              </div>
            </div>
          </div>

          {/* Research Nodes */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[12px] font-semibold text-[#001e2e] dark:text-white uppercase tracking-wider">
              Research Nodes
            </span>
            <ul className="flex flex-col gap-2 text-[13px] text-[#3f4850] dark:text-slate-300">
              <li>
                <Link href="/stations?id=bharati" className="hover:text-[#006194] dark:hover:text-white transition-colors">
                  Bharati Station (Larsemann Hills)
                </Link>
              </li>
              <li>
                <Link href="/stations?id=maitri" className="hover:text-[#006194] dark:hover:text-white transition-colors">
                  Maitri Station (Schirmacher Oasis)
                </Link>
              </li>
              <li>
                <Link href="/stations?id=himadri" className="hover:text-[#006194] dark:hover:text-white transition-colors">
                  Himadri Station (Ny-Ålesund, Arctic)
                </Link>
              </li>
              <li>
                <Link href="/stations?id=indarc" className="hover:text-[#006194] dark:hover:text-white transition-colors">
                  IndARC Underwater Mooring (Kongsfjorden)
                </Link>
              </li>
              <li>
                <Link href="/stations?id=himansh" className="hover:text-[#006194] dark:hover:text-white transition-colors">
                  Himansh High-Altitude Post (Himalayas)
                </Link>
              </li>
            </ul>
          </div>

          {/* Scientific Data */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[12px] font-semibold text-[#001e2e] dark:text-white uppercase tracking-wider">
              Scientific Data
            </span>
            <ul className="flex flex-col gap-2 text-[13px] text-[#3f4850] dark:text-slate-300">
              <li>
                <Link href="/repository?type=dataset&q=ice+core" className="hover:text-[#006194] dark:hover:text-white transition-colors">
                  Ice Core Stratigraphy Index
                </Link>
              </li>
              <li>
                <Link href="/repository?type=dataset&q=oceanography" className="hover:text-[#006194] dark:hover:text-white transition-colors">
                  Southern Ocean Hydrography
                </Link>
              </li>
              <li>
                <Link href="/repository?type=dataset&q=aerosol" className="hover:text-[#006194] dark:hover:text-white transition-colors">
                  Atmospheric Aerosol Feeds
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-[#006194] dark:hover:text-white transition-colors">
                  Polar Geospatial & Bathymetry
                </Link>
              </li>
              <li>
                <Link href="/repository" className="hover:text-[#006194] dark:hover:text-white transition-colors">
                  Data Access Policy & DOIs
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[12px] font-semibold text-[#001e2e] dark:text-white uppercase tracking-wider">
              Institutional
            </span>
            <ul className="flex flex-col gap-2 text-[13px] text-[#3f4850] dark:text-slate-300">
              <li>
                <a href="https://moes.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-[#006194] dark:hover:text-white transition-colors flex items-center gap-1">
                  <span>Ministry of Earth Sciences</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <Link href="/expeditions" className="hover:text-[#006194] dark:hover:text-white transition-colors">
                  National Expeditions Committee
                </Link>
              </li>
              <li>
                <Link href="/repository?type=publication" className="hover:text-[#006194] dark:hover:text-white transition-colors">
                  Annual Polar Publications
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#006194] dark:hover:text-white transition-colors">
                  Right to Information (RTI)
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#006194] dark:hover:text-white transition-colors">
                  Admin & Ingestion Console
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom GIGW & Copyright Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#bfc7d2]/40 dark:border-white/10 bg-[#dff0ff]/50 dark:bg-white/5 rounded-xl px-6 py-4">
          <div className="flex flex-col gap-0.5 text-center sm:text-left">
            <span className="text-[12px] text-[#3f4850] dark:text-slate-300">
              © 2025–2026 National Centre for Polar and Ocean Research, Ministry of Earth Sciences, Government of India.
            </span>
            <span className="font-mono text-[10px] text-[#707881] dark:text-slate-400">
              Complies with Guidelines for Indian Government Websites (GIGW 3.0) & Open Scientific Data Commons · SIH Problem 26063
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-[#41617e] dark:text-slate-300">
            <Link href="/about" className="hover:text-[#006194] dark:hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>·</span>
            <Link href="/about" className="hover:text-[#006194] dark:hover:text-white transition-colors">
              Terms of Scientific Use
            </Link>
            <span>·</span>
            <Link href="/about" className="hover:text-[#006194] dark:hover:text-white transition-colors">
              Accessibility Statement
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
