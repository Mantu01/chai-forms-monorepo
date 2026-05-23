import type { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone';
import { parseCookies, verifyToken } from "./utils/auth";

export async function createContext(opts?: Partial<CreateHTTPContextOptions>) {
  let userId: string | null = null;
  const cookieHeader = opts?.req?.headers?.cookie;
  if (cookieHeader) {
    const cookies = parseCookies(cookieHeader);
    const sessionToken = cookies["cookie"];
    if (sessionToken) {
      const payload = verifyToken(sessionToken);
      if (payload) {
        userId = payload.userId;
      }
    }
  }
  return {
    req: opts?.req,
    res: opts?.res,
    userId,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
