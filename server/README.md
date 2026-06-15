# Gasonet CGD Platform — Backend

Express + SQLite (better-sqlite3) API with JWT auth. The frontend (Vite) proxies
`/api` → `http://localhost:4000`.

## Run

```bash
# from cgd-platform/
npm run server:install      # one-time: install backend deps
npm run server              # start API on http://localhost:4000
# in another terminal:
npm run dev                 # start the frontend on http://localhost:5173
```

The SQLite file `server/cgd.db` is created and seeded on first run (gitignored).

## Auth

- **Staff** (officer console): email + password.
  Demo accounts — password `gasonet123`:
  - `priya.sharma@gasonet.in` — CGD Officer
  - `vikram.r@gasonet.in` — Meter Reader
  - `sunita.j@gasonet.in` — Billing Executive
  - `mohit.a@gasonet.in` — Admin
- **Customer** (portal): mobile OTP. In dev the generated OTP is returned in the
  API response (and logged to the server console) so the demo flows without an
  SMS provider. Demo customer: `+91 98765 43210` (Neel Kumar).

## Stubbed (need real credentials to go live)

- **SMS / OTP delivery** — generated server-side; wire MSG91/Twilio in
  `request-otp` to actually send.
- **Payment gateway** — payment is simulated; wire Razorpay/PayU.
- **MyPNG integration** — the in-app MyPNG portal is a simulation.

## Reset

`POST /api/admin/reset` re-seeds the DB. The officer console's
**Reset demo data** button calls it.
