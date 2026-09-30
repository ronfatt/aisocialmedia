import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionUser = request.cookies.get("scc_active_user")?.value;

  const isPublicRoute = pathname.startsWith("/login") || pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico");
  const isApiAuthRoute = pathname.startsWith("/api/auth");

  if (isPublicRoute || isApiAuthRoute) {
    if (pathname === "/login" && sessionUser) {
      return NextResponse.redirect(new URL("/clients", request.url));
    }
    return NextResponse.next();
  }

  // Redirect root to /clients
  if (pathname === "/") {
    if (!sessionUser) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.redirect(new URL("/clients", request.url));
  }

  // Protect all /clients, /clients/* routes
  if (pathname.startsWith("/clients")) {
    if (!sessionUser) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect API routes
  if (pathname.startsWith("/api/clients")) {
    if (!sessionUser) {
      return NextResponse.json({ error: "401: Unauthorized - Session expired or missing" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
