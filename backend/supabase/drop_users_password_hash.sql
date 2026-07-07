-- Supabase Auth owns password hashing in auth.users.
-- public.users should only store application profile data.
--
-- Run this in Supabase SQL Editor after deploying the backend code that no
-- longer reads or writes public.users.password_hash.

alter table public.users
  drop column if exists password_hash;
