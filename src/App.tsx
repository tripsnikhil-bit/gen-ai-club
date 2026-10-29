/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { ProjectsSection } from './components/ProjectsSection';
import { Leaderboard } from './components/Leaderboard';
import { NewsSection } from './components/NewsSection';
import { EventsSection } from './components/EventsSection';
import { FeedbackSection } from './components/FeedbackSection';
import { Footer } from './components/Footer';
import { JoinModal } from './components/JoinModal';
import { StudentAuthModal } from './components/StudentAuthModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { SetupInstructionsModal } from './components/SetupInstructionsModal';
import { supabase } from './lib/supabase';
import { ClubSettings } from './types';
import { DEFAULT_CLUB_SETTINGS } from './lib/starterData';
import { Sparkles } from 'lucide-react';

function AppContent() {
  const { isAdmin, isApprovedMember, loading, logout } = useAuth();
  const toast = useToast();

  const [currentView, setCurrentView] = useState<'landing' | 'student-dashboard' | 'admin-dashboard'>('landing');

  // Modals state
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [studentAuthOpen, setStudentAuthOpen] = useState(false);
  const [adminAuthOpen, setAdminAuthOpen] = useState(false);
  const [setupGuideOpen, setSetupGuideOpen] = useState(false);

  // Club Settings state
  const [settings, setSettings] = useState<ClubSettings>(DEFAULT_CLUB_SETTINGS);

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setSettings({
            clubName: data.club_name || data.clubName || DEFAULT_CLUB_SETTINGS.clubName,
            collegeName: data.college_name || data.collegeName || DEFAULT_CLUB_SETTINGS.collegeName,
            contactEmail: data.contact_email || data.contactEmail || DEFAULT_CLUB_SETTINGS.contactEmail,
            tagline: data.tagline || DEFAULT_CLUB_SETTINGS.tagline,
            instagramUrl: data.instagram_url || data.instagramUrl,
            linkedinUrl: data.linkedin_url || data.linkedinUrl,
            githubUrl: data.github_url || data.githubUrl,
          });
        }
      } catch (err) {
        console.warn('Settings load notice:', err);
      }
    }
    loadSettings();
  }, []);

  // Protected View Guards
  useEffect(() => {
    if (!loading) {
      if (currentView === 'admin-dashboard' && !isAdmin) {
        setCurrentView('landing');
        setAdminAuthOpen(true);
      } else if (currentView === 'student-dashboard' && !isApprovedMember) {
        setCurrentView('landing');
        setStudentAuthOpen(true);
      }
    }
  }, [currentView, isAdmin, isApprovedMember, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-cyan-400 shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)] mb-4">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
          Loading Chapter Portal...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-zinc-100 relative selection:bg-cyan-500/20 selection:text-cyan-200">
      
      {/* Global Animated Ambient Background Glow (Apple / OpenAI tier subtle living canvas) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute -top-[15%] left-1/4 w-[750px] h-[750px] rounded-full bg-cyan-500/10 filter blur-[130px] animate-ambient-mesh-1"
        />
        <div 
          className="absolute top-[45%] -right-[10%] w-[700px] h-[700px] rounded-full bg-indigo-500/10 filter blur-[140px] animate-ambient-mesh-2"
        />
        <div 
          className="absolute bottom-[10%] left-[5%] w-[650px] h-[650px] rounded-full bg-sky-500/08 filter blur-[150px] animate-ambient-mesh-1"
        />
      </div>

      {/* Top Navbar */}
      {currentView !== 'admin-dashboard' && (
        <Navbar
          onOpenJoin={() => setJoinModalOpen(true)}
          onOpenStudentAuth={() => setStudentAuthOpen(true)}
          onOpenAdminAuth={() => setAdminAuthOpen(true)}
          currentView={currentView}
          setCurrentView={setCurrentView}
        />
      )}

      {/* Main Routed View */}
      <main className="flex-1 relative z-10">
        {currentView === 'landing' && (
          <>
            <Hero
              onOpenJoin={() => setJoinModalOpen(true)}
              onExploreProjects={() => {
                const el = document.getElementById('projects');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              collegeName={settings.collegeName}
            />
            <AboutSection collegeName={settings.collegeName} />
            <ProjectsSection />
            <Leaderboard />
            <NewsSection />
            <EventsSection />
            <FeedbackSection />
          </>
        )}

        {currentView === 'student-dashboard' && isApprovedMember && (
          <StudentDashboard
            onLogout={async () => {
              await logout();
              setCurrentView('landing');
              toast.info('Signed out of Student Portal.');
            }}
          />
        )}

        {currentView === 'admin-dashboard' && isAdmin && (
          <AdminDashboard
            onLogout={async () => {
              await logout();
              setCurrentView('landing');
              toast.info('Signed out of Admin Console.');
            }}
            onViewPublicSite={() => setCurrentView('landing')}
          />
        )}
      </main>

      {/* Footer */}
      {currentView !== 'admin-dashboard' && (
        <Footer
          settings={settings}
          onOpenSetupGuide={() => setSetupGuideOpen(true)}
          onOpenAdminAuth={() => setAdminAuthOpen(true)}
        />
      )}

      {/* Modals */}
      <JoinModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onOpenStudentLogin={() => {
          setJoinModalOpen(false);
          setStudentAuthOpen(true);
        }}
      />

      <StudentAuthModal
        isOpen={studentAuthOpen}
        onClose={() => setStudentAuthOpen(false)}
        onOpenJoin={() => {
          setStudentAuthOpen(false);
          setJoinModalOpen(true);
        }}
        onSuccess={() => {
          setStudentAuthOpen(false);
          setCurrentView('student-dashboard');
        }}
        onOpenAdminAuth={() => setAdminAuthOpen(true)}
      />

      <AdminAuthModal
        isOpen={adminAuthOpen}
        onClose={() => setAdminAuthOpen(false)}
        onSuccess={() => {
          setAdminAuthOpen(false);
          setCurrentView('admin-dashboard');
        }}
      />

      <SetupInstructionsModal
        isOpen={setupGuideOpen}
        onClose={() => setSetupGuideOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
