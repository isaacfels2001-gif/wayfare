"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SUPPORTED_CURRENCIES, type SupportedCurrency } from "@/lib/currencies";

interface CurrencyState {
  currency: SupportedCurrency;
  setCurrency: (c: SupportedCurrency) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: "USD",
      setCurrency: (c) => set({ currency: SUPPORTED_CURRENCIES.includes(c) ? c : "USD" }),
    }),
    { name: "ota-currency" }
  )
);
