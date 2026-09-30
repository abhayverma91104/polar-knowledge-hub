import Link from 'next/link';
import { Snowflake, ExternalLink, Mail, Phone, MapPin } from 'lucide-react';

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

const FOOTER_LINKS: Record<string, FooterLink[]> = {
  Platform: [
    { label: 'Repository', href: '/repository' },
    { label: 'Expeditions', href: '/expeditions' },
    { label: 'Research Stations', href: '/stations' },
    { label: 'Polar Classroom', href: '/classroom' },
    { label: 'AI Assistant', href: '/assistant' },
    { label: 'Media Gallery', href: '/media' },
  ],
  Research: [
    { label: 'Publications', href: '/repository?type=publication' },
    { label: 'Datasets', href: '/repository?type=dataset' },
    { label: 'Expedition Reports', href: '/repository?type=expedition_report' },
    { label: 'Polar Map', href: '/explore' },
    { label: 'Content Studio', href: '/content-studio' },
  ],
  About: [
    { label: 'About NCPOR', href: '/about' },
    { label: 'NCPOR Website', href: 'https://www.ncpor.res.in', external: true },
    { label: 'MoES', href: 'https://moes.gov.in', external: true },
    { label: 'Admin', href: '/admin' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/10" style={{ background: '#0a1628' }}>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md" style={{ background: '#0ea5e9' }}>
                <Snowflake size={18} className="text-white" />
              </div>
              <div>
                <div className="text-white font-display font-bold text-sm">
                  Polar Knowledge Hub
                </div>
                <div className="text-polar-cyan-400 text-[10px] font-semibold tracking-widest uppercase">
                  NCPOR · MoES
                </div>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              India&apos;s integrated polar science knowledge, education, and outreach platform. Powered by decades of NCPOR research.
            </p>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-white/40 text-xs">
                <MapPin size={12} className="mt-0.5 shrink-0" />
                <span>Headland Sada, Vasco-da-Gama, Goa 403804, India</span>
              </div>
              <div className="flex items-center gap-2 text-white/40 text-xs">
                <Phone size={12} />
                <span>+91-832-2525505</span>
              </div>
              <div className="flex items-center gap-2 text-white/40 text-xs">
                <Mail size={12} />
                <span>director@ncpor.res.in</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold text-sm mb-4 tracking-wide">{category}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="text-white/50 hover:text-white text-sm transition-colors flex items-center gap-1.5 group"
                    >
                      {link.label}
                      {link.external && (
                        <ExternalLink
                          size={11}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-white/40 text-xs">
                © 2026 National Centre for Polar and Ocean Research, Ministry of Earth Sciences, Government of India.
              </p>
              <p className="text-white/30 text-xs mt-1">
                Built for Smart India Hackathon 2026 — Problem Statement 26063
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-3 py-1.5 bg-warning/10 border border-warning/20 rounded-lg text-[11px] text-warning/80 max-w-80">
                ⚠️ AI-generated content should be reviewed against source material before official publication.
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
