-- First-time Webloom admin bootstrap.
-- 1. In Supabase Dashboard -> Authentication -> Users, add your own user with
--    your email, a strong password, and email confirmed.
-- 2. Replace the address below with that exact email, then run this SQL once.
-- 3. Sign in at /sign-in. Do not make ordinary customers platform admins.

insert into public.platform_admins (user_id)
select id
  from auth.users
 where lower(email) = lower('owner@example.com')
on conflict (user_id) do nothing;
