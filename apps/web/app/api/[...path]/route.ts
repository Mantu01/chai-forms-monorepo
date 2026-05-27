import { NextRequest, NextResponse } from "next/server";

/**
 * Catch-all API proxy route.
 *
 * In production the frontend and backend live on different domains, which means
 * the backend's Set-Cookie header is treated as a third-party cookie and is
 * blocked by modern browsers.
 *
 * This proxy solves the problem by making every /api/* request go through the
 * **same origin** as the frontend.  The browser sees the cookie coming from
 * its own domain, so it is always accepted.
 *
 * Flow:
 *   Browser  →  chaiform.com/api/auth/login  →  Next.js proxy  →  backend
 *   Browser  ←  Set-Cookie (same origin ✅)  ←  Next.js proxy  ←  backend
 */

const BACKEND_URL = (
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

async function handler(req: NextRequest) {
  const path = req.nextUrl.pathname; // e.g. /api/auth/login
  const search = req.nextUrl.search; // e.g. ?foo=bar

  const targetUrl = `${BACKEND_URL}${path}${search}`;

  // Forward the request headers, including cookies
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    // Skip headers that should not be forwarded
    if (
      key === "host" ||
      key === "connection" ||
      key === "content-length" ||
      key === "transfer-encoding"
    ) {
      return;
    }
    headers.set(key, value);
  });

  // Build the fetch options
  const init: RequestInit = {
    method: req.method,
    headers,
    // @ts-expect-error - duplex is required for streaming request bodies
    duplex: "half",
  };

  // Forward the body for non-GET/HEAD requests
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req.body;
  }

  try {
    const backendResponse = await fetch(targetUrl, init);

    // Build the response, forwarding status, body, and headers
    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      // Forward all headers from the backend
      const lower = key.toLowerCase();
      if (
        lower === "transfer-encoding" ||
        lower === "connection"
      ) {
        return;
      }

      // For Set-Cookie, rewrite to remove Domain and fix attributes for same-origin
      if (lower === "set-cookie") {
        const rewritten = rewriteSetCookie(value);
        responseHeaders.append(key, rewritten);
        return;
      }

      responseHeaders.set(key, value);
    });

    // Remove any CORS headers since the proxy makes it same-origin
    responseHeaders.delete("access-control-allow-origin");
    responseHeaders.delete("access-control-allow-credentials");

    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[API Proxy] Error forwarding request:", error);
    return NextResponse.json(
      { error: "Backend service unavailable" },
      { status: 502 }
    );
  }
}

/**
 * Rewrite a Set-Cookie header value for same-origin usage:
 *  - Remove Domain=... (let the browser default to the current origin)
 *  - Remove SameSite=None (not needed for same-origin; defaults to Lax)
 *  - Remove Partitioned (not needed for same-origin)
 *  - Keep Secure if the site is served over HTTPS
 *  - Keep HttpOnly, Path, Max-Age, Expires as-is
 */
function rewriteSetCookie(cookie: string): string {
  return cookie
    .split(";")
    .map((part) => part.trim())
    .filter((part) => {
      const lower = part.toLowerCase();
      if (lower.startsWith("domain=")) return false;
      if (lower === "partitioned") return false;
      if (lower.startsWith("samesite=")) return false;
      return true;
    })
    .join("; ")
    .concat("; SameSite=Lax");
}

// Support all HTTP methods
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
