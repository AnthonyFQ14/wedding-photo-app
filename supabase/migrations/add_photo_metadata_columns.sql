-- Add metadata columns to wedding_photos if they don't exist.
-- Run in Supabase Dashboard → SQL Editor.

alter table public.wedding_photos
  add column if not exists original_filename text,
  add column if not exists mime_type text,
  add column if not exists size_bytes bigint;
