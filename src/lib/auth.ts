import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

// Credentials (email + password) is the only provider wired up today.
// To add Google/GitHub/etc. later: add the provider here, add the
// @auth/prisma-adapter (already installed) + Account/Session tables to
// prisma/schema.prisma, and switch session strategy from "jwt" to
// "database" if you want DB-backed sessions.
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  // Required when self-hosting behind a platform that terminates TLS/proxies
  // the Host header (Vercel, Netlify, Docker, a custom PORT locally, etc.) —
  // otherwise Auth.js rejects requests as an untrusted host in production.
  trustHost: true,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = typeof credentials?.email === "string" ? credentials.email.toLowerCase().trim() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          currency: user.currency,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: string }).role ?? "customer";
        token.currency = (user as { currency?: string }).currency ?? "USD";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "customer";
        session.user.currency = (token.currency as string) ?? "USD";
      }
      return session;
    },
  },
});
