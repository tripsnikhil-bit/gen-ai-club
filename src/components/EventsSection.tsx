/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ClubEvent } from '../types';
import { Calendar, Clock, MapPin, ArrowUpRight } from 'lucide-react';

export const EventsSection: React.FC = () => {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadEvents() {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: true });

        if (mounted && !error && data) {
          const loaded: ClubEvent[] = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            date: item.date,
            time: item.time,
            venue: item.location || item.venue || 'Campus Auditorium',
            description: item.description,
            rsvpUrl: item.rsvp_url || item.rsvpUrl,
            status: item.status || 'Upcoming',
          }));
          setEvents(loaded);
        }
      } catch (err) {
        console.warn('Events Supabase query notice:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadEvents();

    // Real-time Supabase subscription to stream event updates live
    const channel = supabase
      .channel('public:events')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => {
          if (mounted) loadEvents();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section id="events" className="py-32 bg-black border-t border-white/[0.08] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-zinc-400 text-xs font-mono tracking-wider uppercase mb-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Gatherings & Hackathons</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-400">
            Upcoming Workshops.
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mt-3">
            Intensive code sprints, GPU study jams, and research symposiums for campus builders.
          </p>
        </div>

        {/* Events Grid / Dynamic Fallback */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="p-8 rounded-2xl linear-card animate-pulse h-44" />
            ))}
          </div>
        ) : events.length === 0 ? (
          /* Dynamic Data Fallback */
          <div className="text-center py-20 px-6 rounded-2xl linear-card border border-white/10 max-w-xl mx-auto shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-cyan-400 mx-auto mb-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white tracking-tight">Check back soon for updates</h3>
            <p className="text-xs text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
              No upcoming hackathons or workshops are currently scheduled. Our executive team will publish new dates and registration links here shortly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="p-8 rounded-2xl linear-card linear-card-hover flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono mb-4">
                    <span className="font-medium text-emerald-400">{evt.status}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-zinc-300">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      {evt.date}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-cyan-300 transition-colors duration-200">
                    {evt.title}
                  </h3>

                  <p className="text-sm text-zinc-400 leading-relaxed mb-6 font-normal">
                    {evt.description}
                  </p>
                </div>

                <div className="pt-5 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
                  <div className="space-y-1.5 text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{evt.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{evt.venue}</span>
                    </div>
                  </div>

                  {evt.rsvpUrl ? (
                    <a
                      href={evt.rsvpUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 text-xs font-medium text-white linear-btn-glow rounded-lg transition-all flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <span>RSVP Seat</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-zinc-600 text-xs">Open Campus Entry</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
