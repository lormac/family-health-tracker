# Family Health Tracker

A family macro & health tracking web app with a shared dashboard and private PIN-protected individual trackers.

## Features
- 🏠 **Family dashboard** — shows everyone's daily progress at a glance
- 🔐 **PIN login** — each family member has a private 4-digit PIN
- 🍽 **Food tracking** — USDA database search, manual entry, saved favourites
- ⚖️ **Weight log** with trend chart
- 🩸 **Blood sugar** in mmol/L (Canadian standard) with flagging
- 🏃 **Exercise log** with calorie burn estimates
- ☁️ **Cloud sync** — data saved to Vercel KV (Redis), accessible from any device

---

## Deployment Steps

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/family-health-tracker.git
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"** → Import your GitHub repo
3. Vercel will detect the project automatically — click **Deploy**

### 3. Add Vercel KV (database)
1. In your Vercel project dashboard, go to **Storage** tab
2. Click **"Create Database"** → choose **KV** (Redis)
3. Name it (e.g. `family-tracker-kv`) and click Create
4. Click **"Connect to Project"** — this automatically adds the KV environment variables

### 4. Set the admin PIN
1. In your Vercel project → **Settings** → **Environment Variables**
2. Add: `ADMIN_PIN` = your chosen 4-digit admin PIN (e.g. `9999`)
3. Click **Save**, then go to **Deployments** and **Redeploy** (to pick up the new env var)

### 5. Register family members
1. Visit `https://your-app.vercel.app/setup.html`
2. Enter each family member's name and their 4-digit PIN
3. Enter your admin PIN and click **Save members**

### 6. Share with family
- **Dashboard:** `https://your-app.vercel.app/dashboard.html` — no PIN needed
- **Personal tracker:** `https://your-app.vercel.app` — enter PIN to log in

---

## Family Member PINs (fill this in and keep it safe)

| Name | PIN |
|------|-----|
|      |     |
|      |     |
|      |     |
|      |     |
|      |     |
|      |     |

---

## File Structure
```
family-tracker/
├── public/
│   ├── index.html       ← PIN login page
│   ├── dashboard.html   ← family dashboard (no login)
│   ├── tracker.html     ← individual tracker app
│   ├── setup.html       ← admin: register family members
│   └── style.css        ← all styles
├── api/
│   ├── save.js          ← POST: save user data to KV
│   ├── load.js          ← GET: load user data from KV
│   ├── dashboard.js     ← GET: all members' today summary
│   └── members.js       ← GET/POST: manage member registry
├── vercel.json          ← routing config
└── package.json
```

## Notes
- Data is stored per PIN in Vercel KV — one record per user, overwritten on each save
- The dashboard auto-refreshes every 60 seconds
- If KV is unavailable, data falls back to browser localStorage
- The USDA food search uses the free DEMO_KEY which has rate limits; for heavy use, get a free API key at https://fdc.nal.usda.gov/api-guide.html and replace DEMO_KEY in tracker.html
