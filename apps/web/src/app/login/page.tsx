'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Snowflake, Loader2, Eye, EyeOff, AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      router.push('/admin');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e.response?.data?.detail || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-[#060e1c] flex items-center justify-center px-4 pt-20 pb-12">
      <div className="w-full max-w-md">
        
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </Link>

        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(14,165,233,0.5)]">
            <Snowflake size={28} className="text-white animate-spin-slow" />
          </div>
          <h1 className="font-display font-extrabold text-3xl text-white mb-1.5">
            Polar Knowledge Hub
          </h1>
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
            Institutional Sign In · NCPOR / MoES
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0a1628] border border-cyan-500/30 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs mb-5">
              <AlertCircle size={15} className="shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ncpor.res.in"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all pr-11"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.6)] transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In to Portal'}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center mb-3">
              One-Click Demo Credentials
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: 'Admin', email: 'admin@ncpor.res.in', pw: 'PolarHub@2026' },
                { role: 'Scientist', email: 'scientist@ncpor.res.in', pw: 'PolarHub@2026' },
              ].map(({ role, email: e, pw }) => (
                <button
                  key={role}
                  onClick={() => { setEmail(e); setPassword(pw); }}
                  className="p-3 rounded-xl bg-white/[0.03] hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/40 text-left transition-all group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300">
                    {role} Role
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{e}</div>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
