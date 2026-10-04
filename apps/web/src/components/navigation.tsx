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
  { href: '/content-studio', label: 'Content Studio', badge: 'AI' },
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#06111F]/95 backdrop-blur-md shadow-sm border-b border-[#D7E7F0] dark:border-white/10 transition-colors">
      <div className="w-full flex flex-col">
        {/* National Tricolor Top Strip */}
        <div className="w-full h-1 bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808]" />

        {/* Official Research Gateway Ribbon */}
        <div className="w-full bg-[#ebf5ff]/70 dark:bg-[#0a1628] px-3 sm:px-6 lg:px-8 py-0.5 hidden md:flex items-center justify-between font-mono text-[10px] sm:text-[10.5px] text-[#3f4850] dark:text-slate-300 border-b border-[#D7E7F0]/60 dark:border-white/5">
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
        <div className="h-14 sm:h-16 w-full px-2.5 sm:px-5 lg:px-6 2xl:px-8 flex items-center justify-between gap-1.5 lg:gap-2.5 max-w-[1600px] mx-auto">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#006194] to-[#0284c7] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <span className="font-display font-black text-sm sm:text-base">$</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-[12.5px] sm:text-[14px] 2xl:text-[15px] font-bold tracking-tight text-[#001e2e] dark:text-white uppercase leading-none">
                Polar Knowledge Hub
              </span>
              <span className="font-mono text-[8px] sm:text-[8.5px] 2xl:text-[9px] text-[#41617e] dark:text-sky-300/80 tracking-wider mt-0.5 leading-none">
                NCPOR · MoES (Govt. of India)
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links - Compact, elegant, uncluttered */}
          <nav className="hidden xl:flex items-center gap-0.5 xl:gap-1 2xl:gap-1.5 px-0.5">
            {NAV_LINKS.map((link) => {
              const active = link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-1.5 py-1 xl:px-2 xl:py-1 2xl:px-2.5 2xl:py-1.5 rounded-md text-[11.5px] xl:text-[12px] 2xl:text-[12.5px] font-medium tracking-tight 2xl:tracking-normal transition-all duration-150 flex items-center gap-1 whitespace-nowrap ${
                    active
                      ? 'bg-[#007bb9] text-white shadow-xs font-semibold'
                      : 'text-[#3f4850] dark:text-slate-200 hover:text-[#006194] dark:hover:text-white hover:bg-[#ebf5ff] dark:hover:bg-white/10'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className={`px-1 py-0.2 rounded-full font-mono text-[7.5px] 2xl:text-[8px] font-bold uppercase leading-none ${
                      active ? 'bg-white/25 text-white' : 'bg-[#cce5ff] text-[#004b73] dark:bg-sky-500/20 dark:text-sky-300'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Compact Capsule Search Input Box */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center bg-[#ebf5ff] dark:bg-[#0c1c30] px-2.5 py-1 rounded-full border border-[#bfc7d2]/40 dark:border-slate-700/60 gap-1.5 text-[#3f4850] dark:text-slate-300 focus-within:ring-2 focus-within:ring-[#006194] transition-all">
              <Search className="w-3.5 h-3.5 text-[#707881] dark:text-slate-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search polar datasets, cores, bases..."
                className="bg-transparent text-[11px] 2xl:text-[11.5px] text-[#001e2e] dark:text-white placeholder:text-[#707881] dark:placeholder:text-slate-400 focus:outline-none w-28 xl:w-36 2xl:w-56 focus:w-48 xl:focus:w-56 2xl:focus:w-72 transition-all"
              />
              <kbd className="font-mono text-[8.5px] 2xl:text-[9px] bg-[#d4ebff] dark:bg-white/15 px-1 py-0.2 rounded text-[#41617e] dark:text-slate-300">
                ⌘K
              </kbd>
            </form>

            {/* Functional Theme Toggle Button (Light / Dark) */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="w-8 h-8 rounded-full bg-[#ebf5ff] dark:bg-[#0c1c30] border border-[#bfc7d2]/40 dark:border-slate-700/60 flex items-center justify-center text-[#41617e] dark:text-slate-200 hover:text-[#006194] dark:hover:text-white hover:bg-[#d4ebff] dark:hover:bg-white/15 transition-all cursor-pointer shadow-xs shrink-0"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-300 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-[#41617e] transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Scientist Portal / User Profile Capsule matching exact design spec */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 sm:gap-2 bg-[#ebf5ff] dark:bg-[#0c1c30] pl-1 pr-2 sm:pr-2.5 py-1 rounded-full border border-[#bfc7d2]/50 dark:border-slate-700/60 hover:border-[#006194] transition-all shadow-xs cursor-pointer shrink-0"
              >
                <div className="w-6.5 h-6.5 rounded-full bg-[#007bb9] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                  {user ? user.email[0].toUpperCase() : 'A'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-mono text-[10px] 2xl:text-[10.5px] font-semibold text-[#001e2e] dark:text-white leading-tight max-w-[95px] xl:max-w-[120px] truncate">
                    {user ? (user.full_name || user.email.split('@')[0]) : 'NCPOR Administrator'}
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
                        {user ? (user.full_name || 'Scientist') : 'NCPOR Administrator'}
                      </div>
                      <div className="text-[#707881] dark:text-slate-400 text-xs truncate">
                        {user ? user.email : 'admin@ncpor.res.in'}
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-[#cce5ff] text-[#004b73] dark:bg-sky-950 dark:text-sky-200 text-[9px] font-mono rounded font-semibold uppercase">
                        {user ? user.role : 'ADMIN'} · INCOIS/NCPOR VERIFIED
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
                        <span>Sign out</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
              className="xl:hidden p-1.5 text-[#41617e] dark:text-white hover:bg-[#ebf5ff] dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
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
                      <span className="px-1.5 py-0.2 rounded-full font-mono text-[9px] font-bold uppercase bg-white/20 text-white">
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
