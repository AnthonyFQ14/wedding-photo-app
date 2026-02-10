# Deploy for free (Vercel + Supabase)

Use **Vercel** to host the Next.js app so you can open it on your phone. Your Supabase project stays as-is; you only deploy the frontend + API routes.

## 1. Push to GitHub

If the project isn’t in a repo yet:

```bash
git init
git add .
git commit -m "Initial commit"
```

Create a new repository on [GitHub](https://github.com/new), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

(Your `.env.local` is already in `.gitignore` and will not be pushed.)

## 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New… → Project** and import your wedding photo app repo.
3. Leave **Framework Preset** as **Next.js**. Click **Deploy** (it will fail until env vars are set).
4. Open your project → **Settings → Environment Variables**.
5. Add each variable from your local `.env.local` (same names and values). Required names:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `APP_PASSCODE`
   - `SESSION_SIGNING_SECRET`
   - `WEDDING_DATE` (optional if you use defaults)
   - `REVEAL_AFTER_HOURS` (optional)
6. Go to **Deployments**, open the three dots on the latest deployment → **Redeploy** (so the new env vars are used).

## 3. Open on your phone

After the redeploy finishes, open the **Visit** URL (e.g. `https://your-project.vercel.app`) on your phone. You can add it to your home screen for an app-like experience.

---

**Free tier:** Vercel’s hobby plan is enough for personal use; Supabase’s free tier covers your storage and DB. No credit card required for either.
