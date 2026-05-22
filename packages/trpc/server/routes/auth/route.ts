import { z, zodUndefinedModel } from "../../schema";
import { userService } from "../../services";
import {
  getAuthenticationMethodOutputSchema,
  signupUsingEmailInputSchema,
  signupUsingEmailOutputSchema,
  verifyEmailTokenInputSchema,
  verifyEmailTokenOutputSchema,
} from "@repo/services/user/model";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({
  getSupportedAuthenticationProviders: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/supported-providers"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(z.readonly(z.array(getAuthenticationMethodOutputSchema)))
    .query(async () => {
      const supportedMethods = await userService.getAuthenticationMethods();
      return supportedMethods;
    }),

  signupUsingEmail: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/signup-email"), tags: TAGS } })
    .input(signupUsingEmailInputSchema)
    .output(signupUsingEmailOutputSchema)
    .mutation(async ({ input }) => {
      const result = await userService.signupUsingEmail(input.email);
      return result;
    }),

  verifyEmailToken: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/verify-email"), tags: TAGS } })
    .input(verifyEmailTokenInputSchema)
    .output(verifyEmailTokenOutputSchema)
    .mutation(async ({ input }) => {
      const result = await userService.verifyEmailToken(input.token, input.sessionToken);
      return result;
    }),
});
