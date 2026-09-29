'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search, Menu, X, ChevronDown, Snowflake, LogIn,
  LogOut, Shield, Sparkles, Map, Database, Compass,
  GraduationCap, PenTool, Image, Info, ExternalLink
} from 'lucide-react';
import { useAuth } from '@/lib/auth-store';

const MAIN_NAV = [
  { href: '/explore', label: 'Explore & Map', icon: Map },
  { href: '/repository', label: 'Repository', icon: Database },
  { href: '/expeditions', label: 'Expeditions', icon: Compass },
  { href: '/classroom', label: 'Classroom', icon: GraduationCap },
  { href: '/assistant', label: 'Polar AI', icon: Sparkles, highlight: true },
  { href: '/content-studio', label: 'Studio', icon: PenTool },
];

const MORE_LINKS = [
  { href: '/explore?view=stations', label: 'Research Stations', icon: Map, desc: 'Bharati, Maitri, Himadri & Himansh' },
  { href: '/repository?type=dataset', label: 'Open Datasets', icon: Database, desc: 'Ice core, meteorology & ocean data' },
  { href: '/admin/ingestion', label: 'Ingestion Engine', icon: Shield, desc: 'Web crawler & document processing' },
  { href: '/admin', label: 'Admin Portal', icon: Shield, desc: 'Repository moderation & telemetry' },
];

export function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#060e1c]/90 backdrop-blur-xl border-b border-cyan-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.4)] group-hover:shadow-[0_0_28px_rgba(14,165,233,0.7)] transition-all duration-300">
              <Snowflake className="w-5 h-5 text-white animate-spin-slow" />
              <div className="absolute inset-0 rounded-xl ring-1 ring-white/30" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-display font-bold text-base tracking-tight group-hover:text-cyan-300 transition-colors">
                  Polar Knowledge Hub
                </span>
                <span className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded">
                  MoES
                </span>
              </div>
              <div className="text-cyan-400/80 text-[10px] font-medium tracking-widest uppercase">
                NCPOR · Govt. of India
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {MAIN_NAV.map((link) => {
              const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                    active
                      ? 'text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 shadow-[0_0_15px_rgba(14,165,233,0.2)]'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon size={14} className={link.highlight ? 'text-cyan-400' : 'opacity-70'} />
                  <span>{link.label}</span>
                  {link.highlight && (
                    <span className="relative flex h-2 w-2 ml-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                  )}
                </Link>
              );
            })}

            {/* "More" Dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  moreOpen ? 'text-white bg-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>More</span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-[#0a1628] border border-cyan-500/30 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 p-2 backdrop-blur-2xl">
                    {MORE_LINKS.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMoreOpen(false)}
                          className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                        >
                          <div className="w-7 h-7 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5 text-cyan-400 group-hover:bg-cyan-500/20">
                            <ItemIcon size={14} />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                              {item.label}
                            </div>
                            <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                              {item.desc}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Quick Search Button */}
            <Link
              href="/repository"
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-lg text-xs font-medium transition-all group shadow-inner"
              title="Search repository"
            >
              <Search size={14} className="text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.2 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-400 font-mono">
                /
              </kbd>
            </Link>

            {/* Auth Button or User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 rounded-lg text-xs font-semibold text-cyan-200 transition-all"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-[10px] font-bold text-slate-950">
                    {user.email[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:block max-w-28 truncate">
                    {user.full_name || user.email.split('@')[0]}
                  </span>
                  <ChevronDown size={12} className="opacity-70" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#0a1628] border border-cyan-500/30 rounded-xl shadow-2xl z-50 p-2 overflow-hidden backdrop-blur-2xl">
                      <div className="px-3 py-2 border-b border-white/10 mb-1">
                        <div className="text-xs font-bold text-white truncate">
                          {user.full_name || 'Polar Researcher'}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                        <span className="inline-block mt-1.5 px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] rounded font-semibold uppercase tracking-wider">
                          {user.role}
                        </span>
                      </div>
                      
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Shield size={14} className="text-cyan-400" />
                        Admin Dashboard
                      </Link>
                      
                      <Link
                        href="/content-studio"
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <PenTool size={14} className="text-teal-400" />
                        Content Studio
                      </Link>

                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 rounded-lg transition-colors text-left mt-1 border-t border-white/5"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg text-xs font-bold shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_20px_rgba(14,165,233,0.5)] transition-all"
              >
                <LogIn size={13} />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-cyan-500/20 bg-[#060e1c]/98 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-widest text-cyan-400/80 px-3 py-1">
            Navigation
          </div>
          {MAIN_NAV.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  active ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className={active ? 'text-cyan-400' : 'text-slate-400'} />
                  <span>{link.label}</span>
                </div>
                {link.highlight && (
                  <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] font-bold rounded">
                    AI
                  </span>
                )}
              </Link>
            );
          })}

          <div className="border-t border-white/10 my-2 pt-2">
            <div className="text-[11px] font-bold uppercase tracking-widest text-cyan-400/80 px-3 py-1">
              Resources & Admin
            </div>
            {MORE_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <item.icon size={15} className="text-slate-400" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
