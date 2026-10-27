/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type StudentStatus = 'pending' | 'approved' | 'rejected';
export type AdminRole = 'president' | 'vice_president' | 'executive';
export type Role = 'student' | 'executive' | 'president' | 'vice_president' | 'member';
export type ProjectStatus = 'Ongoing' | 'Completed' | 'Upcoming';
export type EventStatus = 'Upcoming' | 'Completed';

export interface JoinRequest {
  id?: string;
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  rollNumber: string;
  branch: string;
  year: string;
  skills: string;
  statement: string;
  status: StudentStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface Member {
  id?: string;
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  rollNumber: string;
  branch: string;
  year: string;
  skills: string;
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  role?: 'president' | 'vice_president' | 'executive' | 'member' | 'student';
  status: 'approved';
  joinedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  roll_number?: string;
  branch?: string;
  year?: string;
  skills?: string;
  bio?: string;
  github_url?: string;
  linkedin_url?: string;
  role: 'president' | 'vice_president' | 'executive' | 'member' | 'student';
  status: 'approved' | 'rejected' | 'pending';
  created_at?: string;
  updated_at?: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  role: AdminRole;
  assignedBy?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ProjectStatus;
  techStack: string; // e.g., "PyTorch, LangChain, React, FastAPI"
  teamMembers: string;
  githubUrl?: string;
  demoUrl?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface NewsPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  publishedAt: string;
}

export interface ClubEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  rsvpUrl?: string;
  status: EventStatus;
}

export interface ClubSettings {
  clubName: string;
  collegeName: string;
  contactEmail: string;
  tagline: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}
