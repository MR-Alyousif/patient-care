import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value || "";
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  if (pathname === "/login" || pathname === "/") {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const decodedToken: { role: string } = jwtDecode(token);

    // Role-based route protection
    if (pathname.startsWith("/doctor") && decodedToken.role !== "doctor") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (pathname.startsWith("/pharmacist") && decodedToken.role !== "pharmacist") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid token
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
