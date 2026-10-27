/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';
import { X, Sparkles, CheckCircle, AlertCircle, ArrowRight, ShieldCheck, Lock, Mail, User, Database, Eye, EyeOff } from 'lucide-react';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStudentLogin: () => void;
}

export const JoinModal: React.FC<JoinModalProps> = ({
  isOpen,
  onClose,
  onOpenStudentLogin,
}) => {
  const toast = useToast();
  const { refreshAuthStatus, isSupabaseConnected } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form fields (Phone & Roll number simplified away per requirements)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [year, setYear] = useState('2nd Year');
  const [skills, setSkills] = useState('');
  const [statement, setStatement] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validateStep1 = () => {
    const errs: { [key: string]: string } = {};

    if (!fullName.trim()) errs.fullName = 'Full name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    } else if (!/\d/.test(password)) {
      errs.password = 'Password must include at least one number';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: { [key: string]: string } = {};

    if (!skills.trim()) {
      errs.skills = 'Please list your skills, tools, or AI topics of interest';
    }

    if (!statement.trim()) {
      errs.statement = 'Please write a brief statement on why you want to join';
    } else if (statement.trim().length < 20) {
      errs.statement = 'Please provide a more detailed motivation (at least 20 characters)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const cleanEmail = email.trim().toLowerCase();

      // 1. Create the Supabase Auth account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            branch,
            year,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes('already registered')) {
          setErrors({
            email: 'An account with this email already exists. Please log in to check your application status.',
          });
          setStep(1);
          setIsSubmitting(false);
          return;
        } else {
          setErrors({ general: signUpError.message });
          setIsSubmitting(false);
          return;
        }
      }

      const assignedUid = authData.user?.id || crypto.randomUUID();

      // 2. Store application in Supabase "join_requests"
      const requestPayload = {
        id: assignedUid,
        email: cleanEmail,
        full_name: fullName.trim(),
        roll_number: `APP-${assignedUid.slice(0, 6).toUpperCase()}`,
        statement_of_interest: statement.trim(),
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      try {
        await supabase.from('join_requests').upsert(requestPayload);
      } catch (tableErr) {
        console.warn('join_requests table insert note:', tableErr);
      }

      // 3. Store initial profile in 'profiles'
      try {
        await supabase.from('profiles').upsert({
          id: assignedUid,
          email: cleanEmail,
          full_name: fullName.trim(),
          branch,
          role: 'student',
          created_at: new Date().toISOString(),
        });
      } catch (profErr) {
        console.warn('profiles table insert note:', profErr);
      }

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      await refreshAuthStatus();
      setStep(3);
      toast.success('Application submitted successfully via Supabase!');
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrors({ general: err.message || 'Failed to submit application. Please check your network connection.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setStep(1);
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setSkills('');
    setStatement('');
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200 overflow-y-auto py-6 sm:py-10">
      <div className="bg-zinc-950/95 text-zinc-100 rounded-2xl max-w-xl w-full p-6 sm:p-9 shadow-[0_0_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.08)] relative max-h-[90vh] overflow-y-auto border border-white/10 backdrop-blur-2xl linear-glow-top">
        
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        {step !== 3 && (
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/10 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Membership Onboarding</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Join the Gen AI Club
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Step {step} of 2 · Applications are recorded securely in the Supabase directory.
            </p>
          </div>
        )}

        {!isSupabaseConnected && (
          <div className="mb-4 p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Supabase credentials can be supplied in <code>.env</code>.</span>
          </div>
        )}

        {errors.general && (
          <div className="mb-5 p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.general}</span>
          </div>
        )}

        {/* STEP 1: Personal & Academic Credentials */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border bg-white/[0.03] text-white placeholder-zinc-500 transition-all focus:outline-hidden ${
                    errors.fullName ? 'border-rose-500/80' : 'border-white/10 focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/20'
                  }`}
                />
              </div>
              {errors.fullName && <p className="text-[11px] text-rose-400 mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Institutional Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                <input
                  type="email"
                  placeholder="student@niat.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border bg-white/[0.03] text-white placeholder-zinc-500 transition-all focus:outline-hidden ${
                    errors.email ? 'border-rose-500/80' : 'border-white/10 focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/20'
                  }`}
                />
              </div>
              {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Branch / Dept *
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-white/10 bg-zinc-900 text-white focus:border-cyan-400/80 focus:outline-hidden transition-all"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="AI & Data Science">AI & Data Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Other Engineering / Science">Other Engineering / Science</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Academic Year *
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-white/10 bg-zinc-900 text-white focus:border-cyan-400/80 focus:outline-hidden transition-all"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgraduate / M.Tech">Postgraduate / M.Tech</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 chars + 1 number"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border bg-white/[0.03] text-white placeholder-zinc-500 transition-all focus:outline-hidden ${
                      errors.password ? 'border-rose-500/80' : 'border-white/10 focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/20'
                    }`}
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
                {errors.password && <p className="text-[11px] text-rose-400 mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border bg-white/[0.03] text-white placeholder-zinc-500 transition-all focus:outline-hidden ${
                      errors.confirmPassword ? 'border-rose-500/80' : 'border-white/10 focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-[11px] text-rose-400 mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenStudentLogin();
                }}
                className="text-xs font-medium text-zinc-400 hover:text-cyan-300 cursor-pointer"
              >
                Already have an account? Log in
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 text-xs font-medium text-white linear-btn-glow rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: AI Track & Motivation */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Technical Skills & Areas of Interest *
              </label>
              <input
                type="text"
                placeholder="e.g. Python, PyTorch, LangChain, React, Computer Vision, Transformers"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white/[0.03] text-white placeholder-zinc-500 transition-all focus:outline-hidden ${
                  errors.skills ? 'border-rose-500/80' : 'border-white/10 focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/20'
                }`}
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Mention models, frameworks, or AI research areas you wish to explore.
              </p>
              {errors.skills && <p className="text-[11px] text-rose-400 mt-1">{errors.skills}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Why do you want to join the Gen AI Club? *
              </label>
              <textarea
                rows={4}
                placeholder="Describe a project idea, why generative AI interests you, and what you hope to build..."
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white/[0.03] text-white placeholder-zinc-500 transition-all focus:outline-hidden ${
                  errors.statement ? 'border-rose-500/80' : 'border-white/10 focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/20'
                }`}
              />
              {errors.statement && <p className="text-[11px] text-rose-400 mt-1">{errors.statement}</p>}
            </div>

            {/* Security note */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-start gap-2.5 text-zinc-300 text-[11px] leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Your Supabase Auth account is provisioned securely and recorded in <strong>join_requests</strong> as <strong>Pending Approval</strong>.
              </span>
            </div>

            <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-medium text-zinc-400 hover:text-white cursor-pointer"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-xs font-medium text-white linear-btn-glow rounded-xl disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Submission Confirmation */}
        {step === 3 && (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_-5px_rgba(16,185,129,0.3)]">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
              Application Submitted
            </h3>

            <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed mb-6 font-normal">
              Thank you, <strong className="text-white">{fullName}</strong>. Your membership request has been submitted to the Gen AI Club executive council.
            </p>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-zinc-300 text-xs text-left max-w-md mx-auto mb-6">
              <div className="font-medium flex items-center gap-1.5 mb-1 text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Status: Awaiting Executive Approval</span>
              </div>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Your application is in the executive review queue. You can log into your account at any time to monitor approval status.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleResetAndClose}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-xl transition-colors cursor-pointer"
              >
                Return to Home
              </button>
              <button
                onClick={() => {
                  handleResetAndClose();
                  onOpenStudentLogin();
                }}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-medium text-white linear-btn-glow rounded-xl transition-all cursor-pointer"
              >
                Go to Student Login
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
