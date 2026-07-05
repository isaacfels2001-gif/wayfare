import { prisma } from "@/lib/db";
import { Card, CardBody } from "@/components/ui/Card";
import { BookingsOverTimeChart, RevenueOverTimeChart, TopDestinationsChart } from "@/components/admin/AnalyticsCharts";
import { formatMoney } from "@/lib/money";

const usdRate = { USD: { rateToUsd: 1, symbol: "$", name: "US Dollar" } };

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function extractDestination(item: { type: string; detailsJson: string }): string {
  try {
    const details = JSON.parse(item.detailsJson) as Record<string, unknown>;
    const offer = details.offer as Record<string, unknown> | undefined;
    if (item.type === "flight") return (offer?.destinationCity as string) ?? "Unknown";
    if (item.type === "hotel") return (offer?.city as string) ?? "Unknown";
    if (item.type === "tour") return (offer?.destination as string) ?? "Unknown";
  } catch {
    // ignore malformed legacy rows
  }
  return "Unknown";
}

export default async function AdminOverviewPage() {
  const thirtyDaysAgo = new Date(new Date().getTime() - 30 * 86400000);

  const [totalBookings, confirmedBookings, recentBookings, activePromoCount, allItems] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.findMany({ where: { status: "confirmed" }, select: { totalCents: true } }),
    prisma.booking.findMany({
      where: { createdAt: { gte: thirtyDaysAgo }, status: { not: "cancelled" } },
      select: { createdAt: true, totalCents: true, status: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.promoCode.count({ where: { active: true } }),
    prisma.bookingItem.findMany({ select: { type: true, detailsJson: true } }),
  ]);

  const totalRevenueCents = confirmedBookings.reduce((sum, b) => sum + b.totalCents, 0);
  const avgOrderValueCents = confirmedBookings.length > 0 ? Math.round(totalRevenueCents / confirmedBookings.length) : 0;

  const byDay = new Map<string, { revenue: number; bookings: number }>();
  for (let i = 29; i >= 0; i--) {
    byDay.set(dayKey(new Date(new Date().getTime() - i * 86400000)), { revenue: 0, bookings: 0 });
  }
  for (const b of recentBookings) {
    const key = dayKey(b.createdAt);
    const entry = byDay.get(key);
    if (entry) {
      entry.bookings += 1;
      if (b.status === "confirmed") entry.revenue += b.totalCents;
    }
  }
  const chartData = [...byDay.entries()].map(([day, v]) => ({
    day: day.slice(5),
    revenue: v.revenue,
    bookings: v.bookings,
  }));

  const destinationCounts = new Map<string, number>();
  for (const item of allItems) {
    const dest = extractDestination(item);
    destinationCounts.set(dest, (destinationCounts.get(dest) ?? 0) + 1);
  }
  const topDestinations = [...destinationCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([destination, count]) => ({ destination, count }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
      <p className="mt-1 text-sm text-slate-500">Bookings, revenue, and demand across all verticals.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Total bookings" value={totalBookings.toLocaleString()} />
        <StatTile label="Confirmed revenue" value={formatMoney(totalRevenueCents, "USD", usdRate)} />
        <StatTile label="Avg. order value" value={formatMoney(avgOrderValueCents, "USD", usdRate)} />
        <StatTile label="Active promo codes" value={activePromoCount.toLocaleString()} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardBody>
            <h2 className="text-sm font-semibold text-slate-900">Revenue — last 30 days</h2>
            <div className="mt-2">
              <RevenueOverTimeChart data={chartData} />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h2 className="text-sm font-semibold text-slate-900">Bookings — last 30 days</h2>
            <div className="mt-2">
              <BookingsOverTimeChart data={chartData} />
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardBody>
          <h2 className="text-sm font-semibold text-slate-900">Top destinations (by booked items)</h2>
          <div className="mt-2">
            {topDestinations.length === 0 ? (
              <p className="text-sm text-slate-500">No bookings yet.</p>
            ) : (
              <TopDestinationsChart data={topDestinations} />
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardBody>
        <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
        <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
      </CardBody>
    </Card>
  );
}
