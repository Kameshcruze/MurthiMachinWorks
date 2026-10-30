import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';
import { Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const { navigateTo } = useNavigation();
  const { showToast } = useSettings();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    navigateTo('admin-dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        showToast('Login Successful', 'Welcome to Murthi Machine Works Administration.', 'success');
        navigateTo('admin-dashboard');
      } else {
        setError(res.error || 'Invalid email address or password.');
      }
    } catch (err: any) {
      setError(err.message || 'Login error occurred.');
    } finally {
      setIsLoading(false);
    }
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
                placeholder="Enter your email address"
                autoComplete="email"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-400 rounded focus:outline-none transition"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 text-xs font-bold rounded-lg shadow-md flex items-center justify-center gap-2 transition"
          >
            <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

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
