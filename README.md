# Cafe Launch Control Centre

A local web app for tracking everything involved in opening a cafe in Malaysia — from planning through opening day. Not a checklist: a small full-stack app with a real SQLite database, so your progress persists on disk and you can keep updating it over weeks or months.

## Stack

- **Backend**: Node.js + Express + [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — a single `.db` file at `server/data/cafe_control_centre.db`.
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

The database is seeded on first run with the Malaysia-specific licence list, the six gate checklists, the skill-prep training list, the SOP library, and the pre-opening checklist, so you have a real starting point instead of a blank app.

## Getting started

```bash
npm run install:all   # installs root, server, and client dependencies
npm run dev             # runs the API on :4000 and the Vite dev server on :5173
```

The database is created and seeded automatically the first time the server starts (safe to re-run; it only inserts into empty tables).

Open http://localhost:5173.

## Running it long-term

For day-to-day use without the dev server:

```bash
npm run build   # builds the React app into client/dist
npm start        # serves the built app + API from a single Node process on :4000
```

Then just open http://localhost:4000 whenever you want to update your progress. Your data lives in `server/data/cafe_control_centre.db` — back that file up if you want a snapshot.

## Notes

- All edits save immediately (no "Save" button) — text fields commit on blur, dropdowns/checkboxes/dates commit immediately.
- Every table has a `+ Add row` button; every row has a delete (✕) button.
- The dashboard and financial numbers are computed live from your data — no manual rollups needed.
