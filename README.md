# Wayfare — Online Travel Agency (Portfolio Demo)

A full-stack OTA web app: search and book flights, hotels, and curated tour packages, combine them in a single cart/checkout, pay with Stripe (test mode), and manage everything from an admin dashboard. Built as a portfolio-quality demo — polished UI and a real end-to-end booking flow, backed by mock inventory instead of live GDS contracts.

**Stack:** Next.js 16 (App Router, TypeScript) for both the frontend and the API layer (Route Handlers + Server Actions), Prisma ORM on Postgres, Auth.js (NextAuth v5, credentials provider), Stripe Checkout (test mode), Tailwind CSS v4, Zustand, Recharts, pdf-lib. One codebase, one deploy target — see "Handoff notes" for the reasoning.

---

## Live demo

- **URL:** https://wayfare-gg7y.vercel.app
- **Customer login:** `customer@ota-demo.test` / `Traveler123!` (or register your own — no real email is required)
- **Admin login:** `admin@ota-demo.test` / `Admin123!`
- Checkout runs real Stripe Checkout in test mode — use card `4242 4242 4242 4242`, any future expiry, any CVC.

---

## Quick start

Prerequisites: Node.js 20+, npm, and a Postgres database (see "Database" below — Neon's free tier takes about a minute to set up and needs no credit card).

```bash
git clone <this-repo>
cd ota-platform
cp .env.example .env        # fill in DATABASE_URL and AUTH_SECRET, see below
npm install                 # also runs `prisma generate` via postinstall
npm run db:migrate           # applies the schema to your Postgres database
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
| `DATABASE_URL` | Postgres connection string (Neon "Pooled connection" recommended). Required. |
| `AUTH_SECRET` | Session signing secret for Auth.js. Required. |
| `APP_URL` | Base URL used for Stripe redirect URLs and email links. Strongly recommended to set explicitly on Vercel — see the callout below. |
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

**Production-style (the actual architecture, not a stand-in):**
- Auth (bcrypt-hashed passwords, Auth.js JWT sessions, role-based admin gate re-checked in a data-access layer on every protected page/action — not just middleware).
- Database schema (normalized, cents-based money to avoid float bugs, portable across SQLite/Postgres/MySQL).
- Checkout correctness: server re-validates every cart item's live price/availability before charging anything; inventory is reserved atomically and released on cancellation/expiry; promo codes are validated server-side (min spend, expiry, usage caps, applicable verticals).
- Input validation (Zod) and error handling on every mutating action.
- Admin CRUD, search/filter/pagination, and analytics query real data, not fixtures.

---

## Database

Prisma schema: `prisma/schema.prisma`. It intentionally avoids Postgres-only features (no native enums, no native arrays — those become plain `String`/CSV columns with app-level typing) so the identical schema works unchanged on PostgreSQL, MySQL, or SQLite.

**Postgres is the standard datasource, for both local dev and production**, via `@prisma/adapter-pg` (the standard `pg` driver — pure JS, no native build step, works the same locally and on serverless). One database works fine for both; Neon also supports free branching if you'd rather keep dev/prod data separate later.

### Why Neon

Vercel's dashboard surfaces Neon and Supabase as first-class "Storage" integrations (Neon originally *was* the engine behind "Vercel Postgres" before that product was folded into the Marketplace). Neon was chosen here because:
- It's Postgres-only and nothing more — this project just needs a connection string, not an accompanying auth/storage platform.
- Free tier, no credit card required, provisions in under a minute.
- A **pooled connection string** (PgBouncer-based) is offered out of the box, which is what serverless functions on Vercel need to avoid exhausting Postgres's connection limit.
- It plugs into Vercel's dashboard directly (Storage tab), so the connection string can be added to your project without leaving Vercel.

Supabase is an equally valid choice if you'd rather have a project that can later grow into auth/storage/realtime — swapping is just a different connection string, no code changes either way.

### Setting up Neon (one-time, ~2 minutes)

1. Go to **https://neon.tech** and sign up (GitHub login is the fastest option). Free tier, no credit card.
2. Create a project (any name/region is fine — pick a region close to where you'll deploy on Vercel).
3. On the project dashboard, find the **Connection string** panel. Switch it to **"Pooled connection"** (sometimes labeled "Pooler" — the hostname will contain `-pooler`).
4. Copy the full string — it looks like:
   ```
   postgresql://<user>:<password>@ep-xxxx-pooler.<region>.aws.neon.tech/<dbname>?sslmode=require
   ```
5. Paste it into `DATABASE_URL` in your `.env` (locally) and later into Vercel's environment variables (see "Deploying to Vercel").

### Applying the schema and seed data

```bash
npm run db:migrate   # applies prisma/migrations/*/migration.sql to your Postgres database
npm run db:seed       # inserts flights, hotels, tours, promo codes, FX rates, demo users
```

`db:migrate` runs `prisma migrate dev`, which will also prompt to create the database if it's empty. For a database that already has the schema applied (e.g. redeploying), use `npx prisma migrate deploy` instead, which doesn't need an interactive shadow-database step.

### Swapping to a different Postgres provider, or to MySQL

Nothing above is Neon-specific except the connection string itself — any Postgres works by just changing `DATABASE_URL`. To move to MySQL instead:
1. In `prisma/schema.prisma`, change `provider = "mysql"`.
2. In `src/lib/db.ts` and `prisma/seed.ts`, swap `@prisma/adapter-pg` for `@prisma/adapter-mariadb` (or the current MySQL driver adapter package).
3. Delete `prisma/migrations/` and regenerate with `npx prisma migrate dev` against the new database.

No application code outside those files needs to change.

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

## Deploying to Vercel

This app needs no special Vercel configuration — it's a stock Next.js App Router project (`vercel.json` is intentionally not included; Vercel auto-detects the framework, build command, and output). You need three things before you deploy: a GitHub repo with this code, a Neon database, and (optionally, for real Stripe test mode) Stripe test keys.

### 1. Push this repo to GitHub

If you haven't already:

```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

(If you don't have a GitHub repo yet: go to **https://github.com/new**, name it, leave it empty/no README — since this repo already has one — then run the two commands above with the URL it gives you.)

### 2. Get a Neon database

Follow "Setting up Neon" above if you haven't yet. Keep the pooled `DATABASE_URL` handy — you'll paste it into Vercel in step 4.

### 3. Create a Vercel account and import the project

1. Go to **https://vercel.com/signup** and sign up — **"Continue with GitHub" is the fastest path**, since it also grants Vercel access to import your repos in the next step. No credit card is required for the free (Hobby) plan.
2. Once logged in, click **"Add New..." → "Project"** (top right of the dashboard).
3. Under "Import Git Repository," find your repo (search by name) and click **Import**. If it doesn't show up, click "Adjust GitHub App Permissions" and grant Vercel access to that repo.
4. Vercel will auto-detect **Framework Preset: Next.js** and fill in the build command (`next build`) and output — leave these as-is.
5. **Don't click Deploy yet** — open "Environment Variables" on the same screen and add the variables from the table in step 4 below.
6. Once the env vars are in, click **Deploy**. First deploy takes 1–3 minutes.

### 4. Environment variables to paste into Vercel

In the Vercel project's **Settings → Environment Variables** (or the import screen in step 3), add each of these for the **Production** environment (and Preview, if you want preview deployments to also work):

| Variable | Value | What it's for |
|---|---|---|
| `DATABASE_URL` | Your Neon pooled connection string | Postgres connection |
| `AUTH_SECRET` | Output of `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` | Signs Auth.js session cookies |
| `APP_URL` | Your **stable** Vercel URL, e.g. `https://your-project.vercel.app` (from Settings → Domains — not a deployment-specific hash URL) | Used to build Stripe redirect URLs and email links. You won't know the exact URL until after the first deploy — deploy once, then come back and set this, then redeploy |
| `STRIPE_SECRET_KEY` | `sk_test_...` from your Stripe dashboard | Server-side Stripe API calls (see "Add Stripe test keys" below) |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` from your Stripe dashboard | Client-side Stripe.js (reserved for future use; Checkout redirect doesn't require it today) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` from your Stripe webhook endpoint | Verifies webhook requests are really from Stripe (see below) |
| `FLIGHT_PROVIDER` | `mock` | Selects the mock flight adapter |
| `HOTEL_PROVIDER` | `mock` | Selects the mock hotel adapter |
| `TOUR_PROVIDER` | `mock` | Selects the mock tour adapter |
| `EMAIL_PROVIDER` | `mock` | Selects the mock email adapter (logs instead of sending) |
| `EMAIL_FROM` | `bookings@ota-demo.test` | Cosmetic "from" address in logged emails |

Leave `STRIPE_*` blank if you just want the mock-payment fallback live — the app works fully either way (see "Payments").

> **Deployment Protection + `APP_URL` gotcha:** if your Vercel project has Deployment Protection set to "Standard Protection" (common on Team accounts), the stable production alias (`your-project.vercel.app`, from Settings → Domains) is public, but each specific *deployment's* own hash-suffixed URL (`your-project-<hash>-<team>.vercel.app`) stays behind a Vercel login wall even in production. `getAppUrl()` (`src/lib/url.ts`) falls back to Vercel's `VERCEL_PROJECT_PRODUCTION_URL` (the stable alias) if `APP_URL` isn't set, specifically to avoid Stripe's checkout redirect ever sending a paying customer to that login wall — but setting `APP_URL` explicitly to your stable alias is still the most reliable option and is what's recommended above.

### 5. Run migrations + seed against the production database

Vercel doesn't run `prisma migrate` or seed scripts automatically. Do it once from your local machine, pointed at the same Neon `DATABASE_URL` you gave Vercel:

```bash
# .env locally should have DATABASE_URL set to the same Neon connection string
npx prisma migrate deploy
npm run db:seed
```

(`migrate deploy` — not `migrate dev` — is the right command against a real deployed database; it applies existing migration files without prompting or needing a shadow database.)

### 6. Add real Stripe test keys

No code changes needed — this is entirely dashboard clicks:

1. Go to **https://dashboard.stripe.com/register** and sign up (email + password, or "Continue with Google"). No business details or payment info are required to get test-mode keys.
2. After signing up you land on the Stripe Dashboard, in **Test mode** by default (there's a "Test mode" toggle top-right — make sure it's on; it usually is for a new account).
3. Go to **https://dashboard.stripe.com/test/apikeys** (or Developers → API keys in the left nav).
4. Copy the **Publishable key** (`pk_test_...`) and click "Reveal test key" next to the **Secret key** (`sk_test_...`) to copy it too.
5. Paste both into Vercel's environment variables (`STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`) and redeploy (Vercel → Deployments → "..." menu on the latest deployment → Redeploy), or just push a new commit.
6. To get `STRIPE_WEBHOOK_SECRET`: in the Stripe Dashboard, go to **Developers → Webhooks → Add endpoint**. Endpoint URL: `https://your-project.vercel.app/api/webhooks/stripe`. Select the event `checkout.session.completed` (and optionally `checkout.session.expired`). Click "Add endpoint," then reveal and copy the **Signing secret** (`whsec_...`) into Vercel's `STRIPE_WEBHOOK_SECRET`, and redeploy.

Without step 6, checkout still works (the success page has its own fallback that confirms the booking directly if the webhook hasn't fired) — the webhook is what makes confirmation instant rather than reliant on that fallback.

### 7. Verify the live deployment

Visit your `https://your-project.vercel.app` URL and click through:

1. **Register** a new account (any email — nothing is actually emailed).
2. **Search a flight**: origin JFK, destination LAX, any date within the next ~45 days.
3. Click a fare (e.g. "Select economy") — confirm it says "Added to trip."
4. **Search a hotel** in New York (or LA/London/Tokyo/Miami/Paris), open a hotel, click "Select room."
5. Open **`/tours`**, open a package, pick a departure date, click "Add to trip."
6. Go to **`/cart`** — all three items should be listed together. Optionally apply promo code `WELCOME10`.
7. Click **"Proceed to checkout."** If Stripe keys are set, you're redirected to a real Stripe Checkout page — use the test card below. If not, you're taken straight to a confirmed booking (mock-payment fallback).
8. On the Stripe Checkout page: card number **`4242 4242 4242 4242`**, any future expiry date (e.g. `12/34`), any 3-digit CVC, any name/ZIP. Click Pay.
9. You should land on a **"Booking confirmed!"** page with an itemized receipt. Click **"Download voucher (PDF)"** — confirm a PDF downloads.
10. Click **"View my trips"** — the booking should be listed under `/account`.
11. Log out, log back in as **`admin@ota-demo.test`** / **`Admin123!`**, go to **`/admin`** — confirm the booking you just made shows up in the stats, revenue chart, and the Bookings list (`/admin/bookings`).

If any step 500s, check Vercel's **Deployments → (latest) → Functions/Logs** tab for the error — the most common cause is a missing/incorrect `DATABASE_URL` or `AUTH_SECRET`.

### A note on custom domains

Not required for a portfolio demo — the default `your-project.vercel.app` URL is a real, permanent, shareable HTTPS URL. If you add a custom domain later (Vercel → Settings → Domains), update `APP_URL` to match and redeploy.
