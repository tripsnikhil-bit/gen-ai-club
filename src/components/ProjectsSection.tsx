/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Project, ProjectStatus } from '../types';
import { Github, ExternalLink, Code2, Users, Layers } from 'lucide-react';

export const ProjectsSection: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | ProjectStatus>('All');

  useEffect(() => {
    let mounted = true;

    async function loadProjects() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (mounted && !error && data) {
          const loaded: Project[] = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category || 'Generative AI',
            status: item.status || 'Ongoing',
            techStack: item.tech_stack || item.techStack || 'PyTorch, Transformers',
            teamMembers: item.team_members || item.teamMembers || 'Club Research Team',
            githubUrl: item.github_url || item.githubUrl,
            demoUrl: item.live_url || item.demo_url || item.demoUrl,
            imageUrl: item.image_url || item.imageUrl,
            createdAt: item.created_at || new Date().toISOString(),
          }));
          setProjects(loaded);
        }
      } catch (err) {
        console.warn('Projects Supabase query notice:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadProjects();

    // Real-time Supabase subscription to stream project additions/updates live
    const channel = supabase
      .channel('public:projects')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => {
          if (mounted) loadProjects();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredProjects = projects.filter(
    (p) => filter === 'All' || p.status === filter
  );

  return (
    <section id="projects" className="py-32 bg-black relative border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-zinc-400 text-xs font-mono tracking-wider uppercase mb-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Engineering Artifacts</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-400">
              Featured Club Projects.
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 mt-3 max-w-xl">
              From open-source transformer architectures to campus robotics prototypes built by student squads.
            </p>
          </div>

          {/* Minimalist Segmented Control */}
          {projects.length > 0 && (
            <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/10 rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] shrink-0 self-start md:self-auto backdrop-blur-xl">
              {(['All', 'Ongoing', 'Completed', 'Upcoming'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    filter === tab
                      ? 'bg-white/10 text-white shadow-xs border border-white/10'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Projects Grid / Dynamic Fallback */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-8 rounded-2xl linear-card animate-pulse h-64" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          /* Dynamic Data Fallback: database is empty */
          <div className="text-center py-20 px-6 rounded-2xl linear-card border border-white/10 max-w-xl mx-auto shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-cyan-400 mx-auto mb-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white tracking-tight">Check back soon for updates</h3>
            <p className="text-xs text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
              Our student research squads are currently compiling active model checkpoints, benchmarks, and project documentation. New projects will be showcased here upon peer review.
            </p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16 linear-card rounded-2xl p-8 max-w-md mx-auto">
            <Layers className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-300">No projects found</h3>
            <p className="text-xs text-zinc-500 mt-1">There are no projects currently marked as "{filter}".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="p-8 rounded-2xl linear-card linear-card-hover flex flex-col justify-between group"
              >
                <div>
                  {/* Category and Status line */}
                  <div className="flex items-center justify-between text-xs mb-4 text-zinc-500 font-mono">
                    <span className="font-medium text-cyan-400">
                      {project.category || 'Generative AI'}
                    </span>
                    <span>·</span>
                    <span
                      className={`font-medium ${
                        project.status === 'Completed'
                          ? 'text-emerald-400'
                          : project.status === 'Ongoing'
                          ? 'text-cyan-300'
                          : 'text-amber-400'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors duration-200 leading-snug">
                    {project.title}
                  </h3>

                  <p className="text-sm text-zinc-400 leading-relaxed mb-6 font-normal">
                    {project.description}
                  </p>
                </div>

                <div className="space-y-4 pt-5 border-t border-white/[0.08]">
                  {/* Tech Stack */}
                  <div className="flex items-start gap-2 text-xs text-zinc-400">
                    <Code2 className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                    <span className="font-mono text-[11px] leading-tight text-zinc-300">
                      {project.techStack}
                    </span>
                  </div>

                  {/* Team */}
                  {project.teamMembers && (
                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                      <Users className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      <span className="truncate">Squad: {project.teamMembers}</span>
                    </div>
                  )}

                  {/* Action Links */}
                  <div className="flex items-center gap-4 pt-2">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors duration-200"
                      >
                        <Github className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Source Code</span>
                      </a>
                    )}
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Live Prototype</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
