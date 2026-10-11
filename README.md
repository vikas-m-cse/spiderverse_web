# ACE CLUB Leaderboard

Responsive leaderboard with five columns: ID/rank, team name, Round 1 score, Round 2 score, and calculated final score.

## Run in Antigravity
1. Open Antigravity.
2. Choose **Open Folder** and select the cloned `spiderverse_web` directory.
3. Open its integrated terminal (Terminal → New Terminal).
4. Run:
   ```bash
   npm install
   npm run dev
   ```
5. Open the local URL Vite prints, usually http://localhost:5173.

Or clone the repository in a terminal first:
```bash
git clone https://github.com/vikas-m-cse/spiderverse_web.git
cd spiderverse_web
```

## Supabase setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in SQL Editor as project owner.
3. In Authentication, enable email/password sign-in and choose your team captain sign-up policy.
4. Create the administrator user under Authentication and copy its UUID.
5. In SQL Editor, add the role:
   ```sql
   insert into public.admins (user_id, display_name, role)
   values ('AUTH-USER-UUID-HERE', 'ACE Club Admin', 'admin');
   ```
   Use `judge` for authorised scorers.
6. Copy `.env.example` to `.env.local`, then set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your project's URL and browser-safe publishable/anon key. Restart the Vite server afterwards. Never expose the service-role key.
7. In Supabase Realtime/replication settings, enable changes for `public.teams` if needed.
8. Deploy on Vercel with the repository root as the project root and set the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables in Vercel.

## Features
- Five-column ranked leaderboard, calculated final score and search by team name/ID.
- Team registration; connected mode requires captain sign-in.
- Supabase Auth admin/judge sign-in; authorisation additionally checks `public.admins`.
- Score changes are restricted by RLS to authorised staff.
- Responsive design, loading/error states, refresh and Realtime subscription.

## Important status
Until the Supabase URL and browser-safe key are configured, the site uses clearly labelled sample data. Demo registration is in-memory and is not shared or persistent. The final score is calculated as `round1_score + round2_score`, not stored separately.
