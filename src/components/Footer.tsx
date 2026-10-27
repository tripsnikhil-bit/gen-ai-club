/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Github, Linkedin, Instagram, Mail, Info } from 'lucide-react';
import { ClubSettings } from '../types';

interface FooterProps {
  settings?: ClubSettings | null;
  onOpenSetupGuide: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenSetupGuide,
}) => {
  const clubName = settings?.clubName || 'GEN AI CLUB';
  const collegeName = settings?.collegeName || 'NIAT SANSKIRITI';
  const contactEmail = settings?.contactEmail || 'genai.club@niatsanskriti.edu';

  return (
    <footer className="border-t border-white/[0.08] bg-black pt-20 pb-16 text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">
                {clubName} · {collegeName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md leading-relaxed font-normal">
              Advancing generative artificial intelligence, agentic architectures, and student-led machine learning research at {collegeName}.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={settings?.githubUrl || 'https://github.com'}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/10 hover:border-cyan-400/50 hover:text-white flex items-center justify-center transition-all duration-200"
                aria-label="GitHub"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
              <a
                href={settings?.linkedinUrl || 'https://linkedin.com'}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/10 hover:border-cyan-400/50 hover:text-white flex items-center justify-center transition-all duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a
                href={settings?.instagramUrl || 'https://instagram.com'}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/10 hover:border-cyan-400/50 hover:text-white flex items-center justify-center transition-all duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href={`mailto:${contactEmail}`}
                className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/10 hover:border-cyan-400/50 hover:text-white flex items-center justify-center transition-all duration-200"
                aria-label="Email"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-mono font-medium text-white uppercase tracking-wider mb-4">
              Navigation
            </h4>
            <ul className="space-y-3 text-xs">
              <li>
                <a href="#about" className="hover:text-white transition-colors duration-200">
                  About Charter
                </a>
              </li>
              <li>
                <a href="#projects" className="hover:text-white transition-colors duration-200">
                  Active Projects
                </a>
              </li>
              <li>
                <a href="#leaderboard" className="hover:text-white transition-colors duration-200">
                  Builder Leaderboard
                </a>
              </li>
              <li>
                <a href="#news" className="hover:text-white transition-colors duration-200">
                  Research Updates
                </a>
              </li>
              <li>
                <a href="#events" className="hover:text-white transition-colors duration-200">
                  Workshops & Events
                </a>
              </li>
            </ul>
          </div>

          {/* Campus & Setup */}
          <div>
            <h4 className="text-xs font-mono font-medium text-white uppercase tracking-wider mb-4">
              Infrastructure
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="text-zinc-400">
                Department of Computer Science
              </li>
              <li className="text-zinc-400">
                Room 402, Technology Block
              </li>
              <li>
                <button
                  onClick={onOpenSetupGuide}
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-300 hover:text-white bg-white/[0.04] border border-white/10 hover:border-white/20 px-2.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer mt-1"
                >
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Setup Guide & Status</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div>
            © {new Date().getFullYear()} {clubName} · {collegeName}. All rights reserved.
          </div>
          <div>
            Engineered with Supabase Auth & PostgreSQL RLS
          </div>
        </div>
      </div>
    </footer>
  );
};
