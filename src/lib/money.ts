export interface FxRateMap {
  [code: string]: { rateToUsd: number; symbol: string; name: string };
}

/** Convert a USD-cents amount into another currency's minor units, using a static rate table (demo FX — see FxRate model). */
export function convertCents(usdCents: number, targetCurrency: string, rates: FxRateMap): number {
  const rate = rates[targetCurrency];
  if (!rate || targetCurrency === "USD") return usdCents;
  return Math.round(usdCents * rate.rateToUsd);
}

/** Format minor units as a display string, e.g. 129900 -> "$1,299.00". JPY has no minor unit. */
export function formatMoney(amountMinorUnits: number, currency: string, rates: FxRateMap): string {
  const rate = rates[currency];
  const symbol = rate?.symbol ?? "$";
  const isZeroDecimal = currency === "JPY";
  const amount = isZeroDecimal ? amountMinorUnits : amountMinorUnits / 100;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: isZeroDecimal ? 0 : 2,
    maximumFractionDigits: isZeroDecimal ? 0 : 2,
  }).format(amount);
  return `${symbol}${formatted}`;
}

export function formatUsdCentsAs(usdCents: number, currency: string, rates: FxRateMap): string {
  return formatMoney(convertCents(usdCents, currency, rates), currency, rates);
}
