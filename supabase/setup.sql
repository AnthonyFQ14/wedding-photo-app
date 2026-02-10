-- Wedding Photo App (Supabase) - minimal schema
-- Run in Supabase Dashboard → SQL Editor.

-- Needed for gen_random_uuid()
create extension if not exists pgcrypto;

create table if not exists public.wedding_photos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  guest_name text not null,
  object_path text not null,
  original_filename text,
  mime_type text,
  size_bytes bigint
);

create index if not exists wedding_photos_created_at_idx
  on public.wedding_photos (created_at desc);

-- Keep RLS enabled + default-deny for anon.
-- Your Next.js server will use the Service Role key, which bypasses RLS.
alter table public.wedding_photos enable row level security;

