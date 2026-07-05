import Link from "next/link";
import { ShieldCheck, BadgePercent, Headset } from "lucide-react";
import { prisma } from "@/lib/db";
import { tourProvider } from "@/services/tours";
import { HomeSearchTabs } from "@/components/home/HomeSearchTabs";
import { TourCard } from "@/components/tours/TourCard";

export default async function Home() {
  const [tours, destinations] = await Promise.all([
    tourProvider.list().then((t) => t.slice(0, 3)),
    prisma.contentPage.findMany({ where: { published: true }, take: 3 }),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 to-blue-500 px-4 pb-24 pt-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Flights, hotels, and tours — booked in one place</h1>
          <p className="mx-auto mt-4 max-w-2xl text-blue-100">
            Search live-style mock inventory, compare prices in your currency, and check out once for your whole trip.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-4xl">
          <HomeSearchTabs />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="-mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TrustCard icon={<ShieldCheck className="h-5 w-5" />} title="Secure checkout" text="Stripe test-mode payments, PCI-compliant by design." />
          <TrustCard icon={<BadgePercent className="h-5 w-5" />} title="Transparent pricing" text="No hidden fees — the price you see is the price you pay." />
          <TrustCard icon={<Headset className="h-5 w-5" />} title="24/7 support" text="Demo support desk — always just a click away." />
        </div>
      </section>

      {destinations.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-slate-900">Popular destinations</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {destinations.map((d) => (
              <Link
                key={d.slug}
                href={`/destinations/${d.slug}`}
                className="group relative block h-48 overflow-hidden rounded-xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.heroImage} alt={d.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-3 left-4 text-lg font-semibold text-white">{d.title.replace(" Travel Guide", "")}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Featured tour packages</h2>
          <Link href="/tours" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View all →
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {tours.map((tour) => (
            <TourCard key={tour.tourId} tour={tour} />
          ))}
        </div>
      </section>
    </div>
  );
}

function TrustCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="rounded-lg bg-blue-50 p-2 text-blue-600">{icon}</div>
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500">{text}</p>
      </div>
    </div>
  );
}
