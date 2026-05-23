import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";

import { createContext } from "./context";
import { parseCookies, verifyToken } from "./utils/auth";
import { userService } from "@repo/services";

export const t = initTRPC
  .meta<OpenApiMeta>()
  .context<typeof createContext>()
  .create({});

export const router = t.router;

export const publicProcedure = t.procedure;

const isAuthed = t.middleware(async ({ ctx, next }) => {
  const cookieHeader = ctx.req?.headers?.cookie;
  const cookies = parseCookies(cookieHeader);
  const token = cookies["cookie"];
  
  if (!token) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized: Missing authentication cookie" });
  }
  
  const payload = verifyToken(token);
  if (!payload || !payload.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized: Invalid token" });
  }
  
  const userResult = await userService.getLoggedInUser(payload.userId);
  if (!userResult.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized: User not found" });
  }
  
  return next({
    ctx: {
      ...ctx,
      userId: payload.userId,
      user: userResult.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);
