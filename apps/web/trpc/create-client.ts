import { httpLink, httpBatchStreamLink } from "@repo/trpc/client";
import { env } from "~/env.js";

interface CreateTRPCHttpBatchClientClientOpts {
  enableStreaming?: boolean;
  headers?: Record<string, string>;
}

/**
 * Returns the base URL for TRPC requests.
 *
 * - **Server-side (SSR)**: Always use the backend URL directly (server-to-server,
 *   no browser cookie restrictions).
 * - **Client-side in production**: Use same-origin path (`/trpc`) so requests go
 *   through the Next.js proxy, making cookies first-party.
 * - **Client-side in development**: Use the direct API URL for convenience.
 */
function getTrpcUrl(): string {
  // Server-side rendering — always call the backend directly
  if (typeof window === "undefined") {
    const backendUrl = (
      process.env.INTERNAL_API_URL ||
      env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000"
    ).replace(/\/$/, "");
    return `${backendUrl}/trpc`;
  }

  // Client-side in production — use same-origin proxy
  if (process.env.NODE_ENV === "production") {
    return "/trpc";
  }

  // Client-side in development — call the backend directly
  const baseUrl = env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  return `${baseUrl}/trpc`;
}

export const createTRPCHttpBatchClientClient = (opts?: CreateTRPCHttpBatchClientClientOpts) => {
  const trpcUrl = getTrpcUrl();
  const c = opts?.enableStreaming ? httpBatchStreamLink : httpLink;
  return c({
    url: trpcUrl,
    fetch(url, options) {
      return fetch(url, {
        ...options,
        headers: {
          ...options?.headers,
          ...opts?.headers,
        },
        credentials: "include",
      });
    },
  });
};
