# Fitness Challenge

A simple web app for gym locations to run weekly fitness challenges with teams and leaderboards.

- **Gym admins** create a location, set the active week, manage weekly challenges, and generate random equal teams.
- **Players** join a gym, check off completed challenges, and earn points for themselves and their team.
- **Leaderboards** show team standings and per-team player rankings for the active week.

## Tech stack

- Next.js 15 (App Router) + TypeScript
- PostgreSQL + Prisma
- Auth.js (NextAuth v5) with email/password
- Tailwind CSS

## Prerequisites

- Node.js 20+ and npm
- PostgreSQL database ([Neon](https://neon.tech) free tier works well)

## Local setup

1. **Install dependencies**

   ```bash
   cd fitness-challenge
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your `DATABASE_URL` and a random `AUTH_SECRET` (32+ characters).

3. **Start local database** (no Docker/Neon required for dev)

   ```bash
   npm run db:dev
   ```

   Use this `DATABASE_URL` in `.env` (see `.env.example` comment):

   ```
   postgres://postgres:postgres@localhost:51214/template1?sslmode=disable&pgbouncer=true
   ```

   The `pgbouncer=true` flag prevents connection errors during Next.js hot reload.

4. **Run migrations**

   ```bash
   npm run db:migrate
   ```

   Or push schema without migration history:

   ```bash
   npm run db:push
   ```

5. **Seed demo data (optional)**

   ```bash
   npm run db:seed
   ```

   Demo accounts (password: `password123`):

   - Admin: `admin@demo.com`
   - Players: `player1@demo.com` … `player8@demo.com`

6. **Start dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Deploy (Vercel + Neon)

1. Create a Neon project and copy the connection string.
2. Import this repo in [Vercel](https://vercel.com).
3. Set environment variables:
   - `DATABASE_URL` — Neon pooled connection string
   - `AUTH_SECRET` — random secret
   - `AUTH_URL` / `NEXTAUTH_URL` — your production URL (e.g. `https://your-app.vercel.app`)
4. Build command runs `prisma generate` via `postinstall`. Add a build step or use:

   ```bash
   npx prisma migrate deploy
   ```

   in Vercel’s build command or as a post-deploy hook.

5. Deploy and run migrations against production once.

## Routes

| Path | Role |
|------|------|
| `/` | Landing |
| `/login` | Log in |
| `/register` | Player signup (search approved gyms) |
| `/register/admin` | Gym admin (invite code + email verify) |
| `/verify-email` | Email verification |
| `/admin` | Admin dashboard |
| `/admin/challenges` | Challenge grid |
| `/admin/teams` | Teams (generate + manual edit) |
| `/admin/players` | Freeze / reactivate players |
| `/dashboard` | Player challenges + team rosters |
| `/leaderboard` | All-time standings |

**Demo invite code:** `SQUEEZE-DEMO`

## Manual smoke test

- [ ] Register gym admin at `/register/admin` with invite code
- [ ] Verify email (link in dev terminal)
- [ ] Add challenges with duration (weeks)
- [ ] Register players at `/register` (search gym by name/city)
- [ ] Generate teams, optionally move players manually
- [ ] Player confirms challenge completion via popup
- [ ] Leaderboard shows all teams with per-player points
