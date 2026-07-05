import Link from "next/link";
import { requireAdmin } from "@/lib/session";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/flights", label: "Flights" },
  { href: "/admin/hotels", label: "Hotels" },
  { href: "/admin/tours", label: "Tours" },
  { href: "/admin/promos", label: "Promo Codes" },
  { href: "/admin/content", label: "CMS Pages" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
      <aside className="shrink-0 lg:w-56">
        <div className="mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Admin</h2>
        </div>
        <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
