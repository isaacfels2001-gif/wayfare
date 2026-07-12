import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Explore</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/flights" className="hover:text-slate-900">Flights</Link></li>
              <li><Link href="/hotels" className="hover:text-slate-900">Hotels</Link></li>
              <li><Link href="/tours" className="hover:text-slate-900">Tour Packages</Link></li>
              <li><Link href="/destinations" className="hover:text-slate-900">Destinations</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Account</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/account" className="hover:text-slate-900">My Trips</Link></li>
              <li><Link href="/login" className="hover:text-slate-900">Log In</Link></li>
              <li><Link href="/register" className="hover:text-slate-900">Sign Up</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Company</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><span className="cursor-default">About (demo)</span></li>
              <li><span className="cursor-default">Support (demo)</span></li>
              <li><span className="cursor-default">Careers (demo)</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Trust &amp; Safety</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>Secure checkout (Stripe test mode)</li>
              <li>Free cancellation on select rates</li>
              <li>24/7 support (demo)</li>
              <li><Link href="/privacy" className="hover:text-slate-900">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-6 text-xs text-slate-500">
          Wayfare is a portfolio demo. All inventory, pricing, and payments are simulated — no real bookings are made and no real charges occur.
        </div>
      </div>
    </footer>
  );
}