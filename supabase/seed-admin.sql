-- Run manually in Supabase SQL Editor after creating the staff user under Authentication.
-- Replace the UUID with the actual auth.users.id for that account.
insert into public.admins (user_id, display_name, role)
values ('REPLACE-WITH-AUTH-USER-UUID', 'ACE Club Admin', 'admin')
on conflict (user_id) do update
set display_name = excluded.display_name, role = excluded.role;
