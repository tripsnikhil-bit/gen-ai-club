/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth, DEFAULT_PRESIDENT_EMAIL } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, Shield, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, Database, KeyRound, UserCheck, Eye, EyeOff } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();
  const { refreshAuthStatus, isSupabaseConnected } = useAuth();

  const [mode, setMode] = useState<'signin' | 'activate' | 'forgot'>('signin');
  const [email, setEmail] = useState(DEFAULT_PRESIDENT_EMAIL);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your executive email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessInfo(null);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const isDefaultPresident = cleanEmail === DEFAULT_PRESIDENT_EMAIL.toLowerCase();

      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (signInErr) {
        if (signInErr.message.toLowerCase().includes('invalid login credentials')) {
          setError(
            'Invalid credentials. If you haven\'t created a password for this admin account in Supabase yet, click "Activate / Set Password" above.'
          );
        } else {
          setError(signInErr.message);
        }
        setLoading(false);
        return;
      }

      const user = data.user;
      if (!user) {
        setError('Unable to retrieve user session.');
        setLoading(false);
        return;
      }

      // Check 'profiles' table for admin role ('president' | 'vice_president' | 'executive')
      let hasAdminPrivileges = isDefaultPresident;

      if (!hasAdminPrivileges) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

          if (profile && (profile.role === 'president' || profile.role === 'vice_president' || profile.role === 'executive')) {
            hasAdminPrivileges = true;
          }
        } catch (dbErr) {
          console.warn('Admin check warning:', dbErr);
        }
      } else {
        try {
          await supabase.from('profiles').upsert({
            id: user.id,
            email: DEFAULT_PRESIDENT_EMAIL,
            full_name: 'Nikhil Tripathi (President)',
            role: 'president',
            status: 'approved',
            updated_at: new Date().toISOString(),
          });
        } catch (bootstrapErr) {
          console.warn('President profile upsert note:', bootstrapErr);
        }
      }

      if (!hasAdminPrivileges) {
        await supabase.auth.signOut();
        setError('Access Denied: This account does not possess Executive President or Vice-President credentials.');
        setLoading(false);
        return;
      }

      await refreshAuthStatus();
      toast.success('Executive authentication verified via Supabase.');
      onClose();
      onSuccess();
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide an email and choose a secure password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessInfo(null);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const isDefaultPresident = cleanEmail === DEFAULT_PRESIDENT_EMAIL.toLowerCase();

      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: isDefaultPresident ? 'Nikhil Tripathi (President)' : 'Executive Member',
            role: isDefaultPresident ? 'president' : 'member',
          },
        },
      });

      if (signUpErr) {
        if (signUpErr.message.toLowerCase().includes('already registered')) {
          setError('This account is already registered in Supabase. Please switch to the "Sign In" tab and use your password, or use "Forgot password?" below.');
        } else {
          setError(signUpErr.message);
        }
        setLoading(false);
        return;
      }

      const user = data.user;
      if (user) {
        try {
          await supabase.from('profiles').upsert({
            id: user.id,
            email: cleanEmail,
            full_name: isDefaultPresident ? 'Nikhil Tripathi (President)' : 'Executive Member',
            role: isDefaultPresident ? 'president' : 'member',
            status: 'approved',
            updated_at: new Date().toISOString(),
          });
        } catch (dbErr) {
          console.warn('Profile bootstrap warning:', dbErr);
        }
      }

      if (data.session) {
        await refreshAuthStatus();
        toast.success('President account activated successfully with Supabase!');
        onClose();
        onSuccess();
      } else {
        setSuccessInfo(
          `Account registered for ${cleanEmail}! If email confirmation is enabled in your Supabase project, check your inbox to confirm. Otherwise, switch to the "Sign In" tab now.`
        );
        setMode('signin');
      }
    } catch (err: any) {
      console.error('Account activation error:', err);
      setError(err.message || 'Failed to activate admin account.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Enter your admin email.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: window.location.origin,
        }
      );
      if (resetErr) {
        setError(resetErr.message || 'Failed to dispatch reset email.');
      } else {
        toast.success('Password reset email dispatched to admin inbox.');
        setMode('signin');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200 overflow-y-auto py-6 sm:py-10">
      <div className="bg-zinc-950/95 text-zinc-100 rounded-2xl max-w-md w-full p-6 sm:p-9 shadow-[0_0_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.08)] relative border border-white/10 backdrop-blur-2xl linear-glow-top max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Supabase status indicator */}
        {!isSupabaseConnected && (
          <div className="mb-4 p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Supabase credentials can be supplied in <code>.env</code>.</span>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 text-cyan-400 flex items-center justify-center mb-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
            <Shield className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
            Executive Council Gateway
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            {mode === 'activate' ? 'Set Admin Password' : mode === 'forgot' ? 'Reset Password' : 'Admin Login'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Restricted to Club President & Vice Presidents for membership approvals, project management, and announcements.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-white/[0.03] p-1 rounded-xl mb-5 text-xs font-medium border border-white/10">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            className={`flex-1 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
              mode === 'signin' ? 'bg-white/10 text-white shadow-xs border border-white/10' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('activate'); setError(null); }}
            className={`flex-1 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
              mode === 'activate' ? 'bg-white/10 text-white shadow-xs border border-white/10' : 'text-zinc-400 hover:text-white'
            }`}
          >
            First Time? Set Password
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successInfo && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <UserCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successInfo}</span>
          </div>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-white/[0.03] text-white focus:border-cyan-400/80 focus:outline-hidden"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-xs font-medium text-zinc-400 hover:text-white cursor-pointer"
              >
                Back to Sign In
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-xs font-medium text-white linear-btn-glow rounded-xl disabled:opacity-50 cursor-pointer"
              >
                Send Reset Link
              </button>
            </div>
          </form>
        )}

        {mode === 'signin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Executive Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="president@niat.edu or tripsnikhil@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-white/[0.03] text-white placeholder-zinc-500 focus:border-cyan-400/80 focus:outline-hidden focus:ring-1 focus:ring-cyan-400/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-400">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError(null);
                  }}
                  className="text-[11px] text-zinc-400 hover:text-cyan-300 cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your Supabase password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-white/10 bg-white/[0.03] text-white placeholder-zinc-500 focus:border-cyan-400/80 focus:outline-hidden focus:ring-1 focus:ring-cyan-400/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-start gap-2 text-[11px] text-zinc-300 leading-relaxed font-mono">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Founding President Email: <strong className="text-white">tripsnikhil@gmail.com</strong>.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-medium text-white linear-btn-glow rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-3"
            >
              {loading ? 'Authenticating with Supabase...' : 'Enter Admin Console'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {mode === 'activate' && (
          <form onSubmit={handleActivateAccount} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                President Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-white/[0.03] text-white focus:border-cyan-400/80 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Choose Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-white/10 bg-white/[0.03] text-white focus:border-cyan-400/80 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-white/[0.03] text-white focus:border-cyan-400/80 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-start gap-2 text-[11px] text-zinc-300 leading-relaxed font-mono">
              <KeyRound className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Creates your password in your Supabase Auth directory with permanent President council privileges.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-medium text-white linear-btn-glow rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-3"
            >
              {loading ? 'Registering with Supabase...' : 'Activate & Set Password'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
