GENESIS PLATFORM — Complete System Documentation for Claude Code
═══════════════════════════════════════════════
1. PROJECT IDENTITY
═══════════════════════════════════════════════
Project Name: Genesis
Full Title: Design and Implementation of a Secure Hybrid Crowdfunding and Equity Investment Platform to Boost African Innovation
Type:  HIgh end production-grade app and final year project
Team Size: 1 members
Defense: Panel of 3 lecturers including supervisor
What Genesis Is:
Genesis is Africa's first hybrid platform that combines TWO funding models simultaneously on the same project:

Equity Investment — investors buy ownership stakes (equity) in startups
Direct Crowdfunding — backers contribute money without receiving equity

A creator (startup founder) posts ONE project and can receive BOTH types of funding at the same time. Every equity investment goes through a full legal lifecycle: negotiation → deal → payment → escrow → PDF agreement signing → admin validation → fund release → shareholder record.

Scrollable facebook-like home feed where where each actors can see all project posted and admmin validated on the platform and perform the different action specifique to thier roles , invest on this project(for investor) , fund this project (for backers) , 

═══════════════════════════════════════════════
2. THE FOUR ACTORS & THEIR ROLES
═══════════════════════════════════════════════
🔵 CREATOR (Startup Founder)
The creator is someone with a business idea who needs capital. They:

Register and get verified by admin before they can post
Post projects with: title, description, category, target amount, deadline, company valuation, equity percentage available, cover image
Can enable/disable equity investment and/or direct crowdfunding per project
Receive investment requests from investors
Negotiate terms (counter-offer back and forth) with investors in a chat-like negotiation panel
Accept or reject investment requests after admin approves them
Download auto-generated PDF legal agreement, sign it physically, upload the signed copy
Get funds released to their wallet after admin validates both signatures
Track their wallet balance, active deals, escrow status, shareholder records

Creator Dashboard Pages:

Home — stats overview (funds raised, projects, deals, pending requests)
Projects — list + create new project (multipart form with cover image)
Requests — split panel: list of investment requests on left, negotiation chat + counter offer + accept/reject on right
Deals — table of all accepted deals with status tracking
Agreements — 4-step process: download PDF → sign physically → upload signed copy
Wallet — available balance + escrow balance + transaction history
Profile — avatar, bio, skills, ID card upload, proof of address upload, verification status
Home feed — to view all other creator project on the platform but can only comment like and save 


🟡 INVESTOR
The investor is someone with capital who wants equity ownership in African startups. They:

Register and get verified by admin before they can invest
Browse approved public projects
Send investment requests specifying: amount, equity percentage requested, message
Wait for admin to approve the request before creator sees it
Negotiate with creator (send counter-offers, receive creator's counter-offers)
Pay into escrow once creator accepts the deal
Download the auto-generated PDF agreement
Sign the agreement and upload it
Become a shareholder after funds are released
Track portfolio: investments made, equity owned, deal statuses
Home feed — to view all project posted on the plaftform

Investor Dashboard Pages (Not completed yet , TO BE BUILT):

Home — portfolio overview (total invested, equity owned, active deals)
Browse Projects — public project discovery with filters
My Investments — list of all investment requests and their statuses
Deals — active deals with payment status
Agreements — download + upload signed agreement
Wallet — payment history
Profile — documents, verification


🟢 BACKER
The backer is a supporter who contributes money to projects they believe in WITHOUT receiving equity. Simple, no negotiation, no legal complexity. They:

Register (no verification required to back projects)
Browse approved public projects
Click "Fund" and contribute any amount
Receive updates on projects they backed
Track their backing history

Backer Dashboard Pages (TO BE BUILT):

Home — total backed, projects supported
Discover — browse public projects
My Contributions — history of all backed projects
Profile


🔴 ADMIN
The admin is the platform operator who controls and validates everything. The admin is the trust layer of the platform. They:

Verify user identities (review ID + proof of address documents)
Approve or reject user accounts
Suspend users who violate platform rules
Review and approve/reject/suspend projects
Review and approve/reject investment requests (before creator sees them)
Monitor all escrows across the platform
Validate escrow when both creator and investor have signed the agreement
Release funds from escrow to creator's wallet after validation
Has full platform oversight

Admin Dashboard Pages (BUILT):

Home — platform overview (pending counts, recent activity, escrow table)
Users — verify/approve/reject/suspend users, view submitted documents
Projects — approve/reject/suspend pending projects
Investments — approve/reject investment requests
Escrows — validate agreements, release funds


═══════════════════════════════════════════════
3. THE FULL INVESTMENT LIFECYCLE (Critical Flow)
═══════════════════════════════════════════════
This is the core business logic of Genesis. Every equity investment follows these exact steps:
STEP 1: Creator posts project (pending admin approval)
         ↓
STEP 2: Admin approves project (now visible to investors)
         ↓
STEP 3: Investor sends investment request
         { amount, equityRequested, message }
         ↓
STEP 4: Admin reviews and approves the investment request
         (creator cannot see request until admin approves it)
         ↓
STEP 5: Creator sees approved request → can negotiate
         → Creator or Investor sends counter-offers back and forth
         → Each counter-offer has: amount, equity%, message
         ↓
STEP 6: Creator accepts the request → DEAL IS CREATED automatically
         ↓
STEP 7: Investor pays the agreed amount → funds go into ESCROW
         (money is locked, neither party can access it yet)
         ↓
STEP 8: Auto-generated PDF legal agreement is created
         → Both parties can download the PDF
         → Creator uploads signed copy
         → Investor uploads signed copy
         ↓
STEP 9: Admin reviews both signatures → VALIDATES the escrow
         ↓
STEP 10: Admin RELEASES funds from escrow → money goes to Creator's wallet
          → Platform takes its fee (5%)
          → Shareholder record is created: Investor now owns X% equity
          ↓
STEP 11: Deal is ACTIVE — investor is a shareholder
Escrow Status Flow:
created → awaiting_payment → payment_completed → awaiting_signatures → awaiting_validation → validated → released
Deal Status Flow:
created → awaiting_payment → payment_completed → awaiting_signatures → active → cancelled

═══════════════════════════════════════════════
4. BUSINESS RULES & CONDITIONS
═══════════════════════════════════════════════
User Verification Rules

Creators and Investors MUST be verified before they can use the platform
Backers do NOT need verification to fund projects
Users submit: ID card + proof of address
Admin approves/rejects based on document review
Suspended users cannot perform any actions
verificationStatus: "pending" | "verified" | "rejected"

Project Rules

Only verified creators can post projects
Projects must be approved by admin before they appear publicly
A project can have both allowInvestment:true and allowFunding:true simultaneously
approvalStatus: "pending" | "approved" | "rejected" | "suspended"
Deadline must be a future date
equityAvailable must be between 0-100%
valuation is the total company valuation (used to calculate equity price)

Investment Request Rules

Only verified investors can send requests
Admin must approve the request BEFORE the creator sees it
adminStatus: "pending" | "approved" | "rejected"
creatorStatus: "pending" | "accepted" | "rejected"
negotiationStatus: "open" | "countered" | "accepted" | "rejected"
Only ONE active request per investor per project at a time
Counter-offers keep full history (negotiation messages)

Escrow Rules

Funds are LOCKED in escrow until admin validates
Platform fee is 5% (taken from escrow on release)
Creator receives: amount × (1 - platformFeePercent/100)
Escrow can only be validated AFTER both parties signed the agreement
Admin validates → Admin releases (two separate actions)
Once released, funds go to creator wallet and shareholder record is created

Negotiation Rules

Both creator and investor can send counter-offers
Each message has: role (creator/investor), amount, equity%, message, timestamp
Counter-offers are tracked in full history
Once creator accepts → negotiation ends → deal created


═══════════════════════════════════════════════
5. TECH STACK
═══════════════════════════════════════════════
Frontend

React 18 with Vite 8
Tailwind v4 with @tailwindcss/vite plugin
React Router v6 — nested routes with /* pattern
Zustand — global state, persisted to localStorage
Lucide React — all icons (installed with --legacy-peer-deps)
Axios — HTTP client with JWT interceptor
react-hook-form — form validation (Login/Register only)

Backend (separate project, running locally)

Node.js + Express — REST API
MongoDB + Mongoose — database
JWT — authentication (Bearer token in Authorization header)
Multer — file uploads (cover images, documents, signed agreements)
PDFKit — auto-generates legal PDF agreements
bcrypt — password hashing

Backend URL
http://localhost:8080/api/v1
Frontend Dev URL
http://localhost:5173

═══════════════════════════════════════════════
6. CRITICAL FRONTEND RULES — NEVER VIOLATE
═══════════════════════════════════════════════
Rule 1: 100% INLINE STYLES — NO TAILWIND CLASSES IN JSX
jsx// ✅ CORRECT
<div style={{ display:"flex", alignItems:"center", gap:16, background:"#F5F3FF" }}>

// ❌ WRONG — will break the layout
<div className="flex items-center gap-4 bg-purple-50">
Why: Tailwind v4 with @tailwindcss/vite does not generate utility classes reliably. All styling must be inline. The ONLY exception is index.css which has global @keyframes and a few .spinner, .gradient-text utility classes.
Rule 2: LUCIDE REACT ICONS ONLY — NO EMOJIS
jsx// ✅ CORRECT
import { Bell, LogOut, User, CheckCircle } from "lucide-react";
<Bell size={18} color="#7C3AED" />

// ❌ WRONG
<span>🔔</span>
Rule 3: FONT FAMILIES
Always use these two font stacks inline:
jsconst F = {
  jakarta: "'Plus Jakarta Sans',sans-serif",   // headings, labels, numbers
  dm:      "'DM Sans',sans-serif",             // body text, descriptions
};
Rule 4: COLOR PALETTE
jsconst COLORS = {
  primary:     "#7C3AED",   // purple — main brand
  primaryDark: "#6D28D9",
  primaryDeep: "#4C1D95",
  primaryLight:"#EDE9FE",
  muted:       "#A78BFF",
  ink:         "#0D0621",   // near-black for text
  surface:     "#FAFAFF",   // page background
  white:       "#FFFFFF",
  // Status colors
  green:       "#059669",   greenBg: "#D1FAE5",
  red:         "#DC2626",   redBg:   "#FEE2E2",
  amber:       "#D97706",   amberBg: "#FEF3C7",
  blue:        "#2563EB",   blueBg:  "#DBEAFE",
};
Rule 5: CARD PATTERN
All cards follow this base style:
jsconst card = {
  background: "white",
  borderRadius: 20,
  boxShadow: "0 2px 16px rgba(124,58,237,0.06)",
  padding: 24
};
Rule 6: HOVER EFFECTS
Use onMouseEnter/onMouseLeave with e.currentTarget.style:
jsx<div
  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(124,58,237,0.12)"; }}
  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(124,58,237,0.06)"; }}
>
Rule 7: LOADING SPINNER PATTERN
jsx<div style={{ width:32, height:32, border:"3px solid rgba(124,58,237,0.2)", borderTopColor:"#7C3AED", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
<style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
Rule 8: NO FORM TAGS
Never use HTML <form> tags in React components. Use onSubmit pattern with a div or handle button clicks directly.

═══════════════════════════════════════════════
7. FILE STRUCTURE
═══════════════════════════════════════════════
genesis-frontend/
├── CLAUDE.md
├── index.html                    ← Google Fonts <link> tags here
├── .env                          ← VITE_API_URL=http://localhost:8080/api/v1
├── vite.config.js
├── package.json
└── src/
    ├── index.css                 ← @import url() BEFORE @import "tailwindcss"
    ├── main.jsx
    ├── App.jsx                   ← All routes defined here
    ├── api/
    │   ├── axios.js              ← Base config + JWT interceptor
    │   ├── creator.js            ← All creator API calls
    │   └── admin.js              ← All admin API calls
    ├── store/
    │   └── authStore.js          ← Zustand: { user, token, isAuthenticated, login, logout }
    ├── components/
    │   └── ProtectedRoute.jsx    ← Role-based route guard
    └── pages/
        ├── LandingPage.jsx       ✅ COMPLETE
        ├── LoginPage.jsx         ✅ COMPLETE — connected to backend
        ├── RegisterPage.jsx      ✅ COMPLETE
        ├── creator/
        │   ├── CreatorLayout.jsx ✅ COMPLETE — sidebar + topbar
        │   ├── CreatorHome.jsx   ✅ COMPLETE
        │   ├── CreatorProjects.jsx ✅ COMPLETE
        │   ├── CreatorRequests.jsx ✅ COMPLETE
        │   ├── CreatorDeals.jsx  ✅ COMPLETE
        │   ├── CreatorAgreements.jsx ✅ COMPLETE
        │   ├── CreatorWallet.jsx ✅ COMPLETE
        │   └── CreatorProfile.jsx ✅ COMPLETE
        ├── admin/
        │   ├── AdminLayout.jsx   ✅ COMPLETE — dark sidebar
        │   ├── AdminHome.jsx     ✅ COMPLETE
        │   ├── AdminUsers.jsx    ✅ COMPLETE
        │   ├── AdminProjects.jsx ✅ COMPLETE
        │   ├── AdminInvestments.jsx ✅ COMPLETE
        │   └── AdminEscrows.jsx  ✅ COMPLETE
        ├── investor/             ❌ NOT BUILT YET
        │   ├── InvestorLayout.jsx
        │   ├── InvestorHome.jsx
        │   ├── InvestorBrowse.jsx
        │   ├── InvestorRequests.jsx
        │   ├── InvestorDeals.jsx
        │   ├── InvestorAgreements.jsx
        │   ├── InvestorWallet.jsx
        │   └── InvestorProfile.jsx
        └── backer/               ❌ NOT BUILT YET
            ├── BackerLayout.jsx
            ├── BackerHome.jsx
            ├── BackerDiscover.jsx
            ├── BackerContributions.jsx
            └── BackerProfile.jsx

═══════════════════════════════════════════════
8. ROUTING (App.jsx)
═══════════════════════════════════════════════
/                          → LandingPage (public)
/login                     → LoginPage (guest only — AuthGuard redirects logged-in users)
/register                  → RegisterPage (guest only)
/creator/dashboard/*       → CreatorLayout (role: creator only)
/admin/dashboard/*         → AdminLayout (role: admin only)
/investor/dashboard/*      → InvestorLayout (role: investor only) ← TO BUILD
/backer/dashboard/*        → BackerLayout (role: backer only)     ← TO BUILD
*                          → Navigate to /
After login, users are redirected based on user.userType:

admin    → /admin/dashboard
creator  → /creator/dashboard
investor → /investor/dashboard
backer   → /backer/dashboard


═══════════════════════════════════════════════
9. ALL BACKEND API ENDPOINTS
═══════════════════════════════════════════════
Authentication
POST   /Auth/registration              — register new user
POST   /Auth/login                     — login, returns JWT token + user object
POST   /Auth/logout                    — logout (requires auth)
Profile
PUT    /profile/Createprofile          — complete/update user profile
Public Projects
GET    /publicProject                  — list all approved projects
GET    /publicProject/:id              — single project details
POST   /publicProject/:id/comments     — add comment
GET    /publicProject/:id/comments     — get comments
POST   /publicProject/:id/like         — toggle like
POST   /publicProject/:id/save         — toggle save
POST   /publicProject/:id/comments/:commentId        — edit comment
DELETE /publicProject/:id/comments/:commentId        — delete comment
POST   /publicProject/:id/comments/:commentId/replies       — add reply
PUT    /publicProject/:id/comments/:commentId/replies/:replyId — edit reply
DELETE /publicProject/:id/comments/:commentId/replies/:replyId — delete reply
Creator
GET    /creator/dashboard              — dashboard stats
GET    /creator/investments/PendingInvestmentRequests — pending requests
PATCH  /creator/investments/accept/:id — accept investment request
PATCH  /creator/investments/reject/:id — reject investment request (inferred)
Projects (Creator)
POST   /project/Createprojects         — create project (multipart/form-data)
PATCH  /project/:id                    — update project
Negotiation
POST   /negotiation/:requestId/counter — send counter offer { amount, equity, message }
GET    /negotiation/:requestId/messages — get all negotiation messages
POST   /negotiation/:requestId/message  — send plain message
Funding (Backer)
POST   /projectsFunding/projects/:projectId/fund — fund a project { amount }
Investment (Investor)
POST   /investment/projects/:projectId/invest — send investment request
       Body: { amount, equityRequested, message }
Payment (Investor)
POST   /payment/deal/:dealId/pay       — investor pays deal into escrow
GET    /payment                        — get all deals for current user
GET    /payment/:dealId                — get single deal
Agreements
GET    /agreements/:escrowId/download      — download PDF agreement
GET    /agreements/:escrowId/view-agreement — view PDF in browser
POST   /agreements/:escrowId/investor-sign  — investor uploads signed copy (multipart)
POST   /agreements/:escrowId/creator-sign   — creator uploads signed copy (multipart)
GET    /agreements/:escrowId/status         — check agreement signing status
Wallet
GET    /wallet                         — get wallet balance + transactions (inferred)
Notifications
GET    /notifications                  — get notifications (inferred)
PATCH  /notifications/read-all         — mark all as read (inferred)
Admin — User Verification
GET    /admin/verification             — get all pending users
GET    /admin/verification/:id         — get specific user details
PATCH  /admin/verification/approuve/:id — approve user
PATCH  /admin/verification/reject/:id  — reject user
PUT    /admin/users/suspend/:id        — suspend user
PUT    /admin/users/unsuspend/:id      — unsuspend user
Admin — Projects
GET    /admin/Projects/GetPendingProject    — get pending projects
PATCH  /admin/Projects/approuve/:id         — approve project
PATCH  /admin/Projects/reject/:id           — reject project
PATCH  /admin/Projects/suspend/:id          — suspend project
Admin — Investment Requests
GET    /AdminInvestmentRequest/investment-requests      — all investment requests
PUT    /AdminInvestmentRequest/investments/:id/approuve — approve request
PUT    /AdminInvestmentRequest/investments/:id/reject   — reject request
Admin — Escrows
GET    /admin/escrows                        — all escrows
PATCH  /admin/escrows/:escrowId/validate     — validate (after both signed)
PATCH  /admin/escrows/:escrowId/release      — release funds to creator

═══════════════════════════════════════════════
10. ZUSTAND AUTH STORE SHAPE
═══════════════════════════════════════════════
js// authStore.js shape
{
  user: {
    _id: string,
    name: string,
    email: string,
    userType: "admin" | "creator" | "investor" | "backer",
    verificationStatus: "pending" | "verified" | "rejected",
    // ... other profile fields
  },
  token: string,        // JWT token
  isAuthenticated: boolean,
  isLoading: boolean,
  error: string | null,

  // Actions
  login(email, password) → { success, user }
  register(data) → { success }
  logout() → void
  clearError() → void
}
Token is automatically attached to every request via axios interceptor:
Authorization: Bearer <token>

═══════════════════════════════════════════════
11. KNOWN ISSUES & SOLUTIONS
═══════════════════════════════════════════════
IssueSolutionTailwind v4 classes not generatingUse 100% inline styles — never use className for layoutPostCSS @import errorIn index.css: put @import url(...) BEFORE @import "tailwindcss"lucide-react install failsUse npm install lucide-react --legacy-peer-depsVite 8 peer conflictsAlways use --legacy-peer-deps for new packagesCORS error from backendBackend must allow http://localhost:5173 in CORS origins401 on protected routesCheck JWT token in localStorage under "auth-storage" key

═══════════════════════════════════════════════
12. DESIGN SYSTEM REFERENCE
═══════════════════════════════════════════════
Sidebar Colors

Creator sidebar: linear-gradient(180deg,#7C3AED,#4C1D95) — purple
Admin sidebar:   linear-gradient(180deg,#0D0621,#1a0a3d) — near-black
Investor sidebar: linear-gradient(180deg,#1e3a5f,#0f2440) — dark blue (suggestion)
Backer sidebar:  linear-gradient(180deg,#065f46,#022c22) — dark green (suggestion)

Status Badge Colors
jsapproved / success:  bg "#D1FAE5", color "#059669"
pending / warning:   bg "#FEF3C7", color "#D97706"
rejected / error:    bg "#FEE2E2", color "#DC2626"
info / review:       bg "#DBEAFE", color "#2563EB"
purple / platform:   bg "#EDE9FE", color "#7C3AED"
Border Radius Scale
Buttons:    borderRadius: 12
Cards:      borderRadius: 20
Modals:     borderRadius: 24
Badges:     borderRadius: 100 (pill)
Icon boxes: borderRadius: 10-14
Shadow Scale
Card default:  "0 2px 16px rgba(124,58,237,0.06)"
Card hover:    "0 12px 40px rgba(124,58,237,0.12)"
Sidebar:       "4px 0 24px rgba(76,29,149,0.2)"
Modal:         "0 40px 100px rgba(0,0,0,0.25)"

═══════════════════════════════════════════════
13. WHAT TO BUILD NEXT (Priority Order) (started but not completed , should be connected to backend)
═══════════════════════════════════════════════

Investor Dashboard (highest priority)(started but not completed , not connected to backend)

InvestorLayout (dark blue sidebar)
InvestorHome (portfolio stats: total invested, equity owned, active deals)
InvestorBrowse (public project discovery, filter by category/country)
InvestorRequests (my sent requests + negotiation panel — mirror of CreatorRequests)
InvestorDeals (deals I've entered, payment status)
InvestorAgreements (download PDF, upload signed copy)
InvestorWallet (payment history)
InvestorProfile (documents, verification)


Backer Dashboard (second priority) (started but not completed , should be connected to backend)

BackerLayout (dark green sidebar)
BackerHome (total backed, projects supported)
BackerDiscover (browse public projects + fund button)
BackerContributions (history of contributions)
BackerProfile


Connect remaining pages to backend

Some pages still use mock data — replace with real API calls


Architecture & DevOps (to be done later, when the whole plateform is functioning)

Docker, Kubernetes (K3s), CI/CD with Jenkins
Prometheus + Grafana monitoring
Ansible playbooks
Architecture documentation (UML diagrams)