import { NextRequest, NextResponse } from "next/server";
import { safeReturnTo } from "@/lib/auth/redirect";
import { AUTH_COOKIE_NAME, verifySession } from "@/lib/auth/session";

function privateRedirect(url: URL) {
  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/") && !["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const origin = request.headers.get("origin");
    if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ message: "Cross-origin requests are not allowed." }, { status: 403 });
  }
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;

  const isAdminArea = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isProfileArea = pathname.startsWith("/profile");
  const isAssessmentArea = pathname.startsWith("/assessments/");
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isAuthPage && session) {
    return privateRedirect(new URL(session.role === "admin" ? "/admin" : safeReturnTo(request.nextUrl.searchParams.get("next")), request.url));
  }

  if ((isProfileArea || isAssessmentArea) && !session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + request.nextUrl.search);
    return privateRedirect(login);
  }

  if (isProfileArea && session?.role === "admin") {
    return privateRedirect(new URL("/admin", request.url));
  }

  if (isAdminArea && (!session || session.role !== "admin")) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return privateRedirect(new URL("/login", request.url));
  }

  const response = NextResponse.next();
  if (pathname.startsWith("/api/auth/") || isProfileArea || isAssessmentArea || isAdminArea || isAuthPage) {
    response.headers.set("Cache-Control", "private, no-store");
  }
  return response;
}

export const config = {
  matcher: ["/api/:path*", "/profile/:path*", "/admin/:path*", "/api/admin/:path*", "/assessments/:path*", "/login", "/signup"],
};
