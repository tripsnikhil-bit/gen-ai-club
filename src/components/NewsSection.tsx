/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { NewsPost } from '../types';
import { Calendar, User, ArrowUpRight, X, BookOpen } from 'lucide-react';

export const NewsSection: React.FC = () => {
  const [news, setNews] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeArticle, setActiveArticle] = useState<NewsPost | null>(null);

  useEffect(() => {
    async function loadNews() {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .order('published_at', { ascending: false });

        if (!error && data) {
          const loaded: NewsPost[] = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            summary: item.summary,
            content: item.content,
            category: item.category || 'Research',
            author: item.author || 'Gen AI Club Council',
            publishedAt: item.published_at || item.publishedAt || new Date().toISOString(),
          }));
          setNews(loaded);
        }
      } catch (err) {
        console.warn('News Supabase query notice:', err);
      } finally {
        setLoading(false);
      }
    }
    loadNews();
  }, []);

  return (
    <section id="news" className="py-32 border-t border-white/[0.08] bg-black relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-zinc-400 text-xs font-mono tracking-wider uppercase mb-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Dispatches & Publications</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-[-0.03em] leading-tight">
            Latest Research Updates.
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mt-3">
            Campus papers, open-source releases, guest lectures, and hackathon highlights.
          </p>
        </div>

        {/* News Grid / Dynamic Fallback */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="p-8 rounded-2xl linear-card animate-pulse h-48" />
            ))}
          </div>
        ) : news.length === 0 ? (
          /* Dynamic Data Fallback */
          <div className="text-center py-20 px-6 rounded-2xl linear-card border border-white/10 max-w-xl mx-auto shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-cyan-400 mx-auto mb-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white tracking-tight">Check back soon for updates</h3>
            <p className="text-xs text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
              No official announcements or publications have been released yet. Club announcements, research papers, and guest lecture dates will appear here as soon as they are scheduled.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {news.map((item) => (
              <article
                key={item.id}
                onClick={() => setActiveArticle(item)}
                className="p-8 rounded-2xl linear-card linear-card-hover flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono mb-4">
                    <span className="font-medium text-cyan-400">{item.category}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      {new Date(item.publishedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors duration-200 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed mb-6 font-normal">
                    {item.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-white/[0.08] text-xs">
                  <span className="flex items-center gap-1.5 text-zinc-400 font-mono">
                    <User className="w-3.5 h-3.5 text-zinc-500" />
                    {item.author || 'Club Leadership'}
                  </span>
                  <span className="font-medium text-zinc-300 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all duration-200 flex items-center gap-1">
                    Read Dispatch <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>

      {/* Article Detail Modal - Linear Glassmorphism */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl overflow-y-auto">
          <div className="bg-zinc-950 text-zinc-100 rounded-2xl max-w-2xl w-full p-8 sm:p-9 shadow-2xl border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] max-h-[85vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200 linear-glow-top">
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 text-xs text-cyan-400 font-mono mb-3">
              <span>{activeArticle.category}</span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-400">
                {new Date(activeArticle.publishedAt).toLocaleDateString(undefined, {
                  dateStyle: 'long',
                })}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-4 leading-snug">
              {activeArticle.title}
            </h2>

            <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono mb-6 pb-4 border-b border-white/[0.08]">
              <User className="w-3.5 h-3.5 text-zinc-500" />
              <span>Published by {activeArticle.author}</span>
            </div>

            <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {activeArticle.content || activeArticle.summary}
            </div>

            <div className="mt-8 pt-4 border-t border-white/[0.08] flex justify-end">
              <button
                onClick={() => setActiveArticle(null)}
                className="px-4 py-2 text-xs font-medium text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
