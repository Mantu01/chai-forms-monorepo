import { httpLink, httpBatchStreamLink } from "@repo/trpc/client";
import { env } from "~/env.js";

interface CreateTRPCHttpBatchClientClientOpts {
  enableStreaming?: boolean;
  headers?: Record<string, string>;
}

export const createTRPCHttpBatchClientClient = (opts?: CreateTRPCHttpBatchClientClientOpts) => {
  const baseUrl = env.NEXT_PUBLIC_API_URL ;
  const trpcUrl = `${baseUrl}/trpc`;
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
