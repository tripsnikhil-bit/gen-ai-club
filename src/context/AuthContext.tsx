/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AdminRole, JoinRequest, Member } from '../types';

export const DEFAULT_PRESIDENT_EMAIL = 'tripsnikhil@gmail.com';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  adminRole: AdminRole | null;
  isAdmin: boolean;
  isPresident: boolean;
  memberProfile: Member | null;
  isApprovedMember: boolean;
  joinRequest: JoinRequest | null;
  isSupabaseConnected: boolean;
  logout: () => Promise<void>;
  refreshAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [memberProfile, setMemberProfile] = useState<Member | null>(null);
  const [joinRequest, setJoinRequest] = useState<JoinRequest | null>(null);

  // Sync role, member profile, and join request from Supabase tables
  const fetchRoleAndProfile = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setAdminRole(null);
      setMemberProfile(null);
      setJoinRequest(null);
      setLoading(false);
      return;
    }

    try {
      const email = currentUser.email?.toLowerCase() || '';
      const isDefaultPresident = email === DEFAULT_PRESIDENT_EMAIL.toLowerCase();

      // 1. Check 'profiles' table for role and member details
      let currentRole: AdminRole | null = isDefaultPresident ? 'president' : null;
      let memberData: Member | null = null;

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (profile) {
          const role = profile.role as string;
          if (role === 'president' || role === 'vice_president' || role === 'executive') {
            currentRole = role;
          }

          if (profile.status === 'approved' || isDefaultPresident) {
            memberData = {
              id: profile.id,
              uid: profile.id,
              fullName: profile.full_name || profile.fullName || currentUser.user_metadata?.full_name || 'Member',
              email: profile.email || currentUser.email || '',
              phone: profile.phone || '',
              rollNumber: profile.roll_number || profile.rollNumber || 'COUNCIL',
              branch: profile.branch || 'Computer Science & Engineering',
              year: profile.year || '2nd Year',
              skills: profile.skills || '',
              bio: profile.bio || '',
              githubUrl: profile.github_url || profile.githubUrl || '',
              linkedinUrl: profile.linkedin_url || profile.linkedinUrl || '',
              role: (profile.role as any) || 'member',
              status: 'approved',
              joinedAt: profile.created_at || new Date().toISOString(),
            };
          }
        } else if (isDefaultPresident) {
          // Auto-bootstrap founding President profile in public.profiles table
          currentRole = 'president';
          memberData = {
            id: currentUser.id,
            uid: currentUser.id,
            fullName: 'Nikhil Tripathi (President)',
            email: DEFAULT_PRESIDENT_EMAIL,
            phone: '',
            rollNumber: 'PRESIDENT-01',
            branch: 'Computer Science & Engineering',
            year: 'Council',
            skills: 'Generative AI, Large Language Models, System Architecture',
            bio: 'Founding President of Gen AI Club NIAT SANSKRITI.',
            role: 'president',
            status: 'approved',
            joinedAt: new Date().toISOString(),
          };

          try {
            await supabase.from('profiles').upsert({
              id: currentUser.id,
              email: DEFAULT_PRESIDENT_EMAIL,
              full_name: 'Nikhil Tripathi (President)',
              role: 'president',
              status: 'approved',
              branch: 'Computer Science & Engineering',
              year: 'Council',
              skills: 'Generative AI, Large Language Models, System Architecture',
              bio: 'Founding President of Gen AI Club NIAT SANSKRITI.',
              updated_at: new Date().toISOString(),
            });
          } catch (upsertErr) {
            console.warn('Notice: Could not auto-upsert President profile (check Supabase table schema):', upsertErr);
          }
        }
      } catch (err) {
        console.warn('Notice fetching profile from Supabase:', err);
        if (isDefaultPresident) {
          currentRole = 'president';
        }
      }

      setAdminRole(currentRole);
      setMemberProfile(memberData);

      // 2. Check 'join_requests' table for student application status
      try {
        const { data: request } = await supabase
          .from('join_requests')
          .select('*')
          .or(`id.eq.${currentUser.id},email.eq.${email}`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (request) {
          setJoinRequest({
            id: request.id,
            uid: request.id || currentUser.id,
            fullName: request.full_name || request.fullName,
            email: request.email,
            phone: request.phone || '',
            rollNumber: request.roll_number || request.rollNumber,
            branch: request.branch,
            year: request.year,
            skills: request.skills,
            statement: request.statement_of_interest || request.statement || '',
            status: request.status,
            createdAt: request.created_at,
            reviewedAt: request.reviewed_at,
            reviewedBy: request.reviewed_by,
          });
        } else {
          setJoinRequest(null);
        }
      } catch (reqErr) {
        console.warn('Notice fetching join request from Supabase:', reqErr);
        setJoinRequest(null);
      }
    } catch (error) {
      console.error('Error in fetchRoleAndProfile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAuthStatus = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        await fetchRoleAndProfile(data.user);
      } else {
        setUser(null);
        await fetchRoleAndProfile(null);
      }
    } catch (err) {
      console.warn('refreshAuthStatus error:', err);
    }
  }, [fetchRoleAndProfile]);

  useEffect(() => {
    let mounted = true;

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      const currentUser = session?.user || null;
      setUser(currentUser);
      fetchRoleAndProfile(currentUser);
    }).catch((err) => {
      console.warn('Error fetching Supabase session:', err);
      if (mounted) setLoading(false);
    });

    // Listen to Supabase auth state change events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;
        const currentUser = session?.user || null;
        setUser(currentUser);
        setLoading(true);
        await fetchRoleAndProfile(currentUser);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchRoleAndProfile]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Logout notice:', err);
    }
    setUser(null);
    setAdminRole(null);
    setMemberProfile(null);
    setJoinRequest(null);
  };

  const isPresident =
    adminRole === 'president' || adminRole === 'executive' || user?.email?.toLowerCase() === DEFAULT_PRESIDENT_EMAIL.toLowerCase();
  const isAdmin = isPresident || adminRole === 'vice_president';
  const isApprovedMember = Boolean(memberProfile && memberProfile.status === 'approved') || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        adminRole,
        isAdmin,
        isPresident,
        memberProfile,
        isApprovedMember,
        joinRequest,
        isSupabaseConnected: isSupabaseConfigured,
        logout,
        refreshAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
