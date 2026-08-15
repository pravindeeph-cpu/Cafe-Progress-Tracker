# Cafe Launch Control Centre

A web app for tracking everything involved in opening a cafe in Malaysia — from planning through opening day. Not a checklist: a small full-stack app backed by a real Postgres database, so your progress persists and multiple people (you + partners) can view and edit the same live data from anywhere.

## Stack

- **Backend**: Node.js + Express + [Postgres](https://www.postgresql.org/) (via [`pg`](https://node-postgres.com/)).
- **Frontend**: React + TypeScript + Vite, plain CSS (no framework).
- Communication over a small REST API (`/api/...`).

## Sections

1. **Command Centre** — dashboard: overall readiness %, per-section RAG status, budget committed/remaining, cash runway, days to target opening, blockers/overdue counts, and Go/No-Go gate status.
2. **Master Tasks** — every action item, with owner, deadline, status, cost, dependency, notes, and a risk flag.
3. **Financial Model** — startup cost breakdown, monthly revenue/cost forecast, break-even calculator, cash buffer tracker.
4. **Licences & Compliance** — Malaysia-specific mandatory registrations (SSM, PBT premises + signboard, MOH food premises, TIN, SST threshold, EPF/SOCSO/EIS, e-Invoice) plus conditional items (Halal, liquor, music/PPM, entertainment, outdoor seating) you flag as applicable.
5. **Menu & Suppliers** — per-item recipe costing (ingredients, cost, margin, prep time) and a supplier database with backup tracking for critical ingredients.
6. **Property & Fit-Out** — lease/tenancy checklist, technical checks, renovation tracker, equipment procurement register.
7. **People & SOPs** — hiring/contracts/payroll, a dedicated Skill Preparation tracker (barista training, Food Handler Certificate, typhoid vaccination, first aid/CPR, fire safety, HACCP awareness, allergen awareness, bookkeeping), and an SOP library.
8. **Pre-Opening** — equipment testing, POS end-to-end test, soft launch, final sign-off.
9. **Go/No-Go Gates** — six mandatory gates (Business Viability, Property, Legal, People, Operations, Opening). The dashboard only shows "Ready to Open" when all six are fully green — not based on overall completion %.

The database is seeded automatically on first startup with the Malaysia-specific licence list, the six gate checklists, the skill-prep training list, the SOP library, and the pre-opening checklist, so you have a real starting point instead of a blank app.

## Local development

You need a Postgres database to point at — the easiest option is to reuse the same free Neon database described below (see "Deploying for shared use"), so your local edits and your partners' edits are the same data. Alternatively, run Postgres locally.

1. Copy `.env.example` to `server/.env` and set `DATABASE_URL` to your Postgres connection string.
2. Install and run:

   ```bash
   npm run install:all   # installs root, server, and client dependencies
   npm run dev             # runs the API on :4000 and the Vite dev server on :5173
   ```

3. Open http://localhost:5173. The database schema and Malaysia-specific defaults are created automatically on first connect.

## Deploying for shared use (free)

To let partners use the same live tracker, host the app once and share the URL. This uses [Neon](https://neon.tech) (free Postgres) + [Render](https://render.com) (free web hosting) — no credit card required for either at this scale.

**1. Create a free Postgres database on Neon**
- Sign up at [neon.tech](https://neon.tech) and create a new project.
- Copy the connection string it gives you (starts with `postgres://...`, includes `?sslmode=require`).

**2. Push this code to your own GitHub repo** (if you haven't already — Render deploys from a repo you own).

**3. Create a free web service on Render**
- Sign up at [render.com](https://render.com) and click **New → Web Service**.
- Connect your GitHub repo and branch.
- Render should detect `render.yaml` in this repo and pre-fill the settings. If not, set manually:
  - **Build Command**: `npm run install:all && npm run build`
  - **Start Command**: `npm start`
  - **Plan**: Free
- Add an environment variable **`DATABASE_URL`** set to the Neon connection string from step 1.
- Click **Create Web Service**. The first deploy takes a few minutes.

**4. Share the URL**
- Render gives you a URL like `https://cafe-launch-control-centre.onrender.com`. Send that to your partners — everyone editing there is editing the same database.

**Free-tier trade-offs worth knowing:**
- Render's free web services spin down after 15 minutes of no traffic. The first request after idle takes 30–60 seconds to wake back up — normal, not broken.
- Neon's free tier is generous for a tool like this (a handful of people, occasional edits) — no realistic risk of hitting limits.
- Every push to your connected branch auto-redeploys on Render.

## Notes

- All edits save immediately (no "Save" button) — text fields commit on blur, dropdowns/checkboxes/dates commit immediately.
- Every table has a `+ Add row` button; every row has a delete (✕) button.
- The dashboard and financial numbers are computed live from your data — no manual rollups needed.
- Since everyone shares one database, edits from different people appear for others on their next page load/refresh (the dashboard also auto-refreshes every 20 seconds while open).
