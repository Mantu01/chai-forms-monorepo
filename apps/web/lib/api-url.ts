import { env } from "~/env.js";

/**
 * Returns the base URL for API requests.
 *
 * - **Client-side in production**: Returns empty string (same-origin proxy via `/api/*`)
 * - **Client-side in development**: Returns the direct API URL
 * - **Server-side**: Returns the direct backend URL
 */
export function getApiBaseUrl(): string {
  // Server-side — always call the backend directly
  if (typeof window === "undefined") {
    return (
      process.env.INTERNAL_API_URL ||
      env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000"
    ).replace(/\/$/, "");
  }

  // Client-side in production — use same-origin proxy
  if (process.env.NODE_ENV === "production") {
    return "";
  }

  // Client-side in development — call the backend directly
  return (env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
}
