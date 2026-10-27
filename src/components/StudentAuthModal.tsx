/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, Lock, Mail, AlertCircle, Clock, XCircle, ArrowRight, CheckCircle2, Database, Eye, EyeOff, Sparkles } from 'lucide-react';

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenJoin: () => void;
  onSuccess: () => void;
}

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  onClose,
  onOpenJoin,
  onSuccess,
}) => {
  const toast = useToast();
  const { isApprovedMember, joinRequest, refreshAuthStatus, user, logout, isSupabaseConnected } = useAuth();

  const [mode, setMode] = useState<'login' | 'forgot' | 'status-gate'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide your registered email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (signInError) {
        if (signInError.message.toLowerCase().includes('invalid login credentials')) {
          setError('Invalid email or password. Please verify your credentials or check if your account is confirmed.');
        } else if (signInError.message.toLowerCase().includes('email not confirmed')) {
          setError('Please confirm your email address through the link sent to your inbox before logging in.');
        } else {
          setError(signInError.message);
        }
        return;
      }

      await refreshAuthStatus();
      
      // Requirement 8: Auto-close on successful session
      if (data.session) {
        toast.success('Welcome back to the Gen AI Club!');
        onClose();
        onSuccess();
        return;
      }

      setMode('status-gate');
    } catch (err: any) {
      console.error('Student signin error:', err);
      setError(err.message || 'Failed to sign in. Please verify your Supabase connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Enter your registered student email address.');
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
        setError(resetErr.message || 'Unable to send password reset email.');
      } else {
        setResetSent(true);
        toast.success('Password reset email dispatched via Supabase!');
      }
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Unable to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToDashboard = () => {
    onClose();
    onSuccess();
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

        {/* Supabase status indicator if keys not in env yet */}
        {!isSupabaseConnected && (
          <div className="mb-4 p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Supabase project URL & key can be configured in <code>.env</code>.</span>
          </div>
        )}

        {/* MODE: STATUS GATE */}
        {mode === 'status-gate' && user ? (
          <div>
            {isApprovedMember ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_-3px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Welcome back</h3>
                <p className="text-xs text-zinc-400 mb-6">
                  Your club membership is verified in the Supabase directory.
                </p>
                <button
                  onClick={handleProceedToDashboard}
                  className="w-full py-2.5 px-4 text-xs font-medium text-white linear-btn-glow rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Enter Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : joinRequest?.status === 'rejected' ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Application Status</h3>
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 text-rose-300 text-xs text-left mb-6">
                  <p className="font-semibold mb-1">Notice from Club Leadership</p>
                  <p className="text-[11px] leading-relaxed text-rose-200/70">
                    We appreciate your interest in the Gen AI Club. Your application could not be accepted for the current cohort due to capacity constraints. You are encouraged to reapply next semester or join open workshops.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    await logout();
                    setMode('login');
                  }}
                  className="w-full py-2.5 px-4 text-xs font-medium text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_-3px_rgba(245,158,11,0.2)]">
                  <Clock className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">
                  Awaiting Executive Review
                </h3>
                <p className="text-xs text-zinc-400 mb-5 font-mono">
                  {user.email}
                </p>
                
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-zinc-300 text-xs text-left mb-6">
                  <div className="flex items-center gap-1.5 font-medium mb-1 text-amber-300">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Application Under Review</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-zinc-400">
                    Your membership request is currently in the executive queue. The President or Vice President will review your profile to grant portal access.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      await logout();
                      setMode('login');
                    }}
                    className="w-1/2 py-2.5 px-3 text-xs font-medium text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-xl transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                  <button
                    onClick={async () => {
                      await refreshAuthStatus();
                      toast.info('Status refreshed from Supabase.');
                    }}
                    className="w-1/2 py-2.5 px-3 text-xs font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl transition-colors cursor-pointer"
                  >
                    Check Status
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : mode === 'forgot' ? (
          /* MODE: FORGOT PASSWORD */
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
            <p className="text-xs text-zinc-400 mb-6">
              Enter your registered student email and Supabase Auth will send a secure reset link.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {resetSent ? (
              <div className="text-center py-4">
                <p className="text-xs text-emerald-400 font-semibold mb-4">
                  Check your inbox for password reset instructions!
                </p>
                <button
                  onClick={() => {
                    setMode('login');
                    setResetSent(false);
                  }}
                  className="text-xs font-medium text-cyan-400 hover:text-cyan-300 cursor-pointer"
                >
                  Return to login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Student Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="student@niat.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-white/[0.03] text-white placeholder-zinc-500 focus:border-cyan-400/80 focus:outline-hidden focus:ring-1 focus:ring-cyan-400/20 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs font-medium text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Back to login
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 text-xs font-medium text-white linear-btn-glow rounded-xl disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* MODE: LOGIN */
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Student Chapter Portal</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Student Login</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Access your member dashboard, internal research repos, and event calendar.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="student@niat.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-white/[0.03] text-white placeholder-zinc-500 focus:border-cyan-400/80 focus:outline-hidden focus:ring-1 focus:ring-cyan-400/20 transition-all"
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-white/10 bg-white/[0.03] text-white placeholder-zinc-500 focus:border-cyan-400/80 focus:outline-hidden focus:ring-1 focus:ring-cyan-400/20 transition-all"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-xs font-medium text-white linear-btn-glow rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
              >
                {loading ? 'Authenticating with Supabase...' : 'Sign In as Student'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
              <p className="text-xs text-zinc-400">
                Not a member yet?{' '}
                <button
                  onClick={() => {
                    onClose();
                    onOpenJoin();
                  }}
                  className="font-medium text-cyan-400 hover:text-cyan-300 cursor-pointer"
                >
                  Submit application
                </button>
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
