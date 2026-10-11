# ACE CLUB Leaderboard

Responsive leaderboard with five columns: ID/rank, team name, Round 1 score, Round 2 score, and calculated final score.

## Run locally
Because `app.js` uses ES modules, serve the root through a local web server rather than opening the HTML file directly:
```bash
python -m http.server 5500
```
Open http://localhost:5500.

## Supabase setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in SQL Editor as project owner.
3. In Authentication, enable email/password sign-in. Set the captain sign-up policy you want for the event.
4. Create the administrator's user under Authentication and copy the user UUID.
5. In SQL Editor, add the role:
   ```sql
   insert into public.admins (user_id, display_name, role)
   values ('AUTH-USER-UUID-HERE', 'ACE Club Admin', 'admin');
   ```
   Use role `judge` for authorised scoring judges.
6. Put the Project URL and publishable/anon key in the top of `app.js`. These are browser-safe keys. **Never** put a service-role key in JavaScript or GitHub.
7. In Supabase Realtime / replication settings, enable change broadcasts for `public.teams` if needed.
8. Deploy this repository on Vercel with the repository root as the project root.

## What is implemented
- Five-column ranked leaderboard; final points are computed from both rounds and never stored separately.
- Search/filter by team name or short ID.
- Team registration: demo mode stores in page memory only; connected mode requires the captain to sign in and saves to Supabase.
- Admin/judge password sign-in through Supabase Auth; access additionally requires a matching row in `public.admins`.
- Score fields can be updated only by signed-in admin/judge users allowed by RLS.
- Responsive mobile layout, clear demo/live status, refresh, error messaging and Realtime subscription.

## Security notes
- RLS is enabled for both tables. Public visitors may read scores; they cannot register or change points while unauthenticated.
- Captains can insert a team only with their own `auth.uid()`.
- Admins table role writes are revoked from client roles; role assignments happen from the Supabase SQL Editor/project-owner context.
- Never hard-code or commit credentials beyond the Supabase browser-safe publishable/anon key.
- Until the Supabase URL/key are filled into `app.js`, the site clearly runs with example data, and registration is only a demo—not shared persistence.
