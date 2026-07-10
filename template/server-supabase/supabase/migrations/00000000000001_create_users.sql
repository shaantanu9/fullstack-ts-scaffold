-- Initial schema for the Supabase backend.
-- Mirrors the Prisma `User` model used by server-sql: a single `users` table
-- with UUID PK, unique email, role check constraint, and audit timestamps.

create table if not exists public.users (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  password   text not null,
  name       text,
  role       text not null default 'USER' check (role in ('USER', 'ADMIN', 'MODERATOR')),
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_email_idx on public.users (email);

-- Keep updated_at fresh on every UPDATE (Prisma's @updatedAt equivalent).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
  before update on public.users
  for each row
  execute function public.set_updated_at();

-- RLS is enabled so the anon/authenticated keys have NO access by default.
-- This trusted Express backend talks to Supabase with the service-role key,
-- which bypasses RLS entirely — so no policies are required for it to work.
alter table public.users enable row level security;
