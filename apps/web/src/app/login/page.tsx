'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Snowflake, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
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
      const user = useAuth.getState().user;
      if (user?.role === 'admin' || user?.role === 'editor') {
        router.push('/admin');
      } else {
        router.push('/repository');
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e.response?.data?.detail || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 bg-surface text-on-surface transition-colors">
      <div className="w-full max-w-md">
        {/* Logo */}
          <img
            src="/polarsetu-logo.png"
            alt="PolarSetu Logo"
            className="w-16 h-16 rounded-2xl mx-auto mb-4 shadow-lg object-contain"
          />
          <h1 className="font-display font-bold text-2xl text-on-surface mb-1">Scientist Sign In</h1>
          <p className="text-on-surface-variant text-sm">PolarSetu · NCPOR (Govt. of India)</p>

        <div className="bg-white dark:bg-[#0a1628] border border-[#bfc7d2]/40 dark:border-white/10 rounded-2xl p-8 shadow-xl backdrop-blur-sm transition-colors">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm mb-5">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-mono">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="scientist@ncpor.res.in"
                className="w-full p-3 rounded-xl border border-[#bfc7d2]/50 dark:border-white/10 bg-[#ebf5ff] dark:bg-[#0c1c30] text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-[#006194] text-sm"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-mono">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 pr-10 rounded-xl border border-[#bfc7d2]/50 dark:border-white/10 bg-[#ebf5ff] dark:bg-[#0c1c30] text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-[#006194] text-sm"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#006194] hover:bg-[#007bb9] text-white font-semibold rounded-xl text-base justify-center mt-2 transition-colors shadow-md flex items-center cursor-pointer"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-on-surface-variant text-xs mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#006194] dark:text-sky-400 font-semibold hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
