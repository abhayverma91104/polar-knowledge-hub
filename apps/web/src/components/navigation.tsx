'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search, Menu, X, Globe, User, ChevronDown,
  Snowflake, LogIn, LogOut, Shield
} from 'lucide-react';
import { useAuth } from '@/lib/auth-store';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore' },
  { href: '/repository', label: 'Repository' },
  { href: '/expeditions', label: 'Expeditions' },
  { href: '/stations', label: 'Stations' },
  { href: '/classroom', label: 'Polar Classroom' },
  { href: '/assistant', label: 'Polar AI' },
  { href: '/media', label: 'Media' },
  { href: '/about', label: 'About NCPOR' },
];

export function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isHeroPage = pathname === '/';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHeroPage
          ? 'bg-polar-navy/98 backdrop-blur-md shadow-lg border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 bg-gradient-to-br from-polar-cyan to-polar-teal rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-glow-cyan transition-shadow">
              <Snowflake className="w-4.5 h-4.5 text-white" size={18} />
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-display font-bold text-sm leading-none">
                Polar Knowledge Hub
              </span>
              <div className="text-polar-cyan-400 text-[10px] font-medium tracking-widest uppercase leading-none mt-0.5">
                NCPOR · MoES
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-0.5 flex-1">
            {NAV_LINKS.map((link) => {
              const active = link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'text-polar-cyan-400 bg-white/5'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                  {link.label === 'Polar AI' && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-polar-cyan/20 text-polar-cyan-300 text-[10px] font-bold rounded uppercase tracking-wider">
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto xl:ml-0">
            {/* Search */}
            <Link
              href="/repository"
              className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              title="Search Repository"
            >
              <Search size={18} />
            </Link>

            {/* Language */}
            <button className="hidden sm:flex items-center gap-1 p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all text-sm">
              <Globe size={16} />
              <span className="text-xs">EN</span>
            </button>

            {/* Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/8 hover:bg-white/12 text-white rounded-lg transition-all text-sm font-medium border border-white/10"
                >
                  <div className="w-6 h-6 bg-polar-cyan rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {user.email[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:block max-w-24 truncate">
                    {user.full_name || user.email.split('@')[0]}
                  </span>
                  <ChevronDown size={14} className="opacity-60" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-polar-navy border border-white/10 rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-white/8">
                        <div className="text-white font-medium text-sm truncate">
                          {user.full_name || 'User'}
                        </div>
                        <div className="text-white/50 text-xs truncate">{user.email}</div>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-polar-cyan/20 text-polar-cyan-300 text-[10px] rounded font-medium uppercase tracking-wider">
                          {user.role}
                        </span>
                      </div>
                      {(user.role === 'admin' || user.role === 'editor') && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-white/80 hover:text-white hover:bg-white/5 transition-colors text-sm"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Shield size={15} />
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-white/80 hover:text-white hover:bg-white/5 transition-colors text-sm w-full text-left"
                      >
                        <LogOut size={15} />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-polar-cyan hover:bg-sky-500 text-white rounded-lg transition-all text-sm font-semibold shadow-lg"
              >
                <LogIn size={15} />
                <span className="hidden sm:block">Sign in</span>
              </Link>
            )}

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="xl:hidden p-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="xl:hidden bg-polar-navy border-t border-white/8 px-4 py-3">
          <nav className="flex flex-col gap-0.5">
            {NAV_LINKS.map((link) => {
              const active = link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'text-polar-cyan-400 bg-white/8'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
