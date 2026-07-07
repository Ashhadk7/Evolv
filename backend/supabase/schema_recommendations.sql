-- Recommended cleanup when using Supabase Auth.
-- Supabase stores password hashes internally in auth.users.
-- Your public.users table should not require or store password hashes.

alter table public.users
  alter column password_hash drop not null;

comment on column public.users.password_hash
  is 'Deprecated. Password hashes are managed by Supabase Auth in auth.users.';
