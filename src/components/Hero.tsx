/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, Code, Brain, Cpu, Users, Terminal, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onOpenJoin: () => void;
  onExploreProjects: () => void;
  collegeName?: string;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenJoin,
  onExploreProjects,
  collegeName = 'NIAT SANSKRITI',
}) => {
  return (
    <section className="relative overflow-hidden pt-28 pb-32 md:pt-36 md:pb-44 bg-black">
      
      {/* 1. Subtle Coordinate Grid Background with radial fade */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 spotlight-mask pointer-events-none" />

      {/* 2. Massive, subtle radial gradient glow behind the main headline (Requirement 3) */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] md:w-[1000px] md:h-[550px] pointer-events-none -z-0"
        style={{
          background: 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(6, 182, 212, 0.14) 0%, rgba(99, 102, 241, 0.08) 45%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />

      {/* Additional top subtle beam */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Institution Header Kicker - Linear/Vercel Pill with subtle shimmer */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 hover:border-white/20 text-zinc-300 text-xs font-medium tracking-wide mb-8 backdrop-blur-xl transition-all duration-300 cursor-default group shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#06b6d4]" />
            <span className="text-zinc-400 font-mono text-[11px] tracking-wider uppercase">Official Student Chapter</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-200">{collegeName}</span>
            <ChevronRight className="w-3 h-3 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
          </motion.div>

          {/* Primary Hero Headline - Tight tracking, metallic white gradient with electric cyan accent */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.035em] leading-[1.06] mb-8" 
            style={{ textWrap: 'balance' }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-zinc-400">
              Advancing the Frontier of
            </span>{' '}
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              Generative
            </span>{' '}
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 drop-shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              Intelligence.
            </span>
          </motion.h1>

          {/* Hero Subtitle - Clean typography, generous line-height */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg lg:text-xl text-zinc-400 leading-relaxed font-normal mb-12 max-w-2xl mx-auto"
          >
            A collaborative student research lab dedicated to building open foundation models,
            autonomous agents, multimodal architectures, and production-grade AI systems.
          </motion.p>

          {/* Action CTAs - Sleek minimalist 1px glowing border button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <button
              onClick={onOpenJoin}
              className="w-full sm:w-auto px-7 py-3.5 text-sm font-medium text-white linear-btn-glow hover-glow rounded-xl flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
              <span>Apply for Membership</span>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            </button>

            <button
              onClick={onExploreProjects}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-medium text-zinc-400 hover:text-white bg-transparent hover:bg-white/[0.04] border border-white/10 hover:border-white/20 hover-glow-subtle rounded-xl transition-all duration-300 ease-out flex items-center justify-center gap-2 cursor-pointer"
            >
              <Code className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
              <span>Explore Active Projects</span>
            </button>
          </motion.div>

          {/* Key Impact Stats Row - Tabular numerals, Linear style cards */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10 border-t border-white/[0.08]"
          >
            <div className="p-5 rounded-2xl linear-card linear-card-hover text-left group">
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <Users className="w-4 h-4 text-zinc-400 group-hover:text-cyan-400 transition-colors duration-300" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Talent Pool</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white font-mono tabular-nums tracking-tight">0</div>
              <div className="text-xs text-zinc-500 mt-1">Student researchers</div>
            </div>

            <div className="p-5 rounded-2xl linear-card linear-card-hover text-left group">
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <Brain className="w-4 h-4 text-zinc-400 group-hover:text-cyan-400 transition-colors duration-300" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">AI Projects</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white font-mono tabular-nums tracking-tight">0</div>
              <div className="text-xs text-zinc-500 mt-1">Open-source systems</div>
            </div>

            <div className="p-5 rounded-2xl linear-card linear-card-hover text-left group">
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <Cpu className="w-4 h-4 text-zinc-400 group-hover:text-cyan-400 transition-colors duration-300" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Compute Cluster</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">GPU Lab</div>
              <div className="text-xs text-zinc-500 mt-1">High-compute nodes</div>
            </div>

            <div className="p-5 rounded-2xl linear-card linear-card-hover text-left group">
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <Terminal className="w-4 h-4 text-zinc-400 group-hover:text-cyan-400 transition-colors duration-300" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Gatherings</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">Bi-Weekly</div>
              <div className="text-xs text-zinc-500 mt-1">Hands-on hackjams</div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
