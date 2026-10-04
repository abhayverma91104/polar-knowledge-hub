'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search, Menu, X, ChevronDown,
  LogIn, LogOut, Shield, Sparkles, Moon, Sun, User
} from 'lucide-react';
import { useAuth } from '@/lib/auth-store';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore' },
  { href: '/repository', label: 'Repository' },
  { href: '/expeditions', label: 'Expeditions' },
  { href: '/stations', label: 'Stations' },
  { href: '/classroom', label: 'Polar Classroom' },
  { href: '/assistant', label: 'Polar AI', badge: 'AI', badgeColor: 'bg-primary-fixed text-on-primary-fixed' },
  { href: '/content-studio', label: 'Content Studio', badge: 'AI', badgeColor: 'bg-tertiary-fixed text-on-tertiary-fixed' },
  { href: '/media', label: 'Media' },
  { href: '/about', label: 'About NCPOR' },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
    const willBeDark = !isDark;
    setIsDark(willBeDark);
    if (willBeDark) {
      root.classList.add('dark');
      try { localStorage.setItem('theme', 'dark'); } catch {}
    } else {
      root.classList.remove('dark');
      try { localStorage.setItem('theme', 'light'); } catch {}
    }
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#06111F]/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.06)] border-b border-[#D7E7F0] dark:border-white/10 transition-colors">
      <div className="w-full flex flex-col">
        {/* National Tricolor Top Strip */}
        <div className="w-full h-1 bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808]" />

        {/* Official Research Gateway Ribbon */}
        <div className="w-full bg-[#ebf5ff]/70 dark:bg-[#0a1628] px-4 sm:px-8 py-1 hidden md:flex items-center justify-between font-mono text-[11px] text-[#3f4850] dark:text-slate-300 border-b border-[#D7E7F0]/60 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00685f] animate-pulse" />
            <span className="font-semibold tracking-wide">NATIONAL CENTRE FOR POLAR AND OCEAN RESEARCH (NCPOR)</span>
            <span className="opacity-40">|</span>
            <span>MINISTRY OF EARTH SCIENCES · GOVT. OF INDIA</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-medium">OFFICIAL RESEARCH GATEWAY</span>
            <span className="opacity-40">|</span>
            <span className="text-[#00685f] dark:text-teal-400 font-semibold tracking-wider">HIGH-LATITUDE TELEMETRY ACTIVE</span>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="h-16 md:h-18 w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#006194] to-[#0284c7] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-[15px] sm:text-[17px] font-bold tracking-tight text-[#001e2e] dark:text-white uppercase leading-tight">
                Polar Knowledge Hub
              </span>
              <span className="font-mono text-[10px] text-[#41617e] dark:text-sky-300/80 tracking-wider">
                NCPOR · MoES (Govt. of India)
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 px-1">
            {NAV_LINKS.map((link) => {
              const active = link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap ${
                    active
                      ? 'bg-[#007bb9] text-white shadow-sm font-semibold'
                      : 'text-[#3f4850] dark:text-slate-200 hover:text-[#006194] dark:hover:text-white hover:bg-[#ebf5ff] dark:hover:bg-white/10'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className={`px-1.5 py-0.2 rounded-full font-mono text-[9px] font-bold uppercase leading-tight ${
                      active ? 'bg-white/20 text-white' : 'bg-[#cce5ff] text-[#004b73] dark:bg-sky-900/60 dark:text-sky-200'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Search Input Box */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center bg-[#ebf5ff] dark:bg-white/10 px-3 py-1.5 rounded-full border border-[#bfc7d2]/50 dark:border-white/10 gap-2 text-[#3f4850] dark:text-slate-300 focus-within:ring-2 focus-within:ring-[#006194] transition-all">
              <Search className="w-4 h-4 text-[#707881] dark:text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search polar datasets, cores, bases..."
                className="bg-transparent text-[12px] text-[#001e2e] dark:text-white placeholder:text-[#707881] dark:placeholder:text-slate-400 focus:outline-none w-36 xl:w-56"
              />
              <kbd className="font-mono text-[10px] bg-[#d4ebff] dark:bg-white/15 px-1.5 py-0.5 rounded text-[#41617e] dark:text-slate-300">
                ⌘K
              </kbd>
            </form>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="w-9 h-9 rounded-full bg-[#ebf5ff] dark:bg-white/10 border border-[#bfc7d2]/40 dark:border-white/10 flex items-center justify-center text-[#41617e] dark:text-slate-200 hover:text-[#006194] dark:hover:text-white transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Scientist Portal / Auth Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-[#ebf5ff] dark:bg-white/10 pl-1.5 pr-3 py-1 rounded-full border border-[#bfc7d2]/50 dark:border-white/10 hover:border-[#006194] transition-all shadow-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-[#006194] text-white flex items-center justify-center text-xs font-bold">
                    {user.email[0].toUpperCase()}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="font-mono text-[11px] font-semibold text-[#001e2e] dark:text-white leading-tight">
                      {user.full_name || user.email.split('@')[0]}
                    </span>
                    <span className="font-mono text-[9px] text-[#00685f] dark:text-teal-400 leading-tight uppercase font-medium">
                      {user.role} · Verified
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#707881] opacity-70" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#0a1628] border border-[#bfc7d2]/50 dark:border-white/15 rounded-xl shadow-2xl z-50 py-1.5 overflow-hidden font-sans">
                      <div className="px-4 py-2.5 border-b border-[#ebf5ff] dark:border-white/10">
                        <div className="text-[#001e2e] dark:text-white font-semibold text-sm truncate">
                          {user.full_name || 'Scientist'}
                        </div>
                        <div className="text-[#707881] dark:text-slate-400 text-xs truncate">{user.email}</div>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-[#cce5ff] text-[#004b73] dark:bg-sky-900/60 dark:text-sky-200 text-[10px] font-mono rounded font-semibold uppercase">
                          {user.role} · INCOIS/NCPOR
                        </span>
                      </div>
                      {(user.role === 'admin' || user.role === 'editor') && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#001e2e] dark:text-white hover:bg-[#ebf5ff] dark:hover:bg-white/10 transition-colors font-medium"
                        >
                          <Shield className="w-4 h-4 text-[#006194] dark:text-sky-400 shrink-0" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors w-full text-left font-medium"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 bg-[#ebf5ff] dark:bg-white/10 pl-1.5 pr-3.5 py-1 rounded-full border border-[#bfc7d2]/50 dark:border-white/10 hover:border-[#006194] hover:bg-[#d4ebff] dark:hover:bg-white/15 transition-all shadow-sm"
              >
                <div className="w-7 h-7 rounded-full bg-[#006194] text-white flex items-center justify-center">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-mono text-[11px] font-semibold text-[#001e2e] dark:text-white leading-tight">
                    Scientist Portal
                  </span>
                  <span className="font-mono text-[9px] text-[#00685f] dark:text-teal-400 leading-tight">
                    Verified · INCOIS/NCPOR
                  </span>
                </div>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
              className="xl:hidden p-2 text-[#41617e] dark:text-white hover:bg-[#ebf5ff] dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileOpen && (
          <div className="xl:hidden border-t border-[#D7E7F0] dark:border-white/10 bg-white dark:bg-[#06111F] p-4 shadow-xl">
            <form onSubmit={handleSearchSubmit} className="flex items-center bg-[#ebf5ff] dark:bg-white/10 px-3 py-2 rounded-lg border border-[#bfc7d2]/50 dark:border-white/10 mb-3 gap-2">
              <Search className="w-4 h-4 text-[#707881]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search datasets, cores, bases..."
                className="bg-transparent text-sm text-[#001e2e] dark:text-white placeholder:text-[#707881] focus:outline-none w-full"
              />
            </form>
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const active = link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                      active
                        ? 'bg-[#007bb9] text-white font-semibold'
                        : 'text-[#3f4850] dark:text-slate-200 hover:bg-[#ebf5ff] dark:hover:bg-white/10'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold uppercase bg-white/20 text-white">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
