import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config shared between the full Node.js auth instance
 * (src/auth.ts, which adds the Prisma-backed Credentials provider) and the
 * lightweight instance used in middleware.ts. Middleware runs in a runtime
 * that can't load the Postgres driver, so it must never import the
 * Credentials provider or Prisma — this file intentionally has zero
 * providers and zero database access.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.staffRole = token.staffRole;
      session.user.merchantId = token.merchantId;
      session.user.merchantStatus = token.merchantStatus;
      return session;
    },
  },
} satisfies NextAuthConfig;
