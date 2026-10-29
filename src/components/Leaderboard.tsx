/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Medal, Award, Github, Code } from 'lucide-react';

interface StudentLeader {
  id: string;
  fullName: string;
  email: string;
  branch: string;
  projectCount: number;
  githubUrl?: string;
  topTech?: string;
  rank: number;
}

export const Leaderboard: React.FC = () => {
  const [leaders, setLeaders] = useState<StudentLeader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchLeaderboard() {
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, branch, github_url, skills, role, created_at')
          .eq('role', 'student');

        if (!mounted) return;

        if (!error && profiles && profiles.length > 0) {
          const projectCounts: Record<string, number> = {};
          try {
            const { data: projects } = await supabase.from('projects').select('team_members, title');
            if (projects && mounted) {
              profiles.forEach((p) => {
                const count = projects.filter(
                  (proj) =>
                    proj.team_members &&
                    ((p.full_name && proj.team_members.toLowerCase().includes(p.full_name.toLowerCase())) ||
                      (p.email && proj.team_members.toLowerCase().includes(p.email.toLowerCase())))
                ).length;
                projectCounts[p.id] = count;
              });
            }
          } catch (pErr) {
            console.warn('Projects count query notice:', pErr);
          }

          if (!mounted) return;

          const mapped: StudentLeader[] = profiles.map((p) => {
            const calculatedCount = projectCounts[p.id] ?? 0;

            return {
              id: p.id,
              fullName: p.full_name || 'Student Builder',
              email: p.email || '',
              branch: p.branch || 'Computer Science',
              projectCount: calculatedCount,
              githubUrl: p.github_url || '',
              topTech: p.skills || 'AI · Generative Models',
              rank: 0,
            };
          });

          // Sort by project count descending, then by name ascending
          mapped.sort((a, b) => {
            if (b.projectCount !== a.projectCount) {
              return b.projectCount - a.projectCount;
            }
            return a.fullName.localeCompare(b.fullName);
          });

          mapped.forEach((item, index) => {
            item.rank = index + 1;
          });

          setLeaders(mapped);
        } else {
          setLeaders([]);
        }
      } catch (err) {
        console.warn('Leaderboard fetch notice:', err);
        if (mounted) setLeaders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchLeaderboard();

    // Real-time Supabase subscription to stream profile updates and additions live
    const channel = supabase
      .channel('public:profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          if (mounted) fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const topThree = leaders.slice(0, 3);
  const remaining = leaders.slice(3);

  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  return (
    <section id="leaderboard" className="py-32 bg-black relative border-t border-white/[0.08] overflow-hidden">
      
      {/* Subtle Coordinate Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      {/* Subtle background ambient spotlight */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-zinc-300 text-xs font-mono tracking-wider uppercase mb-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
            <span>Builder Leaderboard</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-400">
            Research & Build Rankings.
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base mt-4 max-w-xl mx-auto leading-relaxed">
            Recognizing club researchers driving state-of-the-art models, publishing papers, and deploying campus tools.
          </p>
        </div>

        {/* Podium: Top 3 Students / Loading Skeletons / Dynamic Fallback */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl linear-card animate-pulse" />
            ))}
          </div>
        ) : leaders.length === 0 ? (
          /* Dynamic Data Fallback: database is empty */
          <div className="text-center py-20 px-6 rounded-2xl linear-card border border-white/10 max-w-xl mx-auto shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] mb-16">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-cyan-400 mx-auto mb-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white tracking-tight">Check back soon for updates</h3>
            <p className="text-xs text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
              Student research rankings will populate here in real-time as club members register and collaborate on projects.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-end mb-16">
            
            {/* Rank 2: Silver Podium */}
            {second ? (
              <div className="order-2 md:order-1 relative rounded-2xl linear-card linear-card-hover p-6 flex flex-col justify-between border-t-2 border-t-zinc-400/70 group">
                <div className="flex items-center justify-between mb-5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] text-zinc-300 text-[11px] font-mono border border-white/10">
                    <Medal className="w-3.5 h-3.5 text-zinc-400" />
                    RANK #2
                  </span>
                  <span className="text-xs font-mono text-zinc-500">{second.branch}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors duration-200">
                    {second.fullName}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 mb-6">
                    {second.topTech || 'AI & Machine Learning'}
                  </p>
                </div>
                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-white font-mono tabular-nums">{second.projectCount}</span>
                    <span className="text-xs text-zinc-500 font-mono">projects</span>
                  </div>
                  {second.githubUrl && (
                    <a
                      href={second.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors duration-200"
                      aria-label="GitHub Profile"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden md:block order-2 md:order-1" />
            )}

            {/* Rank 1: Gold Podium (Linear centerpiece with electric amber accent beam) */}
            {first && (
              <div className="order-1 md:order-2 relative rounded-2xl linear-card linear-card-hover p-7 flex flex-col justify-between border-t-2 border-t-amber-400 md:-translate-y-4 shadow-[0_0_35px_-10px_rgba(251,191,36,0.2)] group">
                <div className="flex items-center justify-between mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-400/10 text-amber-300 text-xs font-mono font-bold border border-amber-400/30">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    RANK #1 · TOP BUILDER
                  </span>
                  <span className="text-xs font-mono text-amber-400/70">{first.branch}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-white group-hover:text-amber-300 transition-colors duration-200">
                    {first.fullName}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1.5 mb-7">
                    {first.topTech || 'LLM Architectures & Multimodal Models'}
                  </p>
                </div>
                <div className="pt-5 border-t border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-white font-mono tabular-nums">{first.projectCount}</span>
                    <span className="text-xs text-zinc-400 font-mono">projects built</span>
                  </div>
                  {first.githubUrl && (
                    <a
                      href={first.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 transition-colors duration-200"
                      aria-label="GitHub Profile"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Rank 3: Bronze Podium */}
            {third ? (
              <div className="order-3 relative rounded-2xl linear-card linear-card-hover p-6 flex flex-col justify-between border-t-2 border-t-amber-700/70 group">
                <div className="flex items-center justify-between mb-5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] text-zinc-300 text-[11px] font-mono border border-white/10">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    RANK #3
                  </span>
                  <span className="text-xs font-mono text-zinc-500">{third.branch}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors duration-200">
                    {third.fullName}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 mb-6">
                    {third.topTech || 'Computer Vision & Edge Systems'}
                  </p>
                </div>
                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-white font-mono tabular-nums">{third.projectCount}</span>
                    <span className="text-xs text-zinc-500 font-mono">projects</span>
                  </div>
                  {third.githubUrl && (
                    <a
                      href={third.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors duration-200"
                      aria-label="GitHub Profile"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden md:block order-3" />
            )}

          </div>
        )}

        {/* Ranks 4+ Precision Linear Table */}
        {remaining.length > 0 && (
          <div className="max-w-4xl mx-auto rounded-2xl linear-card overflow-hidden">
            <div className="px-6 py-3.5 bg-white/[0.02] border-b border-white/[0.08] flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              <span>Rank & Builder</span>
              <div className="flex items-center gap-10">
                <span className="hidden sm:inline">Track</span>
                <span>Contributions</span>
              </div>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {remaining.map((item) => (
                <div
                  key={item.id}
                  className="px-6 py-3.5 flex items-center justify-between hover:bg-white/[0.03] transition-colors duration-200 text-sm group"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-6 text-center font-mono text-xs font-bold text-zinc-600 group-hover:text-cyan-400 transition-colors">
                      #{item.rank}
                    </span>
                    <div>
                      <div className="font-medium text-zinc-200 group-hover:text-white flex items-center gap-2">
                        <span>{item.fullName}</span>
                        {item.githubUrl && (
                          <a
                            href={item.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-zinc-600 hover:text-cyan-400 transition-colors duration-200"
                            aria-label="GitHub"
                          >
                            <Github className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500 sm:hidden mt-0.5">
                        {item.branch}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-10">
                    <span className="hidden sm:inline text-xs text-zinc-500 font-mono">
                      {item.branch}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
                      <span className="font-mono font-bold text-white tabular-nums">{item.projectCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
