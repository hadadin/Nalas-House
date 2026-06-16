# Setup — Phase 0

Things only you can do (account-bound steps), in order. Everything else is already built.

## 1. Supabase

1. Create a new project at supabase.com (any region near you).
2. In the SQL Editor, run the two files in `supabase/migrations/` in order:
   `0001_init.sql`, then `0002_household_bootstrap.sql`.
3. Go to **Settings → API**, copy the **Project URL** and **anon public key**.
4. Go to **Authentication → URL Configuration**, set:
   - Site URL: `http://localhost:3000` (for now)
   - Redirect URLs: add `http://localhost:3000/auth/callback`
   (You'll add the real Vercel URL here too, after step 4 below.)

## 2. Local env

Copy `.env.local.example` → `.env.local` (already done, just fill it in) with:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` from step 1.
- `ANTHROPIC_API_KEY` from console.anthropic.com (needed for Phase 1, not Phase 0).

Then run locally:
```
npm install
npm run dev
```
Visit `localhost:3000` → it should redirect to `/login`. Enter your email, check
your inbox, click the magic link → you'll land on `/onboarding` → create the
household → you'll see an invite code.

Have your wife open the same `localhost:3000` (or, once deployed, the real
URL) on her phone, sign in with her own email, and use **Join existing** with
that invite code. Now you're both members of the same household.

## 3. GitHub

```
git remote add origin <your-empty-github-repo-url>
git branch -M main
git push -u origin main
```
(I already ran `git init` and made the first commit locally — you just need
to create the empty repo on GitHub and push.)

Note: there's a stray `.git/index.lock` file from my session — if `git`
complains about it, just run `rm .git/index.lock` once before your first
command above.

## 4. Vercel

1. Import the GitHub repo at vercel.com/new.
2. Add the same three env vars from step 2 in Vercel's project settings.
3. Deploy → you'll get a live URL.
4. Back in Supabase (step 1.4), add `<your-vercel-url>/auth/callback` to
   Redirect URLs, and update `NEXT_PUBLIC_SITE_URL` in Vercel's env vars to
   your real URL, then redeploy.

**Phase 0 is done** once you and your wife can both open the live URL on
your phones, sign in, and see the household screen with the invite code.

Tell me when that's working and we'll start Phase 1 (menu generator).
