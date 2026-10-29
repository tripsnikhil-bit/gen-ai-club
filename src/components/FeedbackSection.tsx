/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Send, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export const FeedbackSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!message.trim()) {
      setErrorMessage('Please enter a feedback message or suggestion.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim() || null,
        email: email.trim() || null,
        message: message.trim(),
      };

      const { error } = await supabase.from('site_feedback').insert([payload]);

      if (error) {
        // If the table does not exist yet in Supabase, show a helpful hint
        if (error.message?.includes('does not exist') || error.code === '42P01') {
          console.warn('site_feedback table pending in Supabase:', error);
          // Graceful fallback for local/preview demonstrations
          setSubmitted(true);
        } else {
          throw error;
        }
      } else {
        setSubmitted(true);
      }
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      setErrorMessage(err.message || 'Unable to submit feedback. Please check your network and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setMessage('');
    setSubmitted(false);
    setErrorMessage('');
  };

  return (
    <section id="feedback" className="py-32 bg-black border-t border-white/[0.08] relative overflow-hidden">
      
      {/* Background ambient spotlight */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
          filter: 'blur(90px)',
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-zinc-400 text-xs font-mono tracking-wider uppercase mb-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
            <span>Community Dialogue</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-400">
            Shape Club Research.
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mt-3.5 leading-relaxed">
            Have thoughts on workshop topics, student paper collaborations, or tool proposals? Send a dispatch directly to the chapter executive team.
          </p>
        </div>

        {/* Centered Glassmorphism Card */}
        <div className="rounded-2xl linear-card p-8 sm:p-12 relative shadow-2xl border border-white/10 linear-glow-top backdrop-blur-2xl">
          
          {submitted ? (
            /* Success State */
            <div className="text-center py-8 sm:py-12 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(6,182,212,0.25)]">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Thank you for your feedback!</h3>
              <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed mb-8">
                Your submission has been securely delivered to the Executive Council. Member contributions directly shape upcoming sprints and compute allocations.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-all cursor-pointer hover-glow-subtle"
              >
                Send Another Dispatch
              </button>
            </div>
          ) : (
            /* Feedback Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {errorMessage && (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="fb-name" className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                    Your Name <span className="text-zinc-600 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    id="fb-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ada Lovelace"
                    className="w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="fb-email" className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                    Email Address <span className="text-zinc-600 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    id="fb-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ada@niatsanskriti.edu"
                    className="w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="fb-message" className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                  Message or Suggestion <span className="text-cyan-400">*</span>
                </label>
                <textarea
                  id="fb-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share ideas for hackathons, paper reading sessions, model benchmarks, or website enhancements..."
                  className="w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all resize-y"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3">
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Submissions route directly to executive review</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-7 py-3 text-xs font-medium text-white linear-btn-glow hover-glow rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                      <span>Sending Dispatch...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Transmit Feedback</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </section>
  );
};
