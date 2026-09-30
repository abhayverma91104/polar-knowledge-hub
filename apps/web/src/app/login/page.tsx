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
      router.push('/admin');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e.response?.data?.detail || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-polar-navy flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: '#0ea5e9' }}>
            <Snowflake size={28} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-white mb-1">Sign in</h1>
          <p className="text-white/50 text-sm">Polar Knowledge Hub · NCPOR</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-5">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ncpor.res.in"
                className="input input-dark w-full"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input input-dark w-full pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3.5 text-base justify-center mt-2"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Sign in'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="text-xs text-white/40 text-center mb-3 font-medium uppercase tracking-wider">
              Demo Credentials
            </div>
            <div className="space-y-2">
              {[
                { role: 'Admin', email: 'admin@ncpor.res.in', pw: 'PolarHub@2026' },
                { role: 'Editor', email: 'editor@ncpor.res.in', pw: 'PolarHub@2026' },
              ].map(({ role, email: e, pw }) => (
                <button
                  key={role}
                  onClick={() => { setEmail(e); setPassword(pw); }}
                  className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl transition-all text-left"
                >
                  <div>
                    <div className="text-white text-xs font-semibold">{role}</div>
                    <div className="text-white/40 text-xs">{e}</div>
                  </div>
                  <span className="text-polar-cyan text-xs font-medium">Use →</span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-white/30 text-xs mt-5">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-polar-cyan hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
