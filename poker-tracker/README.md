# Poker Tracker 🃏

Track buy-ins, cash-outs, and who owes who across your home poker sessions.

---

## Deploy in ~10 minutes

### Step 1 — Create a Supabase database (free)

1. Go to **https://supabase.com** and sign up for a free account
2. Click **"New project"**, give it a name like `poker-tracker`, choose a region close to you
3. Wait ~2 minutes for the project to set up
4. Go to **Database → SQL Editor → New query**
5. Copy the entire contents of `supabase-schema.sql` (in this folder), paste it in, and click **Run**
6. Go to **Project Settings → API**
7. Copy two values — you'll need them soon:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public** key (a long string starting with `eyJ...`)

---

### Step 2 — Put the code on GitHub

1. Go to **https://github.com** and sign in (or create a free account)
2. Click the **+** button → **New repository**, name it `poker-tracker`, set it to **Public**, click **Create repository**
3. On your computer, open Terminal (Mac) or Command Prompt (Windows) and run:

```bash
cd poker-tracker        # navigate to this folder
npm install             # install dependencies
```

Then push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/poker-tracker.git
git push -u origin main
```

---

### Step 3 — Deploy on Vercel (free)

1. Go to **https://vercel.com** and sign in with your GitHub account
2. Click **"Add New Project"**
3. Find and select your `poker-tracker` repository, click **Import**
4. Before clicking Deploy, click **"Environment Variables"** and add these two:
   - Name: `VITE_SUPABASE_URL` → Value: your Supabase Project URL
   - Name: `VITE_SUPABASE_ANON_KEY` → Value: your Supabase anon key
5. Click **Deploy** — it takes about 1 minute
6. Vercel gives you a URL like `https://poker-tracker-abc123.vercel.app`

**That's your app URL. Share it with your players!**

---

## Usage

- **Players tab** — add everyone in your regular game once
- **New game tab** — at the start of each session, set the buy-in amount; check off who's playing and enter cash-out amounts at the end
- **Balance check** — the app tells you live if the money adds up (cash-outs must equal buy-ins)
- **History tab** — see all past sessions
- **Settle up tab** — see the minimum transactions needed to square everyone up

## Tech stack

- React + Vite (frontend)
- Supabase (Postgres database, hosted)
- Vercel (hosting, free tier)
