/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Menu, X, Shield, User, LogOut, ArrowRight, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenJoin: () => void;
  onOpenStudentAuth: () => void;
  onOpenAdminAuth: () => void;
  currentView: 'landing' | 'student-dashboard' | 'admin-dashboard';
  setCurrentView: (view: 'landing' | 'student-dashboard' | 'admin-dashboard') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenJoin,
  onOpenStudentAuth,
  onOpenAdminAuth,
  currentView,
  setCurrentView,
}) => {
  const { user, isAdmin, isApprovedMember, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Stealth Admin Portal Keyboard Shortcut (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        onOpenAdminAuth();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenAdminAuth]);

  const handleNavClick = (sectionId: string) => {
    if (currentView !== 'landing') {
      setCurrentView('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-black/60 backdrop-blur-2xl border-b border-white/[0.08] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Stealth Admin Trigger - Double clicking logo triggers AdminAuthModal */}
        <div
          onDoubleClick={(e) => {
            e.preventDefault();
            onOpenAdminAuth();
          }}
          title="GEN AI CLUB · Double-click or Ctrl+Shift+A for Executive Console"
          className="flex items-center gap-3 text-left group select-none cursor-pointer"
        >
          <div 
            onClick={() => setCurrentView('landing')}
            className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-white group-hover:border-cyan-400/50 group-hover:bg-white/[0.08] transition-all duration-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div 
            onClick={() => setCurrentView('landing')}
            className="flex flex-col"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-white leading-none whitespace-nowrap group-hover:text-cyan-300 transition-colors duration-200">
                GEN AI CLUB
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80 shadow-[0_0_6px_#06b6d4]" />
            </div>
            <span className="text-[9px] font-mono font-medium text-zinc-500 tracking-wider uppercase mt-0.5">
              NIAT SANSKRITI
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links - Linear Minimalist Style */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
          <button
            onClick={() => handleNavClick('about')}
            className="hover:text-white transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer"
          >
            About
          </button>
          <button
            onClick={() => handleNavClick('projects')}
            className="hover:text-white transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Projects
          </button>
          <button
            onClick={() => handleNavClick('leaderboard')}
            className="hover:text-white transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1 text-zinc-300 hover:text-cyan-300"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Leaderboard</span>
          </button>
          <button
            onClick={() => handleNavClick('news')}
            className="hover:text-white transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer"
          >
            News & Updates
          </button>
          <button
            onClick={() => handleNavClick('events')}
            className="hover:text-white transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Events
          </button>
          <button
            onClick={() => handleNavClick('feedback')}
            className="hover:text-white transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Feedback
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Admin console hidden from regular visitors) */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-2.5">
              {isAdmin && (
                <button
                  onClick={() => setCurrentView(currentView === 'admin-dashboard' ? 'landing' : 'admin-dashboard')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                    currentView === 'admin-dashboard'
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] text-zinc-300 border border-white/10'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  Admin Console
                </button>
              )}

              {isApprovedMember && (
                <button
                  onClick={() => setCurrentView(currentView === 'student-dashboard' ? 'landing' : 'student-dashboard')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                    currentView === 'student-dashboard'
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] text-zinc-300 border border-white/10'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  Student Portal
                </button>
              )}

              <div className="flex items-center gap-2 pl-1 border-l border-white/10 ml-1">
                <span className="text-xs font-mono text-zinc-400 max-w-[130px] truncate">
                  {user.user_metadata?.full_name || user.email}
                </span>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-white/[0.04] rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAdminAuth}
                title="Club Leadership & Executive Portal"
                className="px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-cyan-300 hover:bg-white/[0.04] rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>Admin Login</span>
              </button>

              <button
                onClick={onOpenStudentAuth}
                className="px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Student Login
              </button>

              <button
                onClick={onOpenJoin}
                className="px-4 py-1.5 text-xs font-medium text-white linear-btn-glow rounded-lg flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Join Chapter
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden items-center gap-2">
          {!user && (
            <button
              onClick={onOpenAdminAuth}
              className="p-1.5 text-zinc-400 hover:text-cyan-300 rounded-lg hover:bg-white/[0.05] cursor-pointer"
              title="Admin Login"
            >
              <Shield className="w-4 h-4 text-cyan-400" />
            </button>
          )}
          {!user && (
            <button
              onClick={onOpenJoin}
              className="px-3 py-1.5 text-xs font-medium text-white linear-btn-glow rounded-lg cursor-pointer"
            >
              Join
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.05] focus:outline-hidden cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/[0.08] bg-black/95 backdrop-blur-2xl px-5 pt-4 pb-8 flex flex-col gap-2 shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => handleNavClick('about')}
            className="text-left py-2.5 px-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.03] rounded-lg transition-colors cursor-pointer"
          >
            About
          </button>
          <button
            onClick={() => handleNavClick('projects')}
            className="text-left py-2.5 px-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.03] rounded-lg transition-colors cursor-pointer"
          >
            Projects
          </button>
          <button
            onClick={() => handleNavClick('leaderboard')}
            className="text-left py-2.5 px-2 text-sm font-medium text-zinc-200 hover:text-white hover:bg-white/[0.03] rounded-lg transition-colors cursor-pointer flex items-center gap-2"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Leaderboard</span>
          </button>
          <button
            onClick={() => handleNavClick('news')}
            className="text-left py-2.5 px-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.03] rounded-lg transition-colors cursor-pointer"
          >
            News & Updates
          </button>
          <button
            onClick={() => handleNavClick('events')}
            className="text-left py-2.5 px-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.03] rounded-lg transition-colors cursor-pointer"
          >
            Events
          </button>
          <button
            onClick={() => handleNavClick('feedback')}
            className="text-left py-2.5 px-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.03] rounded-lg transition-colors cursor-pointer"
          >
            Feedback
          </button>

          <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2">
            {user ? (
              <>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setCurrentView('admin-dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 px-4 text-xs font-medium rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center justify-center gap-2"
                  >
                    <Shield className="w-4 h-4 text-cyan-400" /> Admin Console
                  </button>
                )}
                {isApprovedMember && (
                  <button
                    onClick={() => {
                      setCurrentView('student-dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 px-4 text-xs font-medium rounded-lg bg-white/[0.05] text-zinc-200 border border-white/10 flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4 text-cyan-400" /> Student Portal
                  </button>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/20 rounded-lg flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onOpenAdminAuth();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-xs font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg border border-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Admin / Executive Login</span>
                </button>
                <button
                  onClick={() => {
                    onOpenStudentAuth();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-xs font-medium text-zinc-300 bg-white/[0.03] hover:bg-white/[0.06] rounded-lg border border-white/10 cursor-pointer"
                >
                  Student Login
                </button>
                <button
                  onClick={() => {
                    onOpenJoin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-xs font-medium text-white linear-btn-glow rounded-lg cursor-pointer"
                >
                  Join Chapter
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
