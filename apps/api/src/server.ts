import express from "express";
import { logger } from "@repo/logger";
import cors from "cors";
import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";
import { serverRouter, createContext, signToken } from "@repo/trpc/server";
import { googleOAuth2Client } from "@repo/services/clients/google-oauth";
import { db, users, eq } from "@repo/database";
import { env } from "./env";

export const app = express();
const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "ChaiForm OpenAPI",
  version: "1.0.0",
  baseUrl: env.BASE_URL.concat("/api"),
});

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  return res.json({ message: "ChaiForm is up and running..." });
});

app.get("/health", (req, res) => {
  return res.json({ message: "ChaiForm server is healthy", healthy: true });
});

app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;
  if (!code || typeof code !== "string") {
    return res.status(400).send("No authorization code provided");
  }
  try {
    const { tokens } = await googleOAuth2Client.getToken(code);
    const accessToken = tokens.access_token;
    if (!accessToken) {
      return res.status(400).send("Failed to retrieve access token");
    }
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      return res.status(400).send("Failed to retrieve user info from Google");
    }
    const userInfo = (await response.json()) as {
      sub: string;
      name: string;
      email: string;
      picture?: string;
    };
    let user = await db.query.users.findFirst({
      where: eq(users.googleId, userInfo.sub),
    });
    if (!user) {
      user = await db.query.users.findFirst({
        where: eq(users.email, userInfo.email),
      });
      if (user) {
        const [updatedUser] = await db
          .update(users)
          .set({ googleId: userInfo.sub, profileImageUrl: userInfo.picture || user.profileImageUrl })
          .where(eq(users.id, user.id))
          .returning();
        user = updatedUser;
      } else {
        const [newUser] = await db
          .insert(users)
          .values({
            fullName: userInfo.name,
            email: userInfo.email,
            googleId: userInfo.sub,
            profileImageUrl: userInfo.picture || null,
          })
          .returning();
        user = newUser;
      }
    }
    if (!user) {
      return res.status(500).send("Failed to resolve user");
    }
    const sessionToken = signToken({ userId: user.id });
    res.cookie("session", sessionToken, {
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

logger.debug(`openapi.json: ${env.BASE_URL}/openapi.json`);
app.get("/openapi.json", (req, res) => {
  return res.json(openApiDocument);
});

logger.debug(`docs: ${env.BASE_URL}/docs`);
app.use("/docs", apiReference({ url: "/openapi.json" }));

app.use(
  "/api",
  createOpenApiExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

export default app;
