import { TRPCError } from "@trpc/server";
import { z, zodUndefinedModel } from "../../schema";
import { getAuthenticationMethodOutputSchema, getLoggedInUserSchema } from "@repo/services/user/model";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { userService } from "@repo/services";
import { signToken } from "../../utils/auth";

const TAGS = ["Authentication"];
const getPath = generatePath("/auth");

/**
 * Centralized cookie configuration.
 *
 * Since the frontend now proxies all requests through the same origin,
 * we use simple, same-origin-friendly cookie settings:
 * - HttpOnly: true (prevents XSS from reading the cookie)
 * - Secure: true in production (HTTPS only)
 * - SameSite: Lax (safe default for same-origin)
 * - No Domain (defaults to the origin that set the cookie)
 * - No Partitioned (not needed for same-origin)
 */
function getCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  };
}

/** Set a cookie on the response object, supporting both Express and raw http responses */
function setSessionCookie(res: any, token: string) {
  const opts = getCookieOptions();
  if ("cookie" in res && typeof res.cookie === "function") {
    // Express response
    res.cookie("cookie", token, opts);
  } else if (typeof res.setHeader === "function") {
    // Raw http response
    const parts = [
      `cookie=${token}`,
      `Path=${opts.path}`,
      `Max-Age=${Math.floor(opts.maxAge / 1000)}`,
      "HttpOnly",
      `SameSite=${opts.sameSite}`,
    ];
    if (opts.secure) parts.push("Secure");
    res.setHeader("Set-Cookie", parts.join("; "));
  }
}

/** Clear the session cookie */
function clearSessionCookie(res: any) {
  const opts = getCookieOptions();
  if ("clearCookie" in res && typeof res.clearCookie === "function") {
    res.clearCookie("cookie", {
      path: opts.path,
      httpOnly: opts.httpOnly,
      secure: opts.secure,
      sameSite: opts.sameSite,
    });
  } else if (typeof res.setHeader === "function") {
    const parts = [
      "cookie=",
      `Path=${opts.path}`,
      "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
      "HttpOnly",
      `SameSite=${opts.sameSite}`,
    ];
    if (opts.secure) parts.push("Secure");
    res.setHeader("Set-Cookie", parts.join("; "));
  }
}

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
        clearSessionCookie(ctx.res);
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
          setSessionCookie(ctx.res, sessionToken);
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
          setSessionCookie(ctx.res, sessionToken);
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
