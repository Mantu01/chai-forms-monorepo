import { z, zodUndefinedModel } from "../../schema";
import {getAuthenticationMethodOutputSchema, getLoggedInUserSchema} from "@repo/services/user/model";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { userService } from "@repo/services";

const TAGS = ["Authentication"];
const getPath = generatePath("/auth");

export const authRouter = router({
  getSupportedAuthenticationProviders: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/supported-providers"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(z.readonly(z.array(getAuthenticationMethodOutputSchema)))
    .query(async () => {
      const supportedMethods = await userService.getAuthenticationMethods();
      return supportedMethods;
    }),

  me: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/me"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(getLoggedInUserSchema)
    .query(async ({ ctx }) => {
      return userService.getLoggedInUser(ctx.userId);
    }),

  logout: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/logout"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx }) => {
      if (ctx.res) {
        ctx.res.clearCookie("session", {
          path: "/",
        });
      }
      return { success: true };
    }),
});
