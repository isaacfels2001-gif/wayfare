import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Data-Access-Layer style guards. Next.js 16 no longer treats middleware/proxy
 * or layouts as sufficient auth boundaries (layouts don't re-render on client
 * navigation, and proxy matchers can miss Server Action POSTs) — so every
 * page/action that needs a session re-checks it here.
 */
export async function getSession() {
  return auth();
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session.user;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "admin") {
    redirect("/account");
  }
  return session.user;
}
