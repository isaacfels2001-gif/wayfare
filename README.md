# Wayfare — Online Travel Agency (Portfolio Demo)

A full-stack OTA web app: search and book flights, hotels, and curated tour packages, combine them in a single cart/checkout, pay with Stripe (test mode), and manage everything from an admin dashboard. Built as a portfolio-quality demo — polished UI and a real end-to-end booking flow, backed by mock inventory instead of live GDS contracts.

**Stack:** Next.js 16 (App Router, TypeScript) for both the frontend and the API layer (Route Handlers + Server Actions), Prisma ORM, Auth.js (NextAuth v5, credentials provider), Stripe Checkout (test mode), Tailwind CSS v4, Zustand, Recharts, pdf-lib. One codebase, one deploy target — see "Handoff notes" for the reasoning.

---

## Quick start

Prerequisites: Node.js 20+ and npm.

```bash
git clone <this-repo>
cd ota-platform
cp .env.example .env        # fill in AUTH_SECRET at minimum, see below
npm install                 # also runs `prisma generate` via postinstall
npm run db:migrate           # creates the local SQLite database + tables
npm run db:seed              # seeds flights, hotels, tours, promo codes, users
npm run dev
```

Open http://localhost:3000.

Generate a session secret before you start:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Paste the output into `AUTH_SECRET` in `.env`.

### Seeded accounts

| Role | Email | Password |
|---|---|---|
| Customer | `customer@ota-demo.test` | `Traveler123!` |
| Admin | `admin@ota-demo.test` | `Admin123!` |

### Try it end to end

1. Search a flight: JFK → LAX (or LHR, MIA, or SFO ↔ NRT), any date 1–45 days out.
2. Search a hotel in New York, Los Angeles, London, Tokyo, Miami, or Paris.
3. Browse `/tours` and add a package.
4. Go to `/cart` — all three sit in one checkout. Try promo code `WELCOME10` or `SUMMER50`.
5. Check out. **No Stripe keys are required to test this** — see "Payments" below.
6. View the confirmation, download the PDF voucher, and see the trip under "My Trips."
7. Log in as the admin account and check `/admin` — the booking, revenue, and top destinations reflect what you just did.

---

## Environment variables

All variables live in `.env` (see `.env.example` for the template — no secrets are committed).

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Prisma connection string. Defaults to a local SQLite file. |
| `AUTH_SECRET` | Session signing secret for Auth.js. Required. |
| `APP_URL` | Base URL used for Stripe redirect URLs and email links. |
| `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe **test-mode** keys. Optional — see "Payments." |
| `FLIGHT_PROVIDER` / `HOTEL_PROVIDER` / `TOUR_PROVIDER` | Booking-adapter selection, currently `mock` only. |
| `EMAIL_PROVIDER` / `EMAIL_FROM` | Transactional email adapter, currently `mock` only. |

---

## Payments (Stripe test mode)

The checkout flow is wired for real **Stripe Checkout in test mode**: `src/lib/actions/checkout.ts` creates a Checkout Session, `src/app/api/webhooks/stripe/route.ts` confirms the booking on `checkout.session.completed`, and `src/app/checkout/cancel/page.tsx` releases held inventory if the customer backs out.

Because this project ships without anyone's personal Stripe credentials, **if `STRIPE_SECRET_KEY` is unset, checkout uses a built-in mock-payment fallback**: the booking is validated, priced, and confirmed immediately (no external call), so the full flow is testable out of the box. This is clearly marked in `src/lib/actions/checkout.ts`.

To exercise real Stripe test mode:

1. Create a free Stripe account and grab your **test-mode** keys from https://dashboard.stripe.com/test/apikeys.
2. Set `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` in `.env`.
3. Forward webhooks locally with the Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Copy the printed webhook signing secret into `STRIPE_WEBHOOK_SECRET`.
4. Restart `npm run dev` and check out with [any Stripe test card](https://docs.stripe.com/testing) (e.g. `4242 4242 4242 4242`, any future expiry, any CVC).

The success page also has a fallback: if the webhook hasn't landed yet (common without the CLI running), it verifies the session directly with Stripe and confirms the booking itself — so the flow still works correctly even without `stripe listen`.

---

## Swapping mock adapters for real providers

The core architectural goal: **business logic never talks to a data source directly — it talks to an interface.** Each vertical has a small adapter layer under `src/services/`:

```
src/services/flights/   types.ts (FlightProvider interface) · mockProvider.ts · index.ts (factory)
src/services/hotels/    types.ts (HotelProvider interface)  · mockProvider.ts · index.ts (factory)
src/services/tours/     types.ts (TourProvider interface)   · mockProvider.ts · index.ts (factory)
src/services/email/     types.ts (EmailProvider interface)  · mockAdapter.ts  · index.ts (factory)
```

Each `index.ts` reads an env var (`FLIGHT_PROVIDER`, `HOTEL_PROVIDER`, `TOUR_PROVIDER`, `EMAIL_PROVIDER`) and picks an implementation. To go live:

1. Implement the interface (e.g. `AmadeusFlightProvider implements FlightProvider`) calling the real API (Amadeus Self-Service/NDC, Duffel, Sabre for flights; Expedia Rapid or a channel manager for hotels; a DMC feed for tours; Resend/SendGrid for email).
2. Add a `case` for it in the corresponding `index.ts` factory.
3. Set the env var. Nothing in `src/app/`, the booking/checkout logic (`src/services/booking.ts`), or the UI needs to change — they only ever import the exported `flightProvider` / `hotelProvider` / `tourProvider` / `emailProvider`, never a concrete class.

Payments follow the same idea: `src/lib/stripe.ts` is the one place that constructs the Stripe client, gated on whether a key is present.

---

## What's mock/demo vs. production-ready

**Demo / mock (clearly labeled in code):**
- Flight, hotel, and tour inventory — generated by `prisma/seed.ts`, served by the `Mock*Provider` classes.
- Payments — real Stripe Checkout code path exists, but falls back to instant mock confirmation without API keys.
- Transactional email — logs to console + an `EmailLog` table instead of sending real mail.
- FX rates — a static table (`FxRate` model), not a live rates feed.
- Local database — SQLite by default (see below for why, and how to move to Postgres).

**Production-style (the actual architecture, not a stand-in):**
- Auth (bcrypt-hashed passwords, Auth.js JWT sessions, role-based admin gate re-checked in a data-access layer on every protected page/action — not just middleware).
- Database schema (normalized, cents-based money to avoid float bugs, portable across SQLite/Postgres/MySQL).
- Checkout correctness: server re-validates every cart item's live price/availability before charging anything; inventory is reserved atomically and released on cancellation/expiry; promo codes are validated server-side (min spend, expiry, usage caps, applicable verticals).
- Input validation (Zod) and error handling on every mutating action.
- Admin CRUD, search/filter/pagination, and analytics query real data, not fixtures.

---

## Database

Prisma schema: `prisma/schema.prisma`. It intentionally avoids Postgres-only features (no native enums, no native arrays — those become plain `String`/CSV columns with app-level typing) so the identical schema works unchanged on SQLite, PostgreSQL, or MySQL.

**Local dev defaults to SQLite** (`DATABASE_URL="file:./dev.db"`, driven via `@prisma/adapter-libsql` so no native build tools are required on Windows/Mac/Linux). This was a pragmatic call for a zero-install "clone and run" experience — SQLite here is a real embedded relational database, not flat files, and the schema was written to be Postgres-safe from day one.

### Swapping the database (e.g. to Postgres for production)

1. Get a Postgres instance (Docker, a managed free tier like Neon/Supabase, or local Postgres).
2. In `prisma/schema.prisma`, change:
   ```prisma
   datasource db {
     provider = "postgresql"
   }
   ```
3. In `src/lib/db.ts`, swap the driver adapter:
   ```ts
   import { PrismaPg } from "@prisma/adapter-pg"; // npm install @prisma/adapter-pg
   const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
   ```
4. Set `DATABASE_URL` to your Postgres connection string.
5. `npm run db:migrate && npm run db:seed`.

No application code outside those two files needs to change.

A `docker-compose.yml` is not included by default (this environment didn't have Docker available to test against), but any standard Postgres 16 container works with the steps above.

---

## Admin dashboard

Log in as `admin@ota-demo.test` and visit `/admin`:

- **Overview** — bookings/revenue over the last 30 days, top destinations, key stats.
- **Bookings** — search by reference/name/email, filter by status, cancel (releases held inventory).
- **Flights / Hotels / Tours** — full CRUD, including nested fare classes / room types / departure dates.
- **Promo Codes** — percent or fixed discounts, min spend, usage caps, per-vertical eligibility.
- **CMS Pages** — Markdown-authored destination guides served at `/destinations/:slug`.

---

## Project structure

```
prisma/                   schema, migrations, seed script
src/
  app/                    routes (App Router) — pages, layouts, Route Handlers
    admin/                admin dashboard (requires role=admin)
    api/                  Stripe webhook, voucher PDF download, NextAuth route
    account/              customer itinerary/dashboard
    checkout/              success/cancel pages
    flights/ hotels/ tours/ destinations/   public booking + CMS pages
  components/             UI (design system), feature components, layout
  lib/                    db client, auth config, session guards, money/FX, actions
  services/               booking-service adapters (flights/hotels/tours/email) + core booking logic
  store/                  Zustand client state (cart, currency)
```

---

## Handoff notes (architecture decisions, briefing a client)

- **One Next.js app, not a separate frontend/backend.** Route Handlers under `src/app/api/` form a conventional REST-ish API surface (`/api/webhooks/stripe`, `/api/vouchers/:id`, `/api/auth/*`); a future mobile client can call the same endpoints, or we add a thin `/api/v1/` layer over the existing `src/services/` functions without touching the web UI.
- **Adapter pattern is the load-bearing decision.** Every external dependency that will eventually be a paid contract (GDS, hotel channel manager, tour supplier feed, payment processor, email provider) sits behind a narrow interface with exactly one call site (`index.ts` factory). This was chosen specifically so "go live" is a swap-and-configure exercise, not a rewrite.
- **Money is integer cents in USD**, converted to display currencies only in the UI layer via a static FX table. This avoids float rounding bugs and keeps Stripe amounts unambiguous; multi-currency is a display feature here, not a settlement feature (real multi-currency settlement would mean per-currency Stripe accounts or a payment orchestrator — out of scope for a demo).
- **Cart is client-side (localStorage via Zustand), not server-persisted.** Simpler for a demo; the tradeoff is no cross-device cart continuity. The server never trusts client-sent prices — `src/services/booking.ts` re-fetches and re-validates every item against live inventory before charging anything.
- **Inventory reservation is pessimistic**: seats/rooms are decremented at checkout-session creation, not on payment success, with compensating release on cancel/expiry. This avoids a worse failure mode (charging a customer for something that sold out between session creation and payment).
- **Auth is Data-Access-Layer style, not middleware-only.** Next.js 16 changed guidance here: layouts don't re-render on client-side nav and proxy (formerly `middleware.ts`) matchers can miss Server Action POSTs, so `src/proxy.ts` is only an optimistic redirect — every admin/account page and Server Action re-checks the session itself (`src/lib/session.ts`).
- **OAuth is one provider away.** `@auth/prisma-adapter` is already installed; adding Google/GitHub login means adding the provider to `src/lib/auth.ts`, adding the `Account`/`Session` tables Auth.js expects, and switching session strategy from JWT to database-backed if you want revocable sessions.

## Phase 2 (not built, by design)

- **Native iOS/Android apps.** The API surface under `src/app/api/` and the adapter-based `src/services/` layer are meant to be reusable by a future mobile client with minimal duplication — the booking/pricing/validation logic already lives server-side, not in React components.
- **Live GDS/payment contracts.** Requires signed business agreements this project doesn't have; the adapter pattern above is exactly the seam where that work plugs in.
- **App store submission/deployment.**

## Deploying

Any Next.js-compatible host works (Vercel, Netlify, etc.). Set the environment variables above in your host's dashboard, point `DATABASE_URL` at a real Postgres instance (see "Swapping the database"), run migrations against it (`npx prisma migrate deploy`), and seed if you want demo data in the deployed environment.
