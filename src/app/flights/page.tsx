import Link from "next/link";
import { redirect } from "next/navigation";
import { flightProvider } from "@/services/flights";
import type { CabinClass } from "@/services/flights/types";
import { FlightSearchForm } from "@/components/flights/FlightSearchForm";
import { FlightCard } from "@/components/flights/FlightCard";
import { cn } from "@/lib/cn";

function defaultDepartDate() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

function buildQuery(params: Record<string, string | undefined>, overrides: Record<string, string>) {
  const merged = { ...params, ...overrides };
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value) search.set(key, value);
  }
  return `/flights?${search.toString()}`;
}

export default async function FlightsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const origin = params.origin;
  const destination = params.destination;
  const departDate = params.departDate;

  if (!origin || !destination || !departDate) {
    redirect(
      `/flights?origin=${origin ?? "JFK"}&destination=${destination ?? "LAX"}&departDate=${departDate ?? defaultDepartDate()}&passengers=${params.passengers ?? "1"}`
    );
  }

  const passengers = Math.max(1, Math.min(9, Number(params.passengers) || 1));
  const cabin = (params.cabin || undefined) as CabinClass | undefined;
  const sort = params.sort === "duration" ? "duration" : "price";
  const nonstopOnly = params.stops === "nonstop";

  let flights = await flightProvider.search({ origin, destination, departDate, passengers, cabin });

  if (nonstopOnly) {
    flights = flights.filter((f) => f.stops === 0);
  }

  flights = [...flights].sort((a, b) => {
    if (sort === "duration") return a.durationMinutes - b.durationMinutes;
    const aMin = Math.min(...a.fares.map((f) => f.priceUsdCents));
    const bMin = Math.min(...b.fares.map((f) => f.priceUsdCents));
    return aMin - bMin;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Search flights</h1>
      <p className="mt-1 text-sm text-slate-500">Mock inventory for demo purposes — see README for how a real GDS adapter plugs in here.</p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <FlightSearchForm defaults={{ origin, destination, departDate, passengers: String(passengers), cabin }} />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {flights.length} flight{flights.length === 1 ? "" : "s"} found
        </p>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-500">Sort:</span>
          <Link href={buildQuery(params, { sort: "price" })} className={cn("rounded-full px-3 py-1", sort === "price" ? "bg-blue-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-300")}>
            Cheapest
          </Link>
          <Link href={buildQuery(params, { sort: "duration" })} className={cn("rounded-full px-3 py-1", sort === "duration" ? "bg-blue-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-300")}>
            Fastest
          </Link>
          <span className="ml-3 text-slate-500">Stops:</span>
          <Link href={buildQuery(params, { stops: "" })} className={cn("rounded-full px-3 py-1", !nonstopOnly ? "bg-blue-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-300")}>
            Any
          </Link>
          <Link href={buildQuery(params, { stops: "nonstop" })} className={cn("rounded-full px-3 py-1", nonstopOnly ? "bg-blue-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-300")}>
            Nonstop only
          </Link>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {flights.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            No flights found for this route/date. Try New York (JFK) ↔ Los Angeles (LAX), London (LHR), Miami (MIA), or San Francisco (SFO) ↔ Tokyo (NRT).
          </div>
        )}
        {flights.map((flight) => (
          <FlightCard key={flight.flightId} flight={flight} passengers={passengers} />
        ))}
      </div>
    </div>
  );
}
