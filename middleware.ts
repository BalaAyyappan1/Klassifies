import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log(`[Middleware] Request received for: ${pathname}`);

  // Define route categories
  const protectedRoutes = ["/employee"];
  const adminRoutes = ["/ad"];
  const authPages = ["/auth/signin", "/auth/signup"];

  // Allow API, static, and Next.js-specific routes to bypass authentication
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname === "/favicon.ico"
  ) {
    console.log(`[Middleware] Skipping auth check for: ${pathname}`);
    return NextResponse.next();
  }

  try {
    console.log("[Middleware] Checking user authentication...");
    const userResponse = await fetch(`${req.nextUrl.origin}/api/user`, {
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
    });

    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
      console.log(`[Middleware] Protected route detected: ${pathname}`);

      if (!userResponse.ok) {
        console.warn("[Middleware] User not authenticated. Redirecting to /signin");
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }

      const { user } = await userResponse.json();
      console.log(`[Middleware] User authenticated with role: ${user.role}`);

      if (adminRoutes.some((route) => pathname.startsWith(route))) {
        console.log(`[Middleware] Admin route detected: ${pathname}`);

        if (user.role !== "admin") {
          console.warn("[Middleware] User is not an admin. Redirecting to /dashboard");
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }
    }

    if (authPages.some((page) => pathname.startsWith(page))) {
      console.log(`[Middleware] Auth page detected: ${pathname}`);

      if (userResponse.ok) {
        console.warn("[Middleware] User already authenticated. Redirecting to /dashboard");
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  } catch (error) {
    console.error("[Middleware] Error occurred:", error);

    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
      console.warn("[Middleware] Error on protected route. Redirecting to /signin");
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
  }

  console.log("[Middleware] Request allowed to proceed.");
  return NextResponse.next();
}

// Middleware configuration
export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
