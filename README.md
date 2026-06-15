# Gasonet CGD Platform

A full React (Vite) application for the **City Gas Distribution (CGD) ↔ MyPNG** integration,
built on the Gasonet design system. One app, **three connected surfaces** sharing a single
localStorage-backed store — so the round-trip is real: a customer applies on MyPNG → the
officer reviews it → the decision flows back to the customer's status timeline.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## Surfaces (routes)

| Route        | Surface                | Who            |
|--------------|------------------------|----------------|
| `/`          | Launchpad              | pick a portal  |
| `/customer`  | Customer CGD Portal    | consumers      |
| `/mypng`     | MyPNG National Portal  | onboarding     |
| `/officer`   | CGD Officer Console    | Gasonet staff  |

## End-to-end flow

1. **Customer** signs in (`/customer`, OTP) → **Apply for New PNG Connection** → confirm → redirected to **MyPNG**.
2. **MyPNG** (`/mypng`): Verify Mobile → OTP → Registered Address → Select Address → Confirm Installation Address → Applicant Info & Documents → **Submitted**. This creates the application (status `PAYMENT_PENDING`) in the shared store and returns to the customer **Payment** page.
3. **Customer Payment**: choose a deposit scheme (Upfront / EMI / Rental-FDC), pay → status becomes `REVIEW`.
4. **Officer** (`/officer`): the application appears in the review queue. Verify each document, add remarks, **Approve & Push to MyPNG** (or Reject) → `POST /v1/png-application/update`. Approve → Schedule → Complete.
5. **Customer Status**: the timeline reflects the officer's decision live.

## Project structure

```
src/
  main.jsx            app entry (HashRouter + ToastHost)
  App.jsx             top-level routes
  styles/app.css      design system (tokens + components)
  lib/
    icons.jsx         feather-style icon set
    format.js         inr(), dates, avatar helpers
    status.js         official PNG status lifecycle + journey()
    store.js          shared localStorage store (useApps / Store)
  components/         Toast, ui (Badge, Panel, Modal, Drawer, StatusChip…)
  surfaces/
    Launchpad.jsx
    customer/         CustomerApp + Login + all customer pages
    mypng/            MyPngApp + mypng.css (recreated from Figma)
    officer/          OfficerApp (queue + review)
```

## Notes
- **Status lifecycle** (from PNG_CGD_Integration_API_Guide v1.10): `SUBMITTED → PAYMENT_PENDING → REVIEW → VERIFIED → APPROVED/NOT_APPROVED → SCHEDULED → COMPLETED`.
- The MyPNG surface is a faithful recreation of the Figma submit flow; to redirect to the **real** MyPNG portal instead (`http://15.206.148.94:3000/login`), change the `/mypng` navigation in `surfaces/customer/CustomerApp.jsx`.
- Reset demo data anytime from the Officer console sidebar → **Reset demo data**.

Built by Amantya for Gasonet Services (RJ) Ltd · Bikaner & Churu GA.
