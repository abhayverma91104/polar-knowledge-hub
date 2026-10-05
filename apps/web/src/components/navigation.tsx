'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search, Menu, X, ChevronDown,
  LogIn, LogOut, Shield, Moon, Sun, User, Sparkles
} from 'lucide-react';
import { useAuth } from '@/lib/auth-store';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore' },
  { href: '/repository', label: 'Repository' },
  { href: '/expeditions', label: 'Expeditions' },
  { href: '/stations', label: 'Stations' },
  { href: '/classroom', label: 'Polar Classroom' },
  { href: '/assistant', label: 'Polar AI', badge: 'AI' },
  { href: '/content-studio', label: 'Outreach Studio', badge: 'AI' },
  { href: '/media', label: 'Media' },
  { href: '/about', label: 'About NCPOR' },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync theme state on mount & react to class changes on documentElement
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();

    const observer = new MutationObserver(() => {
      checkTheme();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const isCurrentlyDark = root.classList.contains('dark');
    const nextIsDark = !isCurrentlyDark;

    if (nextIsDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      try { localStorage.setItem('theme', 'dark'); } catch {}
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      try { localStorage.setItem('theme', 'light'); } catch {}
    }
    setIsDark(nextIsDark);
    window.dispatchEvent(new Event('themechange'));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/repository?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/repository');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[9999] bg-white dark:bg-[#071322] shadow-md border-b border-[#002a48]/20 dark:border-white/10 transition-colors">
      <div className="w-full flex flex-col">
        {/* National Tricolor Top Strip */}
        <div className="w-full h-1 bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808]" />

        {/* ─── TIER 1: BRAND & NATIONAL INSTITUTION HEADER (ISRO Style) ─── */}
        <div className="w-full bg-[#f8fbfe] dark:bg-[#06111f] border-b border-[#bfc7d2]/30 dark:border-white/5 py-1.5 px-3 sm:px-6 lg:px-8">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
            
            {/* Left: Site Logo & PolarSetu Name */}
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
              <img
                src="/polarsetu-logo.png"
                alt="PolarSetu Official Logo"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-lg sm:text-xl font-black tracking-tight text-[#001e2e] dark:text-white uppercase leading-none">
                    PolarSetu
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#006194]/10 dark:bg-sky-400/20 text-[#006194] dark:text-sky-300">
                    ध्रुवसेतु
                  </span>
                </div>
                <span className="font-mono text-[9px] sm:text-[10px] text-[#41617e] dark:text-sky-300/80 tracking-wider mt-0.5 leading-none">
                  NCPOR · MoES (Govt. of India)
                </span>
              </div>
            </Link>

            {/* Center: Bilingual Ministry & NCPOR Institutional Identity (Matches ISRO Header Layout) */}
            <div className="hidden lg:flex flex-col items-center justify-center text-center px-4 flex-1">
              <span className="text-[12px] xl:text-[13px] font-semibold text-[#001e2e] dark:text-slate-100 tracking-wide leading-tight">
                राष्ट्रीय ध्रुवीय एवं महासागर अनुसंधान केंद्र, पृथ्वी विज्ञान मंत्रालय
              </span>
              <span className="text-[13px] xl:text-[14px] font-bold text-[#00385d] dark:text-sky-300 tracking-tight leading-tight mt-0.5">
                National Centre for Polar and Ocean Research, Ministry of Earth Sciences
              </span>
              <span className="text-[10px] xl:text-[10.5px] font-medium text-[#41617e] dark:text-slate-400 tracking-wider leading-none mt-0.5">
                भारत सरकार / Government of India
              </span>
            </div>

            {/* Right: National Emblem + Theme Toggle + User Capsule + Mobile Hamburger */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* National Emblem Badge (Lion Capital Satyameva Jayate) */}
              <div className="hidden md:flex items-center gap-2 pl-2 pr-3 py-1 bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 dark:border-amber-400/20 rounded-lg">
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] font-serif font-black text-amber-900 dark:text-amber-300 leading-tight">
                    सत्यमेव जयते
                  </span>
                  <span className="text-[7.5px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 leading-none">
                    GOVT OF INDIA
                  </span>
                </div>
              </div>

              {/* Functional Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                className="w-8 h-8 rounded-full bg-white dark:bg-[#0c1c30] border border-[#bfc7d2]/50 dark:border-slate-700/60 flex items-center justify-center text-[#41617e] dark:text-slate-200 hover:text-[#006194] dark:hover:text-white hover:bg-[#d4ebff] dark:hover:bg-white/15 transition-all cursor-pointer shadow-xs shrink-0"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-300 transition-transform hover:rotate-45" />
                ) : (
                  <Moon className="w-4 h-4 text-[#41617e] transition-transform hover:-rotate-12" />
                )}
              </button>

              {/* Scientist Portal / User Profile Capsule */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 bg-white dark:bg-[#0c1c30] pl-1 pr-2 sm:pr-2.5 py-1 rounded-full border border-[#bfc7d2]/50 dark:border-slate-700/60 hover:border-[#006194] transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <div className="w-6.5 h-6.5 rounded-full bg-[#007bb9] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                    {user ? user.email[0].toUpperCase() : 'A'}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="font-mono text-[10px] 2xl:text-[10.5px] font-semibold text-[#001e2e] dark:text-white leading-tight max-w-[95px] xl:max-w-[120px] truncate">
                      {user ? (user.full_name || user.email.split('@')[0]) : 'NCPOR Scientist'}
                    </span>
                    <span className="font-mono text-[8px] 2xl:text-[8.5px] text-[#00685f] dark:text-teal-400 leading-tight uppercase font-bold tracking-wider">
                      {user ? user.role : 'ADMIN'} · VERIFIED
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-[#707881] dark:text-slate-400 opacity-70 shrink-0" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#0a1628] border border-[#bfc7d2]/50 dark:border-white/15 rounded-xl shadow-2xl z-50 py-1.5 overflow-hidden font-sans">
                      <div className="px-4 py-2.5 border-b border-[#ebf5ff] dark:border-white/10">
                        <div className="text-[#001e2e] dark:text-white font-semibold text-sm truncate">
                          {user ? (user.full_name || 'Scientist') : 'NCPOR Scientist'}
                        </div>
                        <div className="text-[#707881] dark:text-slate-400 text-xs truncate">
                          {user ? user.email : 'scientist@ncpor.res.in'}
                        </div>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-[#cce5ff] text-[#004b73] dark:bg-sky-950 dark:text-sky-200 text-[9px] font-mono rounded font-semibold uppercase">
                          {user ? user.role : 'RESEARCHER'} · VERIFIED
                        </span>
                      </div>
                      {user && (user.role === 'admin' || user.role === 'editor') ? (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#001e2e] dark:text-white hover:bg-[#ebf5ff] dark:hover:bg-white/10 transition-colors font-medium"
                        >
                          <Shield className="w-4 h-4 text-[#006194] dark:text-sky-400 shrink-0" />
                          <span>Admin Dashboard</span>
                        </Link>
                      ) : !user ? (
                        <>
                          <Link
                            href="/login"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#001e2e] dark:text-white hover:bg-[#ebf5ff] dark:hover:bg-white/10 transition-colors font-medium"
                          >
                            <LogIn className="w-4 h-4 text-[#006194] dark:text-sky-400 shrink-0" />
                            <span>Scientist Sign In</span>
                          </Link>
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#001e2e] dark:text-white hover:bg-[#ebf5ff] dark:hover:bg-white/10 transition-colors font-medium"
                          >
                            <Shield className="w-4 h-4 text-[#006194] dark:text-sky-400 shrink-0" />
                            <span>Admin Portal</span>
                          </Link>
                        </>
                      ) : null}
                      {user && (
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors w-full text-left font-medium cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          <span>Sign Out</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg bg-white dark:bg-[#0c1c30] border border-[#bfc7d2]/50 dark:border-white/10 text-[#001e2e] dark:text-white"
                aria-label="Toggle navigation menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

            </div>
          </div>
        </div>

        {/* ─── TIER 2: PRIMARY NAVIGATION RIBBON (Placed Below Site & NCPOR Name) ─── */}
        <div className="w-full bg-[#00385d] dark:bg-[#05172b] text-white shadow-sm border-t border-[#002a48] dark:border-white/10">
          <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 h-11 flex items-center justify-between gap-4">
            
            {/* Desktop Navigation Links - Fits cleanly without crowding */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 h-full overflow-x-auto scrollbar-none py-1">
              {NAV_LINKS.map((link) => {
                const active = link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-2.5 xl:px-3 py-1 rounded-md text-[12.5px] xl:text-[13px] font-medium tracking-tight whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
                      active
                        ? 'bg-[#007bb9] text-white font-semibold shadow-xs'
                        : 'text-white/85 hover:text-white hover:bg-white/15'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className={`px-1 py-0.2 rounded-full font-mono text-[8px] font-bold uppercase leading-none ${
                        active ? 'bg-white/30 text-white' : 'bg-cyan-400/25 text-cyan-200'
                      }`}>
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Ribbon Right: Compact Search Capsule */}
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center bg-white/15 hover:bg-white/20 focus-within:bg-white dark:focus-within:bg-[#0c1c30] px-2.5 py-1 rounded-full border border-white/20 focus-within:border-sky-400 focus-within:text-[#001e2e] dark:focus-within:text-white text-white gap-2 transition-all shrink-0">
              <Search className="w-3.5 h-3.5 text-white/80 focus-within:text-[#006194] shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search polar datasets, cores, bases..."
                className="bg-transparent text-[11.5px] text-white placeholder:text-white/70 focus:text-[#001e2e] dark:focus:text-white focus:outline-none w-40 lg:w-48 xl:w-64 transition-all"
              />
              <kbd className="font-mono text-[9px] bg-black/25 px-1 py-0.2 rounded text-white/80">
                ⌘K
              </kbd>
            </form>

            {/* Mobile View: Quick indicator */}
            <div className="flex lg:hidden items-center justify-between w-full font-mono text-xs text-white/90">
              <span>National Polar Research Portal</span>
              <span className="text-cyan-300 font-bold">10 Active Hubs</span>
            </div>

          </div>
        </div>

        {/* ─── MOBILE DRAWER (For Tablets and Phones) ─── */}
        {mobileOpen && (
          <div className="lg:hidden w-full bg-white dark:bg-[#06111F] border-b border-[#bfc7d2]/40 dark:border-white/10 px-4 py-4 flex flex-col gap-3 max-h-[80vh] overflow-y-auto shadow-xl">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="flex items-center bg-[#ebf5ff] dark:bg-[#0c1c30] px-3 py-2 rounded-xl border border-[#bfc7d2]/40 dark:border-white/10 gap-2">
              <Search className="w-4 h-4 text-[#707881]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search polar datasets..."
                className="bg-transparent text-xs text-[#001e2e] dark:text-white placeholder:text-[#707881] focus:outline-none w-full"
              />
            </form>

            {/* Mobile Links */}
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const active = link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
                      active
                        ? 'bg-[#007bb9] text-white font-semibold'
                        : 'text-[#001e2e] dark:text-slate-200 hover:bg-[#ebf5ff] dark:hover:bg-white/10'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-100 text-[#006194] dark:bg-sky-500/20 dark:text-sky-300">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
