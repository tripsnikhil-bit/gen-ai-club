/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Database, Copy, Check, ExternalLink, ShieldCheck, Key } from 'lucide-react';
import { SUPABASE_SETUP_SQL } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

interface SetupInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupInstructionsModal: React.FC<SetupInstructionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopied(true);
    toast.success('Supabase SQL Schema copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200 overflow-y-auto py-6 sm:py-10">
      <div className="bg-zinc-950 text-zinc-100 rounded-2xl max-w-2xl w-full p-6 sm:p-9 shadow-[0_0_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.08)] relative max-h-[88vh] overflow-y-auto border border-white/10 linear-glow-top">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 text-cyan-400 flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Supabase Backend Setup & Schema
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              PostgreSQL · Supabase Auth · Row Level Security (RLS)
            </p>
          </div>
        </div>

        <div className="space-y-6 mt-6 text-xs text-zinc-300">
          
          {/* Step 1: Environment Variables */}
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2.5">
            <div className="flex items-center gap-2 font-medium text-white">
              <Key className="w-4 h-4 text-cyan-400" />
              <span>Step 1: Configure Supabase Keys in .env</span>
            </div>
            <p className="leading-relaxed text-zinc-400">
              In your Supabase project dashboard (under <strong>Project Settings → API</strong>), copy your <strong>Project URL</strong> and <strong>anon public API key</strong>, then set them in your environment:
            </p>
            <div className="bg-black text-cyan-300 p-3.5 rounded-lg font-mono text-[11px] select-all space-y-1 border border-white/10">
              <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
              <div>VITE_SUPABASE_ANON_KEY=your-anon-public-key</div>
            </div>
          </div>

          {/* Step 2: SQL Tables */}
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-medium text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Step 2: Run SQL Schema in Supabase SQL Editor</span>
              </div>
              <button
                onClick={handleCopySql}
                className="px-3 py-1.5 linear-btn-glow text-white rounded-lg flex items-center gap-1.5 text-[11px] font-mono cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied SQL!' : 'Copy SQL'}</span>
              </button>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Creates the <strong>profiles</strong>, <strong>join_requests</strong>, <strong>projects</strong>, <strong>news</strong>, and <strong>events</strong> tables with Row Level Security (RLS) policies:
            </p>
            <div className="max-h-44 overflow-y-auto bg-black text-emerald-400 p-3.5 rounded-lg font-mono text-[10px] leading-relaxed border border-white/10">
              <pre>{SUPABASE_SETUP_SQL}</pre>
            </div>
          </div>

          {/* Step 3: President Account */}
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="font-medium text-white">
              Step 3: Founding President Access
            </div>
            <p className="leading-relaxed text-zinc-400">
              The founding President email is <strong>tripsnikhil@gmail.com</strong>. When logging in or signing up with this email address, President council privileges are automatically assigned.
            </p>
          </div>

        </div>

        <div className="mt-8 pt-5 border-t border-white/[0.08] flex items-center justify-between">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Open Supabase Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-medium text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
