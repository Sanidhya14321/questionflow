import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifySession } from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;
  const { pathname } = request.nextUrl;

  const isAdminArea = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isProfileArea = pathname.startsWith("/profile");
  const isCreateAssessmentArea = pathname.startsWith("/assessments/create");

  if ((isProfileArea || isCreateAssessmentArea) && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isProfileArea && session?.role === "admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (isAdminArea && (!session || session.role !== "admin")) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/admin/:path*", "/api/admin/:path*", "/assessments/create"],
};
