/**
 * Absolute base URL of this deployment, for Stripe redirect URLs and
 * absolute links in emails.
 *
 * Prefers an explicit APP_URL (recommended — set it in Vercel to your
 * production domain). Falls back to Vercel's own env vars, in order:
 *   1. VERCEL_PROJECT_PRODUCTION_URL — the stable assigned production
 *      domain (what you'd bookmark and share). This is the one that
 *      respects a "Standard Protection" Deployment Protection setting
 *      that leaves the production alias public.
 *   2. VERCEL_URL — the current deployment's own unique per-deployment
 *      URL. Useful on preview deployments (there's no single "production"
 *      URL for those), but on a production deployment this is a
 *      hash-suffixed URL that stays behind Deployment Protection even
 *      when the stable alias doesn't — sending Stripe's redirect here
 *      would bounce real customers to a Vercel login wall after paying.
 * Finally falls back to localhost for local dev.
 */
export function getAppUrl(): string {
  if (process.env.APP_URL) return process.env.APP_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
