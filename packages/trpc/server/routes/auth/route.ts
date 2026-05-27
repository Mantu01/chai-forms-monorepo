import { TRPCError } from "@trpc/server";
import { z, zodUndefinedModel } from "../../schema";
import { getAuthenticationMethodOutputSchema, getLoggedInUserSchema } from "@repo/services/user/model";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { userService } from "@repo/services";
import { signToken } from "../../utils/auth";

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
      console.log({ ctx })
      if (ctx.res) {
        if ("clearCookie" in ctx.res && typeof (ctx.res as any).clearCookie === "function") {
          (ctx.res as any).clearCookie("cookie", {
            path: "/",
          });
        } else {
          ctx.res.setHeader(
            "Set-Cookie",
            "cookie=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly"
          );
        }
      }
      return { success: true };
    }),

  signup: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/signup"), tags: TAGS } })
    .input(z.object({
      fullName: z.string().min(1, "Full name is required").max(80),
      email: z.string().email("Invalid email address"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      referralCode: z.string().optional(),
    }))
    .output(z.object({ success: z.boolean(), user: getLoggedInUserSchema.shape.user }))
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await userService.signupWithPassword(input);
        const sessionToken = signToken({ userId: user.id });

        if (ctx.res) {
          if ("cookie" in ctx.res && typeof (ctx.res as any).cookie === "function") {
            (ctx.res as any).cookie("cookie", sessionToken, {
              httpOnly: true,
              secure: false,
              sameSite: "lax",
              path: "/",
              maxAge: 7 * 24 * 60 * 60 * 1000,
            });
          } else {
            ctx.res.setHeader(
              "Set-Cookie",
              `cookie=${sessionToken}; Path=/; Max-Age=${7 * 24 * 60 * 60}; HttpOnly; SameSite=Lax`
            );
          }
        }

        return {
          success: true,
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            isSubscribed: !!user.isSubscribed,
          },
        };
      } catch (err: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: err.message || "Failed to sign up",
        });
      }
    }),

  login: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/login"), tags: TAGS } })
    .input(z.object({
      email: z.string().email("Invalid email address"),
      password: z.string().min(1, "Password is required"),
    }))
    .output(z.object({ success: z.boolean(), user: getLoggedInUserSchema.shape.user }))
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await userService.loginWithPassword(input);
        const sessionToken = signToken({ userId: user.id });

        if (ctx.res) {
          if ("cookie" in ctx.res && typeof (ctx.res as any).cookie === "function") {
            (ctx.res as any).cookie("cookie", sessionToken, {
              httpOnly: true,
              secure: false,
              sameSite: "lax",
              path: "/",
              maxAge: 7 * 24 * 60 * 60 * 1000,
            });
          } else {
            ctx.res.setHeader(
              "Set-Cookie",
              `cookie=${sessionToken}; Path=/; Max-Age=${7 * 24 * 60 * 60}; HttpOnly; SameSite=Lax`
            );
          }
        }

        return {
          success: true,
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            isSubscribed: !!user.isSubscribed,
          },
        };
      } catch (err: any) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: err.message || "Invalid email or password",
        });
      }
    }),

  updateProfile: protectedProcedure
    .meta({ openapi: { method: "PUT", path: getPath("/profile"), tags: TAGS } })
    .input(z.object({
      fullName: z.string().min(1, "Full name is required").max(80),
      profileImageUrl: z.string().url().optional().nullable(),
    }))
    .output(z.object({ success: z.boolean(), user: getLoggedInUserSchema.shape.user }))
    .mutation(async ({ ctx, input }) => {
      try {
        const updated = await userService.updateProfile(ctx.userId, input);
        return { success: true, user: updated };
      } catch (err: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: err.message || "Failed to update profile",
        });
      }
    }),

  uploadProfileImage: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/profile/image"), tags: TAGS } })
    .input(z.object({
      base64Data: z.string(),
    }))
    .output(z.object({ imageUrl: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const imageUrl = await userService.uploadProfileImage(ctx.userId, input.base64Data);
        return { imageUrl };
      } catch (err: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: err.message || "Failed to upload image",
        });
      }
    }),
});
