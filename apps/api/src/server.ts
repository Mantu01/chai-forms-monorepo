import express from "express";
import { logger } from "@repo/logger";
import cors from "cors";
import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";
import { serverRouter, createContext } from "@repo/trpc/server";
import { workspaceRouter } from "./routes/workspace";
import { authRouter } from "./routes/auth";
import { env } from "./env";

export const app = express();
app.set("trust proxy", 1);
const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "ChaiForm OpenAPI",
  version: "1.0.0",
  baseUrl: env.BASE_URL.concat("/api"),
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    const clientUrl = env.CLIENT_URL?.replace(/\/$/, '');
    if (origin === clientUrl || origin === env.CLIENT_URL) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'OPTIONS', 'DELETE'],
  credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
  return res.json({ message: "ChaiForm is up and running..." });
});

app.get("/health", (req, res) => {
  return res.json({ message: "ChaiForm server is healthy", healthy: true });
});

app.use("/api/workspace", workspaceRouter);
app.use("/auth", authRouter);

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
