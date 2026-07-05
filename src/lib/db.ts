import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";

// Swapping to Postgres/MySQL in production: replace this adapter with
// @prisma/adapter-pg (or the mysql equivalent) pointed at DATABASE_URL, and
// change the `provider` in prisma/schema.prisma. No other app code changes.
const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? "file:./dev.db" });

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
