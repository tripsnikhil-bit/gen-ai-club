# Gen AI Club NIAT SANSKIRITI Web Application

A responsive, production-quality web platform for **GEN AI CLUB NIAT SANSKIRITI**, featuring a public showcase, student membership onboarding with approval verification, a dedicated student portal, and an administrative control panel for the President and Vice Presidents powered by Firebase Authentication and Firestore.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following requirements and user choices are locked in:
> - **College & Club Title**: `GEN AI CLUB NIAT SANSKIRITI`
> - **President / Admin Email**: `tripsnikhil@gmail.com` is configured as the default Club President with top-tier administrative privileges.
> - **Clean Initial State**: Starts with an uncluttered, clean database state with elegant empty states, while providing an administrative one-click seed tool in Club Settings if the President wishes to load benchmark starter content.
> - **Zero Plaintext Passwords**: Firebase Auth handles credentials securely; Firestore stores only student profile attributes and request states (`pending`, `approved`, `rejected`).
> - **Dual Gate Security**: Frontend role & status verification backed by strict Firestore Security Rules enforcing read/write privileges at the database level.

---

## 1. Overview & Core Concept

- **What It Does**: Serves as the central digital hub for NIAT SANSKIRITI's Gen AI Club. Visitors explore club initiatives, completed and ongoing AI projects, and news announcements. Students submit verified membership applications with roll number, branch, year, interests, and motivation. Club executives review join requests, manage active members, publish projects and events, configure club metadata, and assign Vice President roles.
- **Target Audience / Persona**:
  - *Prospective Student Applicants*: College engineering and science students seeking hands-on generative AI, LLM, computer vision, and robotics experience.
  - *Approved Club Members*: Enrolled students accessing project collaboration spaces, internal announcements, workshops, and member profiles.
  - *Club Leadership (President & Vice Presidents)*: Executive leadership managing club operations, membership registries, project approvals, and college communications.
- **Key Value**: Replaces scattered Google Forms and spreadsheets with a unified, secure portal that automates membership gating and provides showcase-ready project portfolios.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Public Visitor Flow**:
   - Arrives at the landing page; reads club mission, AI focus tracks, ongoing/completed initiatives, and published announcements.
   - Clicks **Join the Club** to trigger the registration modal/form, enters student credentials and academic profile, and receives immediate confirmation of pending application review.
2. **Student Authentication & Dashboard Flow**:
   - Accesses **Student Login** via email and password.
   - If status is `pending`, a polite informational banner explains application status under review.
   - If status is `rejected`, a courteous advisory note is displayed.
   - If `approved`, accesses the Student Portal with profile editor, active projects, internal news feed, events calendar, and password reset capability.
3. **Executive Admin Flow**:
   - Navigates to **Admin Login**; enters President or Vice-President credentials.
   - System verifies membership in the `admins` collection (`tripsnikhil@gmail.com` bootstrapped).
   - Admin enters the control console:
     - **Overview**: Real-time KPI statistics (Total Members, Pending Requests, Ongoing Projects, Completed Projects) and recent activities.
     - **Join Requests**: Interactive approval queue with detailed applicant dossier; one-click Approve (promotes to `members` collection) or Reject.
     - **Members Directory**: Filterable, searchable table with batch actions, branch/year filters, member editing, and CSV export.
     - **Projects Manager**: Create, edit, and categorize projects (Ongoing, Completed, Upcoming) with tech stack tags, team rosters, GitHub/demo links, and imagery.
     - **News & Announcements**: Rich announcement publisher with broadcast visibility toggles.
     - **Events & Gallery**: Campus hackathons, guest lectures, and AI demo days.
     - **Club Settings & Admin Roster**: Customize club contact info, social links, and designate Vice-President roles.

### Visual Identity & Theme
- **Aesthetic Direction**: Clean, light, aesthetic modern campus tech look. Soft pastel surfaces, airy glassmorphic cards, refined micro-borders, and rounded geometry.
- **Color Palette**:
  - *Dominant Canvas (60%)*: Crisp white (`#FFFFFF`) with whisper-soft lavender-gray canvas backgrounds (`#F8F9FD`).
  - *Structural Surfaces (30%)*: Glass-frosted cards (`rgba(255, 255, 255, 0.85)` with `backdrop-blur-md`), subtle slate hairlines (`#E2E8F0`), muted text (`#64748B`).
  - *Pastel Accents (10%)*: Soft lavender (`#8B5CF6`), mint emerald (`#10B981`), sky blue (`#0EA5E9`), and warm peach/rose (`#F43F5E`) used sparingly for focused interactive elements and category indicators.
- **Typography & Hierarchy**:
  - *Display Headings*: `Plus Jakarta Sans` or `Inter` in tight tracking (`font-semibold` / `font-bold`), clamped for fluid viewport scaling without headline orphans (`text-wrap: balance`).
  - *Body Prose*: High-legibility sans-serif with 1.6 line height and comfortable line measure.
  - *Data & Metrics*: Monospace with tabular figures (`tabular-nums`) for clean vertical alignment in stats and tables.
- **Top Bar Contract**:
  - Left Zone: Single text brand wordmark `GEN AI CLUB` with subtle institution subtitle `NIAT SANSKIRITI`.
  - Center Zone: Single-line nav links (`About`, `Projects`, `News`, `Events`).
  - Right Zone: Direct actions (`Student Login`, `Admin Login`, `Join Club`).
- **Interactive Feedback & Motion**:
  - Framer Motion transitions: smooth page cross-fades, card hover elevations, modal backdrops, animated counters, and custom toast notifications for all operations.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Firebase Auth + Firestore Dual Security Architecture**
  - *Chosen Approach*: User authentication credentials reside strictly in Firebase Auth. All student profile data, join requests, approval states, and admin roles reside in Firestore collections.
  - *Why*: Eliminates security risks associated with storing passwords in application databases while maintaining role-based access control (RBAC).
  - *Alternative Considered*: Custom token-based auth — discarded due to maintenance overhead, security surface area, and requirement to use Firebase.
- **Decision 2: Separation of Join Requests and Active Members**
  - *Chosen Approach*: New applicants create a Firebase Auth user and a document in `joinRequests` with `status: 'pending'`. Only upon executive approval is the member document written to `members` with `status: 'approved'`.
  - *Why*: Prevents unvetted users from reading internal announcements, interacting with private member data, or participating in club projects.
- **Decision 3: Administrative Role Bootstrapping**
  - *Chosen Approach*: `tripsnikhil@gmail.com` is pre-configured as the founding President in security rules and initialization blueprints. The President can add or remove Vice Presidents directly from the Admin settings UI.
  - *Why*: Avoids deadlock on new deployment while giving the club president full control to delegate executive tasks.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        GEN AI CLUB NIAT SANSKIRITI                     │
├────────────────────────────────────────────────────────────────────────┤
│                           Application Router                           │
│     ┌───────────────────┬───────────────────┬───────────────────┐      │
│     │   Public Portal   │  Student Portal   │   Admin Console   │      │
│     │ - Landing/Hero    │ - Auth Guard      │ - Executive Guard │      │
│     │ - Projects & News │ - Status Check    │ - Overview Stats  │      │
│     │ - Join Modal      │ - Profile Editor  │ - Join Requests   │      │
│     │ - Events Calendar │ - Club Resources  │ - Member Table    │      │
│     └─────────┬─────────┴─────────┬─────────┴─────────┬─────────┘      │
│               │                   │                   │                │
│     ┌─────────┴───────────────────┴───────────────────┴─────────┐      │
│     │                   Firebase Services Layer                 │      │
│     │  - Auth: email/password authentication & password reset   │      │
│     │  - Firestore: real-time collections & error interceptors │      │
│     │  - Security: ABAC rules + email verification checks       │      │
│     └─────────────────────────────┬─────────────────────────────┘      │
└───────────────────────────────────┼────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         Firestore Collections                          │
├────────────────────────────────────────────────────────────────────────┤
│ • admins/{uid}        : role ('president' | 'vice_president'), email  │
│ • joinRequests/{uid}  : name, rollNo, branch, year, phone, status     │
│ • members/{uid}       : member profile, skills, bio, approvedAt       │
│ • projects/{projectId}: title, techStack, status, team, links, images │
│ • news/{newsId}       : title, content, author, tag, publishedAt      │
│ • events/{eventId}    : title, date, location, description, rsvpLink │
│ • settings/club       : collegeName, contactEmail, socialLinks, banner│
└────────────────────────────────────────────────────────────────────────┘
```

### Data Schema Overview

1. `joinRequests/{uid}`:
   - `uid`: string (matches `request.auth.uid`)
   - `fullName`: string
   - `email`: string
   - `phone`: string
   - `rollNumber`: string
   - `branch`: string (e.g. CSE, AI & DS, ECE, ME, IT)
   - `year`: string (1st, 2nd, 3rd, 4th Year)
   - `skills`: string[]
   - `statement`: string (why they want to join)
   - `status`: `'pending'` | `'approved'` | `'rejected'`
   - `createdAt`: serverTimestamp
   - `reviewedAt`?: serverTimestamp
   - `reviewedBy`?: string

2. `members/{uid}`:
   - `uid`: string
   - `fullName`: string
   - `email`: string
   - `phone`: string
   - `rollNumber`: string
   - `branch`: string
   - `year`: string
   - `skills`: string[]
   - `bio`?: string
   - `githubUrl`?: string
   - `linkedinUrl`?: string
   - `status`: `'approved'`
   - `joinedAt`: serverTimestamp

3. `admins/{uid}`:
   - `uid`: string
   - `email`: string
   - `role`: `'president'` | `'vice_president'`
   - `assignedBy`?: string
   - `createdAt`: serverTimestamp

4. `projects/{projectId}`:
   - `id`: string
   - `title`: string
   - `description`: string
   - `category`: string (e.g. LLMs, Vision, Agents, Audio)
   - `status`: `'Ongoing'` | `'Completed'` | `'Upcoming'`
   - `techStack`: string[]
   - `teamMembers`: string[]
   - `githubUrl`?: string
   - `demoUrl`?: string
   - `imageUrl`?: string
   - `createdAt`: serverTimestamp

5. `news/{newsId}`:
   - `id`: string
   - `title`: string
   - `summary`: string
   - `content`: string
   - `category`: string
   - `author`: string
   - `publishedAt`: serverTimestamp

6. `events/{eventId}`:
   - `id`: string
   - `title`: string
   - `date`: string
   - `time`: string
   - `venue`: string
   - `description`: string
   - `rsvpUrl`?: string
   - `status`: `'Upcoming'` | `'Completed'`

7. `settings/club`:
   - `clubName`: string
   - `collegeName`: string
   - `contactEmail`: string
   - `tagline`: string
   - `instagramUrl`: string
   - `linkedinUrl`: string
   - `githubUrl`?: string

---

## 5. Security & Validation Blueprint

- **Input Sanitization**: Email format validation, phone number checks, password strength verification ($\ge 8$ chars, mixed case, numeric), character length bounds on all form fields.
- **Rate-Limiting & Lockout Feedback**: Client-side throttle on repeated failed login attempts with clear user guidance.
- **Strict Error Handling**: Custom `handleFirestoreError` throwing structured `FirestoreErrorInfo` per skill specifications.
- **Firestore Rules Enforcement**:
  - Catch-all `allow read, write: if false;`
  - Public can `read` `projects`, `news`, `events`, and `settings`.
  - Applicants can `create` and `read` their own `joinRequests` record (`request.auth.uid == uid`).
  - Members can `read` and `update` their own profile in `members`.
  - Admins (verified via `exists(/databases/$(database)/documents/admins/$(request.auth.uid))`) have write privileges across `projects`, `news`, `events`, `settings`, and can update `joinRequests` and `members`.
  - Only the President can modify the `admins` collection.

---

## 6. Implementation Stages & Verification Plan

1. **Firebase Setup Flow**:
   - Trigger `show_aistudio_ui` with `ui_type: "firebase_setup"` and verify user approval.
   - Run `ProvisionFirebase` RPC and configure `firebase-blueprint.json` and `firestore.rules`.
2. **Core Foundation & Styling**:
   - Establish Tailwind theme tokens, typography, soft pastel gradients, glassmorphism styles, and toast provider.
   - Configure Firebase client SDK (`src/lib/firebase.ts`) and custom error interceptor.
3. **Public Landing Experience**:
   - Dynamic Hero with NIAT SANSKIRITI branding, interactive 3-zone top bar, About Section, Live Project Portfolio, Newsfeed, and Footer.
4. **Join the Club Experience**:
   - Multi-step validated application modal, account creation, duplicate roll number check, and pending receipt screen.
5. **Student Authentication & Portal**:
   - Dedicated Student Login, password recovery, request status gate, member dashboard, and profile editor.
6. **Executive Admin Dashboard**:
   - Admin login gate with role verification, KPI metrics overview, join request triage (Approve/Reject), member directory with search and CSV export, project manager, news publisher, event coordinator, and admin roster control.
7. **Testing & Verification**:
   - Complete compilation check via `compile_applet`.
   - Comprehensive error-handling and responsive layout verification across mobile, tablet, and responsive viewports.
