"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { FlightSearchForm } from "@/components/flights/FlightSearchForm";
import { HotelSearchForm } from "@/components/hotels/HotelSearchForm";

const TABS = ["flights", "hotels", "tours"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABEL: Record<Tab, string> = { flights: "Flights", hotels: "Hotels", tours: "Tours" };

export function HomeSearchTabs() {
  const [tab, setTab] = useState<Tab>("flights");

  return (
    <div className="rounded-2xl bg-white p-4 shadow-lg sm:p-6">
      <div className="flex gap-1 border-b border-slate-100 pb-3">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold",
              tab === t ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>
      <div className="pt-4">
        {tab === "flights" && <FlightSearchForm defaults={{}} />}
        {tab === "hotels" && <HotelSearchForm defaults={{}} />}
        {tab === "tours" && (
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">Browse our curated small-group tour packages.</p>
            <Link href="/tours" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
              Browse tours
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
