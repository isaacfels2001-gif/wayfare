"use client";

import { useCurrencyStore } from "@/store/currency";
import { useFxRates } from "@/components/currency/CurrencyProvider";
import { formatUsdCentsAs } from "@/lib/money";
import { cn } from "@/lib/cn";

export function Price({ usdCents, className }: { usdCents: number; className?: string }) {
  const currency = useCurrencyStore((s) => s.currency);
  const rates = useFxRates();
  return <span className={cn(className)}>{formatUsdCentsAs(usdCents, currency, rates)}</span>;
}
