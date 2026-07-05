"use client";

import { useCurrencyStore } from "@/store/currency";
import { useFxRates } from "@/components/currency/CurrencyProvider";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";

export function CurrencySwitcher() {
  const currency = useCurrencyStore((s) => s.currency);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  const rates = useFxRates();

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value as (typeof SUPPORTED_CURRENCIES)[number])}
      aria-label="Display currency"
      className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
    >
      {SUPPORTED_CURRENCIES.map((code) => (
        <option key={code} value={code}>
          {code} {rates[code]?.symbol ?? ""}
        </option>
      ))}
    </select>
  );
}
