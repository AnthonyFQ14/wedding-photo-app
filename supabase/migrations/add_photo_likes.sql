-- Photo likes / hearts table
-- guest_id is a random UUID stored in the browser's localStorage.
-- One like per guest per photo.

create table if not exists public.photo_likes (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references public.wedding_photos(id) on delete cascade,
  guest_id text not null,
  created_at timestamptz not null default now(),
  constraint photo_likes_unique_guest unique (photo_id, guest_id)
);

create index if not exists photo_likes_photo_id_idx
  on public.photo_likes (photo_id);

alter table public.photo_likes enable row level security;
