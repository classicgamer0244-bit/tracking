import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// A separate, edge-safe NextAuth instance — see auth.config.ts for why
// middleware can't use the full instance from @/auth (Prisma/Node driver).
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  const isSuperAdminRoute = pathname.startsWith("/super-admin");
  const isMerchantRoute = pathname.startsWith("/merchant");

  if (!isSuperAdminRoute && !isMerchantRoute) return NextResponse.next();

  if (!user) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isSuperAdminRoute && user.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.nextUrl.origin));
  }

  if (isMerchantRoute) {
    if (user.role !== "MERCHANT_OWNER" && user.role !== "MERCHANT_STAFF") {
      return NextResponse.redirect(new URL("/unauthorized", req.nextUrl.origin));
    }
    if (user.merchantStatus !== "ACTIVE") {
      return NextResponse.redirect(new URL("/account-suspended", req.nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/super-admin/:path*", "/merchant/:path*"],
};
