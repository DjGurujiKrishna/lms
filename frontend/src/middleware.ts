import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { canAccessAdmin } from "@/lib/roles";

const COOKIE = "lms_token";

function redirectWithClearedCookie(url: URL) {
  const res = NextResponse.redirect(url);
  res.cookies.set(COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE)?.value;
  const secret = process.env.JWT_SECRET;
  const url = request.nextUrl;
  const pathname = url.pathname;

  let role: string | undefined;
  let invalidJwt = false;

  if (token && secret) {
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(secret),
      );
      const r = payload.role;
      if (typeof r !== "string" || !r) invalidJwt = true;
      else role = r;
    } catch {
      invalidJwt = true;
    }
  }

  if (invalidJwt) {
    if (pathname === "/login") {
      const res = NextResponse.next();
      res.cookies.set(COOKIE, "", { path: "/", maxAge: 0 });
      return res;
    }
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/student") ||
      pathname === "/"
    ) {
      return redirectWithClearedCookie(new URL("/login", url));
    }
    return NextResponse.next();
  }

  const hasCookie = !!token;

  if (pathname.startsWith("/admin")) {
    if (!hasCookie) {
      return NextResponse.redirect(new URL("/login", url));
    }
    if (secret && role !== undefined && !canAccessAdmin(role)) {
      return NextResponse.redirect(new URL("/student", url));
    }
    return NextResponse.next();
  }

  if (pathname === "/student" || pathname.startsWith("/student/")) {
    if (!hasCookie) {
      return NextResponse.redirect(new URL("/login", url));
    }
    if (secret && role !== undefined && canAccessAdmin(role)) {
      return NextResponse.redirect(new URL("/admin/dashboard", url));
    }
    return NextResponse.next();
  }

  if (pathname === "/login") {
    if (!hasCookie) return NextResponse.next();
    if (!secret) {
      return NextResponse.redirect(new URL("/", url));
    }
    if (role !== undefined) {
      const dest = canAccessAdmin(role)
        ? "/admin/dashboard"
        : "/student";
      return NextResponse.redirect(new URL(dest, url));
    }
    return NextResponse.next();
  }

  if (pathname === "/" && hasCookie && secret && role !== undefined) {
    const dest = canAccessAdmin(role)
      ? "/admin/dashboard"
      : "/student";
    return NextResponse.redirect(new URL(dest, url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/student",
    "/student/:path*",
    "/login",
    "/",
  ],
};
