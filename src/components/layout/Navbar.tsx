import { auth } from "@/lib/auth";
import { NavbarClient } from "./NavbarClient";

export async function Navbar() {
  const session = await auth();
  return <NavbarClient user={session?.user ? { name: session.user.name, email: session.user.email, role: session.user.role } : null} />;
}
