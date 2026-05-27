import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  "/profile",
  "/notification",
  "/billings",
  "/workspaces",
  "/dashboard",
  "/community",
  "/archived",
  "/templates",
  "/form",
];

const publicRoutes = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isPublicRoute = publicRoutes.includes(pathname);

  const session = request.cookies.get("cookie")?.value;

  if (isProtectedRoute && !session) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled by proxy)
     * - trpc routes (handled by proxy)
     * - auth routes (handled by proxy)
     * - _next/static, _next/image, favicon.ico, and other static assets
     */
    "/((?!api|trpc|auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
