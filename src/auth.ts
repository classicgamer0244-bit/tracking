import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { authConfig } from "@/auth.config";
import type { PlatformRole, StaffRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: PlatformRole;
      staffRole: StaffRole | null;
      merchantId: string | null;
      merchantStatus: string | null;
    };
  }
  interface User {
    role: PlatformRole;
    staffRole: StaffRole | null;
    merchantId: string | null;
    merchantStatus: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: PlatformRole;
    staffRole: StaffRole | null;
    merchantId: string | null;
    merchantStatus: string | null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        identifier: { label: "Email or username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const identifier = credentials?.identifier as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!identifier || !password) return null;

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }],
          },
          include: { merchant: true },
        });
        if (!user) return null;
        if (user.status !== "ACTIVE") return null;

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;

        if (user.role !== "SUPER_ADMIN") {
          if (!user.merchant || user.merchant.status !== "ACTIVE") return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          staffRole: user.staffRole,
          merchantId: user.merchantId,
          merchantStatus: user.merchant?.status ?? null,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.staffRole = user.staffRole;
        token.merchantId = user.merchantId;
        token.merchantStatus = user.merchantStatus;
      }
      return token;
    },
  },
});
