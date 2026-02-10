# Supabase setup

## 1) Storage bucket

Create a bucket named `wedding-photos` and set it to **Private**.

- Private bucket is required so image URLs cannot be accessed without a server-issued signed URL.
- All access goes through your Next.js API (service role); direct client access is not used.
- Restrict uploads in the Dashboard (recommended):
  - Allowed MIME types: `image/*`
  - Max file size: 10–20MB (the API also enforces 15MB by default)

Optional: Add RLS policies on `storage.objects` so that even if the anon key were used by mistake, the bucket remains inaccessible (e.g. no `SELECT`/`INSERT` for `anon` or `authenticated`).

## 2) Database table

Run the SQL in [`setup.sql`](./setup.sql) in **Supabase Dashboard → SQL Editor**.

This creates:
- `public.wedding_photos` (metadata rows)
- RLS enabled (no policies = default deny for `anon`). The app uses the Service Role server-side, which bypasses RLS.

## 3) API keys

You already have:
- Project URL
- `anon` key (used only if you add client-side Supabase later; not required for the current flow)

Copy the **Service Role** key (server-only) into `.env.local`:
- Supabase Dashboard → Project Settings → API → `service_role`

Never expose the service role key to the browser.

