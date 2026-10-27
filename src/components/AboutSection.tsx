/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Terminal, Layers, ShieldCheck, Zap, Cpu, Compass } from 'lucide-react';

interface AboutSectionProps {
  collegeName?: string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  collegeName = 'NIAT SANSKIRITI',
}) => {
  return (
    <section id="about" className="py-32 border-t border-white/[0.08] bg-black relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-zinc-400 text-xs font-mono tracking-wider uppercase mb-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Club Charter</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-[-0.03em] leading-tight mb-5">
            Engineering Production AI Systems on Campus.
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
            Founded at {collegeName}, the Gen AI Club bridges theoretical computer science with real-world foundation model engineering. We turn cutting-edge arXiv research into reproducible code, open-source weights, and community tools.
          </p>
        </div>

        {/* 4 Pillars - Linear Minimalist Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-7 rounded-2xl linear-card linear-card-hover flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-300 mb-6 group-hover:border-cyan-400/50 group-hover:text-cyan-400 transition-all duration-300">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors duration-200">
                LLMs & Agent Architectures
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Fine-tuning open models (Llama, Gemma), designing tool-calling chains, and optimizing low-latency retrieval pipelines.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/[0.08] text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
              <span className="text-cyan-400">01</span>
              <span>· PyTorch & LangChain</span>
            </div>
          </div>

          <div className="p-7 rounded-2xl linear-card linear-card-hover flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-300 mb-6 group-hover:border-cyan-400/50 group-hover:text-cyan-400 transition-all duration-300">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors duration-200">
                Multimodal & Vision Systems
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Developing visual reasoning models, spatial scene understanding, real-time edge segmentation, and sensor fusion.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/[0.08] text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
              <span className="text-cyan-400">02</span>
              <span>· OpenCV & TensorRT</span>
            </div>
          </div>

          <div className="p-7 rounded-2xl linear-card linear-card-hover flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-300 mb-6 group-hover:border-cyan-400/50 group-hover:text-cyan-400 transition-all duration-300">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors duration-200">
                Generative Media & Diffusion
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Exploring latent diffusion models, neural audio synthesis, 3D Gaussian splatting, and efficient generative sampling.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/[0.08] text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
              <span className="text-cyan-400">03</span>
              <span>· Diffusers & WebGL</span>
            </div>
          </div>

          <div className="p-7 rounded-2xl linear-card linear-card-hover flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-300 mb-6 group-hover:border-cyan-400/50 group-hover:text-cyan-400 transition-all duration-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors duration-200">
                Safety, Alignment & Governance
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Investigating red-teaming, jailbreak defenses, mechanistic interpretability, and responsible AI guardrails.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/[0.08] text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
              <span className="text-cyan-400">04</span>
              <span>· Benchmarks & Safety</span>
            </div>
          </div>

        </div>

        {/* Member Benefits Grid */}
        <div className="mt-16 p-8 rounded-2xl linear-card linear-glow-top">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-cyan-400 shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">Dedicated GPU Infrastructure</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Allocated compute credits on lab workstations and cloud clusters for intensive model fine-tuning experiments.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-cyan-400 shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">Paper Publication Mentorship</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Faculty and alumni guidance from literature review through experimental validation, LaTeX writing, and conference submission.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-cyan-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">Peer Project Pods</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Collaborate in small, agile squads to build high-visibility portfolio projects that stand out in top AI engineering roles.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
