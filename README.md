# ACE CLUB Leaderboard

Responsive leaderboard with five columns: ID/rank, team name, Round 1 score, Round 2 score, and calculated final score.

## Run in Antigravity
1. Open Antigravity and choose **Open Folder**.
2. Select the cloned `spiderverse_web` directory.
3. Open Terminal → New Terminal and run:
   ```bash
   npm install
   npm run dev
   ```
4. Open the local Vite URL, usually http://localhost:5173.

To clone first:
```bash
git clone https://github.com/vikas-m-cse/spiderverse_web.git
cd spiderverse_web
```

## Supabase setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in SQL Editor as project owner.
3. Enable email/password sign-in under Authentication.
4. Create an admin user in Authentication and copy its UUID.
5. Add the role in SQL Editor:
   ```sql
   insert into public.admins (user_id, display_name, role)
   values ('AUTH-USER-UUID-HERE', 'ACE Club Admin', 'admin');
   ```
6. Copy `.env.example` to `.env.local` and fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with your project URL and browser-safe publishable/anon key. Restart Vite after editing. Never use the service-role key in the frontend.
7. Enable Realtime for `public.teams` in Supabase if it is not enabled already.
8. For Vercel, deploy the repository root and define the same two `VITE_...` variables in project settings.

## Features
- Five-column ranked leaderboard; final points are calculated, not stored.
- Search by team name or short ID.
- Registration writes to Supabase only when a captain is signed in; demo mode only exists in memory.
- Supabase Auth admin/judge sign-in and role check against `public.admins`.
- RLS on both requested tables; score changes are restricted to authorised admin/judge users.
- Responsive design, status feedback, refresh and Realtime subscription.

## Important
Until Supabase environment variables are configured, the site intentionally uses sample data and says DEMO MODE. Demo registrations are not shared or persistent.
