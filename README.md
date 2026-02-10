# Wedding Photo Vault

A simple, elegant web app for wedding guests to upload photos into a private vault. The couple shares a passcode; after the celebration, the full gallery unlocks as a curated mosaic.

**Stack:** Next.js 15, React 19, Supabase (Storage + Postgres), Tailwind CSS.

---

## Features

- **Passcode-protected** — Only guests with the shared code can view and upload.
- **Guest uploads** — Guests enter their name and add a photo; images are stored privately in Supabase.
- **Reveal countdown** — Gallery stays locked until a set time after the wedding (configurable).
- **Editorial look** — Playfair + Inter, cream/espresso/champagne palette, subtle motion.

---

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/wedding-photo-app.git
cd wedding-photo-app
npm install
```

### 2. Supabase

Create a [Supabase](https://supabase.com) project, then:

- **Storage:** Add a **private** bucket named `wedding-photos` (see [`supabase/SETUP.md`](./supabase/SETUP.md)).
- **Database:** Run the SQL in [`supabase/setup.sql`](./supabase/setup.sql) in the SQL Editor.

### 3. Environment variables

Copy the example and fill in your values:

```bash
cp .env.example .env.local
```

You’ll need:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `APP_PASSCODE` | Passcode you’ll share with guests |
| `SESSION_SIGNING_SECRET` | Long random string (e.g. `openssl rand -hex 32`) |
| `WEDDING_DATE` | ISO date/time of the wedding (optional) |
| `REVEAL_AFTER_HOURS` | Hours after wedding when gallery unlocks (optional) |

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Enter the passcode to unlock the vault and upload.

---

## Customization

- **Couple names & app title:** [`lib/config.ts`](./lib/config.ts) — edit `COUPLE_NAMES` and `APP_NAME`.
- **Wedding date / reveal time:** same file or via `WEDDING_DATE` and `REVEAL_AFTER_HOURS` in `.env.local`.

---

## Deploy (e.g. Vercel)

See **[DEPLOY.md](./DEPLOY.md)** for step-by-step deployment to Vercel so guests can open the app on their phones. Free tier works for personal use.

---

## Project structure

```
app/              # Next.js App Router (pages, layout, API routes)
components/       # React UI (UploadForm, PasscodeModal, gallery, etc.)
lib/              # Config, Supabase clients, env, server helpers
supabase/         # SQL setup and migrations for Storage + DB
```

---

## License

MIT — use it for your wedding or any event.
