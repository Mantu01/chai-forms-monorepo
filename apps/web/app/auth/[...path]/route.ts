export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = (
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

async function handler(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const search = req.nextUrl.search;

  const targetUrl = `${BACKEND_URL}${path}${search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
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

  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
    cache: "no-store",
    // @ts-expect-error
    duplex: "half",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req.body;
  }

  try {
    const backendResponse = await fetch(targetUrl, init);

    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (lower === "transfer-encoding" || lower === "connection") return;

      if (lower === "set-cookie") {
        const rewritten = rewriteSetCookie(value);
        responseHeaders.append(key, rewritten);
        return;
      }

      if (lower === "location") {
        responseHeaders.set(key, value);
        return;
      }

      responseHeaders.set(key, value);
    });

    responseHeaders.delete("access-control-allow-origin");
    responseHeaders.delete("access-control-allow-credentials");

    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[Auth Proxy] Error forwarding request:", error);
    return NextResponse.json(
      { error: "Backend service unavailable" },
      { status: 502 }
    );
  }
}

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

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
