# VOLT League

> Open-source competition and engagement platform for electronics and technical clubs.
> Run per-semester leagues where every workshop, challenge, and project earns points.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/volt-league&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,NEXT_PUBLIC_APP_URL,RESEND_API_KEY)

---

## What is VOLT League?

VOLT League is a gamified platform for technical clubs to run semester-long competitions. Students earn points by:

- ✅ Attending workshops and events
- 📦 Completing project submissions
- ⚡ Solving challenges (including epic **Boss Challenges**)
- 🏆 Earning badges for milestones

An **admin panel** lets club leaders create events, mark attendance, award points, manage students, and publish season recaps — all with a full audit log.

---

## Screenshots

| Dashboard | Leaderboard | Events | Admin |
|-----------|-------------|--------|-------|
| Rank, points, streak | Live rankings, podium | Cards with registration | Attendance sheet, points award |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + Custom Design System |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth (email/password + verification) |
| Realtime | Supabase Realtime (leaderboard, feed) |
| Storage | Supabase Storage (project images) |
| Email | Resend (notifications + weekly digest) |
| Deployment | Vercel + Supabase |

---

## Quick Start

### 1. Fork and clone

```bash
git clone https://github.com/your-org/volt-league
cd volt-league
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Run the migrations:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Seed initial data (badges + test season)
supabase db seed
```

### 3. Configure environment variables

```bash
cp apps/web/.env.example apps/web/.env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, etc.
```

### 4. Install and run

```bash
cd apps/web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Configuration for Your Club

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN` | Set to `yourclub.edu` to restrict registration to college emails. Leave empty to allow any email. |
| `NEXT_PUBLIC_SEASON_ID` | UUID of the active season. Set after creating your first season in the admin panel. |
| `NEXT_PUBLIC_APP_URL` | Your production URL, e.g. `https://volt.yourclub.com` |

### Creating Your First Season

1. Sign up with your email
2. Manually set your `role` to `super_admin` in the Supabase dashboard
3. Go to `/admin/season` and create a new season
4. Set the season UUID in `NEXT_PUBLIC_SEASON_ID`
5. Create your first event in `/admin/events/new`

---

## Project Structure

```
volt-league/
├── apps/
│   └── web/                    # Next.js 15 App Router
│       ├── app/
│       │   ├── (auth)/         # Login, Register, Complete Profile
│       │   ├── (student)/      # Dashboard, Events, Leaderboard, Challenges, Projects...
│       │   ├── (admin)/        # Full admin panel (role-gated)
│       │   └── api/            # API route handlers
│       ├── components/         # Shared UI components
│       ├── lib/                # Supabase clients, points, badges, notifications...
│       └── types/              # TypeScript database types
├── supabase/
│   ├── migrations/            # All SQL migrations (00001–00011)
│   └── seed.sql               # Badges + initial season
├── README.md
├── CONTRIBUTING.md
└── LICENSE
```

---

## Role System

| Role | Permissions |
|------|-------------|
| `student` | Register, attend, submit projects, earn points |
| `core` | Mark attendance, view registrations |
| `vp` | Create events, award points, manage registrations |
| `president` | Manage users, assign roles, view all admin actions |
| `super_admin` | Full access: role assignment, season management |

---

## Anti-Cheat Design

- Points are **never stored on a user row** — always calculated from `point_transactions` ledger
- Unique constraints on `email` and `enrollment_number` at the database level
- Every admin action is written to `admin_actions` (append-only, no delete)
- Attendance is manual (admin calls names and marks each student)
- All point awards require a mandatory `reason` field

---

## License

MIT — free for any club to use, modify, and deploy.
