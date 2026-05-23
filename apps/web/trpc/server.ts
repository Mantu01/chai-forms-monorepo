import { cookies } from "next/headers";
import type { ServerRouter } from "@repo/trpc/client";
import { createTRPCProxyClient } from "@repo/trpc/client";
import { createTRPCHttpBatchClientClient } from "~/trpc/create-client";

export const getApi = async () => {
  const cookieStore = await cookies();
  const cookieString = cookieStore.toString();
  return createTRPCProxyClient<ServerRouter>({
    links: [
      createTRPCHttpBatchClientClient({
        headers: {
          cookie: cookieString,
        },
      }),
    ],
  });
};

export const getApiStreaming = async () => {
  const cookieStore = await cookies();
  const cookieString = cookieStore.toString();
  return createTRPCProxyClient<ServerRouter>({
    links: [
      createTRPCHttpBatchClientClient({
        enableStreaming: true,
        headers: {
          cookie: cookieString,
        },
      }),
    ],
  });
};
