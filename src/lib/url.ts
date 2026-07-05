/**
 * Absolute base URL of this deployment, for Stripe redirect URLs and
 * absolute links in emails. Prefers an explicit APP_URL (recommended — set
 * it in Vercel to your production domain), falls back to Vercel's
 * auto-provided VERCEL_URL (works out of the box on preview/prod
 * deployments even if APP_URL is forgotten), then to localhost for local
 * dev.
 */
export function getAppUrl(): string {
  if (process.env.APP_URL) return process.env.APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
