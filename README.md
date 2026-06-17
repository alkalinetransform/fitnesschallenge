# AlkalineFitness (Fitness Challenge)

AlkalineFitness is a full‑stack web app for a **single gym location** to run a **team-based fitness competition** with weekly challenges, points, QR check-ins, and leaderboards.

- **Admins**: manage the competition (weeks, challenges, teams, players), message participants, print a QR check-in code, and end/lock a season.
- **Players**: sign up for a gym, complete challenges, earn points for themselves + their team, check in at the gym, and track “before vs after” metrics.

Production example: `https://alkalinefitness.vercel.app`

## Features

- **Auth & roles**: email/password login (players + admins), admin-only routes, frozen-account handling
- **Competition workflow**: active week selection, season end + archives
- **Challenges**: create/delete weekly point tasks, player completion confirmation + confetti celebration
- **Teams**: generate balanced teams, team icons, manual team assignment changes
- **Leaderboards**: team standings + per-team player rankings
- **Admin messaging**: in-app popup announcements and optional email delivery
- **Gym QR check-in**: scan at the gym → weekly progress + streak badges
- **Player “Me” tab**: baseline profile metrics, frequent activities, transformation wrap + replay for past competitions
- **Password reset**: forgot-password email flow + in-session password change

## Tech stack

- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS
- **Backend**: Next.js Server Components + Server Actions + Route Handlers
- **Auth**: Auth.js (NextAuth v5) Credentials provider + bcrypt password hashing
- **Database**: PostgreSQL (Neon) + Prisma ORM
- **Email**: Nodemailer (Gmail App Password or SMTP URL)
- **Hosting**: Vercel (app) + Neon (Postgres)

## Architecture (how it works)

This repo is a single Next.js app that includes both the UI and server-side logic:

- **Pages / routing**: `src/app/**` (App Router)
- **UI components**: `src/components/**`
- **Server actions**: `src/actions/**` (mutations like login, create challenge, send message)
- **Database access**: Prisma client in `src/lib/db.ts`
- **Auth + session**: `src/auth.ts`, `src/auth.config.ts`, and route protection in `src/middleware.ts`
- **Schema**: `prisma/schema.prisma` (PostgreSQL models)

## Codebase layout

- `src/app/`
  - `login/`, `register/`, `forgot-password/`, `reset-password/`
  - `admin/(dashboard)/…` (admin UI pages)
  - `dashboard/…` (player UI pages)
  - `leaderboard/…`
  - `check-in/[token]/route.ts` (QR check-in endpoint)
- `src/actions/` – server actions (auth, teams, challenges, messages, password reset, profile)
- `src/components/` – UI (tabs, forms, leaderboard, QR print, confetti, mascot, etc.)
- `src/lib/` – shared logic (db, scoring, weeks, gym maintenance, email helpers)
- `prisma/` – schema + migrations + seed script
- `scripts/` – helper scripts for production DB setup and utilities

## Key flows

### Player signup → baseline stats

1. Player registers at `/register`
2. App auto-signs-in and shows a welcome splash
3. Player completes the baseline metrics wizard (steps, water, skeletal muscle mass, weight, body fat %)

### Points & leaderboards

- Completing a challenge creates a `Completion` record.
- Leaderboards are calculated via aggregation queries (see `src/lib/scores.ts`).

### Admin messaging (popup + optional email)

- Admin sends a message from `/admin` (broadcast all or targeted).
- Players see the latest undismissed message as a popup on the dashboard.
- Email sending uses Nodemailer. If email credentials aren’t configured, the app logs the email link/body to the server console in dev.

### Password reset

- `/forgot-password` sends a reset link to the user’s email (token stored on `User` with a 1-hour expiration).
- `/reset-password?token=…` lets the user set a new password.
- Logged-in players can also change their password from the **Me → Account** section.

### QR gym check-in

- Admin prints a QR code from `/admin` which encodes `/check-in/<gymSecret>`.
- Scanning and visiting that URL records a gym visit (one per calendar day).
- Weekly progress and streaks appear on the player dashboard.

## Environment variables

Copy `.env.example` → `.env` for local dev.

Required:

- `DATABASE_URL`: PostgreSQL connection string (Neon or local)
- `AUTH_SECRET`: long random secret (32+ chars)
- `AUTH_URL` (or `NEXTAUTH_URL`): base URL for generating email links (local or production)

Email (optional but recommended for production):

- `ADMIN_FROM_EMAIL`: “From” address for emails (defaults to `alkalinetransform@gmail.com`)
- `GMAIL_USER`: Gmail account (optional; defaults to `ADMIN_FROM_EMAIL`)
- `GMAIL_APP_PASSWORD`: Gmail App Password (recommended)
- `SMTP_URL`: alternative SMTP transport (if set, it’s used instead of Gmail)

## Local development

Prerequisites:

- Node.js 20+
- npm

Install dependencies:

```bash
npm install
```

Create `.env`:

```bash
cp .env.example .env
```

Start the local dev database (no Docker required):

```bash
npm run db:dev
```

Then run migrations and seed (optional):

```bash
npm run db:migrate
npm run db:seed
```

Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Deploy (Vercel + Neon)

### 1) Create Neon database

1. Create a Neon project and copy the connection string.
2. Prefer the **pooled** connection string for serverless usage.

### 2) Create Vercel project

1. Import this repo into Vercel.
2. Set environment variables in Vercel:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `AUTH_URL` / `NEXTAUTH_URL` (your Vercel domain)
   - Email vars (optional): `GMAIL_APP_PASSWORD`, `ADMIN_FROM_EMAIL`, etc.

### 3) Initialize / migrate production database

From your machine, run against Neon (PowerShell example):

```powershell
$env:DATABASE_URL = "your-neon-connection-string"
npx prisma migrate deploy
```

If your Neon database already has tables (Prisma may fail with **P3005**), use the helper:

```powershell
$env:DATABASE_URL = "your-neon-connection-string"
npm run db:production-setup
```

### 4) Deploy

When you push to the production branch, Vercel will build and deploy automatically.

## Useful scripts

- `npm run db:dev` – start a local Postgres for development
- `npm run db:migrate` – run Prisma migrations locally
- `npm run db:seed` – seed demo data
- `npm run db:production-setup` – apply migration SQL + baseline Prisma history + seed (Neon-friendly)
- `npm run db:check` – diagnose Neon/Postgres connectivity
- `npm run db:clear-messages` – delete all broadcast messages (admin announcements) from the database

## Routes (high level)

| Path | Purpose |
|------|---------|
| `/` | Landing page |
| `/login` | Login |
| `/register` | Player signup |
| `/register/admin` | Admin signup (invite code + email verification flow) |
| `/forgot-password` | Request password reset |
| `/reset-password` | Set a new password via emailed token |
| `/admin` | Admin dashboard |
| `/admin/challenges` | Challenge management |
| `/admin/teams` | Team management |
| `/admin/players` | Player management (freeze/delete) |
| `/dashboard` | Player challenges + team summary |
| `/dashboard/me` | Player baseline + wrap + history |
| `/leaderboard` | Leaderboards |

Demo invite code (if seeded): `SQUEEZE-DEMO`
