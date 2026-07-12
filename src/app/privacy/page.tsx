import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Wayfare",
  description: "How Wayfare handles your information. Portfolio demo — mock data, Stripe test mode.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: July 2026</p>

      <p className="mt-6 text-slate-700">
        Wayfare is a portfolio/demo project. It is not a real travel agency, and no real bookings, payments, or
        trips happen here. This page explains what happens to your information if you use the demo.
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">What we collect</h2>
        <p className="mt-3 text-slate-700">If you create an account, we store:</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
          <li>Your name and email address</li>
          <li>A securely hashed version of your password (we never store or see your actual password)</li>
        </ul>
        <p className="mt-3 text-slate-700">
          If you go through checkout, payments are processed by Stripe in test mode. No real payment card is
          charged, and we do not store card details — Stripe handles that, and no money ever moves.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">What we don&apos;t collect</h2>
        <p className="mt-3 text-slate-700">
          We don&apos;t collect real booking or travel data, since all flights, hotels, and tours on this site are
          fictional/mock data.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">How your information is used</h2>
        <p className="mt-3 text-slate-700">
          Solely to let the demo function — logging in, viewing &quot;My Trips,&quot; etc. It is not sold, shared,
          rented, or used for marketing, and is not passed to any third party except Stripe (for the checkout demo)
          and our hosting/database providers (Vercel, Neon) who run the infrastructure.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Data retention &amp; deletion</h2>
        <p className="mt-3 text-slate-700">
          Since this is a demo, data is kept only as long as needed to demonstrate the site&apos;s functionality. If
          you&apos;d like your account data deleted, contact us at{" "}
          <a href="mailto:isaacfels2001@gmail.com" className="text-blue-600 hover:text-blue-700">
            isaacfels2001@gmail.com
          </a>{" "}
          and we&apos;ll remove it.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Security</h2>
        <p className="mt-3 text-slate-700">
          Passwords are hashed, not stored in plain text. The site uses standard authentication practices
          (Auth.js). As with any demo project, please don&apos;t enter real passwords you use elsewhere, or any
          sensitive personal information beyond what&apos;s needed to test the signup flow.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
        <p className="mt-3 text-slate-700">
          Questions about this policy or your data:{" "}
          <a href="mailto:isaacfels2001@gmail.com" className="text-blue-600 hover:text-blue-700">
            isaacfels2001@gmail.com
          </a>
        </p>
      </section>

      <div className="mt-12 border-t border-slate-200 pt-6">
        <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          ← Back to Wayfare
        </Link>
      </div>
    </div>
  );
}