# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Detailed documentation lives in sub-project files:
> - `backend/claude.md` — backend routes, architecture, models
> - `frontend/genesis-frontend/claude.md` — full frontend rules, design system, API reference

---

## What is Genesis

Africa's first hybrid crowdfunding + equity investment platform. A single project can receive **both** direct crowdfunding (backers) **and** equity investment (investors) simultaneously.

Four actors: **Creator** (startup founder), **Investor** (equity buyer), **Backer** (crowdfunder), **Admin** (platform operator).

---

## Running the Project

### Backend
```bash
cd backend
npm install
npm run dev          # nodemon, http://localhost:8080
npm run seed:admin   # seed the default admin account
```

### Frontend
```bash
cd frontend/genesis-frontend
npm install --legacy-peer-deps   # always use --legacy-peer-deps
npm run dev      # Vite, http://localhost:5173
npm run build
npm run lint
```

> **Always use `--legacy-peer-deps`** when installing any npm package in the frontend — Vite 8 + React 19 have peer conflicts.

---

## Architecture

```
GENESIS PROJECT/
├── backend/                   Node.js + Express + MongoDB (port 8080)
│   ├── config/                env.js, redis.js, cloudinary.js
│   ├── database/db.js         Mongoose connection
│   ├── models/                13 Mongoose models (discriminator pattern for users)
│   ├── controllers/           Business logic (18 files)
│   ├── routes/                REST routes mounted at /api/v1 (18 files)
│   ├── middlewares/           Auth (JWT), error handling, validation
│   └── index.js               Express entry point
│
├── frontend/genesis-frontend/ React 19 + Vite 8 (port 5173)
│   └── src/
│       ├── App.jsx            All routes defined here
│       ├── api/               axios.js (base + JWT interceptor), creator.js, investor.js, admin.js
│       ├── store/authStore.js Zustand auth (persisted to localStorage as "genesis_auth")
│       ├── components/ProtectedRoute.jsx  Role-based route guard
│       └── pages/             creator/ admin/ investor/ backer/ + public pages
│
└── mobile/                    React Native Expo (minimal, not active)
```

### Backend patterns
- Layered: `routes → controllers → services → models → MongoDB`
- User model uses **Mongoose discriminator** pattern: base `Users` model with `userType` key; specialized models `Creator`, `Investor`, `Backer`, `Admin`
- Environment loaded from `.env.{NODE_ENV}.local` via `config/env.js`
- JWT is stateless (30d expiry); no sessions. Auth middleware injects `req.user`.
- Redis used for caching (optional, not critical for dev)
- Payments: `PAYMENT_MODE=mvp` bypasses real Stripe in development

### Frontend patterns
- All routing in `App.jsx`; nested layouts use `<Outlet />` with `/*` path pattern
- Auth state in Zustand (`authStore.js`), token auto-attached by axios interceptor
- After login, redirect based on `user.userType`: `admin→/admin/dashboard`, `creator→/creator/dashboard`, `investor→/investor/dashboard`, `backer→/backer/dashboard`
- API base URL: `VITE_API_URL` env var (defaults to `http://localhost:8080/api/v1`)

---

## The Investment Lifecycle (Core Business Logic)

Every equity investment follows these exact steps — understanding this is required before touching any investment/escrow/deal/agreement code:

```
Creator posts project → Admin approves project → Investor sends request
→ Admin approves request (creator cannot see it until then)
→ Creator negotiates (counter-offers back and forth)
→ Creator accepts → Deal auto-created
→ Investor pays → Funds locked in Escrow
→ PDF agreement auto-generated → Both parties sign + upload
→ Admin validates escrow → Admin releases funds
→ Creator wallet credited (minus 5% fee) → Investor becomes shareholder
```

**Escrow statuses:** `created → awaiting_payment → payment_completed → awaiting_signatures → awaiting_validation → validated → released`

---

## Critical Frontend Rules

These rules are **absolute** — violating them breaks the UI:

### 1. 100% Inline Styles — No Tailwind Classes in JSX
```jsx
// ✅ CORRECT
<div style={{ display: "flex", alignItems: "center", gap: 16 }}>

// ❌ WRONG — Tailwind v4 with @tailwindcss/vite does not generate utility classes reliably
<div className="flex items-center gap-4">
```
Exception: `index.css` only — global `@keyframes`, `.spinner`, `.gradient-text`.

### 2. Lucide React Icons Only — No Emojis
```jsx
import { Bell, CheckCircle } from "lucide-react";
<Bell size={18} color="#7C3AED" />   // ✅
<span>🔔</span>                       // ❌
```

### 3. No HTML `<form>` Tags
Handle submissions via button `onClick` handlers, not form `onSubmit`.

### 4. Design System Constants
```js
const F = {
  jakarta: "'Plus Jakarta Sans',sans-serif",  // headings, labels
  dm:      "'DM Sans',sans-serif",            // body text
};

const COLORS = {
  primary: "#7C3AED", primaryDark: "#6D28D9", primaryDeep: "#4C1D95",
  primaryLight: "#EDE9FE", muted: "#A78BFF",
  ink: "#0D0621", surface: "#FAFAFF", white: "#FFFFFF",
  green: "#059669", greenBg: "#D1FAE5",
  red: "#DC2626",   redBg: "#FEE2E2",
  amber: "#D97706", amberBg: "#FEF3C7",
  blue: "#2563EB",  blueBg: "#DBEAFE",
};

// Card base
{ background: "white", borderRadius: 20, boxShadow: "0 2px 16px rgba(124,58,237,0.06)", padding: 24 }

// Border radius: buttons=12, cards=20, modals=24, badges=100
```

### 5. Hover Effects
```jsx
onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(124,58,237,0.12)"; }}
onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(124,58,237,0.06)"; }}
```

### 6. Sidebar Gradients by Role
```
Creator:  linear-gradient(180deg,#7C3AED,#4C1D95)  — purple
Admin:    linear-gradient(180deg,#0D0621,#1a0a3d)  — near-black
Investor: linear-gradient(180deg,#1e3a5f,#0f2440)  — dark blue
Backer:   linear-gradient(180deg,#065f46,#022c22)  — dark green
```

---

## Completion Status

| Area | Status |
|------|--------|
| Landing, Login, Register | Complete |
| Creator Dashboard (7 pages) | Complete + backend connected |
| Admin Dashboard (5 pages) | Complete + backend connected |
| Central Feed + Project Detail | Complete |
| **Investor Dashboard** | Started, NOT connected to backend |
| **Backer Dashboard** | Started, NOT connected to backend |
| Mobile app | Minimal stub only |

---

## Environment Setup

**Backend** — create `backend/.env.development.local`:
```
PORT=8080
MONGO_URI=<mongodb atlas connection string>
JWT_SECRET=<secret>
JWT_EXPIRES_IN=30d
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
PAYMENT_MODE=mvp
EMAIL_USER=<gmail>
EMAIL_PASS=<app password>
ADMIN_EMAIL=<email>
ADMIN_PASSWORD=<password>
ADMIN_NAME=<name>
BASE_URL=http://localhost:8080
```

**Frontend** — `frontend/genesis-frontend/.env`:
```
VITE_API_URL=http://localhost:8080/api/v1
```
