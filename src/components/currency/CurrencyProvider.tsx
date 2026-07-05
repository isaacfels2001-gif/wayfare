"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { FxRateMap } from "@/lib/money";

const FxRatesContext = createContext<FxRateMap>({});

export function CurrencyProvider({ rates, children }: { rates: FxRateMap; children: ReactNode }) {
  return <FxRatesContext.Provider value={rates}>{children}</FxRatesContext.Provider>;
}

export function useFxRates() {
  return useContext(FxRatesContext);
}
