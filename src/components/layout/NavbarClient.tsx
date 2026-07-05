"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Plane } from "lucide-react";
import { cn } from "@/lib/cn";
import { CartIndicator } from "@/components/cart/CartIndicator";
import { CurrencySwitcher } from "@/components/currency/CurrencySwitcher";
import { logoutAction } from "@/lib/actions/auth";

const NAV_LINKS = [
  { href: "/flights", label: "Flights" },
  { href: "/hotels", label: "Hotels" },
  { href: "/tours", label: "Tours" },
  { href: "/destinations", label: "Destinations" },
];

interface NavUser {
  name?: string | null;
  email?: string | null;
  role: string;
}

export function NavbarClient({ user }: { user: NavUser | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-1.5 text-lg font-bold text-slate-900">
            <Plane className="h-5 w-5 text-blue-600" />
            Wayfare
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium text-slate-600 hover:text-slate-900",
                  pathname.startsWith(link.href) && "text-blue-600 hover:text-blue-700"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <CurrencySwitcher />
          <CartIndicator />
          {user ? (
            <div className="flex items-center gap-3">
              {user.role === "admin" && (
                <Link href="/admin" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                  Admin
                </Link>
              )}
              <Link href="/account" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                My Trips
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                  Log out
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        <button
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex items-center justify-between">
            <CurrencySwitcher />
            <CartIndicator />
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {user ? (
              <>
                {user.role === "admin" && (
                  <Link href="/admin" className="rounded-md px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Admin
                  </Link>
                )}
                <Link href="/account" className="rounded-md px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  My Trips
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className="w-full rounded-md px-2 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-md px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Log in
                </Link>
                <Link href="/register" className="rounded-md bg-blue-600 px-2 py-2 text-center text-sm font-medium text-white hover:bg-blue-700">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
