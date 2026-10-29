/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from './supabase';
import { Project, NewsPost, ClubEvent, ClubSettings } from '../types';

export const DEFAULT_CLUB_SETTINGS: ClubSettings = {
  clubName: 'Gen AI Club',
  collegeName: 'NIAT SANSKRITI',
  contactEmail: 'genai.club@niatsanskriti.edu',
  tagline: 'Empowering students to pioneer neural architectures, generative models, and autonomous AI systems.',
  instagramUrl: 'https://instagram.com',
  linkedinUrl: 'https://linkedin.com',
  githubUrl: 'https://github.com',
};

export const SAMPLE_PROJECTS: Omit<Project, 'id'>[] = [
  {
    title: 'Sanskriti-LLM: Domain Campus Assistant',
    description: 'A retrieval-augmented local language model fine-tuned on university curriculum, administrative queries, and research materials with real-time citations.',
    category: 'LLMs & Agents',
    status: 'Ongoing',
    techStack: 'PyTorch, Llama-3, vLLM, LangChain, FAISS, FastAPI',
    teamMembers: 'Aarav Sharma, Priya Patel, Rohit Verma',
    githubUrl: 'https://github.com',
    demoUrl: 'https://demo.example.com',
    createdAt: new Date().toISOString(),
  },
  {
    title: 'EdgeVision: Real-Time Lab Safety & Occupancy',
    description: 'Embedded computer vision model running on low-power Jetson units to monitor hardware lab capacity, equipment safety compliance, and power efficiency.',
    category: 'Computer Vision',
    status: 'Completed',
    techStack: 'YOLOv10, TensorRT, OpenCV, WebSockets, React',
    teamMembers: 'Ananya Gupta, Devansh Mishra',
    githubUrl: 'https://github.com',
    demoUrl: '',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    title: 'Agentic Research Digest: Automated Literature Synthesis',
    description: 'Multi-agent orchestration system that monitors arXiv and Hugging Face daily, summarizes breakthrough papers, and generates reproducible code scaffolds.',
    category: 'Autonomous Agents',
    status: 'Ongoing',
    techStack: 'AutoGen, Gemini 2.5 Flash, DuckDuckGo API, Streamlit',
    teamMembers: 'Kunal Sen, Tanvi Reddy',
    githubUrl: 'https://github.com',
    demoUrl: '',
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
  {
    title: 'BioGen: Protein Conformation Diffusion Visualizer',
    description: 'Interactive 3D WebGL protein folding simulator trained on open structural biology databases for student bio-computing seminars.',
    category: 'Generative Models',
    status: 'Completed',
    techStack: 'Three.js, PyTorch Geometric, FastAPI, WebAssembly',
    teamMembers: 'Siddharth Rao, Meera Nair',
    githubUrl: 'https://github.com',
    demoUrl: '',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
];

export const SAMPLE_NEWS: Omit<NewsPost, 'id'>[] = [
  {
    title: 'Official Launch of Gen AI Club at NIAT SANSKRITI',
    summary: 'The Department of Computer Science & Engineering inaugurates the flagship Generative AI Student Research Club.',
    content: 'We are thrilled to inaugurate the Gen AI Club at NIAT SANSKRITI. Designed as a hands-on collaborative ecosystem, the club bridges academic rigor and industry-grade AI development. Members will gain direct access to GPU computing clusters, mentorship from AI research scientists, and weekly project hackathons.',
    category: 'Club Announcement',
    author: 'Club Executive Council',
    publishedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    title: 'Research Paper Accepted at NeurIPS Student Symposium',
    summary: 'Our student research team presents a novel sparse-attention optimization method.',
    content: 'Congratulations to our club members whose collaborative work on memory-efficient transformer fine-tuning has been accepted. The team utilized open-source frameworks to reduce training VRAM by 34% on edge devices.',
    category: 'Research Milestone',
    author: 'AI Research Division',
    publishedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
];

export const SAMPLE_EVENTS: Omit<ClubEvent, 'id'>[] = [
  {
    title: 'Hands-on Agentic Workflows & Multi-Modal AI Jam',
    date: 'November 15, 2026',
    time: '2:00 PM - 5:30 PM',
    venue: 'NIAT SANSKRITI Innovation Hub, Room 402',
    description: 'Deep dive into autonomous reasoning, tool-calling agents, and real-time multimodal streaming. Bring your laptops with Python 3.11+ installed.',
    rsvpUrl: 'https://forms.example.com',
    status: 'Upcoming',
  },
  {
    title: 'Campus Hackathon: Generative AI for Social Good',
    date: 'December 05 - 06, 2026',
    time: '36-Hour Hackathon',
    venue: 'Auditorium Block B',
    description: '36-hour sprint building applications in education, healthcare, and environmental sensing with free API credits provided by industry partners.',
    rsvpUrl: 'https://forms.example.com',
    status: 'Upcoming',
  },
];

export async function seedBenchmarkData() {
  try {
    // Projects
    for (const proj of SAMPLE_PROJECTS) {
      await supabase.from('projects').insert({
        title: proj.title,
        description: proj.description,
        category: proj.category,
        status: proj.status,
        tech_stack: proj.techStack,
        team_members: proj.teamMembers,
        github_url: proj.githubUrl,
        live_url: proj.demoUrl,
        demo_url: proj.demoUrl,
      });
    }

    // News
    for (const item of SAMPLE_NEWS) {
      await supabase.from('news').insert({
        title: item.title,
        summary: item.summary,
        content: item.content,
        category: item.category,
        author: item.author,
      });
    }

    // Events
    for (const evt of SAMPLE_EVENTS) {
      await supabase.from('events').insert({
        title: evt.title,
        date: evt.date,
        time: evt.time,
        venue: evt.venue,
        location: evt.venue,
        description: evt.description,
        rsvp_url: evt.rsvpUrl,
        status: evt.status,
      });
    }
  } catch (err) {
    console.warn('seedBenchmarkData error:', err);
  }
}

