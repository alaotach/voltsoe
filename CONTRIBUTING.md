# Contributing to VOLT League

Thanks for your interest! VOLT League is open-source and welcomes contributions.

## Local Development Setup

### Prerequisites
- Node.js 20+
- npm 10+
- [Supabase CLI](https://supabase.com/docs/guides/cli)

### Steps

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-org/volt-league
   cd volt-league
   ```

2. **Install dependencies**
   ```bash
   cd apps/web
   npm install
   ```

3. **Start Supabase locally**
   ```bash
   supabase start
   # Outputs local DB URL and anon key
   ```

4. **Run migrations**
   ```bash
   supabase db push
   ```

5. **Seed test data**
   ```bash
   supabase db seed
   ```

6. **Configure env**
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   # Fill in the local Supabase URL and keys from `supabase start` output
   ```

7. **Run dev server**
   ```bash
   npm run dev
   ```

## Branch Naming

- `feat/short-description` — new features
- `fix/short-description` — bug fixes
- `docs/short-description` — documentation only
- `chore/short-description` — tooling, deps, config

## PR Checklist

- [ ] TypeScript: no `any` types without a comment explaining why
- [ ] No hardcoded values — use env vars or DB config
- [ ] New DB tables/columns come with a migration file
- [ ] Admin actions are logged to `admin_actions`
- [ ] Points are always awarded via `awardPoints()`, never direct DB update
- [ ] RLS policies added for any new table
- [ ] `npm run build` passes with 0 errors

## Code Style

- Formatting: Prettier (run `npm run format`)
- Linting: ESLint (run `npm run lint`)
- No unused imports
- Server components for data fetching, client components only for interactivity

## Database Rules

- **Never** store a total points value on a user row
- **Never** delete from `admin_actions`
- Enrollment numbers must be normalized (`UPPER(TRIM(value))`) before insert
- All new tables need RLS enabled + at least one policy

## Questions?

Open a GitHub Issue or start a Discussion.
