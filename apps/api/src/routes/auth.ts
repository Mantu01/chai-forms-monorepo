import { Router } from "express";
import { logger } from "@repo/logger";
import { userService } from "@repo/services";
import { signToken } from "@repo/trpc/server";

export const authRouter = Router();

authRouter.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code || typeof code !== "string") {
    return res.status(400).send("No authorization code provided");
  }
  try {
    const user = await userService.handleGoogleCallback(code);
    const sessionToken = signToken({ userId: user.id });
    res.cookie("cookie", sessionToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.redirect("http://localhost:3000/profile");
  } catch (error) {
    logger.error("Authentication error", { error });
    return res.status(500).send("Authentication failed");
  }
});
