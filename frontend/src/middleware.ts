import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("lms_token")?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (
    (pathname === "/student" || pathname.startsWith("/student/")) &&
    !token
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  /** Home decides admin vs student after login (JWT role). */
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/student", "/student/:path*", "/login"],
};
