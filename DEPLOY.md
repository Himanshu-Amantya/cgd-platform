# Deploying the CGD Platform

**Frontend → Vercel** (static Vite build) · **Backend → Render** (Express + SQLite).

> Why two hosts: Vercel's serverless functions have an ephemeral, read-only
> filesystem, so the SQLite file can't persist there. Render runs the backend as
> a normal long-lived Node service, so SQLite works unchanged.

Both steps need **your own Vercel / Render logins** — they can't be done for you.
The recommended route is to push **the `cgd-platform/` folder as its own GitHub repo**
and connect both hosts to it. (Your home directory is already a git repo, so make a
fresh, dedicated repo for this app instead of pushing that.)

---

## 0. Make cgd-platform its own GitHub repo (once)

```bash
cd cgd-platform
git init
git add .
git commit -m "CGD platform: frontend + backend, deploy-ready"
# create an empty repo on github.com, then:
git remote add origin https://github.com/<you>/cgd-platform.git
git branch -M main
git push -u origin main
```

(`node_modules`, `dist` and `cgd.db` are gitignored.)

---

## 1. Backend on Render

**Dashboard route (most reliable):**
1. https://dashboard.render.com → **New** → **Web Service** → connect the `cgd-platform` repo.
2. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Plan:** Free
3. **Environment** → add:
   - `JWT_SECRET` = (any long random string)
   - `SHOW_OTP` = `1`   (keeps OTP returned in the response, since there's no SMS yet)
4. Create. Wait for the build; note the URL, e.g. `https://cgd-api.onrender.com`.
5. Verify: open `https://cgd-api.onrender.com/api/health` → `{"ok":true,...}`.

(Or commit `render.yaml` and use **New → Blueprint** — adjust `rootDir` if your
repo root differs.)

**Free-tier notes**
- The service **sleeps after ~15 min idle**; the first request then takes ~30–60s to wake.
- Filesystem is **ephemeral** — on each deploy/restart the SQLite DB **re-seeds**
  (fine for a demo). For permanent data, add a Render **Disk** (paid), set
  `mountPath` (e.g. `/var/data`) and env `DB_PATH=/var/data/cgd.db` (see `render.yaml`).

---

## 2. Frontend on Vercel

1. https://vercel.com → **Add New** → **Project** → import the `cgd-platform` repo.
2. Settings:
   - **Root Directory:** `.` (repo root — leave default)
   - Framework **Vite** is auto-detected (build `vite build`, output `dist`).
3. **Environment Variables** → add (Production + Preview):
   - `VITE_API_BASE` = your Render URL, e.g. `https://cgd-api.onrender.com` (no trailing `/api`)
4. Deploy. Open the Vercel URL.

> If you change `VITE_API_BASE` later, **redeploy** — it's baked in at build time.

---

## 3. CLI alternative (no GitHub)

```bash
# Frontend (from cgd-platform/)
npm i -g vercel
vercel            # login + follow prompts; set root to current dir
vercel env add VITE_API_BASE production   # paste Render URL
vercel --prod

# Backend: Render has no local-folder deploy — use the GitHub/Blueprint route above,
# or any Node host (Railway/Fly.io/VPS) running `node index.js` in cgd-platform/server.
```

---

## 4. Smoke test the live app

- Officer: open the Vercel URL → `#/officer` → sign in `priya.sharma@gasonet.in` / `gasonet123`.
- Customer: `#/customer` → mobile `98765 43210` → **Send OTP** → the dev OTP shows on screen → verify.
- Submit a reading → a draft bill appears → validate/approve/release → it shows in Collections. Reload — data persists (until the backend restarts on free tier).

## Going fully production
Swap the stubs (see `server/README.md`): real SMS for OTP (then set `SHOW_OTP=0`),
payment gateway, MyPNG API; add a Render Disk (or move to Postgres) for durable data.
