import "server-only";
import { prisma } from "@/lib/db";
import type { FxRateMap } from "@/lib/money";

/**
 * Static demo FX table (see FxRate model / seed data). A production build
 * would refresh this from a live rates API on a schedule; the read shape
 * here (`FxRateMap`) would stay the same either way.
 */
export async function getFxRates(): Promise<FxRateMap> {
  const rows = await prisma.fxRate.findMany();
  const map: FxRateMap = {};
  for (const row of rows) {
    map[row.code] = { rateToUsd: row.rateToUsd, symbol: row.symbol, name: row.name };
  }
  return map;
}
