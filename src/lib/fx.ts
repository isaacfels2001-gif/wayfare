import "server-only";
import { prisma } from "@/lib/db";
import type { FxRateMap } from "@/lib/money";

// Mirrors prisma/seed.ts's FxRate rows. Used only if the database is
// unreachable (e.g. Next.js prerendering the shared shell — the 404 page —
// at build time before any request context exists, or a transient outage at
// runtime) so a DB hiccup never hard-crashes every page via the root layout.
const FALLBACK_RATES: FxRateMap = {
  USD: { rateToUsd: 1, symbol: "$", name: "US Dollar" },
  EUR: { rateToUsd: 0.92, symbol: "€", name: "Euro" },
  GBP: { rateToUsd: 0.79, symbol: "£", name: "British Pound" },
  JPY: { rateToUsd: 155.4, symbol: "¥", name: "Japanese Yen" },
};

/**
 * Static demo FX table (see FxRate model / seed data). A production build
 * would refresh this from a live rates API on a schedule; the read shape
 * here (`FxRateMap`) would stay the same either way.
 */
export async function getFxRates(): Promise<FxRateMap> {
  try {
    const rows = await prisma.fxRate.findMany();
    if (rows.length === 0) return FALLBACK_RATES;
    const map: FxRateMap = {};
    for (const row of rows) {
      map[row.code] = { rateToUsd: row.rateToUsd, symbol: row.symbol, name: row.name };
    }
    return map;
  } catch (err) {
    console.error("getFxRates: falling back to static rates, database unreachable:", err);
    return FALLBACK_RATES;
  }
}
