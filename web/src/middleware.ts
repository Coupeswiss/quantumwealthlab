import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const isAuth = req.cookies.get("qwl_session")?.value === "1";
  const isDashboard = url.pathname.startsWith("/dashboard");
  const isOnboarding = url.pathname === "/onboarding";
  
  // Protect dashboard - redirect to login if not authenticated
  if (isDashboard && !isAuth) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  
  // Protect onboarding - redirect to login if not authenticated
  if (isOnboarding && !isAuth) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  
  // Signed-in users landing on root go straight to dashboard
  if (url.pathname === "/" && isAuth) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding", "/"],
};