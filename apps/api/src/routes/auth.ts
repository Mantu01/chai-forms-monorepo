import { Router } from "express";
import { logger } from "@repo/logger";
import { userService } from "@repo/services";
import { signToken } from "@repo/trpc/server";
import { env } from "../env";

export const authRouter = Router();

authRouter.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code || typeof code !== "string") {
    return res.status(400).send("No authorization code provided");
  }
  try {
    const state = req.query.state;
    const user = await userService.handleGoogleCallback(code, typeof state === "string" ? state : undefined);
    const sessionToken = signToken({ userId: user.id });
    res.cookie("cookie", sessionToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.redirect(env.CLIENT_URL);
  } catch (error) {
    logger.error("Authentication error", { error });
    return res.status(500).send("Authentication failed");
  }
});
