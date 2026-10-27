/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth, DEFAULT_PRESIDENT_EMAIL } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  JoinRequest,
  Member,
  Project,
  NewsPost,
  ClubEvent,
  ClubSettings,
  AdminUser,
  ProjectStatus,
  EventStatus,
} from '../types';
import { seedBenchmarkData, DEFAULT_CLUB_SETTINGS } from '../lib/starterData';
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Layers,
  BookOpen,
  Calendar,
  Settings,
  ShieldAlert,
  LogOut,
  Search,
  Download,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Github,
  Mail,
  Sparkles,
  Phone,
  GraduationCap,
  X,
  RefreshCw,
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
  onViewPublicSite: () => void;
}

type AdminTab =
  | 'overview'
  | 'requests'
  | 'members'
  | 'projects'
  | 'news'
  | 'events'
  | 'settings'
  | 'admins';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  onViewPublicSite,
}) => {
  const { user, isPresident, adminRole } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Firestore Collections State
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [settings, setSettings] = useState<ClubSettings>(DEFAULT_CLUB_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [memberSearch, setMemberSearch] = useState('');
  const [memberBranchFilter, setMemberBranchFilter] = useState('All');
  const [memberYearFilter, setMemberYearFilter] = useState('All');

  // Modal Dialogs State
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsPost | null>(null);

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ClubEvent | null>(null);

  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const [applicantDetailModal, setApplicantDetailModal] = useState<JoinRequest | null>(null);

  // New VP Admin form state
  const [newVpEmail, setNewVpEmail] = useState('');
  const [newVpUid, setNewVpUid] = useState('');

  // 1. Load data from Supabase tables
  const loadAllData = async () => {
    try {
      // Join Requests
      const { data: reqData, error: reqErr } = await supabase
        .from('join_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!reqErr && reqData) {
        setRequests(
          reqData.map((r: any) => ({
            id: r.id,
            uid: r.id,
            fullName: r.full_name || r.fullName || 'Applicant',
            email: r.email,
            phone: r.phone || '',
            rollNumber: r.roll_number || r.rollNumber || 'N/A',
            branch: r.branch || 'CSE',
            year: r.year || '2nd Year',
            skills: r.skills || '',
            statement: r.statement_of_interest || r.statement || '',
            status: r.status,
            createdAt: r.created_at || new Date().toISOString(),
            reviewedAt: r.reviewed_at,
            reviewedBy: r.reviewed_by,
          }))
        );
      }

      // Members from 'profiles' table
      const { data: profData, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!profErr && profData) {
        const activeMembers: Member[] = [];
        const adminUsers: AdminUser[] = [];

        profData.forEach((p: any) => {
          if (p.status === 'approved' || p.role === 'president' || p.role === 'vice_president') {
            activeMembers.push({
              id: p.id,
              uid: p.id,
              fullName: p.full_name || p.fullName || 'Member',
              email: p.email,
              phone: p.phone || '',
              rollNumber: p.roll_number || p.rollNumber || 'COUNCIL',
              branch: p.branch || 'CSE',
              year: p.year || '2nd Year',
              skills: p.skills || '',
              bio: p.bio || '',
              githubUrl: p.github_url || p.githubUrl || '',
              linkedinUrl: p.linkedin_url || p.linkedinUrl || '',
              role: p.role || 'member',
              status: 'approved',
              joinedAt: p.created_at || new Date().toISOString(),
            });
          }

          if (p.role === 'president' || p.role === 'vice_president') {
            adminUsers.push({
              uid: p.id,
              email: p.email,
              role: p.role,
              createdAt: p.created_at || new Date().toISOString(),
            });
          }
        });

        // Always ensure founding President is displayed in executive council
        if (!adminUsers.some((a) => a.email.toLowerCase() === DEFAULT_PRESIDENT_EMAIL.toLowerCase())) {
          adminUsers.unshift({
            uid: 'founding-president',
            email: DEFAULT_PRESIDENT_EMAIL,
            role: 'president',
            createdAt: new Date().toISOString(),
          });
        }

        setMembers(activeMembers);
        setAdmins(adminUsers);
      }

      // Projects
      const { data: projData } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (projData && projData.length > 0) {
        setProjects(
          projData.map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            category: p.category || 'Generative AI',
            status: p.status || 'Ongoing',
            techStack: p.tech_stack || p.techStack || '',
            teamMembers: p.team_members || p.teamMembers || '',
            githubUrl: p.github_url || p.githubUrl,
            demoUrl: p.live_url || p.demo_url || p.demoUrl,
            imageUrl: p.image_url || p.imageUrl,
            createdAt: p.created_at || new Date().toISOString(),
          }))
        );
      }

      // News
      const { data: newsData } = await supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false });
      if (newsData && newsData.length > 0) {
        setNews(
          newsData.map((n: any) => ({
            id: n.id,
            title: n.title,
            summary: n.summary,
            content: n.content,
            category: n.category || 'Research',
            author: n.author || 'Gen AI Club Council',
            publishedAt: n.published_at || n.publishedAt || new Date().toISOString(),
          }))
        );
      }

      // Events
      const { data: evData } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      if (evData && evData.length > 0) {
        setEvents(
          evData.map((e: any) => ({
            id: e.id,
            title: e.title,
            date: e.date,
            time: e.time,
            venue: e.location || e.venue || 'Campus Auditorium',
            description: e.description,
            rsvpUrl: e.rsvp_url || e.rsvpUrl,
            status: e.status || 'Upcoming',
          }))
        );
      }
    } catch (err) {
      console.warn('Error loading admin data from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // ------------------------------------------------------------------------
  // JOIN REQUEST ACTIONS: Approve & Reject (Using Supabase)
  // ------------------------------------------------------------------------
  const handleApproveRequest = async (req: JoinRequest) => {
    try {
      // 1. Update join_requests status to "approved" in Supabase
      await supabase
        .from('join_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.email || 'admin',
        })
        .eq('id', req.uid);

      // 2. Upsert into 'profiles' table with role 'member' and status 'approved'
      await supabase.from('profiles').upsert({
        id: req.uid,
        email: req.email,
        full_name: req.fullName,
        phone: req.phone,
        roll_number: req.rollNumber,
        branch: req.branch,
        year: req.year,
        skills: req.skills,
        bio: `Member of Gen AI Club. Interested in ${req.skills}.`,
        role: 'member',
        status: 'approved',
        created_at: req.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (applicantDetailModal?.uid === req.uid) {
        setApplicantDetailModal(null);
      }

      toast.success(`${req.fullName} approved! Registered as active club member in Supabase.`);
      await loadAllData();
    } catch (err) {
      console.error('Approve error:', err);
      toast.error('Failed to approve request.');
    }
  };

  const handleRejectRequest = async (req: JoinRequest) => {
    try {
      await supabase
        .from('join_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.email || 'admin',
        })
        .eq('id', req.uid);

      await supabase
        .from('profiles')
        .update({
          status: 'rejected',
        })
        .eq('id', req.uid);

      if (applicantDetailModal?.uid === req.uid) {
        setApplicantDetailModal(null);
      }

      toast.info(`Application for ${req.fullName} marked as rejected.`);
      await loadAllData();
    } catch (err) {
      console.error('Reject error:', err);
      toast.error('Failed to update request.');
    }
  };

  // ------------------------------------------------------------------------
  // MEMBER MANAGEMENT: Edit, Remove, Export CSV
  // ------------------------------------------------------------------------
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      await supabase
        .from('profiles')
        .update({
          full_name: editingMember.fullName,
          phone: editingMember.phone,
          roll_number: editingMember.rollNumber,
          branch: editingMember.branch,
          year: editingMember.year,
          skills: editingMember.skills,
          bio: editingMember.bio || '',
          github_url: editingMember.githubUrl || '',
          linkedin_url: editingMember.linkedinUrl || '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingMember.uid);

      toast.success('Member record updated in Supabase.');
      setMemberModalOpen(false);
      setEditingMember(null);
      await loadAllData();
    } catch (err) {
      console.error('Update member error:', err);
      toast.error('Failed to update member.');
    }
  };

  const handleRemoveMember = async (uid: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from active members registry?`)) {
      return;
    }
    try {
      await supabase
        .from('profiles')
        .update({ status: 'rejected' })
        .eq('id', uid);

      await supabase
        .from('join_requests')
        .update({ status: 'rejected' })
        .eq('id', uid);

      toast.info(`${name} removed from members.`);
      await loadAllData();
    } catch (err) {
      console.error('Remove member error:', err);
      toast.error('Failed to remove member.');
    }
  };

  const handleExportCSV = () => {
    if (members.length === 0) {
      toast.error('No members to export.');
      return;
    }
    const headers = ['Full Name', 'Email', 'Roll Number', 'Branch', 'Year', 'Phone', 'Skills', 'Joined At'];
    const rows = members.map((m) => [
      `"${m.fullName.replace(/"/g, '""')}"`,
      `"${m.email}"`,
      `"${m.rollNumber}"`,
      `"${m.branch}"`,
      `"${m.year}"`,
      `"${m.phone}"`,
      `"${(m.skills || '').replace(/"/g, '""')}"`,
      `"${m.joinedAt}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gen_ai_club_members_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Member registry exported as CSV!');
  };

  // ------------------------------------------------------------------------
  // PROJECT MANAGEMENT: Create, Edit, Delete
  // ------------------------------------------------------------------------
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    try {
      const projId = editingProject.id && !editingProject.id.startsWith('preview')
        ? editingProject.id
        : crypto.randomUUID();

      await supabase.from('projects').upsert({
        id: projId,
        title: editingProject.title.trim(),
        description: editingProject.description.trim(),
        category: editingProject.category.trim() || 'Generative AI',
        status: editingProject.status,
        tech_stack: editingProject.techStack.trim(),
        team_members: editingProject.teamMembers.trim(),
        github_url: editingProject.githubUrl?.trim() || '',
        live_url: editingProject.demoUrl?.trim() || '',
        demo_url: editingProject.demoUrl?.trim() || '',
        created_at: editingProject.createdAt || new Date().toISOString(),
      });

      toast.success(editingProject.id ? 'Project updated in Supabase.' : 'New project created in Supabase!');
      setProjectModalOpen(false);
      setEditingProject(null);
      await loadAllData();
    } catch (err) {
      console.error('Save project error:', err);
      toast.error('Failed to save project.');
    }
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (!window.confirm(`Delete project "${title}"?`)) return;
    try {
      await supabase.from('projects').delete().eq('id', id);
      toast.info('Project deleted.');
      await loadAllData();
    } catch (err) {
      console.error('Delete project error:', err);
      toast.error('Failed to delete project.');
    }
  };

  // ------------------------------------------------------------------------
  // NEWS MANAGEMENT: Create, Edit, Delete
  // ------------------------------------------------------------------------
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNews) return;

    try {
      const newsId = editingNews.id && !editingNews.id.startsWith('preview')
        ? editingNews.id
        : crypto.randomUUID();

      await supabase.from('news').upsert({
        id: newsId,
        title: editingNews.title.trim(),
        summary: editingNews.summary.trim(),
        content: editingNews.content.trim(),
        category: editingNews.category.trim() || 'Club Announcement',
        author: editingNews.author.trim() || user?.email || 'Executive Council',
        published_at: editingNews.publishedAt || new Date().toISOString(),
      });

      toast.success(editingNews.id ? 'Announcement updated.' : 'Announcement published!');
      setNewsModalOpen(false);
      setEditingNews(null);
      await loadAllData();
    } catch (err) {
      console.error('Save news error:', err);
      toast.error('Failed to publish news.');
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await supabase.from('news').delete().eq('id', id);
      toast.info('Announcement removed.');
      await loadAllData();
    } catch (err) {
      console.error('Delete news error:', err);
      toast.error('Failed to delete announcement.');
    }
  };

  // ------------------------------------------------------------------------
  // EVENT MANAGEMENT: Create, Edit, Delete
  // ------------------------------------------------------------------------
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    try {
      const eventId = editingEvent.id && !editingEvent.id.startsWith('preview')
        ? editingEvent.id
        : crypto.randomUUID();

      await supabase.from('events').upsert({
        id: eventId,
        title: editingEvent.title.trim(),
        date: editingEvent.date.trim(),
        time: editingEvent.time.trim(),
        venue: editingEvent.venue.trim(),
        location: editingEvent.venue.trim(),
        description: editingEvent.description.trim(),
        rsvp_url: editingEvent.rsvpUrl?.trim() || '',
        status: editingEvent.status,
      });

      toast.success(editingEvent.id ? 'Event updated.' : 'Event scheduled!');
      setEventModalOpen(false);
      setEditingEvent(null);
      await loadAllData();
    } catch (err) {
      console.error('Save event error:', err);
      toast.error('Failed to save event.');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Cancel and delete this event?')) return;
    try {
      await supabase.from('events').delete().eq('id', id);
      toast.info('Event removed.');
      await loadAllData();
    } catch (err) {
      console.error('Delete event error:', err);
      toast.error('Failed to delete event.');
    }
  };

  // ------------------------------------------------------------------------
  // CLUB SETTINGS & SEED DATA
  // ------------------------------------------------------------------------
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from('settings').upsert({
        id: 'club',
        club_name: settings.clubName,
        college_name: settings.collegeName,
        contact_email: settings.contactEmail,
        tagline: settings.tagline,
        instagram_url: settings.instagramUrl,
        linkedin_url: settings.linkedinUrl,
        github_url: settings.githubUrl,
      });
      toast.success('Club settings saved.');
    } catch (err) {
      console.error('Save settings error:', err);
      toast.error('Failed to save settings.');
    }
  };

  const handleSeedBenchmark = async () => {
    if (!window.confirm('Load benchmark starter data (sample projects, announcements, and events) into Supabase?')) return;
    try {
      await seedBenchmarkData();
      toast.success('Benchmark starter data loaded into Supabase!');
      await loadAllData();
    } catch (err) {
      toast.error('Failed to seed benchmark data.');
    }
  };

  // ------------------------------------------------------------------------
  // ADMIN ROSTER (President & Vice President Role Assignment in 'profiles')
  // ------------------------------------------------------------------------
  const handleAddVicePresident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVpEmail.trim()) {
      toast.error('Please provide the student email.');
      return;
    }
    if (!isPresident) {
      toast.error('Only the President can assign executive roles.');
      return;
    }

    try {
      const email = newVpEmail.trim().toLowerCase();
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (existingProfile) {
        await supabase
          .from('profiles')
          .update({ role: 'vice_president' })
          .eq('id', existingProfile.id);
      } else {
        await supabase.from('profiles').insert({
          id: newVpUid.trim() || crypto.randomUUID(),
          email,
          full_name: 'Vice President',
          role: 'vice_president',
          status: 'approved',
          created_at: new Date().toISOString(),
        });
      }

      setNewVpEmail('');
      setNewVpUid('');
      toast.success(`Vice President role assigned to ${email}!`);
      await loadAllData();
    } catch (err) {
      console.error('Assign VP error:', err);
      toast.error('Failed to assign Vice President role.');
    }
  };

  const handleRevokeAdmin = async (adminId: string, email: string) => {
    if (email.toLowerCase() === DEFAULT_PRESIDENT_EMAIL.toLowerCase()) {
      toast.error('Cannot remove founding President account.');
      return;
    }
    if (!window.confirm(`Revoke admin role for ${email}?`)) return;
    try {
      await supabase
        .from('profiles')
        .update({ role: 'member' })
        .eq('id', adminId);

      toast.info('Vice President role revoked.');
      await loadAllData();
    } catch (err) {
      console.error('Revoke admin error:', err);
      toast.error('Failed to revoke admin.');
    }
  };

  // Filtered lists
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const activeProjects = projects.filter((p) => p.status === 'Ongoing');
  const completedProjects = projects.filter((p) => p.status === 'Completed');

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.rollNumber.toLowerCase().includes(memberSearch.toLowerCase());
    const matchesBranch = memberBranchFilter === 'All' || m.branch === memberBranchFilter;
    const matchesYear = memberYearFilter === 'All' || m.year === memberYearFilter;
    return matchesSearch && matchesBranch && matchesYear;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-slate-900 tracking-tight">Executive Console</span>
              </div>
              <p className="text-[11px] text-purple-700 font-semibold mt-1">
                {isPresident ? 'Club President' : 'Vice President'} · {settings.collegeName}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs font-semibold">
            {[
              { id: 'overview', label: 'Overview & Stats', icon: LayoutDashboard },
              { id: 'requests', label: `Join Requests (${pendingRequests.length})`, icon: UserCheck, badge: pendingRequests.length },
              { id: 'members', label: `Members Directory (${members.length})`, icon: Users },
              { id: 'projects', label: `Projects Manager (${projects.length})`, icon: Layers },
              { id: 'news', label: `News & Updates (${news.length})`, icon: BookOpen },
              { id: 'events', label: `Events & Workshops (${events.length})`, icon: Calendar },
              { id: 'settings', label: 'Club Settings & Branding', icon: Settings },
              { id: 'admins', label: 'Manage Admins (VP Role)', icon: ShieldAlert },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                    active
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        active ? 'bg-white text-purple-700' : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <button
            onClick={onViewPublicSite}
            className="w-full py-2 px-3 text-xs font-semibold text-slate-700 hover:text-purple-700 bg-slate-100 hover:bg-purple-50 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Portal</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full py-2 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        
        {/* ================================================================= */}
        {/* 1. OVERVIEW TAB */}
        {/* ================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Executive Overview</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Real-time operations, membership intake, and research pipeline status.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSeedBenchmark}
                  className="px-3.5 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Seed Benchmark Data</span>
                </button>
              </div>
            </div>

            {/* Stat Cards - Tabular figures */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
                  <span>Registered Members</span>
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums">{members.length}</div>
                <p className="text-[11px] text-slate-500 mt-1">Approved students</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
                  <span>Pending Applications</span>
                  <UserCheck className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums">{pendingRequests.length}</div>
                <p className="text-[11px] text-amber-700 font-semibold mt-1">Requires executive review</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
                  <span>Active Projects</span>
                  <Layers className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums">{activeProjects.length}</div>
                <p className="text-[11px] text-slate-500 mt-1">Ongoing research & dev</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
                  <span>Completed Showcases</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums">{completedProjects.length}</div>
                <p className="text-[11px] text-slate-500 mt-1">Published open-source repos</p>
              </div>
            </div>

            {/* Quick Action Queue: Pending Review */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Recent Applications Requiring Decision ({pendingRequests.length})
                </h3>
                {pendingRequests.length > 0 && (
                  <button
                    onClick={() => setActiveTab('requests')}
                    className="text-xs font-semibold text-purple-600 hover:text-purple-800"
                  >
                    View All Requests →
                  </button>
                )}
              </div>

              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  All student applications have been reviewed. No pending queue!
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.slice(0, 3).map((req) => (
                    <div
                      key={req.uid}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="font-semibold text-xs text-slate-900">
                          {req.fullName} · <span className="font-mono text-purple-700">{req.rollNumber}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {req.branch} · {req.year} · {req.email}
                        </div>
                        <div className="text-[11px] text-slate-600 italic mt-1 line-clamp-1">
                          "{req.statement}"
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setApplicantDetailModal(req)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleRejectRequest(req)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApproveRequest(req)}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 2. JOIN REQUESTS TAB */}
        {/* ================================================================= */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Student Join Requests</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Review applicant details, roll numbers, and technical motivations.
                </p>
              </div>
            </div>

            {requests.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
                <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-slate-800">No applications recorded</h3>
                <p className="text-xs text-slate-500 mt-1">When students apply via "Join the Club", their requests will appear here.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Applicant</th>
                        <th className="py-3 px-4">Roll Number</th>
                        <th className="py-3 px-4">Branch & Year</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {requests.map((req) => (
                        <tr key={req.uid} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{req.fullName}</div>
                            <div className="text-[11px] text-slate-500">{req.email}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                            {req.rollNumber}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            <div>{req.branch}</div>
                            <div className="text-[11px] text-slate-400">{req.year}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                            {req.phone}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                req.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : req.status === 'rejected'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {req.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => setApplicantDetailModal(req)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            >
                              Details
                            </button>
                            {req.status !== 'approved' && (
                              <button
                                onClick={() => handleApproveRequest(req)}
                                className="px-2.5 py-1 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                              >
                                Approve
                              </button>
                            )}
                            {req.status !== 'rejected' && (
                              <button
                                onClick={() => handleRejectRequest(req)}
                                className="px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* 3. MEMBERS DIRECTORY TAB */}
        {/* ================================================================= */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Members Directory</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Approved club members with academic roll numbers and technical profiles.
                </p>
              </div>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export to CSV</span>
              </button>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by name, roll number, or email..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <select
                value={memberBranchFilter}
                onChange={(e) => setMemberBranchFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden"
              >
                <option value="All">All Branches</option>
                <option value="Computer Science & Engineering">CSE</option>
                <option value="AI & Data Science">AI & DS</option>
                <option value="Information Technology">IT</option>
                <option value="Electronics & Communication">ECE</option>
              </select>

              <select
                value={memberYearFilter}
                onChange={(e) => setMemberYearFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden"
              >
                <option value="All">All Years</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            {/* Members Table */}
            {filteredMembers.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-slate-800">No members match search</h3>
                <p className="text-xs text-slate-500 mt-1">Approve pending applications or adjust your filter.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Member</th>
                        <th className="py-3 px-4">Roll Number</th>
                        <th className="py-3 px-4">Branch & Year</th>
                        <th className="py-3 px-4">Skills & Focus</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredMembers.map((member) => (
                        <tr key={member.uid} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{member.fullName}</div>
                            <div className="text-[11px] text-slate-500">{member.email}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                            {member.rollNumber}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            <div>{member.branch}</div>
                            <div className="text-[11px] text-slate-400">{member.year}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate font-mono text-[11px]">
                            {member.skills || 'None listed'}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setEditingMember(member);
                                setMemberModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-purple-600 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Edit Member"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member.uid, member.fullName)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Remove Member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* 4. PROJECTS MANAGER TAB */}
        {/* ================================================================= */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Projects Showcase Manager</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Publish and organize research and development projects for public and member view.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingProject({
                    id: '',
                    title: '',
                    description: '',
                    category: 'Generative AI',
                    status: 'Ongoing',
                    techStack: '',
                    teamMembers: '',
                    githubUrl: '',
                    demoUrl: '',
                    createdAt: new Date().toISOString(),
                  });
                  setProjectModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Project</span>
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
                <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-slate-800">No projects added yet</h3>
                <p className="text-xs text-slate-500 mt-1">Click "Add Project" or load benchmark data in Settings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-semibold text-purple-700">{proj.category}</span>
                        <span className={`font-semibold ${proj.status === 'Completed' ? 'text-emerald-700' : 'text-indigo-700'}`}>
                          {proj.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900 mb-1">{proj.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mb-3">{proj.description}</p>
                      <div className="text-[11px] font-mono text-slate-500">
                        Stack: {proj.techStack}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                      <span className="text-[11px] text-slate-400">Team: {proj.teamMembers || 'N/A'}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingProject(proj);
                            setProjectModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-purple-600 rounded-lg hover:bg-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.id, proj.title)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* 5. NEWS & UPDATES TAB */}
        {/* ================================================================= */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">News & Announcements</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Broadcast bulletins, research paper milestones, and campus updates.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingNews({
                    id: '',
                    title: '',
                    summary: '',
                    content: '',
                    category: 'Club Announcement',
                    author: user?.email || 'Executive Council',
                    publishedAt: new Date().toISOString(),
                  });
                  setNewsModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Post Announcement</span>
              </button>
            </div>

            {news.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-slate-800">No announcements published</h3>
                <p className="text-xs text-slate-500 mt-1">Create an announcement to show on the landing page and student feed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {news.map((item) => (
                  <div key={item.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                    <div className="max-w-3xl">
                      <div className="flex items-center gap-2 text-xs text-purple-700 font-semibold mb-1">
                        <span>{item.category}</span>
                        <span>·</span>
                        <span className="text-slate-400 font-normal">
                          {new Date(item.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900 mb-1">{item.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2">{item.summary}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setEditingNews(item);
                          setNewsModalOpen(true);
                        }}
                        className="p-2 text-slate-500 hover:text-purple-600 rounded-lg hover:bg-slate-100"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNews(item.id)}
                        className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* 6. EVENTS TAB */}
        {/* ================================================================= */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Events & Hackathons</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Manage workshops, guest lectures, and campus AI competitions.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingEvent({
                    id: '',
                    title: '',
                    date: '',
                    time: '',
                    venue: '',
                    description: '',
                    rsvpUrl: '',
                    status: 'Upcoming',
                  });
                  setEventModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Event</span>
              </button>
            </div>

            {events.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-slate-800">No events scheduled</h3>
                <p className="text-xs text-slate-500 mt-1">Add upcoming study jams and hackathons.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((evt) => (
                  <div key={evt.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span className="font-semibold text-emerald-700">{evt.status}</span>
                        <span>{evt.date}</span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900 mb-1">{evt.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mb-3">{evt.description}</p>
                      <div className="text-[11px] text-slate-500 space-y-0.5">
                        <div>Time: {evt.time}</div>
                        <div>Venue: {evt.venue}</div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 mt-4">
                      <button
                        onClick={() => {
                          setEditingEvent(evt);
                          setEventModalOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-purple-600 rounded-lg hover:bg-slate-100"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* 7. CLUB SETTINGS TAB */}
        {/* ================================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Club Branding & Global Settings</h1>
              <p className="text-xs text-slate-500 mt-1">
                Configure institution branding, public contact email, and social networks.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Club Display Name
                  </label>
                  <input
                    type="text"
                    value={settings.clubName}
                    onChange={(e) => setSettings({ ...settings, clubName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Host Institution / College Name
                  </label>
                  <input
                    type="text"
                    value={settings.collegeName}
                    onChange={(e) => setSettings({ ...settings, collegeName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Contact / Inquiry Email
                </label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tagline / Mission Statement
                </label>
                <textarea
                  rows={2}
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={settings.githubUrl || ''}
                    onChange={(e) => setSettings({ ...settings, githubUrl: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={settings.linkedinUrl || ''}
                    onChange={(e) => setSettings({ ...settings, linkedinUrl: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={settings.instagramUrl || ''}
                    onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleSeedBenchmark}
                  className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Reset / Load Sample Benchmark Data</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================================================================= */}
        {/* 8. MANAGE ADMINS TAB */}
        {/* ================================================================= */}
        {activeTab === 'admins' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Manage Leadership & Admins</h1>
              <p className="text-xs text-slate-500 mt-1">
                Designate Vice Presidents to share administrative responsibilities (approvals, publishing, member oversight).
              </p>
            </div>

            {/* Current Executive Roster */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-700">
                Active Executive Council
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {/* Founding President */}
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>tripsnikhil@gmail.com</span>
                      <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                        Club President (Founding)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Top-level administrator with full governance access.</p>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Permanent</span>
                </div>

                {/* Additional Vice Presidents */}
                {admins
                  .filter((a) => a.email !== 'tripsnikhil@gmail.com')
                  .map((adm) => (
                    <div key={adm.uid} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{adm.email}</span>
                          <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                            {adm.role === 'president' ? 'President' : 'Vice President'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-mono">UID: {adm.uid}</p>
                      </div>
                      {isPresident && (
                        <button
                          onClick={() => handleRevokeAdmin(adm.uid, adm.email)}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          Revoke Role
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Form to Assign Vice President */}
            {isPresident && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Assign Vice-President Role
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Select an approved student from the Members directory to promote to Vice President.
                </p>

                <form onSubmit={handleAddVicePresident} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Vice President Student Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="vp.student@niat.edu"
                        value={newVpEmail}
                        onChange={(e) => setNewVpEmail(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Student Firebase Auth UID *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Get UID from Members list or Firebase"
                        value={newVpUid}
                        onChange={(e) => setNewVpUid(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  {/* Quick Select from existing approved members */}
                  {members.length > 0 && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Or select from existing approved members:
                      </label>
                      <select
                        onChange={(e) => {
                          const selected = members.find((m) => m.uid === e.target.value);
                          if (selected) {
                            setNewVpEmail(selected.email);
                            setNewVpUid(selected.uid);
                          }
                        }}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                        defaultValue=""
                      >
                        <option value="" disabled>Choose an approved member...</option>
                        {members.map((m) => (
                          <option key={m.uid} value={m.uid}>
                            {m.fullName} ({m.email}) - Roll: {m.rollNumber}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Grant Vice President Role
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ================================================================= */}
      {/* MODAL: APPLICANT DETAILS */}
      {/* ================================================================= */}
      {applicantDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setApplicantDetailModal(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Applicant Dossier</h2>
            <p className="text-xs text-slate-500 mb-4">
              Submitted on {new Date(applicantDetailModal.createdAt).toLocaleDateString()}
            </p>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5">
              <div>
                <span className="text-slate-400 font-medium">Full Name:</span>{' '}
                <strong className="text-slate-900">{applicantDetailModal.fullName}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Email:</span>{' '}
                <span className="text-slate-800 font-mono">{applicantDetailModal.email}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Roll Number:</span>{' '}
                <span className="text-slate-800 font-mono font-bold">{applicantDetailModal.rollNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Branch & Year:</span>{' '}
                <span className="text-slate-800">{applicantDetailModal.branch} ({applicantDetailModal.year})</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Phone:</span>{' '}
                <span className="text-slate-800">{applicantDetailModal.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Technical Skills:</span>
                <p className="font-mono text-purple-900 mt-0.5">{applicantDetailModal.skills}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Why Join the Club:</span>
                <p className="text-slate-700 italic mt-0.5 whitespace-pre-wrap">{applicantDetailModal.statement}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setApplicantDetailModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Close
              </button>
              {applicantDetailModal.status !== 'rejected' && (
                <button
                  onClick={() => handleRejectRequest(applicantDetailModal)}
                  className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer"
                >
                  Reject
                </button>
              )}
              {applicantDetailModal.status !== 'approved' && (
                <button
                  onClick={() => handleApproveRequest(applicantDetailModal)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg cursor-pointer shadow-xs"
                >
                  Approve Application
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: PROJECT EDIT / CREATE */}
      {/* ================================================================= */}
      {projectModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setProjectModalOpen(false);
                setEditingProject(null);
              }}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingProject.id ? 'Edit Project' : 'Add New Project'}
            </h2>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={editingProject.category}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingProject.status}
                    onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as ProjectStatus })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden"
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Upcoming">Upcoming</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tech Stack *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PyTorch, LangChain, React, vLLM"
                  value={editingProject.techStack}
                  onChange={(e) => setEditingProject({ ...editingProject, techStack: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Team Members</label>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma, Rohit Verma"
                  value={editingProject.teamMembers}
                  onChange={(e) => setEditingProject({ ...editingProject, teamMembers: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={editingProject.githubUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Demo / Paper URL</label>
                  <input
                    type="url"
                    value={editingProject.demoUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, demoUrl: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setProjectModalOpen(false);
                    setEditingProject(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: NEWS EDIT / CREATE */}
      {/* ================================================================= */}
      {newsModalOpen && editingNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setNewsModalOpen(false);
                setEditingNews(null);
              }}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingNews.id ? 'Edit Announcement' : 'New Announcement'}
            </h2>

            <form onSubmit={handleSaveNews} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={editingNews.title}
                  onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={editingNews.category}
                    onChange={(e) => setEditingNews({ ...editingNews, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Author Name</label>
                  <input
                    type="text"
                    value={editingNews.author}
                    onChange={(e) => setEditingNews({ ...editingNews, author: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Short Excerpt / Summary *</label>
                <textarea
                  rows={2}
                  required
                  value={editingNews.summary}
                  onChange={(e) => setEditingNews({ ...editingNews, summary: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Article / Details *</label>
                <textarea
                  rows={4}
                  required
                  value={editingNews.content}
                  onChange={(e) => setEditingNews({ ...editingNews, content: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewsModalOpen(false);
                    setEditingNews(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs"
                >
                  Publish News
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: EVENT EDIT / CREATE */}
      {/* ================================================================= */}
      {eventModalOpen && editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setEventModalOpen(false);
                setEditingEvent(null);
              }}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingEvent.id ? 'Edit Event' : 'Schedule Event'}
            </h2>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nov 20, 2026"
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 3:00 PM - 5:00 PM"
                    value={editingEvent.time}
                    onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Venue / Room *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tech Block Room 402 or Google Meet"
                  value={editingEvent.venue}
                  onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">RSVP / Form Link</label>
                  <input
                    type="url"
                    value={editingEvent.rsvpUrl || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, rsvpUrl: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingEvent.status}
                    onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value as EventStatus })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEventModalOpen(false);
                    setEditingEvent(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: MEMBER EDIT */}
      {/* ================================================================= */}
      {memberModalOpen && editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setMemberModalOpen(false);
                setEditingMember(null);
              }}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Edit Member Profile</h2>

            <form onSubmit={handleSaveMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingMember.fullName}
                  onChange={(e) => setEditingMember({ ...editingMember, fullName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    required
                    value={editingMember.rollNumber}
                    onChange={(e) => setEditingMember({ ...editingMember, rollNumber: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editingMember.phone}
                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch</label>
                  <input
                    type="text"
                    value={editingMember.branch}
                    onChange={(e) => setEditingMember({ ...editingMember, branch: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
                  <input
                    type="text"
                    value={editingMember.year}
                    onChange={(e) => setEditingMember({ ...editingMember, year: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Skills</label>
                <input
                  type="text"
                  value={editingMember.skills}
                  onChange={(e) => setEditingMember({ ...editingMember, skills: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMemberModalOpen(false);
                    setEditingMember(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
