import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';
import { Lock, Mail, ArrowRight, ShieldCheck, KeyRound, Sparkles } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const { navigateTo } = useNavigation();
  const { showToast } = useSettings();

  const [email, setEmail] = useState('admin@murthimachineworks.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    navigateTo('admin-dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        showToast('Login Successful', 'Welcome to Murthi Machine Works Administration.', 'success');
        navigateTo('admin-dashboard');
      } else {
        setError(res.error || 'Invalid credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Login error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@murthimachineworks.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 industrial-dark-grid opacity-60" />

      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-heading font-black text-2xl mx-auto shadow-lg">
            M
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-white tracking-tight">
            Murthi Machine Works
          </h2>
          <p className="text-xs text-slate-400">
            Administrative Management & Production Portal
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@murthimachineworks.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-md flex items-center justify-center gap-2 transition"
          >
            <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Helper Box */}
        <div className="p-3.5 bg-slate-800/90 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-amber-400 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5" />
              Employee Login Presets
            </span>
            <span className="text-[10px] text-slate-400">All actions logged with IP</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@murthimachineworks.com');
                setPassword('admin123');
              }}
              className="text-left p-2 rounded-lg bg-slate-900/90 border border-slate-700/80 hover:border-amber-500/50 hover:bg-slate-800 transition"
            >
              <p className="text-[11px] font-bold text-white leading-tight">Master Admin</p>
              <p className="text-[10px] text-amber-400 font-mono truncate">admin@...</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('kamesh@murthimachineworks.com');
                setPassword('kamesh123');
              }}
              className="text-left p-2 rounded-lg bg-slate-900/90 border border-slate-700/80 hover:border-amber-500/50 hover:bg-slate-800 transition"
            >
              <p className="text-[11px] font-bold text-white leading-tight">Kamesh (Prod Head)</p>
              <p className="text-[10px] text-emerald-400 font-mono truncate">kamesh@...</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('editor@murthimachineworks.com');
                setPassword('editor123');
              }}
              className="text-left p-2 rounded-lg bg-slate-900/90 border border-slate-700/80 hover:border-amber-500/50 hover:bg-slate-800 transition"
            >
              <p className="text-[11px] font-bold text-white leading-tight">Catalog Specialist</p>
              <p className="text-[10px] text-sky-400 font-mono truncate">editor@...</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('sales@murthimachineworks.com');
                setPassword('sales123');
              }}
              className="text-left p-2 rounded-lg bg-slate-900/90 border border-slate-700/80 hover:border-amber-500/50 hover:bg-slate-800 transition"
            >
              <p className="text-[11px] font-bold text-white leading-tight">Sales Engineer</p>
              <p className="text-[10px] text-purple-400 font-mono truncate">sales@...</p>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center">
            Password format: <code className="text-amber-300">[name]123</code> or create custom logins in Team tab.
          </p>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => navigateTo('home')}
            className="text-xs text-slate-400 hover:text-white transition"
          >
            ← Return to Public Website
          </button>
        </div>
      </div>
    </div>
  );
};
