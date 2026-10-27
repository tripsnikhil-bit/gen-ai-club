/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import { User, BookOpen, Layers, Calendar, LogOut, Check, Edit2, Github, Linkedin } from 'lucide-react';
import { ProjectsSection } from './ProjectsSection';
import { NewsSection } from './NewsSection';
import { EventsSection } from './EventsSection';

interface StudentDashboardProps {
  onLogout: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onLogout }) => {
  const { memberProfile, user, refreshAuthStatus } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'news' | 'events'>('profile');
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields
  const [bio, setBio] = useState(memberProfile?.bio || '');
  const [skills, setSkills] = useState(memberProfile?.skills || '');
  const [githubUrl, setGithubUrl] = useState(memberProfile?.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(memberProfile?.linkedinUrl || '');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          bio: bio.trim(),
          skills: skills.trim(),
          github_url: githubUrl.trim(),
          linkedin_url: linkedinUrl.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.warn('Profile update error from Supabase:', error);
      }

      await refreshAuthStatus();
      setIsEditing(false);
      toast.success('Profile updated successfully in Supabase!');
    } catch (err: any) {
      console.error('Error updating profile in Supabase:', err);
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-24 text-zinc-100">
      
      {/* Top Banner */}
      <div className="bg-black border-b border-white/[0.08] backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-cyan-400 font-bold font-mono text-lg shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
              {memberProfile?.fullName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {memberProfile?.fullName || 'Active Club Member'}
                </h1>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                  Verified Member
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                {memberProfile?.branch || 'CSE'} ({memberProfile?.year || 'Member'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-rose-400 hover:bg-white/[0.04] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-white/10"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto border-t border-white/[0.06]">
          {[
            { id: 'profile', label: 'My Member Profile', icon: User },
            { id: 'projects', label: 'Club Projects', icon: Layers },
            { id: 'news', label: 'Announcements', icon: BookOpen },
            { id: 'events', label: 'Events & Workshops', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 text-xs font-medium flex items-center gap-2 border-b-2 whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  active
                    ? 'border-cyan-400 text-white font-semibold'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-cyan-400' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Card: Summary */}
            <div className="p-7 rounded-2xl linear-card space-y-6 h-fit">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-4">
                  Academic Dossier
                </h3>
                <dl className="space-y-3.5 text-xs">
                  <div>
                    <dt className="text-zinc-500">Institutional Email</dt>
                    <dd className="font-mono text-zinc-200 break-all mt-0.5">{memberProfile?.email || user?.email}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Branch & Department</dt>
                    <dd className="text-zinc-200 mt-0.5">{memberProfile?.branch || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Academic Year</dt>
                    <dd className="text-zinc-200 mt-0.5">{memberProfile?.year || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Member Since</dt>
                    <dd className="text-zinc-200 mt-0.5">
                      {memberProfile?.joinedAt
                        ? new Date(memberProfile.joinedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })
                        : 'Current Cohort'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Quick Links */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center gap-3">
                {memberProfile?.githubUrl && (
                  <a
                    href={memberProfile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {memberProfile?.linkedinUrl && (
                  <a
                    href={memberProfile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Right Card: Profile Editor & Bio */}
            <div className="lg:col-span-2 p-8 rounded-2xl linear-card">
              <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Biography & Research Interests</h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Keep your profile updated so project teams can match you to open research tracks.
                  </p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => {
                      setBio(memberProfile?.bio || '');
                      setSkills(memberProfile?.skills || '');
                      setGithubUrl(memberProfile?.githubUrl || '');
                      setLinkedinUrl(memberProfile?.linkedinUrl || '');
                      setIsEditing(true);
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-white linear-btn-glow rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Short Bio & Technical Focus
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Working on retrieval-augmented generation and reasoning agents..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-white/[0.03] text-white focus:border-cyan-400/80 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Skills & Tech Stack
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PyTorch, LangChain, React, FastAPI"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-white/[0.03] text-white focus:border-cyan-400/80 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                        GitHub URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://github.com/username"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-white/[0.03] text-white focus:border-cyan-400/80 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-white/[0.03] text-white focus:border-cyan-400/80 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white bg-white/[0.04] border border-white/10 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 text-xs font-medium text-white linear-btn-glow rounded-lg disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">
                      About Me
                    </h4>
                    <p className="text-sm text-zinc-300 leading-relaxed font-normal">
                      {memberProfile?.bio || 'No bio written yet. Click "Edit Profile" to share your research focus.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">
                      Skills & Expertise
                    </h4>
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-xs font-mono text-cyan-300">
                      {memberProfile?.skills || 'No skills listed yet.'}
                    </div>
                  </div>

                  {/* Club Resource Links */}
                  <div className="pt-6 border-t border-white/[0.08]">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-3">
                      Exclusive Member Resources
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl linear-card">
                        <div className="font-medium text-xs text-white">Campus GPU Cluster Access</div>
                        <p className="text-[11px] text-zinc-500 mt-1">SSH credentials and slurm queue instructions for lab workstations.</p>
                      </div>
                      <div className="p-4 rounded-xl linear-card">
                        <div className="font-medium text-xs text-white">Weekly Paper Reading Group</div>
                        <p className="text-[11px] text-zinc-500 mt-1">Fridays 5:00 PM in Room 402 or via Google Meet.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {activeTab === 'projects' && (
          <div>
            <ProjectsSection />
          </div>
        )}

        {activeTab === 'news' && (
          <div>
            <NewsSection />
          </div>
        )}

        {activeTab === 'events' && (
          <div>
            <EventsSection />
          </div>
        )}
      </div>

    </div>
  );
};
