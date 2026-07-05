"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItemType = "flight" | "hotel" | "tour";

export interface CartItem {
  id: string;
  type: CartItemType;
  title: string;
  subtitle: string;
  image?: string;
  startDate: string;
  endDate: string;
  quantity: number;
  unitPriceCents: number;
  /** Type-specific IDs needed to re-validate price/availability server-side at checkout. */
  ref: Record<string, string | number>;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  subtotalCents: () => number;
}

/**
 * Cart lives client-side (persisted to localStorage) until checkout, when the
 * server re-validates every item against live inventory/pricing before
 * creating the Stripe session — the client cart is never trusted for price.
 * A production build might additionally persist this server-side per-user
 * for cross-device continuity; out of scope for this demo.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
      subtotalCents: () => get().items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0),
    }),
    { name: "ota-cart" }
  )
);
