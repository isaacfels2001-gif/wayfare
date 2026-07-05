import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

if (!process.env.DATABASE_URL) {
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
