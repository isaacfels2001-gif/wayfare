import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

// Next.js evaluates this module's top level even for routes it ultimately
// renders dynamically (e.g. its speculative static-optimization attempt for
// /_not-found, which every route's layout chain runs through) — so this
// check must not fire during `next build` itself, only at actual runtime,
// or it takes the whole build down whenever DATABASE_URL isn't available in
// the build environment. getFxRates() already has its own try/catch for the
// same reason; this just gives an earlier, clearer error at real request
// time instead of a cryptic connection-refused error deep in `pg`.
if (!process.env.DATABASE_URL && process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env (locally) or set it in your host's environment variables (see README \"Deploying to Vercel\")."
  );
}

// Swapping to a different SQL database later: change `provider` in
// prisma/schema.prisma and swap this adapter (e.g. @prisma/adapter-mysql2).
// No other app code changes — everything else talks to `prisma`, never to
// a concrete driver.
//
// `max: 1` keeps each serverless function instance's own connection count
// low; use your database provider's pooled/PgBouncer connection string (on
// Neon, the "Pooled connection" string) for DATABASE_URL so concurrent
// invocations don't exhaust the database's connection limit.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: process.env.NODE_ENV === "production" ? 1 : 5,
});

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
